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


class AttendanceCreate(AttendanceBase):
    latitude: Optional[float] = None  # O'qituvchining joriy koordinatalari
    longitude: Optional[float] = None  # O'qituvchining joriy koordinatalari


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None


class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

