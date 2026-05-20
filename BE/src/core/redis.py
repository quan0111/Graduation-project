import json
import logging
from typing import Optional, Any

from fastapi.encoders import jsonable_encoder
import redis.asyncio as redis
from redis.asyncio import Redis

from src.core.config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    _instance: Optional[Redis] = None

    @classmethod
    async def get_client(cls) -> Redis:
        """Get or create Redis client instance."""
        if cls._instance is None:
            cls._instance = await cls._create_client()
        return cls._instance

    @classmethod
    async def _create_client(cls) -> Redis:
        """Create Redis client with connection pooling."""
        redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
        
        client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=10,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
        
        # Test connection
        try:
            await client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
        
        return client

    @classmethod
    async def close(cls):
        """Close Redis connection."""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None
            logger.info("Redis connection closed")

    @classmethod
    async def get(cls, key: str) -> Optional[str]:
        """Get value from Redis."""
        try:
            client = await cls.get_client()
            return await client.get(key)
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {e}")
            return None

    @classmethod
    async def set(cls, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set value in Redis with optional expiration."""
        try:
            client = await cls.get_client()
            encoded_value = jsonable_encoder(value)
            await client.set(key, json.dumps(encoded_value, default=str), ex=expire)
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {e}")
            return False

    @classmethod
    async def delete(cls, key: str) -> bool:
        """Delete key from Redis."""
        try:
            client = await cls.get_client()
            await client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error for key {key}: {e}")
            return False

    @classmethod
    async def delete_pattern(cls, pattern: str) -> int:
        """Delete all keys matching pattern."""
        try:
            client = await cls.get_client()
            deleted = 0
            batch: list[str] = []
            async for key in client.scan_iter(match=pattern, count=500):
                batch.append(key)
                if len(batch) >= 500:
                    deleted += await client.delete(*batch)
                    batch = []
            if batch:
                deleted += await client.delete(*batch)
            return deleted
        except Exception as e:
            logger.error(f"Redis DELETE_PATTERN error for pattern {pattern}: {e}")
            return 0

    @classmethod
    async def exists(cls, key: str) -> bool:
        """Check if key exists in Redis."""
        try:
            client = await cls.get_client()
            return await client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS error for key {key}: {e}")
            return False

    @classmethod
    async def incr(cls, key: str) -> int:
        """Increment value in Redis."""
        try:
            client = await cls.get_client()
            return await client.incr(key)
        except Exception as e:
            logger.error(f"Redis INCR error for key {key}: {e}")
            return 0

    @classmethod
    async def expire(cls, key: str, seconds: int) -> bool:
        """Set expiration for key."""
        try:
            client = await cls.get_client()
            return await client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Redis EXPIRE error for key {key}: {e}")
            return False
