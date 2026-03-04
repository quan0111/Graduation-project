from src.core.database import prisma
from src.core.security import hash_password, verify_password, create_access_token
from src.modules.auth.schema import RegisterRequest, LoginRequest


class AuthService:

    @staticmethod
    async def register(data: RegisterRequest):
        user = await prisma.user.create(
            data={
                "email": data.email,
                "password": hash_password(data.password),
                "fullName": data.fullName,
            }
        )
        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token}

    @staticmethod
    async def login(data: LoginRequest):
        user = await prisma.user.find_unique(where={"email": data.email})
        if not user:
            raise Exception("User not found")

        if not verify_password(data.password, user.password):
            raise Exception("Invalid password")

        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token}