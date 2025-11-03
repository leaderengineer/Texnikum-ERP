# Texnikum ERP Backend API

FastAPI asosida qurilgan backend API.

## Texnologiyalar

- **FastAPI** - Zamonaviy va tez Python web framework
- **SQLAlchemy** - ORM (Object-Relational Mapping)
- **PostgreSQL/SQLite** - Database
- **Alembic** - Database migrations
- **JWT** - Authentication
- **Pydantic** - Data validation
- **bcrypt** - Password hashing

## O'rnatish

### 1. Virtual environment yaratish

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Dependencies o'rnatish

```bash
pip install -r requirements.txt
```

### 3. Environment variables sozlash

`.env.example` faylini `.env` ga ko'chiring va sozlamalarni to'ldiring:

```bash
cp .env.example .env
```

`.env` faylida:
```env
DATABASE_URL=sqlite:///./texnikum_erp.db
# yoki PostgreSQL uchun:
# DATABASE_URL=postgresql://user:password@localhost:5432/texnikum_erp

SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Database migrations

```bash
# Alembic init (birinchi marta)
alembic init alembic

# Migration yaratish
alembic revision --autogenerate -m "Initial migration"

# Migration qo'llash
alembic upgrade head
```

### 5. Server ishga tushirish

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# yoki
python app/main.py
```

Server `http://localhost:8000` da ishga tushadi.

## API Dokumentatsiya

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Joriy foydalanuvchi
- `POST /api/auth/register` - Ro'yxatdan o'tish

### Teachers
- `GET /api/teachers` - O'qituvchilar ro'yxati
- `GET /api/teachers/{id}` - O'qituvchi ma'lumotlari
- `POST /api/teachers` - Yangi o'qituvchi qo'shish
- `PUT /api/teachers/{id}` - O'qituvchini yangilash
- `DELETE /api/teachers/{id}` - O'qituvchini o'chirish

### Students
- `GET /api/students` - Talabalar ro'yxati
- `GET /api/students/{id}` - Talaba ma'lumotlari
- `GET /api/students/group/{group}` - Guruh bo'yicha talabalar
- `POST /api/students` - Yangi talaba qo'shish
- `PUT /api/students/{id}` - Talabani yangilash
- `DELETE /api/students/{id}` - Talabani o'chirish

### Departments
- `GET /api/departments` - Yo'nalishlar ro'yxati
- `GET /api/departments/{id}` - Yo'nalish ma'lumotlari
- `POST /api/departments` - Yangi yo'nalish qo'shish
- `PUT /api/departments/{id}` - Yo'nalishni yangilash
- `DELETE /api/departments/{id}` - Yo'nalishni o'chirish

### Schedules
- `GET /api/schedules` - Dars jadvallari
- `GET /api/schedules/{id}` - Dars jadvali ma'lumotlari
- `GET /api/schedules/group/{group}` - Guruh bo'yicha dars jadvallari
- `POST /api/schedules` - Yangi dars jadvali qo'shish
- `PUT /api/schedules/{id}` - Dars jadvalini yangilash
- `DELETE /api/schedules/{id}` - Dars jadvalini o'chirish

### Attendance
- `GET /api/attendance` - Davomat yozuvlari
- `GET /api/attendance/date/{date}` - Sana bo'yicha davomat
- `GET /api/attendance/student/{id}` - Talaba bo'yicha davomat
- `GET /api/attendance/statistics` - Davomat statistikasi
- `POST /api/attendance` - Yangi davomat yozuvi
- `PUT /api/attendance/{id}` - Davomat yozuvini yangilash
- `DELETE /api/attendance/{id}` - Davomat yozuvini o'chirish

### Books
- `GET /api/books` - Kitoblar ro'yxati
- `GET /api/books/{id}` - Kitob ma'lumotlari
- `GET /api/books/borrowed/list` - Olingan kitoblar
- `POST /api/books` - Yangi kitob qo'shish
- `PUT /api/books/{id}` - Kitobni yangilash
- `DELETE /api/books/{id}` - Kitobni o'chirish
- `POST /api/books/borrow` - Kitob olish
- `POST /api/books/return/{id}` - Kitobni qaytarish

### Dashboard
- `GET /api/dashboard/stats` - Umumiy statistika
- `GET /api/dashboard/attendance` - Davomat statistikasi
- `GET /api/dashboard/students` - Talabalar statistikasi
- `GET /api/dashboard/books` - Kitoblar statistikasi

## Authentication

Barcha protected endpoint'lar uchun JWT token talab qilinadi:

```http
Authorization: Bearer <access_token>
```

## Test Login

Development uchun admin foydalanuvchi yaratish:

```python
from app.database import SessionLocal
from app.models.user import User
from app.auth import get_password_hash

db = SessionLocal()
admin = User(
    email="admin@example.com",
    first_name="Admin",
    last_name="User",
    hashed_password=get_password_hash("admin123"),
    role="admin",
)
db.add(admin)
db.commit()
```

## Deployment

### Railway

1. Railway'ga kirish va yangi project yaratish
2. GitHub repository'ni ulash
3. Environment variables sozlash
4. PostgreSQL database qo'shish
5. Deploy

### Render

1. Render'da yangi Web Service yaratish
2. GitHub repository'ni ulash
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment variables sozlash
6. PostgreSQL database qo'shish

### Vercel (Serverless)

1. Vercel CLI o'rnatish: `npm i -g vercel`
2. `vercel.json` fayl yaratish
3. `vercel` komandasi orqali deploy

## Database

### SQLite (Development)

Development uchun SQLite ishlatiladi:
```
DATABASE_URL=sqlite:///./texnikum_erp.db
```

### PostgreSQL (Production)

Production uchun PostgreSQL tavsiya qilinadi:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Yordam

Savollar bo'lsa, loyiha issues bo'limiga yozing.

