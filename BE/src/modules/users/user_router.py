from fastapi import APIRouter
from typing import List
from src.modules.users.user_schema import UserCreate, UserUpdate, UserOut
from src.modules.users.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserOut)
async def create_user(user_data: UserCreate):
    new_user = await UserService.create_user(user_data)
    return new_user
@router.get("/", response_model=List[UserOut])
async def get_all_users():
    users = await UserService.get_all_users()
    return users
@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int):
    user = await UserService.get_user(user_id)
    return user
@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_data: UserUpdate):
    updated_user = await UserService.update_user(user_id, user_data)
    return updated_user
@router.patch("/{user_id}/delete")
async def delete_user(user_id: int):
    await UserService.delete_user(user_id)
    return {"message": "User deleted successfully"}