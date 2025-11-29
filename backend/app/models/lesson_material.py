from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class LessonMaterial(Base):
    __tablename__ = "lesson_materials"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    subject = Column(String, nullable=False, index=True)
    group = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Float, nullable=False)  # MB da
    file_type = Column(String, nullable=False)  # pdf, docx, pptx
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    uploaded_by_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", backref="lesson_materials")
    uploader = relationship("User", backref="uploaded_materials")

    __table_args__ = (
        Index('idx_material_institution', 'institution_id'),
        Index('idx_material_subject_group', 'subject', 'group'),
        Index('idx_material_department', 'department'),
        Index('idx_material_uploaded_by', 'uploaded_by'),
    )

    def __repr__(self):
        return f"<LessonMaterial {self.title} for {self.subject}>"

