from fastapi import HTTPException, Request

from src.core.redis import RedisClient


blacklist = set()
BLACKLIST_KEY_PREFIX = "security:ip_blacklist:"


def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def add_ip_to_blackList(ip: str, ttl_seconds: int | None = None):
    blacklist.add(ip)
    await RedisClient.set(
        f"{BLACKLIST_KEY_PREFIX}{ip}",
        "1",
        expire=ttl_seconds,
    )


async def check_ip_blacklist(request: Request):
    ip = _client_ip(request)

    if await RedisClient.exists(f"{BLACKLIST_KEY_PREFIX}{ip}") or ip in blacklist:
        raise HTTPException(
            status_code=403,
            detail="Your IP has been blocked",
        )
