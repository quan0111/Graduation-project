from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


class SecurityService:
    BEHAVIOR_WINDOW_MINUTES = 10
    FAILED_LOGIN_WINDOW_MINUTES = 15
    EVENT_BURST_THRESHOLD = 120
    ADD_TO_CART_THRESHOLD = 40
    DISTINCT_PRODUCT_THRESHOLD = 60
    FAILED_LOGIN_THRESHOLD = 8

    @staticmethod
    def _json_safe(value):
        if hasattr(value, "model_dump"):
            return value.model_dump()
        if isinstance(value, dict):
            return {str(key): SecurityService._json_safe(item) for key, item in value.items()}
        if isinstance(value, (list, tuple, set)):
            return [SecurityService._json_safe(item) for item in value]
        if hasattr(value, "value"):
            return value.value
        return value

    @staticmethod
    async def inspect_behavior(user_id: int):
        since = datetime.now(timezone.utc) - timedelta(minutes=SecurityService.BEHAVIOR_WINDOW_MINUTES)
        behaviors = await prisma.userbehavior.find_many(
            where={"userId": user_id, "deletedAt": None, "createdAt": {"gte": since}},
            order={"createdAt": "desc"},
            take=250,
        )
        if not behaviors:
            return None

        action_counts: Dict[str, int] = {}
        product_ids = set()
        for behavior in behaviors:
            action = behavior.action.value if hasattr(behavior.action, "value") else str(behavior.action)
            action_counts[action] = action_counts.get(action, 0) + 1
            product_ids.add(behavior.productId)

        reasons = []
        if len(behaviors) >= SecurityService.EVENT_BURST_THRESHOLD:
            reasons.append(f"{len(behaviors)} hành vi trong {SecurityService.BEHAVIOR_WINDOW_MINUTES} phút")
        if action_counts.get("ADD_TO_CART", 0) >= SecurityService.ADD_TO_CART_THRESHOLD:
            reasons.append(f"{action_counts['ADD_TO_CART']} lần thêm giỏ hàng trong thời gian ngắn")
        if len(product_ids) >= SecurityService.DISTINCT_PRODUCT_THRESHOLD:
            reasons.append(f"tương tác {len(product_ids)} sản phẩm khác nhau trong thời gian ngắn")

        if not reasons:
            return None

        return await SecurityService.flag_user(
            user_id=user_id,
            reason="Phát hiện hành vi bất thường: " + "; ".join(reasons),
            severity="CRITICAL",
            action_taken="AUTO_LOCK_USER",
            metadata={
                "actionCounts": action_counts,
                "distinctProductCount": len(product_ids),
                "windowMinutes": SecurityService.BEHAVIOR_WINDOW_MINUTES,
            },
            auto_lock=True,
        )

    @staticmethod
    async def record_failed_login(
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        scope: str = "storefront",
    ):
        user = await prisma.user.find_unique(where={"email": email})
        await AuditService.create(
            action="AUTH.LOGIN_FAILED",
            entity_type="User",
            entity_id=user.id if user else None,
            target_user_id=user.id if user else None,
            severity="WARNING",
            metadata={"email": email, "scope": scope},
            ip_address=ip_address,
            user_agent=user_agent,
        )

        if not user or not user.isActive:
            return None

        since = datetime.now(timezone.utc) - timedelta(minutes=SecurityService.FAILED_LOGIN_WINDOW_MINUTES)
        attempts = await prisma.auditlog.count(
            where={
                "action": "AUTH.LOGIN_FAILED",
                "targetUserId": user.id,
                "createdAt": {"gte": since},
            }
        )
        if attempts < SecurityService.FAILED_LOGIN_THRESHOLD:
            return None

        return await SecurityService.flag_user(
            user_id=user.id,
            reason=f"{attempts} lần đăng nhập sai trong {SecurityService.FAILED_LOGIN_WINDOW_MINUTES} phút",
            severity="CRITICAL",
            action_taken="AUTO_LOCK_USER",
            metadata={"failedLoginCount": attempts, "scope": scope},
            auto_lock=True,
        )

    @staticmethod
    async def flag_user(
        user_id: int,
        reason: str,
        severity: str = "WARNING",
        action_taken: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        auto_lock: bool = False,
    ):
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user or user.deletedAt:
            return None

        open_duplicate = await prisma.securityincident.find_first(
            where={
                "userId": user_id,
                "status": "OPEN",
                "reason": reason,
            }
        )
        if open_duplicate:
            return open_duplicate

        async with prisma.tx() as tx:
            incident = await tx.securityincident.create(
                data={
                    "userId": user_id,
                    "reason": reason,
                    "severity": severity,
                    "actionTaken": action_taken,
                    **({"metadata": Json(SecurityService._json_safe(metadata))} if metadata is not None else {}),
                }
            )
            if auto_lock and user.isActive:
                await tx.user.update(where={"id": user_id}, data={"isActive": False})

        if auto_lock and user.isActive:
            await NotificationService.create(
                NotificationCreate(
                    userId=user_id,
                    title="Tài khoản tạm thời bị khóa",
                    content=f"Hệ thống phát hiện dấu hiệu bất thường: {reason}. Vui lòng liên hệ hỗ trợ nếu đây là nhầm lẫn.",
                    type="SYSTEM",
                    metadata={"incidentId": incident.id, "reason": reason},
                )
            )

        await AuditService.create(
            action="SECURITY.USER_FLAGGED",
            entity_type="SecurityIncident",
            entity_id=incident.id,
            target_user_id=user_id,
            severity=severity,
            metadata={"reason": reason, "actionTaken": action_taken, **(metadata or {})},
        )
        return incident

    @staticmethod
    async def list_incidents(status: Optional[str] = None, user_id: Optional[int] = None, limit: int = 100):
        where: Dict[str, Any] = {}
        if status:
            where["status"] = status
        if user_id is not None:
            where["userId"] = user_id

        return await prisma.securityincident.find_many(
            where=where,
            include={"user": True, "resolvedBy": True},
            order={"detectedAt": "desc"},
            take=max(1, min(limit, 300)),
        )

    @staticmethod
    async def resolve_incident(
        incident_id: int,
        admin_id: int,
        status: str = "RESOLVED",
        resolution_note: Optional[str] = None,
        unlock_user: bool = False,
    ):
        if status not in {"RESOLVED", "DISMISSED"}:
            raise HTTPException(400, "Incident status must be RESOLVED or DISMISSED")

        incident = await prisma.securityincident.find_unique(where={"id": incident_id})
        if not incident:
            raise HTTPException(404, "Security incident not found")

        async with prisma.tx() as tx:
            updated = await tx.securityincident.update(
                where={"id": incident_id},
                data={
                    "status": status,
                    "resolvedAt": datetime.utcnow(),
                    "resolvedById": admin_id,
                    "resolutionNote": resolution_note,
                },
            )
            if unlock_user:
                await tx.user.update(where={"id": incident.userId}, data={"isActive": True})

        await AuditService.create(
            actor_id=admin_id,
            action="SECURITY.INCIDENT_RESOLVED",
            entity_type="SecurityIncident",
            entity_id=incident_id,
            target_user_id=incident.userId,
            severity="INFO",
            metadata={"status": status, "unlockUser": unlock_user, "resolutionNote": resolution_note},
        )
        return updated
