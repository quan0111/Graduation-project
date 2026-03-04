from contextlib import asynccontextmanager
from tracemalloc import start
from fastapi import FastAPI
from src.core.database import prisma
from src.ai.schedule import start_scheduler,stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(" Connecting to database...")
    await prisma.connect()
    print(" Database connected")
    await start_scheduler()
    print(" Scheduler started")

    yield
    print(" Shutting down scheduler...")
    await stop_scheduler()
    print(" Scheduler stopped")
    print(" Disconnecting database...")
    await prisma.disconnect()
    print(" Database disconnected")