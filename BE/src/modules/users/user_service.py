from datetime import datetime
from fastapi import HTTPException
from src.core.database import prisma
from src.modules.users.user_schema import UserCreate, UserUpdate
from src.core.security import hash_password


class UserService:

    @staticmethod
    async def create_user(user_data: UserCreate):
        existing = await prisma.user.find_unique(
            where={"email": user_data.email}
        )
        if existing:
            raise HTTPException(400, "Email already exists")

        hashed_password = hash_password(user_data.password)

        data = user_data.dict()
        data["password"] = hashed_password

        new_user = await prisma.user.create(
            data={
                **data,
                "carts": {
                    "create": {}
                }
            }
        )

        return new_user
    @staticmethod
    async def get_all_users():
        return await prisma.user.find_many(
            where={"deletedAt": None},
            include={
                "addresses": True,
                "carts": True
            }
        )

    @staticmethod
    async def get_user(user_id: int):
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={
                "addresses": True,
                "carts": True,
                "orders": True
            }
        )

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        return user
    @staticmethod
    async def update_user(user_id: int, user_data: UserUpdate):
        existing = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not existing or existing.deletedAt:
            raise HTTPException(404, "User not found")

        data = user_data.dict(exclude_unset=True)

        if "password" in data and data["password"]:
            data["password"] = hash_password(data["password"])
        elif "password" in data:
            del data["password"]

        updated_user = await prisma.user.update(
            where={"id": user_id},
            data=data,
            include={
                "addresses": True,
                "carts": True,
                "orders": True
            }
        )

        return updated_user
    @staticmethod
    async def delete_user(user_id: int):
        existing = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not existing or existing.deletedAt:
            raise HTTPException(404, "User not found")

        return await prisma.user.update(
            where={"id": user_id},
            data={"deletedAt": datetime.utcnow()}
        )