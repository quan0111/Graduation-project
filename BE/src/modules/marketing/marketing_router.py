from typing import List

from fastapi import APIRouter, Depends

from src.core.dependencies import get_optional_current_user, require_admin
from src.modules.marketing.marketing_service import MarketingService
from src.modules.marketing.marketing_schema import *

router = APIRouter(prefix="/marketing", tags=["Marketing"])

 
@router.post("/banners", response_model=BannerOut)
async def create_banner(data: BannerCreate, user=Depends(require_admin)):
    return await MarketingService.create_banner(user.id, data)



@router.patch("/banners/{id}", response_model=BannerOut)
async def update_banner(id: int, data: BannerUpdate, user=Depends(require_admin)):
    _ = user
    return await MarketingService.update_banner(id, data)



@router.get("/banners", response_model=List[BannerOut])
async def get_banners():
    return await MarketingService.get_active_banners()



@router.post("/banners/click")
async def click(data: BannerTrackingCreate, user=Depends(get_optional_current_user)):
    user_id = user.id if user else None
    return await MarketingService.track_banner_action(user_id, data.bannerId, data.action)


@router.get("/banners/{id}/stats")
async def stats(id: int, user=Depends(require_admin)):
    _ = user
    return await MarketingService.get_banner_stats(id)


@router.get("/admin/banners", response_model=List[BannerOut])
async def admin_banners(user=Depends(require_admin)):
    _ = user
    return await MarketingService.get_all_banners()
