from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    group = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    teacher = Column(String, nullable=False)
    day = Column(String, nullable=False)  # Dushanba, Seshanba, etc.
    time = Column(String, nullable=False)  # 09:00-10:30
    room = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    institution = relationship("Institution", backref="schedules")

    # Indexlar
    __table_args__ = (
        Index('idx_schedule_institution', 'institution_id'),
        Index('idx_schedule_group', 'group'),
    )

    def __repr__(self):
        return f"<Schedule {self.group} - {self.subject} - Institution {self.institution_id}>"

