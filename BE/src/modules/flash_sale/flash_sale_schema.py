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


class FlashSaleOut(BaseModel):
    id: int
    name: str
    startsAt: datetime
    endsAt: datetime
    status: str
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}
