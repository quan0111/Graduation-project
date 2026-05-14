from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: int
    actorId: Optional[int] = None
    targetUserId: Optional[int] = None
    action: str
    entityType: str
    entityId: Optional[int] = None
    severity: str
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    createdAt: datetime

    model_config = {"from_attributes": True}


class AuditLogFilter(BaseModel):
    action: Optional[str] = None
    entityType: Optional[str] = None
    entityId: Optional[int] = None
    actorId: Optional[int] = None
    targetUserId: Optional[int] = None
    severity: Optional[str] = None
    limit: int = 100
