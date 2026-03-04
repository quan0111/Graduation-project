from fastapi import APIRouter
from src.modules.follower.follower_schema import FollowerCreate, FollowerOut
from src.core.database import prisma

class FollowerService:
    @staticmethod
    async def create_follower(follower_data: FollowerCreate):
        new_follower = await prisma.follower.create(data=follower_data.dict())
        return new_follower
    @staticmethod
    async def get_followers_by_user(user_id: int):
        followers = await prisma.follower.find_many(where={"userId": user_id})
        return followers
    @staticmethod
    async def get_following_by_user(user_id: int):
        following = await prisma.follower.find_many(where={"followerId": user_id})
        return following
    @staticmethod
    async def delete_follower(follower_id: int):
        await prisma.follower.delete(where={"id": follower_id})
    @staticmethod
    async def get_follower(follower_id: int):
        follower = await prisma.follower.find_unique(where={"id": follower_id})
        return follower
    @staticmethod
    async def is_following(follower_id: int, user_id: int):
        follow = await prisma.follower.find_first(where={"followerId": follower_id, "userId": user_id})
        return follow is not None
    @staticmethod
    async def get_followers_count(user_id: int):
        count = await prisma.follower.count(where={"userId": user_id})
        return count
    @staticmethod
    async def get_following_count(user_id: int):
        count = await prisma.follower.count(where={"followerId": user_id})
        return count
    @staticmethod
    async def get_followers_with_details(user_id: int):
        followers = await prisma.follower.find_many(
            where={"userId": user_id},
            include={"follower": True}
        )
        return followers
    @staticmethod
    async def get_following_with_details(user_id: int):
        following = await prisma.follower.find_many(
            where={"followerId": user_id},
            include={"user": True}
        )
        return following
    @staticmethod
    async def get_mutual_followers(user_id: int):
        followers = await prisma.follower.find_many(where={"userId": user_id})
        following = await prisma.follower.find_many(where={"followerId": user_id})
        follower_ids = {f.followerId for f in followers}
        mutual_followers = [f for f in following if f.userId in follower_ids]
        return mutual_followers
    @staticmethod
    async def unfolow(user_id: int, follower_id: int):
        await prisma.follower.delete_many(where={"userId": user_id, "followerId": follower_id})
    @staticmethod
    async def unfollow_all(user_id: int):
        await prisma.follower.delete_many(where={"userId": user_id})