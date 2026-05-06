from fastapi import APIRouter
from typing import List

from src.modules.seller.seller_service import SellerService
from src.modules.seller.seller_schema import *

router = APIRouter(prefix="/seller", tags=["Seller"])


@router.post("/")
async def apply(data: SellerApplicationCreate, user_id: int):
    return await SellerService.apply(user_id, data)


@router.patch("/{id}/approve")
async def approve(id: int, admin_id: int):
    return await SellerService.approve(id, admin_id)


@router.patch("/{id}/reject")
async def reject(id: int, admin_id: int):
    return await SellerService.reject(id, admin_id)


# 🔥 PHẢI ĐỂ TRƯỚC /{id}
@router.get("/me/{user_id}", response_model=SellerApplicationOut | None)
async def my(user_id: int):
    return await SellerService.get_my_application(user_id)


@router.get("/", response_model=List[SellerApplicationOut])
async def list_all():
    return await SellerService.get_all()


@router.get("/{id}", response_model=SellerApplicationOut)
async def detail(id: int):
    return await SellerService.get_detail(id)