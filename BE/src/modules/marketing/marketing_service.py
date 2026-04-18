from fastapi import HTTPException
from git import Optional
from src.core.database import prisma


class MarketingService:


    @staticmethod
    async def create_banner(user_id: int, data):

        return await prisma.banner.create(
            data={
                "title": data.title,
                "imageUrl": data.imageUrl,
                "link": data.link,
                "isActive": True,

                # 🔥 RELATION
                "createdBy": {
                    "connect": {"id": user_id}
                },

                **(
                    {"shop": {"connect": {"id": data.shopId}}}
                    if data.shopId else {}
                ),

                **(
                    {"category": {"connect": {"id": data.categoryId}}}
                    if data.categoryId else {}
                )
            }
        )

    @staticmethod
    async def update_banner(banner_id: int, data):

        banner = await prisma.banner.find_unique(
            where={"id": banner_id}
        )
        if not banner:
            raise HTTPException(404, "Banner not found")

        return await prisma.banner.update(
            where={"id": banner_id},
            data=data.dict(exclude_unset=True)
        )

    @staticmethod
    async def get_active_banners():

        return await prisma.banner.find_many(
            where={"isActive": True},
            include={
                "shop": True,
                "category": True,
                "createdBy": True
            },
            order={"createdAt": "desc"}
        )
    
    @staticmethod
    async def track_click(user_id: Optional[int], data):

        banner = await prisma.banner.find_unique(
            where={"id": data.bannerId}
        )
        if not banner:
            raise HTTPException(404, "Banner not found")

        return await prisma.bannertracking.create(
            data={
                "banner": {
                    "connect": {"id": data.bannerId}
                },

                **(
                    {"user": {"connect": {"id": user_id}}}
                    if user_id else {}
                )
            }
        )

    @staticmethod
    async def get_banner_stats(banner_id: int):

        clicks = await prisma.bannertracking.count(
            where={"bannerId": banner_id}
        )

        return {
            "bannerId": banner_id,
            "clicks": clicks
        }


    @staticmethod
    async def get_all_banners():

        return await prisma.banner.find_many(
            include={
                "shop": True,
                "category": True,
                "createdBy": True
            },
            order={"createdAt": "desc"}
        )