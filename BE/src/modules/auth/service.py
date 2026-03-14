from fastapi import HTTPException, status
from src.core.database import prisma
from src.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from src.modules.auth.schema import RegisterRequest, LoginRequest


class AuthService:

    @staticmethod
    async def register(data: RegisterRequest):

        existing_user = await prisma.user.find_unique(
            where={"email": data.email}
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        user = await prisma.user.create(
            data={
                "email": data.email,
                "password": hash_password(data.password),
                "fullName": data.fullName,
                "phone": data.phone,
            }
        )

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "fullname": user.fullName,
                "role": user.role,
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    @staticmethod
    async def login(data: LoginRequest):

        user = await prisma.user.find_unique(
            where={"email": data.email}
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        if not verify_password(data.password, user.password):
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "fullname": user.fullName,
                "role": user.role,
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
        }