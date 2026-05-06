from fastapi import APIRouter, Depends, HTTPException
from typing import List

from src.core.dependencies import get_current_user
from src.modules.seller.seller_schema import *
from src.modules.seller.seller_service import SellerService

router = APIRouter(prefix="/seller", tags=["Seller"])


@router.post("/")
async def apply(data: SellerApplicationCreate, user=Depends(get_current_user)):
    if user.role == "ADMIN":
        raise HTTPException(403, "Admin account cannot apply seller")
    return await SellerService.apply(user.id, data)


@router.patch("/{id}/approve")
async def approve(id: int, user=Depends(get_current_user)):
    if user.role != "ADMIN":
        raise HTTPException(403, "Admin only")
    return await SellerService.approve(id, user.id)


@router.patch("/{id}/reject")
async def reject(id: int, user=Depends(get_current_user)):
    if user.role != "ADMIN":
        raise HTTPException(403, "Admin only")
    return await SellerService.reject(id, user.id)


@router.get("/me", response_model=SellerApplicationOut | None)
async def my_current(user=Depends(get_current_user)):
    return await SellerService.get_my_application(user.id)


@router.get("/me/{user_id}", response_model=SellerApplicationOut | None)
async def my(user_id: int):
    return await SellerService.get_my_application(user_id)


@router.get("/", response_model=List[SellerApplicationOut])
async def list_all():
    return await SellerService.get_all()


@router.get("/{id}", response_model=SellerApplicationOut)
async def detail(id: int):
    return await SellerService.get_detail(id)
