"""
Database initializatsiya va admin user yaratish
"""
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.institution import Institution
from app.models.quiz import Quiz
from app.auth import get_password_hash

# Database jadvalarni yaratish
Base.metadata.create_all(bind=engine)

# Database session
db = SessionLocal()

try:
    # Default institution yaratish
    default_institution = db.query(Institution).filter(Institution.code == "DEFAULT-001").first()
    
    if not default_institution:
        # Default institution yaratish
        default_institution = Institution(
            name="Default Texnikum",
            code="DEFAULT-001",
            region="Toshkent",
            is_active=True,
        )
        db.add(default_institution)
        db.flush()  # ID olish uchun
        print("[OK] Default institution yaratildi:")
        print(f"   ID: {default_institution.id}")
        print(f"   Nomi: {default_institution.name}")
        print(f"   Kodi: {default_institution.code}")
    else:
        print("[INFO] Default institution allaqachon mavjud")
        db.refresh(default_institution)
    
    institution_id = default_institution.id
    
    # Admin user mavjudligini tekshirish
    admin = db.query(User).filter(
        User.email == "admin@example.com",
        User.institution_id == institution_id
    ).first()
    
    if not admin:
        # Admin user yaratish
        admin = User(
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
            institution_id=institution_id,
        )
        db.add(admin)
        print("[OK] Admin user yaratildi:")
        print("   Email: admin@example.com")
        print("   Parol: admin123")
        print(f"   Institution ID: {institution_id}")
    else:
        print("[INFO] Admin user allaqachon mavjud")
    
    # Teacher user mavjudligini tekshirish
    teacher = db.query(User).filter(
        User.email == "teacher@example.com",
        User.institution_id == institution_id
    ).first()
    
    if not teacher:
        # Teacher user yaratish
        teacher = User(
            email="teacher@example.com",
            first_name="Teacher",
            last_name="User",
            hashed_password=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            is_active=True,
            institution_id=institution_id,
        )
        db.add(teacher)
        print("[OK] Teacher user yaratildi:")
        print("   Email: teacher@example.com")
        print("   Parol: teacher123")
        print(f"   Institution ID: {institution_id}")
    else:
        print("[INFO] Teacher user allaqachon mavjud")

    # Demo student user mavjudligini tekshirish
    demo_student = db.query(User).filter(
        User.email == "student@example.com",
        User.institution_id == institution_id
    ).first()

    if not demo_student:
        demo_student = User(
            email="student@example.com",
            first_name="Student",
            last_name="Demo",
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT,
            is_active=True,
            institution_id=institution_id,
        )
        db.add(demo_student)
        print("[OK] Demo student user yaratildi:")
        print("   Email: student@example.com")
        print("   Parol: student123")
        print(f"   Institution ID: {institution_id}")
    else:
        print("[INFO] Demo student user allaqachon mavjud")

    db.commit()
    print("\n[OK] Database muvaffaqiyatli initializatsiya qilindi!")
    
except Exception as e:
    print(f"[ERROR] Xatolik: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

