from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

from src.core.rate_limit import check_rate_limit
from src.core.IP_blacklist import check_ip_blacklist


class SecurityMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        await check_ip_blacklist(request)

        await check_rate_limit(request)

        response = await call_next(request)

        return response
