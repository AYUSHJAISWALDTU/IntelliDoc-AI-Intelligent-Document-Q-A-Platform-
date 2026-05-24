from fastapi import APIRouter, Depends
from app.core.redis import get_suggestions
from app.dependencies import get_current_user
from app.models.user import User
from typing import List

router = APIRouter(tags=["suggestions"])


@router.get("/spaces/{space_id}/documents/{doc_id}/suggestions", response_model=List[str])
async def get_document_suggestions(
    space_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user),
):
    suggestions = await get_suggestions(doc_id)
    return suggestions or []
