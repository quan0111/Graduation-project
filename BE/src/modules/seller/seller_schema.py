from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SellerApplicationCreate(BaseModel):
    shopName: str
    description: Optional[str] = None


class SellerApplicationUpdate(BaseModel):
    status: str  



class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class ShopShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SellerApplicationOut(BaseModel):
    id: int
    userId: int
    shopName: str
    description: Optional[str]
    status: str
    createdAt: datetime

    # 🔥 relationship
    user: Optional[UserShort] = None
    shop: Optional[ShopShort] = None
    reviewedBy: Optional[UserShort] = None

    model_config = {"from_attributes": True}