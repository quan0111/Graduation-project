from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ShopBase(BaseModel):
    name: str
    slug: Optional[str] = None
    avatarUrl: Optional[str] = None
    description: Optional[str] = None


class ShopCreate(ShopBase):
    ownerId: int


class ShopUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    avatarUrl: Optional[str] = None
    description: Optional[str] = None
    ownerId: Optional[int] = None
    isActive: Optional[bool] = None

class OwnerOut(BaseModel):
    id: int
    fullName: Optional[str] = None
    email: str

    class Config:
        from_attributes = True


class ShopInDB(ShopBase):
    id: int
    ownerId: int

    class Config:
        from_attributes = True


class ShopOut(ShopBase):
    id: int
    ownerId: int
    isActive: bool = True

    owner: Optional[OwnerOut] = None
    productCount: int = 0

    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True
