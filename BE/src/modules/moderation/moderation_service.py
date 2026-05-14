from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import HTTPException

from src.core.database import prisma
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


class ModerationService:
    PRODUCT_STATUS_ALLOWED = {"BANNED", "REJECT"}

    @staticmethod
    async def report_product_violation(
        product_id: int,
        admin_id: int,
        status: str,
        reason: str,
        violation_type: Optional[str] = None,
        admin_note: Optional[str] = None,
    ):
        status = status.upper()
        if status not in ModerationService.PRODUCT_STATUS_ALLOWED:
            raise HTTPException(400, "Violation status must be BANNED or REJECT")

        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"shop": True},
        )
        if not product or product.deletedAt:
            raise HTTPException(404, "Product not found")

        seller_id = product.shop.ownerId if product.shop else None
        async with prisma.tx() as tx:
            await tx.product.update(where={"id": product_id}, data={"status": status})
            case = await tx.productmoderationcase.create(
                data={
                    "productId": product_id,
                    "sellerId": seller_id,
                    "status": "OPEN",
                    "violationType": violation_type,
                    "reason": reason,
                    "adminNote": admin_note,
                    "reviewedById": admin_id,
                }
            )

        if seller_id:
            await NotificationService.create(
                NotificationCreate(
                    userId=seller_id,
                    title="Sản phẩm cần xử lý vi phạm",
                    content=(
                        f"Sản phẩm '{product.name}' đã bị chuyển sang trạng thái {status}. "
                        f"Lý do: {reason}. Bạn có thể gửi bằng chứng/giải trình từ Kênh người bán."
                    ),
                    type="PRODUCT_BANNED",
                    metadata={
                        "productId": product_id,
                        "caseId": case.id,
                        "status": status,
                        "reason": reason,
                        "violationType": violation_type,
                    },
                )
            )

        await AuditService.create(
            actor_id=admin_id,
            action="PRODUCT.MODERATION_CREATED",
            entity_type="Product",
            entity_id=product_id,
            target_user_id=seller_id,
            severity="WARNING",
            metadata={
                "caseId": case.id,
                "status": status,
                "reason": reason,
                "violationType": violation_type,
                "adminNote": admin_note,
            },
        )
        return case

    @staticmethod
    async def seller_submit_appeal(product_id: int, seller_user_id: int, seller_note: str, evidence: Optional[list[Dict[str, Any]]] = None):
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"shop": True},
        )
        if not product or product.deletedAt:
            raise HTTPException(404, "Product not found")
        if not product.shop or product.shop.ownerId != seller_user_id:
            raise HTTPException(403, "Forbidden")

        case = await prisma.productmoderationcase.find_first(
            where={
                "productId": product_id,
                "status": {"in": ["OPEN", "SELLER_SUBMITTED", "UNDER_REVIEW"]},
            },
            order={"createdAt": "desc"},
        )
        if not case:
            case = await prisma.productmoderationcase.create(
                data={
                    "productId": product_id,
                    "sellerId": seller_user_id,
                    "status": "SELLER_SUBMITTED",
                    "reason": "Seller yêu cầu xem xét lại sản phẩm bị khóa/từ chối.",
                    "sellerNote": seller_note,
                    "evidence": evidence or [],
                }
            )
        else:
            case = await prisma.productmoderationcase.update(
                where={"id": case.id},
                data={
                    "status": "SELLER_SUBMITTED",
                    "sellerNote": seller_note,
                    "evidence": evidence or [],
                },
            )

        await AuditService.create(
            actor_id=seller_user_id,
            action="PRODUCT.MODERATION_APPEAL_SUBMITTED",
            entity_type="ProductModerationCase",
            entity_id=case.id,
            severity="INFO",
            metadata={"productId": product_id, "evidenceCount": len(evidence or [])},
        )
        return case

    @staticmethod
    async def list_cases(status: Optional[str] = None, product_id: Optional[int] = None, seller_id: Optional[int] = None, limit: int = 100):
        where: Dict[str, Any] = {}
        if status:
            where["status"] = status
        if product_id is not None:
            where["productId"] = product_id
        if seller_id is not None:
            where["sellerId"] = seller_id

        return await prisma.productmoderationcase.find_many(
            where=where,
            include={"product": {"include": {"shop": True, "images": True}}, "seller": True, "reviewedBy": True},
            order={"createdAt": "desc"},
            take=max(1, min(limit, 300)),
        )

    @staticmethod
    async def resolve_case(case_id: int, admin_id: int, decision: str, admin_note: Optional[str] = None):
        case = await prisma.productmoderationcase.find_unique(
            where={"id": case_id},
            include={"product": {"include": {"shop": True}}},
        )
        if not case:
            raise HTTPException(404, "Moderation case not found")

        decision = decision.upper()
        if decision == "RESTORE":
            case_status = "APPROVED_RESTORED"
            product_status = "ACTIVE"
        elif decision == "UPHOLD":
            case_status = "REJECTED_UPHELD"
            product_status = case.product.status.value if case.product and hasattr(case.product.status, "value") else str(case.product.status if case.product else "BANNED")
        elif decision == "CLOSE":
            case_status = "CLOSED"
            product_status = None
        else:
            raise HTTPException(400, "Invalid moderation decision")

        async with prisma.tx() as tx:
            if product_status:
                await tx.product.update(where={"id": case.productId}, data={"status": product_status})
            updated = await tx.productmoderationcase.update(
                where={"id": case_id},
                data={
                    "status": case_status,
                    "adminNote": admin_note,
                    "reviewedById": admin_id,
                    "resolvedAt": datetime.utcnow(),
                },
            )

        seller_id = case.sellerId or (case.product.shop.ownerId if case.product and case.product.shop else None)
        if seller_id:
            await NotificationService.create(
                NotificationCreate(
                    userId=seller_id,
                    title="Kết quả xem xét sản phẩm",
                    content=(
                        "Sản phẩm của bạn đã được khôi phục."
                        if decision == "RESTORE"
                        else f"Yêu cầu xem xét sản phẩm chưa được chấp thuận. {admin_note or ''}".strip()
                    ),
                    type="PRODUCT_BANNED",
                    metadata={"caseId": case_id, "decision": decision, "productId": case.productId},
                )
            )

        await AuditService.create(
            actor_id=admin_id,
            action="PRODUCT.MODERATION_RESOLVED",
            entity_type="ProductModerationCase",
            entity_id=case_id,
            target_user_id=seller_id,
            severity="INFO",
            metadata={"decision": decision, "adminNote": admin_note, "productId": case.productId},
        )
        return updated
