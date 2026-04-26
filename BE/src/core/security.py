from datetime import datetime, timedelta
from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext
from src.core.config import get_settings
from src.core.database import prisma

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)

    to_encode.update({
        "exp": expire,
        "type": "access"   
    })

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: int = 10080):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)

    to_encode.update({
        "exp": expire,
        "type": "refresh"   # 🔥 thêm type
    })

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

async def decode_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # 🔥 check revoke
        stored = await prisma.refreshtoken.find_unique(
            where={"token": token}
        )

        if stored and stored.isRevoked:
            return None

        return payload

    except ExpiredSignatureError:
        print("Token expired")
        return None
    except JWTError as e:
        print("JWT error:", e)
        return None
    
def verify_token_type(payload: dict, expected_type: str):
    if not payload or payload.get("type") != expected_type:
        return False
    return True


def refresh_access_token(token: str, expires_delta: int = 60):
    payload = decode_token(token)

    if not verify_token_type(payload, "refresh"):
        return None

    return create_access_token(
        data={"sub": payload.get("sub")},
        expires_delta=expires_delta
    )

async def revoke_token(token: str):
    stored = await prisma.refreshtoken.find_unique(
        where={"token": token}
    )

    if not stored:
        return False

    await prisma.refreshtoken.update(
        where={"token": token},
        data={"isRevoked": True}
    )

    return True