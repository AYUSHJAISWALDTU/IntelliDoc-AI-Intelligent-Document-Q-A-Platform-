from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class DocumentResponse(BaseModel):
    id: str
    space_id: str
    file_name: str
    file_type: str
    file_size: int
    page_count: Optional[int]
    chunk_count: int
    status: str
    error_message: Optional[str]
    doc_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]
    download_url: Optional[str] = None

    model_config = {"from_attributes": True}


class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    stage: Optional[str]
    progress: int
    error_message: Optional[str]
    chunk_count: int


class ChunkResponse(BaseModel):
    id: str
    chunk_index: int
    content: str
    page_number: Optional[int]
    char_start: int
    char_end: int
    token_count: int

    model_config = {"from_attributes": True}
