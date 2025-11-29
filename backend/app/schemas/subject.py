from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SubjectResponse(SubjectBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

