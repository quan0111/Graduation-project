from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class OrderItemBase(BaseModel):
    productId: int
    variantId: Optional[int] = None
    quantity: int
    price: float
class OrderItemCreate(OrderItemBase):
    pass
class OrderItemOut(OrderItemBase):
    id: int
    orderId: int
    productName: Optional[str] = None
    variantName: Optional[str] = None
    productImage: Optional[str] = None
    class Config:
        from_attributes = True
class PaymentBase(BaseModel):
    method: str
    status: str = "PENDING"
class PaymentCreate(PaymentBase):
    pass
class PaymentOut(PaymentBase):
    id: int
    orderId: int
    createdAt: datetime

    class Config:
        from_attributes = True
class OrderBase(BaseModel):
    userId: int
    shopId: int
    subtotal: float
    shippingFee: float = 0
    discountAmount: float = 0
    totalAmount: float

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]  # 👈 nested items
    payment: Optional[PaymentCreate] = None
class OrderUpdate(BaseModel):
    status: Optional[str] = None
class OrderOut(BaseModel):
    id: int
    userId: int
    shopId: int
    status: str
    subtotal: float
    shippingFee: float
    discountAmount: float
    totalAmount: float
    createdAt: datetime

    items: List[OrderItemOut] = []
    payment: Optional[PaymentOut] = None

    class Config:
        from_attributes = True