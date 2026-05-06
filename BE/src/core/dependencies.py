from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

from src.core.database import prisma
from src.core.security import decode_token, verify_token_type

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_current_user(token=Depends(security)):
    payload = decode_token(token.credentials)

    if not verify_token_type(payload, "access"):
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await prisma.user.find_unique(where={"id": int(user_id)})

    if not user or user.deletedAt:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.isActive:
        raise HTTPException(status_code=403, detail="User disabled")

    return user


async def get_optional_current_user(token=Depends(optional_security)):
    if not token:
        return None

    payload = decode_token(token.credentials)

    if not verify_token_type(payload, "access"):
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = await prisma.user.find_unique(where={"id": int(user_id)})

    if not user or user.deletedAt or not user.isActive:
        return None

    return user
