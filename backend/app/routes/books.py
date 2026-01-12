from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.book import Book, BookBorrow
from app.models.audit_log import ActionType
from app.schemas.book import BookCreate, BookUpdate, BookResponse, BookBorrowCreate
from app.auth import get_current_user, get_current_active_admin
from app.utils.audit_log import create_audit_log

# Request type hint uchun
from fastapi import Request

router = APIRouter()


@router.get("/", response_model=List[BookResponse])
async def get_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha kitoblar ro'yxati"""
    query = db.query(Book)
    
    if category:
        query = query.filter(Book.category == category)
    if search:
        query = query.filter(
            (Book.title.contains(search)) |
            (Book.author.contains(search)) |
            (Book.isbn.contains(search))
        )
    
    books = query.offset(skip).limit(limit).all()
    return books


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kitob ma'lumotlari"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.get("/borrowed/list", response_model=List[dict])
async def get_borrowed_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Olingan kitoblar ro'yxati"""
    borrows = db.query(BookBorrow).filter(BookBorrow.status == "borrowed").all()
    return [
        {
            "id": borrow.id,
            "book_id": borrow.book_id,
            "book_title": borrow.book.title,
            "student_id": borrow.student_id,
            "teacher_id": borrow.teacher_id,
            "borrowed_date": borrow.borrowed_date,
        }
        for borrow in borrows
    ]


@router.post("/", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Yangi kitob qo'shish"""
    # ISBN tekshirish
    existing = db.query(Book).filter(Book.isbn == book_data.isbn).first()
    if existing:
        raise HTTPException(status_code=400, detail="ISBN already exists")
    
    book = Book(**book_data.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.CREATE,
        resource_type="book",
        resource_id=book.id,
        description=f"Yangi kitob qo'shildi: {book.title} ({book.author}, ISBN: {book.isbn})",
        request=request,
    )
    
    return book


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Kitob ma'lumotlarini yangilash"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = book_data.model_dump(exclude_unset=True)
    update_fields = list(update_data.keys())
    
    for field, value in update_data.items():
        setattr(book, field, value)
    
    db.commit()
    db.refresh(book)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.UPDATE,
        resource_type="book",
        resource_id=book_id,
        description=f"Kitob ma'lumotlari yangilandi: {book.title} (o'zgartirilgan maydonlar: {', '.join(update_fields)})",
        request=request,
    )
    
    return book


@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Kitobni o'chirish"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book_title = book.title
    
    db.delete(book)
    db.commit()
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.DELETE,
        resource_type="book",
        resource_id=book_id,
        description=f"Kitob o'chirildi: {book_title}",
        request=request,
    )
    
    return {"message": "Book deleted successfully"}


@router.post("/borrow")
async def borrow_book(
    borrow_data: BookBorrowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None,
):
    """Kitob olish"""
    book = db.query(Book).filter(Book.id == borrow_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="No available copies")
    
    # BookBorrow yaratish
    borrow = BookBorrow(**borrow_data.model_dump())
    db.add(borrow)
    
    # Kitob nusxalarini yangilash
    book.available_copies -= 1
    book.borrowed_copies += 1
    
    db.commit()
    db.refresh(borrow)
    
    # Audit log
    borrower_info = f"Talaba ID: {borrow_data.student_id}" if borrow_data.student_id else f"O'qituvchi ID: {borrow_data.teacher_id}"
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.CREATE,
        resource_type="book_borrow",
        resource_id=borrow.id,
        description=f"Kitob olindi: {book.title} ({borrower_info})",
        request=request,
    )
    
    return {"message": "Book borrowed successfully", "borrow_id": borrow.id}


@router.post("/return/{borrow_id}")
async def return_book(
    borrow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None,
):
    """Kitobni qaytarish"""
    borrow = db.query(BookBorrow).filter(BookBorrow.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    
    if borrow.status == "returned":
        raise HTTPException(status_code=400, detail="Book already returned")
    
    book = db.query(Book).filter(Book.id == borrow.book_id).first()
    
    # Status yangilash
    borrow.status = "returned"
    borrow.return_date = datetime.utcnow()
    
    # Kitob nusxalarini yangilash
    book.available_copies += 1
    book.borrowed_copies -= 1
    
    db.commit()
    
    # Audit log
    borrower_info = f"Talaba ID: {borrow.student_id}" if borrow.student_id else f"O'qituvchi ID: {borrow.teacher_id}"
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.UPDATE,
        resource_type="book_borrow",
        resource_id=borrow_id,
        description=f"Kitob qaytarildi: {book.title} ({borrower_info})",
        request=request,
    )
    
    return {"message": "Book returned successfully"}

