from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class NotificationCreate(BaseModel):
    userId: int
    title: str
    content: str
    type: str
    metadata: Optional[Dict[str, Any]] = None


class NotificationUpdate(BaseModel):
    isRead: Optional[bool] = None


class NotificationOut(BaseModel):
    id: int
    userId: int
    title: str
    content: str
    type: str
    isRead: bool
    metadata: Optional[Dict[str, Any]]
    createAt: datetime

    class Config:
        from_attributes = True