from fastapi import HTTPException, Response, Request
from datetime import datetime, timedelta
import hashlib

from src.core.database import prisma
from src.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)
from src.modules.auth.schema import RegisterRequest, LoginRequest


def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:

    @staticmethod
    def _build_user(user):
        return {
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "avatarUrl": user.avatarUrl,
            "role": user.role,
            "isActive": user.isActive
        }

    # ===== REGISTER =====
    @staticmethod
    async def register(data: RegisterRequest, response: Response):
        existing = await prisma.user.find_unique(where={"email": data.email})
        if existing:
            raise HTTPException(400, "Email already registered")

        user = await prisma.user.create(
            data={
                "email": data.email,
                "password": hash_password(data.password),
                "fullName": data.fullName,
                "phone": data.phone,
                "carts": {"create": {}}
            }
        )

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        await prisma.refreshtoken.create(
            data={
                "userId": user.id,
                "token": hash_token(refresh_token),
                "expiresAt": datetime.utcnow() + timedelta(days=7)
            }
        )

        # 🔥 SET COOKIE
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # dev = False | production = True
            samesite="lax",
            max_age=60 * 60 * 24 * 7
        )

        return {
            "user": AuthService._build_user(user),
            "access_token": access_token
        }

    # ===== LOGIN =====
    @staticmethod
    async def login(data: LoginRequest, response: Response):
        user = await prisma.user.find_unique(where={"email": data.email})

        if not user or user.deletedAt:
            raise HTTPException(401, "Invalid credentials")

        if not user.isActive:
            raise HTTPException(403, "User disabled")

        if not verify_password(data.password, user.password):
            raise HTTPException(401, "Invalid credentials")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        await prisma.refreshtoken.create(
            data={
                "userId": user.id,
                "token": hash_token(refresh_token),
                "expiresAt": datetime.utcnow() + timedelta(days=7)
            }
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24 * 7
        )

        return {
            "user": AuthService._build_user(user),
            "access_token": access_token
        }

    # ===== REFRESH =====
    @staticmethod
    async def refresh(request: Request, response: Response):
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(401, "No refresh token")

        payload = await verify_refresh_token(refresh_token)

        if not payload:
            raise HTTPException(401, "Invalid refresh token")

        user_id = int(payload["sub"])

        await prisma.refreshtoken.update(
            where={"token": hash_token(refresh_token)},
            data={"isRevoked": True}
        )

        new_access = create_access_token({"sub": str(user_id)})
        new_refresh = create_refresh_token({"sub": str(user_id)})

        await prisma.refreshtoken.create(
            data={
                "userId": user_id,
                "token": hash_token(new_refresh),
                "expiresAt": datetime.utcnow() + timedelta(days=7)
            }
        )

        # 🔥 update cookie
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            httponly=True,
            secure=False,
            samesite="lax"
        )

        return {
            "access_token": new_access
        }

    # ===== LOGOUT =====
    @staticmethod
    async def logout(request: Request, response: Response):
        refresh_token = request.cookies.get("refresh_token")

        if refresh_token:
            await prisma.refreshtoken.update(
                where={"token": hash_token(refresh_token)},
                data={"isRevoked": True}
            )

        response.delete_cookie("refresh_token")

        return {"message": "Logged out"}
    @staticmethod
    async def get_current_user(request: Request):
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            return None

        payload = await verify_refresh_token(refresh_token)

        if not payload:
            return None

        user_id = int(payload["sub"])

        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt:
            return None

        # ===== LẤY CART =====
        cart = await prisma.cart.find_first(
            where={"userId": user_id},
            include={"items": True}
        )

        total_items = 0

        if cart and cart.items:
            total_items = sum(item.quantity for item in cart.items)

        # ===== RETURN =====
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