from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    userId: int
    productId: int
    rating: int
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class ProductShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class ReviewOut(BaseModel):
    id: int

    userId: int
    productId: int

    rating: int
    comment: Optional[str]
    isVerifiedPurchase: bool

    createdAt: datetime

    user: Optional[UserShort] = None
    product: Optional[ProductShort] = None

    model_config = {"from_attributes": True}