from src.core.database import prisma
from fastapi import HTTPException
from datetime import datetime


class AddressService:

    async def create(self, user_id: int, data):

        # 🔥 reset default nếu cần
        if data.isDefault:
            await prisma.address.update_many(
                where={"userId": user_id},
                data={"isDefault": False}
            )

        return await prisma.address.create(
            data={
                **data.model_dump(),
                "user": {
                    "connect": {"id": user_id}
                }
            },
            include={"user": True}  # 🔥 thêm dòng này
        )

    async def get_by_user(self, user_id: int):
        return await prisma.address.find_many(
            where={
                "userId": user_id,
                "deletedAt": None
            },
            include={"user": True},
            order=[
                {"isDefault": "desc"},  # 🔥 default lên đầu
                {"createdAt": "desc"}
            ]
        )

    async def get_default(self, user_id: int):
        return await prisma.address.find_first(
            where={
                "userId": user_id,
                "isDefault": True,
                "deletedAt": None
            },
            include={"user": True}
        )

    async def get_by_id(self, user_id: int, address_id: int):

        address = await prisma.address.find_unique(
            where={"id": address_id},
            include={"user": True}
        )

        if not address or address.deletedAt:
            raise HTTPException(404, "Address not found")

        if address.userId != user_id:
            raise HTTPException(403, "Forbidden")

        return address

    async def update(self, user_id: int, address_id: int, data):

        address = await prisma.address.find_unique(
            where={"id": address_id}
        )

        if not address or address.deletedAt:
            raise HTTPException(404, "Address not found")

        if address.userId != user_id:
            raise HTTPException(403, "Forbidden")

        update_data = data.model_dump(exclude_unset=True)

        # 🔥 reset default
        if update_data.get("isDefault"):
            await prisma.address.update_many(
                where={"userId": user_id},
                data={"isDefault": False}
            )

        return await prisma.address.update(
            where={"id": address_id},
            data=update_data,
            include={"user": True}
        )

    async def delete(self, user_id: int, address_id: int):

        address = await prisma.address.find_unique(
            where={"id": address_id}
        )

        if not address or address.deletedAt:
            raise HTTPException(404, "Address not found")

        if address.userId != user_id:
            raise HTTPException(403, "Forbidden")

        return await prisma.address.update(
            where={"id": address_id},
            data={"deletedAt": datetime.utcnow()}
        )