from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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
    items: list[FlashSaleItemOut] = []

    model_config = {"from_attributes": True}
