import asyncio
import json
import redis
from celery import shared_task
from app.config import settings
from app.core.s3 import download_file_from_s3
from app.langchain_pipeline.chunker import extract_text, clean_text, chunk_document
from app.langchain_pipeline.embedder import embed_and_store
import structlog

logger = structlog.get_logger()

sync_redis = redis.from_url(settings.REDIS_URL, decode_responses=True)


def update_doc_status(doc_id: str, status: dict):
    sync_redis.setex(f"doc_status:{doc_id}", 3600, json.dumps(status))


def update_db_status(doc_id: str, status: str, error: str = None, chunk_count: int = None):
    from app.database import AsyncSessionLocal
    from app.models.document import Document
    from sqlalchemy import update
    import datetime

    async def _update():
        async with AsyncSessionLocal() as session:
            values = {"status": status, "updated_at": datetime.datetime.utcnow()}
            if error:
                values["error_message"] = error
            if chunk_count is not None:
                values["chunk_count"] = chunk_count
            if status == "processing":
                values["processing_started_at"] = datetime.datetime.utcnow()
            if status in ("ready", "failed"):
                values["processing_completed_at"] = datetime.datetime.utcnow()
            await session.execute(update(Document).where(Document.id == doc_id).values(**values))
            await session.commit()

    asyncio.run(_update())


def save_chunks_db(doc_id: str, chunks):
    from app.database import AsyncSessionLocal
    from app.models.chunk import Chunk
    import tiktoken

    enc = tiktoken.get_encoding("cl100k_base")

    async def _save():
        async with AsyncSessionLocal() as session:
            for chunk in chunks:
                tokens = len(enc.encode(chunk.page_content))
                db_chunk = Chunk(
                    document_id=doc_id,
                    chunk_index=chunk.metadata.get("chunk_index", 0),
                    content=chunk.page_content,
                    page_number=chunk.metadata.get("page_number"),
                    char_start=chunk.metadata.get("char_start", 0),
                    char_end=chunk.metadata.get("char_end", 0),
                    token_count=tokens,
                )
                session.add(db_chunk)
            await session.commit()

    asyncio.run(_save())


@shared_task(bind=True, max_retries=3, name="app.workers.document_tasks.process_document")
def process_document(self, document_id: str, space_id: str, s3_key: str, file_type: str,
                     file_name: str, user_api_key: str = None):
    try:
        logger.info("processing_start", doc_id=document_id)

        update_doc_status(document_id, {"stage": "downloading", "progress": 10})
        update_db_status(document_id, "processing")
        file_bytes = download_file_from_s3(s3_key)

        update_doc_status(document_id, {"stage": "extracting", "progress": 30})
        raw_text, metadata = extract_text(file_bytes, file_type)

        update_doc_status(document_id, {"stage": "cleaning", "progress": 45})
        cleaned = clean_text(raw_text)

        update_doc_status(document_id, {"stage": "chunking", "progress": 55})
        page_texts = metadata.get("page_texts", {})
        chunks = chunk_document(cleaned, document_id, file_name, page_texts=page_texts)

        update_doc_status(document_id, {"stage": "saving_chunks", "progress": 65})
        save_chunks_db(document_id, chunks)

        update_doc_status(document_id, {"stage": "embedding", "progress": 75})
        chroma_ids = embed_and_store(chunks, space_id, api_key=user_api_key)

        for i, chunk in enumerate(chunks):
            chunk.metadata["chroma_id"] = chroma_ids[i] if i < len(chroma_ids) else None

        update_doc_status(document_id, {"stage": "ready", "progress": 100})
        update_db_status(document_id, "ready", chunk_count=len(chunks))

        generate_document_suggestions.delay(document_id, space_id, [c.page_content for c in chunks[:5]])
        logger.info("processing_complete", doc_id=document_id, chunks=len(chunks))

    except Exception as exc:
        logger.error("processing_failed", doc_id=document_id, error=str(exc))
        update_doc_status(document_id, {"stage": "failed", "progress": 0, "error": str(exc)})
        update_db_status(document_id, "failed", error=str(exc))
        raise self.retry(exc=exc, countdown=60)


@shared_task(name="app.workers.document_tasks.generate_document_suggestions")
def generate_document_suggestions(document_id: str, space_id: str, sample_chunks: list):
    from app.langchain_pipeline.chains import generate_suggestions
    import asyncio

    excerpts = "\n\n---\n\n".join(sample_chunks[:5])
    suggestions = asyncio.run(generate_suggestions(excerpts))
    sync_redis.setex(f"suggestions:{document_id}", 86400, json.dumps(suggestions))
    logger.info("suggestions_generated", doc_id=document_id, count=len(suggestions))
