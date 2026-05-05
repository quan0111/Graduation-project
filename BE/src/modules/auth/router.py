from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer

from src.modules.auth.schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse
)
from src.modules.auth.service import AuthService
from src.core.dependencies import get_current_user  

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    return await AuthService.register(data)


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, response: Response):
    return await AuthService.login(data, response)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(request: Request):
    try:
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(401, "Missing refresh token")

        return await AuthService.refresh_token(refresh_token)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))

@router.post("/logout")
async def logout(request: Request):
    try:
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(400, "Missing refresh token")

        await AuthService.logout(refresh_token)

        return {"message": "Logged out successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/change-password")
async def change_password(
    body: dict,
    user=Depends(get_current_user)  # 🔥 lấy user từ access token
):
    try:
        old_password = body.get("old_password")
        new_password = body.get("new_password")

        if not old_password or not new_password:
            raise HTTPException(400, "Missing password fields")

        return await AuthService.change_password(
            user.id,
            old_password,
            new_password
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/oauth/google")
async def google_login(body: dict):
    try:
        token = body.get("token")
        return await AuthService.OAuthLogin("google", token)
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/oauth/facebook")
async def facebook_login(body: dict):
    try:
        token = body.get("token")
        return await AuthService.OAuthLogin("facebook", token)
    except Exception as e:
        raise HTTPException(400, str(e))
@router.get("/me")
async def get_current_user(request: Request):
    user = await AuthService.get_current_user(request)
    if not user:
        raise HTTPException(404, "User not found")
    return user