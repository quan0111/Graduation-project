from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProductShort(BaseModel):
    id: int
    name: str
    price: float

    model_config = {"from_attributes": True}


class WishlistOut(BaseModel):
    id: int
    userId: int
    productId: int
    createdAt: datetime
    product: Optional[ProductShort] = None

    model_config = {"from_attributes": True}
