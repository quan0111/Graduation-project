from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ProductViolationRequest(BaseModel):
    status: str = "BANNED"
    violationType: Optional[str] = None
    reason: str = Field(..., min_length=3)
    adminNote: Optional[str] = None


class SellerAppealRequest(BaseModel):
    sellerNote: str = Field(..., min_length=5)
    evidence: Optional[List[Dict[str, Any]]] = None


class ResolveModerationCaseRequest(BaseModel):
    decision: str = Field(..., pattern="^(RESTORE|UPHOLD|CLOSE)$")
    adminNote: Optional[str] = None


class ProductModerationCaseOut(BaseModel):
    id: int
    productId: int
    sellerId: Optional[int] = None
    status: str
    violationType: Optional[str] = None
    reason: str
    adminNote: Optional[str] = None
    sellerNote: Optional[str] = None
    evidence: Optional[List[Dict[str, Any]]] = None
    reviewedById: Optional[int] = None
    resolvedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}
