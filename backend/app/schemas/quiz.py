from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.exam import Question, QuestionOption


# Quiz schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    department: str
    questions: List[Question]
    total_points: int = Field(default=100, ge=1)
    estimated_time_minutes: Optional[int] = Field(None, ge=1)
    is_premium: bool = Field(default=False, description="Premium test")


class QuizCreate(QuizBase):
    pass


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    department: Optional[str] = None
    questions: Optional[List[Question]] = None
    total_points: Optional[int] = Field(None, ge=1)
    estimated_time_minutes: Optional[int] = Field(None, ge=1)
    is_premium: Optional[bool] = None
    is_active: Optional[bool] = None


class QuizResponse(QuizBase):
    id: int
    institution_id: int
    is_active: bool
    created_by: int
    created_by_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Quiz Result schemas
class QuizResultBase(BaseModel):
    quiz_id: int
    answers: Dict[str, Any]  # {"question_id": "answer_id", ...}
    time_spent_minutes: int


class QuizResultCreate(QuizResultBase):
    pass


class QuizResultResponse(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    student_name: str
    student_student_id: str
    completed_at: datetime
    time_spent_minutes: Optional[int] = None
    score: int
    max_score: int
    percentage: int
    created_at: datetime

    class Config:
        from_attributes = True

