from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    student_id = Column(String, index=True, nullable=False)  # unique constraint institution_id bilan birga
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)  # unique constraint institution_id bilan birga
    phone = Column(String, nullable=True)
    group = Column(String, nullable=False, index=True)  # Index qo'shildi
    department = Column(String, nullable=False, index=True)  # Index qo'shildi
    status = Column(String, default="active", index=True)  # Index qo'shildi
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    institution = relationship("Institution", backref="students")

    # Composite indexlar - ko'p ustunli qidirish uchun
    __table_args__ = (
        Index('idx_student_group_dept', 'group', 'department'),
        Index('idx_student_name_search', 'first_name', 'last_name'),
        Index('idx_student_institution', 'institution_id'),
        Index('idx_student_id_institution', 'student_id', 'institution_id', unique=True),
        Index('idx_student_email_institution', 'email', 'institution_id', unique=True),
    )

    def __repr__(self):
        return f"<Student {self.student_id} - Institution {self.institution_id}>"

