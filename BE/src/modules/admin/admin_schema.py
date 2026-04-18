from pydantic import BaseModel
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