from src.core.database import prisma
from typing import List, Tuple
from collections import defaultdict

class FeatureBuilder:

    async def build_interactions(
        self,
        days_back: int = 180,          
        min_weight: float = 0.5,
    ) -> List[Tuple[str, str, float]]:
        """
        Trả về list interactions: (user_id, product_id, weight)
        - Aggregate duplicate bằng cách lấy weight cao nhất
        - Ưu tiên purchase > các hành vi khác
        """

        interactions_dict = defaultdict(float)  # (user, product) -> max weight

        behaviors = await prisma.userbehavior.find_many(
            where={
                    "createdAt":{"gte": (prisma.now() - prisma.timedelta(days=days_back))}
            },
            select={
                "userId": True,
                "productId": True,
                "action": True,
            }
        )

        for b in behaviors:
            weight = self._weight_action(b.action)
            key = (b.userId, b.productId)
            interactions_dict[key] = max(interactions_dict[key], weight)

        order_items = await prisma.orderitem.find_many(
            where={
                "order": {"isNot": None},  
            },
            include={
                "order": {
                    "select": {"userId": True}
                }
            },
            select={
                "productId": True,
            }
        )

        for item in order_items:
            if item.order:  
                key = (item.order.userId, item.productId)
                interactions_dict[key] = max(interactions_dict[key], 5.0)

        interactions = [
            (user_id, prod_id, weight)
            for (user_id, prod_id), weight in interactions_dict.items()
            if weight >= min_weight
        ]

        print(f"Built {len(interactions)} interactions from {len(interactions_dict)} unique pairs")
        return interactions

    def _weight_action(self, action: str) -> float:
        weights = {
            "VIEW": 1.0,
            "CLICK": 2.0,
            "ADD_TO_CART": 3.0,
            "PURCHASE": 5.0,
            "WISHLIST": 2.5,
            "REVIEW": 2.0,
            "SHARE": 1.5,
            "RETURN": -3.0,
            "CANCEL": -2.0,
            "RATE": 2.0,
            "SUBSCRIBE": 1.5,
            "UNSUBSCRIBE": -1.5,
            "FOLLOW": 1.0,
            "UNFOLLOW": -1.0,
            "LIKE": 1.5,
            "DISLIKE": -1.5,
        }
        return weights.get(action.upper(), 1.0)