from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class AdminUserUpdate(BaseModel):
    isActive: Optional[bool] = None
    role: Optional[str] = None


class OrderFilter(BaseModel):
    status: Optional[str] = None
    userId: Optional[int] = None
    shopId: Optional[int] = None


class SellerFilter(BaseModel):
    isActive: Optional[bool] = None
    isVerified: Optional[bool] = None

class Pagination(BaseModel):
    page: int = 1
    limit: int = 10
    search: Optional[str] = None


class DashboardStats(BaseModel):
    totalUsers: int
    totalOrders: int
    totalProducts: int
    totalShops: int
    totalRevenue: float


class AdminAccountCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None


class AdminAccountOut(BaseModel):
    id: int
    email: EmailStr
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    role: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
