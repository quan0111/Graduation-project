from fastapi import HTTPException
from src.core.database import prisma
from src.modules.coupon.coupon_schema import CouponCreate, CouponUpdate

class CouponService:
    @staticmethod
    async def create_coupon(coupon_data: CouponCreate):
        new_coupon = await prisma.coupon.create(data=coupon_data.dict())
        return new_coupon
    @staticmethod
    async def get_all_coupons():
        coupons = await prisma.coupon.find_many()
        return coupons
    @staticmethod
    async def get_coupon(coupon_id: int):
        coupon = await prisma.coupon.find_unique(where={"id": coupon_id})
        return coupon
    @staticmethod
    async def update_coupon(coupon_id: int, coupon_data: CouponUpdate):
        update_data = coupon_data.dict(exclude_unset=True)
        updated_coupon = await prisma.coupon.update(where={"id": coupon_id}, data=update_data)
        return updated_coupon
    @staticmethod
    async def delete_coupon(coupon_id: int):
        await prisma.coupon.delete(where={"id": coupon_id})
    @staticmethod
    async def get_coupon_by_code(code: str):
        coupon = await prisma.coupon.find_unique(where={"code": code})
        return coupon
    @staticmethod
    async def get_active_coupons():
        coupons = await prisma.coupon.find_many(where={"isActive": True})
        return coupons
    @staticmethod
    async def deactivate_coupon(coupon_id: int):
        updated_coupon = await prisma.coupon.update(
            where={"id": coupon_id},
            data={"isActive": False}
        )
        return updated_coupon
    @staticmethod
    async def activate_coupon(coupon_id: int):
        updated_coupon = await prisma.coupon.update(
            where={"id": coupon_id},
            data={"isActive": True}
        )
        return updated_coupon
    @staticmethod
    async def get_coupons_by_user(user_id: int):
        coupons = await prisma.coupon.find_many(where={"userId": user_id})
        return coupons
    @staticmethod
    async def assign_coupon_to_user(coupon_id: int, user_id: int):
        updated_coupon = await prisma.coupon.update(
            where={"id": coupon_id},
            data={"userId": user_id}
        )
        return updated_coupon
    @staticmethod
    async def remove_coupon_from_user(coupon_id: int):
        updated_coupon = await prisma.coupon.update(
            where={"id": coupon_id},
            data={"userId": None}
        )
        return updated_coupon
    @staticmethod
    async def check_coupon_validity(code: str):
        coupon = await prisma.coupon.find_unique(where={"code": code})
        if not coupon or not coupon.isActive:
            raise HTTPException(status_code=400, detail="Invalid or inactive coupon")
        return coupon
    @staticmethod
    async def use_coupon(coupon_id: int):
        coupon = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        if coupon.usageLimit is not None and coupon.usageLimit <= 0:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")
        updated_coupon = await prisma.coupon.update(
            where={"id": coupon_id},
            data={"usageLimit": (coupon.usageLimit - 1) if coupon.usageLimit is not None else None}
        )
        return updated_coupon