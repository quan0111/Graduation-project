from datetime import datetime

from fastapi import HTTPException

from src.core.database import prisma
from src.modules.audit.audit_service import AuditService
from src.modules.inventory.inventory_service import InventoryService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


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

RETURNABLE_ORDER_STATUSES = {"DELIVERED", "COMPLETED"}  # COD and prepaid orders can be returned
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
    async def _active_return_quantities(client, order_id: int):
        returns = await client.returnrequest.find_many(
            where={"orderId": order_id},
            include={"items": True},
        )
        quantities: dict[int, int] = {}
        for return_request in returns:
            if ReturnService._to_value(return_request.status) not in ACTIVE_RETURN_STATUSES:
                continue
            for item in return_request.items:
                quantities[item.orderItemId] = quantities.get(item.orderItemId, 0) + int(item.quantity or 0)
        return quantities

    @staticmethod
    async def _is_order_fully_covered_by_returns(client, order_id: int):
        order_items = await client.orderitem.find_many(
            where={"orderId": order_id, "deletedAt": None},
        )
        if not order_items:
            return False
        returned_quantities = await ReturnService._active_return_quantities(client, order_id)
        return all(
            returned_quantities.get(item.id, 0) >= int(item.quantity or 0)
            for item in order_items
        )

    @staticmethod
    async def _assert_single_shop_return(client, order, requested_items):
        order_items = await client.orderitem.find_many(
            where={"orderId": order.id, "deletedAt": None},
        )
        item_by_id = {item.id: item for item in order_items}
        active_quantities = await ReturnService._active_return_quantities(client, order.id)
        shop_ids = set()

        for requested in requested_items:
            order_item = item_by_id.get(requested.orderItemId)
            if not order_item:
                raise HTTPException(404, "Order item not found")
            remaining = int(order_item.quantity or 0) - active_quantities.get(order_item.id, 0)
            if requested.quantity > remaining:
                raise HTTPException(400, "Return quantity exceeds remaining returnable quantity")
            shop_ids.add(order_item.shopId)

        if len(shop_ids) > 1:
            raise HTTPException(400, "Create one return request per shop")

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
                },
            )
            if not order:
                raise HTTPException(404, "Order not found")
            if ReturnService._to_value(order.status) not in RETURNABLE_ORDER_STATUSES:
                raise HTTPException(400, "Only delivered or completed orders can be returned")

            await ReturnService._assert_single_shop_return(tx, order, data.items)

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
            if await ReturnService._is_order_fully_covered_by_returns(tx, data.orderId):
                await tx.order.update(
                    where={"id": data.orderId},
                    data={"status": "RETURN_REQUESTED"},
                )

        await ReturnService._notify_return_update(return_request.id, "REQUESTED", actor_id=user_id)
        await AuditService.create(
            actor_id=user_id,
            action="RETURN.REQUESTED",
            entity_type="ReturnRequest",
            entity_id=return_request.id,
            target_user_id=user_id,
            severity="INFO",
            metadata={"orderId": data.orderId},
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

        await ReturnService._notify_return_update(return_id, data.status, actor_id=admin_id)
        await AuditService.create(
            actor_id=admin_id,
            action=f"RETURN.{data.status}",
            entity_type="ReturnRequest",
            entity_id=return_id,
            target_user_id=updated.userId,
            severity="INFO" if data.status == "APPROVED" else "WARNING",
            metadata={"rejectReason": data.rejectReason},
        )
        return updated

    @staticmethod
    async def mark_picked_up(return_id: int, seller_id: int):
        shop = await ReturnService._get_seller_shop(seller_id)
        async with prisma.tx() as tx:
            return_request = await ReturnService._get_seller_return_for_update(tx, return_id, shop.id)
            if ReturnService._to_value(return_request.status) != "APPROVED":
                raise HTTPException(400, "Return must be approved before pickup")
            updated = await tx.returnrequest.update(
                where={"id": return_id},
                data={"status": "PICKED_UP"},
                include=RETURN_INCLUDE,
            )

        await ReturnService._notify_return_update(return_id, "PICKED_UP", actor_id=seller_id)
        await AuditService.create(
            actor_id=seller_id,
            action="RETURN.PICKED_UP",
            entity_type="ReturnRequest",
            entity_id=return_id,
            target_user_id=updated.userId,
            severity="INFO",
            metadata={"shopId": shop.id},
        )
        return updated

    @staticmethod
    async def mark_received(return_id: int, seller_id: int):
        shop = await ReturnService._get_seller_shop(seller_id)
        async with prisma.tx() as tx:
            return_request = await ReturnService._get_seller_return_for_update(tx, return_id, shop.id)
            if ReturnService._to_value(return_request.status) not in {"APPROVED", "PICKED_UP"}:
                raise HTTPException(400, "Return must be approved before seller receives items")

            await ReturnService._restore_return_stock(tx, return_request, seller_id)
            updated = await tx.returnrequest.update(
                where={"id": return_id},
                data={"status": "RECEIVED"},
                include=RETURN_INCLUDE,
            )

        await ReturnService._notify_return_update(return_id, "RECEIVED", actor_id=seller_id)
        await AuditService.create(
            actor_id=seller_id,
            action="RETURN.RECEIVED",
            entity_type="ReturnRequest",
            entity_id=return_id,
            target_user_id=updated.userId,
            severity="INFO",
            metadata={"shopId": shop.id},
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
            current_status = ReturnService._to_value(return_request.status)
            if current_status == "REQUESTED":
                raise HTTPException(400, "Admin must approve this return before seller refunds")
            if current_status in {"APPROVED", "PICKED_UP"}:
                raise HTTPException(400, "Seller must confirm returned items before refunding")
            if current_status != "RECEIVED":
                raise HTTPException(400, "Return is not ready to refund")
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

            order = await tx.order.find_unique(
                where={"id": return_request.orderId},
                include={"payment": True},
            )
            if order and order.payment:
                payment_method = ReturnService._to_value(order.payment.method)
                payment_status = ReturnService._to_value(order.payment.status)
                if payment_method in {"MOMO", "VNPAY", "STRIPE"} and payment_status == "SUCCESS":
                    raise HTTPException(400, "Gateway refund is required before marking this return as refunded")

            for item in seller_items:
                await tx.platformcommission.update_many(
                    where={"orderItemId": item.orderItemId},
                    data={
                        "status": "REFUNDED",
                        "note": f"Refunded by seller for return request #{return_id}",
                    },
                )

            if await ReturnService._is_order_fully_covered_by_returns(tx, return_request.orderId):
                await tx.order.update(
                    where={"id": return_request.orderId},
                    data={"status": "RETURNED"},
                )
            updated = await tx.returnrequest.update(
                where={"id": return_id},
                data={"status": "REFUNDED"},
                include=RETURN_INCLUDE,
            )
        await ReturnService._notify_return_update(return_id, "REFUNDED", actor_id=seller_id)
        await AuditService.create(
            actor_id=seller_id,
            action="RETURN.REFUNDED",
            entity_type="ReturnRequest",
            entity_id=return_id,
            target_user_id=updated.userId,
            severity="INFO",
            metadata={"shopId": shop.id, "refundAmount": updated.refundAmount},
        )
        return updated

    @staticmethod
    async def _get_seller_return_for_update(client, return_id: int, shop_id: int):
        return_request = await client.returnrequest.find_unique(
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
        if not return_request.items:
            raise HTTPException(400, "Return request has no items")
        seller_items = [
            item
            for item in return_request.items
            if item.orderItem and item.orderItem.shopId == shop_id
        ]
        if not seller_items:
            raise HTTPException(403, "Return request does not belong to your shop")
        if len(seller_items) != len(return_request.items):
            raise HTTPException(400, "Return request contains items from another shop")
        return return_request

    @staticmethod
    async def _restore_return_stock(client, return_request, actor_id: int):
        for item in return_request.items:
            order_item = item.orderItem
            if not order_item or not order_item.variantId:
                continue
            variant = await client.productvariant.find_unique(where={"id": order_item.variantId})
            if not variant:
                continue
            stock_before = variant.stock or 0
            stock_after = stock_before + item.quantity
            await client.productvariant.update(
                where={"id": variant.id},
                data={"stock": stock_after},
            )
            await InventoryService.record(
                client,
                {
                    "shopId": order_item.shopId,
                    "productId": order_item.productId,
                    "variantId": order_item.variantId,
                    "orderId": return_request.orderId,
                    "returnRequestId": return_request.id,
                    "actorId": actor_id,
                    "type": "RETURN_RESTORE",
                    "quantityChange": item.quantity,
                    "stockBefore": stock_before,
                    "stockAfter": stock_after,
                    "reason": "Restore stock after seller received returned item",
                    "metadata": {"orderItemId": order_item.id, "productName": order_item.productName},
                },
            )

    @staticmethod
    async def _notify_return_update(return_id: int, status: str, actor_id: int | None = None):
        try:
            return_request = await prisma.returnrequest.find_unique(
                where={"id": return_id},
                include={
                    "items": {"include": {"orderItem": {"include": {"shop": True}}}},
                    "order": True,
                },
            )
            if not return_request:
                return None
            recipients = {return_request.userId}
            for item in return_request.items:
                if item.orderItem and item.orderItem.shop and item.orderItem.shop.ownerId:
                    recipients.add(item.orderItem.shop.ownerId)
            if actor_id is not None:
                recipients.discard(actor_id)
            notification_type = "REFUND_UPDATE" if status == "REFUNDED" else "RETURN_UPDATE"
            for user_id in recipients:
                await NotificationService.create(
                    NotificationCreate(
                        userId=user_id,
                        title="Cập nhật đổi trả/hoàn tiền",
                        content=f"Yêu cầu đổi trả #{return_id} của đơn #{return_request.orderId} đang ở trạng thái {status}.",
                        type=notification_type,
                        metadata={"returnId": return_id, "orderId": return_request.orderId, "status": status},
                    )
                )
        except Exception:
            return None

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
