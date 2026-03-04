from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FollowerCreate(BaseModel):
    userId: int
    followerId: int
class FollowerOut(BaseModel):
    id: int
    userId: int
    followerId: int
    createdAt: datetime

    class Config:
        from_attributes = True