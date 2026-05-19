from fastapi import Request, HTTPException

from src.core.redis import RedisClient

RATE_LIMIT = 120  
TIME_WINDOW = 60  

request_logs = {}


def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def check_rate_limit(request: Request):

    ip = _client_ip(request)
    key = f"security:rate_limit:{ip}"
    count = await RedisClient.incr(key)
    if count == 1:
        await RedisClient.expire(key, TIME_WINDOW)
    if count > RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many requests"
        )
    if count > 0:
        return

    import time

    now = time.time()

    if ip not in request_logs:
        request_logs[ip] = []

    request_logs[ip] = [
        t for t in request_logs[ip] if now - t < TIME_WINDOW
    ]

    if len(request_logs[ip]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many requests"
        )

    request_logs[ip].append(now)
