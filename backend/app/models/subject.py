from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)  # Fan nomi: Matematika, Fizika, etc.
    description = Column(String, nullable=True)  # Fan haqida qisqacha ma'lumot
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    institution = relationship("Institution", backref="subjects")

    __table_args__ = (
        Index('idx_subject_institution', 'institution_id'),
        Index('idx_subject_name_institution', 'name', 'institution_id'),
    )

    def __repr__(self):
        return f"<Subject {self.name}>"

