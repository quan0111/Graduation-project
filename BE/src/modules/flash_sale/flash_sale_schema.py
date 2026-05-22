from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FlashSaleCreate(BaseModel):
    name: str
    startsAt: datetime
    endsAt: datetime
    status: str = "DRAFT"


class FlashSaleUpdate(BaseModel):
    name: Optional[str] = None
    startsAt: Optional[datetime] = None
    endsAt: Optional[datetime] = None
    status: Optional[str] = None


class FlashSaleItemCreate(BaseModel):
    productId: int
    variantId: Optional[int] = None
    shopId: int
    salePrice: float
    stockLimit: Optional[int] = None
    purchaseLimit: Optional[int] = None


class FlashSaleBulkItemCreate(BaseModel):
    productId: int
    variantId: Optional[int] = None
    shopId: Optional[int] = None
    salePrice: Optional[float] = None


class FlashSaleBulkItemCreateRequest(BaseModel):
    productIds: list[int] = Field(default_factory=list)
    categoryIds: list[int] = Field(default_factory=list)
    items: list[FlashSaleBulkItemCreate] = Field(default_factory=list)
    discountPercent: Optional[float] = None
    salePrice: Optional[float] = None
    stockLimit: Optional[int] = None
    purchaseLimit: Optional[int] = None


class FlashSaleItemOut(BaseModel):
    id: int
    flashSaleId: int
    productId: int
    variantId: Optional[int] = None
    shopId: int
    salePrice: float
    stockLimit: Optional[int] = None
    soldCount: int
    purchaseLimit: Optional[int] = None
    createdAt: datetime

    model_config = {"from_attributes": True}


class FlashSaleOut(BaseModel):
    id: int
    name: str
    startsAt: datetime
    endsAt: datetime
    status: str
    createdAt: datetime
    updatedAt: datetime
    items: list[FlashSaleItemOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class FlashSaleBulkItemResult(BaseModel):
    productId: int
    variantId: Optional[int] = None
    action: str


class FlashSaleBulkItemError(BaseModel):
    productId: Optional[int] = None
    variantId: Optional[int] = None
    reason: str


class FlashSaleBulkItemCreateOut(BaseModel):
    created: int
    updated: int
    skipped: int
    results: list[FlashSaleBulkItemResult] = Field(default_factory=list)
    errors: list[FlashSaleBulkItemError] = Field(default_factory=list)
