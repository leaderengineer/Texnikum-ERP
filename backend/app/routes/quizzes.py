from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, QuizResult
from app.models.student import Student
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizResponse, QuizResultCreate, QuizResultResponse
from app.auth import get_current_user
from app.models.user import UserRole
from app.routes.exams import calculate_exam_score

router = APIRouter()


def calculate_quiz_score(quiz: Quiz, answers: dict) -> tuple:
    """Test ballini hisoblash (exam bilan bir xil)"""
    total_score = 0
    max_score = quiz.total_points
    
    for question in quiz.questions:
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
            if str(student_answer).strip().lower() == str(question.get("correct_answer", "")).strip().lower():
                is_correct = True
        
        if is_correct:
            total_score += q_points
    
    percentage = int((total_score / max_score) * 100) if max_score > 0 else 0
    return total_score, percentage


@router.get("/", response_model=List[QuizResponse])
async def get_quizzes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subject: Optional[str] = None,
    department: Optional[str] = None,
    is_premium: Optional[bool] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha testlar ro'yxati"""
    query = db.query(Quiz).filter(
        Quiz.institution_id == current_user.institution_id,
        Quiz.is_active == True
    )
    
    if subject:
        query = query.filter(Quiz.subject == subject)
    if department:
        query = query.filter(Quiz.department == department)
    if is_premium is not None:
        query = query.filter(Quiz.is_premium == is_premium)
    
    quizzes = query.order_by(Quiz.created_at.desc()).offset(skip).limit(limit).all()
    return quizzes


@router.get("/my-results", response_model=List[QuizResultResponse])
async def get_my_quiz_results(
    quiz_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talaba uchun o'z test natijalari"""
    student = db.query(Student).filter(
        Student.email == current_user.email,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        return []
    
    query = db.query(QuizResult).filter(
        QuizResult.student_id == student.id
    )
    
    if quiz_id:
        query = query.filter(QuizResult.quiz_id == quiz_id)
    
    results = query.order_by(QuizResult.completed_at.desc()).offset(skip).limit(limit).all()
    return results


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Test ma'lumotlarini olish"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.institution_id == current_user.institution_id,
        Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    return quiz


@router.post("/", response_model=QuizResponse)
async def create_quiz(
    quiz_data: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yangi test yaratish (O'qituvchi yoki Admin)"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    quiz = Quiz(
        **quiz_data.model_dump(exclude={"questions"}),
        questions=quiz_data.questions,
        institution_id=current_user.institution_id,
        created_by=current_user.id,
        created_by_name=f"{current_user.first_name} {current_user.last_name}"
    )
    
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    
    return quiz


@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Testni yangilash"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.institution_id == current_user.institution_id
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    if current_user.role == UserRole.TEACHER and quiz.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    update_data = quiz_data.model_dump(exclude_unset=True)
    if "questions" in update_data:
        quiz.questions = update_data["questions"]
        update_data.pop("questions")
    
    for field, value in update_data.items():
        setattr(quiz, field, value)
    
    db.commit()
    db.refresh(quiz)
    
    return quiz


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Testni o'chirish"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.institution_id == current_user.institution_id
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    if current_user.role == UserRole.TEACHER and quiz.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    db.delete(quiz)
    db.commit()
    
    return {"message": "Test o'chirildi"}


@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: int,
    result_data: QuizResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Testni topshirish va natijani saqlash"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.institution_id == current_user.institution_id,
        Quiz.is_active == True
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    student = db.query(Student).filter(
        Student.email == current_user.email,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Talaba topilmadi")
    
    # Ballarni hisoblash
    score, percentage = calculate_quiz_score(quiz, result_data.answers)
    
    result = QuizResult(
        quiz_id=quiz_id,
        student_id=student.id,
        student_name=f"{student.first_name} {student.last_name}",
        student_student_id=student.student_id,
        answers=result_data.answers,
        score=score,
        max_score=quiz.total_points,
        percentage=percentage,
        time_spent_minutes=result_data.time_spent_minutes,
        completed_at=datetime.now()
    )
    
    db.add(result)
    db.commit()
    db.refresh(result)
    
    return result


@router.get("/{quiz_id}/results", response_model=List[QuizResultResponse])
async def get_quiz_results(
    quiz_id: int,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Test natijalarini olish (O'qituvchi uchun)"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    
    if current_user.role == UserRole.TEACHER and quiz.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    query = db.query(QuizResult).filter(QuizResult.quiz_id == quiz_id)
    
    if student_id:
        query = query.filter(QuizResult.student_id == student_id)
    
    results = query.order_by(QuizResult.completed_at.desc()).all()
    return results

