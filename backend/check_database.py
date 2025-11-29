#!/usr/bin/env python3
"""
Database ma'lumotlarini tekshirish
"""
import sqlite3
from pathlib import Path

def check_database():
    """Database ma'lumotlarini ko'rsatish"""
    db_path = Path("texnikum_erp.db")
    
    if not db_path.exists():
        print("❌ Database fayl topilmadi: texnikum_erp.db")
        return
    
    print("=" * 60)
    print("Database Ma'lumotlari")
    print("=" * 60)
    print()
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Jadvallar
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"📊 Jadvallar soni: {len(tables)}")
    print(f"   {', '.join(tables)}")
    print()
    
    # Talabalar
    cursor.execute("SELECT COUNT(*) FROM students")
    student_count = cursor.fetchone()[0]
    print(f"👥 Talabalar: {student_count} ta")
    if student_count > 0:
        cursor.execute("SELECT id, first_name, last_name FROM students LIMIT 5")
        students = cursor.fetchall()
        for s in students:
            print(f"   - {s[0]}: {s[1]} {s[2]}")
        if student_count > 5:
            print(f"   ... va yana {student_count - 5} ta")
    print()
    
    # Yo'nalishlar
    cursor.execute("SELECT COUNT(*) FROM departments")
    dept_count = cursor.fetchone()[0]
    print(f"📚 Yo'nalishlar: {dept_count} ta")
    if dept_count > 0:
        cursor.execute("SELECT id, name FROM departments")
        depts = cursor.fetchall()
        for d in depts:
            print(f"   - {d[0]}: {d[1]}")
    print()
    
    # Dars jadvallari
    cursor.execute("SELECT COUNT(*) FROM schedules")
    schedule_count = cursor.fetchone()[0]
    print(f"📅 Dars jadvallari: {schedule_count} ta")
    if schedule_count > 0:
        # Ustun nomlarini tekshirish
        cursor.execute("PRAGMA table_info(schedules)")
        columns = [col[1] for col in cursor.fetchall()]
        # To'g'ri ustun nomlarini aniqlash
        group_col = "group" if "group" in columns else ("group_name" if "group_name" in columns else columns[2] if len(columns) > 2 else "id")
        subject_col = "subject" if "subject" in columns else ("subject_name" if "subject_name" in columns else columns[3] if len(columns) > 3 else "id")
        day_col = "day" if "day" in columns else ("day_of_week" if "day_of_week" in columns else columns[4] if len(columns) > 4 else "id")
        
        try:
            cursor.execute(f"SELECT id, {group_col}, {subject_col}, {day_col} FROM schedules LIMIT 5")
            schedules = cursor.fetchall()
            for s in schedules:
                print(f"   - {s[0]}: {s[1]} - {s[2]} ({s[3]})")
            if schedule_count > 5:
                print(f"   ... va yana {schedule_count - 5} ta")
        except:
            print(f"   - {schedule_count} ta dars jadvali mavjud")
    print()
    
    # Guruhlar
    cursor.execute("SELECT COUNT(*) FROM groups")
    group_count = cursor.fetchone()[0]
    print(f"👨‍👩‍👧‍👦 Guruhlar: {group_count} ta")
    if group_count > 0:
        # Ustun nomlarini tekshirish
        cursor.execute("PRAGMA table_info(groups)")
        columns = [col[1] for col in cursor.fetchall()]
        # To'g'ri ustun nomlarini aniqlash
        name_col = "name" if "name" in columns else ("group_name" if "group_name" in columns else columns[1] if len(columns) > 1 else "id")
        dept_col = "department" if "department" in columns else ("department_id" if "department_id" in columns else None)
        
        try:
            if dept_col:
                cursor.execute(f"SELECT id, {name_col}, {dept_col} FROM groups LIMIT 5")
                groups = cursor.fetchall()
                for g in groups:
                    print(f"   - {g[0]}: {g[1]} (Yo'nalish: {g[2]})")
            else:
                cursor.execute(f"SELECT id, {name_col} FROM groups LIMIT 5")
                groups = cursor.fetchall()
                for g in groups:
                    print(f"   - {g[0]}: {g[1]}")
            if group_count > 5:
                print(f"   ... va yana {group_count - 5} ta")
        except Exception as e:
            print(f"   - {group_count} ta guruh mavjud")
    print()
    
    # O'qituvchilar
    cursor.execute("SELECT COUNT(*) FROM teachers")
    teacher_count = cursor.fetchone()[0]
    print(f"👨‍🏫 O'qituvchilar: {teacher_count} ta")
    print()
    
    # Foydalanuvchilar
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    print(f"👤 Foydalanuvchilar: {user_count} ta")
    if user_count > 0:
        cursor.execute("SELECT id, email, role FROM users")
        users = cursor.fetchall()
        for u in users:
            print(f"   - {u[0]}: {u[1]} ({u[2]})")
    print()
    
    conn.close()
    
    print("=" * 60)
    print("✅ Database ma'lumotlari mavjud!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        check_database()
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        import traceback
        traceback.print_exc()

