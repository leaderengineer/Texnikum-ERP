from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.schemas.pagination import PaginatedResponse, PaginationMeta
from app.auth import get_current_user, get_current_active_admin
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=PaginatedResponse[StudentResponse])
@limiter.limit(f"{settings.API_RATE_LIMIT_PER_MINUTE}/minute")
async def get_students(
    request: Request,
    page: int = Query(1, ge=1, description="Sahifa raqami"),
    limit: int = Query(20, ge=1, le=100, description="Har bir sahifadagi elementlar soni"),
    group: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha talabalar ro'yxati (pagination bilan)"""
    # Base query
    query = db.query(Student)
    
    # Filterlar
    if group:
        query = query.filter(Student.group == group)
    if department:
        query = query.filter(Student.department == department)
    if status:
        query = query.filter(Student.status == status)
    
    # Qidirish (ism, familiya, email, student_id bo'yicha)
    if search:
        search_filter = (
            Student.first_name.ilike(f"%{search}%") |
            Student.last_name.ilike(f"%{search}%") |
            Student.email.ilike(f"%{search}%") |
            Student.student_id.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Total count (filterlardan keyin)
    total = query.count()
    
    # Pagination
    skip = (page - 1) * limit
    students = query.order_by(Student.created_at.desc()).offset(skip).limit(limit).all()
    
    # Pagination metadata
    meta = PaginationMeta.create(total=total, page=page, limit=limit)
    
    return PaginatedResponse(items=students, meta=meta)


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talaba ma'lumotlari"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/group/{group}", response_model=List[StudentResponse])
async def get_students_by_group(
    group: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Guruh bo'yicha talabalar"""
    students = db.query(Student).filter(Student.group == group).all()
    return students


@router.post("/", response_model=StudentResponse)
@limiter.limit("30/minute")  # Create uchun kamroq limit
async def create_student(
    request: Request,
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Yangi talaba qo'shish"""
    # Email va student_id tekshirish
    existing_email = db.query(Student).filter(Student.email == student_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    existing_id = db.query(Student).filter(Student.student_id == student_data.student_id).first()
    if existing_id:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    student = Student(**student_data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Talaba ma'lumotlarini yangilash"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Talabani o'chirish"""
    from app.models.attendance import Attendance
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Talabaga bog'liq attendance yozuvlarini o'chirish
    attendance_records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    for attendance in attendance_records:
        db.delete(attendance)
    
    # Talabani o'chirish
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}

