from datetime import datetime, timedelta
import hashlib

from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext

from src.core.config import get_settings
from src.core.database import prisma

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
AUTH_SCOPE_STOREFRONT = "storefront"
AUTH_SCOPE_ADMIN = "admin"


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)


def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(
    data: dict,
    expires_delta: int | None = None,
    scope: str = AUTH_SCOPE_STOREFRONT
):
    to_encode = data.copy()
    expire_minutes = expires_delta or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
    to_encode.update({
        "exp": expire,
        "type": "access",
        "scope": scope,
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(
    data: dict,
    expires_delta: int = 10080,
    scope: str = AUTH_SCOPE_STOREFRONT
):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "scope": scope,
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        return payload
    except ExpiredSignatureError:
        return None
    except JWTError:
        return None


def verify_token_type(
    payload: dict | None,
    expected_type: str,
    expected_scope: str | None = None
):
    if not payload or payload.get("type") != expected_type:
        return False

    if expected_scope is not None and payload.get("scope") != expected_scope:
        return False

    return True


async def verify_refresh_token(token: str, expected_scope: str | None = None):
    payload = decode_token(token)

    if not verify_token_type(payload, "refresh", expected_scope):
        return None

    hashed = hash_token(token)
    stored = await prisma.refreshtoken.find_unique(where={"token": hashed})

    if not stored or stored.isRevoked:
        return None

    if stored.expiresAt < datetime.utcnow():
        return None

    return payload


async def refresh_access_token(token: str):
    payload = await verify_refresh_token(token)

    if not payload:
        return None

    return create_access_token(
        {"sub": payload.get("sub")},
        scope=payload.get("scope", AUTH_SCOPE_STOREFRONT),
    )


async def revoke_token(token: str):
    hashed = hash_token(token)
    stored = await prisma.refreshtoken.find_unique(where={"token": hashed})

    if not stored:
        return False

    await prisma.refreshtoken.update(
        where={"token": hashed},
        data={"isRevoked": True},
    )
    return True
