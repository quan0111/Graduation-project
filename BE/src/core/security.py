from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from src.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.JWTError:
        return None
def refresh_access_token(token: str, expires_delta: int = 60):
    payload = decode_access_token(token)
    if payload is None:
        return None
    return create_access_token(data={"sub": payload.get("sub")}, expires_delta=expires_delta)
def revoke_token(token: str):    # Trong thực tế, bạn cần lưu token đã bị thu hồi vào cơ sở dữ liệu hoặc cache để kiểm tra sau này
    # Ví dụ: revoked_tokens.add(token)
    pass