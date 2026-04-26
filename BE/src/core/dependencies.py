from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt

from src.core.config import get_settings
from src.core.database import prisma

security = HTTPBearer()
settings = get_settings()


async def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(
            token.credentials,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await prisma.user.find_unique(where={"id": int(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user