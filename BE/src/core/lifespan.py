from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.core.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(" Connecting to database...")
    await db.connect()
    print("✅ Database connected")

    yield

    print(" Disconnecting database...")
    await db.disconnect()
    print(" Database disconnected")