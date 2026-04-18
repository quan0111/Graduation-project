from fastapi import HTTPException
from src.core.database import prisma


class SellerService:

    @staticmethod
    async def apply(user_id: int, data):

        # ❗ check đã apply chưa
        existing = await prisma.sellerapplication.find_first(
            where={"userId": user_id}
        )
        if existing:
            raise HTTPException(400, "Already applied")

        return await prisma.sellerapplication.create(
            data={
                "shopName": data.shopName,
                "description": data.description,
                "status": "PENDING",

                # 🔥 RELATION
                "user": {
                    "connect": {"id": user_id}
                }
            }
        )
    @staticmethod
    async def approve(application_id: int, admin_id: int):

        app = await prisma.sellerapplication.find_unique(
            where={"id": application_id}
        )
        if not app:
            raise HTTPException(404, "Application not found")

        if app.status != "PENDING":
            raise HTTPException(400, "Already processed")

        # 🔥 tạo shop luôn
        shop = await prisma.shop.create(
            data={
                "name": app.shopName,
                "owner": {
                    "connect": {"id": app.userId}
                }
            }
        )

        return await prisma.sellerapplication.update(
            where={"id": application_id},
            data={
                "status": "APPROVED",
                "reviewedBy": {
                    "connect": {"id": admin_id}
                },
                "shop": {
                    "connect": {"id": shop.id}
                }
            }
        )

    @staticmethod
    async def reject(application_id: int, admin_id: int):

        return await prisma.sellerapplication.update(
            where={"id": application_id},
            data={
                "status": "REJECTED",
                "reviewedBy": {
                    "connect": {"id": admin_id}
                }
            }
        )

    @staticmethod
    async def get_detail(application_id: int):

        data = await prisma.sellerapplication.find_unique(
            where={"id": application_id},
            include={
                "user": True,
                "shop": True,
                "reviewedBy": True
            }
        )

        if not data:
            raise HTTPException(404, "Application not found")

        return data

    @staticmethod
    async def get_my_application(user_id: int):
        return await prisma.sellerapplication.find_first(
            where={"userId": user_id},
            include={
                "shop": True
            }
        )

    @staticmethod
    async def get_all():
        return await prisma.sellerapplication.find_many(
            include={
                "user": True,
                "shop": True
            },
            order={"createdAt": "desc"}
        )