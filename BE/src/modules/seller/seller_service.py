from fastapi import HTTPException
from datetime import datetime
from src.core.database import prisma


class SellerService:

    @staticmethod
    async def apply(user_id: int, data):

        if not data.shopName:
            raise HTTPException(400, "Shop name is required")

        # ❗ chỉ chặn khi còn PENDING (cho phép apply lại nếu bị reject)
        existing = await prisma.sellerapplication.find_first(
            where={
                "userId": user_id,
                "status": "PENDING"
            }
        )
        if existing:
            raise HTTPException(400, "You already have a pending application")

        return await prisma.sellerapplication.create(
            data={
                **data.model_dump(),  # 🔥 lấy toàn bộ field từ schema

                "status": "PENDING",

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

        existing_shop = await prisma.shop.find_first(
            where={"ownerId": app.userId}
        )

        if existing_shop:
            raise HTTPException(400, "User already has a shop")

        try:

            async with prisma.tx() as tx:

                # ✅ CREATE SHOP
                await tx.shop.create(
                    data={
                        "name": app.shopName,
                        "slug": app.shopSlug,
                        "description": app.description,

                        "avatarUrl": app.logoUrl,

                        "ownerId": app.userId,
                    }
                )

                # ✅ UPDATE USER ROLE
                await tx.user.update(
                    where={"id": app.userId},
                    data={
                        "role": "SELLER"
                    }
                )

                # ✅ UPDATE APPLICATION
                updated = await tx.sellerapplication.update(
                    where={"id": application_id},
                    data={
                        "status": "APPROVED",
                        "reviewedAt": datetime.utcnow(),

                        "reviewedBy": {
                            "connect": {"id": admin_id}
                        }
                    }
                )

                return updated

        except Exception as e:
            print(e)
            raise HTTPException(500, str(e))
        
    @staticmethod
    async def reject(application_id: int, admin_id: int, note: str | None = None):

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
                "note": note,

                "reviewedAt": datetime.utcnow(),

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
                "reviewedBy": True,
            }
        )

        if not data:
            raise HTTPException(404, "Application not found")

        return data

    @staticmethod
    async def get_my_application(user_id: int):
        return await prisma.sellerapplication.find_first(
            where={"userId": user_id},
        )

    @staticmethod
    async def get_all():
        return await prisma.sellerapplication.find_many(
            include={
                "user": True,
                "reviewedBy": True,
            },
            order={"createdAt": "desc"}
        )