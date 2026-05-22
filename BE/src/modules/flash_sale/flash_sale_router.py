from fastapi import APIRouter, Depends

from src.core.dependencies import require_admin
from src.modules.flash_sale.flash_sale_schema import FlashSaleCreate, FlashSaleItemCreate, FlashSaleOut, FlashSaleUpdate
from src.modules.flash_sale.flash_sale_service import FlashSaleService


router = APIRouter(prefix="/flash-sales", tags=["Flash Sales"])


@router.get("/active")
async def active_flash_sales():
    return await FlashSaleService.list_active_public()


@router.get("/", response_model=list[FlashSaleOut])
async def list_flash_sales(user=Depends(require_admin)):
    _ = user
    return await FlashSaleService.list_flash_sales()


@router.post("/", response_model=FlashSaleOut)
async def create_flash_sale(data: FlashSaleCreate, user=Depends(require_admin)):
    _ = user
    return await FlashSaleService.create_flash_sale(data)


@router.patch("/{flash_sale_id}", response_model=FlashSaleOut)
async def update_flash_sale(flash_sale_id: int, data: FlashSaleUpdate, user=Depends(require_admin)):
    _ = user
    return await FlashSaleService.update_flash_sale(flash_sale_id, data)


@router.post("/{flash_sale_id}/items")
async def add_flash_sale_item(flash_sale_id: int, data: FlashSaleItemCreate, user=Depends(require_admin)):
    _ = user
    return await FlashSaleService.add_item(flash_sale_id, data)
