from fastapi import APIRouter
from typing import List
from src.modules.marketing.marketing_service import MarketingService
from src.modules.marketing.marketing_schema import *

router = APIRouter(prefix="/marketing", tags=["Marketing"])

 
@router.post("/banners", response_model=BannerOut)
async def create_banner(data: BannerCreate, user_id: int):
    return await MarketingService.create_banner(user_id, data)



@router.patch("/banners/{id}", response_model=BannerOut)
async def update_banner(id: int, data: BannerUpdate):
    return await MarketingService.update_banner(id, data)



@router.get("/banners", response_model=List[BannerOut])
async def get_banners():
    return await MarketingService.get_active_banners()



@router.post("/banners/click")
async def click(data: BannerTrackingCreate, user_id: int = None):
    return await MarketingService.track_click(user_id, data)


@router.get("/banners/{id}/stats")
async def stats(id: int):
    return await MarketingService.get_banner_stats(id)


@router.get("/admin/banners", response_model=List[BannerOut])
async def admin_banners():
    return await MarketingService.get_all_banners()