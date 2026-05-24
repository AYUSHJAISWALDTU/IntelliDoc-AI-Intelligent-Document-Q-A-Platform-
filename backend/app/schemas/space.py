from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SpaceCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366F1"
    icon: Optional[str] = "📁"


class SpaceUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class SpaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    color: Optional[str]
    icon: Optional[str]
    storage_used: int
    document_count: int = 0
    conversation_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
