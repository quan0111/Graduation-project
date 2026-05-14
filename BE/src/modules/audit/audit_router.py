from fastapi import APIRouter, Depends

from src.core.dependencies import require_admin
from src.modules.audit.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit"])


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
