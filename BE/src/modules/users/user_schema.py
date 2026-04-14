from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


# ✅ Enum cho role
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SELLER = "SELLER"
    CUSTOMER = "CUSTOMER"


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


# 🔹 In DB (internal only)
class UserInDB(UserBase):
    id: int
    role: UserRole
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    deletedAt: Optional[datetime] = None
    password: str  # chỉ dùng nội bộ

    model_config = {
        "from_attributes": True
    }


# 🔹 Response trả ra ngoài
class UserOut(UserBase):
    id: int
    role: UserRole
    isActive: bool
    createdAt: datetime

    model_config = {
        "from_attributes": True
    }