import unittest
from datetime import datetime, timedelta
from types import SimpleNamespace

from src.ai.recommendation_metrics import evaluate_holdout, split_train_holdout_chronological
from src.modules.analytics.analytics_service import AnalyticsService


class AnalyticsServiceTest(unittest.TestCase):
    def test_rank_product_groups_sorts_python_client_group_by_output(self):
        grouped = [
            SimpleNamespace(productId=2, _count=SimpleNamespace(productId=3)),
            SimpleNamespace(productId=1, _count=SimpleNamespace(productId=8)),
            SimpleNamespace(productId=3, _count=SimpleNamespace(productId=1)),
        ]

        ranking = AnalyticsService._rank_product_groups(grouped, limit=2)

        self.assertEqual([item["productId"] for item in ranking], [1, 2])
        self.assertEqual(ranking[0]["count"], 8)
        self.assertEqual(ranking[0]["_count"], {"productId": 8})

    def test_rank_product_groups_keeps_dict_shape_compatible(self):
        grouped = [
            {"productId": 4, "_count": {"productId": 2}},
            {"productId": 5, "_count": {"_all": 6}},
        ]

        ranking = AnalyticsService._rank_product_groups(grouped, limit=10)

        self.assertEqual([item["productId"] for item in ranking], [5, 4])
        self.assertEqual(ranking[0]["count"], 6)

    def test_recommendation_evaluation_uses_holdout_split(self):
        now = datetime.utcnow()
        interactions = [
            (1, 101, 5.0, now),
            (1, 102, 2.0, now + timedelta(days=1)),
            (2, 201, 4.0, now),
            (2, 202, 1.0, now + timedelta(days=1)),
        ]

        train_rows, holdout = split_train_holdout_chronological(interactions)

        self.assertIn(1, holdout)
        self.assertNotIn((1, 102, 2.0), train_rows)

        metrics = evaluate_holdout(
            holdout,
            lambda user_id, _top_k: [102] if user_id == 1 else [999],
            k=10,
        )

        self.assertEqual(metrics.users_evaluated, 2)
        self.assertEqual(metrics.interactions_evaluated, 2)
        self.assertEqual(metrics.hit_rate_at_k, 0.5)


if __name__ == "__main__":
    unittest.main()
