from fastapi import HTTPException
from src.core.database import prisma
from src.modules.review.review_schema import ReviewCreate, ReviewUpdate

class ReviewService:
    @staticmethod
    async def create_review(review_data: ReviewCreate):
        new_review = await prisma.review.create(data=review_data.dict())
        return new_review
    @staticmethod
    async def get_reviews_by_product(product_id: int):
        reviews = await prisma.review.find_many(where={"productId": product_id})
        return reviews
    @staticmethod
    async def get_review(review_id: int):
        review = await prisma.review.find_unique(where={"id": review_id})
        return review
    @staticmethod
    async def update_review(review_id: int, review_data: ReviewUpdate):
        update_data = review_data.dict(exclude_unset=True)
        updated_review = await prisma.review.update(where={"id": review_id}, data=update_data)
        return updated_review
    @staticmethod
    async def delete_review(review_id: int):
        await prisma.review.delete(where={"id": review_id})
    @staticmethod
    async def get_reviews_by_user(user_id: int):
        reviews = await prisma.review.find_many(where={"userId": user_id})
        return reviews
    @staticmethod
    async def get_average_rating_for_product(product_id: int):
        reviews = await prisma.review.find_many(where={"productId": product_id})
        if not reviews:
            return 0
        average_rating = sum(review.rating for review in reviews) / len(reviews)
        return average_rating
    @staticmethod
    async def get_review_count_for_product(product_id: int):
        count = await prisma.review.count(where={"productId": product_id})
        return count
    @staticmethod
    async def get_reviews_with_pagination(product_id: int, skip: int = 0, limit: int = 10):
        reviews = await prisma.review.find_many(
            where={"productId": product_id},
            skip=skip,
            take=limit,
            order={"createdAt": "desc"}
        )
        return reviews
    @staticmethod
    async def get_reviews_with_rating_filter(product_id: int, min_rating: int):
        reviews = await prisma.review.find_many(
            where={"productId": product_id, "rating": {"gte": min_rating}},
            order={"createdAt": "desc"}
        )
        return reviews
    @staticmethod
    async def get_reviews_with_keyword_filter(product_id: int, keyword: str):
        reviews = await prisma.review.find_many(
            where={
                "productId": product_id,
                "OR": [
                    {"comment": {"contains": keyword, "mode": "insensitive"}},
                    {"title": {"contains": keyword, "mode": "insensitive"}}
                ]
            },
            order={"createdAt": "desc"}
        )
        return reviews
    @staticmethod
    async def get_top_rated_reviews(product_id: int, top_n: int = 5):
        reviews = await prisma.review.find_many(
            where={"productId": product_id},
            order={"rating": "desc", "createdAt": "desc"},
            take=top_n
        )
        return reviews
    @staticmethod
    async def get_recent_reviews(product_id: int, recent_n: int = 5):
        reviews = await prisma.review.find_many(
            where={"productId": product_id},
            order={"createdAt": "desc"},
            take=recent_n
        )
        return reviews
    @staticmethod
    async def get_reviews_with_user_info(product_id: int):
        reviews = await prisma.review.find_many(
            where={"productId": product_id},
            include={"user": True},
            order={"createdAt": "desc"}
        )
        return reviews
    @staticmethod
    async def get_reviews_with_product_info(user_id: int):
        reviews = await prisma.review.find_many(
            where={"userId": user_id},
            include={"product": True},
            order={"createdAt": "desc"}
        )
        return reviews
    @staticmethod
    async def get_review_statistics_for_product(product_id: int):
        reviews = await prisma.review.find_many(where={"productId": product_id})
        if not reviews:
            return {"averageRating": 0, "reviewCount": 0}
        average_rating = sum(review.rating for review in reviews) / len(reviews)
        review_count = len(reviews)
        return {"averageRating": average_rating, "reviewCount": review_count}
    @staticmethod
    async def get_review_statistics_for_user(user_id: int):
        reviews = await prisma.review.find_many(where={"userId": user_id})
        if not reviews:
            return {"averageRating": 0, "reviewCount": 0}
        average_rating = sum(review.rating for review in reviews) / len(reviews)
        review_count = len(reviews)
        return {"averageRating": average_rating, "reviewCount": review_count}
