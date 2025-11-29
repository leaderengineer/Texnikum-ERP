from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)  # unique constraint institution_id bilan birga
    code = Column(String, nullable=False, index=True)  # unique constraint institution_id bilan birga
    department = Column(String, nullable=False)
    description = Column(String, nullable=True)
    curator = Column(String, nullable=True)
    year = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    institution = relationship("Institution", backref="groups")

    # Composite indexlar
    __table_args__ = (
        Index('idx_group_institution', 'institution_id'),
        Index('idx_group_code_institution', 'code', 'institution_id', unique=True),
        Index('idx_group_name_institution', 'name', 'institution_id', unique=True),
    )

    def __repr__(self):
        return f"<Group {self.code} - Institution {self.institution_id}>"

