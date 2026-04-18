from fastapi import HTTPException, status
from datetime import datetime, timedelta
from src.core.database import prisma
from src.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from src.modules.auth.schema import RegisterRequest, LoginRequest


class AuthService:
    @staticmethod
    def _build_user(user):
        return {
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "role": user.role,
            "isActive": user.isActive
        }

    @staticmethod
    async def register(data: RegisterRequest):
        existing = await prisma.user.find_unique(
            where={"email": data.email}
        )

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

        # 🔥 lưu refresh token
        await prisma.refreshtoken.create(
            data={
                "userId": user.id,
                "token": refresh_token,
                "expiresAt": datetime.utcnow() + timedelta(days=7)
            }
        )

        return {
            "user": AuthService._build_user(user),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    @staticmethod
    async def login(data: LoginRequest):
        user = await prisma.user.find_unique(
            where={"email": data.email}
        )

        if not user or user.deletedAt:
            raise HTTPException(401, "Invalid credentials")

        if not user.isActive:
            raise HTTPException(403, "User is disabled")

        if not verify_password(data.password, user.password):
            raise HTTPException(401, "Invalid credentials")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        # 🔥 lưu refresh token
        await prisma.refreshtoken.create(
            data={
                "userId": user.id,
                "token": refresh_token,
                "expiresAt": datetime.utcnow() + timedelta(days=7)
            }
        )

        return {
            "user": AuthService._build_user(user),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    @staticmethod
    async def refresh_token(refresh_token: str):
        payload = decode_token(refresh_token)
        if not payload:
            raise HTTPException(401, "Invalid refresh token")
        user_id = int(payload.get("sub"))

        stored = await prisma.refreshtoken.find_unique(
            where={"token": refresh_token}
        )

        if not stored or stored.isRevoked:
            raise HTTPException(401, "Token revoked")

        if stored.expiresAt < datetime.utcnow():
            raise HTTPException(401, "Token expired")

        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt or not user.isActive:
            raise HTTPException(401, "User invalid")
        await prisma.refreshtoken.update(
            where={"token": refresh_token},
            data={"isRevoked": True}
        )

        new_access = create_access_token({"sub": str(user.id)})
        new_refresh = create_refresh_token({"sub": str(user.id)})

        await prisma.refreshtoken.create(
            data={
                "userId": user.id,
                "token": new_refresh,
                "expiresAt": datetime.utcnow() + timedelta(days=7)
            }
        )

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer"
        }
    @staticmethod
    async def logout(refresh_token: str):

        stored = await prisma.refreshtoken.find_unique(
            where={"token": refresh_token}
        )

        if not stored:
            return {"message": "Already logged out"}

        await prisma.refreshtoken.update(
            where={"token": refresh_token},
            data={"isRevoked": True}
        )
        return {"message": "Logged out successfully"}

    @staticmethod
    async def change_password(user_id: int, old_password: str, new_password: str):

        user = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not user:
            raise HTTPException(404, "User not found")

        if not verify_password(old_password, user.password):
            raise HTTPException(400, "Old password incorrect")

        await prisma.user.update(
            where={"id": user_id},
            data={"password": hash_password(new_password)}
        )

        await prisma.refreshtoken.update_many(
            where={"userId": user_id},
            data={"isRevoked": True}
        )

        return {"message": "Password changed successfully"}