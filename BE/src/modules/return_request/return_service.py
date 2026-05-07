from datetime import datetime

from fastapi import HTTPException

from src.core.database import prisma


RETURN_INCLUDE = {
    "user": True,
    "reviewedBy": True,
    "order": True,
    "items": {
        "include": {
            "orderItem": True,
        }
    },
    "evidences": True,
}

RETURNABLE_ORDER_STATUSES = {"DELIVERED", "COMPLETED"}
ACTIVE_RETURN_STATUSES = {"REQUESTED", "APPROVED", "PICKED_UP", "RECEIVED", "REFUNDED"}


class ReturnService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    async def _get_seller_shop(user_id: int):
        shop = await prisma.shop.find_first(
            where={
                "ownerId": user_id,
                "deletedAt": None,
            }
        )
        if not shop:
            raise HTTPException(404, "Shop not found")
        return shop

    @staticmethod
    async def _assert_editable_return(client, return_id: int, user_id: int):
        return_request = await client.returnrequest.find_unique(
            where={"id": return_id},
            include={"order": True},
        )
        if not return_request:
            raise HTTPException(404, "Return not found")
        if return_request.userId != user_id:
            raise HTTPException(403, "Forbidden")
        if ReturnService._to_value(return_request.status) != "REQUESTED":
            raise HTTPException(400, "Return request can no longer be edited")
        return return_request

    @staticmethod
    async def _sync_refund_amount(client, return_id: int):
        items = await client.returnitem.find_many(where={"returnRequestId": return_id})
        refund_amount = sum(float(item.refundAmount or 0) for item in items)
        await client.returnrequest.update(
            where={"id": return_id},
            data={"refundAmount": refund_amount},
        )
        return refund_amount

    @staticmethod
    async def _create_item(client, return_request, data):
        order_item = await client.orderitem.find_first(
            where={
                "id": data.orderItemId,
                "orderId": return_request.orderId,
                "deletedAt": None,
            }
        )
        if not order_item:
            raise HTTPException(404, "Order item not found")
        if data.quantity > order_item.quantity:
            raise HTTPException(400, "Return quantity exceeds ordered quantity")

        existing_item = await client.returnitem.find_first(
            where={
                "returnRequestId": return_request.id,
                "orderItemId": data.orderItemId,
            }
        )
        if existing_item:
            raise HTTPException(400, "Order item already added to this return")

        return await client.returnitem.create(
            data={
                "quantity": data.quantity,
                "refundAmount": float(order_item.price) * data.quantity,
                "returnRequest": {"connect": {"id": return_request.id}},
                "orderItem": {"connect": {"id": data.orderItemId}},
            }
        )

    @staticmethod
    async def _create_evidence(client, return_id: int, data):
        return await client.returnevidence.create(
            data={
                "imageUrl": data.imageUrl,
                "returnRequest": {"connect": {"id": return_id}},
            }
        )

    @staticmethod
    async def create_request(user_id: int, data):
        if not data.items:
            raise HTTPException(400, "Return request must include at least one item")

        async with prisma.tx() as tx:
            order = await tx.order.find_first(
                where={
                    "id": data.orderId,
                    "userId": user_id,
                    "deletedAt": None,
                }
            )
            if not order:
                raise HTTPException(404, "Order not found")
            if ReturnService._to_value(order.status) not in RETURNABLE_ORDER_STATUSES:
                raise HTTPException(400, "Only delivered or completed orders can be returned")

            existing_returns = await tx.returnrequest.find_many(
                where={"orderId": data.orderId}
            )
            for existing in existing_returns:
                if ReturnService._to_value(existing.status) in ACTIVE_RETURN_STATUSES:
                    raise HTTPException(400, "Return request already exists for this order")

            return_request = await tx.returnrequest.create(
                data={
                    "reason": data.reason,
                    "description": data.description,
                    "status": "REQUESTED",
                    "order": {"connect": {"id": data.orderId}},
                    "user": {"connect": {"id": user_id}},
                }
            )

            for item_data in data.items:
                await ReturnService._create_item(tx, return_request, item_data)
            for evidence_data in data.evidences:
                await ReturnService._create_evidence(tx, return_request.id, evidence_data)

            await ReturnService._sync_refund_amount(tx, return_request.id)
            await tx.order.update(
                where={"id": data.orderId},
                data={"status": "RETURN_REQUESTED"},
            )

        return await ReturnService.get_detail(return_request.id)

    @staticmethod
    async def add_item(return_id: int, user_id: int, data):
        async with prisma.tx() as tx:
            return_request = await ReturnService._assert_editable_return(tx, return_id, user_id)
            created = await ReturnService._create_item(tx, return_request, data)
            await ReturnService._sync_refund_amount(tx, return_id)
            return created

    @staticmethod
    async def add_evidence(return_id: int, user_id: int, data):
        async with prisma.tx() as tx:
            await ReturnService._assert_editable_return(tx, return_id, user_id)
            return await ReturnService._create_evidence(tx, return_id, data)

    @staticmethod
    async def review(return_id: int, admin_id: int, data):
        async with prisma.tx() as tx:
            return_request = await tx.returnrequest.find_unique(
                where={"id": return_id},
                include={"items": True},
            )
            if not return_request:
                raise HTTPException(404, "Return not found")
            if ReturnService._to_value(return_request.status) != "REQUESTED":
                raise HTTPException(400, "Only requested returns can be reviewed")
            if not return_request.items:
                raise HTTPException(400, "Return request has no items")

            update_data = {
                "status": data.status,
                "rejectReason": data.rejectReason if data.status == "REJECTED" else None,
                "reviewedAt": datetime.utcnow(),
                "reviewedBy": {"connect": {"id": admin_id}},
            }
            if data.status == "REJECTED":
                await tx.order.update(
                    where={"id": return_request.orderId},
                    data={"status": "COMPLETED"},
                )

            updated = await tx.returnrequest.update(
                where={"id": return_id},
                data=update_data,
                include=RETURN_INCLUDE,
            )

            return updated

    @staticmethod
    async def mark_refunded(return_id: int, seller_id: int):
        shop = await ReturnService._get_seller_shop(seller_id)

        async with prisma.tx() as tx:
            return_request = await tx.returnrequest.find_unique(
                where={"id": return_id},
                include={
                    "items": {
                        "include": {
                            "orderItem": True,
                        }
                    }
                },
            )
            if not return_request:
                raise HTTPException(404, "Return not found")
            if ReturnService._to_value(return_request.status) != "APPROVED":
                raise HTTPException(400, "Admin must approve this return before seller refunds")
            if not return_request.items:
                raise HTTPException(400, "Return request has no items")

            seller_items = [
                item
                for item in return_request.items
                if item.orderItem and item.orderItem.shopId == shop.id
            ]
            if not seller_items:
                raise HTTPException(403, "Return request does not belong to your shop")
            if len(seller_items) != len(return_request.items):
                raise HTTPException(400, "Return request contains items from another shop")

            for item in seller_items:
                await tx.platformcommission.update_many(
                    where={"orderItemId": item.orderItemId},
                    data={
                        "status": "REFUNDED",
                        "note": f"Refunded by seller for return request #{return_id}",
                    },
                )

            await tx.order.update(
                where={"id": return_request.orderId},
                data={"status": "RETURNED"},
            )
            updated = await tx.returnrequest.update(
                where={"id": return_id},
                data={"status": "REFUNDED"},
                include=RETURN_INCLUDE,
            )
            return updated

    @staticmethod
    async def get_detail(return_id: int):
        data = await prisma.returnrequest.find_unique(
            where={"id": return_id},
            include=RETURN_INCLUDE,
        )
        if not data:
            raise HTTPException(404, "Return not found")
        return data

    @staticmethod
    async def get_by_user(user_id: int):
        return await prisma.returnrequest.find_many(
            where={"userId": user_id},
            include=RETURN_INCLUDE,
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_all():
        return await prisma.returnrequest.find_many(
            include=RETURN_INCLUDE,
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_by_seller(seller_id: int):
        shop = await ReturnService._get_seller_shop(seller_id)
        returns = await prisma.returnrequest.find_many(
            include=RETURN_INCLUDE,
            order={"createdAt": "desc"},
        )
        return [
            return_request
            for return_request in returns
            if any(
                item.orderItem and item.orderItem.shopId == shop.id
                for item in return_request.items
            )
        ]
