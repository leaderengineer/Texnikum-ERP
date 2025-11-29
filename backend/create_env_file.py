"""
.env faylini yaratish uchun script
"""
import os

env_content = """# Database
DATABASE_URL=sqlite:///./texnikum_erp.db

# JWT
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Server
HOST=0.0.0.0
PORT=8000

# Email Settings (Haqiqiy email yuborish uchun)
# Gmail uchun sozlang:
EMAIL_ENABLED=true
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USE_TLS=true
EMAIL_SMTP_USERNAME=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Texnikum ERP

# SMS Settings (ixtiyoriy)
SMS_PROVIDER=console
SMS_ENABLED=true
"""

env_file_path = ".env"

if os.path.exists(env_file_path):
    print(f"⚠️  {env_file_path} fayli allaqachon mavjud.")
    response = input("Faylni yangilashni xohlaysizmi? (y/n): ")
    if response.lower() != 'y':
        print("Bekor qilindi.")
        exit(0)

try:
    with open(env_file_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    print(f"✅ {env_file_path} fayli yaratildi!")
    print("\n📝 Endi quyidagilarni qiling:")
    print("1. .env faylini oching")
    print("2. EMAIL_SMTP_USERNAME ga o'z email manzilingizni kiriting")
    print("3. EMAIL_SMTP_PASSWORD ga Gmail App Password ni kiriting")
    print("4. EMAIL_FROM ga o'z email manzilingizni kiriting")
    print("\nGmail App Password yaratish:")
    print("1. Google Account → Security → 2-Step Verification yoqing")
    print("2. App passwords → Create app password")
    print("3. Yaratilgan parolni EMAIL_SMTP_PASSWORD ga qo'ying")
except Exception as e:
    print(f"❌ Xatolik: {e}")

