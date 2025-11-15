"""
Backend API'ni test qilish va ma'lumotlarni tekshirish uchun script
"""
import requests
import json
from datetime import datetime

# Backend URL (local yoki production)
BASE_URL = "http://localhost:8000/api"

def test_api_connection():
    """API ulanishini tekshirish"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend API ishlayapti!")
            return True
        else:
            print(f"⚠️ Backend javob bermayapti: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend ulanib bo'lmadi. Server ishlayaptimi?")
        print(f"   URL: {BASE_URL.replace('/api', '')}")
        return False
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        return False


def get_auth_token(email="admin@example.com", password="admin123"):
    """Login qilib token olish"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print(f"❌ Login xatolik: {response.status_code}")
            print(f"   Javob: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login xatolik: {e}")
        return None


def get_headers(token):
    """Headers yaratish"""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


def view_students(token):
    """Talabalarni ko'rish"""
    try:
        response = requests.get(
            f"{BASE_URL}/students",
            headers=get_headers(token),
            params={"page": 1, "limit": 10},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            students = data.get("items", [])
            meta = data.get("meta", {})
            print(f"\n📚 TALABALAR (API orqali):")
            print("-" * 80)
            print(f"Jami: {meta.get('total', 0)} ta talaba")
            for i, student in enumerate(students[:10], 1):
                print(f"{i}. {student.get('first_name')} {student.get('last_name')} | "
                      f"ID: {student.get('student_id')} | "
                      f"Guruh: {student.get('group')} | "
                      f"Holat: {student.get('status')}")
            return students
        else:
            print(f"❌ Talabalarni olishda xatolik: {response.status_code}")
            print(f"   Javob: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        return []


def view_teachers(token):
    """O'qituvchilarni ko'rish"""
    try:
        response = requests.get(
            f"{BASE_URL}/teachers",
            headers=get_headers(token),
            params={"page": 1, "limit": 10},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            teachers = data.get("items", [])
            meta = data.get("meta", {})
            print(f"\n👨‍🏫 O'QITUVCHILAR (API orqali):")
            print("-" * 80)
            print(f"Jami: {meta.get('total', 0)} ta o'qituvchi")
            for i, teacher in enumerate(teachers[:10], 1):
                print(f"{i}. {teacher.get('first_name')} {teacher.get('last_name')} | "
                      f"Email: {teacher.get('email')} | "
                      f"Yo'nalish: {teacher.get('department')} | "
                      f"Holat: {teacher.get('status')}")
            return teachers
        else:
            print(f"❌ O'qituvchilarni olishda xatolik: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        return []


def view_groups(token):
    """Guruhlarni ko'rish"""
    try:
        response = requests.get(
            f"{BASE_URL}/groups",
            headers=get_headers(token),
            timeout=5
        )
        if response.status_code == 200:
            groups = response.json()
            print(f"\n👥 GURUHLAR (API orqali):")
            print("-" * 80)
            print(f"Jami: {len(groups)} ta guruh")
            for i, group in enumerate(groups[:10], 1):
                print(f"{i}. {group.get('name')} ({group.get('code')}) | "
                      f"Yo'nalish: {group.get('department')} | "
                      f"Yil: {group.get('year')}")
            return groups
        else:
            print(f"❌ Guruhlarni olishda xatolik: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        return []


def view_departments(token):
    """Yo'nalishlarni ko'rish"""
    try:
        response = requests.get(
            f"{BASE_URL}/departments",
            headers=get_headers(token),
            timeout=5
        )
        if response.status_code == 200:
            departments = response.json()
            print(f"\n🏛️ YO'NALISHLAR (API orqali):")
            print("-" * 80)
            print(f"Jami: {len(departments)} ta yo'nalish")
            for i, dept in enumerate(departments, 1):
                print(f"{i}. {dept.get('name')} ({dept.get('code')}) | "
                      f"Holat: {dept.get('status')}")
            return departments
        else:
            print(f"❌ Yo'nalishlarni olishda xatolik: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        return []


def test_create_student(token):
    """Test talaba yaratish"""
    test_data = {
        "first_name": "Test",
        "last_name": "Talaba",
        "student_id": f"TEST{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "email": f"test{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
        "phone": "+998901234567",
        "group": "TEST-1",
        "department": "Axborot texnologiyalari",
        "status": "active"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/students",
            headers=get_headers(token),
            json=test_data,
            timeout=5
        )
        if response.status_code == 200 or response.status_code == 201:
            print(f"\n✅ Test talaba yaratildi: {test_data['student_id']}")
            return True
        else:
            print(f"❌ Talaba yaratishda xatolik: {response.status_code}")
            print(f"   Javob: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Xatolik: {e}")
        return False


def main():
    """Asosiy funksiya"""
    print("=" * 80)
    print("🔍 BACKEND API TEST")
    print("=" * 80)
    
    # 1. API ulanishini tekshirish
    if not test_api_connection():
        print("\n⚠️ Backend ishlamayapti. Avval backend'ni ishga tushiring:")
        print("   cd backend")
        print("   python run.py")
        return
    
    # 2. Login qilish
    print("\n🔐 Login qilinmoqda...")
    token = get_auth_token()
    if not token:
        print("\n⚠️ Login qilib bo'lmadi. Email va parolni tekshiring.")
        return
    
    print("✅ Login muvaffaqiyatli!")
    
    # 3. Ma'lumotlarni ko'rish
    view_students(token)
    view_teachers(token)
    view_groups(token)
    view_departments(token)
    
    print("\n" + "=" * 80)
    print("✅ Test yakunlandi!")
    print("=" * 80)


if __name__ == "__main__":
    main()

