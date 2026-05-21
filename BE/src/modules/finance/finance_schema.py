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


class CategoryShort(BaseModel):
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


class ShopCommissionConfigUpsert(BaseModel):
    shopId: int
    commissionRate: float
    isActive: bool = True
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None


class CategoryCommissionConfigUpsert(BaseModel):
    categoryId: int
    commissionRate: float
    isActive: bool = True


class ShopCommissionConfigOut(BaseModel):
    id: int
    shopId: int
    commissionRate: float
    isActive: bool
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    shop: Optional[ShopShort] = None

    model_config = {"from_attributes": True}


class CategoryCommissionConfigOut(BaseModel):
    id: int
    categoryId: int
    commissionRate: float
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    category: Optional[CategoryShort] = None

    model_config = {"from_attributes": True}
