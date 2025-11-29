from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Question structure
class QuestionOption(BaseModel):
    id: str
    text: str
    is_correct: bool = False


class Question(BaseModel):
    id: str
    type: str = Field(..., description="Savol turi: multiple_choice, true_false, short_answer")
    question: str
    options: Optional[List[QuestionOption]] = None  # multiple_choice uchun
    correct_answer: Optional[str] = None  # true_false yoki short_answer uchun
    points: int = Field(default=1, ge=1)
    explanation: Optional[str] = None


# Exam schemas
class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    group: str
    department: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(default=60, ge=1, description="Davomiyligi daqiqalarda")
    max_attempts: int = Field(default=1, ge=1, description="Urinishlar soni")
    questions: List[Question]
    total_points: int = Field(default=100, ge=1)
    allowed_students: Optional[List[Dict[str, Any]]] = None  # [{"id": 1, "name": "..."}, ...]
    excluded_students: Optional[List[Dict[str, Any]]] = None  # [{"id": 2, "name": "..."}, ...]
    auto_close: bool = Field(default=True, description="Avtomatik yopish")


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    group: Optional[str] = None
    department: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    max_attempts: Optional[int] = Field(None, ge=1)
    questions: Optional[List[Question]] = None
    total_points: Optional[int] = Field(None, ge=1)
    allowed_students: Optional[List[Dict[str, Any]]] = None
    excluded_students: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None
    auto_close: Optional[bool] = None


class ExamResponse(ExamBase):
    id: int
    institution_id: int
    is_active: bool
    created_by: int
    created_by_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Exam Attempt schemas
class ExamAttemptBase(BaseModel):
    exam_id: int
    answers: Optional[Dict[str, Any]] = None  # {"question_id": "answer_id", ...}


class ExamAttemptCreate(ExamAttemptBase):
    pass


class ExamAttemptResponse(BaseModel):
    id: int
    exam_id: int
    student_id: int
    student_name: str
    student_student_id: str
    attempt_number: int
    started_at: datetime
    submitted_at: Optional[datetime] = None
    time_spent_minutes: Optional[int] = None
    score: Optional[int] = None
    max_score: int
    percentage: Optional[int] = None
    is_completed: bool
    is_submitted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ExamAttemptSubmit(BaseModel):
    answers: Dict[str, Any]  # {"question_id": "answer_id", ...}
    time_spent_minutes: int

