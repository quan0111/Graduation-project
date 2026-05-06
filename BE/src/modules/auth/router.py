from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer

from src.modules.auth.schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse
)
from src.modules.auth.service import AuthService
from src.core.dependencies import get_current_user as get_current_user_dep
from src.core.database import prisma

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


# ===== REGISTER =====
@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest, response: Response):
    return await AuthService.register(data, response)


# ===== LOGIN =====
@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, response: Response):
    return await AuthService.login(data, response)


# ===== REFRESH =====
@router.post("/refresh")
async def refresh(request: Request, response: Response):
    return await AuthService.refresh(request, response)


# ===== LOGOUT =====
@router.post("/logout")
async def logout(request: Request, response: Response):
    return await AuthService.logout(request, response)


# ===== CHANGE PASSWORD =====
@router.post("/change-password")
async def change_password(
    body: dict,
    user=Depends(get_current_user_dep)
):
    old_password = body.get("old_password")
    new_password = body.get("new_password")

    if not old_password or not new_password:
        raise HTTPException(400, "Missing password fields")

    return await AuthService.change_password(
        user.id,
        old_password,
        new_password
    )


# ===== ME (🔥 FIX FULL: có cart) =====
@router.get("/me")
async def get_me(user=Depends(get_current_user_dep)):
    cart = await prisma.cart.find_first(
        where={"userId": user.id},
        include={"items": True}
    )

    total_items = 0
    if cart and cart.items:
        total_items = sum(item.quantity for item in cart.items)

    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.fullName,
        "role": user.role,
        "isActive": user.isActive,
        "avatarUrl": user.avatarUrl,
        "cart": {
            "id": cart.id if cart else None,
            "totalItems": total_items
        }
    }