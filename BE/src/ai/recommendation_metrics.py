from collections import defaultdict
from dataclasses import dataclass
from typing import Callable, Dict, Iterable, List, Sequence, Tuple

import numpy as np


Interaction = Tuple[int, int, float]


@dataclass
class RecommendationMetrics:
    hit_rate_at_k: float
    ndcg_at_k: float
    ctr: float
    conversion_rate: float
    users_evaluated: int
    interactions_evaluated: int


def hit_rate_at_k(recommended_ids: Sequence[int], relevant_ids: set, k: int) -> float:
    if not relevant_ids:
        return 0.0
    return 1.0 if set(recommended_ids[:k]) & relevant_ids else 0.0


def ndcg_at_k(recommended_ids: Sequence[int], relevance: Dict[int, float], k: int) -> float:
    dcg = 0.0
    for index, product_id in enumerate(recommended_ids[:k]):
        rel = relevance.get(product_id, 0.0)
        if rel <= 0:
            continue
        dcg += (2**rel - 1) / np.log2(index + 2)

    ideal_relevance = sorted(relevance.values(), reverse=True)[:k]
    idcg = sum((2**rel - 1) / np.log2(index + 2) for index, rel in enumerate(ideal_relevance) if rel > 0)
    return float(dcg / idcg) if idcg > 0 else 0.0


def offline_evaluate(
    interactions: Iterable[Interaction],
    recommend_fn: Callable[[int, int], Sequence[int]],
    k: int = 10,
) -> RecommendationMetrics:
    by_user: Dict[int, List[Tuple[int, float]]] = defaultdict(list)
    for user_id, product_id, weight in interactions:
        by_user[int(user_id)].append((int(product_id), float(weight)))

    hit_rates = []
    ndcgs = []
    evaluated_interactions = 0

    for user_id, rows in by_user.items():
        if len(rows) < 2:
            continue

        rows = sorted(rows, key=lambda item: item[1], reverse=True)
        holdout = rows[: max(1, len(rows) // 5)]
        relevance = {product_id: min(weight, 5.0) for product_id, weight in holdout}
        relevant_ids = set(relevance)
        recommended_ids = list(recommend_fn(user_id, k))

        hit_rates.append(hit_rate_at_k(recommended_ids, relevant_ids, k))
        ndcgs.append(ndcg_at_k(recommended_ids, relevance, k))
        evaluated_interactions += len(holdout)

    users_evaluated = len(hit_rates)
    return RecommendationMetrics(
        hit_rate_at_k=float(np.mean(hit_rates)) if hit_rates else 0.0,
        ndcg_at_k=float(np.mean(ndcgs)) if ndcgs else 0.0,
        ctr=0.0,
        conversion_rate=0.0,
        users_evaluated=users_evaluated,
        interactions_evaluated=evaluated_interactions,
    )


def behavior_rates(views: int, clicks: int, purchases: int) -> Tuple[float, float]:
    ctr = clicks / views if views > 0 else 0.0
    conversion_rate = purchases / clicks if clicks > 0 else 0.0
    return float(ctr), float(conversion_rate)
