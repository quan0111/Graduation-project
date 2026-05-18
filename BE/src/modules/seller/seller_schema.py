from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    NEED_MORE_INFO = "NEED_MORE_INFO"


class SellerApplicationCreate(BaseModel):
    shopName: str
    shopSlug: Optional[str] = None
    description: Optional[str] = None

    logoUrl: Optional[str] = None
    coverUrl: Optional[str] = None

    businessPhone: Optional[str] = None
    businessEmail: Optional[str] = None
    taxCode: Optional[str] = None
    identityFullName: Optional[str] = None
    identityNumber: Optional[str] = None
    identityFrontUrl: Optional[str] = None
    identityBackUrl: Optional[str] = None
    shippingOptions: Optional[Dict[str, Any]] = None
    taxInfo: Optional[Dict[str, Any]] = None

    addressLine: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None


class SellerApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    note: Optional[str] = None


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class ShopShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SellerApplicationOut(BaseModel):
    id: int
    userId: int

    shopName: str
    shopSlug: Optional[str] = None
    description: Optional[str] = None

    logoUrl: Optional[str] = None
    coverUrl: Optional[str] = None

    businessPhone: Optional[str] = None
    businessEmail: Optional[str] = None
    taxCode: Optional[str] = None
    identityFullName: Optional[str] = None
    identityNumber: Optional[str] = None
    identityFrontUrl: Optional[str] = None
    identityBackUrl: Optional[str] = None
    shippingOptions: Optional[Dict[str, Any]] = None
    taxInfo: Optional[Dict[str, Any]] = None

    addressLine: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None

    status: ApplicationStatus
    note: Optional[str] = None

    reviewedById: Optional[int] = None
    reviewedAt: Optional[datetime] = None

    createdAt: datetime
    updatedAt: datetime

    user: Optional[UserShort] = None
    shop: Optional[ShopShort] = None
    reviewedBy: Optional[UserShort] = None

    model_config = {"from_attributes": True}
