from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    email = Column(String, index=True, nullable=False)  # unique constraint institution_id bilan birga
    username = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True, index=True)  # Telefon raqami parolni tiklash uchun
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)  # Profil rasmi URL'i
    role = Column(Enum(UserRole), default=UserRole.TEACHER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    institution = relationship("Institution", backref="users")

    # Composite index - email va institution_id birga unique bo'lishi kerak
    __table_args__ = (
        Index('idx_user_email_institution', 'email', 'institution_id', unique=True),
    )

    def __repr__(self):
        return f"<User {self.email} - Institution {self.institution_id}>"

