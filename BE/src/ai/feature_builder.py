from collections import defaultdict
from datetime import datetime, timedelta, timezone
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

    def _to_action_value(self, action: str) -> str:
        return action.value if hasattr(action, "value") else str(action)
