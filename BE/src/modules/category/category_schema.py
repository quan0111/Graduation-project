from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(CategoryBase):
    pass
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryInDB(CategoryBase):
    id: int
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True
class CategoryOut(CategoryBase):
    id: int
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True