from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
class UserBase(BaseModel):
    email: EmailStr
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None
    password: Optional[str] = None

class AddressShort(BaseModel):
    id: int
    addressLine: str
    district: str
    province: str
    model_config = {"from_attributes": True}


class CartShort(BaseModel):
    id: int
    model_config = {"from_attributes": True}


class OrderShort(BaseModel):
    id: int
    totalAmount: float
    createdAt: datetime

    model_config = {"from_attributes": True}
class UserInDB(UserBase):
    id: int
    role: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    deletedAt: Optional[datetime] = None
    password: str

    model_config = {"from_attributes": True}
class UserOut(UserBase):
    id: int
    role: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    addresses: List[AddressShort] = Field(default_factory=list)
    cart: Optional[CartShort] = None
    orders: List[OrderShort] = Field(default_factory=list)

    model_config = {"from_attributes": True}