from fastapi import HTTPException
from src.core.database import prisma


class ReturnService:

    @staticmethod
    async def create_request(user_id: int, data):

        order = await prisma.order.find_unique(
            where={"id": data.orderId}
        )
        if not order:
            raise HTTPException(404, "Order not found")

        if order.userId != user_id:
            raise HTTPException(403, "Not your order")

        existing = await prisma.returnrequest.find_first(
            where={"orderId": data.orderId}
        )
        if existing:
            raise HTTPException(400, "Return already exists")

        return await prisma.returnrequest.create(
            data={
                "reason": data.reason,
                "status": "PENDING",

                # 🔥 RELATION
                "order": {
                    "connect": {"id": data.orderId}
                },
                "user": {
                    "connect": {"id": user_id}
                }
            }
        )

    @staticmethod
    async def add_item(return_id: int, data):

        order_item = await prisma.orderitem.find_unique(
            where={"id": data.orderItemId}
        )
        if not order_item:
            raise HTTPException(404, "Order item not found")

        return await prisma.returnitem.create(
            data={
                "quantity": data.quantity,
                "refundAmount": order_item.price * data.quantity,

                # 🔥 RELATION
                "returnRequest": {
                    "connect": {"id": return_id}
                },
                "orderItem": {
                    "connect": {"id": data.orderItemId}
                }
            }
        )
    @staticmethod
    async def add_evidence(return_id: int, data):

        return await prisma.returnevidence.create(
            data={
                "imageUrl": data.imageUrl,
                "returnRequest": {
                    "connect": {"id": return_id}
                }
            }
        )
    @staticmethod
    async def review(return_id: int, admin_id: int, status: str):

        return await prisma.returnrequest.update(
            where={"id": return_id},
            data={
                "status": status,
                "reviewedBy": {
                    "connect": {"id": admin_id}
                }
            }
        )

    @staticmethod
    async def get_detail(return_id: int):

        data = await prisma.returnrequest.find_unique(
            where={"id": return_id},
            include={
                "user": True,
                "order": True,
                "items": {
                    "include": {
                        "orderItem": True
                    }
                },
                "evidences": True
            }
        )

        if not data:
            raise HTTPException(404, "Return not found")

        return data

    @staticmethod
    async def get_by_user(user_id: int):
        return await prisma.returnrequest.find_many(
            where={"userId": user_id},
            include={
                "items": True,
                "evidences": True
            },
            order={"createdAt": "desc"}
        )