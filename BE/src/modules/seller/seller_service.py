from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value


class SellerService:
    @staticmethod
    async def apply(user_id: int, data):
        if not data.shopName:
            raise HTTPException(400, "Shop name is required")

        user = await prisma.user.find_unique(where={"id": user_id})
        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        if get_role_value(user) == "SELLER":
            raise HTTPException(400, "User is already a seller")

        existing_shop = await prisma.shop.find_first(
            where={
                "ownerId": user_id,
                "deletedAt": None,
            }
        )
        if existing_shop:
            raise HTTPException(400, "User already has a shop")

        existing = await prisma.sellerapplication.find_first(
            where={
                "userId": user_id,
                "status": "PENDING",
            }
        )
        if existing:
            raise HTTPException(400, "You already have a pending application")

        payload = data.model_dump()
        if payload.get("shippingOptions") is not None:
            payload["shippingOptions"] = Json(payload["shippingOptions"])
        if payload.get("taxInfo") is not None:
            payload["taxInfo"] = Json(payload["taxInfo"])

        return await prisma.sellerapplication.create(
            data={
                **payload,
                "status": "PENDING",
                "user": {
                    "connect": {"id": user_id}
                },
            }
        )

    @staticmethod
    async def approve(application_id: int, admin_id: int):
        application = await prisma.sellerapplication.find_unique(where={"id": application_id})

        if not application:
            raise HTTPException(404, "Application not found")

        if application.status != "PENDING":
            raise HTTPException(400, "Already processed")

        existing_shop = await prisma.shop.find_first(where={"ownerId": application.userId})
        if existing_shop:
            raise HTTPException(400, "User already has a shop")

        try:
            async with prisma.tx() as transaction:
                await transaction.shop.create(
                    data={
                        "name": application.shopName,
                        "slug": application.shopSlug,
                        "description": application.description,
                        "avatarUrl": application.logoUrl,
                        "ownerId": application.userId,
                    }
                )

                await transaction.user.update(
                    where={"id": application.userId},
                    data={"role": "SELLER"},
                )

                return await transaction.sellerapplication.update(
                    where={"id": application_id},
                    data={
                        "status": "APPROVED",
                        "reviewedAt": datetime.utcnow(),
                        "reviewedBy": {
                            "connect": {"id": admin_id}
                        },
                    },
                )
        except Exception as exc:
            raise HTTPException(500, str(exc)) from exc

    @staticmethod
    async def reject(application_id: int, admin_id: int, note: str | None = None):
        application = await prisma.sellerapplication.find_unique(where={"id": application_id})

        if not application:
            raise HTTPException(404, "Application not found")

        if application.status != "PENDING":
            raise HTTPException(400, "Already processed")

        return await prisma.sellerapplication.update(
            where={"id": application_id},
            data={
                "status": "REJECTED",
                "note": note,
                "reviewedAt": datetime.utcnow(),
                "reviewedBy": {
                    "connect": {"id": admin_id}
                },
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
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_all():
        return await prisma.sellerapplication.find_many(
            include={
                "user": True,
                "reviewedBy": True,
            },
            order={"createdAt": "desc"},
        )
