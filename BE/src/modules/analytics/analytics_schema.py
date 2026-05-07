from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel


class BehaviorType(str, Enum):
    VIEW = "VIEW"
    CLICK = "CLICK"
    ADD_TO_CART = "ADD_TO_CART"
    PURCHASE = "PURCHASE"


class BehaviorCreate(BaseModel):
    userId: int
    productId: int
    action: BehaviorType
    sessionId: Optional[str] = None
    duration: Optional[int] = None
    metadata: Optional[Dict] = None


class BehaviorTrackPayload(BaseModel):
    productId: int
    action: BehaviorType
    sessionId: Optional[str] = None
    duration: Optional[int] = None
    metadata: Optional[Dict] = None


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class ProductShort(BaseModel):
    id: int
    name: str
    price: float

    model_config = {"from_attributes": True}


class BehaviorOut(BaseModel):
    id: int
    userId: int
    productId: int
    action: BehaviorType
    createdAt: datetime
    user: Optional[UserShort] = None
    product: Optional[ProductShort] = None

    model_config = {"from_attributes": True}


class ProductAnalytics(BaseModel):
    productId: int
    views: int
    clicks: int
    addToCart: int
    purchases: int


class UserAnalytics(BaseModel):
    userId: int
    totalViews: int
    totalClicks: int
