from fastapi import APIRouter
from typing import List
from src.modules.finance.finance_service import FinanceService
from src.modules.finance.finance_schema import *

router = APIRouter(prefix="/finance", tags=["Finance"])



@router.get("/commission/{order_id}", response_model=CommissionOut)
async def commission(order_id: int):
    return await FinanceService.calculate_commission(order_id)


@router.post("/payout", response_model=PayoutOut)
async def create_payout(data: PayoutCreate):
    return await FinanceService.create_payout(data)

@router.patch("/payout/{id}", response_model=PayoutOut)
async def update_payout(id: int, data: PayoutUpdate):
    return await FinanceService.update_payout(id, data)



@router.get("/payout/{id}", response_model=PayoutOut)
async def get_payout(id: int):
    return await FinanceService.get_payout(id)


@router.get("/shop/{shop_id}/payouts", response_model=List[PayoutOut])
async def get_shop_payouts(shop_id: int):
    return await FinanceService.get_payouts_by_shop(shop_id)



@router.get("/shop/{shop_id}/revenue")
async def shop_revenue(shop_id: int):
    return await FinanceService.get_shop_revenue(shop_id)