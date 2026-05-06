from fastapi import Depends, HTTPException

from BE.src.core.dependencies import get_current_user
from src.core.role import Role


def require_roles(*roles: Role):

    async def role_checker(user=Depends(get_current_user)):

        if user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission"
            )

        return user

    return role_checker