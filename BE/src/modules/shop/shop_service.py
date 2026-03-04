import src.modules.shop.shop_schema as shop_schema
from src.core.database import prisma
from tomlkit import datetime

class ShopService:
    @staticmethod
    async def create_shop(shop_data: shop_schema.ShopCreate):
        shop_dict = shop_data.dict()
        new_shop = await prisma.shop.create(data=shop_dict)
        return new_shop

    @staticmethod
    async def get_all_shops():
        shops = await prisma.shop.find_many()
        return shops

    @staticmethod
    async def get_shop(shop_id: int):
        shop = await prisma.shop.find_unique(where={"id": shop_id})
        return shop

    @staticmethod
    async def update_shop(shop_id: int, shop_data: shop_schema.ShopUpdate):
        update_data = shop_data.dict(exclude_unset=True)
        updated_shop = await prisma.shop.update(where={"id": shop_id}, data=update_data)
        return updated_shop

    @staticmethod
    async def delete_shop(shop_id: int):
       await prisma.shop.update(
    where={"id": shop_id},
    data={"deletedAt": datetime.utcnow()}
)