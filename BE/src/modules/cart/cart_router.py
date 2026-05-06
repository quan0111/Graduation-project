from fastapi import APIRouter, Depends

from src.modules.shop.shop_service import ShopService
from src.modules.shop.shop_schema import (
    ShopCreate,
    ShopUpdate,
    ShopOut
)

from src.core.dependencies import get_current_user

from typing import List

router = APIRouter(
    prefix="/shops",
    tags=["Shops"]
)


@router.post("/", response_model=ShopOut)
async def create_shop(shop_data: ShopCreate):
    return await ShopService.create_shop(shop_data)


@router.get("/", response_model=List[ShopOut])
async def get_all_shops():
    return await ShopService.get_all_shops()


@router.get("/me", response_model=ShopOut)
async def get_my_shop(
    user=Depends(get_current_user)
):
    return await ShopService.get_my_shop(user.id)


@router.get("/{shop_id}", response_model=ShopOut)
async def get_shop_by_id(shop_id: int):
    return await ShopService.get_shop(shop_id)


@router.patch("/{shop_id}", response_model=ShopOut)
async def update_shop(
    shop_id: int,
    shop_data: ShopUpdate
):
    return await ShopService.update_shop(
        shop_id,
        shop_data
    )


@router.patch("/{shop_id}/delete")
async def delete_shop(shop_id: int):

    await ShopService.delete_shop(shop_id)

    return {
        "message": "Shop deleted successfully"
    }