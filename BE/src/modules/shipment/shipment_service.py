from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.audit.audit_service import AuditService


TRACKING_ORDER_STATUSES = {
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RETURN_TO_SENDER",
}

SHIPMENT_TRANSITIONS = {
    "READY_TO_SHIP": {"SHIPPED"},
    "SHIPPED": {"IN_TRANSIT"},
    "IN_TRANSIT": {"OUT_FOR_DELIVERY", "DELIVERY_FAILED"},
    "OUT_FOR_DELIVERY": {"DELIVERED", "DELIVERY_FAILED"},
    "DELIVERY_FAILED": {"RETURN_TO_SENDER"},
}

TRACKING_LOCKED_STATUSES = {
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RETURN_TO_SENDER",
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
        if next_status not in SHIPMENT_TRANSITIONS.get(current_status, set()):
            raise HTTPException(
                400,
                f"Invalid shipment transition: {current_status} -> {next_status}",
            )

    @staticmethod
    def _assert_tracking_editable(current_status: str, current_record, update_data: dict):
        if current_status not in TRACKING_LOCKED_STATUSES:
            return

        for field in ("carrier", "trackingNumber"):
            if field not in update_data:
                continue
            current_value = getattr(current_record, field, None) or ""
            next_value = update_data.get(field) or ""
            if next_value != current_value:
                raise HTTPException(400, "Tracking cannot be edited after shipment is handed over")

    @staticmethod
    def _assert_handover_info(current_record, update_data: dict):
        carrier = update_data.get("carrier") if "carrier" in update_data else getattr(current_record, "carrier", None)
        tracking_number = (
            update_data.get("trackingNumber")
            if "trackingNumber" in update_data
            else getattr(current_record, "trackingNumber", None)
        )
        if not str(carrier or "").strip() or not str(tracking_number or "").strip():
            raise HTTPException(400, "Carrier and tracking number are required before shipment handover")

    @staticmethod
    def _normalize_next_status(current_status: str, status: str | None):
        if not status:
            return None

        next_status = ShipmentService._normalize_status(status)
        if next_status == current_status:
            if current_status in TRACKING_LOCKED_STATUSES:
                raise HTTPException(400, f"Shipment is already {current_status}")
            return None

        ShipmentService._assert_status_transition(current_status, next_status)
        return next_status

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

        if get_role_value(current_user) != "SELLER":
            raise HTTPException(403, "Forbidden")

        shop = await ShipmentService._get_seller_shop(current_user.id)
        if not any(item.shopId == shop.id for item in order.items):
            raise HTTPException(403, "Forbidden")

        return order

    @staticmethod
    async def _assert_mutation_access(order_id: int, current_user):
        if get_role_value(current_user) != "SELLER":
            raise HTTPException(403, "Only sellers can update tracking")

        shop = await ShipmentService._get_seller_shop(current_user.id)
        order = await ShipmentService._get_order_with_items(order_id)

        visible_items = [item for item in order.items if item.shopId == shop.id]
        if not visible_items:
            raise HTTPException(403, "Forbidden")

        distinct_shop_ids = {item.shopId for item in order.items}
        return order, shop, len(distinct_shop_ids) > 1

    @staticmethod
    async def _sync_package_order_status(order_id: int):
        from src.modules.order.order_service import OrderService

        await OrderService._sync_order_status_from_packages(prisma, order_id)

    @staticmethod
    async def _get_shop_package(order_id: int, shop_id: int):
        package = await prisma.ordershoppackage.find_first(
            where={"orderId": order_id, "shopId": shop_id},
        )
        if not package:
            package = await prisma.ordershoppackage.create(
                data={
                    "order": {"connect": {"id": order_id}},
                    "shop": {"connect": {"id": shop_id}},
                    "status": "PENDING",
                }
            )
        return package

    @staticmethod
    async def create_shipment(current_user, data):
        order, shop, is_multi_shop = await ShipmentService._assert_mutation_access(data.orderId, current_user)
        order_status = ShipmentService._to_value(order.status)

        if order_status not in {"PENDING", "PAID", "CONFIRMED", "PROCESSING", "READY_TO_SHIP"}:
            raise HTTPException(400, "Order cannot be arranged for pickup from current status")

        payment = await prisma.payment.find_unique(where={"orderId": data.orderId})
        payment_method = ShipmentService._to_value(payment.method) if payment else "COD"
        if payment and payment_method != "COD" and order_status not in {"PAID", "CONFIRMED", "PROCESSING", "READY_TO_SHIP"}:
            raise HTTPException(400, "Only paid online orders can be arranged for pickup")

        if is_multi_shop:
            package = await ShipmentService._get_shop_package(data.orderId, shop.id)
            if ShipmentService._to_value(package.status) not in {"PENDING", "PAID", "CONFIRMED", "PROCESSING", "READY_TO_SHIP"}:
                raise HTTPException(400, "Shop package cannot be arranged for pickup from current status")
            updated_package = await prisma.ordershoppackage.update(
                where={"id": package.id},
                data={
                    "carrier": data.carrier,
                    "trackingNumber": data.trackingNumber,
                    "status": "READY_TO_SHIP",
                },
            )
            await ShipmentService._sync_package_order_status(data.orderId)
            await AuditService.create(
                actor_id=current_user.id,
                action="SHIPMENT.PACKAGE_CREATED",
                entity_type="OrderShopPackage",
                entity_id=updated_package.id,
                target_user_id=order.userId,
                severity="INFO",
                metadata={"orderId": data.orderId, "shopId": shop.id, "status": "READY_TO_SHIP"},
            )
            return updated_package

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
        await prisma.ordershoppackage.update_many(
            where={"orderId": data.orderId, "shopId": shop.id},
            data={
                "carrier": data.carrier,
                "trackingNumber": data.trackingNumber,
                "status": "READY_TO_SHIP",
            },
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
        order = await ShipmentService._assert_view_access(order_id, current_user)

        shipment = await prisma.shipment.find_unique(where={"orderId": order_id})
        if shipment:
            return shipment

        if get_role_value(current_user) == "SELLER":
            shop = await ShipmentService._get_seller_shop(current_user.id)
            package = await prisma.ordershoppackage.find_first(
                where={"orderId": order_id, "shopId": shop.id},
            )
            if package and (package.carrier or package.trackingNumber):
                return package

        _ = order
        raise HTTPException(404, "Shipment not found")

    @staticmethod
    async def update_shipment(order_id: int, current_user, data):
        order, shop, is_multi_shop = await ShipmentService._assert_mutation_access(order_id, current_user)

        if is_multi_shop:
            package = await ShipmentService._get_shop_package(order_id, shop.id)
            update_data = data.model_dump(exclude_unset=True)
            status = update_data.get("status")
            current_status = ShipmentService._normalize_status(ShipmentService._to_value(package.status))
            ShipmentService._assert_tracking_editable(current_status, package, update_data)

            status = ShipmentService._normalize_next_status(current_status, status)
            if status:
                update_data["status"] = status
            else:
                update_data.pop("status", None)

            if status == "SHIPPED":
                ShipmentService._assert_handover_info(package, update_data)
                update_data["shippedAt"] = datetime.utcnow()

            if status == "DELIVERED":
                update_data["deliveredAt"] = datetime.utcnow()

            if not update_data:
                return package

            updated_package = await prisma.ordershoppackage.update(
                where={"id": package.id},
                data=update_data,
            )
            if status:
                await ShipmentService._sync_package_order_status(order_id)
                await AuditService.create(
                    actor_id=current_user.id,
                    action="SHIPMENT.PACKAGE_STATUS_UPDATED",
                    entity_type="OrderShopPackage",
                    entity_id=updated_package.id,
                    target_user_id=order.userId,
                    severity="INFO",
                    metadata={"orderId": order_id, "shopId": shop.id, "status": status},
                )
            return updated_package

        shipment = await prisma.shipment.find_unique(where={"orderId": order_id})
        if not shipment:
            raise HTTPException(404, "Shipment not found")

        update_data = data.model_dump(exclude_unset=True)
        status = update_data.get("status")
        current_status = ShipmentService._normalize_status(ShipmentService._to_value(shipment.status))
        ShipmentService._assert_tracking_editable(current_status, shipment, update_data)

        status = ShipmentService._normalize_next_status(current_status, status)
        if status:
            update_data["status"] = status
        else:
            update_data.pop("status", None)

        if status == "SHIPPED":
            ShipmentService._assert_handover_info(shipment, update_data)
            update_data["shippedAt"] = datetime.utcnow()

        if status == "DELIVERED":
            update_data["deliveredAt"] = datetime.utcnow()

        if not update_data:
            return shipment

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
            package_update_data = {
                key: value
                for key, value in {
                    "carrier": update_data.get("carrier"),
                    "trackingNumber": update_data.get("trackingNumber"),
                    "status": status,
                    "shippedAt": update_data.get("shippedAt"),
                    "deliveredAt": update_data.get("deliveredAt"),
                }.items()
                if value is not None
            }
            await prisma.ordershoppackage.update_many(
                where={"orderId": order_id, "shopId": shop.id},
                data=package_update_data,
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

        if shipment:
            return shipment

        package = await prisma.ordershoppackage.find_first(
            where={"trackingNumber": tracking_number}
        )
        if package:
            return package

        raise HTTPException(404, "Tracking not found")

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
