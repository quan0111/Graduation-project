from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthUser(BaseModel):
    id: str
    email: str
    fullname: str
    role: str


class AuthResponse(BaseModel):
    user: AuthUser
    access_token: str
    refresh_token: str