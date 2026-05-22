from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class DiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"


class CouponScope(str, Enum):
    ORDER = "ORDER"
    SHIPPING = "SHIPPING"
    SHOP = "SHOP"
    CATEGORY = "CATEGORY"
    PRODUCT = "PRODUCT"


class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    scope: Optional[CouponScope] = None
    discountType: DiscountType
    discountValue: float

    minOrderAmount: Optional[float] = None
    maxDiscount: Optional[float] = None
    usageLimit: Optional[int] = None
    usageLimitPerUser: Optional[int] = None

    validFrom: Optional[datetime] = None
    validUntil: Optional[datetime] = None

    applicableShopId: Optional[int] = None
    applicableCategoryId: Optional[int] = None
    applicableProductId: Optional[int] = None
    applicableProductIds: List[int] = Field(default_factory=list)


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    scope: Optional[CouponScope] = None
    discountValue: Optional[float] = None
    isActive: Optional[bool] = None
    usageLimit: Optional[int] = None
    usageLimitPerUser: Optional[int] = None
    validUntil: Optional[datetime] = None
    applicableCategoryId: Optional[int] = None
    applicableProductId: Optional[int] = None
    applicableProductIds: Optional[List[int]] = None


class CouponValidateRequest(BaseModel):
    code: str
    orderAmount: float = Field(ge=0)
    shopIds: List[int] = Field(default_factory=list)


class CouponDiscountRequest(BaseModel):
    couponId: int
    orderAmount: float = Field(ge=0)
    shopIds: List[int] = Field(default_factory=list)


class CouponStackItem(BaseModel):
    productId: int
    variantId: Optional[int] = None
    shopId: int
    categoryId: Optional[int] = None
    quantity: int = Field(default=1, ge=1)
    price: Optional[float] = Field(default=None, ge=0)
    lineTotal: Optional[float] = Field(default=None, ge=0)


class CouponStackPreviewRequest(BaseModel):
    couponIds: List[int] = Field(default_factory=list)
    couponCodes: List[str] = Field(default_factory=list)
    orderAmount: float = Field(default=0, ge=0)
    shippingFee: float = Field(default=0, ge=0)
    shopIds: List[int] = Field(default_factory=list)
    items: List[CouponStackItem] = Field(default_factory=list)


class OrderShort(BaseModel):
    id: int
    totalAmount: float

    model_config = {"from_attributes": True}


class CouponProductShort(BaseModel):
    id: int
    name: str
    price: float
    status: str

    model_config = {"from_attributes": True}


class CouponProductTargetOut(BaseModel):
    couponId: int
    productId: int
    product: Optional[CouponProductShort] = None

    model_config = {"from_attributes": True}


class CouponOut(BaseModel):
    id: int
    code: str
    description: Optional[str]
    scope: CouponScope = CouponScope.ORDER
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
    applicableCategoryId: Optional[int] = None
    applicableProductId: Optional[int] = None
    applicableProductIds: List[int] = Field(default_factory=list)
    productTargets: List[CouponProductTargetOut] = Field(default_factory=list)

    orders: List[OrderShort] = Field(default_factory=list)

    model_config = {"from_attributes": True}
