from typing import List

from fastapi import APIRouter, Depends

from src.core.dependencies import get_current_user
from src.modules.wishlist.wishlist_schema import WishlistOut
from src.modules.wishlist.wishlist_service import WishlistService

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/", response_model=List[WishlistOut])
async def list_my_wishlist(user=Depends(get_current_user)):
    return await WishlistService.list_my(user.id)


@router.post("/{product_id}", response_model=WishlistOut)
async def add_to_wishlist(product_id: int, user=Depends(get_current_user)):
    return await WishlistService.add(user.id, product_id)


@router.delete("/{product_id}")
async def remove_from_wishlist(product_id: int, user=Depends(get_current_user)):
    return await WishlistService.remove(user.id, product_id)


@router.get("/{product_id}/status")
async def get_wishlist_status(product_id: int, user=Depends(get_current_user)):
    return await WishlistService.is_saved(user.id, product_id)
