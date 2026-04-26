from fastapi import HTTPException
from datetime import datetime
from src.core.database import prisma


class SellerService:

    # ================= APPLY =================
    @staticmethod
    async def apply(user_id: int, data):

        if not data.shopName:
            raise HTTPException(400, "Shop name is required")

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

                "user": {
                    "connect": {"id": user_id}
                }
            }
        )

    # ================= APPROVE =================
    @staticmethod
    async def approve(application_id: int, admin_id: int):

        app = await prisma.sellerapplication.find_unique(
            where={"id": application_id}
        )
        if not app:
            raise HTTPException(404, "Application not found")

        if app.status != "PENDING":
            raise HTTPException(400, "Already processed")

        # check user đã có shop chưa
        existing_shop = await prisma.shop.find_first(
            where={"ownerId": app.userId}
        )
        if existing_shop:
            raise HTTPException(400, "User already has a shop")

        async with prisma.tx() as tx:

            # 🔥 tạo shop chuẩn theo schema
            shop = await tx.shop.create(
                data={
                    "name": app.shopName,
                    "slug": app.shopSlug,  # 👈 tận dụng slug
                    "description": app.description,

                    "owner": {
                        "connect": {"id": app.userId}
                    }
                }
            )

            updated = await tx.sellerapplication.update(
                where={"id": application_id},
                data={
                    "status": "APPROVED",
                    "reviewedAt": datetime.utcnow(),  # 👈 thêm
                    "reviewedBy": {
                        "connect": {"id": admin_id}
                    },
                }
            )

        return updated

    # ================= REJECT =================
    @staticmethod
    async def reject(application_id: int, admin_id: int):

        app = await prisma.sellerapplication.find_unique(
            where={"id": application_id}
        )
        if not app:
            raise HTTPException(404, "Application not found")

        if app.status != "PENDING":
            raise HTTPException(400, "Already processed")

        return await prisma.sellerapplication.update(
            where={"id": application_id},
            data={
                "status": "REJECTED",
                "reviewedAt": datetime.utcnow(),  # 👈 thêm
                "reviewedBy": {
                    "connect": {"id": admin_id}
                }
            }
        )

    # ================= DETAIL =================
    @staticmethod
    async def get_detail(application_id: int):

        data = await prisma.sellerapplication.find_unique(
            where={"id": application_id},
            include={
                "user": True,
                "reviewedBy": True,
            }
        )

        if not data:
            raise HTTPException(404, "Application not found")

        return data

    # ================= MY =================
    @staticmethod
    async def get_my_application(user_id: int):
        return await prisma.sellerapplication.find_first(
            where={"userId": user_id}
        )

    # ================= LIST =================
    @staticmethod
    async def get_all():
        return await prisma.sellerapplication.find_many(
            include={
                "user": True,
                "reviewedBy": True,  # 👈 thêm
            },
            order={"createdAt": "desc"}
        )