from typing import List, Optional

from src.ai.recommendation_engine import RecommendationEngine
from src.ai.train import train_model
from src.core.database import prisma
from src.modules.analytics.analytics_schema import BehaviorTrackPayload, BehaviorType
from src.modules.security.security_service import SecurityService
from src.utils.recommendation_reason import product_reason as build_product_reason


class AnalyticsService:
    PRODUCT_INCLUDE = {
        "shop": True,
        "category": True,
        "images": True,
        "variants": {"include": {"images": True}},
        "tags": True,
        "attributes": True,
    }

    @staticmethod
    async def track_event(data):
        create_data = {
            "action": data.action,
            "sessionId": data.sessionId,
            "duration": data.duration,
            "user": {"connect": {"id": data.userId}},
            "product": {"connect": {"id": data.productId}},
        }
        if data.metadata is not None:
            create_data["metadata"] = data.metadata
        behavior = await prisma.userbehavior.create(data=create_data)
        await SecurityService.inspect_behavior(data.userId)
        return behavior

    @staticmethod
    async def track_event_for_user(user_id: int, payload: BehaviorTrackPayload):
        create_data = {
            "action": payload.action,
            "sessionId": payload.sessionId,
            "duration": payload.duration,
            "user": {"connect": {"id": user_id}},
            "product": {"connect": {"id": payload.productId}},
        }
        if payload.metadata is not None:
            create_data["metadata"] = payload.metadata
        behavior = await prisma.userbehavior.create(data=create_data)
        await SecurityService.inspect_behavior(user_id)
        return behavior

    @staticmethod
    async def get_product_analytics(product_id: int):
        return {
            "productId": product_id,
            "views": await prisma.userbehavior.count(where={"productId": product_id, "action": BehaviorType.VIEW.value}),
            "clicks": await prisma.userbehavior.count(where={"productId": product_id, "action": BehaviorType.CLICK.value}),
            "addToCart": await prisma.userbehavior.count(where={"productId": product_id, "action": BehaviorType.ADD_TO_CART.value}),
            "purchases": await prisma.userbehavior.count(where={"productId": product_id, "action": BehaviorType.PURCHASE.value}),
        }

    @staticmethod
    async def get_user_analytics(user_id: int):
        return {
            "userId": user_id,
            "totalViews": await prisma.userbehavior.count(where={"userId": user_id, "action": BehaviorType.VIEW.value}),
            "totalClicks": await prisma.userbehavior.count(where={"userId": user_id, "action": BehaviorType.CLICK.value}),
        }

    @staticmethod
    async def get_top_products(limit: int = 10):
        grouped = await prisma.userbehavior.group_by(
            by=["productId"],
            _count={"productId": True},
            order={"_count": {"productId": "desc"}},
            take=limit,
        )
        product_ids = [group["productId"] for group in grouped if group.get("productId") is not None]
        products = await AnalyticsService._get_products_by_rank(product_ids)

        return {"ranking": grouped, "products": products}

    @staticmethod
    async def recommend_products(user_id: int, top_k: int = 10, context_product_id: Optional[int] = None):
        product_ids, algorithm = await RecommendationEngine.recommend_product_ids(
            user_id=user_id,
            top_k=top_k,
            context_product_id=context_product_id,
        )
        products = await AnalyticsService._get_products_by_rank(product_ids)

        if product_ids:
            await AnalyticsService._persist_recommendation(user_id=user_id, product_ids=product_ids, algorithm=algorithm)

        return products

    @staticmethod
    async def recommend_products_for_optional_user(
        user_id: Optional[int],
        top_k: int = 10,
        context_product_id: Optional[int] = None,
        explain: bool = False,
    ):
        product_ids, algorithm = await RecommendationEngine.recommend_product_ids(
            user_id=user_id,
            top_k=top_k,
            context_product_id=context_product_id,
        )
        products = await AnalyticsService._get_products_by_rank(product_ids)

        if user_id is not None and product_ids:
            await AnalyticsService._persist_recommendation(user_id=user_id, product_ids=product_ids, algorithm=algorithm)

        if explain:
            current_product = await AnalyticsService._get_current_product(context_product_id)
            return {
                "algorithm": algorithm,
                "products": AnalyticsService._attach_reasons(products, algorithm, user_id, current_product),
            }
        return products

    @staticmethod
    async def get_user_behaviors(user_id: int):
        return await prisma.userbehavior.find_many(
            where={"userId": user_id},
            include={"product": True, "user": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_product_behaviors(product_id: int):
        return await prisma.userbehavior.find_many(
            where={"productId": product_id},
            include={"user": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def retrain_model():
        return await train_model()

    @staticmethod
    async def _get_products_by_rank(product_ids: List[int]):
        if not product_ids:
            return []

        products = await prisma.product.find_many(
            where={"id": {"in": product_ids}, "status": "ACTIVE", "deletedAt": None},
            include=AnalyticsService.PRODUCT_INCLUDE,
        )

        product_map = {product.id: product for product in products}
        ranked_products = [product_map[product_id] for product_id in product_ids if product_id in product_map]
        return ranked_products

    @staticmethod
    async def _get_current_product(product_id: Optional[int]):
        if not product_id:
            return None

        return await prisma.product.find_first(
            where={"id": product_id, "status": "ACTIVE", "deletedAt": None},
            include=AnalyticsService.PRODUCT_INCLUDE,
        )

    @staticmethod
    async def _persist_recommendation(user_id: int, product_ids: List[int], algorithm: str):
        try:
            await prisma.recommendation.create(
                data={
                    "userId": user_id,
                    "recommended": {"productIds": product_ids},
                    "algorithm": algorithm,
                }
            )
        except Exception:
            return

    @staticmethod
    def _attach_reasons(products: List, algorithm: str, user_id: Optional[int], current_product=None):
        reason = "Sản phẩm đang được nhiều người quan tâm trên MarketHub."
        if current_product:
            reason = "Gợi ý vì liên quan đến sản phẩm bạn đang xem."
        elif user_id is not None and "behavior_profile" in algorithm:
            reason = "Gợi ý vì bạn đã xem, thêm giỏ hoặc mua sản phẩm tương tự."
        elif "co_purchase" in algorithm:
            reason = "Gợi ý vì thường được mua cùng các sản phẩm tương tự."

        enriched = []
        for product in products:
            data = product.model_dump() if hasattr(product, "model_dump") else dict(product)
            detailed_reason, relation_type = build_product_reason(product, {}, current_product)
            data["recommendationReason"] = detailed_reason if relation_type != "popular" else reason
            enriched.append(data)
        return enriched
