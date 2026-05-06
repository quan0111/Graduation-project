from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AddressBase(BaseModel):
    fullName: str
    phone: str = Field(min_length=9, max_length=15)

    addressLine: str
    ward: Optional[str] = None
    district: str
    province: str

    country: Optional[str] = "Vietnam"
    postalCode: Optional[str] = None

    isDefault: Optional[bool] = False

class AddressCreate(AddressBase):
    pass  


class AddressUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    addressLine: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    isDefault: Optional[bool] = None


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}

class AddressOut(AddressBase):
    id: int
    userId: int
    createdAt: datetime

    # 🔥 relationship
    user: Optional[UserShort] = None

    model_config = {"from_attributes": True}

class AddressInDB(AddressOut):
    updatedAt: datetime
    deletedAt: Optional[datetime] = None

    model_config = {"from_attributes": True}