from datetime import datetime
import src.modules.shop.shop_schema as shop_schema
from src.core.database import prisma
from fastapi import HTTPException


class ShopService:

    @staticmethod
    async def create_shop(shop_data: shop_schema.ShopCreate):
        data = shop_data.dict()

        if not data.get("ownerId"):
            raise HTTPException(400, "ownerId is required")

        return await prisma.shop.create(
            data={
                "name": data["name"],
                "slug": data.get("slug"),
                "description": data.get("description"),
                "avatarUrl": data.get("avatarUrl"),

                "owner": {
                    "connect": {"id": data["ownerId"]}
                }
            },
            include={
                "owner": True,
            }
        )
    @staticmethod
    async def get_all_shops():
        shops = await prisma.shop.find_many(
            where={"deletedAt": None},
            include={
                "owner": True,
                "products": True   # 👈 FIX: bỏ select
            },
            order={"createdAt": "desc"}
        )

        result = []
        for shop in shops:
            shop_dict = dict(shop)

            shop_dict["productCount"] = len(shop_dict.get("products", []))

            shop_dict.pop("products", None)

            result.append(shop_dict)

        return result
    @staticmethod
    async def get_shop(shop_id: int):
        shop = await prisma.shop.find_first(
            where={
                "id": shop_id,
                "deletedAt": None
            },
            include={
                "owner": True,
                "products": True   # 👈 FIX
            },
        )

        if not shop:
            raise HTTPException(404, "Shop not found")

        shop_dict = dict(shop)
        shop_dict["productCount"] = len(shop_dict.get("products", []))
        shop_dict.pop("products", None)

        return shop_dict

    @staticmethod
    async def get_my_shop(owner_id: int):

        shop = await prisma.shop.find_first(
            where={
                "ownerId": owner_id,
                "deletedAt": None
            },
            include={
                "owner": True,
                "products": True
            }
        )

        if not shop:
            raise HTTPException(404, "Shop not found")

        shop_dict = dict(shop)

        shop_dict["productCount"] = len(
            shop_dict.get("products", [])
        )

        shop_dict.pop("products", None)

        return shop_dict
    @staticmethod
    async def update_shop(shop_id: int, shop_data: shop_schema.ShopUpdate):
        update_data = shop_data.dict(exclude_unset=True)

        existing = await prisma.shop.find_unique(where={"id": shop_id})
        if not existing:
            raise HTTPException(404, "Shop not found")

        data = {}

        if "name" in update_data:
            data["name"] = update_data["name"]

        if "description" in update_data:
            data["description"] = update_data["description"]

        if "ownerId" in update_data:
            data["owner"] = {
                "connect": {"id": update_data["ownerId"]}
            }

        return await prisma.shop.update(
            where={"id": shop_id},
            data=data,
            include={"owner": True}
        )
    @staticmethod
    async def delete_shop(shop_id: int):
        existing = await prisma.shop.find_unique(where={"id": shop_id})
        if not existing:
            raise HTTPException(404, "Shop not found")

        return await prisma.shop.update(
            where={"id": shop_id},
            data={"deletedAt": datetime.utcnow()}
        )