from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer

from src.core.database import prisma
from src.core.dependencies import get_current_user as get_current_user_dep, get_role_value
from src.core.security import AUTH_SCOPE_ADMIN, AUTH_SCOPE_STOREFRONT
from src.modules.auth.schema import AuthResponse, LoginRequest, RegisterRequest
from src.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest, response: Response, request: Request):
    return await AuthService.register(data, response, request=request)


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, response: Response, request: Request):
    return await AuthService.login(
        data,
        response,
        request=request,
        scope=AUTH_SCOPE_STOREFRONT,
        cookie_name=AuthService.STOREFRONT_COOKIE,
    )


@router.post("/admin/login", response_model=AuthResponse)
async def admin_login(data: LoginRequest, response: Response, request: Request):
    return await AuthService.login(
        data,
        response,
        request=request,
        scope=AUTH_SCOPE_ADMIN,
        cookie_name=AuthService.ADMIN_COOKIE,
    )


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    return await AuthService.refresh(
        request,
        response,
        scope=AUTH_SCOPE_STOREFRONT,
        cookie_name=AuthService.STOREFRONT_COOKIE,
    )


@router.post("/admin/refresh")
async def admin_refresh(request: Request, response: Response):
    return await AuthService.refresh(
        request,
        response,
        scope=AUTH_SCOPE_ADMIN,
        cookie_name=AuthService.ADMIN_COOKIE,
    )


@router.post("/logout")
async def logout(request: Request, response: Response):
    return await AuthService.logout(
        request,
        response,
        cookie_name=AuthService.STOREFRONT_COOKIE,
    )


@router.post("/admin/logout")
async def admin_logout(request: Request, response: Response):
    return await AuthService.logout(
        request,
        response,
        cookie_name=AuthService.ADMIN_COOKIE,
    )


@router.post("/change-password")
async def change_password(body: dict, user=Depends(get_current_user_dep)):
    old_password = body.get("old_password")
    new_password = body.get("new_password")

    if not old_password or not new_password:
        raise HTTPException(400, "Missing password fields")

    return await AuthService.change_password(
        user.id,
        old_password,
        new_password,
    )


@router.get("/me")
async def get_me(user=Depends(get_current_user_dep)):
    cart = await prisma.cart.find_first(
        where={"userId": user.id},
        include={"items": True},
    )

    total_items = 0
    if cart and cart.items:
        total_items = sum(item.quantity for item in cart.items)

    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.fullName,
        "phone": user.phone,
        "role": user.role,
        "isActive": user.isActive,
        "avatarUrl": user.avatarUrl,
        "cart": {
            "id": cart.id if cart else None,
            "totalItems": total_items,
        },
    }


@router.get("/admin/me")
async def get_admin_me(user=Depends(get_current_user_dep)):
    if get_role_value(user) != "ADMIN":
        raise HTTPException(403, "Admin access required")

    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.fullName,
        "phone": user.phone,
        "role": user.role,
        "isActive": user.isActive,
        "avatarUrl": user.avatarUrl,
    }
