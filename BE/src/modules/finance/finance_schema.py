from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PayoutCreate(BaseModel):
    shopId: int
    amount: float


class PayoutUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class ShopShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class UserShort(BaseModel):
    id: int
    email: str
    fullName: Optional[str] = None

    model_config = {"from_attributes": True}


class CategoryShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class OrderShort(BaseModel):
    id: int
    totalAmount: float
    checkoutGroupCode: Optional[str] = None
    checkoutGroupPrimary: bool = False

    model_config = {"from_attributes": True}


class OrderItemShort(BaseModel):
    id: int
    productName: str
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class CommissionOut(BaseModel):
    orderId: int
    total: float
    commission: float
    net: float


class PayoutOut(BaseModel):
    id: int
    shopId: int
    amount: float
    status: str
    paidAt: Optional[datetime] = None
    reviewedAt: Optional[datetime] = None
    reviewedById: Optional[int] = None
    note: Optional[str] = None
    createdAt: datetime

    shop: Optional[ShopShort] = None
    reviewedBy: Optional[UserShort] = None

    model_config = {"from_attributes": True}


class PlatformCommissionOut(BaseModel):
    id: int
    orderId: int
    orderItemId: Optional[int] = None
    shopId: int
    commissionRate: float
    grossAmount: float
    commissionAmount: float
    sellerNetAmount: float
    status: str
    note: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    shop: Optional[ShopShort] = None
    order: Optional[OrderShort] = None
    orderItem: Optional[OrderItemShort] = None

    model_config = {"from_attributes": True}


class AdminFinanceSummaryOut(BaseModel):
    grossRevenue: float
    commissionAmount: float
    sellerNetAmount: float
    availableBalance: float
    pendingPayoutAmount: float
    paidPayoutAmount: float
    failedPayoutAmount: float
    pendingPayoutCount: int
    payoutCount: int
    commissionCount: int
    shopsCount: int


class ShopCommissionConfigUpsert(BaseModel):
    shopId: int
    commissionRate: float
    isActive: bool = True
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None


class CategoryCommissionConfigUpsert(BaseModel):
    categoryId: int
    commissionRate: float
    isActive: bool = True


class ShopCommissionConfigOut(BaseModel):
    id: int
    shopId: int
    commissionRate: float
    isActive: bool
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    shop: Optional[ShopShort] = None

    model_config = {"from_attributes": True}


class CategoryCommissionConfigOut(BaseModel):
    id: int
    categoryId: int
    commissionRate: float
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    category: Optional[CategoryShort] = None

    model_config = {"from_attributes": True}
