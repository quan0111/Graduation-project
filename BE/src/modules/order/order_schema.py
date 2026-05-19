from datetime import datetime
from typing import Any, Dict, List, Optional

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
    orderId: int


class OrderPaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    status: str


class PaymentGatewayCreate(BaseModel):
    orderId: int
    method: str


class PaymentOut(PaymentBase):
    id: int
    orderId: int
    amount: Optional[float] = None
    providerOrderId: Optional[str] = None
    requestId: Optional[str] = None
    transactionId: Optional[str] = None
    paymentUrl: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    deeplink: Optional[str] = None
    providerMessage: Optional[str] = None
    providerResponse: Optional[Dict[str, Any]] = None
    rawCallback: Optional[Dict[str, Any]] = None
    paidAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentGatewayOut(BaseModel):
    payment: PaymentOut
    paymentUrl: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    deeplink: Optional[str] = None
    providerOrderId: Optional[str] = None
    requestId: Optional[str] = None


class CheckoutOut(BaseModel):
    order: "OrderOut"
    payment: Optional[PaymentOut] = None
    paymentUrl: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    deeplink: Optional[str] = None
    providerOrderId: Optional[str] = None
    requestId: Optional[str] = None


class OrderBase(BaseModel):
    userId: int
    subtotal: float
    shippingFee: float = 0
    shippingMethod: Optional[str] = None
    discountAmount: float = 0
    totalAmount: float
    shippingAddressId: Optional[int] = None
    couponId: Optional[int] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    payment: Optional[OrderPaymentCreate] = None


class CheckoutCreate(OrderCreate):
    cartItemIds: List[int] = []


class OrderUpdate(BaseModel):
    status: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str


class OrderOut(BaseModel):
    id: int
    userId: int
    status: str
    subtotal: float
    shippingFee: float
    shippingMethod: Optional[str] = None
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
