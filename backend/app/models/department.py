from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)  # unique constraint institution_id bilan birga
    code = Column(String, nullable=False, index=True)  # unique constraint institution_id bilan birga
    description = Column(String, nullable=True)
    head = Column(String, nullable=True)
    established_year = Column(Integer, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    institution = relationship("Institution", backref="departments")

    # Composite indexlar
    __table_args__ = (
        Index('idx_department_institution', 'institution_id'),
        Index('idx_department_code_institution', 'code', 'institution_id', unique=True),
        Index('idx_department_name_institution', 'name', 'institution_id', unique=True),
    )

    def __repr__(self):
        return f"<Department {self.code} - Institution {self.institution_id}>"

