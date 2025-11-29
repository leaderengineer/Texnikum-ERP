"""
Database'dagi foydalanuvchilarni ko'rish
"""
from app.database import SessionLocal
from app.models.user import User
from app.models.institution import Institution

db = SessionLocal()

try:
    print("=" * 60)
    print("DATABASE'DAGI FOYDALANUVCHILAR")
    print("=" * 60)
    
    # Barcha institution'larni ko'rsatish
    institutions = db.query(Institution).all()
    print(f"\n📚 Jami {len(institutions)} ta institution mavjud:\n")
    
    for inst in institutions:
        print(f"  Institution ID: {inst.id}")
        print(f"  Nomi: {inst.name}")
        print(f"  Kodi: {inst.code}")
        print(f"  Region: {inst.region}")
        print(f"  Faol: {inst.is_active}")
        print("-" * 60)
    
    # Barcha foydalanuvchilarni ko'rsatish
    users = db.query(User).all()
    print(f"\n👥 Jami {len(users)} ta foydalanuvchi mavjud:\n")
    
    for user in users:
        institution = db.query(Institution).filter(Institution.id == user.institution_id).first()
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Ism: {user.first_name} {user.last_name}")
        print(f"  Rol: {user.role.value}")
        print(f"  Institution: {institution.name if institution else 'N/A'} (ID: {user.institution_id})")
        print(f"  Faol: {user.is_active}")
        print(f"  Yaratilgan: {user.created_at}")
        print("-" * 60)
    
    # Admin foydalanuvchilarni alohida ko'rsatish
    admin_users = db.query(User).filter(User.role == "admin").all()
    if admin_users:
        print(f"\n🔑 ADMIN FOYDALANUVCHILAR ({len(admin_users)} ta):\n")
        for admin in admin_users:
            institution = db.query(Institution).filter(Institution.id == admin.institution_id).first()
            print(f"  Email: {admin.email}")
            print(f"  Ism: {admin.first_name} {admin.last_name}")
            print(f"  Institution: {institution.name if institution else 'N/A'}")
            print(f"  Parol: (hashlangan, to'g'ridan-to'g'ri ko'rinmaydi)")
            print(f"  ⚠️  Default parol: admin123")
            print("-" * 60)
    
    print("\n" + "=" * 60)
    print("DEFAULT LOGIN MA'LUMOTLARI:")
    print("=" * 60)
    print("\n🔑 ADMIN:")
    print("   Email: admin@example.com")
    print("   Parol: admin123")
    print("\n👨‍🏫 TEACHER:")
    print("   Email: teacher@example.com")
    print("   Parol: teacher123")
    print("\n" + "=" * 60)
    
except Exception as e:
    print(f"❌ Xatolik: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

