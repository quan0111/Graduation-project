from fastapi import HTTPException

from src.core.database import prisma


class WishlistService:
    @staticmethod
    async def list_my(user_id: int):
        return await prisma.wishlist.find_many(
            where={"userId": user_id},
            include={"product": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def add(user_id: int, product_id: int):
        product = await prisma.product.find_first(
            where={"id": product_id, "deletedAt": None},
        )
        if not product:
            raise HTTPException(404, "Product not found")
        if product.status in {"BANNED", "DRAFT", "REJECTED"} or product.status != "ACTIVE":
            raise HTTPException(400, "Product is not available")

        return await prisma.wishlist.upsert(
            where={"userId_productId": {"userId": user_id, "productId": product_id}},
            data={
                "create": {
                    "user": {"connect": {"id": user_id}},
                    "product": {"connect": {"id": product_id}},
                },
                "update": {},
            },
            include={"product": True},
        )

    @staticmethod
    async def remove(user_id: int, product_id: int):
        existing = await prisma.wishlist.find_unique(
            where={"userId_productId": {"userId": user_id, "productId": product_id}},
        )
        if not existing:
            return {"message": "Item is not in wishlist"}

        await prisma.wishlist.delete(where={"id": existing.id})
        return {"message": "Removed from wishlist"}

    @staticmethod
    async def is_saved(user_id: int, product_id: int):
        existing = await prisma.wishlist.find_unique(
            where={"userId_productId": {"userId": user_id, "productId": product_id}},
        )
        return {"saved": bool(existing)}
