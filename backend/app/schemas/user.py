from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    auth_provider: Optional[str]
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ApiKeyCreateRequest(BaseModel):
    provider: str
    api_key: str
    label: Optional[str] = None


class ApiKeyResponse(BaseModel):
    id: str
    provider: str
    key_preview: Optional[str]
    label: Optional[str]
    is_valid: Optional[bool]
    last_tested_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserSettingsResponse(BaseModel):
    default_model: str
    chunk_size: int
    chunk_overlap: int
    response_style: str
    theme: str

    model_config = {"from_attributes": True}


class UserSettingsUpdateRequest(BaseModel):
    default_model: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    response_style: Optional[str] = None
    theme: Optional[str] = None
