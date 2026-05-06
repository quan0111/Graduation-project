from fastapi import APIRouter
from typing import List
from src.modules.review.review_schema import ReviewCreate, ReviewUpdate, ReviewOut
from src.modules.review.review_service import ReviewService     

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewOut)
async def create_review(review_data: ReviewCreate):
    return await ReviewService.create_review(review_data)
@router.get("/", response_model=List[ReviewOut])
async def get_all_reviews():
    return await ReviewService.get_all_review()
@router.get("/product/{product_id}", response_model=List[ReviewOut])
async def get_reviews_by_product(product_id: int):
    return await ReviewService.get_reviews_by_product(product_id)


@router.get("/user/{user_id}", response_model=List[ReviewOut])
async def get_reviews_by_user(user_id: int):
    return await ReviewService.get_reviews_by_user(user_id)


@router.get("/detail/{review_id}", response_model=ReviewOut)
async def get_review(review_id: int):
    return await ReviewService.get_review(review_id)


@router.patch("/{review_id}", response_model=ReviewOut)
async def update_review(review_id: int, review_data: ReviewUpdate):
    return await ReviewService.update_review(review_id, review_data)


@router.delete("/{review_id}")
async def delete_review(review_id: int):
    await ReviewService.delete_review(review_id)
    return {"message": "Review deleted successfully"}


@router.get("/product/{product_id}/paginated", response_model=List[ReviewOut])
async def get_reviews_with_pagination(product_id: int, skip: int = 0, limit: int = 10):
    return await ReviewService.get_reviews_with_pagination(product_id, skip, limit)


@router.get("/product/{product_id}/rating", response_model=List[ReviewOut])
async def get_reviews_with_rating_filter(product_id: int, min_rating: int):
    return await ReviewService.get_reviews_with_rating_filter(product_id, min_rating)


@router.get("/product/{product_id}/search", response_model=List[ReviewOut])
async def get_reviews_with_keyword_filter(product_id: int, keyword: str):
    return await ReviewService.get_reviews_with_keyword_filter(product_id, keyword)


@router.get("/product/{product_id}/stats")
async def get_review_stats(product_id: int):
    return await ReviewService.get_review_statistics_for_product(product_id)