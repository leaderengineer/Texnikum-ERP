from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    student_name = Column(String, nullable=False)
    student_student_id = Column(String, nullable=False, index=True)  # ST001, ST002, etc.
    group = Column(String, nullable=False, index=True)  # Index qo'shildi
    subject = Column(String, nullable=False)
    date = Column(Date, nullable=False, index=True)  # Index qo'shildi
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.ABSENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", backref="attendance_records")
    student = relationship("Student", backref="attendance_records")

    # Composite indexlar - ko'p ustunli qidirish uchun
    __table_args__ = (
        Index('idx_attendance_institution', 'institution_id'),
        Index('idx_attendance_date_group', 'date', 'group'),
        Index('idx_attendance_student_date', 'student_id', 'date'),
    )

    def __repr__(self):
        return f"<Attendance {self.student_student_id} - {self.date} - Institution {self.institution_id}>"

