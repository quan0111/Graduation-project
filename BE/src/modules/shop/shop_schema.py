from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ShopBase(BaseModel):
    name: str
    slug: str
    avatarUrl: Optional[str] = None
    description: Optional[str] = None
class ShopCreate(ShopBase):
    ownerId: int


class ShopUpdate(ShopBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None

class ShopInDB(ShopBase):
    id: int
    ownerId: int
    class Config:
        from_attributes = True
class ShopOut(ShopBase):
    id: int
    ownerId: int
    class Config:
        from_attributes = True
