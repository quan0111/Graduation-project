from datetime import datetime, timedelta

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value


class SellerService:
    COMPLETED_REVENUE_STATUSES = {"DELIVERED", "COMPLETED"}
    CANCELLED_STATUSES = {"CANCEL_REQUESTED", "CANCELLED_BY_CUSTOMER", "CANCELLED_BY_SELLER", "CANCEL_REJECTED", "CANCEL_APPROVED", "CANCELLED"}

    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _empty_dashboard(access_state: str, user, shop=None):
        user_data = None
        if user:
            user_data = {
                "id": user.id,
                "email": user.email,
                "fullName": user.fullName,
                "avatarUrl": user.avatarUrl,
                "role": SellerService._to_value(user.role),
            }
        shop_data = None
        if shop:
            shop_data = {
                "id": shop.id,
                "name": shop.name,
                "description": shop.description,
                "avatarUrl": shop.avatarUrl,
                "productCount": 0,
            }
        return {
            "accessState": access_state,
            "user": user_data,
            "shop": shop_data,
            "overview": {
                "grossRevenue": 0,
                "totalOrders": 0,
                "activeProducts": 0,
                "pendingOrders": 0,
                "lowStockProducts": 0,
                "outOfStockProducts": 0,
                "completionRate": 0,
            },
            "salesTrend": [],
            "todo": {"pending": 0, "processing": 0, "shipping": 0, "returns": 0},
            "orderFlow": [],
            "wallet": {"grossRevenue": 0, "completedRevenue": 0, "pendingRevenue": 0, "cancelledRevenue": 0},
            "topProducts": [],
            "inventory": [],
            "recentOrders": [],
        }

    @staticmethod
    def _order_bucket(status: str):
        if status in {"PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"}:
            return "pending"
        if status in {"CONFIRMED", "PAID", "PROCESSING", "READY_TO_SHIP"}:
            return "processing"
        if status in {"SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RETURN_TO_SENDER"}:
            return "shipping"
        if status in {"RETURN_REQUESTED", "RETURNED"}:
            return "returns"
        if status in SellerService.COMPLETED_REVENUE_STATUSES:
            return "completed"
        if status in SellerService.CANCELLED_STATUSES:
            return "cancelled"
        return "other"

    @staticmethod
    def _order_flow(buckets: dict):
        max_value = max(buckets.get("pending", 0), buckets.get("processing", 0), buckets.get("shipping", 0), buckets.get("completed", 0), 1)
        return [
            {"label": "Chờ xác nhận", "count": buckets.get("pending", 0), "progress": round(buckets.get("pending", 0) * 100 / max_value)},
            {"label": "Đang xử lý", "count": buckets.get("processing", 0), "progress": round(buckets.get("processing", 0) * 100 / max_value)},
            {"label": "Đang giao", "count": buckets.get("shipping", 0), "progress": round(buckets.get("shipping", 0) * 100 / max_value)},
            {"label": "Hoàn tất", "count": buckets.get("completed", 0), "progress": round(buckets.get("completed", 0) * 100 / max_value)},
        ]

    @staticmethod
    async def get_dashboard(user):
        if get_role_value(user) != "SELLER":
            return SellerService._empty_dashboard("not-seller", user)

        shop = await prisma.shop.find_first(
            where={"ownerId": user.id, "deletedAt": None},
        )
        if not shop:
            return SellerService._empty_dashboard("no-shop", user)

        products = await prisma.product.find_many(
            where={"shopId": shop.id, "deletedAt": None},
            include={"variants": True},
            order={"updatedAt": "desc"},
        )
        orders = await prisma.order.find_many(
            where={"items": {"some": {"shopId": shop.id, "deletedAt": None}}, "deletedAt": None},
            include={"items": True, "payment": True},
            order={"createdAt": "desc"},
        )

        product_rows = []
        for product in products:
            status = SellerService._to_value(product.status)
            for variant in product.variants or []:
                if variant.deletedAt:
                    continue
                product_rows.append(
                    {
                        "id": product.id,
                        "variantId": variant.id,
                        "name": f"{product.name} - {variant.name}",
                        "price": float(variant.price or product.price or 0),
                        "status": status,
                        "updatedAt": product.updatedAt,
                        "stock": int(variant.stock or 0),
                        "sku": variant.sku or f"SP-{product.id}-V{variant.id}",
                    }
                )

        scoped_orders = []
        for order in orders:
            items = [item for item in order.items if item.shopId == shop.id and not item.deletedAt]
            if not items:
                continue
            revenue = sum(float(item.price or 0) * int(item.quantity or 0) for item in items)
            status = SellerService._to_value(order.status)
            scoped_orders.append(
                {
                    "id": order.id,
                    "status": status,
                    "createdAt": order.createdAt,
                    "paymentStatus": SellerService._to_value(order.payment.status) if order.payment else None,
                    "itemCount": sum(int(item.quantity or 0) for item in items),
                    "revenue": revenue,
                    "items": items,
                }
            )

        buckets = {"pending": 0, "processing": 0, "shipping": 0, "returns": 0, "completed": 0, "cancelled": 0}
        for order in scoped_orders:
            bucket = SellerService._order_bucket(order["status"])
            if bucket in buckets:
                buckets[bucket] += 1

        completed_orders = [order for order in scoped_orders if order["status"] in SellerService.COMPLETED_REVENUE_STATUSES]
        pending_orders = [
            order
            for order in scoped_orders
            if order["status"] not in SellerService.COMPLETED_REVENUE_STATUSES | SellerService.CANCELLED_STATUSES | {"RETURNED"}
        ]
        cancelled_orders = [order for order in scoped_orders if order["status"] in SellerService.CANCELLED_STATUSES]
        completed_revenue = sum(order["revenue"] for order in completed_orders)
        pending_revenue = sum(order["revenue"] for order in pending_orders)
        cancelled_revenue = sum(order["revenue"] for order in cancelled_orders)

        trend = []
        today = datetime.utcnow().date()
        for offset in range(6, -1, -1):
            day = today - timedelta(days=offset)
            day_orders = [order for order in completed_orders if order["createdAt"].date() == day]
            trend.append(
                {
                    "label": day.strftime("%d/%m"),
                    "revenue": sum(order["revenue"] for order in day_orders),
                    "orders": len(day_orders),
                }
            )

        stats_by_variant: dict[str, dict] = {}
        for order in completed_orders:
            for item in order["items"]:
                key = f"{item.productId}:{item.variantId or 'product'}"
                current = stats_by_variant.setdefault(key, {"sold": 0, "revenue": 0.0})
                current["sold"] += int(item.quantity or 0)
                current["revenue"] += float(item.price or 0) * int(item.quantity or 0)

        top_products = []
        for product in product_rows:
            stats = stats_by_variant.get(f"{product['id']}:{product.get('variantId')}", {"sold": 0, "revenue": 0.0})
            top_products.append({**product, "sold": stats["sold"], "revenue": stats["revenue"]})
        top_products = sorted(top_products, key=lambda item: item["revenue"], reverse=True)[:5]

        inventory = [
            {
                "id": product["id"],
                "variantId": product.get("variantId"),
                "name": product["name"],
                "stock": product["stock"],
                "price": product["price"],
                "status": product["status"],
                "updatedAt": product["updatedAt"],
            }
            for product in sorted(product_rows, key=lambda item: item["stock"])[:5]
        ]

        recent_orders = [
            {
                "id": order["id"],
                "status": order["status"],
                "createdAt": order["createdAt"],
                "itemCount": order["itemCount"],
                "revenue": order["revenue"],
                "paymentStatus": order["paymentStatus"],
            }
            for order in scoped_orders[:6]
        ]

        total_orders = len(scoped_orders)
        completion_base = max(total_orders - buckets["cancelled"], 0)
        return {
            **SellerService._empty_dashboard("ready", user, shop),
            "shop": {
                "id": shop.id,
                "name": shop.name,
                "description": shop.description,
                "avatarUrl": shop.avatarUrl,
                "productCount": len(products),
            },
            "overview": {
                "grossRevenue": completed_revenue,
                "totalOrders": total_orders,
                "activeProducts": len([item for item in product_rows if item["status"] == "ACTIVE" and item["stock"] > 0]),
                "pendingOrders": buckets["pending"] + buckets["processing"],
                "lowStockProducts": len([item for item in product_rows if 0 < item["stock"] <= 10]),
                "outOfStockProducts": len([item for item in product_rows if item["stock"] <= 0]),
                "completionRate": round(buckets["completed"] * 100 / completion_base) if completion_base else 0,
            },
            "salesTrend": trend,
            "todo": {
                "pending": buckets["pending"],
                "processing": buckets["processing"],
                "shipping": buckets["shipping"],
                "returns": buckets["returns"],
            },
            "orderFlow": SellerService._order_flow(buckets),
            "wallet": {
                "grossRevenue": completed_revenue,
                "completedRevenue": completed_revenue,
                "pendingRevenue": pending_revenue,
                "cancelledRevenue": cancelled_revenue,
            },
            "topProducts": top_products,
            "inventory": inventory,
            "recentOrders": recent_orders,
        }

    @staticmethod
    async def apply(user_id: int, data):
        if not data.shopName:
            raise HTTPException(400, "Shop name is required")

        user = await prisma.user.find_unique(where={"id": user_id})
        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        if get_role_value(user) == "SELLER":
            raise HTTPException(400, "User is already a seller")

        existing_shop = await prisma.shop.find_first(
            where={
                "ownerId": user_id,
                "deletedAt": None,
            }
        )
        if existing_shop:
            raise HTTPException(400, "User already has a shop")

        existing = await prisma.sellerapplication.find_first(
            where={
                "userId": user_id,
                "status": "PENDING",
            }
        )
        if existing:
            raise HTTPException(400, "You already have a pending application")

        payload = data.model_dump()
        if payload.get("shippingOptions") is not None:
            payload["shippingOptions"] = Json(payload["shippingOptions"])
        if payload.get("taxInfo") is not None:
            payload["taxInfo"] = Json(payload["taxInfo"])

        return await prisma.sellerapplication.create(
            data={
                **payload,
                "status": "PENDING",
                "user": {
                    "connect": {"id": user_id}
                },
            }
        )

    @staticmethod
    async def approve(application_id: int, admin_id: int):
        application = await prisma.sellerapplication.find_unique(where={"id": application_id})

        if not application:
            raise HTTPException(404, "Application not found")

        if application.status != "PENDING":
            raise HTTPException(400, "Already processed")

        existing_shop = await prisma.shop.find_first(where={"ownerId": application.userId})
        if existing_shop:
            raise HTTPException(400, "User already has a shop")

        try:
            async with prisma.tx() as transaction:
                await transaction.shop.create(
                    data={
                        "name": application.shopName,
                        "slug": application.shopSlug,
                        "description": application.description,
                        "avatarUrl": application.logoUrl,
                        "ownerId": application.userId,
                    }
                )

                await transaction.user.update(
                    where={"id": application.userId},
                    data={"role": "SELLER"},
                )

                return await transaction.sellerapplication.update(
                    where={"id": application_id},
                    data={
                        "status": "APPROVED",
                        "reviewedAt": datetime.utcnow(),
                        "reviewedBy": {
                            "connect": {"id": admin_id}
                        },
                    },
                )
        except Exception as exc:
            raise HTTPException(500, str(exc)) from exc

    @staticmethod
    async def reject(application_id: int, admin_id: int, note: str | None = None):
        application = await prisma.sellerapplication.find_unique(where={"id": application_id})

        if not application:
            raise HTTPException(404, "Application not found")

        if application.status != "PENDING":
            raise HTTPException(400, "Already processed")

        return await prisma.sellerapplication.update(
            where={"id": application_id},
            data={
                "status": "REJECTED",
                "note": note,
                "reviewedAt": datetime.utcnow(),
                "reviewedBy": {
                    "connect": {"id": admin_id}
                },
            }
        )

    @staticmethod
    async def get_detail(application_id: int):
        data = await prisma.sellerapplication.find_unique(
            where={"id": application_id},
            include={
                "user": True,
                "reviewedBy": True,
            }
        )

        if not data:
            raise HTTPException(404, "Application not found")

        return data

    @staticmethod
    async def get_my_application(user_id: int):
        return await prisma.sellerapplication.find_first(
            where={"userId": user_id},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_all():
        return await prisma.sellerapplication.find_many(
            include={
                "user": True,
                "reviewedBy": True,
            },
            order={"createdAt": "desc"},
        )
