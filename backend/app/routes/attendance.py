from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.institution import Institution
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.auth import get_current_user
from app.utils.geolocation import is_within_radius, calculate_distance

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
    query = db.query(Attendance).filter(Attendance.institution_id == current_user.institution_id)
    
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
    query = db.query(Attendance).filter(
        Attendance.date == attendance_date,
        Attendance.institution_id == current_user.institution_id
    )
    
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
        .filter(
            Attendance.student_id == student_id,
            Attendance.institution_id == current_user.institution_id
        )
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
    query = db.query(Attendance).filter(Attendance.institution_id == current_user.institution_id)
    
    if date_filter:
        query = query.filter(Attendance.date == date_filter)
    if group:
        query = query.filter(Attendance.group == group)
    if subject:
        query = query.filter(Attendance.subject == subject)
    
    total = query.count()
    present = query.filter(Attendance.status == "present").count()
    absent = query.filter(Attendance.status == "absent").count()
    
    rate = (present / total * 100) if total > 0 else 0
    
    return {
        "total": total,
        "present": present,
        "absent": absent,
        "rate": round(rate, 2),
    }


@router.post("/", response_model=AttendanceResponse)
async def create_attendance(
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yangi davomat yozuvi qo'shish"""
    # Institution ma'lumotlarini olish
    institution = db.query(Institution).filter(
        Institution.id == current_user.institution_id
    ).first()
    
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # Geolocation tekshiruvi (faqat o'qituvchilar uchun va geolocation yoqilgan bo'lsa)
    if current_user.role == "teacher" and institution.geolocation_enabled:
        if not attendance_data.latitude or not attendance_data.longitude:
            raise HTTPException(
                status_code=400,
                detail="Geolocation ma'lumotlari talab qilinadi. Iltimos, joylashuvingizni ruxsat bering."
            )
        
        if not institution.latitude or not institution.longitude or not institution.geolocation_radius:
            raise HTTPException(
                status_code=400,
                detail="Institution geolocation sozlamalari to'liq emas. Iltimos, admin bilan bog'laning."
            )
        
        # Radius ichida ekanligini tekshirish
        if not is_within_radius(
            user_lat=attendance_data.latitude,
            user_lon=attendance_data.longitude,
            institution_lat=institution.latitude,
            institution_lon=institution.longitude,
            radius_meters=institution.geolocation_radius
        ):
            distance = calculate_distance(
                attendance_data.latitude,
                attendance_data.longitude,
                institution.latitude,
                institution.longitude
            )
            raise HTTPException(
                status_code=403,
                detail=f"Davomat olish uchun institution radius ichida bo'lishingiz kerak. "
                       f"Siz {distance:.0f} metr uzoqlikdasiz, lekin ruxsat etilgan radius {institution.geolocation_radius:.0f} metr."
            )
    
    # Agar student_name va student_student_id yuborilmasa, Student'dan olish
    if not attendance_data.student_name or not attendance_data.student_student_id:
        student = db.query(Student).filter(
            Student.id == attendance_data.student_id,
            Student.institution_id == current_user.institution_id
        ).first()
        if student:
            # Schema'ni yangilash
            attendance_dict = attendance_data.model_dump()
            attendance_dict['student_name'] = attendance_dict.get('student_name') or f"{student.first_name} {student.last_name}"
            attendance_dict['student_student_id'] = attendance_dict.get('student_student_id') or student.student_id or ''
            attendance_data = AttendanceCreate(**attendance_dict)
    
    # Mavjud attendance yozuvini tekshirish (bir xil student, date, group, subject)
    existing = db.query(Attendance).filter(
        Attendance.student_id == attendance_data.student_id,
        Attendance.date == attendance_data.date,
        Attendance.group == attendance_data.group,
        Attendance.subject == attendance_data.subject,
        Attendance.institution_id == current_user.institution_id
    ).first()
    
    if existing:
        # Update qilish
        existing.status = attendance_data.status
        existing.student_name = attendance_data.student_name
        existing.student_student_id = attendance_data.student_student_id
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Yangi yaratish
        attendance_dict = attendance_data.model_dump()
        attendance_dict['institution_id'] = current_user.institution_id
        # latitude va longitude'ni olib tashlash (model'da bu maydonlar yo'q)
        attendance_dict.pop('latitude', None)
        attendance_dict.pop('longitude', None)
        attendance = Attendance(**attendance_dict)
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
    attendance = db.query(Attendance).filter(
        Attendance.id == attendance_id,
        Attendance.institution_id == current_user.institution_id
    ).first()
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
    attendance = db.query(Attendance).filter(
        Attendance.id == attendance_id,
        Attendance.institution_id == current_user.institution_id
    ).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    db.delete(attendance)
    db.commit()
    return {"message": "Attendance deleted successfully"}

