from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    year = Column(Integer, nullable=True)
    pages = Column(Integer, nullable=True)
    language = Column(String, nullable=True)
    description = Column(String, nullable=True)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    borrowed_copies = Column(Integer, default=0)
    status = Column(String, default="available")
    has_digital = Column(Boolean, default=False)
    rating = Column(String, default="0.0")
    cover_color = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Book {self.title}>"


class BookBorrow(Base):
    __tablename__ = "book_borrows"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    borrowed_date = Column(DateTime(timezone=True), server_default=func.now())
    return_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="borrowed")  # borrowed, returned

    book = relationship("Book", backref="borrows")
    student = relationship("Student", backref="book_borrows")
    teacher = relationship("Teacher", backref="book_borrows")

    def __repr__(self):
        return f"<BookBorrow {self.book_id}>"

