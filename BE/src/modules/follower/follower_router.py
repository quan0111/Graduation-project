from fastapi import APIRouter
from typing import List
from src.modules.follower.follower_service import FollowerService
from src.modules.follower.follower_schema import FollowerCreate, FollowerOut
router = APIRouter(prefix="/followers", tags=["Followers"])
@router.post("/", response_model=FollowerOut)
async def create_follower(follower_data: FollowerCreate):
    new_follower = await FollowerService.create_follower(follower_data)
    return new_follower
@router.get("/user/{user_id}", response_model=List[FollowerOut])
async def get_followers_by_user(user_id: int):  
    followers = await FollowerService.get_followers_by_user(user_id)
    return followers
@router.get("/following/{user_id}", response_model=List[FollowerOut])
async def get_following_by_user(user_id: int):
    following = await FollowerService.get_following_by_user(user_id)
    return following
@router.delete("/{follower_id}")
async def delete_follower(follower_id: int):
    await FollowerService.delete_follower(follower_id)
    return {"message": "Follower deleted successfully"}
@router.get("/{follower_id}", response_model=FollowerOut)
async def get_follower(follower_id: int):
    follower = await FollowerService.get_follower(follower_id)
    return follower
@router.get("/is_following/{follower_id}/{user_id}")
async def is_following(follower_id: int, user_id: int):
    following = await FollowerService.is_following(follower_id, user_id)
    return {"is_following": following}
@router.get("/followers_count/{user_id}")
async def get_followers_count(user_id: int):
    count = await FollowerService.get_followers_count(user_id)
    return {"followers_count": count}
@router.get("/following_count/{user_id}")
async def get_following_count(user_id: int):
    count = await FollowerService.get_following_count(user_id)
    return {"following_count": count}
@router.get("/followers_with_details/{user_id}", response_model=List[FollowerOut])
async def get_followers_with_details(user_id: int):
    followers = await FollowerService.get_followers_with_details(user_id)
    return followers
@router.get("/following_with_details/{user_id}", response_model=List[FollowerOut])
async def get_following_with_details(user_id: int):
    following = await FollowerService.get_following_with_details(user_id)
    return following
@router.get("/mutual_followers/{user_id}", response_model=List[FollowerOut])
async def get_mutual_followers(user_id: int):
    mutual_followers = await FollowerService.get_mutual_followers(user_id)
    return mutual_followers
@router.delete("/unfollow/{user_id}/{follower_id}")
async def unfollow(user_id: int, follower_id: int):
    await FollowerService.unfolow(user_id, follower_id)
    return {"message": "Unfollowed successfully"}
@router.get("/is_mutual/{user_id}/{follower_id}")
async def is_mutual_following(user_id: int, follower_id: int):
    is_following = await FollowerService.is_following(user_id, follower_id)
    is_followed_by = await FollowerService.is_following(follower_id, user_id)
    return {"is_mutual": is_following and is_followed_by}
