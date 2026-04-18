from src.core.database import prisma
from fastapi import HTTPException
from src.modules.analytics.analytics_schema import BehaviorType


class AnalyticsService:

    @staticmethod
    async def track_event(data):
        return await prisma.userbehavior.create(
            data={
                "action": data.action,
                "sessionId": data.sessionId,
                "duration": data.duration,
                "metadata": data.metadata,

                # 🔥 RELATION CHUẨN
                "user": {
                    "connect": {"id": data.userId}
                },
                "product": {
                    "connect": {"id": data.productId}
                }
            }
        )

    @staticmethod
    async def get_product_analytics(product_id: int):

        return {
            "productId": product_id,
            "views": await prisma.userbehavior.count(
                where={
                    "productId": product_id,
                    "action": BehaviorType.VIEW
                }
            ),
            "clicks": await prisma.userbehavior.count(
                where={
                    "productId": product_id,
                    "action": BehaviorType.CLICK
                }
            ),
            "addToCart": await prisma.userbehavior.count(
                where={
                    "productId": product_id,
                    "action": BehaviorType.ADD_TO_CART
                }
            ),
            "purchases": await prisma.userbehavior.count(
                where={
                    "productId": product_id,
                    "action": BehaviorType.PURCHASE
                }
            )
        }

    @staticmethod
    async def get_user_analytics(user_id: int):

        return {
            "userId": user_id,
            "totalViews": await prisma.userbehavior.count(
                where={
                    "userId": user_id,
                    "action": BehaviorType.VIEW
                }
            ),
            "totalClicks": await prisma.userbehavior.count(
                where={
                    "userId": user_id,
                    "action": BehaviorType.CLICK
                }
            )
        }

    @staticmethod
    async def get_top_products(limit: int = 10):

        grouped = await prisma.userbehavior.group_by(
            by=["productId"],
            _count={"productId": True},
            order={"_count": {"productId": "desc"}},
            take=limit
        )

        product_ids = [g["productId"] for g in grouped]

        if not product_ids:
            return []

        products = await prisma.product.find_many(
            where={"id": {"in": product_ids}}
        )

        return {
            "ranking": grouped,
            "products": products
        }
    @staticmethod
    async def recommend_products(user_id: int):

        grouped = await prisma.userbehavior.group_by(
            by=["productId"],
            where={
                "userId": user_id,
                "action": BehaviorType.VIEW
            },
            _count={"productId": True},
            order={"_count": {"productId": "desc"}},
            take=5
        )

        product_ids = [g["productId"] for g in grouped]

        if not product_ids:
            return []

        return await prisma.product.find_many(
            where={"id": {"in": product_ids}}
        )
    @staticmethod
    async def get_user_behaviors(user_id: int):
        return await prisma.userbehavior.find_many(
            where={"userId": user_id},
            include={
                "product": True,
                "user": True
            },
            order={"createdAt": "desc"}
        )

    @staticmethod
    async def get_product_behaviors(product_id: int):
        return await prisma.userbehavior.find_many(
            where={"productId": product_id},
            include={
                "user": True
            },
            order={"createdAt": "desc"}
        )