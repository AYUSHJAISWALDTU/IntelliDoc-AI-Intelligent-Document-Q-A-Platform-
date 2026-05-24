from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.space import Space
from app.models.document import Document
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.space import SpaceCreateRequest, SpaceUpdateRequest, SpaceResponse
from app.schemas.common import MessageResponse
from app.dependencies import get_current_user
from app.exceptions import NotFoundError, ForbiddenError
from app.langchain_pipeline.embedder import delete_space_collection
from typing import List
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/spaces", tags=["spaces"])


async def get_space_or_404(space_id: str, user: User, db: AsyncSession) -> Space:
    result = await db.execute(select(Space).where(Space.id == space_id, Space.user_id == user.id))
    space = result.scalar_one_or_none()
    if not space:
        raise NotFoundError("Space")
    return space


@router.get("", response_model=List[SpaceResponse])
async def list_spaces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Space).where(Space.user_id == current_user.id).order_by(Space.updated_at.desc())
    )
    spaces = result.scalars().all()

    enriched = []
    for space in spaces:
        doc_count = await db.scalar(select(func.count(Document.id)).where(Document.space_id == space.id))
        conv_count = await db.scalar(
            select(func.count(Conversation.id)).where(
                Conversation.space_id == space.id, Conversation.is_deleted == False
            )
        )
        s = SpaceResponse(
            id=space.id, name=space.name, description=space.description,
            color=space.color, icon=space.icon, storage_used=space.storage_used,
            document_count=doc_count or 0, conversation_count=conv_count or 0,
            created_at=space.created_at, updated_at=space.updated_at,
        )
        enriched.append(s)
    return enriched


@router.post("", response_model=SpaceResponse, status_code=201)
async def create_space(
    request: SpaceCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = Space(
        user_id=current_user.id,
        name=request.name,
        description=request.description,
        color=request.color,
        icon=request.icon,
    )
    db.add(space)
    await db.commit()
    return SpaceResponse(
        id=space.id, name=space.name, description=space.description,
        color=space.color, icon=space.icon, storage_used=0,
        document_count=0, conversation_count=0,
        created_at=space.created_at, updated_at=space.updated_at,
    )


@router.get("/{space_id}", response_model=SpaceResponse)
async def get_space(
    space_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = await get_space_or_404(space_id, current_user, db)
    doc_count = await db.scalar(select(func.count(Document.id)).where(Document.space_id == space_id))
    conv_count = await db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.space_id == space_id, Conversation.is_deleted == False
        )
    )
    return SpaceResponse(
        id=space.id, name=space.name, description=space.description,
        color=space.color, icon=space.icon, storage_used=space.storage_used,
        document_count=doc_count or 0, conversation_count=conv_count or 0,
        created_at=space.created_at, updated_at=space.updated_at,
    )


@router.patch("/{space_id}", response_model=SpaceResponse)
async def update_space(
    space_id: str,
    request: SpaceUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = await get_space_or_404(space_id, current_user, db)
    if request.name is not None:
        space.name = request.name
    if request.description is not None:
        space.description = request.description
    if request.color is not None:
        space.color = request.color
    if request.icon is not None:
        space.icon = request.icon
    await db.commit()
    return SpaceResponse(
        id=space.id, name=space.name, description=space.description,
        color=space.color, icon=space.icon, storage_used=space.storage_used,
        document_count=0, conversation_count=0,
        created_at=space.created_at, updated_at=space.updated_at,
    )


@router.delete("/{space_id}", response_model=MessageResponse)
async def delete_space(
    space_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = await get_space_or_404(space_id, current_user, db)
    delete_space_collection(space_id)
    await db.delete(space)
    await db.commit()
    return MessageResponse(message="Space deleted successfully")
