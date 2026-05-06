from fastapi import APIRouter, Depends
from src.modules.admin.admin_service import AdminService
from src.modules.admin.admin_schema import *
from src.core.dependencies import get_current_user
from fastapi import HTTPException

router = APIRouter(prefix="/admin", tags=["Admin"])

def require_admin(user):
    if user.role != "ADMIN":
        raise HTTPException(403, "Forbidden")
    return user

@router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    require_admin(user)
    return await AdminService.get_dashboard_stats()


@router.get("/admin-users", response_model=list[AdminAccountOut])
async def list_admin_users(user=Depends(get_current_user)):
    require_admin(user)
    return await AdminService.list_admin_accounts()


@router.post("/admin-users", response_model=AdminAccountOut)
async def create_admin_user(
    data: AdminAccountCreate,
    user=Depends(get_current_user)
):
    require_admin(user)
    return await AdminService.create_admin_account(data)

@router.post("/orders")
async def get_orders(
    filter_data: OrderFilter,
    pagination: Pagination,
    user=Depends(get_current_user)
):
    require_admin(user)
    return await AdminService.get_orders(filter_data, pagination)


@router.post("/sellers")
async def get_sellers(
    filter_data: SellerFilter,
    pagination: Pagination,
    user=Depends(get_current_user)
):
    require_admin(user)
    return await AdminService.get_sellers(filter_data, pagination)


@router.patch("/sellers/{shop_id}")
async def update_seller(
    shop_id: int,
    data: SellerFilter,
    user=Depends(get_current_user)
):
    require_admin(user)
    return await AdminService.update_seller(shop_id, data)


@router.get("/sellers/{shop_id}/stats")
async def seller_stats(
    shop_id: int,
    user=Depends(get_current_user)
):
    require_admin(user)
    return await AdminService.get_seller_stats(shop_id)


@router.patch("/sellers/bulk")
async def bulk_update(
    ids: list[int],
    isActive: bool,
    user=Depends(get_current_user)
):
    require_admin(user)
    return await AdminService.bulk_update_sellers(ids, isActive)
