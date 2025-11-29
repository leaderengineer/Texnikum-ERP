from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
from pathlib import Path
from jose import jwt, JWTError
from app.database import get_db
from app.models.user import User
from app.models.lesson_material import LessonMaterial
from app.schemas.lesson_material import LessonMaterialCreate, LessonMaterialUpdate, LessonMaterialResponse
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

# Fayllarni saqlash uchun papka
UPLOAD_DIR = Path("uploads/lesson_materials")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Ruxsat etilgan fayl turlari
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB in bytes


def get_file_extension(filename: str) -> str:
    """Fayl kengaytmasini olish"""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    """Fayl turi ruxsat etilganligini tekshirish"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


@router.get("/", response_model=List[LessonMaterialResponse])
async def get_lesson_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subject: Optional[str] = None,
    group: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha dars materiallari ro'yxati"""
    query = db.query(LessonMaterial).filter(
        LessonMaterial.institution_id == current_user.institution_id
    )
    
    if subject:
        query = query.filter(LessonMaterial.subject == subject)
    if group:
        query = query.filter(LessonMaterial.group == group)
    if department:
        query = query.filter(LessonMaterial.department == department)
    
    materials = query.order_by(LessonMaterial.created_at.desc()).offset(skip).limit(limit).all()
    return materials


@router.get("/{material_id}", response_model=LessonMaterialResponse)
async def get_lesson_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dars materiali ma'lumotlari"""
    material = db.query(LessonMaterial).filter(
        LessonMaterial.id == material_id,
        LessonMaterial.institution_id == current_user.institution_id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Lesson material not found")
    return material


@router.post("/", response_model=LessonMaterialResponse)
async def create_lesson_material(
    file: UploadFile = File(...),
    subject: str = Form(...),
    group: str = Form(...),
    department: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yangi dars materiali yuklash"""
    
    # Fayl turini tekshirish
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Ruxsat etilmagan fayl turi. Faqat quyidagilar ruxsat etiladi: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Fayl hajmini tekshirish
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Fayl hajmi juda katta. Maksimal hajm: 5 MB. Sizning faylingiz: {file_size / 1024 / 1024:.2f} MB"
        )
    
    # Fayl nomini yaratish (unique bo'lishi uchun)
    file_extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Faylni saqlash
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Faylni saqlashda xatolik: {str(e)}")
    
    # Database'ga yozish
    material = LessonMaterial(
        institution_id=current_user.institution_id,
        subject=subject,
        group=group,
        department=department,
        title=title,
        description=description,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=file_size / 1024 / 1024,  # MB da
        file_type=file_extension[1:],  # .pdf -> pdf
        uploaded_by=current_user.id,
        uploaded_by_name=f"{current_user.first_name} {current_user.last_name}",
    )
    
    db.add(material)
    db.commit()
    db.refresh(material)
    
    return material


@router.get("/{material_id}/download")
async def download_lesson_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dars materialini yuklab olish"""
    material = db.query(LessonMaterial).filter(
        LessonMaterial.id == material_id,
        LessonMaterial.institution_id == current_user.institution_id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Lesson material not found")
    
    file_path = Path(material.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        path=str(file_path),
        filename=material.file_name,
        media_type='application/octet-stream'
    )


@router.get("/{material_id}/view")
async def view_lesson_material(
    material_id: int,
    request: Request,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Dars materialini ko'rsatish (inline viewing)"""
    # Token'ni query parameter yoki header'dan olish (iframe uchun)
    auth_token = token
    if not auth_token:
        # Header'dan olish
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            auth_token = authorization.split(" ")[1]
    
    # Token'ni tekshirish
    user = None
    if auth_token:
        try:
            payload = jwt.decode(auth_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email = payload.get("sub")
            institution_id = payload.get("institution_id")
            
            if email and institution_id:
                user = db.query(User).filter(
                    User.email == email,
                    User.institution_id == institution_id
                ).first()
        except JWTError:
            pass
    
    if not user:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    material = db.query(LessonMaterial).filter(
        LessonMaterial.id == material_id,
        LessonMaterial.institution_id == user.institution_id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Lesson material not found")
    
    file_path = Path(material.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")
    
    # Media type'ni fayl turiga qarab belgilash
    media_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    }
    
    media_type = media_types.get(material.file_type.lower(), 'application/octet-stream')
    
    # CORS headers qo'shish (iframe uchun kerak)
    headers = {
        'Content-Disposition': f'inline; filename="{material.file_name}"',
        'X-Content-Type-Options': 'nosniff',
    }
    
    return FileResponse(
        path=str(file_path),
        filename=material.file_name,
        media_type=media_type,
        headers=headers
    )


@router.put("/{material_id}", response_model=LessonMaterialResponse)
async def update_lesson_material(
    material_id: int,
    material_data: LessonMaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dars materiali ma'lumotlarini yangilash"""
    material = db.query(LessonMaterial).filter(
        LessonMaterial.id == material_id,
        LessonMaterial.institution_id == current_user.institution_id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Lesson material not found")
    
    # Faqat yuklagan foydalanuvchi yoki admin tahrirlashi mumkin
    if material.uploaded_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission to edit this material")
    
    update_data = material_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
    
    db.commit()
    db.refresh(material)
    return material


@router.delete("/{material_id}")
async def delete_lesson_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dars materialini o'chirish"""
    material = db.query(LessonMaterial).filter(
        LessonMaterial.id == material_id,
        LessonMaterial.institution_id == current_user.institution_id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Lesson material not found")
    
    # Faqat yuklagan foydalanuvchi yoki admin o'chirishi mumkin
    if material.uploaded_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission to delete this material")
    
    # Faylni o'chirish
    file_path = Path(material.file_path)
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception as e:
            print(f"Faylni o'chirishda xatolik: {str(e)}")
    
    db.delete(material)
    db.commit()
    return {"message": "Lesson material deleted successfully"}

