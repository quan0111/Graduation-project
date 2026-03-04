from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CouponCreate(BaseModel):
    code: str
    discountType: str
    discountValue: float
    minOrderAmount: Optional[float] = None
    maxDiscount: Optional[float] = None
    usageLimit: Optional[int] = None


class CouponUpdate(BaseModel):
    isActive: Optional[bool] = None
    usageLimit: Optional[int] = None


class CouponOut(BaseModel):
    id: int
    code: str
    discountType: str
    discountValue: float
    isActive: bool

    class Config:
        from_attributes = True