

from pydantic import BaseModel, Field
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str
    slug: str
    parentId: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    parentId: Optional[int] = None


class CategoryInDB(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class CategoryOut(CategoryBase):
    id: int
    parent: Optional["CategoryOut"] = None
    children: Optional[List["CategoryOut"]] = Field(default_factory=list)

    class Config:
        from_attributes = True


CategoryOut.model_rebuild()

