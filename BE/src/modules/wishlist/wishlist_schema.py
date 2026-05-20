from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.modules.product.product_schema import ProductOut


class WishlistOut(BaseModel):
    id: int
    userId: int
    productId: int
    createdAt: datetime
    product: Optional[ProductOut] = None

    model_config = {"from_attributes": True}
