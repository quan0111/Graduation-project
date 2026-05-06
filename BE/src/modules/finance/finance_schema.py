from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PayoutCreate(BaseModel):
    shopId: int
    amount: float


class PayoutUpdate(BaseModel):
    status: str   # PENDING | PAID | FAILED

class ShopShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class OrderShort(BaseModel):
    id: int
    totalAmount: float

    model_config = {"from_attributes": True}


class CommissionOut(BaseModel):
    orderId: int
    total: float
    commission: float
    net: float


class PayoutOut(BaseModel):
    id: int
    shopId: int
    amount: float
    status: str
    createdAt: datetime

    shop: Optional[ShopShort] = None

    model_config = {"from_attributes": True}