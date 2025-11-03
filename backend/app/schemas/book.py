from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    year: Optional[int] = None
    pages: Optional[int] = None
    language: Optional[str] = None
    description: Optional[str] = None
    total_copies: int = 1
    available_copies: int = 1
    borrowed_copies: int = 0
    status: str = "available"
    has_digital: bool = False
    rating: str = "0.0"
    cover_color: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category: Optional[str] = None
    year: Optional[int] = None
    pages: Optional[int] = None
    language: Optional[str] = None
    description: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    borrowed_copies: Optional[int] = None
    status: Optional[str] = None
    has_digital: Optional[bool] = None
    rating: Optional[str] = None
    cover_color: Optional[str] = None


class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BookBorrowCreate(BaseModel):
    book_id: int
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None

