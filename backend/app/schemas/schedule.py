from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScheduleBase(BaseModel):
    group: str
    subject: str
    teacher: str
    day: str
    time: str
    room: str


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    group: Optional[str] = None
    subject: Optional[str] = None
    teacher: Optional[str] = None
    day: Optional[str] = None
    time: Optional[str] = None
    room: Optional[str] = None


class ScheduleResponse(ScheduleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

