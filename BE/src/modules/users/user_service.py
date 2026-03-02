from datetime import datetime
from fastapi import HTTPException
from src.core.database import prisma
from src.modules.users.user_schema import UserCreate, UserUpdate

class UserService:

    @staticmethod
    async def create_user(user_data: UserCreate):
        hashed_password = user_data.password + "_hashed"  # Replace with real hashing
        user_dict = user_data.dict(exclude={"password"})
        user_dict["hashed_password"] = hashed_password
        new_user = await prisma.user.create(data=user_dict)
        return new_user

    @staticmethod
    async def get_all_users():
        users = await prisma.user.find_many()
        return users

    @staticmethod
    async def get_user(user_id: int):
        user = await prisma.user.find_unique(where={"id": user_id})
        return user
    @staticmethod
    async def update_user(user_id: int, user_data: UserUpdate):
        update_data = user_data.dict(exclude_unset=True)
        updated_user = await prisma.user.update(where={"id": user_id}, data=update_data)
        return updated_user
    @staticmethod
    async def delete_user(user_id: int):
       await prisma.user.update(
    where={"id": user_id},
    data={"deletedAt": datetime.utcnow()}
)   