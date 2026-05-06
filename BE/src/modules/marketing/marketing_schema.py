from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BannerCreate(BaseModel):
    title: str
    imageUrl: str
    link: Optional[str] = None
    shopId: Optional[int] = None
    categoryId: Optional[int] = None



class BannerUpdate(BaseModel):
    isActive: Optional[bool] = None
    title: Optional[str] = None
    imageUrl: Optional[str] = None
    link: Optional[str] = None


class BannerTrackingCreate(BaseModel):
    bannerId: int



class ShopShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class CategoryShort(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}




class BannerOut(BaseModel):
    id: int
    title: str
    imageUrl: str
    link: Optional[str]
    isActive: bool
    createdAt: datetime

    # 🔥 relationship
    shop: Optional[ShopShort] = None
    category: Optional[CategoryShort] = None
    createdBy: Optional[UserShort] = None

    model_config = {"from_attributes": True}


class BannerTrackingOut(BaseModel):
    id: int
    bannerId: int
    createdAt: datetime

    model_config = {"from_attributes": True}