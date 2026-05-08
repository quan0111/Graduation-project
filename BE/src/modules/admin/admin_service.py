from src.core.database import prisma
from src.core.security import hash_password
from fastapi import HTTPException
from src.modules.admin.admin_schema import (
    AdminAccountCreate,
    DashboardStats,
    OrderFilter,
    Pagination,
    SellerFilter,
)
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


class AdminService:
    @staticmethod
    async def set_product_status(product_id: int, status: str, ban_reason: str = ""):
        allowed = {"ACTIVE", "DRAFT", "REJECT", "BANNED", "OUT_OF_STOCK", "APROVAL"}
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

        updated = await prisma.product.update(
            where={"id": product_id},
            data={"status": status},
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
                    },
                )
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
    async def get_dashboard_stats() -> DashboardStats:

        total_users = await prisma.user.count()
        total_orders = await prisma.order.count()
        total_products = await prisma.product.count()
        total_shops = await prisma.shop.count()

        orders = await prisma.order.find_many(where={"deletedAt": None})
        total_revenue = sum((order.totalAmount or 0) for order in orders)

        return DashboardStats(
            totalUsers=total_users,
            totalOrders=total_orders,
            totalProducts=total_products,
            totalShops=total_shops,
            totalRevenue=total_revenue or 0.0
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
            where["OR"] = [
                {"user": {"email": {"contains": pagination.search}}},
            ]

        skip = (pagination.page - 1) * pagination.limit

        return await prisma.order.find_many(
            where=where,
            skip=skip,
            take=pagination.limit,
            include={
                "user": True,
                "items": True
            },
            order={"createdAt": "desc"}
        )
    @staticmethod
    async def get_sellers(filter_data: SellerFilter, pagination: Pagination):

        where = {}

        if filter_data.isActive is not None:
            where["isActive"] = filter_data.isActive

        if filter_data.isVerified is not None:
            where["isVerified"] = filter_data.isVerified

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
            data=data.dict(exclude_unset=True)
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
            if item.order and item.order.deletedAt is None and item.order.status in ["DELIVERED", "COMPLETED"]
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
