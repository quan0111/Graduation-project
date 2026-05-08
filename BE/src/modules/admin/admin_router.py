from fastapi import APIRouter, Depends

from src.core.dependencies import require_admin
from src.modules.admin.admin_schema import *
from src.modules.admin.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def dashboard(user=Depends(require_admin)):
    _ = user
    return await AdminService.get_dashboard_stats()


@router.get("/admin-users", response_model=list[AdminAccountOut])
async def list_admin_users(user=Depends(require_admin)):
    _ = user
    return await AdminService.list_admin_accounts()


@router.post("/admin-users", response_model=AdminAccountOut)
async def create_admin_user(
    data: AdminAccountCreate,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.create_admin_account(data)


@router.post("/orders")
async def get_orders(
    filter_data: OrderFilter,
    pagination: Pagination,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.get_orders(filter_data, pagination)


@router.post("/sellers")
async def get_sellers(
    filter_data: SellerFilter,
    pagination: Pagination,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.get_sellers(filter_data, pagination)


@router.patch("/sellers/bulk")
async def bulk_update(
    ids: list[int],
    isActive: bool,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.bulk_update_sellers(ids, isActive)


@router.patch("/sellers/{shop_id}")
async def update_seller(
    shop_id: int,
    data: SellerFilter,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.update_seller(shop_id, data)


@router.get("/sellers/{shop_id}/stats")
async def seller_stats(
    shop_id: int,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.get_seller_stats(shop_id)


from pydantic import BaseModel
from typing import Optional


class ProductStatusRequest(BaseModel):
    status: str
    banReason: Optional[str] = ""


@router.patch("/products/{product_id}/status")
async def update_product_status(
    product_id: int,
    body: ProductStatusRequest,
    user=Depends(require_admin),
):
    _ = user
    return await AdminService.set_product_status(
        product_id,
        body.status,
        ban_reason=body.banReason or "",
    )
