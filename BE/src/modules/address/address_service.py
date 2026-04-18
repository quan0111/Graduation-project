from src.core.database import prisma
from fastapi import HTTPException
from datetime import datetime


class AddressService:

    async def create(self, user_id: int, data):

        # 🔥 nếu set default → reset các address khác
        if data.isDefault:
            await prisma.address.update_many(
                where={"userId": user_id},
                data={"isDefault": False}
            )

        return await prisma.address.create(
            data={
                **data.model_dump(),

                # 🔥 RELATION CHUẨN
                "user": {
                    "connect": {"id": user_id}
                }
            }
        )
    async def get_by_user(self, user_id: int):
        return await prisma.address.find_many(
            where={
                "userId": user_id,
                "deletedAt": None
            },
            include={
                "user": True
            },
            order={"createdAt": "desc"}
        )
    async def get_by_id(self, user_id: int, address_id: int):

        address = await prisma.address.find_unique(
            where={"id": address_id}
        )

        if not address or address.deletedAt:
            raise HTTPException(404, "Address not found")

        # 🔥 check ownership
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
        if update_data.get("isDefault"):
            await prisma.address.update_many(
                where={"userId": user_id},
                data={"isDefault": False}
            )

        return await prisma.address.update(
            where={"id": address_id},
            data=update_data
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