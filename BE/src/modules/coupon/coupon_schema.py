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
    usageLimitPerUser: Optional[int] = None

    validFrom: Optional[datetime] = None
    validUntil: Optional[datetime] = None

    applicableShopId: Optional[int] = None

class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discountValue: Optional[float] = None
    isActive: Optional[bool] = None
    usageLimit: Optional[int] = None
    usageLimitPerUser: Optional[int] = None
    validUntil: Optional[datetime] = None


class CouponValidateRequest(BaseModel):
    code: str
    orderAmount: float = Field(ge=0)
    shopIds: List[int] = Field(default_factory=list)


class CouponDiscountRequest(BaseModel):
    couponId: int
    orderAmount: float = Field(ge=0)
    shopIds: List[int] = Field(default_factory=list)


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
    usageLimitPerUser: Optional[int] = None
    usedCount: int

    validFrom: Optional[datetime]
    validUntil: Optional[datetime]

    isActive: bool
    applicableShopId: Optional[int]

    orders: List[OrderShort] = Field(default_factory=list)

    model_config = {"from_attributes": True}
