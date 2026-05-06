from fastapi import HTTPException
from datetime import datetime
from src.core.database import prisma


class ShipmentService:


    @staticmethod
    async def create_shipment(data):

        existing = await prisma.shipment.find_unique(
            where={"orderId": data.orderId}
        )

        if existing:
            raise HTTPException(400, "Shipment already exists")

        order = await prisma.order.find_unique(
            where={"id": data.orderId}
        )
        if not order:
            raise HTTPException(404, "Order not found")

        return await prisma.shipment.create(
            data={
                "orderId": data.orderId,
                "carrier": data.carrier,
                "trackingNumber": data.trackingNumber,
                "status": "READY_TO_SHIP"
            }
        )

    @staticmethod
    async def get_shipment(order_id: int):
        shipment = await prisma.shipment.find_unique(
            where={"orderId": order_id}
        )

        if not shipment:
            raise HTTPException(404, "Shipment not found")

        return shipment

    @staticmethod
    async def update_shipment(order_id: int, data):

        shipment = await prisma.shipment.find_unique(
            where={"orderId": order_id}
        )

        if not shipment:
            raise HTTPException(404, "Shipment not found")

        update_data = data.dict(exclude_unset=True)

        # auto set timestamps
        if update_data.get("status") == "SHIPPED":
            update_data["shippedAt"] = datetime.utcnow()

        if update_data.get("status") == "DELIVERED":
            update_data["deliveredAt"] = datetime.utcnow()

        return await prisma.shipment.update(
            where={"orderId": order_id},
            data=update_data
        )

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
        return await prisma.shipment.find_many(
            include={"order": True}
        )