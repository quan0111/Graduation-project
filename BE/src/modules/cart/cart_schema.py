from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
class CartCreate(BaseModel):
    userId: int
class CartOut(BaseModel):
    id: int
    userId: int
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class CartItemCreate(BaseModel):
    cartId: int
    productId: int
    variantId: Optional[int] = None
    quantity: int
class CartItemUpdate(BaseModel):
    quantity: int
class ProductShort(BaseModel):
    id: int
    name: str
    price: float
    class Config:
        from_attributes = True
class VariantShort(BaseModel):
    id: int
    name: str
    price: float

    class Config:
        from_attributes = True


class CartItemOut(BaseModel):
    id: int
    cartId: int
    productId: int
    variantId: Optional[int]
    quantity: int

    product: Optional[ProductShort] = None
    variant: Optional[VariantShort] = None

    class Config:
        from_attributes = True

class CartDetail(CartOut):
    items: List[CartItemOut] = Field(default_factory=list)