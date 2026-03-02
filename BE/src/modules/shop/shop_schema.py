from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ShopBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ShopCreate(ShopBase):
    owner_id: int

class ShopUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None

class ShopInDB(ShopBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
class ShopOut(ShopBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
