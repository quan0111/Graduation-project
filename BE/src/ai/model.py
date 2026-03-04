import numpy as np
from collections import defaultdict
from heapq import nlargest

class ItemBasedRecommendationModel:

    def __init__(self, k_items=50):
        self.item_user_matrix = defaultdict(dict)  
        self.item_sim_matrix = defaultdict(dict)   
        self.product_popularity = defaultdict(int)
        self.k_items = k_items

    def fit(self, interactions):
        self.user_item_matrix = defaultdict(dict)  
        for user_id, product_id, weight in interactions:
            self.user_item_matrix[user_id][product_id] = weight
            self.item_user_matrix[product_id][user_id] = weight
            self.product_popularity[product_id] += weight

        items = list(self.item_user_matrix.keys())
        for i in range(len(items)):
            item_a = items[i]
            users_a = self.item_user_matrix[item_a]
            for j in range(i + 1, len(items)):
                item_b = items[j]
                users_b = self.item_user_matrix[item_b]
                sim = self._cosine_similarity(users_a, users_b)  # Giống nhưng trên user
                self.item_sim_matrix[item_a][item_b] = sim
                self.item_sim_matrix[item_b][item_a] = sim

    def recommend(self, user_id, top_k=10):
        user_data = self.user_item_matrix.get(user_id, {})
        scores = defaultdict(float)

        for liked_item, user_weight in user_data.items():
            similar_items = self.item_sim_matrix.get(liked_item, {})
            top_similar = nlargest(self.k_items, similar_items.items(), key=lambda x: x[1])
            for sim_item, similarity in top_similar:
                if sim_item not in user_data:
                    scores[sim_item] += similarity * user_weight

        for product_id, pop in self.product_popularity.items():
            scores[product_id] += pop * 0.05

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [p[0] for p in ranked[:top_k]]

    def _cosine_similarity(self, item_a, item_b):  # Tương tự, nhưng trên user ratings
        common = set(item_a.keys()) & set(item_b.keys())
        if not common:
            return 0
        dot = sum(item_a[u] * item_b[u] for u in common)
        norm_a = np.sqrt(sum(v ** 2 for v in item_a.values()))
        norm_b = np.sqrt(sum(v ** 2 for v in item_b.values()))
        if norm_a == 0 or norm_b == 0:
            return 0
        return dot / (norm_a * norm_b)