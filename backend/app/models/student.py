from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    group = Column(String, nullable=False, index=True)  # Index qo'shildi
    department = Column(String, nullable=False, index=True)  # Index qo'shildi
    status = Column(String, default="active", index=True)  # Index qo'shildi
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Composite indexlar - ko'p ustunli qidirish uchun
    __table_args__ = (
        Index('idx_student_group_dept', 'group', 'department'),
        Index('idx_student_name_search', 'first_name', 'last_name'),
    )

    def __repr__(self):
        return f"<Student {self.student_id}>"

