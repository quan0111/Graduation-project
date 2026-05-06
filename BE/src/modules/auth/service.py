from datetime import datetime, timedelta
import hashlib

from fastapi import HTTPException, Request, Response

from src.core.database import prisma
from src.core.security import (
    AUTH_SCOPE_ADMIN,
    AUTH_SCOPE_STOREFRONT,
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_refresh_token,
)
from src.modules.auth.schema import LoginRequest, RegisterRequest


def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    STOREFRONT_COOKIE = "refresh_token"
    ADMIN_COOKIE = "admin_refresh_token"

    @staticmethod
    def _build_user(user):
        return {
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "phone": user.phone,
            "avatarUrl": user.avatarUrl,
            "role": user.role,
            "isActive": user.isActive,
        }

    @staticmethod
    def _set_refresh_cookie(response: Response, cookie_name: str, refresh_token: str):
        response.set_cookie(
            key=cookie_name,
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
        )

    @staticmethod
    async def _persist_refresh_token(user_id: int, refresh_token: str):
        await prisma.refreshtoken.create(
            data={
                "userId": user_id,
                "token": hash_token(refresh_token),
                "expiresAt": datetime.utcnow() + timedelta(days=7),
            }
        )

    @staticmethod
    def _validate_scope_access(user, scope: str):
        if scope == AUTH_SCOPE_ADMIN and user.role != "ADMIN":
            raise HTTPException(403, "Admin credentials required")

        if scope == AUTH_SCOPE_STOREFRONT and user.role == "ADMIN":
            raise HTTPException(403, "Use admin login for admin account")

    @staticmethod
    async def _issue_session(
        user,
        response: Response,
        scope: str,
        cookie_name: str,
    ):
        access_token = create_access_token({"sub": str(user.id)}, scope=scope)
        refresh_token = create_refresh_token({"sub": str(user.id)}, scope=scope)

        await AuthService._persist_refresh_token(user.id, refresh_token)
        AuthService._set_refresh_cookie(response, cookie_name, refresh_token)

        return {
            "user": AuthService._build_user(user),
            "access_token": access_token,
        }

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
                "carts": {"create": {}},
            }
        )

        return await AuthService._issue_session(
            user=user,
            response=response,
            scope=AUTH_SCOPE_STOREFRONT,
            cookie_name=AuthService.STOREFRONT_COOKIE,
        )

    @staticmethod
    async def login(
        data: LoginRequest,
        response: Response,
        scope: str = AUTH_SCOPE_STOREFRONT,
        cookie_name: str = STOREFRONT_COOKIE,
    ):
        user = await prisma.user.find_unique(where={"email": data.email})

        if not user or user.deletedAt:
            raise HTTPException(401, "Invalid credentials")

        if not user.isActive:
            raise HTTPException(403, "User disabled")

        if not verify_password(data.password, user.password):
            raise HTTPException(401, "Invalid credentials")

        AuthService._validate_scope_access(user, scope)

        return await AuthService._issue_session(
            user=user,
            response=response,
            scope=scope,
            cookie_name=cookie_name,
        )

    @staticmethod
    async def refresh(
        request: Request,
        response: Response,
        scope: str = AUTH_SCOPE_STOREFRONT,
        cookie_name: str = STOREFRONT_COOKIE,
    ):
        refresh_token = request.cookies.get(cookie_name)
        if not refresh_token:
            raise HTTPException(401, "No refresh token")

        payload = await verify_refresh_token(refresh_token, expected_scope=scope)
        if not payload:
            raise HTTPException(401, "Invalid refresh token")

        user_id = int(payload["sub"])
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        if not user.isActive:
            raise HTTPException(403, "User disabled")

        AuthService._validate_scope_access(user, scope)

        await prisma.refreshtoken.update_many(
            where={"token": hash_token(refresh_token)},
            data={"isRevoked": True},
        )

        new_access = create_access_token({"sub": str(user_id)}, scope=scope)
        new_refresh = create_refresh_token({"sub": str(user_id)}, scope=scope)

        await AuthService._persist_refresh_token(user_id, new_refresh)
        AuthService._set_refresh_cookie(response, cookie_name, new_refresh)

        return {"access_token": new_access}

    @staticmethod
    async def logout(
        request: Request,
        response: Response,
        cookie_name: str = STOREFRONT_COOKIE,
    ):
        refresh_token = request.cookies.get(cookie_name)

        if refresh_token:
            await prisma.refreshtoken.update_many(
                where={"token": hash_token(refresh_token)},
                data={"isRevoked": True},
            )

        response.delete_cookie(cookie_name)
        return {"message": "Logged out"}

    @staticmethod
    async def change_password(user_id: int, old_password: str, new_password: str):
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        if not user.password or not verify_password(old_password, user.password):
            raise HTTPException(400, "Old password is incorrect")

        await prisma.user.update(
            where={"id": user_id},
            data={"password": hash_password(new_password)},
        )

        return {"message": "Password changed successfully"}

    @staticmethod
    async def get_current_user(request: Request):
        refresh_token = request.cookies.get(AuthService.STOREFRONT_COOKIE)
        if not refresh_token:
            return None

        payload = await verify_refresh_token(
            refresh_token,
            expected_scope=AUTH_SCOPE_STOREFRONT,
        )
        if not payload:
            return None

        user_id = int(payload["sub"])
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt or not user.isActive:
            return None

        cart = await prisma.cart.find_first(
            where={"userId": user_id},
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
