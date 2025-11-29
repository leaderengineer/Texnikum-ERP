from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    email = Column(String, index=True, nullable=False)  # unique constraint institution_id bilan birga
    phone = Column(String, nullable=True)
    department = Column(String, nullable=False, index=True)  # Index qo'shildi
    status = Column(String, default="active", index=True)  # Index qo'shildi
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", backref="teachers")
    user = relationship("User", backref="teacher_profile")

    # Composite index - department va status bo'yicha qidirish uchun
    __table_args__ = (
        Index('idx_teacher_dept_status', 'department', 'status'),
        Index('idx_teacher_institution', 'institution_id'),
        Index('idx_teacher_email_institution', 'email', 'institution_id', unique=True),
    )

    @property
    def first_name(self):
        """User'dan first_name olish"""
        return self.user.first_name if self.user else None

    @property
    def last_name(self):
        """User'dan last_name olish"""
        return self.user.last_name if self.user else None

    def __repr__(self):
        return f"<Teacher {self.email} - Institution {self.institution_id}>"

