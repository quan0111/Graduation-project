from datetime import datetime
from fastapi import HTTPException
from src.core.database import prisma
from src.modules.users.user_schema import UserCreate, UserProfileUpdate, UserUpdate
from src.core.security import hash_password


class UserService:

    @staticmethod
    def _serialize_profile(user):
        return {
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "phone": user.phone,
            "avatarUrl": user.avatarUrl,
            "role": user.role,
            "isActive": user.isActive,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt,
        }

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

    @staticmethod
    async def get_current_user_profile(user_id: int):
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        return UserService._serialize_profile(user)

    @staticmethod
    async def update_current_user_profile(user_id: int, user_data: UserProfileUpdate):
        existing = await prisma.user.find_unique(where={"id": user_id})

        if not existing or existing.deletedAt:
            raise HTTPException(404, "User not found")

        data = user_data.dict(exclude_unset=True)
        email = data.get("email")

        if email and email != existing.email:
            duplicate = await prisma.user.find_first(
                where={
                    "email": email,
                    "NOT": {"id": user_id},
                }
            )
            if duplicate:
                raise HTTPException(400, "Email already exists")

        updated_user = await prisma.user.update(
            where={"id": user_id},
            data=data,
        )

        return UserService._serialize_profile(updated_user)
