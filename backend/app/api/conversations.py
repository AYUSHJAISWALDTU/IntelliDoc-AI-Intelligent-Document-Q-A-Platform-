from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.database import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.space import Space
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreateRequest, ConversationUpdateRequest,
    ConversationResponse, MessageResponse, FeedbackRequest,
)
from app.schemas.common import MessageResponse as GenericMsg
from app.dependencies import get_current_user
from app.exceptions import NotFoundError
import datetime
import structlog

logger = structlog.get_logger()
router = APIRouter(tags=["conversations"])


async def get_space_or_404(space_id: str, user: User, db: AsyncSession) -> Space:
    result = await db.execute(select(Space).where(Space.id == space_id, Space.user_id == user.id))
    space = result.scalar_one_or_none()
    if not space:
        raise NotFoundError("Space")
    return space


@router.get("/spaces/{space_id}/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    space_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(
        select(Conversation).where(
            Conversation.space_id == space_id,
            Conversation.is_deleted == False,
        ).order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc())
    )
    convs = result.scalars().all()

    enriched = []
    for conv in convs:
        msg_count = await db.scalar(
            select(func.count(Message.id)).where(Message.conversation_id == conv.id)
        )
        last_msg = await db.execute(
            select(Message.created_at).where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc()).limit(1)
        )
        last_msg_at = last_msg.scalar_one_or_none()
        enriched.append(ConversationResponse(
            id=conv.id, space_id=conv.space_id, title=conv.title,
            is_pinned=conv.is_pinned, message_count=msg_count or 0,
            last_message_at=last_msg_at, created_at=conv.created_at, updated_at=conv.updated_at,
        ))
    return enriched


@router.post("/spaces/{space_id}/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    space_id: str,
    request: ConversationCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    conv = Conversation(space_id=space_id, title=request.title)
    db.add(conv)
    await db.commit()
    return ConversationResponse(
        id=conv.id, space_id=conv.space_id, title=conv.title,
        is_pinned=conv.is_pinned, message_count=0,
        created_at=conv.created_at, updated_at=conv.updated_at,
    )


@router.get("/spaces/{space_id}/conversations/{conv_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    space_id: str,
    conv_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(
        select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return [
        MessageResponse(
            id=m.id, conversation_id=m.conversation_id, role=m.role,
            content=m.content, sources=m.sources, model_used=m.model_used,
            token_count=m.token_count, latency_ms=m.latency_ms, feedback=m.feedback,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.patch("/spaces/{space_id}/conversations/{conv_id}", response_model=ConversationResponse)
async def update_conversation(
    space_id: str,
    conv_id: str,
    request: ConversationUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id, Conversation.space_id == space_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise NotFoundError("Conversation")

    if request.title is not None:
        conv.title = request.title
    if request.is_pinned is not None:
        conv.is_pinned = request.is_pinned
    await db.commit()

    return ConversationResponse(
        id=conv.id, space_id=conv.space_id, title=conv.title,
        is_pinned=conv.is_pinned, message_count=0,
        created_at=conv.created_at, updated_at=conv.updated_at,
    )


@router.delete("/spaces/{space_id}/conversations/{conv_id}", response_model=GenericMsg)
async def delete_conversation(
    space_id: str,
    conv_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_space_or_404(space_id, current_user, db)
    result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id, Conversation.space_id == space_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise NotFoundError("Conversation")

    conv.is_deleted = True
    conv.deleted_at = datetime.datetime.utcnow()
    await db.commit()
    return GenericMsg(message="Conversation deleted")


@router.post("/spaces/{space_id}/conversations/{conv_id}/messages/{msg_id}/feedback")
async def submit_feedback(
    space_id: str,
    conv_id: str,
    msg_id: str,
    request: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Message).where(Message.id == msg_id, Message.conversation_id == conv_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise NotFoundError("Message")
    msg.feedback = request.feedback
    await db.commit()
    return GenericMsg(message="Feedback recorded")
