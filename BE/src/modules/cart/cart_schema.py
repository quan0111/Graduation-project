from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class addtocart(BaseModel):
    userId: int
    productId: int
    variantId: Optional[int] = None
    quantity: int = Field(..., ge=1)