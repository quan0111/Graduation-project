from typing import List

from fastapi import APIRouter, Depends

from src.core.dependencies import get_current_user, require_admin, require_seller_or_admin
from src.modules.coupon.coupon_schema import CouponCreate, CouponOut, CouponUpdate
from src.modules.coupon.coupon_service import CouponService

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/", response_model=CouponOut)
async def create_coupon(coupon_data: CouponCreate, user=Depends(require_seller_or_admin)):
    new_coupon = await CouponService.create_coupon(coupon_data, user)
    return new_coupon
@router.get("/", response_model=List[CouponOut])
async def get_all_coupons(user=Depends(get_current_user)):
    _ = user
    coupons = await CouponService.get_all_coupons()
    return coupons

@router.get("/code/{code}", response_model=CouponOut)
async def get_coupon_by_code(code: str):
    coupon = await CouponService.get_coupon_by_code(code)
    return coupon
@router.get("/validate/{code}/{order_amount}")
async def validate_coupon(code: str, order_amount: float, user=Depends(get_current_user)):
    validation_result = await CouponService.validate_coupon(code, order_amount, user.id)
    return validation_result

@router.patch("/use/{coupon_id}")
async def use_coupon(coupon_id: int, order_id: int, user=Depends(require_admin)):
    _ = user
    used_coupon = await CouponService.use_coupon(coupon_id, order_id=order_id)
    return used_coupon

@router.get("/{coupon_id}", response_model=CouponOut)
async def get_coupon(coupon_id: int, user=Depends(get_current_user)):
    _ = user
    coupon = await CouponService.get_coupon(coupon_id)
    return coupon

@router.get("/{coupon_id}/discount/{order_amount}")
async def calculate_discount(coupon_id: int, order_amount: float):
    coupon = await CouponService.get_coupon(coupon_id)
    if not coupon:
        return {"message": "Coupon not found"}
    discount_amount = CouponService.calculate_discount(coupon, order_amount)
    return {"discountAmount": discount_amount}

@router.patch("/{coupon_id}", response_model=CouponOut)
async def update_coupon(
    coupon_id: int,
    coupon_data: CouponUpdate,
    user=Depends(require_seller_or_admin),
):
    updated_coupon = await CouponService.update_coupon(coupon_id, coupon_data, user)
    return updated_coupon

@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: int, user=Depends(require_seller_or_admin)):
    await CouponService.delete_coupon(coupon_id, user)
    return {"message": "Coupon deleted successfully"}

@router.patch("/{coupon_id}/deactivate", response_model=CouponOut)
async def deactivate_coupon(coupon_id: int, user=Depends(require_seller_or_admin)):
    updated_coupon = await CouponService.deactivate_coupon(coupon_id, user)
    return updated_coupon

@router.patch("/{coupon_id}/activate", response_model=CouponOut)
async def activate_coupon(coupon_id: int, user=Depends(require_seller_or_admin)):
    updated_coupon = await CouponService.activate_coupon(coupon_id, user)
    return updated_coupon

