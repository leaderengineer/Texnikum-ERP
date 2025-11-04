from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from app.auth import get_current_user, get_current_active_admin
from app.utils.jshshir import get_person_info_by_jshshir, parse_jshshir

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
    from sqlalchemy.orm import joinedload
    
    query = db.query(Teacher).options(joinedload(Teacher.user))
    
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
    # Email tekshirish (User jadvalida)
    from app.models.user import User
    existing_user = db.query(User).filter(User.email == teacher_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists in users")
    
    # Email tekshirish (Teacher jadvalida)
    existing_teacher = db.query(Teacher).filter(Teacher.email == teacher_data.email).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # User yaratish
    from app.auth import get_password_hash
    from app.models.user import UserRole
    import secrets
    
    # Agar password yuborilmasa, default password yaratish
    password = teacher_data.password or secrets.token_urlsafe(12)
    hashed_password = get_password_hash(password)
    
    try:
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
        # Status'ni normalizatsiya qilish va default qilish
        teacher_status = teacher_data.status
        if not teacher_status or teacher_status.strip() == '':
            teacher_status = "active"
        else:
            teacher_status = str(teacher_status).strip().lower()
        
        teacher = Teacher(
            user_id=user.id,
            email=teacher_data.email,
            phone=teacher_data.phone,
            department=teacher_data.department,
            status=teacher_status,
        )
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        
        # User relationship'ni yuklash
        db.refresh(teacher, ["user"])
        
        return teacher
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating teacher: {str(e)}")


@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """O'qituvchi ma'lumotlarini yangilash"""
    from sqlalchemy.orm import joinedload
    
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Barcha field'larni olish (exclude_unset=False) - status ham o'zgarishi mumkin
    # Lekin faqat yuborilgan field'larni yangilash uchun exclude_unset=True ishlatamiz
    update_data = teacher_data.model_dump(exclude_unset=True)
    
    # Status alohida tekshirish va yangilash - agar yuborilgan bo'lsa
    if 'status' in update_data:
        status_value = update_data['status']
        # Status None yoki bo'sh bo'lmasligini tekshirish
        if status_value is not None and str(status_value).strip() != '':
            normalized_status = str(status_value).strip().lower()
            # Faqat 'active' yoki 'inactive' bo'lishini ta'minlash
            if normalized_status not in ['active', 'inactive']:
                # Agar 'Active' yoki 'Inactive' bo'lsa, lowercase qilish
                normalized_status = normalized_status.lower()
                if normalized_status not in ['active', 'inactive']:
                    normalized_status = 'active'  # Default
            teacher.status = normalized_status
        else:
            # Agar status bo'sh yoki None bo'lsa, default 'active' qilish
            teacher.status = 'active'
    
    # Teacher field'larini yangilash (status bundan tashqari)
    for field, value in update_data.items():
        if field in ['email', 'phone', 'department']:
            if value is not None:
                setattr(teacher, field, value)
    
    # User ma'lumotlarini yangilash (first_name, last_name, email)
    if teacher.user:
        if 'first_name' in update_data:
            teacher.user.first_name = update_data['first_name']
        if 'last_name' in update_data:
            teacher.user.last_name = update_data['last_name']
        if 'email' in update_data:
            # Email uniqueness tekshirish
            existing_user = db.query(User).filter(
                User.email == update_data['email'],
                User.id != teacher.user.id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already exists in users")
            teacher.user.email = update_data['email']
    
    db.commit()
    db.refresh(teacher)
    db.refresh(teacher, ["user"])
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


@router.get("/jshshir/{jshshir}")
async def get_person_by_jshshir(
    jshshir: str,
    current_user: User = Depends(get_current_user),
):
    """
    JSHSHIR raqami bo'yicha shaxs ma'lumotlarini olish
    
    JSHSHIR raqami 14 xonali raqam bo'lishi kerak.
    Ushbu endpoint JSHSHIR raqamidan tug'ilgan sana, jins va boshqa ma'lumotlarni qaytaradi.
    
    Haqiqiy API integratsiyasi uchun bu endpoint'ni o'zgartirish kerak.
    """
    try:
        person_info = get_person_info_by_jshshir(jshshir)
        return {
            "success": True,
            "data": person_info
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JSHSHIR ma'lumotlarini olishda xatolik: {str(e)}")

