from typing import Any, Dict, Optional

from src.core.database import prisma


class AuditService:
    @staticmethod
    async def create(
        action: str,
        entity_type: str,
        actor_id: Optional[int] = None,
        entity_id: Optional[int] = None,
        target_user_id: Optional[int] = None,
        severity: str = "INFO",
        metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ):
        try:
            return await prisma.auditlog.create(
                data={
                    "actorId": actor_id,
                    "targetUserId": target_user_id,
                    "action": action,
                    "entityType": entity_type,
                    "entityId": entity_id,
                    "severity": severity,
                    "ipAddress": ip_address,
                    "userAgent": user_agent,
                    "metadata": metadata,
                }
            )
        except Exception:
            # Audit logging must never break the business action.
            return None

    @staticmethod
    async def list_logs(
        action: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        actor_id: Optional[int] = None,
        target_user_id: Optional[int] = None,
        severity: Optional[str] = None,
        limit: int = 100,
    ):
        where: Dict[str, Any] = {}
        if action:
            where["action"] = action
        if entity_type:
            where["entityType"] = entity_type
        if entity_id is not None:
            where["entityId"] = entity_id
        if actor_id is not None:
            where["actorId"] = actor_id
        if target_user_id is not None:
            where["targetUserId"] = target_user_id
        if severity:
            where["severity"] = severity

        return await prisma.auditlog.find_many(
            where=where,
            include={"actor": True, "targetUser": True},
            order={"createdAt": "desc"},
            take=max(1, min(limit, 300)),
        )
