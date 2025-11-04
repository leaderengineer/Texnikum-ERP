from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="teacher_profile")

    @property
    def first_name(self):
        """User'dan first_name olish"""
        return self.user.first_name if self.user else None

    @property
    def last_name(self):
        """User'dan last_name olish"""
        return self.user.last_name if self.user else None

    def __repr__(self):
        return f"<Teacher {self.email}>"

