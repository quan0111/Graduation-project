from fastapi import APIRouter
from typing import List
from src.modules.follower.follower_service import ShopFollowerService
from src.modules.follower.follower_schema import ShopFollowerOut

router = APIRouter(prefix="/shop-follow", tags=["Shop Follow"])

@router.post("/{shop_id}")
async def follow_shop(shop_id: int, user_id: int):
    return await ShopFollowerService.follow_shop(user_id, shop_id)

@router.delete("/{shop_id}")
async def unfollow_shop(shop_id: int, user_id: int):
    return await ShopFollowerService.unfollow_shop(user_id, shop_id)


@router.get("/is-following/{shop_id}")
async def is_following(shop_id: int, user_id: int):
    result = await ShopFollowerService.is_following(user_id, shop_id)
    return {"is_following": result}


@router.get("/user/{user_id}", response_model=List[ShopFollowerOut])
async def get_followed_shops(user_id: int):
    return await ShopFollowerService.get_followed_shops(user_id)

@router.get("/shop/{shop_id}", response_model=List[ShopFollowerOut])
async def get_shop_followers(shop_id: int):
    return await ShopFollowerService.get_shop_followers(shop_id)


@router.get("/shop/{shop_id}/count")
async def get_shop_follower_count(shop_id: int):
    count = await ShopFollowerService.get_shop_follower_count(shop_id)
    return {"followers": count}


@router.get("/user/{user_id}/count")
async def get_user_follow_count(user_id: int):
    count = await ShopFollowerService.get_user_follow_count(user_id)
    return {"following": count}