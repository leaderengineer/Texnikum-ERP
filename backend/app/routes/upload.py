from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import os
import uuid
from pathlib import Path
from app.database import get_db
from app.models.user import User
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

# Rasm yuklash uchun papka
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Ruxsat etilgan rasm turlari
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB in bytes


def get_file_extension(filename: str) -> str:
    """Fayl kengaytmasini olish"""
    return Path(filename).suffix.lower()


def is_allowed_image(filename: str) -> bool:
    """Rasm turi ruxsat etilganligini tekshirish"""
    return get_file_extension(filename) in ALLOWED_IMAGE_EXTENSIONS


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Profil rasmini yuklash"""
    
    # Rasm turini tekshirish
    if not is_allowed_image(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Ruxsat etilmagan rasm turi. Faqat quyidagilar ruxsat etiladi: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Rasm hajmini tekshirish
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Rasm hajmi juda katta. Maksimal hajm: 5 MB. Sizning rasmingiz: {file_size / 1024 / 1024:.2f} MB"
        )
    
    # Rasm nomini yaratish (unique bo'lishi uchun)
    file_extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Rasmini saqlash
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rasmini saqlashda xatolik: {str(e)}")
    
    # URL yaratish (relative path)
    # Frontend'da to'liq URL yaratish uchun
    image_url = f"/api/upload/avatar/{unique_filename}"
    
    # User'ning avatar_url'ini yangilash
    current_user.avatar_url = image_url
    db.commit()
    db.refresh(current_user)
    
    return JSONResponse(content={
        "message": "Rasm muvaffaqiyatli yuklandi",
        "url": image_url,
        "filename": unique_filename
    })


@router.get("/avatar/{filename}")
async def get_avatar(filename: str):
    """Yuklangan profil rasmini olish"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Rasm topilmadi")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=file_path,
        media_type="image/jpeg"  # yoki rasm turiga qarab
    )

