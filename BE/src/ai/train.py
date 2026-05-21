import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

import joblib

from src.ai.feature_builder import FeatureBuilder
from src.ai.model import ItemBasedRecommendationModel
from src.ai.pgvector_store import PGVectorStore
from src.ai.ranking_models import GradientBoostingLTRModel, NeuralCollaborativeFilteringModel, TwoTowerEmbeddingModel
from src.core.database import prisma

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
LTR_MODEL_PATH = Path(__file__).resolve().parent / "ltr_model.pkl"
TWO_TOWER_MODEL_PATH = Path(__file__).resolve().parent / "two_tower_model.pkl"
NCF_MODEL_PATH = Path(__file__).resolve().parent / "ncf_model.pkl"
_TRAIN_LOCK = asyncio.Lock()


async def train_model(days_back: int = 180, min_weight: float = 0.5) -> Dict[str, object]:
    async with _TRAIN_LOCK:
        builder = FeatureBuilder()
        interactions = await builder.build_interactions(days_back=days_back, min_weight=min_weight)

        model = ItemBasedRecommendationModel(k_items=40)
        model.fit(interactions)

        ranking_rows = await builder.build_ranking_rows(days_back=days_back)
        ltr_model = GradientBoostingLTRModel()
        ltr_model.fit(ranking_rows)

        two_tower_model = TwoTowerEmbeddingModel()
        two_tower_model.fit(interactions)

        ncf_model = NeuralCollaborativeFilteringModel()
        ncf_model.fit(interactions)

        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            include={"category": True, "shop": True, "tags": True, "attributes": True},
            take=1000,
        )
        embedding_count = await PGVectorStore.upsert_products(products)

        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        trained_at = datetime.now(timezone.utc).isoformat()
        tmp_path = MODEL_PATH.with_suffix(".tmp")

        joblib.dump(
            {
                "model": model,
                "trained_at": trained_at,
                "stats": {
                    "interactions": len(interactions),
                    "users": len(model.user_item_matrix),
                    "items": len(model.item_user_matrix),
                },
            },
            tmp_path,
        )
        os.replace(tmp_path, MODEL_PATH)

        _dump_model(LTR_MODEL_PATH, {"model": ltr_model, "trained_at": trained_at, "rows": len(ranking_rows), "backend": ltr_model.backend})
        _dump_model(TWO_TOWER_MODEL_PATH, {"model": two_tower_model, "trained_at": trained_at, "interactions": len(interactions)})
        _dump_model(NCF_MODEL_PATH, {"model": ncf_model, "trained_at": trained_at, "interactions": len(interactions)})

        return {
            "modelPath": str(MODEL_PATH),
            "ltrModelPath": str(LTR_MODEL_PATH),
            "twoTowerModelPath": str(TWO_TOWER_MODEL_PATH),
            "ncfModelPath": str(NCF_MODEL_PATH),
            "trainedAt": trained_at,
            "interactionCount": len(interactions),
            "rankingRows": len(ranking_rows),
            "ltrBackend": ltr_model.backend,
            "embeddingCount": embedding_count,
            "userCount": len(model.user_item_matrix),
            "itemCount": len(model.item_user_matrix),
        }


def _dump_model(path: Path, payload: Dict[str, object]) -> None:
    tmp_path = path.with_suffix(".tmp")
    joblib.dump(payload, tmp_path)
    os.replace(tmp_path, path)


async def run_training_job(days_back: int = 180, min_weight: float = 0.5):
    await prisma.connect()
    try:
        return await train_model(days_back=days_back, min_weight=min_weight)
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    summary = asyncio.run(run_training_job())
    print(f"Model trained: {summary}")
