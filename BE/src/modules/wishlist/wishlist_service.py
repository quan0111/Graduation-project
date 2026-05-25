from fastapi import HTTPException

from src.core.database import prisma
from src.modules.product.service.product import ProductService


class WishlistService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _serialize_wishlist_item(item):
        data = item.model_dump()
        if data.get("product"):
            data["product"] = ProductService._serialize_product_dict(data["product"])
        return data

    @staticmethod
    async def list_my(user_id: int):
        items = await prisma.wishlist.find_many(
            where={"userId": user_id},
            include={"product": {"include": ProductService.PRODUCT_INCLUDE}},
            order={"createdAt": "desc"},
        )
        return [WishlistService._serialize_wishlist_item(item) for item in items]

    @staticmethod
    async def add(user_id: int, product_id: int):
        product = await prisma.product.find_first(
            where={"id": product_id, "deletedAt": None},
        )
        if not product:
            raise HTTPException(404, "Product not found")
        product_status = WishlistService._to_value(product.status)
        if product_status in {"BANNED", "DRAFT", "REJECTED"} or product_status != "ACTIVE":
            raise HTTPException(400, "Product is not available")

        item = await prisma.wishlist.upsert(
            where={"userId_productId": {"userId": user_id, "productId": product_id}},
            data={
                "create": {
                    "user": {"connect": {"id": user_id}},
                    "product": {"connect": {"id": product_id}},
                },
                "update": {},
            },
            include={"product": {"include": ProductService.PRODUCT_INCLUDE}},
        )
        return WishlistService._serialize_wishlist_item(item)

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
