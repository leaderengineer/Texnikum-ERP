from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.exam import Exam, ExamAttempt
from app.models.student import Student
from app.schemas.exam import (
    ExamCreate, ExamUpdate, ExamResponse,
    ExamAttemptCreate, ExamAttemptResponse, ExamAttemptSubmit
)
from app.auth import get_current_user
from app.models.user import UserRole
import json

router = APIRouter()


def check_exam_access(exam: Exam, student: Student) -> tuple:
    """Talaba imtihonga kirish huquqiga ega ekanligini tekshirish"""
    from sqlalchemy import func
    now = datetime.now(exam.start_time.tzinfo) if exam.start_time.tzinfo else datetime.now()
    
    # Vaqt tekshiruvi
    if now < exam.start_time:
        return False, "Imtihon hali boshlanmagan"
    if now > exam.end_time and exam.auto_close:
        return False, "Imtihon muddati tugagan"
    
    # Talabalar ro'yxati tekshiruvi
    if exam.allowed_students:
        allowed_ids = [s.get("id") for s in exam.allowed_students if s.get("id")]
        if student.id not in allowed_ids:
            return False, "Sizga bu imtihon uchun ruxsat berilmagan"
    
    if exam.excluded_students:
        excluded_ids = [s.get("id") for s in exam.excluded_students if s.get("id")]
        if student.id in excluded_ids:
            return False, "Siz bu imtihondan chetlashtirilgansiz"
    
    return True, "OK"


def calculate_exam_score(exam: Exam, answers: dict) -> tuple:
    """Imtihon ballini hisoblash"""
    total_score = 0
    max_score = exam.total_points
    
    for question in exam.questions:
        q_id = question.get("id")
        if q_id not in answers:
            continue
        
        student_answer = answers[q_id]
        q_type = question.get("type")
        q_points = question.get("points", 1)
        
        is_correct = False
        
        if q_type == "multiple_choice":
            correct_option = next(
                (opt for opt in question.get("options", []) if opt.get("is_correct")),
                None
            )
            if correct_option and student_answer == correct_option.get("id"):
                is_correct = True
        elif q_type == "true_false":
            if student_answer == question.get("correct_answer"):
                is_correct = True
        elif q_type == "short_answer":
            # Short answer uchun to'liq mos kelishi kerak (keyinroq yaxshilash mumkin)
            if str(student_answer).strip().lower() == str(question.get("correct_answer", "")).strip().lower():
                is_correct = True
        
        if is_correct:
            total_score += q_points
    
    percentage = int((total_score / max_score) * 100) if max_score > 0 else 0
    return total_score, percentage


@router.get("/", response_model=List[ExamResponse])
async def get_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subject: Optional[str] = None,
    group: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha imtihonlar ro'yxati (O'qituvchi uchun)"""
    query = db.query(Exam).filter(
        Exam.institution_id == current_user.institution_id
    )
    
    if current_user.role == UserRole.TEACHER:
        query = query.filter(Exam.created_by == current_user.id)
    
    if subject:
        query = query.filter(Exam.subject == subject)
    if group:
        query = query.filter(Exam.group == group)
    if is_active is not None:
        query = query.filter(Exam.is_active == is_active)
    
    exams = query.order_by(Exam.created_at.desc()).offset(skip).limit(limit).all()
    return exams


@router.get("/available", response_model=List[ExamResponse])
async def get_available_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talaba uchun mavjud imtihonlar"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Faqat talabalar uchun")
    
    # Talaba ma'lumotlarini olish (keyinroq Student model bilan bog'lash kerak)
    # Hozircha user_id orqali qidirish
    student = db.query(Student).filter(
        Student.email == current_user.email,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        return []
    
    now = datetime.now()
    query = db.query(Exam).filter(
        Exam.institution_id == current_user.institution_id,
        Exam.is_active == True,
        Exam.start_time <= now,
        Exam.end_time >= now
    )
    
    available_exams = []
    for exam in query.all():
        access_result = check_exam_access(exam, student)
        if isinstance(access_result, tuple):
            has_access, _ = access_result
        else:
            has_access = access_result
        if has_access:
            available_exams.append(exam)
    
    return available_exams[skip:skip+limit]


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Imtihon ma'lumotlarini olish"""
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.institution_id == current_user.institution_id
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Imtihon topilmadi")
    
    # O'qituvchi faqat o'z imtihonlarini ko'ra oladi
    if current_user.role == UserRole.TEACHER and exam.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    return exam


@router.post("/", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yangi imtihon yaratish (Faqat o'qituvchi)"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Faqat o'qituvchilar imtihon yarata oladi")
    
    # Vaqt tekshiruvi
    if exam_data.end_time <= exam_data.start_time:
        raise HTTPException(status_code=400, detail="Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak")
    
    exam = Exam(
        **exam_data.model_dump(exclude={"questions"}),
        questions=exam_data.questions,
        institution_id=current_user.institution_id,
        created_by=current_user.id,
        created_by_name=f"{current_user.first_name} {current_user.last_name}"
    )
    
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    return exam


@router.put("/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: int,
    exam_data: ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Imtihonni yangilash"""
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.institution_id == current_user.institution_id
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Imtihon topilmadi")
    
    if current_user.role == UserRole.TEACHER and exam.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    update_data = exam_data.model_dump(exclude_unset=True)
    if "questions" in update_data:
        exam.questions = update_data["questions"]
        update_data.pop("questions")
    
    for field, value in update_data.items():
        setattr(exam, field, value)
    
    db.commit()
    db.refresh(exam)
    
    return exam


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Imtihonni o'chirish"""
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.institution_id == current_user.institution_id
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Imtihon topilmadi")
    
    if current_user.role == UserRole.TEACHER and exam.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    db.delete(exam)
    db.commit()
    
    return {"message": "Imtihon o'chirildi"}


# Exam Attempt endpoints
@router.post("/{exam_id}/start", response_model=ExamAttemptResponse)
async def start_exam_attempt(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Imtihonni boshlash"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Imtihon topilmadi")
    
    student = db.query(Student).filter(
        Student.email == current_user.email,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Talaba topilmadi")
    
    has_access, message = check_exam_access(exam, student)
    if not has_access:
        raise HTTPException(status_code=403, detail=message)
    
    # Urinishlar sonini hisoblash
    attempt_count = db.query(ExamAttempt).filter(
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.student_id == student.id,
        ExamAttempt.is_submitted == True
    ).count()
    
    if attempt_count >= exam.max_attempts:
        raise HTTPException(status_code=403, detail=f"Urinishlar soni tugagan (Maksimal: {exam.max_attempts})")
    
    # Faol urinishni tekshirish
    active_attempt = db.query(ExamAttempt).filter(
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.student_id == student.id,
        ExamAttempt.is_submitted == False
    ).first()
    
    if active_attempt:
        return active_attempt
    
    attempt = ExamAttempt(
        exam_id=exam_id,
        student_id=student.id,
        student_name=f"{student.first_name} {student.last_name}",
        student_student_id=student.student_id,
        attempt_number=attempt_count + 1,
        max_score=exam.total_points,
        started_at=datetime.now()
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    return attempt


@router.post("/{exam_id}/submit", response_model=ExamAttemptResponse)
async def submit_exam_attempt(
    exam_id: int,
    submit_data: ExamAttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Imtihonni topshirish"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Imtihon topilmadi")
    
    student = db.query(Student).filter(
        Student.email == current_user.email,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Talaba topilmadi")
    
    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.student_id == student.id,
        ExamAttempt.is_submitted == False
    ).order_by(ExamAttempt.started_at.desc()).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Aktiv urinish topilmadi")
    
    # Ballarni hisoblash
    score, percentage = calculate_exam_score(exam, submit_data.answers)
    
    attempt.answers = submit_data.answers
    attempt.score = score
    attempt.percentage = percentage
    attempt.time_spent_minutes = submit_data.time_spent_minutes
    attempt.submitted_at = datetime.now()
    attempt.is_submitted = True
    attempt.is_completed = True
    
    db.commit()
    db.refresh(attempt)
    
    return attempt


@router.get("/{exam_id}/attempts", response_model=List[ExamAttemptResponse])
async def get_exam_attempts(
    exam_id: int,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Imtihon urinishlarini olish"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Imtihon topilmadi")
    
    if current_user.role == UserRole.TEACHER and exam.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    query = db.query(ExamAttempt).filter(ExamAttempt.exam_id == exam_id)
    
    if current_user.role == UserRole.TEACHER:
        # Talaba faqat o'z urinishlarini ko'radi
        student = db.query(Student).filter(
            Student.email == current_user.email,
            Student.institution_id == current_user.institution_id
        ).first()
        if student:
            query = query.filter(ExamAttempt.student_id == student.id)
    
    if student_id:
        query = query.filter(ExamAttempt.student_id == student_id)
    
    attempts = query.order_by(ExamAttempt.started_at.desc()).all()
    return attempts

