from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class GradeBase(BaseModel):
    student_id: int
    student_name: str
    student_student_id: str
    group: str
    department: str  # Yo'nalish
    subject: str
    date: date
    grade: float = Field(..., ge=2, le=5, description="Baho (2-5)")
    grade_type: str = Field(default="oral", description="Baho turi: oral, written, practical, test, exam")
    description: Optional[str] = None


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    grade: Optional[float] = Field(None, ge=2, le=5)
    grade_type: Optional[str] = None
    description: Optional[str] = None


class GradeResponse(GradeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
