from fastapi import HTTPException
from datetime import datetime
from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.coupon.coupon_schema import CouponCreate, CouponUpdate


class CouponService:
    @staticmethod
    async def _get_seller_shop(user_id: int):
        shop = await prisma.shop.find_first(
            where={"ownerId": user_id, "deletedAt": None}
        )
        if not shop:
            raise HTTPException(404, "Shop not found")
        return shop

    @staticmethod
    async def _assert_write_access(coupon, current_user):
        role = get_role_value(current_user)
        if role == "ADMIN":
            return
        if role != "SELLER":
            raise HTTPException(403, "Forbidden")

        shop = await CouponService._get_seller_shop(current_user.id)
        if coupon.applicableShopId != shop.id:
            raise HTTPException(403, "Forbidden")

    @staticmethod
    async def create_coupon(data: CouponCreate, current_user):
        existing = await prisma.coupon.find_unique(
            where={"code": data.code}
        )
        if existing:
            raise HTTPException(400, "Coupon code already exists")

        payload = data.dict()
        if get_role_value(current_user) == "SELLER":
            shop = await CouponService._get_seller_shop(current_user.id)
            if data.applicableShopId is not None and data.applicableShopId != shop.id:
                raise HTTPException(403, "Forbidden")
            payload["applicableShopId"] = shop.id

        return await prisma.coupon.create(data=payload)
    @staticmethod
    async def get_all_coupons():
        return await prisma.coupon.find_many(
            include={"orders": True}
        )

    @staticmethod
    async def get_coupon(coupon_id: int):
        coupon = await prisma.coupon.find_unique(
            where={"id": coupon_id},
            include={"orders": True}
        )
        if not coupon:
            raise HTTPException(404, "Coupon not found")
        return coupon

    @staticmethod
    async def get_coupon_by_code(code: str):
        coupon = await prisma.coupon.find_unique(
            where={"code": code}
        )
        if not coupon:
            raise HTTPException(404, "Coupon not found")
        return coupon
    @staticmethod
    async def update_coupon(coupon_id: int, data: CouponUpdate, current_user):
        existing = await prisma.coupon.find_unique(
            where={"id": coupon_id}
        )
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        return await prisma.coupon.update(
            where={"id": coupon_id},
            data=data.dict(exclude_unset=True)
        )

    @staticmethod
    async def delete_coupon(coupon_id: int, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        return await prisma.coupon.update(
            where={"id": coupon_id},
            data={"isActive": False}
        )

    @staticmethod
    async def activate_coupon(coupon_id: int, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        return await prisma.coupon.update(
            where={"id": coupon_id},
            data={"isActive": True}
        )
    @staticmethod
    async def deactivate_coupon(coupon_id: int, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        return await prisma.coupon.update(
            where={"id": coupon_id},
            data={"isActive": False}
        )

    @staticmethod
    async def validate_coupon(code: str, order_amount: float):
        coupon = await prisma.coupon.find_unique(
            where={"code": code}
        )

        if not coupon:
            raise HTTPException(404, "Coupon not found")

        if not coupon.isActive:
            raise HTTPException(400, "Coupon inactive")

        now = datetime.utcnow()

        if coupon.validFrom and coupon.validFrom > now:
            raise HTTPException(400, "Coupon not started")

        if coupon.validUntil and coupon.validUntil < now:
            raise HTTPException(400, "Coupon expired")

        if coupon.usageLimit and coupon.usedCount >= coupon.usageLimit:
            raise HTTPException(400, "Coupon limit reached")

        if coupon.minOrderAmount and order_amount < coupon.minOrderAmount:
            raise HTTPException(400, "Order not eligible")

        return coupon

    @staticmethod
    def calculate_discount(coupon, order_amount: float):
        if coupon.discountType == "PERCENTAGE":
            discount = order_amount * (coupon.discountValue / 100)

            if coupon.maxDiscount:
                discount = min(discount, coupon.maxDiscount)

        else:
            discount = coupon.discountValue

        return discount
    @staticmethod
    async def use_coupon(coupon_id: int):
        coupon = await prisma.coupon.find_unique(
            where={"id": coupon_id}
        )

        if not coupon:
            raise HTTPException(404, "Coupon not found")

        if coupon.usageLimit and coupon.usedCount >= coupon.usageLimit:
            raise HTTPException(400, "Coupon limit reached")

        return await prisma.coupon.update(
            where={"id": coupon_id},
            data={
                "usedCount": coupon.usedCount + 1
            }
        )
