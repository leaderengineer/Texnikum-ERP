from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    group = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    teacher = Column(String, nullable=False)
    day = Column(String, nullable=False)  # Dushanba, Seshanba, etc.
    time = Column(String, nullable=False)  # 09:00-10:30
    room = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Schedule {self.group} - {self.subject}>"

