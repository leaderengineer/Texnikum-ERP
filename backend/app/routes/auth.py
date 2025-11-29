from datetime import timedelta, datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.password_reset import PasswordResetToken
from app.models.teacher import Teacher
from app.models.student import Student
from app.schemas.user import LoginRequest, Token, UserCreate, UserResponse, UserUpdate
from app.schemas.password_reset import (
    PasswordResetRequest,
    PasswordResetVerify,
    PasswordResetConfirm,
    PasswordResetResponse,
)
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user,
    verify_token,
)
from app.config import settings
from app.utils.sms import (
    generate_verification_code,
)
from app.utils.email import (
    send_password_reset_email,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login endpoint - email va institution_id bo'yicha qidirish"""
    try:
        # Email bo'yicha qidirish (bir nechta institution'da bir xil email bo'lishi mumkin)
        user = db.query(User).filter(User.email == credentials.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Parolni tekshirish
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
    except HTTPException:
        raise
    except Exception as e:
        # Boshqa xatoliklar
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login xatolik: {str(e)}"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email, 
            "role": user.role.value,
            "institution_id": user.institution_id
        },
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email, "institution_id": user.institution_id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint"""
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh token endpoint"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(refresh_token, credentials_exception)
    user = db.query(User).filter(User.email == token_data.email).first()
    
    if not user or not user.is_active:
        raise credentials_exception
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email, 
            "role": user.role.value,
            "institution_id": user.institution_id
        },
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(data={"sub": user.email, "institution_id": user.institution_id})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Joriy foydalanuvchi ma'lumotlari"""
    try:
        # avatar_url maydoni mavjudligini tekshirish va default qilish
        if not hasattr(current_user, 'avatar_url'):
            current_user.avatar_url = None
        return current_user
    except Exception as e:
        logger.error(f"Error getting current user info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting user info: {str(e)}")


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Joriy foydalanuvchi ma'lumotlarini yangilash"""
    try:
        update_data = user_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            # avatar_url maydoni mavjudligini tekshirish
            if field == 'avatar_url' and not hasattr(current_user, 'avatar_url'):
                # Database'da maydon yo'q bo'lsa, qo'shishga harakat qilish
                try:
                    db.execute(f"ALTER TABLE users ADD COLUMN avatar_url TEXT")
                    db.commit()
                except Exception:
                    # Maydon allaqachon mavjud yoki boshqa xatolik
                    db.rollback()
            setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        # avatar_url maydoni mavjudligini tekshirish
        if not hasattr(current_user, 'avatar_url'):
            current_user.avatar_url = None
            
        return current_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating current user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Yangi foydalanuvchi ro'yxatdan o'tkazish (admin uchun)"""
    # Email va institution_id tekshirish
    existing_user = db.query(User).filter(
        User.email == user_data.email,
        User.institution_id == user_data.institution_id
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered for this institution"
        )
    
    # Yangi foydalanuvchi yaratish
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        hashed_password=hashed_password,
        institution_id=user_data.institution_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/password-reset/request", response_model=PasswordResetResponse)
async def request_password_reset(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Parolni tiklash so'rovi - email'ga kod yuborish
    Faqat tizimga qo'shilgan foydalanuvchilar parolni tiklashlari mumkin
    """
    # Email formatini tekshirish
    email = request_data.email.strip().lower()
    
    # Foydalanuvchini email bo'yicha qidirish
    # Faqat User jadvalida mavjud bo'lgan foydalanuvchilar parolni tiklashlari mumkin
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Tizimga qo'shilmagan foydalanuvchi
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bunday elektron pochta egasi hali tizimga kiritilmagan. Iltimos, administrator bilan bog'laning."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Foydalanuvchi faol emas"
        )
    
    # Kod yaratish
    code = generate_verification_code(6)
    
    # Eski tokenlarni o'chirish (xavfsizlik uchun)
    try:
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.email == email,
            PasswordResetToken.is_used == 0
        ).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        pass
    
    # Yangi token yaratish
    try:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # 10 daqiqa
        reset_token = PasswordResetToken(
            user_id=user.id,
            email=email,
            code=code,
            expires_at=expires_at,
            is_used=0
        )
        db.add(reset_token)
        db.commit()
        db.refresh(reset_token)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database xatolik: password_reset_tokens jadvali mavjud emas. Migration qiling: {str(e)}"
        )
    
    # Email yuborish
    try:
        email_sent = await send_password_reset_email(email, code)
        if not email_sent:
            logger.warning(f"Email yuborilmadi: {email}")
            # Email yuborilmagan bo'lsa ham, kod yaratilgan, shuning uchun davom etamiz
            # Development rejimida email console'ga chiqadi
    except Exception as e:
        logger.error(f"Email yuborishda xatolik: {str(e)}")
        # Email yuborishda xatolik bo'lsa ham, kod yaratilgan
        # Development rejimida email console'ga chiqadi
        pass
    
    # Email yuborilganini xabar berish
    # Development rejimida ham email console'ga chiqadi, lekin kod email'ga yuboriladi
    message_text = "Parolni tiklash kodi elektron pochtangizga yuborildi. Kod 10 daqiqa davomida amal qiladi."
    
    return PasswordResetResponse(
        message=message_text,
        success=True
    )


@router.post("/password-reset/verify", response_model=PasswordResetResponse)
async def verify_password_reset_code(
    verify_data: PasswordResetVerify,
    db: Session = Depends(get_db)
):
    """
    Email kodini tekshirish
    """
    email = verify_data.email.strip().lower()
    
    # Token topish
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.email == email,
        PasswordResetToken.code == verify_data.code,
        PasswordResetToken.is_used == 0,
        PasswordResetToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Noto'g'ri kod yoki kod muddati tugagan"
        )
    
    return PasswordResetResponse(
        message="Kod to'g'ri. Endi yangi parol o'rnatishingiz mumkin.",
        success=True
    )


@router.post("/password-reset/confirm", response_model=PasswordResetResponse)
async def confirm_password_reset(
    confirm_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Yangi parol o'rnatish
    """
    email = confirm_data.email.strip().lower()
    
    # Token topish va tekshirish
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.email == email,
        PasswordResetToken.code == confirm_data.code,
        PasswordResetToken.is_used == 0,
        PasswordResetToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Noto'g'ri kod yoki kod muddati tugagan"
        )
    
    # Foydalanuvchini topish
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foydalanuvchi topilmadi"
        )
    
    # Yangi parol o'rnatish
    user.hashed_password = get_password_hash(confirm_data.new_password)
    
    # Token'ni ishlatilgan deb belgilash
    reset_token.is_used = 1
    reset_token.used_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return PasswordResetResponse(
        message="Parol muvaffaqiyatli o'zgartirildi. Endi yangi parol bilan kirishingiz mumkin.",
        success=True
    )

