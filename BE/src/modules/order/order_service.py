from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.audit.audit_service import AuditService
from src.modules.coupon.coupon_service import CouponService
from src.modules.finance.finance_service import FinanceService
from src.modules.inventory.inventory_service import InventoryService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService
from src.modules.order.momo_service import MoMoService
from src.modules.order.order_schema import CheckoutCreate, CheckoutOut, OrderCreate, OrderUpdate, PaymentOut
from src.modules.order.payment_service import PaymentService
from src.modules.order.vnpay_service import VNPayService


ORDER_STATUSES = {
    "PENDING",
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PAID",
    "PAYMENT_FAILED",
    "PAYMENT_EXPIRED",
    "PROCESSING",
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "COMPLETED",
    "CANCEL_REQUESTED",
    "CANCELLED_BY_CUSTOMER",
    "CANCELLED_BY_SELLER",
    "CANCEL_REJECTED",
    "CANCEL_APPROVED",
    "CANCELLED",
    "DELIVERY_FAILED",
    "RETURN_TO_SENDER",
    "RETURN_REQUESTED",
    "RETURNED",
}

ADMIN_TRANSITIONS = {
    "PENDING": {"CANCELLED"},
    "PENDING_PAYMENT": {"CANCELLED"},
    "PAYMENT_FAILED": {"CANCELLED"},
    "PAYMENT_EXPIRED": {"CANCELLED"},
    "CANCEL_REQUESTED": {"CANCELLED", "PAID", "CONFIRMED"},
    "DELIVERY_FAILED": {"RETURN_TO_SENDER", "CANCELLED"},
    "RETURN_TO_SENDER": {"CANCELLED"},
}

SELLER_TRANSITIONS = {
    "PENDING": {"CONFIRMED", "CANCELLED_BY_SELLER"},
    "PAID": {"CONFIRMED", "PROCESSING"},
    "CONFIRMED": {"PROCESSING", "CANCELLED_BY_SELLER"},
    "PROCESSING": {"READY_TO_SHIP", "CANCELLED_BY_SELLER"},
    "READY_TO_SHIP": {"SHIPPED"},
    "SHIPPED": {"IN_TRANSIT"},
    "IN_TRANSIT": {"OUT_FOR_DELIVERY", "DELIVERY_FAILED"},
    "OUT_FOR_DELIVERY": {"DELIVERED", "DELIVERY_FAILED"},
    "DELIVERY_FAILED": {"RETURN_TO_SENDER"},
}

CUSTOMER_TRANSITIONS = {
    "PENDING": {"CANCELLED_BY_CUSTOMER"},
    "PENDING_PAYMENT": {"CANCELLED_BY_CUSTOMER"},
    "PAYMENT_FAILED": {"CANCELLED_BY_CUSTOMER", "PENDING_PAYMENT"},
    "PAYMENT_EXPIRED": {"PENDING_PAYMENT"},
    "PAID": {"CANCEL_REQUESTED"},
    "CONFIRMED": {"CANCEL_REQUESTED"},
    "DELIVERED": {"COMPLETED"},
    "COMPLETED": {"RETURN_REQUESTED"},
}

CANCELLABLE_STATUSES = {"PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAID", "CONFIRMED"}
TERMINAL_CANCEL_STATUSES = {"CANCELLED", "CANCELLED_BY_CUSTOMER", "CANCELLED_BY_SELLER"}
PAYMENT_HOLD_ORDER_STATUSES = {"PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"}

ORDER_INCLUDE = {
    "items": {
        "where": {"deletedAt": None},
        "include": {
            "shop": True,
        },
    },
    "payment": {"include": {"events": True}},
    "user": True,
    "shippingAddress": True,
    "shipment": True,
    "shipmentEvents": True,
    "cancellation": True,
    "returnRequests": {"include": {"items": True, "evidences": True}},
    "packages": {"include": {"shop": True}},
}


class OrderService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _json(value):
        return Json(value) if value is not None else None

    @staticmethod
    def _model_dump(value):
        if value is None:
            return None
        if hasattr(value, "model_dump"):
            return value.model_dump()
        return dict(value)

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
    def _package_for_shop(order, shop_id: int):
        for package in getattr(order, "packages", []) or []:
            if package.shopId == shop_id:
                return package
        return None

    @staticmethod
    async def _ensure_shop_package(client, order_id: int, shop_id: int, status: str):
        package = await client.ordershoppackage.find_first(
            where={"orderId": order_id, "shopId": shop_id}
        )
        if package:
            return package

        return await client.ordershoppackage.create(
            data={
                "order": {"connect": {"id": order_id}},
                "shop": {"connect": {"id": shop_id}},
                "status": status,
            }
        )

    @staticmethod
    async def _create_shop_packages(client, order_id: int, shop_ids: set[int], status: str = "PENDING"):
        for shop_id in sorted(shop_ids):
            await OrderService._ensure_shop_package(client, order_id, shop_id, status)

    @staticmethod
    async def _sync_order_status_from_packages(client, order_id: int):
        order = await client.order.find_unique(
            where={"id": order_id},
            include={"packages": True, "payment": True},
        )
        if not order or not order.packages:
            return order

        statuses = {OrderService._to_value(package.status) for package in order.packages}
        if len(statuses) == 1:
            next_status = next(iter(statuses))
        elif statuses == {"CANCELLED"}:
            next_status = "CANCELLED"
        elif statuses <= {"COMPLETED", "DELIVERED"}:
            next_status = "COMPLETED" if statuses == {"COMPLETED"} else "DELIVERED"
        else:
            precedence = [
                "RETURNED",
                "RETURN_REQUESTED",
                "CANCEL_REQUESTED",
                "CANCELLED_BY_SELLER",
                "CANCELLED_BY_CUSTOMER",
                "CANCELLED",
                "DELIVERY_FAILED",
                "RETURN_TO_SENDER",
                "DELIVERED",
                "OUT_FOR_DELIVERY",
                "IN_TRANSIT",
                "SHIPPED",
                "READY_TO_SHIP",
                "PROCESSING",
                "CONFIRMED",
                "PAID",
                "PENDING_PAYMENT",
                "PAYMENT_FAILED",
                "PAYMENT_EXPIRED",
                "PENDING",
            ]
            next_status = next((status for status in precedence if status in statuses), OrderService._to_value(order.status))

        if OrderService._to_value(order.status) != next_status:
            await client.order.update(where={"id": order_id}, data={"status": next_status})

        return await client.order.find_unique(where={"id": order_id}, include=ORDER_INCLUDE)

    @staticmethod
    async def _active_flash_sale_item(client, item, now: datetime):
        active_flash_sales = await client.flashsale.find_many(
            where={
                "status": "ACTIVE",
                "startsAt": {"lte": now},
                "endsAt": {"gte": now},
            }
        )
        flash_sale_ids = [flash_sale.id for flash_sale in active_flash_sales]
        if not flash_sale_ids:
            return None

        base_where = {
            "flashSaleId": {"in": flash_sale_ids},
            "productId": item.productId,
            "shopId": item.shopId,
        }
        where = (
            {**base_where, "OR": [{"variantId": item.variantId}, {"variantId": None}]}
            if item.variantId
            else {**base_where, "variantId": None}
        )
        sale_items = await client.flashsaleitem.find_many(
            where=where,
            include={"flashSale": True},
        )
        if not sale_items:
            return None

        return min(sale_items, key=lambda sale_item: float(sale_item.salePrice or 0))

    @staticmethod
    async def _resolve_checkout_price(client, item, product, variant, now: datetime):
        base_price = float(variant.price if variant else product.price)
        flash_sale_item = await OrderService._active_flash_sale_item(client, item, now)
        if not flash_sale_item:
            return base_price, None

        if flash_sale_item.purchaseLimit is not None and item.quantity > flash_sale_item.purchaseLimit:
            raise HTTPException(400, "Flash sale purchase limit exceeded")

        if flash_sale_item.stockLimit is not None:
            available_flash_stock = int(flash_sale_item.stockLimit) - int(flash_sale_item.soldCount or 0)
            if item.quantity > available_flash_stock:
                raise HTTPException(400, "Flash sale stock limit exceeded")

        sale_price = max(float(flash_sale_item.salePrice or 0), 0)
        if sale_price <= 0:
            raise HTTPException(400, "Invalid flash sale price")

        return min(base_price, sale_price), flash_sale_item

    @staticmethod
    async def _apply_flash_sale_sales(client, flash_sale_logs: list[dict]):
        for entry in flash_sale_logs:
            where = {"id": entry["id"]}
            if entry["stockLimit"] is not None:
                where["soldCount"] = {"lte": int(entry["stockLimit"]) - int(entry["quantity"])}
            updated = await client.flashsaleitem.update_many(
                where=where,
                data={"soldCount": {"increment": int(entry["quantity"])}},
            )
            if updated == 0:
                raise HTTPException(400, "Flash sale stock limit exceeded")

    @staticmethod
    def _coupon_ids_from_payload(order_data) -> list[int]:
        coupon_ids = []
        if getattr(order_data, "couponId", None):
            coupon_ids.append(int(order_data.couponId))
        for coupon_id in getattr(order_data, "couponIds", []) or []:
            if coupon_id:
                coupon_ids.append(int(coupon_id))
        return list(dict.fromkeys(coupon_ids))

    @staticmethod
    async def _apply_coupon_redemptions(client, coupon_result: dict, order_id: int, user_id: int):
        for applied_coupon in coupon_result.get("appliedCoupons", []):
            coupon_id = int(applied_coupon["id"])
            coupon_where = {"id": coupon_id}
            if applied_coupon.get("usageLimit") is not None:
                coupon_where["usedCount"] = {"lt": int(applied_coupon["usageLimit"])}
            updated_coupon_count = await client.coupon.update_many(
                where=coupon_where,
                data={"usedCount": {"increment": 1}},
            )
            if updated_coupon_count == 0:
                raise HTTPException(400, "Coupon limit reached")
            await client.couponredemption.create(
                data={
                    "coupon": {"connect": {"id": coupon_id}},
                    "user": {"connect": {"id": user_id}},
                    "order": {"connect": {"id": order_id}},
                }
            )

    @staticmethod
    async def _release_coupon_redemptions(client, order_id: int):
        redemptions = await client.couponredemption.find_many(where={"orderId": order_id})
        for redemption in redemptions:
            await client.coupon.update_many(
                where={"id": redemption.couponId, "usedCount": {"gt": 0}},
                data={"usedCount": {"decrement": 1}},
            )
        if redemptions:
            await client.couponredemption.delete_many(where={"orderId": order_id})

    @staticmethod
    async def _restore_flash_sale_sales(client, order):
        order_created_at = getattr(order, "createdAt", None)
        if not order_created_at:
            return

        flash_sales = await client.flashsale.find_many(
            where={
                "startsAt": {"lte": order_created_at},
                "endsAt": {"gte": order_created_at},
            }
        )
        flash_sale_ids = [flash_sale.id for flash_sale in flash_sales]
        if not flash_sale_ids:
            return

        for item in getattr(order, "items", []) or []:
            quantity = int(getattr(item, "quantity", 0) or 0)
            if quantity <= 0:
                continue

            where = {
                "flashSaleId": {"in": flash_sale_ids},
                "productId": item.productId,
                "shopId": item.shopId,
                "salePrice": float(item.price or 0),
                "soldCount": {"gte": quantity},
            }
            where["variantId"] = item.variantId if item.variantId else None

            sale_item = await client.flashsaleitem.find_first(where=where)
            if sale_item:
                await client.flashsaleitem.update_many(
                    where={"id": sale_item.id, "soldCount": {"gte": quantity}},
                    data={"soldCount": {"decrement": quantity}},
                )

    @staticmethod
    def _filter_order_items_for_shop(order, shop_id: int):
        filtered_items = [
            item
            for item in order.items
            if item.deletedAt is None and item.shopId == shop_id
        ]

        if not filtered_items:
            raise HTTPException(403, "Forbidden")

        order_dict = OrderService._model_dump(order)
        package = OrderService._package_for_shop(order, shop_id)
        if package:
            package_dict = OrderService._model_dump(package)
            order_dict["status"] = OrderService._to_value(package.status)
            order_dict["shopPackage"] = package_dict
            order_dict["packages"] = [package_dict]
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
            flash_sale_logs = []
            discount_items = []
            shop_ids: set[int] = set()
            now = datetime.utcnow()

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
                product_status = OrderService._to_value(product.status)
                if product_status == "BANNED":
                    raise HTTPException(
                        400,
                        f"Sản phẩm '{product.name}' đã bị cấm và không thể đặt hàng",
                    )

                if product_status != "ACTIVE":
                    raise HTTPException(
                        400,
                        f"Sản phẩm '{product.name}' hiện không khả dụng (trạng thái: {product_status})",
                    )

                if product.shopId != item.shopId:
                    raise HTTPException(400, "Shop does not match product")
                if not item.variantId:
                    raise HTTPException(400, "Variant is required for inventory-managed checkout")
                if variant and variant.productId != item.productId:
                    raise HTTPException(400, "Variant does not match product")

                price, flash_sale_item = await OrderService._resolve_checkout_price(tx, item, product, variant, now)
                subtotal += price * item.quantity
                shop_ids.add(item.shopId)
                discount_items.append(
                    {
                        "productId": item.productId,
                        "variantId": item.variantId,
                        "shopId": item.shopId,
                        "categoryId": product.categoryId,
                        "quantity": item.quantity,
                        "lineTotal": price * item.quantity,
                    }
                )
                if flash_sale_item:
                    flash_sale_logs.append(
                        {
                            "id": flash_sale_item.id,
                            "quantity": item.quantity,
                            "stockLimit": flash_sale_item.stockLimit,
                        }
                    )

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
            coupon_ids = OrderService._coupon_ids_from_payload(order_data)
            coupon_result = await CouponService.calculate_coupon_stack(
                tx,
                coupon_ids=coupon_ids,
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                items=discount_items,
                user_id=current_user.id,
            )
            discount_amount = float(coupon_result["discountAmount"])

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
            if order_data.payment and OrderService._to_value(order_data.payment.method).upper() != "COD":
                create_data["status"] = "PENDING_PAYMENT"

            # Optional shipping address
            if order_data.shippingAddressId:
                create_data["shippingAddress"] = {
                    "connect": {
                        "id": order_data.shippingAddressId,
                    }
                }

            # Optional coupon
            if coupon_ids:
                create_data["coupon"] = {
                    "connect": {
                        "id": coupon_ids[0],
                    }
                }

            # Create order
            order = await tx.order.create(
                data=create_data,
                include=ORDER_INCLUDE,
            )
            await OrderService._create_shop_packages(tx, order.id, shop_ids, OrderService._to_value(order.status))
            await OrderService._apply_flash_sale_sales(tx, flash_sale_logs)
            for inventory_log in inventory_logs:
                inventory_log["orderId"] = order.id
                await InventoryService.record(tx, inventory_log)

            # Increase coupon usage
            await OrderService._apply_coupon_redemptions(tx, coupon_result, order.id, current_user.id)

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
            flash_sale_logs = []
            discount_items = []
            shop_ids: set[int] = set()
            now = datetime.utcnow()

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

                product_status = OrderService._to_value(product.status)
                if product_status == "BANNED":
                    raise HTTPException(400, f"Sản phẩm '{product.name}' đã bị cấm và không thể đặt hàng")

                if product_status != "ACTIVE":
                    raise HTTPException(400, f"Sản phẩm '{product.name}' hiện không khả dụng (trạng thái: {product_status})")

                if product.shopId != item.shopId:
                    raise HTTPException(400, "Shop does not match product")
                if not item.variantId:
                    raise HTTPException(400, "Variant is required for inventory-managed checkout")
                if variant and variant.productId != item.productId:
                    raise HTTPException(400, "Variant does not match product")

                price, flash_sale_item = await OrderService._resolve_checkout_price(tx, item, product, variant, now)
                subtotal += price * item.quantity
                shop_ids.add(item.shopId)
                discount_items.append(
                    {
                        "productId": item.productId,
                        "variantId": item.variantId,
                        "shopId": item.shopId,
                        "categoryId": product.categoryId,
                        "quantity": item.quantity,
                        "lineTotal": price * item.quantity,
                    }
                )
                if flash_sale_item:
                    flash_sale_logs.append(
                        {
                            "id": flash_sale_item.id,
                            "quantity": item.quantity,
                            "stockLimit": flash_sale_item.stockLimit,
                        }
                    )

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
            coupon_ids = OrderService._coupon_ids_from_payload(checkout_data)
            coupon_result = await CouponService.calculate_coupon_stack(
                tx,
                coupon_ids=coupon_ids,
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                items=discount_items,
                user_id=current_user.id,
            )
            discount_amount = float(coupon_result["discountAmount"])

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
            if method in {"MOMO", "VNPAY"}:
                create_data["status"] = "PENDING_PAYMENT"

            if checkout_data.shippingAddressId:
                create_data["shippingAddress"] = {"connect": {"id": checkout_data.shippingAddressId}}

            if coupon_ids:
                create_data["coupon"] = {"connect": {"id": coupon_ids[0]}}

            order = await tx.order.create(data=create_data, include=ORDER_INCLUDE)
            await OrderService._create_shop_packages(tx, order.id, shop_ids, OrderService._to_value(order.status))
            await OrderService._apply_flash_sale_sales(tx, flash_sale_logs)

            for inventory_log in inventory_logs:
                inventory_log["orderId"] = order.id
                await InventoryService.record(tx, inventory_log)

            await OrderService._apply_coupon_redemptions(tx, coupon_result, order.id, current_user.id)

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

            if method == "COD" and checkout_data.cartItemIds:
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
                await PaymentService._mark_payment_hold_failed(created_order.id, "PAYMENT_FAILED")
                await PaymentService._create_event(
                    payment=failed_payment,
                    event_type="CREATED",
                    status="FAILED",
                    message=failure_message,
                )
                raise

        if method == "COD":
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
                "status": {"notIn": list(PAYMENT_HOLD_ORDER_STATUSES)},
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
                "status": {"notIn": list(PAYMENT_HOLD_ORDER_STATUSES)},
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
                "status": {"notIn": list(PAYMENT_HOLD_ORDER_STATUSES)},
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
        shop_id: int | None = None,
    ):
        order = await tx.order.find_first(
            where={"id": order_id},
            include={"items": True}
        )
        if not order:
            return

        for item in order.items:
            if shop_id is not None and item.shopId != shop_id:
                continue
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

        if shop_id is None:
            await OrderService._restore_flash_sale_sales(tx, order)
            await OrderService._release_coupon_redemptions(tx, order_id)

    @staticmethod
    async def _record_cancellation(
        tx,
        order_id: int,
        cancelled_by: str,
        actor_id: int | None = None,
        reason: str = "Order cancelled",
        status: str = "CANCELLED",
        note: str | None = None,
    ):
        existing = await tx.ordercancellation.find_unique(where={"orderId": order_id})
        data = {
            "cancelledBy": cancelled_by,
            "reason": reason,
            "note": note if note is not None else (f"actorId={actor_id}" if actor_id is not None else None),
            "status": status,
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
    def _previous_status_from_cancellation(cancellation):
        note = getattr(cancellation, "note", None) if cancellation else None
        if not note:
            return None
        for part in str(note).split(";"):
            key, _, value = part.partition("=")
            if key.strip() == "previousStatus" and value.strip() in ORDER_STATUSES:
                return value.strip()
        return None

    @staticmethod
    async def update_order(order_id: int, current_user, order_data: OrderUpdate):
        order = await OrderService.assert_order_visibility(order_id, current_user)
        data = order_data.model_dump(exclude_unset=True)

        if "status" not in data or data["status"] is None:
            return order

        next_status = OrderService._normalize_status(data["status"])
        action_reason = (data.get("reason") or "").strip()
        current_status = OrderService._to_value(order.status)
        role = get_role_value(current_user)
        shop = None
        is_customer_action = order.userId == current_user.id and next_status in CUSTOMER_TRANSITIONS.get(current_status, set())

        if is_customer_action:
            role = "CUSTOMER"
            transitions = CUSTOMER_TRANSITIONS
        elif role == "ADMIN":
            transitions = ADMIN_TRANSITIONS
        elif role == "SELLER":
            shop = await OrderService._assert_seller_order_access(order, current_user)
            package = OrderService._package_for_shop(order, shop.id)
            if package:
                current_status = OrderService._to_value(package.status)
            transitions = SELLER_TRANSITIONS
        else:
            if order.userId != current_user.id:
                raise HTTPException(403, "Forbidden")
            transitions = CUSTOMER_TRANSITIONS

        OrderService._assert_transition(current_status, next_status, transitions)
        if role == "CUSTOMER" and next_status == "COMPLETED" and len(getattr(order, "packages", []) or []) > 1:
            raise HTTPException(400, "Vui lòng xác nhận đã nhận hàng theo từng shop")

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
            if role == "SELLER":
                package = await OrderService._ensure_shop_package(tx, order_id, shop.id, current_status)
                if next_status == "SHIPPED":
                    raise HTTPException(400, "Cần cập nhật Đã gửi hàng trong mục vận chuyển kèm đơn vị vận chuyển và mã vận đơn")
                if next_status == "CANCELLED_BY_SELLER" and current_status not in TERMINAL_CANCEL_STATUSES:
                    if order.payment and OrderService._to_value(order.payment.status) in {"SUCCESS", "PAYMENT_SUCCESS"}:
                        raise HTTPException(400, "Paid orders must be refunded before cancellation")
                    await OrderService._restore_stock(order_id, tx, actor_id=current_user.id, shop_id=shop.id)
                    await OrderService._record_cancellation(
                        tx,
                        order_id,
                        cancelled_by="SELLER",
                        actor_id=current_user.id,
                        reason=f"Seller #{shop.id} cancelled package",
                    )
                await tx.ordershoppackage.update(
                    where={"id": package.id},
                    data={"status": next_status},
                )
                updated = await OrderService._sync_order_status_from_packages(tx, order_id)
            else:
                admin_rejecting_cancel = role == "ADMIN" and current_status == "CANCEL_REQUESTED" and next_status in {"PAID", "CONFIRMED"}
                admin_sensitive_action = role == "ADMIN" and (
                    next_status in TERMINAL_CANCEL_STATUSES
                    or admin_rejecting_cancel
                    or next_status == "RETURN_TO_SENDER"
                )
                if admin_sensitive_action and not action_reason:
                    raise HTTPException(400, "Reason is required for this admin action")
                if next_status in TERMINAL_CANCEL_STATUSES and current_status not in TERMINAL_CANCEL_STATUSES:
                    if order.payment and OrderService._to_value(order.payment.status) in {"SUCCESS", "PAYMENT_SUCCESS"}:
                        raise HTTPException(400, "Paid orders must be refunded before cancellation")
                    await OrderService._restore_stock(order_id, tx, actor_id=current_user.id)
                    await OrderService._record_cancellation(
                        tx,
                        order_id,
                        cancelled_by=role if role in {"CUSTOMER", "SELLER", "ADMIN"} else "SYSTEM",
                        actor_id=current_user.id,
                        reason=action_reason or ("Admin approved cancellation request" if role == "ADMIN" and current_status == "CANCEL_REQUESTED" else f"Status updated to {next_status}"),
                        status="APPROVED" if role == "ADMIN" and current_status == "CANCEL_REQUESTED" else "CANCELLED",
                    )
                elif admin_rejecting_cancel:
                    cancellation = await tx.ordercancellation.find_unique(where={"orderId": order_id})
                    previous_status = OrderService._previous_status_from_cancellation(cancellation)
                    if previous_status in {"PAID", "CONFIRMED"} and next_status != previous_status:
                        raise HTTPException(400, f"Cancel request must be rejected back to {previous_status}")
                    await OrderService._record_cancellation(
                        tx,
                        order_id,
                        cancelled_by="ADMIN",
                        actor_id=current_user.id,
                        reason=action_reason,
                        status="REJECTED",
                    )

                await tx.order.update(
                    where={"id": order_id},
                    data={"status": next_status},
                )
                await tx.ordershoppackage.update_many(
                    where={"orderId": order_id},
                    data={"status": next_status},
                )
                updated = await tx.order.find_unique(where={"id": order_id}, include=ORDER_INCLUDE)

        await FinanceService.ensure_order_commissions(order_id)
        await AuditService.create(
            actor_id=current_user.id,
            action="ORDER.STATUS_UPDATED",
            entity_type="Order",
            entity_id=order_id,
            target_user_id=order.userId,
            severity="INFO",
            metadata={"from": current_status, "to": next_status, "role": role, "reason": action_reason or None},
        )
        await OrderService._notify_order_update(order_id, next_status, actor_id=current_user.id)
        if role == "SELLER" and shop is not None:
            return OrderService._filter_order_items_for_shop(updated, shop.id)
        return updated

    @staticmethod
    async def confirm_package_received(order_id: int, package_id: int, current_user):
        order = await OrderService._get_order_or_404(order_id)
        if order.userId != current_user.id:
            raise HTTPException(403, "Forbidden")

        package = await prisma.ordershoppackage.find_first(
            where={"id": package_id, "orderId": order_id},
        )
        if not package:
            raise HTTPException(404, "Shop package not found")

        current_status = OrderService._to_value(package.status)
        if current_status == "COMPLETED":
            return await prisma.order.find_unique(where={"id": order_id}, include=ORDER_INCLUDE)
        if current_status != "DELIVERED":
            raise HTTPException(400, "Only delivered shop packages can be confirmed as received")

        async with prisma.tx() as tx:
            await tx.ordershoppackage.update(
                where={"id": package_id},
                data={"status": "COMPLETED"},
            )
            updated = await OrderService._sync_order_status_from_packages(tx, order_id)

        await FinanceService.ensure_order_commissions(order_id)
        await AuditService.create(
            actor_id=current_user.id,
            action="ORDER.PACKAGE_RECEIVED",
            entity_type="OrderShopPackage",
            entity_id=package_id,
            target_user_id=order.userId,
            severity="INFO",
            metadata={"orderId": order_id, "shopId": package.shopId, "from": current_status, "to": "COMPLETED"},
        )
        return updated

    @staticmethod
    async def cancel_order(order_id: int, current_user, reason: str | None = None, note: str | None = None):
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

            if order_status in TERMINAL_CANCEL_STATUSES:
                return {"message": "Already cancelled"}

            if order_status not in CANCELLABLE_STATUSES:
                raise HTTPException(400, "Chỉ có thể hủy hoặc yêu cầu hủy trước khi người bán bàn giao cho vận chuyển")

            next_status = (
                "CANCEL_REQUESTED"
                if order_status in {"PAID", "CONFIRMED"}
                else "CANCELLED_BY_CUSTOMER"
            )

            if next_status in TERMINAL_CANCEL_STATUSES and order.payment and OrderService._to_value(order.payment.status) in {"SUCCESS", "PAYMENT_SUCCESS"}:
                raise HTTPException(400, "Paid orders must be refunded before cancellation")

            if next_status in TERMINAL_CANCEL_STATUSES:
                await OrderService._restore_stock(order_id, tx, actor_id=current_user.id)
            reason_text = (reason or "").strip()
            note_text = (note or "").strip()
            await OrderService._record_cancellation(
                tx,
                order_id,
                cancelled_by="CUSTOMER",
                actor_id=current_user.id,
                reason=reason_text or ("Customer requested cancellation" if next_status == "CANCEL_REQUESTED" else "Customer cancelled order"),
                status="REQUESTED" if next_status == "CANCEL_REQUESTED" else "CANCELLED",
                note=f"actorId={current_user.id};previousStatus={order_status}" + (f";note={note_text}" if note_text else ""),
            )

            await tx.order.update(
                where={"id": order_id},
                data={"status": next_status},
            )
            await tx.ordershoppackage.update_many(
                where={"orderId": order_id},
                data={"status": next_status},
            )

        await FinanceService.ensure_order_commissions(order_id)
        await AuditService.create(
            actor_id=current_user.id,
            action="ORDER.CANCEL_REQUESTED" if next_status == "CANCEL_REQUESTED" else "ORDER.CANCELLED",
            entity_type="Order",
            entity_id=order_id,
            target_user_id=current_user.id,
            severity="INFO",
            metadata={"from": order_status, "to": next_status},
        )
        await OrderService._notify_order_update(order_id, next_status, actor_id=current_user.id)

        return {"message": "Cancel requested" if next_status == "CANCEL_REQUESTED" else "Order cancelled"}

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

        status = PaymentService._normalize_status(status)
        updated = await prisma.payment.update(
            where={"id": payment.id},
            data={"status": status},
        )

        if status in {"SUCCESS", "PAYMENT_SUCCESS"}:
            await prisma.order.update(
                where={"id": order_id},
                data={"status": "PAID"},
            )
            await prisma.ordershoppackage.update_many(
                where={"orderId": order_id, "status": {"in": ["PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]}},
                data={"status": "PAID"},
            )
        elif status in {"FAILED", "PAYMENT_FAILED"}:
            await prisma.order.update_many(
                where={"id": order_id, "status": {"in": ["PENDING", "PENDING_PAYMENT"]}},
                data={"status": "PAYMENT_FAILED"},
            )
            await prisma.ordershoppackage.update_many(
                where={"orderId": order_id, "status": {"in": ["PENDING", "PENDING_PAYMENT"]}},
                data={"status": "PAYMENT_FAILED"},
            )
        elif status == "PAYMENT_EXPIRED":
            await prisma.order.update_many(
                where={"id": order_id, "status": "PENDING_PAYMENT"},
                data={"status": "PAYMENT_EXPIRED"},
            )
            await prisma.ordershoppackage.update_many(
                where={"orderId": order_id, "status": "PENDING_PAYMENT"},
                data={"status": "PAYMENT_EXPIRED"},
            )

        return updated
