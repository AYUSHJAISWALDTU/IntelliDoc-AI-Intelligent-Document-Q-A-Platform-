import time
import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.space import Space
from app.models.user import User
from app.schemas.conversation import AskRequest
from app.dependencies import get_current_user
from app.exceptions import NotFoundError
from app.langchain_pipeline.chains import (
    stream_rag_response, retrieve_sources, generate_title
)
from app.config import settings
from sse_starlette.sse import EventSourceResponse
import tiktoken
import structlog

logger = structlog.get_logger()
router = APIRouter(tags=["chat"])

enc = tiktoken.get_encoding("cl100k_base")


async def get_chat_history(db: AsyncSession, conv_id: str, limit: int = 5) -> list:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at.desc())
        .limit(limit * 2)
    )
    messages = result.scalars().all()
    messages.reverse()
    return [{"role": m.role, "content": m.content} for m in messages]


@router.post("/spaces/{space_id}/conversations/{conv_id}/ask")
async def ask_question(
    space_id: str,
    conv_id: str,
    request: AskRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space_result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    if not space_result.scalar_one_or_none():
        raise NotFoundError("Space")

    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id, Conversation.space_id == space_id)
    )
    conv = conv_result.scalar_one_or_none()
    if not conv:
        raise NotFoundError("Conversation")

    async def event_generator():
        start_time = time.time()
        history = await get_chat_history(db, conv_id)

        yield {"event": "status", "data": json.dumps({"stage": "searching"})}
        sources = await retrieve_sources(space_id, request.question)
        yield {"event": "status", "data": json.dumps({"stage": "generating"})}

        full_response = ""
        async for token in stream_rag_response(
            space_id=space_id,
            question=request.question,
            chat_history=history,
            model=request.model or settings.OPENAI_CHAT_MODEL,
        ):
            full_response += token
            yield {"event": "token", "data": json.dumps({"token": token})}

        yield {"event": "sources", "data": json.dumps({"sources": sources})}

        latency_ms = int((time.time() - start_time) * 1000)
        token_count = len(enc.encode(full_response))

        user_msg = Message(
            conversation_id=conv_id,
            role="user",
            content=request.question,
        )
        db.add(user_msg)
        await db.flush()

        ai_msg = Message(
            conversation_id=conv_id,
            role="assistant",
            content=full_response,
            sources=sources,
            model_used=request.model or settings.OPENAI_CHAT_MODEL,
            token_count=token_count,
            latency_ms=latency_ms,
        )
        db.add(ai_msg)

        is_first_exchange = len(history) == 0
        if is_first_exchange and not conv.title:
            try:
                title = await generate_title(request.question, full_response[:300])
                conv.title = title
            except Exception:
                conv.title = request.question[:60]

        await db.commit()

        yield {"event": "done", "data": json.dumps({
            "message_id": ai_msg.id,
            "token_count": token_count,
            "latency_ms": latency_ms,
        })}

    return EventSourceResponse(event_generator())
