from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
import warnings

import numpy as np


FeatureRow = Dict[str, float]
TrainingRow = Tuple[int, int, float, FeatureRow]


@dataclass
class RankingPrediction:
    product_id: int
    score: float


class LinearLearningToRankModel:
    """Dependency-free fallback for learning-to-rank.

    The production path uses LightGBM or XGBoost when installed. This fallback
    learns a simple linear relevance function, so the service can still train
    and rank in local/dev environments without compiled ML dependencies.
    """

    def __init__(self, learning_rate: float = 0.04, epochs: int = 120, l2: float = 0.001):
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.l2 = l2
        self.feature_names: List[str] = []
        self.weights: Optional[np.ndarray] = None
        self.bias = 0.0

    def fit(self, rows: Sequence[TrainingRow]) -> None:
        if not rows:
            self.feature_names = []
            self.weights = np.zeros(0)
            self.bias = 0.0
            return

        self.feature_names = sorted({name for _, _, _, features in rows for name in features})
        x = np.array([[features.get(name, 0.0) for name in self.feature_names] for _, _, _, features in rows], dtype=float)
        y = np.array([label for _, _, label, _ in rows], dtype=float)
        y = np.log1p(np.maximum(y, 0.0))
        x = self._normalize_features(x)

        self.weights = np.zeros(x.shape[1], dtype=float)
        self.bias = float(np.mean(y)) if len(y) else 0.0

        for _ in range(self.epochs):
            prediction = x @ self.weights + self.bias
            error = prediction - y
            gradient_w = (x.T @ error) / len(x) + self.l2 * self.weights
            gradient_b = float(np.mean(error))
            self.weights -= self.learning_rate * gradient_w
            self.bias -= self.learning_rate * gradient_b

    def predict(self, product_features: Dict[int, FeatureRow]) -> List[RankingPrediction]:
        if self.weights is None:
            return []

        predictions = []
        for product_id, features in product_features.items():
            row = np.array([features.get(name, 0.0) for name in self.feature_names], dtype=float)
            score = float(row @ self.weights + self.bias)
            predictions.append(RankingPrediction(product_id=product_id, score=score))
        predictions.sort(key=lambda item: item.score, reverse=True)
        return predictions

    @staticmethod
    def _normalize_features(x: np.ndarray) -> np.ndarray:
        if x.size == 0:
            return x
        max_abs = np.maximum(np.max(np.abs(x), axis=0), 1.0)
        return x / max_abs


class GradientBoostingLTRModel:
    """LightGBM/XGBoost wrapper with a linear fallback."""

    def __init__(self):
        self.backend = "linear_fallback"
        self.feature_names: List[str] = []
        self.model = LinearLearningToRankModel()

    def fit(self, rows: Sequence[TrainingRow]) -> None:
        if not rows:
            self.model.fit(rows)
            return

        rows = sorted(rows, key=lambda row: row[0])
        self.feature_names = sorted({name for _, _, _, features in rows for name in features})
        x = np.array([[features.get(name, 0.0) for name in self.feature_names] for _, _, _, features in rows], dtype=float)
        y = np.array([label for _, _, label, _ in rows], dtype=float)
        rank_y = self._rank_labels(y)
        groups = self._groups(rows)

        if self._try_fit_lightgbm(x, rank_y, groups):
            return
        if self._try_fit_xgboost(x, rank_y, groups):
            return

        self.model = LinearLearningToRankModel()
        self.model.fit(rows)
        self.backend = "linear_fallback"

    def predict(self, product_features: Dict[int, FeatureRow]) -> List[RankingPrediction]:
        if self.backend == "lightgbm":
            x = np.array([[features.get(name, 0.0) for name in self.feature_names] for features in product_features.values()], dtype=float)
            with warnings.catch_warnings():
                warnings.filterwarnings(
                    "ignore",
                    message="X does not have valid feature names, but LGBMRanker was fitted with feature names",
                    category=UserWarning,
                )
                scores = self.model.predict(x)
            return sorted(
                [RankingPrediction(product_id=product_id, score=float(score)) for product_id, score in zip(product_features.keys(), scores)],
                key=lambda item: item.score,
                reverse=True,
            )

        if self.backend == "xgboost":
            x = np.array([[features.get(name, 0.0) for name in self.feature_names] for features in product_features.values()], dtype=float)
            scores = self.model.predict(x)
            return sorted(
                [RankingPrediction(product_id=product_id, score=float(score)) for product_id, score in zip(product_features.keys(), scores)],
                key=lambda item: item.score,
                reverse=True,
            )

        return self.model.predict(product_features)

    def _try_fit_lightgbm(self, x: np.ndarray, y: np.ndarray, groups: List[int]) -> bool:
        try:
            import lightgbm as lgb  # type: ignore
        except Exception:
            return False

        try:
            self.model = lgb.LGBMRanker(
                objective="lambdarank",
                metric="ndcg",
                n_estimators=120,
                learning_rate=0.05,
                num_leaves=31,
                random_state=42,
                label_gain=[0, 1, 3, 7, 15, 31],
            )
            self.model.fit(x, y, group=groups)
            self.backend = "lightgbm"
            return True
        except Exception:
            return False

    def _try_fit_xgboost(self, x: np.ndarray, y: np.ndarray, groups: List[int]) -> bool:
        try:
            import xgboost as xgb  # type: ignore
        except Exception:
            return False

        try:
            ranker = xgb.XGBRanker(
                objective="rank:ndcg",
                eval_metric="ndcg@10",
                n_estimators=120,
                learning_rate=0.05,
                max_depth=5,
                random_state=42,
            )
            ranker.fit(x, y, group=groups)
            self.model = ranker
            self.backend = "xgboost"
            return True
        except Exception:
            return False

    @staticmethod
    def _groups(rows: Sequence[TrainingRow]) -> List[int]:
        counts: Dict[int, int] = defaultdict(int)
        for user_id, _, _, _ in rows:
            counts[user_id] += 1
        return [count for _, count in sorted(counts.items())]

    @staticmethod
    def _rank_labels(y: np.ndarray) -> np.ndarray:
        """LightGBM/XGBoost ranking expects discrete relevance grades."""
        return np.clip(np.rint(y), 0, 5).astype(np.int32)


class TwoTowerEmbeddingModel:
    def __init__(self, factors: int = 32, learning_rate: float = 0.03, epochs: int = 80, seed: int = 42):
        self.factors = factors
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.seed = seed
        self.user_index: Dict[int, int] = {}
        self.product_index: Dict[int, int] = {}
        self.user_embeddings: Optional[np.ndarray] = None
        self.product_embeddings: Optional[np.ndarray] = None

    def fit(self, interactions: Iterable[Tuple[int, int, float]]) -> None:
        rows = [(int(user_id), int(product_id), float(weight)) for user_id, product_id, weight in interactions]
        if not rows:
            self.user_embeddings = np.zeros((0, self.factors))
            self.product_embeddings = np.zeros((0, self.factors))
            return

        self.user_index = {user_id: index for index, user_id in enumerate(sorted({row[0] for row in rows}))}
        self.product_index = {product_id: index for index, product_id in enumerate(sorted({row[1] for row in rows}))}
        rng = np.random.default_rng(self.seed)
        self.user_embeddings = rng.normal(0, 0.08, size=(len(self.user_index), self.factors))
        self.product_embeddings = rng.normal(0, 0.08, size=(len(self.product_index), self.factors))

        for _ in range(self.epochs):
            rng.shuffle(rows)
            for user_id, product_id, weight in rows:
                user_idx = self.user_index[user_id]
                product_idx = self.product_index[product_id]
                target = min(np.log1p(weight) / 2.5, 1.0)
                prediction = self._sigmoid(float(self.user_embeddings[user_idx] @ self.product_embeddings[product_idx]))
                error = target - prediction
                user_vector = self.user_embeddings[user_idx].copy()
                product_vector = self.product_embeddings[product_idx].copy()
                self.user_embeddings[user_idx] += self.learning_rate * error * product_vector
                self.product_embeddings[product_idx] += self.learning_rate * error * user_vector

    def recommend(self, user_id: int, top_k: int = 20, exclude_ids: Optional[set] = None) -> List[int]:
        if self.user_embeddings is None or self.product_embeddings is None or user_id not in self.user_index:
            return []
        exclude_ids = exclude_ids or set()
        user_vector = self.user_embeddings[self.user_index[user_id]]
        scores = self.product_embeddings @ user_vector
        product_ids = {index: product_id for product_id, index in self.product_index.items()}
        ranked = sorted(
            ((product_ids[index], float(score)) for index, score in enumerate(scores) if product_ids[index] not in exclude_ids),
            key=lambda item: item[1],
            reverse=True,
        )
        return [product_id for product_id, _ in ranked[:top_k]]

    @staticmethod
    def _sigmoid(value: float) -> float:
        return 1.0 / (1.0 + np.exp(-np.clip(value, -20, 20)))


class NeuralCollaborativeFilteringModel(TwoTowerEmbeddingModel):
    """Small NCF-style model implemented with numpy embeddings.

    It learns user/product embeddings and scores with element-wise interaction,
    which gives the ranking service a neural-CF stage without requiring PyTorch.
    """

    def fit(self, interactions: Iterable[Tuple[int, int, float]]) -> None:
        super().fit(interactions)
