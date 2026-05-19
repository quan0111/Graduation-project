import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

import joblib

from src.ai.feature_builder import FeatureBuilder
from src.ai.model import ItemBasedRecommendationModel
from src.core.database import prisma

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
_TRAIN_LOCK = asyncio.Lock()


async def train_model(days_back: int = 180, min_weight: float = 0.5) -> Dict[str, object]:
    async with _TRAIN_LOCK:
        builder = FeatureBuilder()
        interactions = await builder.build_interactions(days_back=days_back, min_weight=min_weight)

        model = ItemBasedRecommendationModel(k_items=40)
        model.fit(interactions)

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

        return {
            "modelPath": str(MODEL_PATH),
            "trainedAt": trained_at,
            "interactionCount": len(interactions),
            "userCount": len(model.user_item_matrix),
            "itemCount": len(model.item_user_matrix),
        }


async def run_training_job(days_back: int = 180, min_weight: float = 0.5):
    await prisma.connect()
    try:
        return await train_model(days_back=days_back, min_weight=min_weight)
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    summary = asyncio.run(run_training_job())
    print(f"Model trained: {summary}")
