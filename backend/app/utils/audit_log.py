from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog, ActionType
from app.models.user import User
from fastapi import Request
from typing import Optional


def create_audit_log(
    db: Session,
    user: Optional[User],
    action: ActionType,
    resource_type: str,
    resource_id: Optional[int] = None,
    description: Optional[str] = None,
    request: Optional[Request] = None,
):
    """
    Audit log yaratish helper funksiyasi
    
    Args:
        db: Database session
        user: Foydalanuvchi (User model)
        action: Amal turi (ActionType enum)
        resource_type: Resurs turi (masalan: "teacher", "student", "institution")
        resource_id: Resurs ID (ixtiyoriy)
        description: Qo'shimcha tavsif (ixtiyoriy)
        request: FastAPI Request obyekti (IP va User-Agent olish uchun)
    """
    try:
        # IP manzil va User-Agent olish
        ip_address = None
        user_agent = None
        if request:
            # IP manzil olish
            if request.client:
                ip_address = request.client.host
            # X-Forwarded-For header'dan IP olish (proxy orqali)
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                ip_address = forwarded_for.split(",")[0].strip()
            
            # User-Agent olish
            user_agent = request.headers.get("User-Agent")
        
        # Audit log yaratish
        audit_log = AuditLog(
            user_id=user.id if user else None,
            user_email=user.email if user else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        db.add(audit_log)
        db.commit()
        return audit_log
    except Exception as e:
        # Xatolik bo'lsa ham, asosiy funksiya ishlashini to'xtatmaslik
        db.rollback()
        print(f"Audit log yaratishda xatolik: {e}")
        return None

