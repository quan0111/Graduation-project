from collections import defaultdict
from datetime import datetime, timedelta, timezone
import math
from typing import Dict, List, Tuple

from src.core.database import prisma


class FeatureBuilder:
    ACTION_WEIGHTS = {
        "VIEW": 1.0,
        "CLICK": 2.0,
        "ADD_TO_CART": 3.5,
        "PURCHASE": 5.0,
    }
    ORDER_PURCHASE_BASE_WEIGHT = 5.0

    async def build_interactions(
        self,
        days_back: int = 180,
        min_weight: float = 0.5,
    ) -> List[Tuple[int, int, float]]:
        since = datetime.now(timezone.utc) - timedelta(days=days_back)
        interaction_weights: Dict[Tuple[int, int], float] = defaultdict(float)

        behaviors = await prisma.userbehavior.find_many(
            where={"createdAt": {"gte": since}, "deletedAt": None},
        )

        for behavior in behaviors:
            action_value = self._to_action_value(behavior.action)
            weight = self.ACTION_WEIGHTS.get(action_value, 1.0)
            interaction_weights[(behavior.userId, behavior.productId)] += weight

        orders = await prisma.order.find_many(
            where={"createdAt": {"gte": since}, "deletedAt": None},
        )
        order_user_map = {order.id: order.userId for order in orders}

        if order_user_map:
            order_items = await prisma.orderitem.find_many(
                where={"orderId": {"in": list(order_user_map.keys())}, "deletedAt": None},
            )

            for order_item in order_items:
                user_id = order_user_map.get(order_item.orderId)
                if user_id is None:
                    continue
                quantity = max(order_item.quantity or 1, 1)
                weight = self.ORDER_PURCHASE_BASE_WEIGHT + min(quantity, 5) * 0.4
                interaction_weights[(user_id, order_item.productId)] += weight

        interactions = [
            (user_id, product_id, weight)
            for (user_id, product_id), weight in interaction_weights.items()
            if weight >= min_weight
        ]
        return interactions

    async def build_ranking_rows(self, days_back: int = 180) -> List[Tuple[int, int, float, Dict[str, float]]]:
        interactions = await self.build_interactions(days_back=days_back, min_weight=0.1)
        if not interactions:
            return []

        product_ids = list({product_id for _, product_id, _ in interactions})
        products = await prisma.product.find_many(
            where={"id": {"in": product_ids}, "deletedAt": None},
            include={"variants": True, "reviews": True, "tags": True},
        )
        product_map = {product.id: product for product in products}
        popularity = await self._product_popularity(days_back=days_back)

        rows = []
        for user_id, product_id, weight in interactions:
            product = product_map.get(product_id)
            if not product:
                continue
            rows.append((user_id, product_id, weight, self._product_features(product, popularity.get(product_id, 0.0))))
        return rows

    async def _product_popularity(self, days_back: int = 180) -> Dict[int, float]:
        since = datetime.now(timezone.utc) - timedelta(days=days_back)
        scores: Dict[int, float] = defaultdict(float)

        behaviors = await prisma.userbehavior.find_many(where={"createdAt": {"gte": since}, "deletedAt": None})
        for behavior in behaviors:
            scores[behavior.productId] += self.ACTION_WEIGHTS.get(self._to_action_value(behavior.action), 1.0)

        order_items = await prisma.orderitem.find_many(where={"createdAt": {"gte": since}, "deletedAt": None})
        for item in order_items:
            scores[item.productId] += self.ORDER_PURCHASE_BASE_WEIGHT + min(max(item.quantity or 1, 1), 5) * 0.4
        return scores

    @staticmethod
    def _product_features(product, popularity: float) -> Dict[str, float]:
        reviews = getattr(product, "reviews", []) or []
        variants = getattr(product, "variants", []) or []
        tags = getattr(product, "tags", []) or []
        rating = 0.0
        if reviews:
            rating = sum(float(getattr(review, "rating", 0) or 0) for review in reviews) / len(reviews)

        stock = sum(max(getattr(variant, "stock", 0) or 0, 0) for variant in variants)
        return {
            "price_log": math.log(float(product.price or 0) + 1),
            "stock": float(stock),
            "rating": rating,
            "review_count": float(len(reviews)),
            "tag_count": float(len(tags)),
            "popularity": float(popularity),
            "has_description": 1.0 if getattr(product, "description", None) else 0.0,
        }

    def _to_action_value(self, action: str) -> str:
        return action.value if hasattr(action, "value") else str(action)
