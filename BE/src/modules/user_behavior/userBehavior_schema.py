from pydantic import BaseModel
from typing import Optional, Dict, Any


class BehaviorCreate(BaseModel):
    userId: int
    productId: int
    action: str
    sessionId: Optional[str] = None
    duration: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class BehaviorOut(BaseModel):
    id: int
    userId: int
    productId: int
    action: str
    sessionId: Optional[str]
    duration: Optional[int]
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True