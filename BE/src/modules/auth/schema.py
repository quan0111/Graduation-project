from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    fullName: Optional[str] = None
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthUser(BaseModel):
    id: int
    email: EmailStr
    fullName: Optional[str] = None
    role: str
    isActive: bool

class AuthResponse(BaseModel):
    user: AuthUser
    access_token: str
    refresh_token: str
    token_type: str = "bearer"