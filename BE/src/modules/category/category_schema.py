from pydantic import BaseModel
from typing import Optional, List, ForwardRef



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
    children: List["CategoryOut"] = []

    class Config:
        from_attributes = True


# Fix forward reference
CategoryOut.model_rebuild()