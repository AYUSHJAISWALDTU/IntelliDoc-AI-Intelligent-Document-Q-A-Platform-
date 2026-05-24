from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = None


class ConversationUpdateRequest(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None


class ConversationResponse(BaseModel):
    id: str
    space_id: str
    title: Optional[str]
    is_pinned: bool
    message_count: int = 0
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AskRequest(BaseModel):
    question: str
    model: str = "gpt-4o"


class SourceMetadata(BaseModel):
    index: int
    document_id: str
    document_name: str
    page_number: Optional[int]
    chunk_text: str
    relevance_score: float


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]]
    model_used: Optional[str]
    token_count: Optional[int]
    latency_ms: Optional[int]
    feedback: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedbackRequest(BaseModel):
    feedback: str  # "thumbs_up" | "thumbs_down"
