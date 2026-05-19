from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.audit.audit_service import AuditService
from src.modules.inventory.inventory_service import InventoryService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService
from src.modules.order.momo_service import MoMoService
from src.modules.order.order_schema import CheckoutCreate, CheckoutOut, OrderCreate, OrderUpdate, PaymentOut
from src.modules.order.payment_service import PaymentService
from src.modules.order.vnpay_service import VNPayService


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
    "PENDING": {"PAID", "PAYMENT_FAILED", "CONFIRMED", "CANCELLED"},
    "PAYMENT_FAILED": {"PENDING", "CANCELLED"},
    "PAID": {"CONFIRMED"},
    "CONFIRMED": {"PROCESSING", "CANCELLED"},
    "PROCESSING": {"READY_TO_SHIP", "CANCELLED"},
    "READY_TO_SHIP": {"SHIPPED", "CANCELLED"},
    "SHIPPED": {"IN_TRANSIT"},
    "IN_TRANSIT": {"DELIVERED"},
    "DELIVERED": {"COMPLETED", "RETURN_REQUESTED"},
    "COMPLETED": {"RETURN_REQUESTED"},
}

SELLER_TRANSITIONS = {
    "PENDING": {"CONFIRMED"},
    "PAID": {"CONFIRMED", "PROCESSING"},
    "CONFIRMED": {"PROCESSING"},
    "PROCESSING": {"READY_TO_SHIP"},
    "READY_TO_SHIP": {"SHIPPED"},
    "SHIPPED": {"IN_TRANSIT"},
    "IN_TRANSIT": {"DELIVERED"},
}

CUSTOMER_TRANSITIONS = {
    "DELIVERED": {"COMPLETED"},
}

CANCELLABLE_STATUSES = {"PENDING", "PAYMENT_FAILED", "CONFIRMED"}

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
    def _json(value):
        return Json(value) if value is not None else None

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
            inventory_logs = []

            for item in order_data.items:
                variant = None

                if item.variantId:
                    variant = await tx.productvariant.find_unique(
                        where={"id": item.variantId},
                        include={"images": True},
                    )

                    if not variant:
                        raise HTTPException(404, "Variant not found")

                    if variant.stock < item.quantity:
                        raise HTTPException(400, "Not enough stock")

                product = await tx.product.find_unique(
                    where={"id": item.productId},
                    include={"images": True, "variants": True},
                )

                if not product:
                    raise HTTPException(404, "Product not found")

                # Check product status
                if product.status == "BANNED":
                    raise HTTPException(
                        400,
                        f"Sản phẩm '{product.name}' đã bị cấm và không thể đặt hàng",
                    )

                if product.status != "ACTIVE":
                    raise HTTPException(
                        400,
                        f"Sản phẩm '{product.name}' hiện không khả dụng (trạng thái: {product.status})",
                    )

                if product.shopId != item.shopId:
                    raise HTTPException(400, "Shop does not match product")
                if variant and variant.productId != item.productId:
                    raise HTTPException(400, "Variant does not match product")
                if not variant and product.variants:
                    raise HTTPException(400, "Variant is required for this product")

                price = float(variant.price if variant else product.price)
                subtotal += price * item.quantity

                # Get image
                image_url = None

                if variant and variant.images and len(variant.images) > 0:
                    image_url = variant.images[0].url

                elif product.images and len(product.images) > 0:
                    image_url = product.images[0].url

                order_items_data.append(
                    {
                        "product": {
                            "connect": {
                                "id": item.productId,
                            }
                        },

                        "variant": (
                            {
                                "connect": {
                                    "id": item.variantId,
                                }
                            }
                            if item.variantId
                            else None
                        ),

                        "shop": {
                            "connect": {
                                "id": item.shopId,
                            }
                        },

                        "quantity": item.quantity,
                        "price": price,
                        "productName": product.name,
                        "variantName": variant.name if variant else None,
                        "productImage": image_url,
                    }
                )

                # Atomic stock update
                if variant:
                    updated = await tx.productvariant.update_many(
                        where={
                            "id": variant.id,
                            "stock": {
                                "gte": item.quantity,
                            },
                        },
                        data={
                            "stock": {
                                "decrement": item.quantity,
                            }
                        },
                    )

                    if updated == 0:
                        raise HTTPException(
                            400,
                            f"Biến thể '{variant.name}' không đủ tồn kho",
                        )

                    inventory_logs.append(
                        {
                            "shopId": item.shopId,
                            "productId": item.productId,
                            "variantId": variant.id,
                            "actorId": current_user.id,
                            "type": "ORDER_DEDUCT",
                            "quantityChange": -item.quantity,
                            "stockBefore": variant.stock,
                            "stockAfter": variant.stock - item.quantity,
                            "reason": "Deduct stock for checkout",
                            "metadata": {"productName": product.name, "variantName": variant.name},
                        }
                    )

            shipping_fee = max(float(order_data.shippingFee or 0), 0)
            discount_amount = 0.0
            if order_data.couponId:
                coupon = await tx.coupon.find_first(where={"id": order_data.couponId})
                if not coupon:
                    raise HTTPException(404, "Coupon not found")
                now = datetime.utcnow()
                if not coupon.isActive:
                    raise HTTPException(400, "Coupon inactive")
                if coupon.validFrom and coupon.validFrom > now:
                    raise HTTPException(400, "Coupon not started")
                if coupon.validUntil and coupon.validUntil < now:
                    raise HTTPException(400, "Coupon expired")
                if coupon.usageLimit and coupon.usedCount >= coupon.usageLimit:
                    raise HTTPException(400, "Coupon limit reached")
                if coupon.minOrderAmount and subtotal < coupon.minOrderAmount:
                    raise HTTPException(400, "Order not eligible")
                if coupon.applicableShopId and any(item["shop"]["connect"]["id"] != coupon.applicableShopId for item in order_items_data):
                    raise HTTPException(400, "Coupon is not applicable to this shop")
                if coupon.usageLimitPerUser:
                    used_by_user = await tx.couponredemption.count(
                        where={"couponId": order_data.couponId, "userId": current_user.id}
                    )
                    if used_by_user >= coupon.usageLimitPerUser:
                        raise HTTPException(400, "Coupon usage limit reached for this user")
                discount_amount = subtotal * (coupon.discountValue / 100) if coupon.discountType == "PERCENTAGE" else coupon.discountValue
                if coupon.maxDiscount:
                    discount_amount = min(discount_amount, coupon.maxDiscount)
                discount_amount = min(discount_amount, subtotal + shipping_fee)

            total_amount = max(subtotal + shipping_fee - discount_amount, 0)

            # IMPORTANT: prisma-client-py needs relation connect
            create_data = {
                "user": {
                    "connect": {
                        "id": current_user.id,
                    }
                },

                "subtotal": subtotal,
                "shippingFee": shipping_fee,
                "shippingMethod": order_data.shippingMethod,
                "discountAmount": discount_amount,
                "totalAmount": total_amount,

                "items": {
                    "create": order_items_data,
                },
            }

            # Optional shipping address
            if order_data.shippingAddressId:
                create_data["shippingAddress"] = {
                    "connect": {
                        "id": order_data.shippingAddressId,
                    }
                }

            # Optional coupon
            if order_data.couponId:
                coupon = await tx.coupon.find_first(
                    where={
                        "id": order_data.couponId,
                    }
                )

                if not coupon:
                    raise HTTPException(404, "Coupon not found")

                create_data["coupon"] = {
                    "connect": {
                        "id": order_data.couponId,
                    }
                }

            # Create order
            order = await tx.order.create(
                data=create_data,
                include=ORDER_INCLUDE,
            )
            for inventory_log in inventory_logs:
                inventory_log["orderId"] = order.id
                await InventoryService.record(tx, inventory_log)

            # Increase coupon usage
            if order_data.couponId:
                coupon_where = {"id": order_data.couponId}
                if coupon.usageLimit:
                    coupon_where["usedCount"] = {"lt": coupon.usageLimit}
                updated_coupon_count = await tx.coupon.update_many(
                    where=coupon_where,
                    data={"usedCount": {"increment": 1}},
                )
                if updated_coupon_count == 0:
                    raise HTTPException(400, "Coupon limit reached")
                await tx.couponredemption.create(
                    data={
                        "coupon": {"connect": {"id": order_data.couponId}},
                        "user": {"connect": {"id": current_user.id}},
                        "order": {"connect": {"id": order.id}},
                    }
                )

            # Create payment
            if order_data.payment:
                await tx.payment.create(
                    data={
                        "order": {
                            "connect": {
                                "id": order.id,
                            }
                        },

                        "method": order_data.payment.method,
                        "status": "PENDING",
                        "amount": float(order.totalAmount or 0),
                    }
                )

            created_order = await tx.order.find_unique(
                where={"id": order.id},
                include=ORDER_INCLUDE,
            )
        await OrderService._notify_order_update(created_order.id, "CREATED", actor_id=current_user.id)
        return created_order

    @staticmethod
    async def checkout(current_user, checkout_data: CheckoutCreate, ip_address: str) -> CheckoutOut:
        if checkout_data.userId != current_user.id:
            raise HTTPException(403, "Forbidden")

        method = checkout_data.payment.method.upper() if checkout_data.payment else "COD"
        if method not in {"COD", "MOMO", "VNPAY"}:
            raise HTTPException(400, "Payment method must be COD, MOMO or VNPAY")

        if checkout_data.shippingAddressId:
            shipping_address = await prisma.address.find_first(
                where={
                    "id": checkout_data.shippingAddressId,
                    "userId": current_user.id,
                    "deletedAt": None,
                }
            )

            if not shipping_address:
                raise HTTPException(404, "Shipping address not found")

        payment = None
        gateway_response = {
            "paymentUrl": None,
            "qrCodeUrl": None,
            "deeplink": None,
            "providerOrderId": None,
            "requestId": None,
        }

        async with prisma.tx() as tx:
            if not checkout_data.items:
                raise HTTPException(400, "Order must have items")

            subtotal = 0
            order_items_data = []
            inventory_logs = []

            for item in checkout_data.items:
                variant = None

                if item.variantId:
                    variant = await tx.productvariant.find_unique(
                        where={"id": item.variantId},
                        include={"images": True},
                    )

                    if not variant:
                        raise HTTPException(404, "Variant not found")

                    if variant.stock < item.quantity:
                        raise HTTPException(400, "Not enough stock")

                product = await tx.product.find_unique(
                    where={"id": item.productId},
                    include={"images": True, "variants": True},
                )

                if not product:
                    raise HTTPException(404, "Product not found")

                if product.status == "BANNED":
                    raise HTTPException(400, f"Sản phẩm '{product.name}' đã bị cấm và không thể đặt hàng")

                if product.status != "ACTIVE":
                    raise HTTPException(400, f"Sản phẩm '{product.name}' hiện không khả dụng (trạng thái: {product.status})")

                if product.shopId != item.shopId:
                    raise HTTPException(400, "Shop does not match product")
                if variant and variant.productId != item.productId:
                    raise HTTPException(400, "Variant does not match product")
                if not variant and product.variants:
                    raise HTTPException(400, "Variant is required for this product")

                price = float(variant.price if variant else product.price)
                subtotal += price * item.quantity

                image_url = None
                if variant and variant.images and len(variant.images) > 0:
                    image_url = variant.images[0].url
                elif product.images and len(product.images) > 0:
                    image_url = product.images[0].url

                order_items_data.append(
                    {
                        "product": {"connect": {"id": item.productId}},
                        "variant": {"connect": {"id": item.variantId}} if item.variantId else None,
                        "shop": {"connect": {"id": item.shopId}},
                        "quantity": item.quantity,
                        "price": price,
                        "productName": product.name,
                        "variantName": variant.name if variant else None,
                        "productImage": image_url,
                    }
                )

                if variant:
                    updated = await tx.productvariant.update_many(
                        where={"id": variant.id, "stock": {"gte": item.quantity}},
                        data={"stock": {"decrement": item.quantity}},
                    )

                    if updated == 0:
                        raise HTTPException(400, f"Biến thể '{variant.name}' không đủ tồn kho")

                    inventory_logs.append(
                        {
                            "shopId": item.shopId,
                            "productId": item.productId,
                            "variantId": variant.id,
                            "actorId": current_user.id,
                            "type": "ORDER_DEDUCT",
                            "quantityChange": -item.quantity,
                            "stockBefore": variant.stock,
                            "stockAfter": variant.stock - item.quantity,
                            "reason": "Deduct stock for checkout",
                            "metadata": {"productName": product.name, "variantName": variant.name},
                        }
                    )

            shipping_fee = max(float(checkout_data.shippingFee or 0), 0)
            discount_amount = 0.0
            if checkout_data.couponId:
                coupon = await tx.coupon.find_first(where={"id": checkout_data.couponId})
                if not coupon:
                    raise HTTPException(404, "Coupon not found")
                now = datetime.utcnow()
                if not coupon.isActive:
                    raise HTTPException(400, "Coupon inactive")
                if coupon.validFrom and coupon.validFrom > now:
                    raise HTTPException(400, "Coupon not started")
                if coupon.validUntil and coupon.validUntil < now:
                    raise HTTPException(400, "Coupon expired")
                if coupon.usageLimit and coupon.usedCount >= coupon.usageLimit:
                    raise HTTPException(400, "Coupon limit reached")
                if coupon.minOrderAmount and subtotal < coupon.minOrderAmount:
                    raise HTTPException(400, "Order not eligible")
                if coupon.applicableShopId and any(item["shop"]["connect"]["id"] != coupon.applicableShopId for item in order_items_data):
                    raise HTTPException(400, "Coupon is not applicable to this shop")
                if coupon.usageLimitPerUser:
                    used_by_user = await tx.couponredemption.count(
                        where={"couponId": checkout_data.couponId, "userId": current_user.id}
                    )
                    if used_by_user >= coupon.usageLimitPerUser:
                        raise HTTPException(400, "Coupon usage limit reached for this user")
                discount_amount = subtotal * (coupon.discountValue / 100) if coupon.discountType == "PERCENTAGE" else coupon.discountValue
                if coupon.maxDiscount:
                    discount_amount = min(discount_amount, coupon.maxDiscount)
                discount_amount = min(discount_amount, subtotal + shipping_fee)

            total_amount = max(subtotal + shipping_fee - discount_amount, 0)

            create_data = {
                "user": {"connect": {"id": current_user.id}},
                "subtotal": subtotal,
                "shippingFee": shipping_fee,
                "shippingMethod": checkout_data.shippingMethod,
                "discountAmount": discount_amount,
                "totalAmount": total_amount,
                "items": {"create": order_items_data},
            }

            if checkout_data.shippingAddressId:
                create_data["shippingAddress"] = {"connect": {"id": checkout_data.shippingAddressId}}

            if checkout_data.couponId:
                coupon = await tx.coupon.find_first(where={"id": checkout_data.couponId})
                if not coupon:
                    raise HTTPException(404, "Coupon not found")
                if coupon.usageLimitPerUser:
                    used_by_user = await tx.couponredemption.count(
                        where={"couponId": checkout_data.couponId, "userId": current_user.id}
                    )
                    if used_by_user >= coupon.usageLimitPerUser:
                        raise HTTPException(400, "Coupon usage limit reached for this user")
                create_data["coupon"] = {"connect": {"id": checkout_data.couponId}}

            order = await tx.order.create(data=create_data, include=ORDER_INCLUDE)

            for inventory_log in inventory_logs:
                inventory_log["orderId"] = order.id
                await InventoryService.record(tx, inventory_log)

            if checkout_data.couponId:
                coupon_where = {"id": checkout_data.couponId}
                if coupon.usageLimit:
                    coupon_where["usedCount"] = {"lt": coupon.usageLimit}
                updated_coupon_count = await tx.coupon.update_many(
                    where=coupon_where,
                    data={"usedCount": {"increment": 1}},
                )
                if updated_coupon_count == 0:
                    raise HTTPException(400, "Coupon limit reached")
                await tx.couponredemption.create(
                    data={
                        "coupon": {"connect": {"id": checkout_data.couponId}},
                        "user": {"connect": {"id": current_user.id}},
                        "order": {"connect": {"id": order.id}},
                    }
                )

            amount = int(round(float(order.totalAmount or 0)))
            if method in {"MOMO", "VNPAY"} and amount <= 0:
                raise HTTPException(400, "Order total amount must be greater than 0")

            if method == "COD":
                payment = await tx.payment.create(
                    data={
                        "order": {"connect": {"id": order.id}},
                        "method": "COD",
                        "status": "PENDING",
                        "amount": float(amount),
                    }
                )
            else:
                payment = await tx.payment.create(
                    data={
                        "order": {"connect": {"id": order.id}},
                        "method": method,
                        "status": "PENDING",
                        "amount": float(amount),
                    }
                )

            if checkout_data.cartItemIds:
                cart = await tx.cart.find_unique(where={"userId": current_user.id})
                if cart:
                    await tx.cartitem.delete_many(
                        where={
                            "id": {"in": checkout_data.cartItemIds},
                            "cartId": cart.id,
                        }
                    )

            created_order = await tx.order.find_unique(where={"id": order.id}, include=ORDER_INCLUDE)

        if method in {"MOMO", "VNPAY"} and payment:
            try:
                if method == "VNPAY":
                    gateway_data = VNPayService.create_payment_url(created_order.id, amount, ip_address)
                    response_data = gateway_data["requestData"]
                    gateway_response = {
                        "paymentUrl": gateway_data["paymentUrl"],
                        "qrCodeUrl": gateway_data["paymentUrl"],
                        "deeplink": None,
                        "providerOrderId": gateway_data["providerOrderId"],
                        "requestId": None,
                    }
                    payment = await prisma.payment.update(
                        where={"id": payment.id},
                        data={
                            "providerOrderId": gateway_data["providerOrderId"],
                            "requestId": None,
                            "transactionId": None,
                            "paymentUrl": gateway_data["paymentUrl"],
                            "qrCodeUrl": gateway_data["paymentUrl"],
                            "deeplink": None,
                            "providerMessage": "VNPay payment URL created",
                            "providerResponse": OrderService._json(response_data),
                            "paidAt": None,
                        },
                    )
                    await PaymentService._create_event(
                        payment=payment,
                        event_type="CREATED",
                        status="PENDING",
                        payload=response_data,
                        message="VNPay payment URL created",
                    )
                else:
                    gateway_data = MoMoService.create_payment(created_order.id, amount)
                    response_data = gateway_data["responseData"]
                    if response_data.get("resultCode") != 0:
                        raise HTTPException(502, response_data.get("message") or "MoMo payment creation failed")
                    gateway_response = {
                        "paymentUrl": response_data.get("payUrl"),
                        "qrCodeUrl": gateway_data.get("qrCodeImage"),
                        "deeplink": response_data.get("deeplink"),
                        "providerOrderId": gateway_data["providerOrderId"],
                        "requestId": gateway_data["requestId"],
                    }
                    payment = await prisma.payment.update(
                        where={"id": payment.id},
                        data={
                            "providerOrderId": gateway_data["providerOrderId"],
                            "requestId": gateway_data["requestId"],
                            "transactionId": None,
                            "paymentUrl": response_data.get("payUrl"),
                            "qrCodeUrl": gateway_data.get("qrCodeImage"),
                            "deeplink": response_data.get("deeplink"),
                            "providerMessage": response_data.get("message"),
                            "providerResponse": OrderService._json(response_data),
                            "paidAt": None,
                        },
                    )
                    await PaymentService._create_event(
                        payment=payment,
                        event_type="CREATED",
                        status="PENDING",
                        payload=response_data,
                        message=response_data.get("message"),
                    )
            except HTTPException as exc:
                failure_message = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
                failed_payment = await prisma.payment.update(
                    where={"id": payment.id},
                    data={
                        "status": "FAILED",
                        "providerMessage": failure_message,
                    },
                )
                await prisma.order.update(
                    where={"id": created_order.id},
                    data={"status": "PAYMENT_FAILED"},
                )
                await PaymentService._create_event(
                    payment=failed_payment,
                    event_type="CREATED",
                    status="FAILED",
                    message=failure_message,
                )
                raise

        await OrderService._notify_order_update(created_order.id, "CREATED", actor_id=current_user.id)
        return CheckoutOut(
            order=created_order,
            payment=PaymentOut(**{
                **payment.model_dump(),
                "method": OrderService._to_value(payment.method),
                "status": OrderService._to_value(payment.status),
            }) if payment else None,
            **gateway_response,
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
    async def _restore_stock(
        order_id: int,
        tx,
        actor_id: int | None = None,
        ledger_type: str = "CANCEL_RESTORE",
        return_request_id: int | None = None,
    ):
        order = await tx.order.find_first(
            where={"id": order_id},
            include={"items": True}
        )
        if not order:
            return

        for item in order.items:
            if item.variantId:
                variant = await tx.productvariant.find_unique(
                    where={"id": item.variantId}
                )
                if variant:
                    stock_before = variant.stock or 0
                    stock_after = stock_before + item.quantity
                    await tx.productvariant.update(
                        where={"id": variant.id},
                        data={"stock": stock_after},
                    )
                    await InventoryService.record(
                        tx,
                        {
                            "shopId": item.shopId,
                            "productId": item.productId,
                            "variantId": item.variantId,
                            "orderId": order_id,
                            "returnRequestId": return_request_id,
                            "actorId": actor_id,
                            "type": ledger_type,
                            "quantityChange": item.quantity,
                            "stockBefore": stock_before,
                            "stockAfter": stock_after,
                            "reason": "Restore stock after cancellation or return",
                            "metadata": {"orderItemId": item.id, "productName": item.productName},
                        },
                    )

    @staticmethod
    async def _record_cancellation(tx, order_id: int, cancelled_by: str, actor_id: int | None = None, reason: str = "Order cancelled"):
        existing = await tx.ordercancellation.find_unique(where={"orderId": order_id})
        data = {
            "cancelledBy": cancelled_by,
            "reason": reason,
            "note": f"actorId={actor_id}" if actor_id is not None else None,
            "status": "CANCELLED",
        }
        if existing:
            return await tx.ordercancellation.update(where={"id": existing.id}, data=data)
        return await tx.ordercancellation.create(
            data={
                **data,
                "order": {"connect": {"id": order_id}},
            }
        )

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

        # Shopee-like flow: online payments must be paid before seller confirms.
        if current_status == "PENDING" and next_status == "CONFIRMED":
            payment_method = "COD"
            if order.payment:
                payment_method = OrderService._to_value(order.payment.method)

            if payment_method != "COD":
                raise HTTPException(
                    400,
                    f"Không thể xác nhận đơn hàng {payment_method} khi chưa thanh toán thành công."
                )

        async with prisma.tx() as tx:
            if next_status == "CANCELLED" and current_status != "CANCELLED":
                if order.payment and OrderService._to_value(order.payment.status) == "SUCCESS":
                    raise HTTPException(400, "Paid orders must be refunded before cancellation")
                await OrderService._restore_stock(order_id, tx, actor_id=current_user.id)
                await OrderService._record_cancellation(
                    tx,
                    order_id,
                    cancelled_by=role if role in {"CUSTOMER", "SELLER", "ADMIN"} else "SYSTEM",
                    actor_id=current_user.id,
                    reason="Status updated to CANCELLED",
                )

            updated = await tx.order.update(
                where={"id": order_id},
                data={"status": next_status},
                include=ORDER_INCLUDE,
            )

        await AuditService.create(
            actor_id=current_user.id,
            action="ORDER.STATUS_UPDATED",
            entity_type="Order",
            entity_id=order_id,
            target_user_id=order.userId,
            severity="INFO",
            metadata={"from": current_status, "to": next_status, "role": role},
        )
        await OrderService._notify_order_update(order_id, next_status, actor_id=current_user.id)
        return updated

    @staticmethod
    async def cancel_order(order_id: int, current_user):
        async with prisma.tx() as tx:
            order = await tx.order.find_first(
                where={
                    "id": order_id,
                    "userId": current_user.id,
                    "deletedAt": None,
                },
                include={"payment": True},
            )

            if not order:
                raise HTTPException(404, "Order not found")

            order_status = OrderService._to_value(order.status)

            if order_status == "CANCELLED":
                return {"message": "Already cancelled"}

            if order_status not in CANCELLABLE_STATUSES:
                raise HTTPException(400, "Chỉ có thể hủy đơn trước khi người bán bàn giao cho vận chuyển")

            if order.payment and OrderService._to_value(order.payment.status) == "SUCCESS":
                raise HTTPException(400, "Paid orders must be refunded before cancellation")

            await OrderService._restore_stock(order_id, tx, actor_id=current_user.id)
            await OrderService._record_cancellation(
                tx,
                order_id,
                cancelled_by="CUSTOMER",
                actor_id=current_user.id,
            )

            await tx.order.update(
                where={"id": order_id},
                data={"status": "CANCELLED"},
            )

        await AuditService.create(
            actor_id=current_user.id,
            action="ORDER.CANCELLED",
            entity_type="Order",
            entity_id=order_id,
            target_user_id=current_user.id,
            severity="INFO",
            metadata={"from": order_status},
        )
        await OrderService._notify_order_update(order_id, "CANCELLED", actor_id=current_user.id)

        return {"message": "Order cancelled"}

    @staticmethod
    async def _notify_order_update(order_id: int, status: str, actor_id: int | None = None):
        try:
            order = await prisma.order.find_unique(
                where={"id": order_id},
                include={"items": {"include": {"shop": True}}},
            )
            if not order:
                return None

            recipients = {order.userId}
            for item in order.items:
                if item.shop and item.shop.ownerId:
                    recipients.add(item.shop.ownerId)
            if actor_id is not None:
                recipients.discard(actor_id)

            for user_id in recipients:
                await NotificationService.create(
                    NotificationCreate(
                        userId=user_id,
                        title="Cập nhật đơn hàng",
                        content=f"Đơn hàng #{order_id} vừa chuyển sang trạng thái {status}.",
                        type="ORDER_UPDATE",
                        metadata={"orderId": order_id, "status": status},
                    )
                )
        except Exception:
            return None

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
