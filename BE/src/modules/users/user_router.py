from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from src.core.dependencies import get_current_user, require_admin
from src.modules.auth.service import AuthService
from src.modules.users.user_schema import (
    UserCreate,
    UserOut,
    UserPasswordChange,
    UserProfileUpdate,
    UserUpdate,
)
from src.modules.users.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


class BanUserRequest(BaseModel):
    reason: str


@router.post("/", response_model=UserOut)
async def create_user(user_data: UserCreate, admin=Depends(require_admin)):
    _ = admin
    new_user = await UserService.create_user(user_data)
    return new_user


@router.get("/", response_model=List[UserOut])
async def get_all_users(admin=Depends(require_admin)):
    _ = admin
    users = await UserService.get_all_users()
    return users


@router.get("/me")
async def get_my_profile(user=Depends(get_current_user)):
    return await UserService.get_current_user_profile(user.id)


@router.patch("/me")
async def update_my_profile(
    user_data: UserProfileUpdate,
    user=Depends(get_current_user),
):
    return await UserService.update_current_user_profile(user.id, user_data)


@router.post("/me/change-password")
async def change_my_password(
    body: UserPasswordChange,
    user=Depends(get_current_user),
):
    return await AuthService.change_password(
        user.id,
        body.currentPassword,
        body.newPassword,
    )


@router.delete("/me")
async def delete_my_account(user=Depends(get_current_user)):
    await UserService.delete_user(user.id)
    return {"message": "User deleted successfully"}


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, admin=Depends(require_admin)):
    _ = admin
    user = await UserService.get_user(user_id)
    return user


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_data: UserUpdate, admin=Depends(require_admin)):
    _ = admin
    updated_user = await UserService.update_user(user_id, user_data)
    return updated_user


@router.patch("/{user_id}/delete")
async def delete_user(user_id: int, admin=Depends(require_admin)):
    _ = admin
    await UserService.delete_user(user_id)
    return {"message": "User deleted successfully"}


@router.patch("/{user_id}/ban")
async def ban_user(user_id: int, body: BanUserRequest, admin=Depends(require_admin)):
    """Admin ban user: khóa tài khoản + tất cả shop của user đó"""
    return await UserService.ban_user(user_id, body.reason, admin_id=admin.id)


@router.patch("/{user_id}/unban")
async def unban_user(user_id: int, admin=Depends(require_admin)):
    """Admin mở khóa tài khoản user"""
    return await UserService.unban_user(user_id, admin_id=admin.id)
