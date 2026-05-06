from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class UserShortOut(BaseModel):
    id: int
    email: str
    fullName: Optional[str] = None

    class Config:
        from_attributes = True


class AddressShortOut(BaseModel):
    id: int
    userId: int
    fullName: str
    phone: str
    addressLine: str
    ward: Optional[str] = None
    district: str
    province: str
    country: Optional[str] = None
    postalCode: Optional[str] = None
    isDefault: bool = False

    class Config:
        from_attributes = True


class ShipmentShortOut(BaseModel):
    id: int
    orderId: int
    carrier: Optional[str] = None
    trackingNumber: Optional[str] = None
    status: str
    shippedAt: Optional[datetime] = None
    deliveredAt: Optional[datetime] = None
    createdAt: datetime

    class Config:
        from_attributes = True


class ShopShortOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    productId: int
    variantId: Optional[int] = None
    shopId: int
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
    shop: Optional[ShopShortOut] = None

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
    subtotal: float
    shippingFee: float = 0
    discountAmount: float = 0
    totalAmount: float
    shippingAddressId: Optional[int] = None
    couponId: Optional[int] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    payment: Optional[PaymentCreate] = None


class OrderUpdate(BaseModel):
    status: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    userId: int
    status: str
    subtotal: float
    shippingFee: float
    discountAmount: float
    totalAmount: float
    shippingAddressId: Optional[int] = None
    couponId: Optional[int] = None
    createdAt: datetime
    updatedAt: datetime
    items: List[OrderItemOut] = []
    payment: Optional[PaymentOut] = None
    user: Optional[UserShortOut] = None
    shippingAddress: Optional[AddressShortOut] = None
    shipment: Optional[ShipmentShortOut] = None

    class Config:
        from_attributes = True
