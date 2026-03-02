from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AddressBase(BaseModel):
    fullName: str
    phone: str
    addressLine: str
    ward: Optional[str] = None
    district: str
    province: str
    country: Optional[str] = "Vietnam"
    postalCode: Optional[str] = None
    isDefault: Optional[bool] = False


class AddressCreate(AddressBase):
    userId: int


class AddressUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    addressLine: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    isDefault: Optional[bool] = None


class AddressOut(AddressBase):
    id: int
    userId: int
    createdAt: datetime

    class Config:
        from_attributes = True

class AddressInDB(AddressOut):
    updatedAt: datetime
    deletedAt: Optional[datetime] = None

    class Config:
        from_attributes = True