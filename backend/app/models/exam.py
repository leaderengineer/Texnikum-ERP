from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Exam(Base):
    """Imtihon modeli - O'qituvchi tomonidan yaratiladi"""
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False, index=True)  # Fan nomi
    group = Column(String, nullable=False, index=True)  # Guruh
    department = Column(String, nullable=False, index=True)  # Yo'nalish
    
    # Vaqt sozlamalari
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)  # Imtihon boshlanish vaqti
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)  # Imtihon tugash vaqti
    duration_minutes = Column(Integer, nullable=False, default=60)  # Davomiyligi (daqiqalarda)
    
    # Talabalar sozlamalari
    allowed_students = Column(JSON, nullable=True)  # [{"id": 1, "name": "..."}, ...] - qaysi talabalar uchun
    excluded_students = Column(JSON, nullable=True)  # [{"id": 2, "name": "..."}, ...] - qaysi talabalar uchun yopiq
    
    # Imtihon sozlamalari
    max_attempts = Column(Integer, default=1, nullable=False)  # Urinishlar soni
    questions = Column(JSON, nullable=False)  # Savollar JSON formatida
    total_points = Column(Integer, nullable=False, default=100)  # Jami ball
    
    # Holat
    is_active = Column(Boolean, default=True, index=True)
    auto_close = Column(Boolean, default=True)  # Avtomatik yopish
    
    # Yaratuvchi
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_by_name = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", backref="exams")
    creator = relationship("User", backref="created_exams")

    __table_args__ = (
        Index('idx_exam_institution', 'institution_id'),
        Index('idx_exam_subject_group', 'subject', 'group'),
        Index('idx_exam_start_time', 'start_time'),
        Index('idx_exam_end_time', 'end_time'),
        Index('idx_exam_created_by', 'created_by'),
    )

    def __repr__(self):
        return f"<Exam {self.title} - {self.subject}>"


class ExamAttempt(Base):
    """Imtihon urinishi - Talaba tomonidan yechilgan"""
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    student_name = Column(String, nullable=False)
    student_student_id = Column(String, nullable=False, index=True)
    
    # Urinish ma'lumotlari
    attempt_number = Column(Integer, nullable=False, default=1)  # Qaysi urinish (1, 2, 3...)
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    time_spent_minutes = Column(Integer, nullable=True)  # Sarflangan vaqt
    
    # Javoblar va natija
    answers = Column(JSON, nullable=True)  # Talaba javoblari
    score = Column(Integer, nullable=True)  # Olingan ball
    max_score = Column(Integer, nullable=False)  # Maksimal ball
    percentage = Column(Integer, nullable=True)  # Foiz (0-100)
    
    # Holat
    is_completed = Column(Boolean, default=False, index=True)
    is_submitted = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    exam = relationship("Exam", backref="attempts")
    student = relationship("Student", backref="exam_attempts")

    __table_args__ = (
        Index('idx_attempt_exam_student', 'exam_id', 'student_id'),
        Index('idx_attempt_student', 'student_id'),
        Index('idx_attempt_submitted', 'is_submitted'),
        Index('idx_attempt_completed', 'is_completed'),
    )

    def __repr__(self):
        return f"<ExamAttempt {self.student_student_id} - Exam {self.exam_id} - Attempt {self.attempt_number}>"

