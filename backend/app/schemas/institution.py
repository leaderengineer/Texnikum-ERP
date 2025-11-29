from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class InstitutionBase(BaseModel):
    name: str
    code: str
    region: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    director_name: Optional[str] = None
    is_active: bool = True
    geolocation_enabled: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geolocation_radius: Optional[float] = None  # Metrlarda


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    director_name: Optional[str] = None
    is_active: Optional[bool] = None
    geolocation_enabled: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geolocation_radius: Optional[float] = None


class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

