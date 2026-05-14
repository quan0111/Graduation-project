from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class SecurityIncidentOut(BaseModel):
    id: int
    userId: int
    severity: str
    reason: str
    status: str
    actionTaken: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    detectedAt: datetime
    resolvedAt: Optional[datetime] = None
    resolvedById: Optional[int] = None
    resolutionNote: Optional[str] = None

    model_config = {"from_attributes": True}


class ResolveIncidentRequest(BaseModel):
    status: str = "RESOLVED"
    resolutionNote: Optional[str] = None
    unlockUser: bool = False
