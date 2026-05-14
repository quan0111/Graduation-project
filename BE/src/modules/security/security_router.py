from fastapi import APIRouter, Depends

from src.core.dependencies import require_admin
from src.modules.security.security_schema import ResolveIncidentRequest
from src.modules.security.security_service import SecurityService

router = APIRouter(prefix="/security", tags=["Security"])


@router.get("/incidents")
async def list_incidents(
    status: str | None = None,
    user_id: int | None = None,
    limit: int = 100,
    admin=Depends(require_admin),
):
    _ = admin
    return await SecurityService.list_incidents(status=status, user_id=user_id, limit=limit)


@router.patch("/incidents/{incident_id}/resolve")
async def resolve_incident(
    incident_id: int,
    body: ResolveIncidentRequest,
    admin=Depends(require_admin),
):
    return await SecurityService.resolve_incident(
        incident_id=incident_id,
        admin_id=admin.id,
        status=body.status,
        resolution_note=body.resolutionNote,
        unlock_user=body.unlockUser,
    )
