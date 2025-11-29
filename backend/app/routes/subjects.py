from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.auth import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("/", response_model=List[SubjectResponse])
async def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha fanlar ro'yxati"""
    subjects = db.query(Subject).filter(
        Subject.institution_id == current_user.institution_id,
        Subject.is_active == True
    ).order_by(Subject.name).all()
    return subjects


@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fan ma'lumotlari"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.institution_id == current_user.institution_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


@router.post("/", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Yangi fan qo'shish"""
    # Name tekshirish (faqat joriy institution'da)
    existing = db.query(Subject).filter(
        Subject.name == subject_data.name,
        Subject.institution_id == current_user.institution_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject name already exists")
    
    # Institution_id qo'shish
    subject_dict = subject_data.model_dump()
    subject_dict['institution_id'] = current_user.institution_id
    subject = Subject(**subject_dict)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    subject_data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Fan ma'lumotlarini yangilash"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.institution_id == current_user.institution_id
    ).first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Name o'zgarganda, yangi nomi unique ekanligini tekshirish
    if subject_data.name and subject_data.name != subject.name:
        existing = db.query(Subject).filter(
            Subject.name == subject_data.name,
            Subject.institution_id == current_user.institution_id,
            Subject.id != subject_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Subject name already exists")
    
    update_data = subject_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subject, field, value)
    
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Fanni o'chirish (soft delete - is_active = False)"""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.institution_id == current_user.institution_id
    ).first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Soft delete - faqat is_active ni False qilamiz
    subject.is_active = False
    db.commit()
    return {"message": "Subject deleted successfully"}

