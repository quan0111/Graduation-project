from fastapi import HTTPException
from src.core.database import prisma
from src.modules.order.order_schema import OrderCreate, OrderUpdate
from datetime import datetime

class OrderService:
    @staticmethod
    async def create_order(order_data: OrderCreate):
        async with prisma.tx() as tx:
            if not order_data.items:
                raise HTTPException(400, "Order must have items")
            subtotal = 0
            order_items_data = []
            for item in order_data.items:
                variant = None
                if item.variantId:
                    variant = await tx.productvariant.find_unique(
                        where={"id": item.variantId}
                    )
                    if not variant:
                        raise HTTPException(404, "Variant not found")

                    if variant.stock < item.quantity:
                        raise HTTPException(400, "Not enough stock")

                # 👉 lấy product
                product = await tx.product.find_unique(
                    where={"id": item.productId}
                )
                if not product:
                    raise HTTPException(404, "Product not found")
                price = item.price
                subtotal += price * item.quantity

                order_items_data.append({
                    "productId": item.productId,
                    "variantId": item.variantId,
                    "quantity": item.quantity,
                    "price": price,
                    "productName": product.name,
                    "variantName": variant.name if variant else None,
                    "productImage": None
                })

                # 👉 trừ stock
                if variant:
                    await tx.productvariant.update(
                        where={"id": variant.id},
                        data={"stock": variant.stock - item.quantity}
                    )
            order = await tx.order.create(
                data={
                    "user": {"connect": {"id": order_data.userId}},
                    "shop": {"connect": {"id": order_data.shopId}},
                    "subtotal": subtotal,
                    "shippingFee": order_data.shippingFee,
                    "discountAmount": order_data.discountAmount,
                    "totalAmount": order_data.totalAmount,
                    "items": {
                        "create": order_items_data
                    }
                },
                include={"items": True}
            )

            if order_data.payment:
                await tx.payment.create(
                    data={
                        "order": {"connect": {"id": order.id}},
                        "method": order_data.payment.method,
                        "status": "PENDING"
                    }
                )
            return order

    @staticmethod
    async def get_order(order_id: int):
        order = await prisma.order.find_first(
            where={
                "id": order_id,
                "deletedAt": None
            },
            include={
                "items": {
                    "where": {"deletedAt": None}
                },
                "payment": True,
                "user": True,
                "shop": True
            }
        )

        if not order:
            raise HTTPException(404, "Order not found")

        return order
    @staticmethod
    async def get_all_orders():
        return await prisma.order.find_many(
            where={"deletedAt": None},
            include={
                "items": True,
                "payment": True
            }
        )
    async def update_order(order_id: int, order_data: OrderUpdate):
        return await prisma.order.update(
            where={"id": order_id},
            data=order_data.model_dump(exclude_unset=True)
        )
    @staticmethod
    async def cancel_order(order_id: int):
        async with prisma.tx() as tx:
            order = await tx.order.find_unique(
                where={"id": order_id},
                include={"items": True}
            )

            if not order:
                raise HTTPException(404, "Order not found")

            if order.status == "CANCELLED":
                return {"message": "Already cancelled"}

            # 👉 hoàn stock
            for item in order.items:
                if item.variantId:
                    variant = await tx.productvariant.find_unique(
                        where={"id": item.variantId}
                    )

                    await tx.productvariant.update(
                        where={"id": variant.id},
                        data={"stock": variant.stock + item.quantity}
                    )

            await tx.order.update(
                where={"id": order_id},
                data={"status": "CANCELLED"}
            )

            return {"message": "Order cancelled"}
    @staticmethod
    async def update_payment(order_id: int, status: str):
        payment = await prisma.payment.find_unique(
            where={"orderId": order_id}
        )
        if not payment:
            raise HTTPException(404, "Payment not found")

        updated = await prisma.payment.update(
            where={"id": payment.id},
            data={"status": status}
        )

        if status == "SUCCESS":
            await prisma.order.update(
                where={"id": order_id},
                data={"status": "PAID"}
            )

        return updated

