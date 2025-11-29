from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, index=True, nullable=False)  # unique constraint institution_id bilan birga
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

    # Relationship
    institution = relationship("Institution", backref="books")

    # Composite indexlar
    __table_args__ = (
        Index('idx_book_institution', 'institution_id'),
        Index('idx_book_isbn_institution', 'isbn', 'institution_id', unique=True),
    )

    def __repr__(self):
        return f"<Book {self.title} - Institution {self.institution_id}>"


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

