from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.grade import Grade
from app.models.student import Student
from app.models.attendance import Attendance
from app.schemas.grade import GradeCreate, GradeUpdate, GradeResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[GradeResponse])
async def get_grades(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    date_filter: Optional[date] = None,
    group: Optional[str] = None,
    department: Optional[str] = None,
    subject: Optional[str] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha baholar ro'yxati"""
    query = db.query(Grade).filter(Grade.institution_id == current_user.institution_id)
    
    if date_filter:
        query = query.filter(Grade.date == date_filter)
    if group:
        query = query.filter(Grade.group == group)
    if department:
        query = query.filter(Grade.department == department)
    if subject:
        query = query.filter(Grade.subject == subject)
    if student_id:
        query = query.filter(Grade.student_id == student_id)
    
    grades = query.order_by(Grade.date.desc()).offset(skip).limit(limit).all()
    return grades


@router.get("/student/{student_id}", response_model=List[GradeResponse])
async def get_grades_by_student(
    student_id: int,
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talaba bo'yicha baholar"""
    query = db.query(Grade).filter(
        Grade.student_id == student_id,
        Grade.institution_id == current_user.institution_id
    )
    
    if subject:
        query = query.filter(Grade.subject == subject)
    
    grades = query.order_by(Grade.date.desc()).all()
    return grades


@router.get("/group/{group}/subject/{subject}/date/{grade_date}", response_model=List[GradeResponse])
async def get_grades_by_group_subject_date(
    group: str,
    subject: str,
    grade_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Guruh, fan va sana bo'yicha baholar"""
    grades = db.query(Grade).filter(
        Grade.group == group,
        Grade.subject == subject,
        Grade.date == grade_date,
        Grade.institution_id == current_user.institution_id
    ).all()
    return grades


@router.post("/", response_model=GradeResponse)
async def create_grade(
    grade_data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yangi baho qo'shish"""
    # Talaba mavjudligini tekshirish
    student = db.query(Student).filter(
        Student.id == grade_data.student_id,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Talaba uchun davomat olinganligini tekshirish
    attendance = db.query(Attendance).filter(
        Attendance.student_id == grade_data.student_id,
        Attendance.date == grade_data.date,
        Attendance.group == grade_data.group,
        Attendance.subject == grade_data.subject,
        Attendance.institution_id == current_user.institution_id,
        Attendance.status == "present"
    ).first()
    
    if not attendance:
        raise HTTPException(
            status_code=400,
            detail="Talaba uchun avval davomat olinishi kerak. Faqat qatnashgan talabalarga baho qo'yish mumkin."
        )
    
    # Mavjud baho yozuvini tekshirish
    existing = db.query(Grade).filter(
        Grade.student_id == grade_data.student_id,
        Grade.date == grade_data.date,
        Grade.group == grade_data.group,
        Grade.subject == grade_data.subject,
        Grade.grade_type == grade_data.grade_type,
        Grade.institution_id == current_user.institution_id
    ).first()
    
    if existing:
        # Update qilish
        existing.grade = grade_data.grade
        existing.description = grade_data.description
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Yangi yaratish
        grade_dict = grade_data.model_dump()
        grade_dict['institution_id'] = current_user.institution_id
        grade = Grade(**grade_dict)
        db.add(grade)
        db.commit()
        db.refresh(grade)
        return grade


@router.put("/{grade_id}", response_model=GradeResponse)
async def update_grade(
    grade_id: int,
    grade_data: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bahoni yangilash"""
    grade = db.query(Grade).filter(
        Grade.id == grade_id,
        Grade.institution_id == current_user.institution_id
    ).first()
    
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    update_data = grade_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(grade, field, value)
    
    db.commit()
    db.refresh(grade)
    return grade


@router.delete("/{grade_id}")
async def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bahoni o'chirish"""
    grade = db.query(Grade).filter(
        Grade.id == grade_id,
        Grade.institution_id == current_user.institution_id
    ).first()
    
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    db.delete(grade)
    db.commit()
    return {"message": "Grade deleted successfully"}


@router.get("/statistics/group/{group}/subject/{subject}")
async def get_grade_statistics(
    group: str,
    subject: str,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Guruh va fan bo'yicha baho statistikasi"""
    query = db.query(Grade).filter(
        Grade.group == group,
        Grade.subject == subject,
        Grade.institution_id == current_user.institution_id
    )
    
    if date_from:
        query = query.filter(Grade.date >= date_from)
    if date_to:
        query = query.filter(Grade.date <= date_to)
    
    grades = query.all()
    
    if not grades:
        return {
            "total": 0,
            "average": 0,
            "excellent": 0,  # 5 (90-100)
            "good": 0,  # 4 (75-89)
            "satisfactory": 0,  # 3 (60-74)
            "unsatisfactory": 0,  # 2 (0-59)
        }
    
    total = len(grades)
    total_grade = sum(g.grade for g in grades)
    average = total_grade / total if total > 0 else 0
    
    excellent = len([g for g in grades if g.grade >= 90])
    good = len([g for g in grades if 75 <= g.grade < 90])
    satisfactory = len([g for g in grades if 60 <= g.grade < 75])
    unsatisfactory = len([g for g in grades if g.grade < 60])
    
    return {
        "total": total,
        "average": round(average, 2),
        "excellent": excellent,
        "good": good,
        "satisfactory": satisfactory,
        "unsatisfactory": unsatisfactory,
    }
