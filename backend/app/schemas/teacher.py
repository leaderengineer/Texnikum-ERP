from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TeacherBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    department: str
    status: str = "active"


class TeacherCreate(TeacherBase):
    user_id: int
    first_name: str
    last_name: str
    password: str


class TeacherUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None


class TeacherResponse(TeacherBase):
    id: int
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

