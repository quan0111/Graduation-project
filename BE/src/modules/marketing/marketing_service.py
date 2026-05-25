from datetime import datetime
from typing import Optional

from fastapi import HTTPException

from src.core.database import prisma


class MarketingService:
    @staticmethod
    async def create_banner(user_id: int, data):
        payload = {
            "title": data.title,
            "imageUrl": data.imageUrl,
            "status": data.status if hasattr(data, "status") else "ACTIVE",
            "position": data.position if hasattr(data, "position") else "HOME_TOP",
            "layout": data.layout if hasattr(data, "layout") else "ONE_THIRD",
            "createdBy": {"connect": {"id": user_id}},
        }

        if hasattr(data, "subtitle") and data.subtitle:
            payload["subtitle"] = data.subtitle
        if hasattr(data, "mobileImageUrl") and data.mobileImageUrl:
            payload["mobileImageUrl"] = data.mobileImageUrl
        if hasattr(data, "redirectUrl") and data.redirectUrl:
            payload["redirectUrl"] = data.redirectUrl
        if hasattr(data, "buttonText") and data.buttonText:
            payload["buttonText"] = data.buttonText
        if hasattr(data, "priority") and data.priority is not None:
            payload["priority"] = data.priority
        if hasattr(data, "startAt") and data.startAt:
            payload["startAt"] = data.startAt
        if hasattr(data, "endAt") and data.endAt:
            payload["endAt"] = data.endAt

        return await prisma.banner.create(data=payload)

    @staticmethod
    async def update_banner(banner_id: int, data):
        banner = await prisma.banner.find_unique(where={"id": banner_id})
        if not banner:
            raise HTTPException(404, "Banner not found")

        allowed_fields = {
            "title",
            "subtitle",
            "imageUrl",
            "mobileImageUrl",
            "redirectUrl",
            "buttonText",
            "position",
            "layout",
            "status",
            "priority",
            "startAt",
            "endAt",
        }
        update_data = {
            key: value
            for key, value in data.model_dump(exclude_unset=True).items()
            if key in allowed_fields
        }

        return await prisma.banner.update(where={"id": banner_id}, data=update_data)

    @staticmethod
    async def get_active_banners(position: str | None = None):
        now = datetime.utcnow()
        where = {
            "status": "ACTIVE",
            "deletedAt": None,
            "AND": [
                {"OR": [{"startAt": None}, {"startAt": {"lte": now}}]},
                {"OR": [{"endAt": None}, {"endAt": {"gte": now}}]},
            ],
        }
        if position:
            where["position"] = position

        return await prisma.banner.find_many(
            where=where,
            include={"createdBy": True, "trackings": False},
            order={"priority": "desc"},
        )

    @staticmethod
    async def track_banner_action(user_id: Optional[int], banner_id: int, action: str = "CLICK"):
        banner = await prisma.banner.find_unique(where={"id": banner_id})
        if not banner:
            raise HTTPException(404, "Banner not found")

        normalized_action = action.upper()
        if normalized_action not in {"CLICK", "VIEW"}:
            raise HTTPException(400, "Invalid banner action")

        payload: dict = {
            "banner": {"connect": {"id": banner_id}},
            "action": normalized_action,
        }
        if user_id:
            payload["user"] = {"connect": {"id": user_id}}

        return await prisma.bannertracking.create(data=payload)

    @staticmethod
    async def get_banner_stats(banner_id: int):
        clicks = await prisma.bannertracking.count(
            where={"bannerId": banner_id, "action": "CLICK"}
        )
        views = await prisma.bannertracking.count(
            where={"bannerId": banner_id, "action": "VIEW"}
        )

        return {
            "bannerId": banner_id,
            "clicks": clicks,
            "views": views,
            "ctr": round(clicks / views, 4) if views else 0,
        }

    @staticmethod
    async def get_all_banners():
        return await prisma.banner.find_many(
            where={"deletedAt": None},
            include={"createdBy": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def delete_banner(banner_id: int):
        banner = await prisma.banner.find_unique(where={"id": banner_id})
        if not banner:
            raise HTTPException(404, "Banner not found")

        return await prisma.banner.update(
            where={"id": banner_id},
            data={"deletedAt": datetime.utcnow()},
        )
