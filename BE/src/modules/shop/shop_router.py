from src.modules.shop.shop_service import ShopService
from src.modules.shop.shop_schema import ShopCreate, ShopUpdate, ShopOut
from fastapi import APIRouter
from typing import List
router = APIRouter(prefix="/shops", tags=["Shops"])

@router.post("/", response_model=ShopOut)
async def create_shop(shop_data: ShopCreate):
    new_shop = await ShopService.create_shop(shop_data)
    return new_shop
@router.get("/", response_model=List[ShopOut])
async def get_all_shops():
    shops = await ShopService.get_all_shops()
    return shops
@router.get("/{shop_id}", response_model=ShopOut)
async def get_shop_by_id(shop_id: int):
    shop = await ShopService.get_shop(shop_id)
    return shop
@router.patch("/{shop_id}", response_model=ShopOut)
async def update_shop(shop_id: int, shop_data: ShopUpdate):
    updated_shop = await ShopService.update_shop(shop_id, shop_data)
    return updated_shop
@router.patch("/{shop_id}/delete")
async def delete_shop(shop_id: int):
    await ShopService.delete_shop(shop_id)
    return {"message": "Shop deleted successfully"}