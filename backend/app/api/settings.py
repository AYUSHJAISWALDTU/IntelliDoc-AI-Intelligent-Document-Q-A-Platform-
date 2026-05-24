from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.settings import ApiKey, UserSettings
from app.schemas.user import (
    ApiKeyCreateRequest, ApiKeyResponse,
    UserSettingsResponse, UserSettingsUpdateRequest,
    UpdateProfileRequest, UserResponse,
)
from app.schemas.common import MessageResponse
from app.dependencies import get_current_user
from app.core.security import encrypt_api_key, decrypt_api_key, mask_api_key
from app.exceptions import NotFoundError
from typing import List
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id, email=current_user.email, name=current_user.name,
        avatar_url=current_user.avatar_url, auth_provider=current_user.auth_provider,
        is_admin=current_user.is_admin, created_at=current_user.created_at,
    )


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if request.name is not None:
        current_user.name = request.name
    if request.avatar_url is not None:
        current_user.avatar_url = request.avatar_url
    await db.commit()
    return UserResponse(
        id=current_user.id, email=current_user.email, name=current_user.name,
        avatar_url=current_user.avatar_url, auth_provider=current_user.auth_provider,
        is_admin=current_user.is_admin, created_at=current_user.created_at,
    )


@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ApiKey).where(ApiKey.user_id == current_user.id))
    keys = result.scalars().all()
    return [
        ApiKeyResponse(
            id=k.id, provider=k.provider, key_preview=k.key_preview,
            label=k.label, is_valid=k.is_valid, last_tested_at=k.last_tested_at,
            created_at=k.created_at,
        )
        for k in keys
    ]


@router.post("/api-keys", response_model=ApiKeyResponse, status_code=201)
async def add_api_key(
    request: ApiKeyCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    encrypted = encrypt_api_key(request.api_key)
    preview = mask_api_key(request.api_key)

    key = ApiKey(
        user_id=current_user.id,
        provider=request.provider,
        encrypted_key=encrypted,
        key_preview=preview,
        label=request.label,
    )
    db.add(key)
    await db.commit()
    return ApiKeyResponse(
        id=key.id, provider=key.provider, key_preview=key.key_preview,
        label=key.label, is_valid=key.is_valid, last_tested_at=key.last_tested_at,
        created_at=key.created_at,
    )


@router.delete("/api-keys/{key_id}", response_model=MessageResponse)
async def delete_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API Key")
    await db.delete(key)
    await db.commit()
    return MessageResponse(message="API key deleted")


@router.post("/api-keys/{key_id}/test", response_model=MessageResponse)
async def test_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import datetime
    from openai import AsyncOpenAI

    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API Key")

    plaintext_key = decrypt_api_key(key.encrypted_key)
    try:
        client = AsyncOpenAI(api_key=plaintext_key)
        await client.models.list()
        key.is_valid = True
    except Exception:
        key.is_valid = False

    key.last_tested_at = datetime.datetime.utcnow()
    await db.commit()
    status = "valid" if key.is_valid else "invalid"
    return MessageResponse(message=f"API key is {status}")


@router.get("/preferences", response_model=UserSettingsResponse)
async def get_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    s = result.scalar_one_or_none()
    if not s:
        s = UserSettings(user_id=current_user.id)
        db.add(s)
        await db.commit()
    return UserSettingsResponse(
        default_model=s.default_model, chunk_size=s.chunk_size,
        chunk_overlap=s.chunk_overlap, response_style=s.response_style, theme=s.theme,
    )


@router.patch("/preferences", response_model=UserSettingsResponse)
async def update_preferences(
    request: UserSettingsUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    s = result.scalar_one_or_none()
    if not s:
        s = UserSettings(user_id=current_user.id)
        db.add(s)

    for field, val in request.model_dump(exclude_none=True).items():
        setattr(s, field, val)
    await db.commit()
    return UserSettingsResponse(
        default_model=s.default_model, chunk_size=s.chunk_size,
        chunk_overlap=s.chunk_overlap, response_style=s.response_style, theme=s.theme,
    )
