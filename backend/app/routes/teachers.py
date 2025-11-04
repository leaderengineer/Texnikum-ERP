from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from app.auth import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("/", response_model=List[TeacherResponse])
async def get_teachers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha o'qituvchilar ro'yxati"""
    query = db.query(Teacher)
    
    if department:
        query = query.filter(Teacher.department == department)
    if status:
        query = query.filter(Teacher.status == status)
    
    teachers = query.offset(skip).limit(limit).all()
    return teachers


@router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """O'qituvchi ma'lumotlari"""
    from sqlalchemy.orm import joinedload
    
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.post("/", response_model=TeacherResponse)
async def create_teacher(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Yangi o'qituvchi qo'shish"""
    # Email tekshirish
    existing = db.query(Teacher).filter(Teacher.email == teacher_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # User yaratish
    from app.auth import get_password_hash
    from app.models.user import User, UserRole
    import secrets
    
    # Agar password yuborilmasa, default password yaratish
    password = teacher_data.password or secrets.token_urlsafe(12)
    hashed_password = get_password_hash(password)
    
    user = User(
        email=teacher_data.email,
        first_name=teacher_data.first_name,
        last_name=teacher_data.last_name,
        hashed_password=hashed_password,
        role=UserRole.TEACHER,
        is_active=True,
    )
    db.add(user)
    db.flush()
    
    # Teacher yaratish
    teacher = Teacher(
        user_id=user.id,
        email=teacher_data.email,
        phone=teacher_data.phone,
        department=teacher_data.department,
        status=teacher_data.status,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    
    # User relationship'ni yuklash
    db.refresh(teacher, ["user"])
    
    return teacher


@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """O'qituvchi ma'lumotlarini yangilash"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    update_data = teacher_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(teacher, field, value)
    
    db.commit()
    db.refresh(teacher)
    return teacher


@router.delete("/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """O'qituvchini o'chirish"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    db.delete(teacher)
    db.commit()
    return {"message": "Teacher deleted successfully"}

