from fastapi import APIRouter
from src.modules.coupon.coupon_service import CouponService
from src.modules.coupon.coupon_schema import CouponCreate, CouponUpdate, CouponOut
from typing import List

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/", response_model=CouponOut)
async def create_coupon(coupon_data: CouponCreate):
    new_coupon = await CouponService.create_coupon(coupon_data)
    return new_coupon
@router.get("/", response_model=List[CouponOut])
async def get_all_coupons():
    coupons = await CouponService.get_all_coupons()
    return coupons
@router.get("/{coupon_id}", response_model=CouponOut)
async def get_coupon(coupon_id: int):
    coupon = await CouponService.get_coupon(coupon_id)
    return coupon
@router.patch("/{coupon_id}", response_model=CouponOut)
async def update_coupon(coupon_id: int, coupon_data: CouponUpdate):
    updated_coupon = await CouponService.update_coupon(coupon_id, coupon_data)
    return updated_coupon
@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: int):
    await CouponService.delete_coupon(coupon_id)
    return {"message": "Coupon deleted successfully"}
@router.get("/code/{code}", response_model=CouponOut)
async def get_coupon_by_code(code: str):
    coupon = await CouponService.get_coupon_by_code(code)
    return coupon
@router.get("/active", response_model=List[CouponOut])
async def get_active_coupons():
    coupons = await CouponService.get_active_coupons()
    return coupons
@router.patch("/{coupon_id}/deactivate", response_model=CouponOut)
async def deactivate_coupon(coupon_id: int):
    updated_coupon = await CouponService.deactivate_coupon(coupon_id)
    return updated_coupon
@router.patch("/{coupon_id}/activate", response_model=CouponOut)
async def activate_coupon(coupon_id: int):
    updated_coupon = await CouponService.activate_coupon(coupon_id)
    return updated_coupon
@router.get("/user/{user_id}", response_model=List[CouponOut])
async def get_coupons_by_user(user_id: int):
    coupons = await CouponService.get_coupons_by_user(user_id)
    return coupons
@router.patch("/{coupon_id}/assign/{user_id}", response_model=CouponOut)
async def assign_coupon_to_user(coupon_id: int, user_id: int):
    updated_coupon = await CouponService.assign_coupon_to_user(coupon_id, user_id)
    return updated_coupon
@router.patch("/{coupon_id}/remove")
async def remove_coupon_from_user(coupon_id: int):
    updated_coupon = await CouponService.remove_coupon_from_user(coupon_id)
    return updated_coupon
