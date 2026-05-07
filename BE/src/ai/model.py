from collections import defaultdict
from heapq import nlargest
from typing import Dict, Iterable, List, Tuple

import numpy as np


class ItemBasedRecommendationModel:
    def __init__(self, k_items: int = 40):
        self.k_items = k_items
        self.user_item_matrix: Dict[int, Dict[int, float]] = defaultdict(dict)
        self.item_user_matrix: Dict[int, Dict[int, float]] = defaultdict(dict)
        self.item_sim_matrix: Dict[int, Dict[int, float]] = defaultdict(dict)
        self.product_popularity: Dict[int, float] = defaultdict(float)

    def fit(self, interactions: Iterable[Tuple[int, int, float]]) -> None:
        self.user_item_matrix = defaultdict(dict)
        self.item_user_matrix = defaultdict(dict)
        self.item_sim_matrix = defaultdict(dict)
        self.product_popularity = defaultdict(float)

        for user_id, product_id, weight in interactions:
            user_id = int(user_id)
            product_id = int(product_id)
            weight = float(weight)

            previous_weight = self.user_item_matrix[user_id].get(product_id, 0.0)
            combined_weight = max(previous_weight, weight)
            self.user_item_matrix[user_id][product_id] = combined_weight
            self.item_user_matrix[product_id][user_id] = combined_weight
            self.product_popularity[product_id] += combined_weight

        items = list(self.item_user_matrix.keys())
        for index, item_a in enumerate(items):
            users_a = self.item_user_matrix[item_a]
            for item_b in items[index + 1 :]:
                users_b = self.item_user_matrix[item_b]
                similarity = self._cosine_similarity(users_a, users_b)
                if similarity <= 0:
                    continue
                self.item_sim_matrix[item_a][item_b] = similarity
                self.item_sim_matrix[item_b][item_a] = similarity

    def recommend(self, user_id: int, top_k: int = 10) -> List[int]:
        user_data = self.user_item_matrix.get(int(user_id), {})
        if not user_data:
            return []

        scores: Dict[int, float] = defaultdict(float)

        for item_id, user_weight in user_data.items():
            similar_items = self.item_sim_matrix.get(item_id, {})
            top_similar_items = nlargest(self.k_items, similar_items.items(), key=lambda pair: pair[1])
            for similar_item, similarity in top_similar_items:
                if similar_item in user_data:
                    continue
                scores[similar_item] += similarity * user_weight

        for product_id, popularity in self.product_popularity.items():
            if product_id in user_data:
                continue
            scores[product_id] += popularity * 0.03

        ranked = sorted(scores.items(), key=lambda pair: pair[1], reverse=True)
        return [product_id for product_id, _ in ranked[:top_k]]

    def _cosine_similarity(self, left_item: Dict[int, float], right_item: Dict[int, float]) -> float:
        common_users = set(left_item.keys()) & set(right_item.keys())
        if not common_users:
            return 0.0

        dot_product = sum(left_item[user_id] * right_item[user_id] for user_id in common_users)
        left_norm = np.sqrt(sum(weight**2 for weight in left_item.values()))
        right_norm = np.sqrt(sum(weight**2 for weight in right_item.values()))
        if left_norm == 0 or right_norm == 0:
            return 0.0
        return float(dot_product / (left_norm * right_norm))
