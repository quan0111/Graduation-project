from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ReturnRequestCreate(BaseModel):
    orderId: int
    reason: str


class ReturnItemCreate(BaseModel):
    orderItemId: int
    quantity: int = Field(gt=0)  # 🔥 FIX


class ReturnEvidenceCreate(BaseModel):
    imageUrl: str


class ReturnUpdate(BaseModel):
    status: str

class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class OrderShort(BaseModel):
    id: int
    totalAmount: float

    model_config = {"from_attributes": True}


class OrderItemShort(BaseModel):
    id: int
    productId: int
    price: float
    quantity: int

    model_config = {"from_attributes": True}

class ReturnItemOut(BaseModel):
    id: int
    orderItemId: int
    quantity: int
    refundAmount: float

    orderItem: Optional[OrderItemShort] = None

    model_config = {"from_attributes": True}


class ReturnEvidenceOut(BaseModel):
    id: int
    imageUrl: str

    model_config = {"from_attributes": True}


class ReturnOut(BaseModel):
    id: int
    orderId: int
    userId: int

    reason: str
    status: str
    createdAt: datetime

    # 🔥 relation
    user: Optional[UserShort] = None
    order: Optional[OrderShort] = None
    reviewedBy: Optional[UserShort] = None

    items: List[ReturnItemOut] = Field(default_factory=list)
    evidences: List[ReturnEvidenceOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}