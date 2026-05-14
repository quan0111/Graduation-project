from fastapi import HTTPException

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


class SupportService:
    INCLUDE = {
        "user": True,
        "shop": True,
        "messages": {"include": {"sender": True}},
    }

    @staticmethod
    async def _get_seller_shop(user_id: int):
        shop = await prisma.shop.find_first(where={"ownerId": user_id, "deletedAt": None})
        if not shop:
            raise HTTPException(404, "Shop not found")
        return shop

    @staticmethod
    async def _assert_access(ticket, user):
        role = get_role_value(user)
        if role == "ADMIN" or ticket.userId == user.id:
            return
        if role == "SELLER":
            shop = await SupportService._get_seller_shop(user.id)
            if ticket.shopId == shop.id:
                return
        raise HTTPException(403, "Forbidden")

    @staticmethod
    async def create_ticket(user_id: int, data):
        if data.shopId:
            shop = await prisma.shop.find_first(where={"id": data.shopId, "deletedAt": None})
            if not shop:
                raise HTTPException(404, "Shop not found")
        if data.orderId:
            order = await prisma.order.find_first(where={"id": data.orderId, "userId": user_id, "deletedAt": None})
            if not order:
                raise HTTPException(404, "Order not found")
        if data.returnRequestId:
            return_request = await prisma.returnrequest.find_first(where={"id": data.returnRequestId, "userId": user_id})
            if not return_request:
                raise HTTPException(404, "Return request not found")

        async with prisma.tx() as tx:
            ticket = await tx.supportticket.create(
                data={
                    "userId": user_id,
                    "shopId": data.shopId,
                    "orderId": data.orderId,
                    "returnRequestId": data.returnRequestId,
                    "subject": data.subject,
                    "category": data.category or "GENERAL",
                    "priority": data.priority,
                    "status": "OPEN",
                    "messages": {
                        "create": [
                            {
                                "senderId": user_id,
                                "senderRole": "CUSTOMER",
                                "message": data.message,
                            }
                        ]
                    },
                },
                include=SupportService.INCLUDE,
            )

        await SupportService._notify_counterpart(ticket, "SUPPORT_TICKET.CREATED", user_id)
        await AuditService.create(
            actor_id=user_id,
            action="SUPPORT.TICKET_CREATED",
            entity_type="SupportTicket",
            entity_id=ticket.id,
            severity="INFO",
            metadata={"shopId": data.shopId, "orderId": data.orderId, "returnRequestId": data.returnRequestId},
        )
        return ticket

    @staticmethod
    async def list_for_user(user_id: int):
        return await prisma.supportticket.find_many(
            where={"userId": user_id},
            include=SupportService.INCLUDE,
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def list_for_seller(user_id: int):
        shop = await SupportService._get_seller_shop(user_id)
        return await prisma.supportticket.find_many(
            where={"shopId": shop.id},
            include=SupportService.INCLUDE,
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def list_for_admin(status: str | None = None, limit: int = 100):
        where = {}
        if status:
            where["status"] = status
        return await prisma.supportticket.find_many(
            where=where,
            include=SupportService.INCLUDE,
            order={"createdAt": "desc"},
            take=max(1, min(limit, 300)),
        )

    @staticmethod
    async def get_detail(ticket_id: int, user):
        ticket = await prisma.supportticket.find_unique(where={"id": ticket_id}, include=SupportService.INCLUDE)
        if not ticket:
            raise HTTPException(404, "Ticket not found")
        await SupportService._assert_access(ticket, user)
        return ticket

    @staticmethod
    async def add_message(ticket_id: int, user, data):
        ticket = await prisma.supportticket.find_unique(where={"id": ticket_id})
        if not ticket:
            raise HTTPException(404, "Ticket not found")
        await SupportService._assert_access(ticket, user)

        role = get_role_value(user)
        sender_role = "ADMIN" if role == "ADMIN" else "SELLER" if role == "SELLER" else "CUSTOMER"
        next_status = "WAITING_CUSTOMER" if sender_role in {"ADMIN", "SELLER"} else "WAITING_SELLER"

        async with prisma.tx() as tx:
            message = await tx.supportmessage.create(
                data={
                    "ticketId": ticket_id,
                    "senderId": user.id,
                    "senderRole": sender_role,
                    "message": data.message,
                    "attachmentUrl": data.attachmentUrl,
                }
            )
            await tx.supportticket.update(where={"id": ticket_id}, data={"status": next_status})

        full_ticket = await prisma.supportticket.find_unique(where={"id": ticket_id}, include=SupportService.INCLUDE)
        await SupportService._notify_counterpart(full_ticket, "SUPPORT_TICKET.MESSAGE", user.id)
        return message

    @staticmethod
    async def update_ticket(ticket_id: int, user, data):
        ticket = await prisma.supportticket.find_unique(where={"id": ticket_id})
        if not ticket:
            raise HTTPException(404, "Ticket not found")
        if get_role_value(user) != "ADMIN":
            await SupportService._assert_access(ticket, user)

        update_data = data.model_dump(exclude_unset=True, exclude_none=True)
        updated = await prisma.supportticket.update(
            where={"id": ticket_id},
            data=update_data,
            include=SupportService.INCLUDE,
        )
        await AuditService.create(
            actor_id=user.id,
            action="SUPPORT.TICKET_UPDATED",
            entity_type="SupportTicket",
            entity_id=ticket_id,
            target_user_id=ticket.userId,
            severity="INFO",
            metadata=update_data,
        )
        return updated

    @staticmethod
    async def _notify_counterpart(ticket, event: str, actor_id: int):
        if not ticket:
            return
        recipients = set()
        if ticket.userId != actor_id:
            recipients.add(ticket.userId)
        if ticket.shopId:
            shop = await prisma.shop.find_unique(where={"id": ticket.shopId})
            if shop and shop.ownerId != actor_id:
                recipients.add(shop.ownerId)
        if ticket.assignedAdminId and ticket.assignedAdminId != actor_id:
            recipients.add(ticket.assignedAdminId)

        for user_id in recipients:
            await NotificationService.create(
                NotificationCreate(
                    userId=user_id,
                    title="Cập nhật ticket hỗ trợ",
                    content=f"Ticket #{ticket.id} - {ticket.subject} vừa có cập nhật mới.",
                    type="SUPPORT_TICKET",
                    metadata={"ticketId": ticket.id, "event": event},
                )
            )
