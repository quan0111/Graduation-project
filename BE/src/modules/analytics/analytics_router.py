from fastapi import APIRouter, Depends, HTTPException

from src.core.dependencies import get_current_user, get_optional_current_user, get_role_value, require_admin
from src.modules.analytics.analytics_schema import BehaviorCreate, BehaviorTrackPayload
from src.modules.analytics.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/track")
async def track_event(data: BehaviorCreate, user=Depends(get_current_user)):
    if data.userId != user.id and get_role_value(user) != "ADMIN":
        raise HTTPException(status_code=403, detail="Forbidden")
    return await AnalyticsService.track_event(data)


@router.post("/track/me")
async def track_event_me(data: BehaviorTrackPayload, user=Depends(get_optional_current_user)):
    if not user:
        return {"tracked": False}
    await AnalyticsService.track_event_for_user(user.id, data)
    return {"tracked": True}


@router.get("/product/{product_id}")
async def product_analytics(product_id: int):
    return await AnalyticsService.get_product_analytics(product_id)


@router.get("/user/{user_id}")
async def user_analytics(user_id: int, user=Depends(get_current_user)):
    if user.id != user_id and get_role_value(user) != "ADMIN":
        raise HTTPException(status_code=403, detail="Forbidden")
    return await AnalyticsService.get_user_analytics(user_id)


@router.get("/top-products")
async def top_products(limit: int = 10):
    return await AnalyticsService.get_top_products(limit)


@router.get("/recommend/me")
async def recommend_me(
    top_k: int = 10,
    product_id: int | None = None,
    explain: bool = False,
    query: str | None = None,
    session_id: str | None = None,
    recent_product_ids: str | None = None,
    user=Depends(get_optional_current_user),
):
    return await AnalyticsService.recommend_products_for_optional_user(
        user_id=user.id if user else None,
        top_k=top_k,
        context_product_id=product_id,
        explain=explain,
        query=query,
        session_id=session_id,
        recent_product_ids=_parse_recent_product_ids(recent_product_ids),
    )


@router.post("/recommend/train")
async def retrain_recommender(user=Depends(require_admin)):
    _ = user
    return await AnalyticsService.retrain_model()


@router.post("/recommend/sync-embeddings")
async def sync_recommendation_embeddings(user=Depends(require_admin)):
    _ = user
    return await AnalyticsService.sync_product_embeddings()


@router.get("/recommend/evaluate")
async def evaluate_recommender(k: int = 10, days_back: int = 180, user=Depends(require_admin)):
    _ = user
    return await AnalyticsService.evaluate_recommendations(k=k, days_back=days_back)


@router.get("/recommend/{user_id}")
async def recommend(
    user_id: int,
    top_k: int = 10,
    product_id: int | None = None,
    user=Depends(get_current_user),
):
    if user.id != user_id and get_role_value(user) != "ADMIN":
        raise HTTPException(status_code=403, detail="Forbidden")
    return await AnalyticsService.recommend_products(user_id, top_k=top_k, context_product_id=product_id)


def _parse_recent_product_ids(value: str | None) -> list[int]:
    if not value:
        return []

    product_ids: list[int] = []
    for raw_id in value.split(","):
        try:
            product_id = int(raw_id.strip())
        except ValueError:
            continue
        if product_id <= 0 or product_id in product_ids:
            continue
        product_ids.append(product_id)
        if len(product_ids) >= 20:
            break
    return product_ids
