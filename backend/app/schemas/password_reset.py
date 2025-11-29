from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class PasswordResetRequest(BaseModel):
    """Parolni tiklash so'rovi - email yuborish"""
    email: EmailStr = Field(..., description="Elektron pochta manzili")


class PasswordResetVerify(BaseModel):
    """Email kodini tekshirish"""
    email: EmailStr = Field(..., description="Elektron pochta manzili")
    code: str = Field(..., min_length=6, max_length=6, description="6 xonali kod")


class PasswordResetConfirm(BaseModel):
    """Yangi parol o'rnatish"""
    email: EmailStr = Field(..., description="Elektron pochta manzili")
    code: str = Field(..., min_length=6, max_length=6, description="6 xonali kod")
    new_password: str = Field(..., min_length=6, description="Yangi parol (kamida 6 ta belgi)")


class PasswordResetResponse(BaseModel):
    """Parolni tiklash javobi"""
    message: str
    success: bool = True

