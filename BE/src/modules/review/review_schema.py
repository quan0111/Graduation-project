from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReviewCreate(BaseModel):
    userId: int
    productId: int
    rating: int
    comment: Optional[str] = None
    mediaUrls: List[str] = []

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class ReviewReplyCreate(BaseModel):
    content: str


class ReviewMediaOut(BaseModel):
    id: int
    reviewId: int
    url: str
    type: str
    position: int
    createdAt: datetime

    model_config = {"from_attributes": True}


class ReviewReplyOut(BaseModel):
    id: int
    reviewId: int
    sellerId: int
    content: str
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}


class UserShort(BaseModel):
    id: int
    fullName: Optional[str] = None

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
    media: List[ReviewMediaOut] = []
    replies: List[ReviewReplyOut] = []

    model_config = {"from_attributes": True}
