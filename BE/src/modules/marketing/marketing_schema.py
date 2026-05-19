from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BannerCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    imageUrl: str
    mobileImageUrl: Optional[str] = None
    redirectUrl: Optional[str] = None
    buttonText: Optional[str] = None
    position: str = "HOME_TOP"
    status: str = "DRAFT"
    priority: int = 0
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    imageUrl: Optional[str] = None
    mobileImageUrl: Optional[str] = None
    redirectUrl: Optional[str] = None
    buttonText: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None


class BannerTrackingCreate(BaseModel):
    bannerId: int
    action: str = "CLICK"


class UserShort(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class BannerOut(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    imageUrl: str
    mobileImageUrl: Optional[str] = None
    redirectUrl: Optional[str] = None
    buttonText: Optional[str] = None
    position: str
    status: str
    priority: int
    startAt: Optional[datetime] = None
    endAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    createdBy: Optional[UserShort] = None

    model_config = {"from_attributes": True}


class BannerTrackingOut(BaseModel):
    id: int
    bannerId: int
    action: str
    createdAt: datetime

    model_config = {"from_attributes": True}
