from fastapi import HTTPException

from src.core.database import prisma
from src.modules.order.order_schema import OrderCreate, OrderUpdate


ORDER_INCLUDE = {
    "items": {
        "where": {"deletedAt": None},
        "include": {
            "shop": True,
        },
    },
    "payment": True,
    "user": True,
    "shippingAddress": True,
    "shipment": True,
}


class OrderService:
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
    async def _get_order_or_404(order_id: int):
        order = await prisma.order.find_first(
            where={
                "id": order_id,
                "deletedAt": None,
            },
            include=ORDER_INCLUDE,
        )

        if not order:
            raise HTTPException(404, "Order not found")

        return order

    @staticmethod
    async def _assert_customer_order_access(order_id: int, user_id: int):
        order = await OrderService._get_order_or_404(order_id)

        if order.userId != user_id:
            raise HTTPException(403, "Forbidden")

        return order

    @staticmethod
    def _filter_order_items_for_shop(order, shop_id: int):
        filtered_items = [
            item
            for item in order.items
            if item.deletedAt is None and item.shopId == shop_id
        ]

        if not filtered_items:
            raise HTTPException(403, "Forbidden")

        order_dict = dict(order)
        order_dict["items"] = filtered_items
        return order_dict

    @staticmethod
    async def create_order(current_user, order_data: OrderCreate):
        if order_data.userId != current_user.id:
            raise HTTPException(403, "Forbidden")

        if order_data.shippingAddressId:
            shipping_address = await prisma.address.find_first(
                where={
                    "id": order_data.shippingAddressId,
                    "userId": current_user.id,
                    "deletedAt": None,
                }
            )

            if not shipping_address:
                raise HTTPException(404, "Shipping address not found")

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

                product = await tx.product.find_unique(where={"id": item.productId})
                if not product:
                    raise HTTPException(404, "Product not found")

                price = item.price
                subtotal += price * item.quantity

                order_items_data.append(
                    {
                        "productId": item.productId,
                        "variantId": item.variantId,
                        "shopId": item.shopId,
                        "quantity": item.quantity,
                        "price": price,
                        "productName": product.name,
                        "variantName": variant.name if variant else None,
                        "productImage": None,
                    }
                )

                if variant:
                    await tx.productvariant.update(
                        where={"id": variant.id},
                        data={"stock": variant.stock - item.quantity},
                    )

            order = await tx.order.create(
                data={
                    "user": {"connect": {"id": current_user.id}},
                    "subtotal": subtotal,
                    "shippingFee": order_data.shippingFee,
                    "discountAmount": order_data.discountAmount,
                    "totalAmount": order_data.totalAmount,
                    "shippingAddressId": order_data.shippingAddressId,
                    "couponId": order_data.couponId,
                    "items": {
                        "create": order_items_data,
                    },
                },
                include=ORDER_INCLUDE,
            )

            if order_data.payment:
                await tx.payment.create(
                    data={
                        "order": {"connect": {"id": order.id}},
                        "method": order_data.payment.method,
                        "status": "PENDING",
                    }
                )

            return await tx.order.find_unique(
                where={"id": order.id},
                include=ORDER_INCLUDE,
            )

    @staticmethod
    async def get_order(order_id: int, current_user):
        return await OrderService._assert_customer_order_access(
            order_id=order_id,
            user_id=current_user.id,
        )

    @staticmethod
    async def get_my_orders(current_user):
        return await prisma.order.find_many(
            where={
                "userId": current_user.id,
                "deletedAt": None,
            },
            include=ORDER_INCLUDE,
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_seller_orders(current_user):
        shop = await OrderService._get_seller_shop(current_user.id)
        orders = await prisma.order.find_many(
            where={
                "deletedAt": None,
                "items": {
                    "some": {
                        "shopId": shop.id,
                        "deletedAt": None,
                    }
                },
            },
            include=ORDER_INCLUDE,
            order={"createdAt": "desc"},
        )

        return [
            OrderService._filter_order_items_for_shop(order, shop.id)
            for order in orders
        ]

    @staticmethod
    async def get_seller_order(order_id: int, current_user):
        shop = await OrderService._get_seller_shop(current_user.id)
        order = await prisma.order.find_first(
            where={
                "id": order_id,
                "deletedAt": None,
                "items": {
                    "some": {
                        "shopId": shop.id,
                        "deletedAt": None,
                    }
                },
            },
            include=ORDER_INCLUDE,
        )

        if not order:
            raise HTTPException(404, "Order not found")

        return OrderService._filter_order_items_for_shop(order, shop.id)

    @staticmethod
    async def update_order(order_id: int, current_user, order_data: OrderUpdate):
        await OrderService._assert_customer_order_access(order_id, current_user.id)
        return await prisma.order.update(
            where={"id": order_id},
            data=order_data.model_dump(exclude_unset=True),
            include=ORDER_INCLUDE,
        )

    @staticmethod
    async def cancel_order(order_id: int, current_user):
        async with prisma.tx() as tx:
            order = await tx.order.find_first(
                where={
                    "id": order_id,
                    "userId": current_user.id,
                    "deletedAt": None,
                },
                include={"items": True},
            )

            if not order:
                raise HTTPException(404, "Order not found")

            if order.status == "CANCELLED":
                return {"message": "Already cancelled"}

            for item in order.items:
                if item.variantId:
                    variant = await tx.productvariant.find_unique(
                        where={"id": item.variantId}
                    )

                    if variant:
                        await tx.productvariant.update(
                            where={"id": variant.id},
                            data={"stock": variant.stock + item.quantity},
                        )

            await tx.order.update(
                where={"id": order_id},
                data={"status": "CANCELLED"},
            )

            return {"message": "Order cancelled"}

    @staticmethod
    async def update_payment(order_id: int, status: str):
        payment = await prisma.payment.find_unique(where={"orderId": order_id})
        if not payment:
            raise HTTPException(404, "Payment not found")

        updated = await prisma.payment.update(
            where={"id": payment.id},
            data={"status": status},
        )

        if status == "SUCCESS":
            await prisma.order.update(
                where={"id": order_id},
                data={"status": "PAID"},
            )

        return updated
