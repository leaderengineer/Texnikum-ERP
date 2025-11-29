"""
Mavjud user'larga telefon raqamini qo'shish
"""
from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

try:
    # Admin user'ga telefon raqam qo'shish
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if admin and not admin.phone:
        admin.phone = "+998901234567"  # Test uchun telefon raqami
        print(f"✅ Admin user'ga telefon raqam qo'shildi: {admin.phone}")
    
    # Teacher user'ga telefon raqam qo'shish
    teacher = db.query(User).filter(User.email == "teacher@example.com").first()
    if teacher and not teacher.phone:
        teacher.phone = "+998901234568"  # Test uchun telefon raqami
        print(f"✅ Teacher user'ga telefon raqam qo'shildi: {teacher.phone}")
    
    db.commit()
    print("\n✅ Barcha user'larga telefon raqam qo'shildi!")
    print("\n" + "=" * 60)
    print("TELEFON RAQAMLARI:")
    print("=" * 60)
    if admin:
        print(f"\n🔑 ADMIN:")
        print(f"   Email: {admin.email}")
        print(f"   Telefon: {admin.phone}")
    if teacher:
        print(f"\n👨‍🏫 TEACHER:")
        print(f"   Email: {teacher.email}")
        print(f"   Telefon: {teacher.phone}")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Xatolik: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

