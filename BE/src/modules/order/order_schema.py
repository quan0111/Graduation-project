from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    userId: int
    shopId: int
    totalAmount: float
    status: str = Field(default="pending")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(OrderBase):
    pass
class OrderUpdate(BaseModel):
    userId: Optional[int] = None
    shopId: Optional[int] = None
    totalAmount: Optional[float] = None
    status: Optional[str] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class OrderOut(BaseModel):
    id: int
    userId: int
    status: str
    subtotal: float
    totalAmount: float
    createdAt: datetime

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    orderId: int
    productId: int
    variantId: Optional[int] = None
    quantity: int
    price: float
class OrderItemCreate(OrderItemBase):
    pass
class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = None
    price: Optional[float] = None
class OrderItemOut(BaseModel):
    id: int
    orderId: int
    productId: int
    variantId: Optional[int]
    quantity: int
    price: float

    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    orderId: int
    method: str
    status: str = Field(default="pending")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
class PaymentCreate(PaymentBase):
    pass
class PaymentUpdate(BaseModel):
    method: Optional[str] = None
    status: Optional[str] = None
class PaymentOut(BaseModel):
    id: int
    orderId: int
    method: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True
