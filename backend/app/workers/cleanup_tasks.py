import asyncio
import datetime
from celery import shared_task
from app.core.s3 import delete_file_from_s3
import structlog

logger = structlog.get_logger()


@shared_task(name="app.workers.cleanup_tasks.purge_deleted_conversations")
def purge_deleted_conversations():
    from app.database import AsyncSessionLocal
    from app.models.conversation import Conversation
    from sqlalchemy import delete, select

    async def _purge():
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=30)
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Conversation).where(
                    Conversation.is_deleted == True,
                    Conversation.deleted_at < cutoff,
                )
            )
            convs = result.scalars().all()
            for conv in convs:
                await session.delete(conv)
            await session.commit()
            logger.info("conversations_purged", count=len(convs))

    asyncio.run(_purge())


@shared_task(name="app.workers.cleanup_tasks.cleanup_failed_documents")
def cleanup_failed_documents():
    from app.database import AsyncSessionLocal
    from app.models.document import Document
    from sqlalchemy import select

    async def _cleanup():
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Document).where(
                    Document.status == "failed",
                    Document.created_at < cutoff,
                )
            )
            docs = result.scalars().all()
            for doc in docs:
                try:
                    delete_file_from_s3(doc.s3_key)
                except Exception:
                    pass
                await session.delete(doc)
            await session.commit()
            logger.info("failed_docs_cleaned", count=len(docs))

    asyncio.run(_cleanup())
