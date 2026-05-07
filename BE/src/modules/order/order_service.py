from fastapi import HTTPException

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.order.order_schema import OrderCreate, OrderUpdate


ORDER_STATUSES = {
    "PENDING",
    "CONFIRMED",
    "PAID",
    "PAYMENT_FAILED",
    "PROCESSING",
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
}

ADMIN_TRANSITIONS = {
    "PENDING": {"PAID", "PAYMENT_FAILED", "CANCELLED"},
    "PAYMENT_FAILED": {"PENDING", "CANCELLED"},
    "PAID": {"PROCESSING", "CANCELLED"},
    "PROCESSING": {"READY_TO_SHIP", "SHIPPED", "CANCELLED"},
    "READY_TO_SHIP": {"SHIPPED", "CANCELLED"},
    "SHIPPED": {"IN_TRANSIT", "DELIVERED"},
    "IN_TRANSIT": {"DELIVERED"},
    "DELIVERED": {"COMPLETED", "RETURN_REQUESTED"},
    "COMPLETED": {"RETURN_REQUESTED"},
}

SELLER_TRANSITIONS = {
    "PAID": {"PROCESSING"},
    "PROCESSING": {"READY_TO_SHIP", "SHIPPED"},
    "READY_TO_SHIP": {"SHIPPED"},
    "SHIPPED": {"IN_TRANSIT", "DELIVERED"},
    "IN_TRANSIT": {"DELIVERED"},
}

CUSTOMER_TRANSITIONS = {
    "DELIVERED": {"COMPLETED"},
}

CANCELLABLE_STATUSES = {"PENDING", "PAYMENT_FAILED"}

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
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _normalize_status(status: str) -> str:
        normalized = status.upper()
        if normalized not in ORDER_STATUSES:
            raise HTTPException(400, "Invalid order status")
        return normalized

    @staticmethod
    def _assert_transition(current_status: str, next_status: str, transitions: dict[str, set[str]]):
        if current_status == next_status:
            return

        allowed_next = transitions.get(current_status, set())
        if next_status not in allowed_next:
            raise HTTPException(
                400,
                f"Invalid order transition: {current_status} -> {next_status}",
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
    async def assert_order_visibility(order_id: int, current_user):
        order = await OrderService._get_order_or_404(order_id)
        role = get_role_value(current_user)

        if role == "ADMIN" or order.userId == current_user.id:
            return order

        if role == "SELLER":
            shop = await OrderService._get_seller_shop(current_user.id)
            if any(item.shopId == shop.id for item in order.items):
                return order

        raise HTTPException(403, "Forbidden")

    @staticmethod
    async def _assert_seller_order_access(order, current_user):
        shop = await OrderService._get_seller_shop(current_user.id)
        if not any(item.shopId == shop.id for item in order.items):
            raise HTTPException(403, "Forbidden")

        return shop

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
                        where={"id": item.variantId},
                        include={"images": True}
                    )
                    if not variant:
                        raise HTTPException(404, "Variant not found")

                    if variant.stock < item.quantity:
                        raise HTTPException(400, "Not enough stock")

                product = await tx.product.find_unique(
                    where={"id": item.productId},
                    include={"images": True}
                )
                if not product:
                    raise HTTPException(404, "Product not found")

                price = item.price
                subtotal += price * item.quantity

                # Get image URL from variant images first, then product images
                image_url = None
                if variant and variant.images and len(variant.images) > 0:
                    image_url = variant.images[0].url
                elif product.images and len(product.images) > 0:
                    image_url = product.images[0].url

                order_items_data.append(
                    {
                        "productId": item.productId,
                        "variantId": item.variantId,
                        "shopId": item.shopId,
                        "quantity": item.quantity,
                        "price": price,
                        "productName": product.name,
                        "variantName": variant.name if variant else None,
                        "productImage": image_url,
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
                        "amount": float(order.totalAmount or 0),
                    }
                )

            return await tx.order.find_unique(
                where={"id": order.id},
                include=ORDER_INCLUDE,
            )

    @staticmethod
    async def get_order(order_id: int, current_user):
        return await OrderService.assert_order_visibility(order_id, current_user)

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
        order = await OrderService.assert_order_visibility(order_id, current_user)
        data = order_data.model_dump(exclude_unset=True)

        if "status" not in data or data["status"] is None:
            return order

        next_status = OrderService._normalize_status(data["status"])
        current_status = OrderService._to_value(order.status)
        role = get_role_value(current_user)

        if role == "ADMIN":
            transitions = ADMIN_TRANSITIONS
        elif role == "SELLER":
            await OrderService._assert_seller_order_access(order, current_user)
            transitions = SELLER_TRANSITIONS
        else:
            if order.userId != current_user.id:
                raise HTTPException(403, "Forbidden")
            transitions = CUSTOMER_TRANSITIONS

        OrderService._assert_transition(current_status, next_status, transitions)

        return await prisma.order.update(
            where={"id": order_id},
            data={"status": next_status},
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

            order_status = OrderService._to_value(order.status)

            if order_status == "CANCELLED":
                return {"message": "Already cancelled"}

            if order_status not in CANCELLABLE_STATUSES:
                raise HTTPException(400, "Only pending or failed-payment orders can be cancelled")

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
