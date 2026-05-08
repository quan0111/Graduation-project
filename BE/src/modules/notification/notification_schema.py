from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    ORDER = "ORDER"
    PAYMENT = "PAYMENT"
    SYSTEM = "SYSTEM"
    PROMOTION = "PROMOTION"
    PRODUCT_BANNED = "PRODUCT_BANNED"

class NotificationCreate(BaseModel):  
    userId: int
    title: str
    content: str
    type: NotificationType
    metadata: Optional[Dict[str, Any]] = None

class NotificationUpdate(BaseModel):
    isRead: Optional[bool] = None


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: int
    userId: int

    title: str
    content: str
    type: NotificationType
    isRead: bool
    metadata: Optional[Dict[str, Any]]

    createdAt: datetime

    # 🔥 RELATION
    user: Optional[UserShort] = None

    model_config = {"from_attributes": True}