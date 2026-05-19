from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from src.core.dependencies import get_optional_current_user, require_admin
from src.modules.audit.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit"])


class ClientAuditEvent(BaseModel):
    action: str
    entityType: str = "ClientEvent"
    entityId: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


@router.get("/logs")
async def list_audit_logs(
    action: str | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    actor_id: int | None = None,
    target_user_id: int | None = None,
    severity: str | None = None,
    limit: int = 100,
    admin=Depends(require_admin),
):
    _ = admin
    return await AuditService.list_logs(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        target_user_id=target_user_id,
        severity=severity,
        limit=limit,
    )


@router.post("/track")
async def track_client_event(
    data: ClientAuditEvent,
    request: Request,
    user=Depends(get_optional_current_user),
):
    if not user:
        raise HTTPException(401, "Authentication required")
    await AuditService.create(
        actor_id=user.id,
        action=data.action,
        entity_type=data.entityType,
        entity_id=data.entityId,
        metadata=data.metadata,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"ok": True}
