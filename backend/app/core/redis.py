import redis.asyncio as aioredis
from app.config import settings
import structlog

logger = structlog.get_logger()

_redis_client = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def set_key(key: str, value: str, ttl: int = None) -> None:
    client = await get_redis()
    if ttl:
        await client.setex(key, ttl, value)
    else:
        await client.set(key, value)


async def get_key(key: str) -> str | None:
    client = await get_redis()
    return await client.get(key)


async def delete_key(key: str) -> None:
    client = await get_redis()
    await client.delete(key)


async def set_doc_status(doc_id: str, status: dict, ttl: int = 3600) -> None:
    import json
    await set_key(f"doc_status:{doc_id}", json.dumps(status), ttl)


async def get_doc_status(doc_id: str) -> dict | None:
    import json
    val = await get_key(f"doc_status:{doc_id}")
    return json.loads(val) if val else None


async def set_suggestions(doc_id: str, suggestions: list, ttl: int = 86400) -> None:
    import json
    await set_key(f"suggestions:{doc_id}", json.dumps(suggestions), ttl)


async def get_suggestions(doc_id: str) -> list | None:
    import json
    val = await get_key(f"suggestions:{doc_id}")
    return json.loads(val) if val else None


async def publish_event(channel: str, data: dict) -> None:
    import json
    client = await get_redis()
    await client.publish(channel, json.dumps(data))
