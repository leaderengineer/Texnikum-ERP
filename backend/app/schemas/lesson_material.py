from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LessonMaterialBase(BaseModel):
    subject: str
    group: str
    department: str
    title: str
    description: Optional[str] = None


class LessonMaterialCreate(LessonMaterialBase):
    pass


class LessonMaterialUpdate(BaseModel):
    subject: Optional[str] = None
    group: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class LessonMaterialResponse(LessonMaterialBase):
    id: int
    file_name: str
    file_path: str
    file_size: float
    file_type: str
    uploaded_by: int
    uploaded_by_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

