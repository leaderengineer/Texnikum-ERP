from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.book import Book
from app.models.attendance import Attendance
from app.models.department import Department
from app.auth import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dashboard umumiy statistika"""
    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_teachers = db.query(func.count(Teacher.id)).scalar() or 0
    total_books = db.query(func.count(Book.id)).scalar() or 0
    
    # Bugungi davomat
    from datetime import date
    today = date.today()
    today_attendance = db.query(Attendance).filter(Attendance.date == today).all()
    today_present = len([a for a in today_attendance if a.status == "present"])
    today_total = len(today_attendance)
    attendance_rate = (today_present / today_total * 100) if today_total > 0 else 0
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_books": total_books,
        "today_attendance": today_present,
        "attendance_rate": round(attendance_rate, 2),
    }


@router.get("/attendance")
async def get_attendance_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Davomat statistikasi (haftalik)"""
    from datetime import date, timedelta
    
    stats = []
    for i in range(days):
        day = date.today() - timedelta(days=i)
        attendance_records = db.query(Attendance).filter(Attendance.date == day).all()
        
        present = len([a for a in attendance_records if a.status == "present"])
        absent = len([a for a in attendance_records if a.status == "absent"])
        
        stats.append({
            "date": day.isoformat(),
            "present": present,
            "absent": absent,
        })
    
    return stats


@router.get("/students")
async def get_student_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talabalar statistikasi (yo'nalishlar bo'yicha)"""
    from sqlalchemy import func
    
    stats = (
        db.query(
            Student.department,
            func.count(Student.id).label("count")
        )
        .group_by(Student.department)
        .all()
    )
    
    return [
        {"name": dept, "value": count}
        for dept, count in stats
    ]


@router.get("/books")
async def get_book_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kitoblar statistikasi"""
    total_books = db.query(func.count(Book.id)).scalar() or 0
    total_available = db.query(func.sum(Book.available_copies)).scalar() or 0
    total_borrowed = db.query(func.sum(Book.borrowed_copies)).scalar() or 0
    digital_books = db.query(func.count(Book.id)).filter(Book.has_digital == True).scalar() or 0
    
    return {
        "total_books": total_books,
        "total_available": total_available,
        "total_borrowed": total_borrowed,
        "digital_books": digital_books,
    }

