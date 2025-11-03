from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.attendance import AttendanceStatus


class AttendanceBase(BaseModel):
    student_id: int
    student_name: str
    student_student_id: str
    group: str
    subject: str
    date: date
    status: AttendanceStatus = AttendanceStatus.ABSENT
    time: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    time: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

