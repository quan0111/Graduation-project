import joblib
from src.ai.model import ItemBasedRecommendationModel
from src.ai.feature_builder import FeatureBuilder

Model_path = "ai/model.pkl"

async def train_model():
    builder = FeatureBuilder()
    interractions = await builder.build_interactions(days_back=180, min_weight=0.5)
    model = ItemBasedRecommendationModel(k_items=50)
    model.fit(interractions)
    joblib.dump(model, Model_path)
    print("Model trained and saved to", Model_path)

if __name__ == "__main__":
    import asyncio
    asyncio.run(train_model())