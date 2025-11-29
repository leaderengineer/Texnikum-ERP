"""
Database'ga avatar_url maydonini qo'shish skripti
"""
import sqlite3
from pathlib import Path

# Database fayl yo'li
db_path = Path("texnikum_erp.db")
if not db_path.exists():
    db_path = Path("erp.db")

if not db_path.exists():
    print(f"Database fayli topilmadi: {db_path}")
    exit(1)

print(f"Database fayli topildi: {db_path}")

# Database'ga ulanish
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

try:
    # users jadvalida avatar_url maydoni bor-yo'qligini tekshirish
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'avatar_url' in columns:
        print("avatar_url maydoni allaqachon mavjud!")
    else:
        print("avatar_url maydoni qo'shilmoqda...")
        # avatar_url maydonini qo'shish
        cursor.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
        conn.commit()
        print("avatar_url maydoni muvaffaqiyatli qo'shildi!")
    
    # Tekshirish
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    print("\nUsers jadvali ustunlari:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
        
except Exception as e:
    print(f"Xatolik: {e}")
    conn.rollback()
finally:
    conn.close()
    print("\nDatabase ulanishi yopildi.")

