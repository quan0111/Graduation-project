from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
import jwt

from src.core.config import get_settings
from src.core.database import prisma

security = HTTPBearer()
settings = get_settings()


async def get_current_user(token=Depends(security)):

    try:
        payload = jwt.decode(
            token.credentials,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await prisma.user.find_unique(where={"id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user