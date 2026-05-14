from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=180)
    message: str = Field(..., min_length=2, max_length=2000)
    shopId: Optional[int] = None
    orderId: Optional[int] = None
    returnRequestId: Optional[int] = None
    category: Optional[str] = None
    priority: str = "MEDIUM"


class SupportMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    attachmentUrl: Optional[str] = None


class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignedAdminId: Optional[int] = None


class SupportUserShort(BaseModel):
    id: int
    email: str
    fullName: Optional[str] = None

    model_config = {"from_attributes": True}


class SupportShopShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SupportMessageOut(BaseModel):
    id: int
    ticketId: int
    senderId: Optional[int] = None
    senderRole: str
    message: str
    attachmentUrl: Optional[str] = None
    createdAt: datetime
    sender: Optional[SupportUserShort] = None

    model_config = {"from_attributes": True}


class SupportTicketOut(BaseModel):
    id: int
    userId: int
    shopId: Optional[int] = None
    orderId: Optional[int] = None
    returnRequestId: Optional[int] = None
    assignedAdminId: Optional[int] = None
    subject: str
    category: Optional[str] = None
    priority: str
    status: str
    createdAt: datetime
    updatedAt: datetime
    user: Optional[SupportUserShort] = None
    shop: Optional[SupportShopShort] = None
    messages: List[SupportMessageOut] = []

    model_config = {"from_attributes": True}
