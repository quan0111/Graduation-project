from fastapi import HTTPException
from src.core.database import prisma


class ShopFollowerService:
    @staticmethod
    async def follow_shop(user_id: int, shop_id: int):
        shop = await prisma.shop.find_first(where={"id": shop_id, "deletedAt": None})
        if not shop:
            raise HTTPException(404, "Shop not found")

        existing = await prisma.shopfollower.find_unique(
            where={
                "userId_shopId": {
                    "userId": user_id,
                    "shopId": shop_id
                }
            }
        )

        if existing:
            raise HTTPException(400, "Already followed")

        return await prisma.shopfollower.create(
            data={
                "userId": user_id,
                "shopId": shop_id
            }
        )
    @staticmethod
    async def unfollow_shop(user_id: int, shop_id: int):
        existing = await prisma.shopfollower.find_unique(
            where={
                "userId_shopId": {
                    "userId": user_id,
                    "shopId": shop_id
                }
            }
        )
        if not existing:
            return {"message": "Not following"}

        return await prisma.shopfollower.delete(
            where={
                "userId_shopId": {
                    "userId": user_id,
                    "shopId": shop_id
                }
            }
        )

    @staticmethod
    async def is_following(user_id: int, shop_id: int):
        follow = await prisma.shopfollower.find_unique(
            where={
                "userId_shopId": {
                    "userId": user_id,
                    "shopId": shop_id
                }
            }
        )
        return follow is not None
    @staticmethod
    async def get_followed_shops(user_id: int):
        return await prisma.shopfollower.find_many(
            where={"userId": user_id},
            include={"shop": True}
        )
    @staticmethod
    async def get_shop_followers(shop_id: int):
        return await prisma.shopfollower.find_many(
            where={"shopId": shop_id},
            include={"user": True}
        )

    @staticmethod
    async def get_shop_follower_count(shop_id: int):
        return await prisma.shopfollower.count(
            where={"shopId": shop_id}
        )

    @staticmethod
    async def get_user_follow_count(user_id: int):
        return await prisma.shopfollower.count(
            where={"userId": user_id}
        )
