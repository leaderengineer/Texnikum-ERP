from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Quiz(Base):
    """Test modeli - Talaba uchun o'z bilimini sinash"""
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False, index=True)  # Fan nomi
    department = Column(String, nullable=False, index=True)  # Yo'nalish
    
    # Test sozlamalari
    questions = Column(JSON, nullable=False)  # Savollar JSON formatida
    total_points = Column(Integer, nullable=False, default=100)  # Jami ball
    estimated_time_minutes = Column(Integer, nullable=True)  # Taxminiy vaqt (daqiqalarda)
    
    # Ko'rinish
    is_premium = Column(Boolean, default=False, index=True)  # Premium test
    is_active = Column(Boolean, default=True, index=True)
    
    # Yaratuvchi (o'qituvchi yoki admin)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_by_name = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", backref="quizzes")
    creator = relationship("User", backref="created_quizzes")

    __table_args__ = (
        Index('idx_quiz_institution', 'institution_id'),
        Index('idx_quiz_subject', 'subject'),
        Index('idx_quiz_department', 'department'),
        Index('idx_quiz_premium', 'is_premium'),
        Index('idx_quiz_created_by', 'created_by'),
    )

    def __repr__(self):
        return f"<Quiz {self.title} - {self.subject}>"


class QuizResult(Base):
    """Test natijasi - Talaba tomonidan yechilgan"""
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    student_name = Column(String, nullable=False)
    student_student_id = Column(String, nullable=False, index=True)
    
    # Natija ma'lumotlari
    completed_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    time_spent_minutes = Column(Integer, nullable=True)  # Sarflangan vaqt
    
    # Javoblar va natija
    answers = Column(JSON, nullable=False)  # Talaba javoblari
    score = Column(Integer, nullable=False)  # Olingan ball
    max_score = Column(Integer, nullable=False)  # Maksimal ball
    percentage = Column(Integer, nullable=False)  # Foiz (0-100)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    quiz = relationship("Quiz", backref="results")
    student = relationship("Student", backref="quiz_results")

    __table_args__ = (
        Index('idx_result_quiz_student', 'quiz_id', 'student_id'),
        Index('idx_result_student', 'student_id'),
        Index('idx_result_completed', 'completed_at'),
    )

    def __repr__(self):
        return f"<QuizResult {self.student_student_id} - Quiz {self.quiz_id} - {self.percentage}%>"

