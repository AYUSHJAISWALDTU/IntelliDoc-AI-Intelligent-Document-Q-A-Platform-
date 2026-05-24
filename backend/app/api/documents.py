import hashlib
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.document import Document
from app.models.space import Space
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentStatusResponse
from app.schemas.common import MessageResponse
from app.dependencies import get_current_user
from app.exceptions import NotFoundError, FileTooLargeError, StorageLimitError, ValidationError
from app.core.s3 import upload_file_to_s3, get_s3_key, generate_presigned_url, delete_file_from_s3
from app.core.redis import get_doc_status
from app.workers.document_tasks import process_document
from app.config import settings
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import structlog

logger = structlog.get_logger()
router = APIRouter(tags=["documents"])

CONTENT_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "txt": "text/plain",
    "csv": "text/csv",
}


async def get_space_or_404(space_id: str, user: User, db: AsyncSession) -> Space:
    result = await db.execute(select(Space).where(Space.id == space_id, Space.user_id == user.id))
    space = result.scalar_one_or_none()
    if not space:
        raise NotFoundError("Space")
    return space


@router.post("/spaces/{space_id}/documents", response_model=DocumentResponse, status_code=201)
async def upload_document(
    space_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = await get_space_or_404(space_id, current_user, db)

    file_ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if file_ext not in settings.ALLOWED_FILE_TYPES:
        raise ValidationError(f"File type .{file_ext} not allowed. Allowed: {settings.ALLOWED_FILE_TYPES}")

    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size > settings.max_file_size_bytes:
        raise FileTooLargeError(settings.MAX_FILE_SIZE_MB)

    if space.storage_used + file_size > settings.max_storage_bytes:
        raise StorageLimitError()

    content_hash = hashlib.sha256(file_bytes).hexdigest()

    existing = await db.execute(
        select(Document).where(Document.space_id == space_id, Document.content_hash == content_hash)
    )
    if existing.scalar_one_or_none():
        raise ValidationError("This document is already in the space (duplicate detected)")

    doc_id = str(uuid.uuid4())
    s3_key = get_s3_key(space_id, doc_id, file.filename)
    content_type = CONTENT_TYPES.get(file_ext, "application/octet-stream")
    upload_file_to_s3(file_bytes, s3_key, content_type)

    doc = Document(
        id=doc_id,
        space_id=space_id,
        file_name=file.filename,
        file_type=file_ext,
        file_size=file_size,
        s3_key=s3_key,
        content_hash=content_hash,
        status="processing",
    )
    db.add(doc)
    space.storage_used += file_size
    await db.commit()

    process_document.delay(doc_id, space_id, s3_key, file_ext, file.filename)

    logger.info("document_uploaded", doc_id=doc_id, space_id=space_id, filename=file.filename)
    return DocumentResponse(
        id=doc.id, space_id=doc.space_id, file_name=doc.file_name,
        file_type=doc.file_type, file_size=doc.file_size,
        page_count=None, chunk_count=0, status=doc.status,
        error_message=None, doc_metadata=None,
        created_at=doc.created_at, updated_at=doc.updated_at,
    )


@router.get("/spaces/{space_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    space_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(
        select(Document).where(Document.space_id == space_id).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [
        DocumentResponse(
            id=d.id, space_id=d.space_id, file_name=d.file_name,
            file_type=d.file_type, file_size=d.file_size,
            page_count=d.page_count, chunk_count=d.chunk_count,
            status=d.status, error_message=d.error_message,
            doc_metadata=d.doc_metadata,
            created_at=d.created_at, updated_at=d.updated_at,
        )
        for d in docs
    ]


@router.get("/spaces/{space_id}/documents/{doc_id}", response_model=DocumentResponse)
async def get_document(
    space_id: str,
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.space_id == space_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document")

    download_url = generate_presigned_url(doc.s3_key)
    return DocumentResponse(
        id=doc.id, space_id=doc.space_id, file_name=doc.file_name,
        file_type=doc.file_type, file_size=doc.file_size,
        page_count=doc.page_count, chunk_count=doc.chunk_count,
        status=doc.status, error_message=doc.error_message,
        doc_metadata=doc.doc_metadata, download_url=download_url,
        created_at=doc.created_at, updated_at=doc.updated_at,
    )


@router.delete("/spaces/{space_id}/documents/{doc_id}", response_model=MessageResponse)
async def delete_document(
    space_id: str,
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.space_id == space_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document")

    try:
        delete_file_from_s3(doc.s3_key)
    except Exception:
        pass

    from app.langchain_pipeline.embedder import delete_document_vectors
    delete_document_vectors(doc_id, space_id)

    space_result = await db.execute(select(Space).where(Space.id == space_id))
    space = space_result.scalar_one_or_none()
    if space:
        space.storage_used = max(0, space.storage_used - doc.file_size)

    await db.delete(doc)
    await db.commit()
    return MessageResponse(message="Document deleted successfully")


@router.get("/spaces/{space_id}/documents/{doc_id}/status")
async def stream_document_status(
    space_id: str,
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)

    async def event_gen():
        for _ in range(120):
            status = await get_doc_status(doc_id)
            if status:
                yield {"event": "status", "data": json.dumps(status)}
                if status.get("stage") in ("ready", "failed"):
                    break
            else:
                result = await db.execute(select(Document).where(Document.id == doc_id))
                doc = result.scalar_one_or_none()
                if doc:
                    yield {"event": "status", "data": json.dumps({
                        "stage": doc.status, "progress": 100 if doc.status == "ready" else 0
                    })}
                    if doc.status in ("ready", "failed"):
                        break
            await asyncio.sleep(1)
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_gen())
