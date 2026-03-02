from fastapi import APIRouter, Depends
from src.modules.users.user_router import router as user_router
from src.modules.auth.router import router as auth_router
from src.modules.shop.shop_router import router as shop_router
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(shop_router)

api_router.get("/", tags=["Root"])(lambda: {"message": "Welcome to the API"})