from fastapi import APIRouter
from src.modules.analytics.analytics_service import AnalyticsService
from src.modules.analytics.analytics_schema import BehaviorCreate

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/track")
async def track_event(data: BehaviorCreate):
    return await AnalyticsService.track_event(data)



@router.get("/product/{product_id}")
async def product_analytics(product_id: int):
    return await AnalyticsService.get_product_analytics(product_id)


@router.get("/user/{user_id}")
async def user_analytics(user_id: int):
    return await AnalyticsService.get_user_analytics(user_id)


@router.get("/top-products")
async def top_products(limit: int = 10):
    return await AnalyticsService.get_top_products(limit)

@router.get("/recommend/{user_id}")
async def recommend(user_id: int):
    return await AnalyticsService.recommend_products(user_id)