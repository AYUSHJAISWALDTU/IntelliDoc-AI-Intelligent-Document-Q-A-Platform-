from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "intellidoc",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.document_tasks",
        "app.workers.cleanup_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.document_tasks.*": {"queue": "documents"},
        "app.workers.cleanup_tasks.*": {"queue": "cleanup"},
    },
    beat_schedule={
        "cleanup-deleted-conversations": {
            "task": "app.workers.cleanup_tasks.purge_deleted_conversations",
            "schedule": crontab(hour=2, minute=0),
        },
        "cleanup-failed-documents": {
            "task": "app.workers.cleanup_tasks.cleanup_failed_documents",
            "schedule": crontab(hour=3, minute=0),
        },
    },
)
