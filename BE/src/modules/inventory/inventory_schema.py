from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class InventoryLedgerCreate(BaseModel):
    shopId: int
    productId: Optional[int] = None
    variantId: Optional[int] = None
    orderId: Optional[int] = None
    returnRequestId: Optional[int] = None
    actorId: Optional[int] = None
    type: str
    quantityChange: int
    stockBefore: Optional[int] = None
    stockAfter: Optional[int] = None
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class StockAdjustment(BaseModel):
    quantityChange: int = Field(..., ne=0)
    reason: str = Field(..., min_length=2, max_length=300)


class InventoryProductShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class InventoryVariantShort(BaseModel):
    id: int
    name: str
    sku: Optional[str] = None
    stock: int

    model_config = {"from_attributes": True}


class InventoryLedgerOut(BaseModel):
    id: int
    shopId: int
    productId: Optional[int] = None
    variantId: Optional[int] = None
    orderId: Optional[int] = None
    returnRequestId: Optional[int] = None
    actorId: Optional[int] = None
    type: str
    quantityChange: int
    stockBefore: Optional[int] = None
    stockAfter: Optional[int] = None
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    createdAt: datetime
    product: Optional[InventoryProductShort] = None
    variant: Optional[InventoryVariantShort] = None

    model_config = {"from_attributes": True}
