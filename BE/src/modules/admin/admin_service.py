from src.core.database import prisma
from fastapi import HTTPException
from src.modules.admin.admin_schema import OrderFilter, SellerFilter, Pagination, DashboardStats


class AdminService:

    @staticmethod
    async def get_dashboard_stats() -> DashboardStats:

        total_users = await prisma.user.count()
        total_orders = await prisma.order.count()
        total_products = await prisma.product.count()
        total_shops = await prisma.shop.count()

        orders = await prisma.order.find_many()

        total_revenue = sum(o.totalPrice for o in orders)

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
            where["shopId"] = filter_data.shopId

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
                "shop": True,
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

        total_orders = await prisma.order.count(
            where={"shopId": shop_id, "status": "DELIVERED"}
        )

        revenue = await prisma.order.aggregate(
            where={"shopId": shop_id, "status": "DELIVERED"},
            _sum={"totalPrice": True}
        )

        return {
            "shopId": shop_id,
            "totalProducts": total_products,
            "totalOrders": total_orders,
            "revenue": revenue["_sum"]["totalPrice"] or 0.0
        }

    @staticmethod
    async def bulk_update_sellers(ids: list[int], isActive: bool):

        return await prisma.shop.update_many(
            where={"id": {"in": ids}},
            data={"isActive": isActive}
        )