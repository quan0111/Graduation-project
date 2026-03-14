import time
from fastapi import Request, HTTPException

RATE_LIMIT = 60  # requests
TIME_WINDOW = 60  # seconds

request_logs = {}


def check_rate_limit(request: Request):

    ip = request.client.host
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