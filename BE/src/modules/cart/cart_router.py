from fastapi import APIRouter, HTTPException, Request
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

@router.post("/", response_model=CartOut)
async def create_cart(data: CartCreate):
    return await service.create_cart(data)


@router.get("/{cart_id}", response_model=CartDetail)
async def get_cart(cart_id: int):
    return await service.get_cart(cart_id)


@router.get("/user/{user_id}", response_model=CartDetail)
async def get_cart_by_user(user_id: int):
    return await service.get_cart_by_user(user_id)

@router.delete("/{cart_id}")
async def delete_cart(cart_id: int):
    await service.delete_cart(cart_id)
    return {"message": "Cart deleted"}


@router.post("/items", response_model=CartItemOut)
async def add_item(data: CartItemCreate, request: Request):
    user = request.state.user

    if not user:
        raise HTTPException(401, "Unauthorized")

    return await service.add_item(user.id, data)

@router.patch("/items/{item_id}", response_model=CartItemOut)
async def update_item(item_id: int, data: CartItemUpdate):
    return await service.update_item(item_id, data.quantity)


@router.delete("/items/{item_id}")
async def delete_item(item_id: int):
    await service.delete_item(item_id)
    return {"message": "Item deleted"}


@router.delete("/{cart_id}/clear")
async def clear_cart(cart_id: int):
    await service.clear_cart(cart_id)
    return {"message": "Cart cleared"}