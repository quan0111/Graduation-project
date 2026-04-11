from fastapi import APIRouter, HTTPException
from src.modules.auth.schema import RegisterRequest, LoginRequest, AuthResponse
from src.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    return await AuthService.register(data)


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    try:
        return await AuthService.login(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/refresh", response_model=AuthResponse)
async def refresh(token: str):
    try:
        return await AuthService.refresh_token(token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/logout")
async def logout(token: str):
    try:
        await AuthService.logout(token)
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/change-password")
async def change_password(token: str, new_password: str):
    try:
        await AuthService.change_password(token, new_password)
        return {"message": "Password changed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/OAuth/google")
async def google_login(token: str):
    try:
        return await AuthService.OAuthLogin("google", token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/OAuth/facebook")
async def facebook_login(token: str):
    try:
        return await AuthService.OAuthLogin("facebook", token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))