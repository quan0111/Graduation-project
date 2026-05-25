from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ReturnItemCreate(BaseModel):
    orderItemId: int
    quantity: int = Field(gt=0)


class ReturnEvidenceCreate(BaseModel):
    imageUrl: str


class ReturnRequestCreate(BaseModel):
    orderId: int
    reason: str
    description: Optional[str] = None
    items: List[ReturnItemCreate] = Field(default_factory=list)
    evidences: List[ReturnEvidenceCreate] = Field(default_factory=list)


class ReturnReviewUpdate(BaseModel):
    status: Literal["APPROVED", "REJECTED", "RETURN_APPROVED", "RETURN_REJECTED"]
    rejectReason: Optional[str] = None


class GatewayRefundConfirm(BaseModel):
    transactionId: Optional[str] = None
    status: Literal["SUCCESS", "FAILED"] = "SUCCESS"
    note: Optional[str] = None


class UserShort(BaseModel):
    id: int
    email: str
    fullName: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderShort(BaseModel):
    id: int
    totalAmount: float
    status: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderItemShort(BaseModel):
    id: int
    productId: int
    price: float
    quantity: int
    productName: Optional[str] = None
    variantName: Optional[str] = None
    productImage: Optional[str] = None

    model_config = {"from_attributes": True}


class ReturnItemOut(BaseModel):
    id: int
    orderItemId: int
    quantity: int
    refundAmount: float
    orderItem: Optional[OrderItemShort] = None

    model_config = {"from_attributes": True}


class ReturnEvidenceOut(BaseModel):
    id: int
    imageUrl: str

    model_config = {"from_attributes": True}


class ReturnOut(BaseModel):
    id: int
    orderId: int
    userId: int
    reason: str
    description: Optional[str] = None
    rejectReason: Optional[str] = None
    refundAmount: Optional[float] = None
    status: str
    reviewedAt: Optional[datetime] = None
    gatewayRefundStatus: Optional[str] = None
    gatewayRefundTransactionId: Optional[str] = None
    gatewayRefundedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    user: Optional[UserShort] = None
    order: Optional[OrderShort] = None
    reviewedBy: Optional[UserShort] = None
    items: List[ReturnItemOut] = Field(default_factory=list)
    evidences: List[ReturnEvidenceOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}
