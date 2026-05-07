from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from src.modules.shop.shop_schema import ShopOut
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
    shopId: int
    productId: int
    variantId: Optional[int] = None
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


class ProductShort(BaseModel):
    id: int
    name: str
    price: float
    images: list = []

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
    shop: Optional[ShopOut] = None
    product: Optional[ProductShort] = None
    variant: Optional[VariantShort] = None

    class Config:
        from_attributes = True


class CartDetail(CartOut):
    items: List[CartItemOut] = Field(default_factory=list)
    totalAmount: float = 0