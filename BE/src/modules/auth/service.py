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
    
    @staticmethod
    async def refresh_token(user_id: str):

        user = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    @staticmethod
    async def logout(user_id: str):
        # Invalidate the refresh token by removing it from the database or cache
        # This is a placeholder implementation and should be replaced with actual token invalidation logic
        return {"message": "Logged out successfully"}
    @staticmethod
    async def OAuthLogin(provider: str, token: str):
        # This is a placeholder implementation and should be replaced with actual OAuth login logic
        # You would typically verify the token with the provider and retrieve user information
        return {"message": f"Logged in with {provider} successfully"}
    @staticmethod
    async def change_password(user_id: str, new_password: str):
        user = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        hashed_password = hash_password(new_password)

        await prisma.user.update(
            where={"id": user_id},
            data={"password": hashed_password}
        )

        return {"message": "Password changed successfully"}