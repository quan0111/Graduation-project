from collections import defaultdict
from datetime import datetime, timedelta, timezone
import math
from pathlib import Path
import time
from typing import Dict, Iterable, List, Optional, Set, Tuple

import joblib

from src.ai.model import ItemBasedRecommendationModel
from src.ai.train import MODEL_PATH
from src.core.database import prisma


class RecommendationEngine:
    BEHAVIOR_WEIGHTS = {"VIEW": 1.0, "CLICK": 2.0, "ADD_TO_CART": 4.0, "PURCHASE": 6.0}
    ORDER_WEIGHT = 7.0
    MAX_TOP_K = 30
    CACHE_TTL_SECONDS = 90

    _model: Optional[ItemBasedRecommendationModel] = None
    _model_mtime: Optional[float] = None
    _active_products_cache: Optional[Tuple[float, List]] = None
    _popularity_scores_cache: Optional[Tuple[float, Dict[int, float]]] = None

    @classmethod
    def _load_model_if_needed(cls) -> Optional[ItemBasedRecommendationModel]:
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            cls._model = None
            cls._model_mtime = None
            return None

        mtime = model_path.stat().st_mtime
        if cls._model is not None and cls._model_mtime == mtime:
            return cls._model

        payload = joblib.load(model_path)
        model = payload.get("model") if isinstance(payload, dict) else payload
        if not isinstance(model, ItemBasedRecommendationModel):
            cls._model = None
            cls._model_mtime = None
            return None

        cls._model = model
        cls._model_mtime = mtime
        return cls._model

    @classmethod
    async def recommend_product_ids(
        cls,
        user_id: Optional[int],
        top_k: int = 10,
        context_product_id: Optional[int] = None,
    ) -> Tuple[List[int], str]:
        top_k = max(1, min(top_k, cls.MAX_TOP_K))
        scores: Dict[int, float] = defaultdict(float)
        excluded_ids: Set[int] = set()
        algorithms: List[str] = []

        model = cls._load_model_if_needed()
        if model and user_id is not None:
            recommended_ids = model.recommend(user_id=user_id, top_k=top_k * 3)
            if recommended_ids:
                algorithms.append("item_cf")
                for rank, product_id in enumerate(recommended_ids):
                    scores[product_id] += max(top_k * 3 - rank, 1) * 2.5

        user_profile = await cls._build_user_profile(user_id) if user_id is not None else cls._empty_profile()
        context_profile = await cls._build_context_profile(context_product_id) if context_product_id else cls._empty_profile()
        excluded_ids.update(user_profile["seen_product_ids"])
        excluded_ids.update(context_profile["seen_product_ids"])

        if user_profile["weight_total"] > 0:
            algorithms.append("behavior_profile")
        if context_profile["weight_total"] > 0:
            algorithms.append("context_product")

        products = await cls._get_active_products()
        popularity_scores = await cls._get_popularity_scores()
        context_related_scores = (
            await cls._get_context_related_scores(context_product_id, excluded_ids)
            if context_product_id
            else {}
        )
        if context_related_scores:
            algorithms.append("co_purchase")

        for product in products:
            product_id = product.id
            if product_id in excluded_ids:
                continue

            scores[product_id] += popularity_scores.get(product_id, 0.0) * 0.35
            scores[product_id] += context_related_scores.get(product_id, 0.0) * 1.4
            scores[product_id] += cls._score_product_affinity(product, user_profile, category_weight=1.4, shop_weight=0.7)
            scores[product_id] += cls._score_product_affinity(product, context_profile, category_weight=2.2, shop_weight=1.0)

        ranked_ids = [product_id for product_id, _ in sorted(scores.items(), key=lambda pair: pair[1], reverse=True)]
        ranked_ids = await cls._filter_active_ids(ranked_ids, excluded_ids=excluded_ids)

        if len(ranked_ids) < top_k:
            fallback_ids = await cls._get_popular_product_ids(top_k=top_k * 2, exclude_ids=excluded_ids | set(ranked_ids))
            ranked_ids.extend(fallback_ids)

        if ranked_ids:
            algorithm = "+".join(dict.fromkeys(algorithms + ["popular_rank"]))
            return ranked_ids[:top_k], algorithm

        fallback_ids = await cls._get_popular_product_ids(top_k=top_k, exclude_ids=excluded_ids)
        return fallback_ids, "popular_fallback"

    @classmethod
    async def _build_user_profile(cls, user_id: int):
        profile = cls._empty_profile()
        since = datetime.now(timezone.utc) - timedelta(days=120)

        behaviors = await prisma.userbehavior.find_many(
            where={"userId": user_id, "deletedAt": None, "createdAt": {"gte": since}},
            include={"product": {"include": {"tags": True}}},
            order={"createdAt": "desc"},
            take=80,
        )

        for behavior in behaviors:
            product = getattr(behavior, "product", None)
            if not product or product.deletedAt is not None:
                continue
            action_value = cls._to_value(behavior.action)
            weight = cls.BEHAVIOR_WEIGHTS.get(action_value, 1.0) * cls._recency_multiplier(behavior.createdAt)
            cls._add_product_to_profile(profile, product, weight)
            profile["seen_product_ids"].add(behavior.productId)

        orders = await prisma.order.find_many(
            where={"userId": user_id, "deletedAt": None, "createdAt": {"gte": since}},
            order={"createdAt": "desc"},
            take=30,
        )
        order_ids = [order.id for order in orders]
        order_date_map = {order.id: order.createdAt for order in orders}

        if order_ids:
            order_items = await prisma.orderitem.find_many(
                where={"orderId": {"in": order_ids}, "deletedAt": None},
                include={"product": {"include": {"tags": True}}},
            )
            for item in order_items:
                product = getattr(item, "product", None)
                if not product or product.deletedAt is not None:
                    continue
                quantity = max(item.quantity or 1, 1)
                weight = (cls.ORDER_WEIGHT + min(quantity, 5) * 0.5) * cls._recency_multiplier(order_date_map.get(item.orderId))
                cls._add_product_to_profile(profile, product, weight)
                profile["seen_product_ids"].add(item.productId)

        return profile

    @classmethod
    async def _build_context_profile(cls, product_id: int):
        profile = cls._empty_profile()
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"tags": True},
        )
        if product and product.deletedAt is None and product.status == "ACTIVE":
            cls._add_product_to_profile(profile, product, 8.0)
            profile["seen_product_ids"].add(product.id)
        return profile

    @staticmethod
    def _empty_profile():
        return {
            "categories": defaultdict(float),
            "shops": defaultdict(float),
            "tags": defaultdict(float),
            "price_total": 0.0,
            "weight_total": 0.0,
            "seen_product_ids": set(),
        }

    @classmethod
    def _add_product_to_profile(cls, profile, product, weight: float) -> None:
        if weight <= 0:
            return

        profile["categories"][product.categoryId] += weight
        profile["shops"][product.shopId] += weight
        profile["price_total"] += float(product.price or 0) * weight
        profile["weight_total"] += weight

        for tag in getattr(product, "tags", []) or []:
            tag_name = getattr(tag, "name", None)
            if tag_name:
                profile["tags"][tag_name.lower()] += weight

    @classmethod
    def _score_product_affinity(cls, product, profile, category_weight: float, shop_weight: float) -> float:
        if profile["weight_total"] <= 0:
            return 0.0

        score = 0.0
        total_weight = profile["weight_total"]
        score += (profile["categories"].get(product.categoryId, 0.0) / total_weight) * category_weight * 8.0
        score += (profile["shops"].get(product.shopId, 0.0) / total_weight) * shop_weight * 5.0

        tag_score = 0.0
        for tag in getattr(product, "tags", []) or []:
            tag_name = getattr(tag, "name", "").lower()
            tag_score += profile["tags"].get(tag_name, 0.0)
        score += (tag_score / total_weight) * 4.0

        average_price = profile["price_total"] / total_weight if total_weight else 0
        product_price = float(product.price or 0)
        if average_price > 0 and product_price > 0:
            distance = abs(math.log(product_price + 1) - math.log(average_price + 1))
            score += max(0.0, 1.0 - distance / 2.0) * 2.0

        return score

    @classmethod
    async def _get_active_products(cls):
        now = time.monotonic()
        if cls._active_products_cache and now - cls._active_products_cache[0] < cls.CACHE_TTL_SECONDS:
            return cls._active_products_cache[1]

        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            include={"tags": True},
            take=250,
        )
        cls._active_products_cache = (now, products)
        return products

    @classmethod
    async def _get_popularity_scores(cls) -> Dict[int, float]:
        now = time.monotonic()
        if cls._popularity_scores_cache and now - cls._popularity_scores_cache[0] < cls.CACHE_TTL_SECONDS:
            return cls._popularity_scores_cache[1]

        popularity_scores: Dict[int, float] = defaultdict(float)
        since = datetime.now(timezone.utc) - timedelta(days=45)

        order_items = await prisma.orderitem.find_many(
            where={"deletedAt": None, "createdAt": {"gte": since}},
        )
        for order_item in order_items:
            quantity = max(order_item.quantity or 1, 1)
            popularity_scores[order_item.productId] += float(quantity) * cls.ORDER_WEIGHT

        behaviors = await prisma.userbehavior.find_many(
            where={"deletedAt": None, "createdAt": {"gte": since}},
        )
        for behavior in behaviors:
            action_value = cls._to_value(behavior.action)
            popularity_scores[behavior.productId] += cls.BEHAVIOR_WEIGHTS.get(action_value, 1.0) * cls._recency_multiplier(
                behavior.createdAt
            )

        cls._popularity_scores_cache = (now, dict(popularity_scores))
        return popularity_scores

    @classmethod
    async def _get_context_related_scores(cls, context_product_id: int, exclude_ids: Set[int]) -> Dict[int, float]:
        seed_items = await prisma.orderitem.find_many(
            where={"productId": context_product_id, "deletedAt": None},
            order={"createdAt": "desc"},
            take=80,
        )
        order_ids = list(dict.fromkeys(item.orderId for item in seed_items))
        if not order_ids:
            return {}

        related_items = await prisma.orderitem.find_many(
            where={"orderId": {"in": order_ids}, "deletedAt": None},
        )

        scores: Dict[int, float] = defaultdict(float)
        for item in related_items:
            if item.productId == context_product_id or item.productId in exclude_ids:
                continue
            quantity = max(item.quantity or 1, 1)
            scores[item.productId] += quantity * cls.ORDER_WEIGHT * cls._recency_multiplier(item.createdAt)

        return scores

    @staticmethod
    async def _filter_active_ids(product_ids: Iterable[int], excluded_ids: Optional[Set[int]] = None) -> List[int]:
        excluded_ids = excluded_ids or set()
        unique_ids = list(dict.fromkeys(product_ids))
        if not unique_ids:
            return []

        products = await prisma.product.find_many(
            where={"id": {"in": unique_ids}, "status": "ACTIVE", "deletedAt": None},
        )
        active_ids = {product.id for product in products}
        return [product_id for product_id in unique_ids if product_id in active_ids and product_id not in excluded_ids]

    @classmethod
    async def _get_popular_product_ids(cls, top_k: int = 10, exclude_ids: Optional[Set[int]] = None) -> List[int]:
        exclude_ids = exclude_ids or set()
        popularity_scores = await cls._get_popularity_scores()

        ranked_ids = [
            product_id
            for product_id, _ in sorted(popularity_scores.items(), key=lambda pair: pair[1], reverse=True)
            if product_id not in exclude_ids
        ]
        ranked_ids = await cls._filter_active_ids(ranked_ids, excluded_ids=exclude_ids)
        if ranked_ids:
            return ranked_ids[:top_k]

        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            order={"createdAt": "desc"},
            take=top_k + len(exclude_ids),
        )
        return [product.id for product in products if product.id not in exclude_ids][:top_k]

    @staticmethod
    def _to_value(value) -> str:
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _recency_multiplier(created_at) -> float:
        if not created_at:
            return 1.0

        now = datetime.now(created_at.tzinfo) if getattr(created_at, "tzinfo", None) else datetime.utcnow()
        age_days = max((now - created_at).days, 0)
        return 1.0 / (1.0 + age_days / 21.0)
