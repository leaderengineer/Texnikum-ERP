from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Index, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Grade(Base):
    """Baholash modeli - Elektron jurnal uchun"""
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    student_name = Column(String, nullable=False)
    student_student_id = Column(String, nullable=False, index=True)
    group = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False, index=True)  # Yo'nalish
    subject = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    grade = Column(Float, nullable=False)  # Baho (2-5 yoki 0-100)
    grade_type = Column(String, nullable=False, default="oral")  # oral, written, practical, test, exam
    description = Column(String, nullable=True)  # Izoh
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", backref="grades")
    student = relationship("Student", backref="grades")

    # Composite indexlar
    __table_args__ = (
        Index('idx_grade_institution', 'institution_id'),
        Index('idx_grade_student_date', 'student_id', 'date'),
        Index('idx_grade_group_subject', 'group', 'subject'),
        Index('idx_grade_department_group', 'department', 'group'),
        Index('idx_grade_date_group', 'date', 'group'),
    )

    def __repr__(self):
        return f"<Grade {self.student_student_id} - {self.grade} - {self.date}>"
