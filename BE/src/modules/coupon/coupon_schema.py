from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"


class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discountType: DiscountType
    discountValue: float

    minOrderAmount: Optional[float] = None
    maxDiscount: Optional[float] = None
    usageLimit: Optional[int] = None

    validFrom: Optional[datetime] = None
    validUntil: Optional[datetime] = None

    applicableShopId: Optional[int] = None

class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discountValue: Optional[float] = None
    isActive: Optional[bool] = None
    usageLimit: Optional[int] = None
    validUntil: Optional[datetime] = None


class OrderShort(BaseModel):
    id: int
    totalAmount: float

    model_config = {"from_attributes": True}


class CouponOut(BaseModel):
    id: int
    code: str
    description: Optional[str]
    discountType: DiscountType
    discountValue: float

    minOrderAmount: Optional[float]
    maxDiscount: Optional[float]

    usageLimit: Optional[int]
    usedCount: int

    validFrom: Optional[datetime]
    validUntil: Optional[datetime]

    isActive: bool
    applicableShopId: Optional[int]

    orders: List[OrderShort] = Field(default_factory=list)

    model_config = {"from_attributes": True}