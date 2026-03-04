from fastapi import APIRouter
from typing import List
from src.modules.review.review_schema import ReviewCreate, ReviewOut
from src.modules.review.review_service import ReviewService     

router = APIRouter(prefix="/reviews", tags=["Reviews"])
@router.post("/", response_model=ReviewOut)
async def create_review(review_data: ReviewCreate):
    new_review = await ReviewService.create_review(review_data)
    return new_review
@router.get("/product/{product_id}", response_model=List[ReviewOut])
async def get_reviews_by_product(product_id: int):
    reviews = await ReviewService.get_reviews_by_product(product_id)
    return reviews
@router.get("/user/{user_id}", response_model=List[ReviewOut])
async def get_reviews_by_user(user_id: int):
    reviews = await ReviewService.get_reviews_by_user(user_id)
    return reviews
@router.delete("/{review_id}")
async def delete_review(review_id: int):
    await ReviewService.delete_review(review_id)
    return {"message": "Review deleted successfully"}
@router.patch("/{review_id}", response_model=ReviewOut)
async def update_review(review_id: int, review_data: ReviewCreate):
    updated_review = await ReviewService.update_review(review_id, review_data)
    return updated_review
@router.get("/{review_id}", response_model=ReviewOut)
async def get_review(review_id: int):
    review = await ReviewService.get_review(review_id)
    return review
@router.get("/product/{product_id}/average")
async def get_average_rating_for_product(product_id: int):
    average_rating = await ReviewService.get_average_rating_for_product(product_id)
    return {"average_rating": average_rating}
@router.get("/product/{product_id}/count")
async def get_review_count_for_product(product_id: int):
    count = await ReviewService.get_review_count_for_product(product_id)
    return {"review_count": count}
@router.get("/product/{product_id}/paginated", response_model=List[ReviewOut])
async def get_reviews_with_pagination(product_id: int, skip: int = 0, limit: int = 10):
    reviews = await ReviewService.get_reviews_with_pagination(product_id, skip, limit)
    return reviews
@router.get("/product/{product_id}/rating_filter", response_model=List[ReviewOut])
async def get_reviews_with_rating_filter(product_id: int, min_rating: int):
    reviews = await ReviewService.get_reviews_with_rating_filter(product_id, min_rating)
    return reviews
@router.get("/product/{product_id}/keyword_filter", response_model=List[ReviewOut])
async def get_reviews_with_keyword_filter(product_id: int, keyword: str):
    reviews = await ReviewService.get_reviews_with_keyword_filter(product_id, keyword)
    return reviews
