"""
Database'ni to'liq qayta yaratish
"""
import os
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.institution import Institution
from app.auth import get_password_hash

# Database faylini o'chirish
db_file = "texnikum_erp.db"
if os.path.exists(db_file):
    os.remove(db_file)
    print(f"✅ Eski database fayli o'chirildi: {db_file}")

# Yangi database yaratish
print("\n🔄 Yangi database yaratilmoqda...")
Base.metadata.create_all(bind=engine)
print("✅ Database struktura yaratildi")

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
        print("✅ Default institution yaratildi:")
        print(f"   ID: {default_institution.id}")
        print(f"   Nomi: {default_institution.name}")
        print(f"   Kodi: {default_institution.code}")
    else:
        print("ℹ️  Default institution allaqachon mavjud")
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
        print("✅ Admin user yaratildi:")
        print("   Email: admin@example.com")
        print("   Parol: admin123")
        print(f"   Institution ID: {institution_id}")
    else:
        print("ℹ️  Admin user allaqachon mavjud")
    
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
        print("✅ Teacher user yaratildi:")
        print("   Email: teacher@example.com")
        print("   Parol: teacher123")
        print(f"   Institution ID: {institution_id}")
    else:
        print("ℹ️  Teacher user allaqachon mavjud")
    
    db.commit()
    print("\n✅ Database muvaffaqiyatli initializatsiya qilindi!")
    print("\n" + "=" * 60)
    print("LOGIN MA'LUMOTLARI:")
    print("=" * 60)
    print("\n🔑 ADMIN:")
    print("   Email: admin@example.com")
    print("   Parol: admin123")
    print("\n👨‍🏫 TEACHER:")
    print("   Email: teacher@example.com")
    print("   Parol: teacher123")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Xatolik: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
