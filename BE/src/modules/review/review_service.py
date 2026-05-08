from fastapi import HTTPException

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.review.review_schema import ReviewCreate, ReviewUpdate


class ReviewService:
    @staticmethod
    async def create_review(data: ReviewCreate, current_user):
        if data.userId != current_user.id:
            raise HTTPException(403, "Forbidden")

        existing = await prisma.review.find_first(
            where={
                "userId": current_user.id,
                "productId": data.productId,
            }
        )
        if existing:
            raise HTTPException(400, "You already reviewed this product")

        paid_order = await prisma.order.find_first(
            where={
                "userId": current_user.id,
                "status": {"in": ["DELIVERED", "COMPLETED"]},
                "items": {"some": {"productId": data.productId}},
            }
        )

        # COD orders don't require payment record, so check order status directly
        # MOMO/VNPAY orders require payment record
        payload = data.dict()
        payload["userId"] = current_user.id
        payload["isVerifiedPurchase"] = bool(paid_order)

        return await prisma.review.create(data=payload)

    @staticmethod
    async def get_reviews_by_product(product_id: int):
        return await prisma.review.find_many(
            where={"productId": product_id},
            include={
                "user": True,
                "product": True,
            },
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_all_review():
        return await prisma.review.find_many(
            include={
                "user": True,
                "product": True,
            },
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_review(review_id: int):
        review = await prisma.review.find_unique(
            where={"id": review_id},
            include={
                "user": True,
                "product": True,
            },
        )
        if not review:
            raise HTTPException(404, "Review not found")
        return review

    @staticmethod
    async def update_review(review_id: int, data: ReviewUpdate, current_user):
        existing = await prisma.review.find_unique(where={"id": review_id})
        if not existing:
            raise HTTPException(404, "Review not found")
        if existing.userId != current_user.id and get_role_value(current_user) != "ADMIN":
            raise HTTPException(403, "Forbidden")

        return await prisma.review.update(
            where={"id": review_id},
            data=data.dict(exclude_unset=True),
        )

    @staticmethod
    async def delete_review(review_id: int, current_user):
        existing = await prisma.review.find_unique(where={"id": review_id})
        if not existing:
            raise HTTPException(404, "Review not found")
        if existing.userId != current_user.id and get_role_value(current_user) != "ADMIN":
            raise HTTPException(403, "Forbidden")

        return await prisma.review.delete(where={"id": review_id})

    @staticmethod
    async def get_reviews_by_user(user_id: int):
        return await prisma.review.find_many(
            where={"userId": user_id},
            include={"product": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_reviews_with_pagination(product_id: int, skip: int = 0, limit: int = 10):
        return await prisma.review.find_many(
            where={"productId": product_id},
            include={"user": True},
            skip=skip,
            take=limit,
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_reviews_with_rating_filter(product_id: int, min_rating: int):
        return await prisma.review.find_many(
            where={
                "productId": product_id,
                "rating": {"gte": min_rating},
            },
            include={"user": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_reviews_with_keyword_filter(product_id: int, keyword: str):
        return await prisma.review.find_many(
            where={
                "productId": product_id,
                "comment": {
                    "contains": keyword,
                    "mode": "insensitive",
                },
            },
            include={"user": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_top_rated_reviews(product_id: int, top_n: int = 5):
        return await prisma.review.find_many(
            where={"productId": product_id},
            include={"user": True},
            order={"rating": "desc", "createdAt": "desc"},
            take=top_n,
        )

    @staticmethod
    async def get_recent_reviews(product_id: int, recent_n: int = 5):
        return await prisma.review.find_many(
            where={"productId": product_id},
            include={"user": True},
            order={"createdAt": "desc"},
            take=recent_n,
        )

    @staticmethod
    async def get_review_statistics_for_product(product_id: int):
        result = await prisma.review.aggregate(
            where={"productId": product_id},
            _avg={"rating": True},
            _count={"id": True},
        )

        return {
            "averageRating": result["_avg"]["rating"] or 0,
            "reviewCount": result["_count"]["id"],
        }
