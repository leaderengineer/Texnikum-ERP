from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Index
from sqlalchemy.sql import func
from app.database import Base


class Institution(Base):
    """Texnikum/Muassasa modeli - Multi-tenancy uchun"""
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)  # "Toshkent Texnikumi"
    code = Column(String, unique=True, index=True, nullable=False)  # "TT-001"
    region = Column(String, nullable=True)  # "Toshkent", "Samarqand", etc.
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    director_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    # Geolocation fields
    geolocation_enabled = Column(Boolean, default=False, index=True)
    latitude = Column(Float, nullable=True)  # Institution koordinatalari
    longitude = Column(Float, nullable=True)  # Institution koordinatalari
    geolocation_radius = Column(Float, nullable=True)  # Radius metrlarda (masalan 500)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Index - code va name bo'yicha tezkor qidirish uchun
    __table_args__ = (
        Index('idx_institution_code', 'code'),
        Index('idx_institution_name', 'name'),
    )

    def __repr__(self):
        return f"<Institution {self.code} - {self.name}>"

