from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None

class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None
    
    password: Optional[str] = None





class UserInDB(UserBase):
    id: int
    role: str
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    deletedAt: Optional[datetime] = None
    password: str   

    class Config:
        from_attributes = True



class UserOut(UserBase):
    id: int
    role: str
    isActive: bool
    createdAt: datetime

    class Config:
        from_attributes = True