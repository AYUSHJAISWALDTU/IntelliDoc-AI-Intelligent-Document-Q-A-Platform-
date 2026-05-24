from fastapi import APIRouter
from app.api import auth, spaces, documents, conversations, chat, suggestions, settings

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(spaces.router)
api_router.include_router(documents.router)
api_router.include_router(conversations.router)
api_router.include_router(chat.router)
api_router.include_router(suggestions.router)
api_router.include_router(settings.router)
