from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.ai.schedule import start_scheduler, stop_scheduler
from src.core.config import settings
from src.core.database import prisma
from src.core.redis import RedisClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to database...")
    await prisma.connect()
    print("Database connected")

    if settings.REDIS_ENABLED:
        try:
            await RedisClient.get_client()
            print("Redis connected")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            print("Continuing without Redis...")

    await start_scheduler()
    print("Scheduler started")

    yield

    print("Shutting down scheduler...")
    await stop_scheduler()
    print("Scheduler stopped")

    print("Disconnecting database...")
    await prisma.disconnect()
    print("Database disconnected")

    if settings.REDIS_ENABLED:
        await RedisClient.close()
        print("Redis disconnected")
