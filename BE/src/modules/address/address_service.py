from src.core.database import prisma
from fastapi import HTTPException
from datetime import datetime


class AddressService:

    async def create(self, data):
        return await prisma.address.create(
            data=data.model_dump()
        )
    async def get_by_user(self, user_id: int):
        return await prisma.address.find_many(
            where={
                "userId": user_id,
                "deletedAt": None
            }
        )
    async def get_by_id(self, address_id: int):
        address = await prisma.address.find_unique(
            where={"id": address_id}
        )

        if not address or address.deletedAt:
            raise HTTPException(404, "Address not found")

        return address
    
    async def update(self, address_id: int, data):
        return await prisma.address.update(
            where={"id": address_id},
            data=data.model_dump(exclude_unset=True)
        )

    async def delete(self, address_id: int):
        return await prisma.address.update(
            where={"id": address_id},
            data={"deletedAt": datetime.utcnow()}
        )