from fastapi import APIRouter
from typing import List
from src.modules.cart.cart_service import CartService
from src.modules.cart.cart_schema import (
    CartCreate,
    CartOut,
    CartDetail,
    CartItemCreate,
    CartItemUpdate,
    CartItemOut
)
from src.modules.cart.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])
service = CartService()




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


@router.delete("/{cart_id}")
async def delete_cart(cart_id: int):
    await service.delete_cart(cart_id)
    return {"message": "Cart deleted"}


@router.post("/items", response_model=CartItemOut)
async def add_item(data: CartItemCreate):
    return await service.add_item(data)


@router.put("/items/{item_id}", response_model=CartItemOut)
async def update_item(item_id: int, data: CartItemUpdate):
    return await service.update_item(item_id, data.quantity)


@router.patch("/{shop_id}/delete")
async def delete_shop(shop_id: int):

    await ShopService.delete_shop(shop_id)

    return {
        "message": "Shop deleted successfully"
    }