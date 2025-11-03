from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[AttendanceResponse])
async def get_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    date_filter: Optional[date] = None,
    group: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha davomat yozuvlari"""
    query = db.query(Attendance)
    
    if date_filter:
        query = query.filter(Attendance.date == date_filter)
    if group:
        query = query.filter(Attendance.group == group)
    if subject:
        query = query.filter(Attendance.subject == subject)
    
    attendance_records = query.offset(skip).limit(limit).all()
    return attendance_records


@router.get("/date/{attendance_date}", response_model=List[AttendanceResponse])
async def get_attendance_by_date(
    attendance_date: date,
    group: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sana bo'yicha davomat"""
    query = db.query(Attendance).filter(Attendance.date == attendance_date)
    
    if group:
        query = query.filter(Attendance.group == group)
    if subject:
        query = query.filter(Attendance.subject == subject)
    
    attendance_records = query.all()
    return attendance_records


@router.get("/student/{student_id}", response_model=List[AttendanceResponse])
async def get_attendance_by_student(
    student_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talaba bo'yicha davomat"""
    attendance_records = (
        db.query(Attendance)
        .filter(Attendance.student_id == student_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return attendance_records


@router.get("/statistics")
async def get_attendance_statistics(
    date_filter: Optional[date] = None,
    group: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Davomat statistikasi"""
    query = db.query(Attendance)
    
    if date_filter:
        query = query.filter(Attendance.date == date_filter)
    if group:
        query = query.filter(Attendance.group == group)
    if subject:
        query = query.filter(Attendance.subject == subject)
    
    total = query.count()
    present = query.filter(Attendance.status == "present").count()
    absent = query.filter(Attendance.status == "absent").count()
    late = query.filter(Attendance.status == "late").count()
    
    rate = (present / total * 100) if total > 0 else 0
    
    return {
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "rate": round(rate, 2),
    }


@router.post("/", response_model=AttendanceResponse)
async def create_attendance(
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yangi davomat yozuvi qo'shish"""
    attendance = Attendance(**attendance_data.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(
    attendance_id: int,
    attendance_data: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Davomat yozuvini yangilash"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    update_data = attendance_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(attendance, field, value)
    
    db.commit()
    db.refresh(attendance)
    return attendance


@router.delete("/{attendance_id}")
async def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Davomat yozuvini o'chirish"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    db.delete(attendance)
    db.commit()
    return {"message": "Attendance deleted successfully"}

