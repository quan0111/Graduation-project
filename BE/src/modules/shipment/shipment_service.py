from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.modules.audit.audit_service import AuditService


TRACKING_ORDER_STATUSES = {
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "DELIVERED",
}

SHIPMENT_TRANSITIONS = {
    "READY_TO_SHIP": {"SHIPPED"},
    "SHIPPED": {"IN_TRANSIT"},
    "IN_TRANSIT": {"DELIVERED"},
}


class ShipmentService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _normalize_status(status: str) -> str:
        normalized = status.upper()
        if normalized not in TRACKING_ORDER_STATUSES:
            raise HTTPException(400, "Invalid shipment status")
        return normalized

    @staticmethod
    def _assert_status_transition(current_status: str, next_status: str):
        if current_status == next_status:
            return
        if next_status not in SHIPMENT_TRANSITIONS.get(current_status, set()):
            raise HTTPException(
                400,
                f"Invalid shipment transition: {current_status} -> {next_status}",
            )

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
    async def _get_order_with_items(order_id: int):
        order = await prisma.order.find_first(
            where={
                "id": order_id,
                "deletedAt": None,
            },
            include={
                "items": {
                    "where": {"deletedAt": None},
                }
            },
        )

        if not order:
            raise HTTPException(404, "Order not found")

        return order

    @staticmethod
    async def _assert_view_access(order_id: int, current_user):
        order = await ShipmentService._get_order_with_items(order_id)

        if order.userId == current_user.id:
            return order

        if current_user.role != "SELLER":
            raise HTTPException(403, "Forbidden")

        shop = await ShipmentService._get_seller_shop(current_user.id)
        if not any(item.shopId == shop.id for item in order.items):
            raise HTTPException(403, "Forbidden")

        return order

    @staticmethod
    async def _assert_mutation_access(order_id: int, current_user):
        if current_user.role != "SELLER":
            raise HTTPException(403, "Only sellers can update tracking")

        shop = await ShipmentService._get_seller_shop(current_user.id)
        order = await ShipmentService._get_order_with_items(order_id)

        visible_items = [item for item in order.items if item.shopId == shop.id]
        if not visible_items:
            raise HTTPException(403, "Forbidden")

        distinct_shop_ids = {item.shopId for item in order.items}
        if len(distinct_shop_ids) > 1:
            raise HTTPException(
                409,
                "Order has items from multiple shops. Split shipment by shop before editing tracking.",
            )

        return order

    @staticmethod
    async def create_shipment(current_user, data):
        order = await ShipmentService._assert_mutation_access(data.orderId, current_user)
        order_status = ShipmentService._to_value(order.status)

        if order_status not in {"PENDING", "PAID", "CONFIRMED", "PROCESSING", "READY_TO_SHIP"}:
            raise HTTPException(400, "Order cannot be arranged for pickup from current status")

        payment = await prisma.payment.find_unique(where={"orderId": data.orderId})
        payment_method = ShipmentService._to_value(payment.method) if payment else "COD"
        if payment and payment_method != "COD" and order_status not in {"PAID", "CONFIRMED", "PROCESSING", "READY_TO_SHIP"}:
            raise HTTPException(400, "Only paid online orders can be arranged for pickup")

        existing = await prisma.shipment.find_unique(where={"orderId": data.orderId})
        if existing:
            raise HTTPException(400, "Shipment already exists")

        shipment = await prisma.shipment.create(
            data={
                "orderId": data.orderId,
                "carrier": data.carrier,
                "trackingNumber": data.trackingNumber,
                "status": "READY_TO_SHIP",
            }
        )
        await prisma.shipmentevent.create(
            data={
                "shipment": {"connect": {"id": shipment.id}},
                "order": {"connect": {"id": data.orderId}},
                "status": "READY_TO_SHIP",
                "message": "Shipment created",
            }
        )

        await prisma.order.update(
            where={"id": data.orderId},
            data={"status": "READY_TO_SHIP"},
        )

        await AuditService.create(
            actor_id=current_user.id,
            action="SHIPMENT.CREATED",
            entity_type="Order",
            entity_id=data.orderId,
            target_user_id=order.userId,
            severity="INFO",
            metadata={"shipmentId": shipment.id, "status": "READY_TO_SHIP"},
        )

        return shipment

    @staticmethod
    async def get_shipment(order_id: int, current_user):
        await ShipmentService._assert_view_access(order_id, current_user)

        shipment = await prisma.shipment.find_unique(where={"orderId": order_id})
        if not shipment:
            raise HTTPException(404, "Shipment not found")

        return shipment

    @staticmethod
    async def update_shipment(order_id: int, current_user, data):
        order = await ShipmentService._assert_mutation_access(order_id, current_user)

        shipment = await prisma.shipment.find_unique(where={"orderId": order_id})
        if not shipment:
            raise HTTPException(404, "Shipment not found")

        update_data = data.model_dump(exclude_unset=True)
        status = update_data.get("status")
        current_status = ShipmentService._normalize_status(shipment.status)

        if status:
            status = ShipmentService._normalize_status(status)
            ShipmentService._assert_status_transition(current_status, status)
            update_data["status"] = status

        if status == "SHIPPED":
            update_data["shippedAt"] = datetime.utcnow()

        if status == "DELIVERED":
            update_data["deliveredAt"] = datetime.utcnow()

        updated = await prisma.shipment.update(
            where={"orderId": order_id},
            data=update_data,
        )
        if status:
            await prisma.shipmentevent.create(
                data={
                    "shipment": {"connect": {"id": updated.id}},
                    "order": {"connect": {"id": order_id}},
                    "status": status,
                    "message": f"Shipment status changed to {status}",
                }
            )

        if status in TRACKING_ORDER_STATUSES:
            await prisma.order.update(
                where={"id": order_id},
                data={"status": status},
            )

        if status:
            await AuditService.create(
                actor_id=current_user.id,
                action="SHIPMENT.STATUS_UPDATED",
                entity_type="Order",
                entity_id=order_id,
                target_user_id=order.userId,
                severity="INFO",
                metadata={"status": status, "shipmentId": updated.id},
            )

        return updated

    @staticmethod
    async def track_shipment(tracking_number: str):
        shipment = await prisma.shipment.find_first(
            where={"trackingNumber": tracking_number}
        )

        if not shipment:
            raise HTTPException(404, "Tracking not found")

        return shipment

    @staticmethod
    async def get_all_shipments():
        return await prisma.shipment.find_many(include={"order": True})

    @staticmethod
    async def get_events(order_id: int, current_user):
        await ShipmentService._assert_view_access(order_id, current_user)
        return await prisma.shipmentevent.find_many(
            where={"orderId": order_id},
            order={"occurredAt": "desc"},
        )
