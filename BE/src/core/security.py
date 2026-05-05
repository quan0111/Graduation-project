from datetime import datetime, timedelta
import hashlib
from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext
from src.core.config import get_settings
from src.core.database import prisma

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


# ===== PASSWORD =====
def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


# ===== TOKEN HASH =====
def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()


# ===== CREATE TOKEN =====
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
        "type": "refresh"
    })

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


# ===== DECODE TOKEN (CHỈ VERIFY JWT) =====
def decode_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except ExpiredSignatureError:
        return None
    except JWTError:
        return None


# ===== VERIFY TYPE =====
def verify_token_type(payload: dict, expected_type: str):
    return payload and payload.get("type") == expected_type


# ===== VERIFY REFRESH TOKEN (CHECK DB) =====
async def verify_refresh_token(token: str):
    payload = decode_token(token)

    if not verify_token_type(payload, "refresh"):
        return None

    hashed = hash_token(token)

    stored = await prisma.refreshtoken.find_unique(
        where={"token": hashed}
    )

    if not stored or stored.isRevoked:
        return None

    if stored.expiresAt < datetime.utcnow():
        return None

    return payload


# ===== REFRESH ACCESS =====
async def refresh_access_token(token: str):
    payload = await verify_refresh_token(token)

    if not payload:
        return None

    return create_access_token({
        "sub": payload.get("sub")
    })


# ===== REVOKE TOKEN =====
async def revoke_token(token: str):
    hashed = hash_token(token)

    stored = await prisma.refreshtoken.find_unique(
        where={"token": hashed}
    )

    if not stored:
        return False

    await prisma.refreshtoken.update(
        where={"token": hashed},
        data={"isRevoked": True}
    )

    return True