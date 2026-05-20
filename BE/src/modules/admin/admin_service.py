from src.core.database import prisma
from src.core.cache import CacheManager, cache_result
from src.core.security import hash_password
from fastapi import HTTPException
from src.modules.admin.admin_schema import (
    AdminAccountCreate,
    DashboardStats,
    OrderFilter,
    Pagination,
    SellerFilter,
)
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


class AdminService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    async def set_product_status(product_id: int, status: str, ban_reason: str = "", admin_id: int | None = None):
        if status == "APROVAL":
            status = "APPROVAL"
        allowed = {"ACTIVE", "DRAFT", "REJECT", "BANNED", "OUT_OF_STOCK", "APPROVAL"}
        if status not in allowed:
            raise HTTPException(400, "Invalid product status")

        if status in {"BANNED", "REJECT"} and not ban_reason:
            raise HTTPException(400, "Bắt buộc phải cung cấp lý do khi ban hoặc từ chối sản phẩm")

        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"shop": True},
        )
        if not product or product.deletedAt:
            raise HTTPException(404, "Product not found")

        async with prisma.tx() as tx:
            updated = await tx.product.update(
                where={"id": product_id},
                data={"status": status},
            )
            moderation_case = None
            if status in {"BANNED", "REJECT"}:
                moderation_case = await tx.productmoderationcase.create(
                    data={
                        "productId": product_id,
                        "sellerId": product.shop.ownerId if product.shop else None,
                        "status": "OPEN",
                        "reason": ban_reason,
                        "reviewedById": admin_id,
                    }
                )

        # 🔔 Gửi notification cho shop owner khi sản phẩm bị BANNED hoặc REJECT
        if status in {"BANNED", "REJECT"} and product.shop and product.shop.ownerId:
            status_label = "bị cấm (BANNED)" if status == "BANNED" else "bị từ chối (REJECT)"
            reason_text = f" Lý do: {ban_reason}." if ban_reason else ""
            await NotificationService.create(
                NotificationCreate(
                    userId=product.shop.ownerId,
                    title="⚠️ Sản phẩm của bạn đã bị xử lý",
                    content=(
                        f"Sản phẩm '{product.name}' trong shop '{product.shop.name}' "
                        f"đã {status_label} bởi Admin.{reason_text} "
                        f"Vui lòng liên hệ hỗ trợ nếu bạn có thắc mắc."
                    ),
                    type="PRODUCT_BANNED",
                    metadata={
                        "productId": product_id,
                        "productName": product.name,
                        "shopId": product.shop.id,
                        "status": status,
                        "banReason": ban_reason,
                        "caseId": moderation_case.id if moderation_case else None,
                    },
                )
            )

        await AuditService.create(
            actor_id=admin_id,
            action="PRODUCT.STATUS_UPDATED",
            entity_type="Product",
            entity_id=product_id,
            target_user_id=product.shop.ownerId if product.shop else None,
            severity="WARNING" if status in {"BANNED", "REJECT"} else "INFO",
            metadata={
                "status": status,
                "reason": ban_reason,
                "caseId": moderation_case.id if status in {"BANNED", "REJECT"} and moderation_case else None,
            },
        )

        return updated


    @staticmethod
    async def list_admin_accounts():
        return await prisma.user.find_many(
            where={
                "role": "ADMIN",
                "deletedAt": None,
            },
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def create_admin_account(data: AdminAccountCreate):
        existing = await prisma.user.find_unique(where={"email": data.email})

        if existing:
            raise HTTPException(400, "Email already exists")

        return await prisma.user.create(
            data={
                "email": data.email,
                "password": hash_password(data.password),
                "fullName": data.fullName,
                "phone": data.phone,
                "avatarUrl": data.avatarUrl,
                "role": "ADMIN",
            }
        )

    @staticmethod
    @cache_result("admin:dashboard", expire_seconds=CacheManager.SHORT_TTL, include_args=False)
    async def get_dashboard_stats() -> DashboardStats:

        total_users = await prisma.user.count(where={"deletedAt": None})
        total_orders = await prisma.order.count(where={"deletedAt": None})
        total_products = await prisma.product.count(where={"deletedAt": None})
        total_shops = await prisma.shop.count(where={"deletedAt": None})

        orders = await prisma.order.find_many(
            where={"deletedAt": None},
            include={"items": {"include": {"shop": True}}},
            order={"createdAt": "desc"},
        )
        revenue_statuses = {"DELIVERED", "COMPLETED"}
        total_revenue = sum((order.totalAmount or 0) for order in orders if AdminService._to_value(order.status) in revenue_statuses)

        revenue_by_month: dict[str, dict] = {}
        for order in orders:
            key = order.createdAt.strftime("%Y-%m")
            item = revenue_by_month.setdefault(key, {"month": key, "revenue": 0.0, "orders": 0})
            item["orders"] += 1
            if AdminService._to_value(order.status) in revenue_statuses:
                item["revenue"] += float(order.totalAmount or 0)

        products = await prisma.product.find_many(
            where={"deletedAt": None},
            include={"shop": True, "category": True, "images": True},
            order={"createdAt": "desc"},
        )
        category_counts: dict[str, int] = {}
        for product in products:
            category_name = product.category.name if product.category else "Khac"
            category_counts[category_name] = category_counts.get(category_name, 0) + 1
        product_total = max(sum(category_counts.values()), 1)
        category_stats = [
            {"name": name, "value": count, "percent": round(count * 100 / product_total, 2)}
            for name, count in sorted(category_counts.items(), key=lambda item: item[1], reverse=True)
        ][:8]

        pending_products = [
            {
                "id": product.id,
                "name": product.name,
                "shop": product.shop.name if product.shop else "N/A",
                "price": product.price,
                "category": product.category.name if product.category else "N/A",
                "submittedAt": product.createdAt,
                "image": product.images[0].url if product.images else None,
            }
            for product in products
            if AdminService._to_value(product.status) in {"DRAFT", "APPROVAL", "APROVAL"}
        ][:5]

        shops = await prisma.shop.find_many(
            where={"deletedAt": None},
            include={"owner": True, "products": True},
            order={"createdAt": "desc"},
        )
        pending_shops = [
            {
                "id": shop.id,
                "name": shop.name,
                "owner": shop.owner.fullName if shop.owner else None,
                "email": shop.owner.email if shop.owner else None,
                "submittedAt": shop.createdAt,
                "documents": "Da gui",
            }
            for shop in shops
            if not shop.isActive
        ][:5]

        shop_revenue: dict[int, dict] = {}
        for order in orders:
            if AdminService._to_value(order.status) not in revenue_statuses:
                continue
            for item in order.items:
                entry = shop_revenue.setdefault(
                    item.shopId,
                    {
                        "id": item.shopId,
                        "name": item.shop.name if item.shop else f"Shop #{item.shopId}",
                        "revenue": 0.0,
                        "orders": set(),
                        "products": 0,
                    },
                )
                entry["revenue"] += float(item.price or 0) * int(item.quantity or 0)
                entry["orders"].add(order.id)
        product_count_by_shop: dict[int, int] = {}
        for product in products:
            product_count_by_shop[product.shopId] = product_count_by_shop.get(product.shopId, 0) + 1
        top_shops = []
        for entry in sorted(shop_revenue.values(), key=lambda item: item["revenue"], reverse=True)[:5]:
            top_shops.append(
                {
                    **entry,
                    "orders": len(entry["orders"]),
                    "products": product_count_by_shop.get(entry["id"], 0),
                }
            )

        audit_logs = await prisma.auditlog.find_many(
            order={"createdAt": "desc"},
            take=8,
        )
        recent_activity = [
            {
                "id": log.id,
                "type": log.action,
                "message": f"{log.action} {log.entityType or ''} #{log.entityId or ''}".strip(),
                "time": log.createdAt,
                "severity": AdminService._to_value(log.severity),
            }
            for log in audit_logs
        ]

        return DashboardStats(
            totalUsers=total_users,
            totalOrders=total_orders,
            totalProducts=total_products,
            totalShops=total_shops,
            totalRevenue=total_revenue or 0.0,
            revenueByMonth=list(sorted(revenue_by_month.values(), key=lambda item: item["month"])),
            categoryStats=category_stats,
            pendingShops=pending_shops,
            pendingProducts=pending_products,
            topShops=top_shops,
            recentActivity=recent_activity,
        )
    @staticmethod
    async def get_orders(filter_data: OrderFilter, pagination: Pagination):

        where = {}

        if filter_data.status:
            where["status"] = filter_data.status

        if filter_data.userId:
            where["userId"] = filter_data.userId

        if filter_data.shopId:
            where["items"] = {"some": {"shopId": filter_data.shopId, "deletedAt": None}}

        if pagination.search:
            search = pagination.search.strip()
            matching_users = await prisma.user.find_many(
                where={
                    "OR": [
                        {"email": {"contains": search, "mode": "insensitive"}},
                        {"fullName": {"contains": search, "mode": "insensitive"}},
                    ]
                },
                take=50,
            )
            matching_shops = await prisma.shop.find_many(
                where={"name": {"contains": search, "mode": "insensitive"}},
                take=50,
            )
            search_or = []
            user_ids = [user.id for user in matching_users]
            shop_ids = [shop.id for shop in matching_shops]
            if user_ids:
                search_or.append({"userId": {"in": user_ids}})
            if shop_ids:
                search_or.append({"items": {"some": {"shopId": {"in": shop_ids}, "deletedAt": None}}})
            normalized_order_id = search[1:] if search.startswith("#") else search
            if normalized_order_id.isdigit():
                search_or.append({"id": int(normalized_order_id)})
            where["OR"] = search_or or [{"id": -1}]

        skip = (pagination.page - 1) * pagination.limit

        total = await prisma.order.count(where=where)
        data = await prisma.order.find_many(
            where=where,
            skip=skip,
            take=pagination.limit,
            include={
                "user": True,
                "items": {"include": {"shop": True}},
                "payment": True,
                "shippingAddress": True,
                "cancellation": True,
            },
            order={"createdAt": "desc"}
        )
        return {
            "data": data,
            "pagination": {
                "page": pagination.page,
                "limit": pagination.limit,
                "total": total,
                "totalPages": (total + pagination.limit - 1) // pagination.limit,
            },
        }
    @staticmethod
    async def get_sellers(filter_data: SellerFilter, pagination: Pagination):

        where = {}

        if filter_data.isActive is not None:
            where["isActive"] = filter_data.isActive

        skip = (pagination.page - 1) * pagination.limit

        return await prisma.shop.find_many(
            where=where,
            skip=skip,
            take=pagination.limit,
            include={
                "owner": True,
                "products": True
            },
            order={"createdAt": "desc"}
        )
    @staticmethod
    async def update_seller(shop_id: int, data: SellerFilter):

        shop = await prisma.shop.find_unique(
            where={"id": shop_id}
        )

        if not shop:
            raise HTTPException(404, "Shop not found")

        return await prisma.shop.update(
            where={"id": shop_id},
            data=data.dict(exclude_unset=True, exclude={"isVerified"})
        )

    @staticmethod
    async def get_seller_stats(shop_id: int):

        total_products = await prisma.product.count(
            where={"shopId": shop_id}
        )

        delivered_items = await prisma.orderitem.find_many(
            where={
                "shopId": shop_id,
                "deletedAt": None,
            },
            include={"order": True},
        )

        delivered_items = [
            item
            for item in delivered_items
            if item.order and item.order.deletedAt is None and item.order.status in ["DELIVERED", "COMPLETED"]  # Both COD and prepaid orders
        ]

        delivered_order_ids = {item.orderId for item in delivered_items}
        total_orders = len(delivered_order_ids)
        revenue_value = sum((item.price or 0) * (item.quantity or 0) for item in delivered_items)

        return {
            "shopId": shop_id,
            "totalProducts": total_products,
            "totalOrders": total_orders,
            "revenue": revenue_value
        }

    @staticmethod
    async def bulk_update_sellers(ids: list[int], isActive: bool):

        return await prisma.shop.update_many(
            where={"id": {"in": ids}},
            data={"isActive": isActive}
        )
