from typing import Optional

from pydantic import BaseModel
from datetime import datetime
class UserShort(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class ShopShort(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ShopFollowerOut(BaseModel):
    id: int
    userId: int
    shopId: int
    createdAt: datetime

    user: Optional[UserShort] = None
    shop: Optional[ShopShort] = None

    class Config:
        from_attributes = True