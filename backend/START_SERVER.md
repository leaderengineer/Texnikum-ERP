# Backend Server Ishga Tushirish

## Muammo: Server ishlamayapti

Agar server ishlamayapti, quyidagi qadamlarni bajaring:

## 1. Quick Start (Tavsiya etiladi)

```bash
cd backend
quick_start.bat
```

Bu skript:
- ✅ Virtual environment yaratadi/aktivatsiya qiladi
- ✅ Dependencies o'rnatadi
- ✅ Database'ni tekshiradi
- ✅ Server'ni ishga tushiradi

## 2. Qo'lda Ishga Tushirish

```bash
cd backend

# Virtual environment aktivatsiya
call venv\Scripts\activate.bat

# Dependencies o'rnatish (agar kerak bo'lsa)
pip install -r requirements.txt

# Database tekshiruvi
python check_database.py

# Server ishga tushirish
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 3. Tekshirish

Server ishga tushgandan keyin:

1. Browser'da oching: `http://localhost:8000/docs`
2. Yoki: `http://localhost:8000/health`
3. Frontend'da login qilib ko'ring

## 4. Database Ma'lumotlari

Database mavjud va ma'lumotlar saqlangan:
- Talabalar: 8 ta
- Yo'nalishlar: 3 ta
- Dars jadvallari: 6 ta
- Guruhlar: mavjud

Database'ni ko'rish uchun:
```bash
python check_database.py
```

Yoki batafsil:
```bash
python view_database.py
```

## 5. Muammo Hal Qilish

### Port 8000 allaqachon ishlatilmoqda
```bash
# Jarayonni topish
netstat -ano | findstr :8000

# Jarayonni to'xtatish (PID o'rniga jarayon ID)
taskkill /PID <PID> /F
```

### Dependencies o'rnatilmagan
```bash
call venv\Scripts\activate.bat
pip install -r requirements.txt
```

### Database xatolik
```bash
python check_database.py
python view_database.py
```

## 6. Server Status

Server ishlayotganini tekshirish:
```bash
curl http://localhost:8000/health
```

Yoki browser'da: `http://localhost:8000/health`
