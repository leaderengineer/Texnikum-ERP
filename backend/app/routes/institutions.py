from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate, InstitutionUpdate, InstitutionResponse
from app.auth import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("/", response_model=List[InstitutionResponse])
async def get_institutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha muassasalar ro'yxati (faqat admin ko'ra oladi)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all institutions")
    
    institutions = db.query(Institution).filter(Institution.is_active == True).all()
    return institutions


@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Muassasa ma'lumotlari"""
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # Foydalanuvchi faqat o'z muassasasini ko'ra oladi
    if current_user.role != "admin" and current_user.institution_id != institution_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return institution


@router.post("/", response_model=InstitutionResponse)
async def create_institution(
    institution_data: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Yangi muassasa yaratish (faqat admin)"""
    # Code uniqueness tekshirish
    existing = db.query(Institution).filter(Institution.code == institution_data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution code already exists")
    
    institution = Institution(**institution_data.model_dump())
    db.add(institution)
    db.commit()
    db.refresh(institution)
    return institution


@router.put("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: int,
    institution_data: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Muassasa ma'lumotlarini yangilash (faqat admin)"""
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # Admin faqat o'z institution'ini yangilay oladi
    if current_user.institution_id != institution_id:
        raise HTTPException(status_code=403, detail="You can only update your own institution")
    
    update_data = institution_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(institution, field, value)
    
    db.commit()
    db.refresh(institution)
    return institution


@router.delete("/{institution_id}")
async def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Muassasani o'chirish (faqat admin)"""
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # Soft delete - is_active = False
    institution.is_active = False
    db.commit()
    return {"message": "Institution deleted successfully"}

