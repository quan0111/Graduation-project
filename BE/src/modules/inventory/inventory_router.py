from typing import List

from fastapi import APIRouter, Depends

from src.core.dependencies import require_admin, require_seller
from src.modules.inventory.inventory_schema import InventoryLedgerOut, StockAdjustment
from src.modules.inventory.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/seller/ledger", response_model=List[InventoryLedgerOut])
async def seller_ledger(limit: int = 100, user=Depends(require_seller)):
    return await InventoryService.list_for_seller(user.id, limit)


@router.patch("/variants/{variant_id}/adjust", response_model=dict)
async def adjust_variant_stock(variant_id: int, data: StockAdjustment, user=Depends(require_seller)):
    variant = await InventoryService.adjust_variant_stock(
        variant_id=variant_id,
        quantity_change=data.quantityChange,
        reason=data.reason,
        actor=user,
    )
    return {"variantId": variant.id, "stock": variant.stock}


@router.get("/shops/{shop_id}/ledger", response_model=List[InventoryLedgerOut])
async def admin_shop_ledger(shop_id: int, limit: int = 100, user=Depends(require_admin)):
    _ = user
    return await InventoryService.list_for_shop(shop_id, limit)
