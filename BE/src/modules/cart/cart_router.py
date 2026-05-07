from fastapi import APIRouter, Depends

from src.modules.cart.cart_service import CartService
from src.modules.cart.cart_schema import (
    CartCreate,
    CartOut,
    CartDetail,
    CartItemCreate,
    CartItemUpdate,
    CartItemOut
)

from src.core.dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

service = CartService()


@router.post("/", response_model=CartOut)
async def create_cart(data: CartCreate, user=Depends(get_current_user)):
    _ = data
    return await service.get_or_create_cart(user.id)


# 🔥 NEW - Must be defined before /{cart_id} to avoid path matching conflict
@router.get("/me", response_model=CartDetail)
async def get_my_cart(
    user=Depends(get_current_user)
):
    return await service.get_cart_by_user(user.id)


@router.get("/{cart_id}", response_model=CartDetail)
async def get_cart(cart_id: int, user=Depends(get_current_user)):
    return await service.get_cart_for_user(cart_id, user)


@router.delete("/{cart_id}")
async def delete_cart(cart_id: int, user=Depends(get_current_user)):
    await service.clear_cart(cart_id, user.id)
    return {"message": "Cart deleted"}


@router.post("/items", response_model=CartItemOut)
async def add_item(
    data: CartItemCreate,
    user=Depends(get_current_user)
):
    return await service.add_item(user.id, data)


@router.patch("/items/{item_id}", response_model=CartItemOut)
async def update_item(
    item_id: int,
    data: CartItemUpdate,
    user=Depends(get_current_user),
):
    return await service.update_item(
        item_id,
        data.quantity,
        user.id,
    )


@router.delete("/items/{item_id}")
async def delete_item(item_id: int, user=Depends(get_current_user)):
    await service.delete_item(item_id, user.id)
    return {"message": "Item deleted"}


@router.delete("/{cart_id}/clear")
async def clear_cart(cart_id: int, user=Depends(get_current_user)):
    await service.clear_cart(cart_id, user.id)
    return {"message": "Cart cleared"}
