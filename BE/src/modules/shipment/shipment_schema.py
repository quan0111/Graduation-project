from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShipmentCreate(BaseModel):
    orderId: int
    carrier: Optional[str] = None
    trackingNumber: Optional[str] = None

class ShipmentUpdate(BaseModel):
    status: Optional[str] = None
    trackingNumber: Optional[str] = None
    carrier: Optional[str] = None
    shippedAt: Optional[datetime] = None
    deliveredAt: Optional[datetime] = None

class ShipmentOut(BaseModel):
    id: int
    orderId: int
    carrier: Optional[str]
    trackingNumber: Optional[str]
    status: str
    shippedAt: Optional[datetime]
    deliveredAt: Optional[datetime]

    class Config:
        from_attributes = True