"""
Database'dagi barcha ma'lumotlarni ko'rish uchun script
"""
from app.database import SessionLocal
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.group import Group
from app.models.department import Department
from app.models.schedule import Schedule
from app.models.attendance import Attendance
from app.models.user import User
from sqlalchemy import func

def view_all_data():
    """Barcha ma'lumotlarni ko'rsatish"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("📊 DATABASE MA'LUMOTLARI")
        print("=" * 80)
        
        # 1. Talabalar
        print("\n📚 TALABALAR:")
        print("-" * 80)
        students = db.query(Student).all()
        print(f"Jami: {len(students)} ta talaba")
        if students:
            for i, student in enumerate(students[:10], 1):  # Birinchi 10 tasini ko'rsatish
                print(f"{i}. {student.first_name} {student.last_name} | ID: {student.student_id} | "
                      f"Email: {student.email} | Guruh: {student.group} | "
                      f"Holat: {student.status}")
            if len(students) > 10:
                print(f"... va yana {len(students) - 10} ta talaba")
        else:
            print("❌ Talabalar topilmadi")
        
        # 2. O'qituvchilar
        print("\n👨‍🏫 O'QITUVCHILAR:")
        print("-" * 80)
        teachers = db.query(Teacher).all()
        print(f"Jami: {len(teachers)} ta o'qituvchi")
        if teachers:
            for i, teacher in enumerate(teachers[:10], 1):
                user = teacher.user if hasattr(teacher, 'user') else None
                name = f"{user.first_name} {user.last_name}" if user else "Noma'lum"
                print(f"{i}. {name} | Email: {teacher.email} | "
                      f"Yo'nalish: {teacher.department} | Holat: {teacher.status}")
            if len(teachers) > 10:
                print(f"... va yana {len(teachers) - 10} ta o'qituvchi")
        else:
            print("❌ O'qituvchilar topilmadi")
        
        # 3. Guruhlar
        print("\n👥 GURUHLAR:")
        print("-" * 80)
        groups = db.query(Group).all()
        print(f"Jami: {len(groups)} ta guruh")
        if groups:
            for i, group in enumerate(groups[:10], 1):
                print(f"{i}. {group.name} ({group.code}) | Yo'nalish: {group.department} | "
                      f"Yil: {group.year} | Holat: {'Faol' if group.is_active else 'Nofaol'}")
            if len(groups) > 10:
                print(f"... va yana {len(groups) - 10} ta guruh")
        else:
            print("❌ Guruhlar topilmadi")
        
        # 4. Yo'nalishlar
        print("\n🏛️ YO'NALISHLAR:")
        print("-" * 80)
        departments = db.query(Department).all()
        print(f"Jami: {len(departments)} ta yo'nalish")
        if departments:
            for i, dept in enumerate(departments, 1):
                print(f"{i}. {dept.name} ({dept.code}) | Holat: {dept.status}")
        else:
            print("❌ Yo'nalishlar topilmadi")
        
        # 5. Dars Jadvali
        print("\n📅 DARS JADVALI:")
        print("-" * 80)
        schedules = db.query(Schedule).all()
        print(f"Jami: {len(schedules)} ta dars")
        if schedules:
            for i, schedule in enumerate(schedules[:10], 1):
                print(f"{i}. {schedule.group} | {schedule.subject} | "
                      f"{schedule.day} | {schedule.time} | O'qituvchi: {schedule.teacher}")
            if len(schedules) > 10:
                print(f"... va yana {len(schedules) - 10} ta dars")
        else:
            print("❌ Dars jadvali topilmadi")
        
        # 6. Davomat
        print("\n✅ DAVOMAT:")
        print("-" * 80)
        attendance_count = db.query(func.count(Attendance.id)).scalar()
        print(f"Jami: {attendance_count} ta davomat yozuvi")
        
        # 7. Foydalanuvchilar
        print("\n👤 FOYDALANUVCHILAR:")
        print("-" * 80)
        users = db.query(User).all()
        print(f"Jami: {len(users)} ta foydalanuvchi")
        if users:
            for i, user in enumerate(users[:10], 1):
                print(f"{i}. {user.first_name} {user.last_name} | Email: {user.email} | "
                      f"Rol: {user.role} | Holat: {'Faol' if user.is_active else 'Nofaol'}")
            if len(users) > 10:
                print(f"... va yana {len(users) - 10} ta foydalanuvchi")
        else:
            print("❌ Foydalanuvchilar topilmadi")
        
        # 8. Umumiy statistika
        print("\n" + "=" * 80)
        print("📈 UMUMIY STATISTIKA:")
        print("-" * 80)
        print(f"Talabalar: {len(students)} ta")
        print(f"O'qituvchilar: {len(teachers)} ta")
        print(f"Guruhlar: {len(groups)} ta")
        print(f"Yo'nalishlar: {len(departments)} ta")
        print(f"Darslar: {len(schedules)} ta")
        print(f"Davomat yozuvlari: {attendance_count} ta")
        print(f"Foydalanuvchilar: {len(users)} ta")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Xatolik: {e}")
    finally:
        db.close()


def view_student_by_id(student_id: str):
    """Talabani ID bo'yicha ko'rish"""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if student:
            print(f"\n📚 TALABA MA'LUMOTLARI:")
            print("-" * 80)
            print(f"ID: {student.id}")
            print(f"Student ID: {student.student_id}")
            print(f"Ism: {student.first_name}")
            print(f"Familiya: {student.last_name}")
            print(f"Email: {student.email}")
            print(f"Telefon: {student.phone}")
            print(f"Guruh: {student.group}")
            print(f"Yo'nalish: {student.department}")
            print(f"Holat: {student.status}")
            print(f"Yaratilgan: {student.created_at}")
            print(f"Yangilangan: {student.updated_at}")
        else:
            print(f"❌ Talaba topilmadi: {student_id}")
    except Exception as e:
        print(f"❌ Xatolik: {e}")
    finally:
        db.close()


def view_recent_additions(limit=5):
    """Oxirgi qo'shilgan ma'lumotlarni ko'rish"""
    db = SessionLocal()
    try:
        print("\n🆕 OXIRGI QO'SHILGAN MA'LUMOTLAR:")
        print("=" * 80)
        
        # Oxirgi qo'shilgan talabalar
        recent_students = db.query(Student).order_by(Student.created_at.desc()).limit(limit).all()
        print(f"\n📚 Oxirgi {len(recent_students)} ta talaba:")
        for student in recent_students:
            print(f"  • {student.first_name} {student.last_name} ({student.student_id}) - "
                  f"{student.created_at.strftime('%Y-%m-%d %H:%M')}")
        
        # Oxirgi qo'shilgan o'qituvchilar
        recent_teachers = db.query(Teacher).order_by(Teacher.created_at.desc()).limit(limit).all()
        print(f"\n👨‍🏫 Oxirgi {len(recent_teachers)} ta o'qituvchi:")
        for teacher in recent_teachers:
            user = teacher.user if hasattr(teacher, 'user') else None
            name = f"{user.first_name} {user.last_name}" if user else "Noma'lum"
            print(f"  • {name} ({teacher.email}) - "
                  f"{teacher.created_at.strftime('%Y-%m-%d %H:%M') if teacher.created_at else 'Noma\'lum'}")
        
        # Oxirgi qo'shilgan guruhlar
        recent_groups = db.query(Group).order_by(Group.created_at.desc()).limit(limit).all()
        print(f"\n👥 Oxirgi {len(recent_groups)} ta guruh:")
        for group in recent_groups:
            print(f"  • {group.name} ({group.code}) - "
                  f"{group.created_at.strftime('%Y-%m-%d %H:%M')}")
        
    except Exception as e:
        print(f"❌ Xatolik: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "student" and len(sys.argv) > 2:
            view_student_by_id(sys.argv[2])
        elif sys.argv[1] == "recent":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
            view_recent_additions(limit)
        else:
            print("Foydalanish:")
            print("  python view_database.py              # Barcha ma'lumotlar")
            print("  python view_database.py student ID    # Talaba ma'lumotlari")
            print("  python view_database.py recent [N]     # Oxirgi qo'shilganlar")
    else:
        view_all_data()

