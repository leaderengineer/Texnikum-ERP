"""
Database initializatsiya va admin user yaratish
"""
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.auth import get_password_hash

# Database jadvalarni yaratish
Base.metadata.create_all(bind=engine)

# Database session
db = SessionLocal()

try:
    # Admin user mavjudligini tekshirish
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    
    if not admin:
        # Admin user yaratish
        admin = User(
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        print("✅ Admin user yaratildi:")
        print("   Email: admin@example.com")
        print("   Parol: admin123")
    else:
        print("ℹ️  Admin user allaqachon mavjud")
    
    # Teacher user mavjudligini tekshirish
    teacher = db.query(User).filter(User.email == "teacher@example.com").first()
    
    if not teacher:
        # Teacher user yaratish
        teacher = User(
            email="teacher@example.com",
            first_name="Teacher",
            last_name="User",
            hashed_password=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            is_active=True,
        )
        db.add(teacher)
        print("✅ Teacher user yaratildi:")
        print("   Email: teacher@example.com")
        print("   Parol: teacher123")
    else:
        print("ℹ️  Teacher user allaqachon mavjud")
    
    db.commit()
    print("\n✅ Database muvaffaqiyatli initializatsiya qilindi!")
    
except Exception as e:
    print(f"❌ Xatolik: {e}")
    db.rollback()
finally:
    db.close()

