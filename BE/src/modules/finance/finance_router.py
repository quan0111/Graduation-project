from typing import List

from fastapi import APIRouter, Depends, HTTPException

from src.core.database import prisma
from src.core.dependencies import get_role_value, require_admin, require_seller_or_admin
from src.modules.finance.finance_service import FinanceService
from src.modules.finance.finance_schema import *

router = APIRouter(prefix="/finance", tags=["Finance"])


async def assert_shop_finance_access(shop_id: int, user):
    if get_role_value(user) == "ADMIN":
        return

    shop = await prisma.shop.find_first(
        where={"id": shop_id, "ownerId": user.id, "deletedAt": None}
    )
    if not shop:
        raise HTTPException(403, "Forbidden")


async def assert_order_finance_access(order_id: int, user):
    if get_role_value(user) == "ADMIN":
        return

    shop = await prisma.shop.find_first(
        where={"ownerId": user.id, "deletedAt": None}
    )
    if not shop:
        raise HTTPException(403, "Forbidden")

    order_item = await prisma.orderitem.find_first(
        where={"orderId": order_id, "shopId": shop.id, "deletedAt": None}
    )
    if not order_item:
        raise HTTPException(403, "Forbidden")


@router.get("/commission/{order_id}", response_model=CommissionOut)
async def commission(order_id: int, user=Depends(require_seller_or_admin)):
    await assert_order_finance_access(order_id, user)
    return await FinanceService.calculate_commission(order_id)


@router.get("/commission-configs/shops", response_model=List[ShopCommissionConfigOut])
async def get_shop_commission_configs(user=Depends(require_admin)):
    _ = user
    return await FinanceService.get_shop_commission_configs()


@router.put("/commission-configs/shops", response_model=ShopCommissionConfigOut)
async def upsert_shop_commission_config(data: ShopCommissionConfigUpsert, user=Depends(require_admin)):
    _ = user
    return await FinanceService.upsert_shop_commission_config(data)


@router.get("/commission-configs/categories", response_model=List[CategoryCommissionConfigOut])
async def get_category_commission_configs(user=Depends(require_admin)):
    _ = user
    return await FinanceService.get_category_commission_configs()


@router.put("/commission-configs/categories", response_model=CategoryCommissionConfigOut)
async def upsert_category_commission_config(data: CategoryCommissionConfigUpsert, user=Depends(require_admin)):
    _ = user
    return await FinanceService.upsert_category_commission_config(data)


@router.post("/payout", response_model=PayoutOut)
async def create_payout(data: PayoutCreate, user=Depends(require_seller_or_admin)):
    await assert_shop_finance_access(data.shopId, user)
    return await FinanceService.create_payout(data)

@router.patch("/payout/{id}", response_model=PayoutOut)
async def update_payout(id: int, data: PayoutUpdate, user=Depends(require_admin)):
    _ = user
    return await FinanceService.update_payout(id, data)



@router.get("/payout/{id}", response_model=PayoutOut)
async def get_payout(id: int, user=Depends(require_seller_or_admin)):
    payout = await FinanceService.get_payout(id)
    await assert_shop_finance_access(payout.shopId, user)
    return payout


@router.get("/shop/{shop_id}/payouts", response_model=List[PayoutOut])
async def get_shop_payouts(shop_id: int, user=Depends(require_seller_or_admin)):
    await assert_shop_finance_access(shop_id, user)
    return await FinanceService.get_payouts_by_shop(shop_id)


@router.get("/payouts", response_model=List[PayoutOut])
async def get_all_payouts(status: str | None = None, user=Depends(require_admin)):
    _ = user
    return await FinanceService.get_all_payouts(status)



@router.get("/shop/{shop_id}/revenue")
async def shop_revenue(shop_id: int, user=Depends(require_seller_or_admin)):
    await assert_shop_finance_access(shop_id, user)
    return await FinanceService.get_shop_revenue(shop_id)


@router.get("/seller/wallet")
async def seller_wallet(user=Depends(require_seller_or_admin)):
    if get_role_value(user) == "ADMIN":
        raise HTTPException(400, "Use shop wallet endpoint for admin")
    return await FinanceService.get_seller_wallet(user.id)


@router.get("/seller/report")
async def seller_report(days: int = 30, user=Depends(require_seller_or_admin)):
    if get_role_value(user) == "ADMIN":
        raise HTTPException(400, "Use shop report endpoint for admin")
    return await FinanceService.get_seller_report(user.id, days=days)


@router.get("/shop/{shop_id}/wallet")
async def shop_wallet(shop_id: int, user=Depends(require_seller_or_admin)):
    await assert_shop_finance_access(shop_id, user)
    return await FinanceService.get_shop_wallet(shop_id)
