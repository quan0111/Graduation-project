from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    ORDER_UPDATE = "ORDER_UPDATE"
    PAYMENT_UPDATE = "PAYMENT_UPDATE"
    RETURN_UPDATE = "RETURN_UPDATE"
    REFUND_UPDATE = "REFUND_UPDATE"
    SYSTEM = "SYSTEM"
    PROMOTION = "PROMOTION"
    CHAT = "CHAT"
    PRODUCT_BANNED = "PRODUCT_BANNED"
    SUPPORT_TICKET = "SUPPORT_TICKET"

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
