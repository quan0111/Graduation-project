from fastapi import APIRouter, HTTPException
from src.modules.auth.schema import RegisterRequest, LoginRequest, TokenResponse
from src.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    return await AuthService.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    try:
        return await AuthService.login(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))