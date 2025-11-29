# Backend Server Ishga Tushirish

## Muammo: Server ishlamayapti

Agar sizga "Server bilan bog'lanishda xatolik" xabari chiqayotgan bo'lsa, quyidagi qadamlarni bajaring:

## ✅ Eng Oson Usul (Tavsiya etiladi)

1. `backend` papkasiga kiring
2. `ISHGA_TUSHIRISH.bat` faylini ikki marta bosing (double-click)
3. Server avtomatik ishga tushadi

## 📋 Qo'lda Ishga Tushirish

Agar `.bat` fayl ishlamasa:

### 1. Terminal'ni oching (CMD yoki PowerShell)

### 2. Backend papkasiga kiring:
```bash
cd C:\Users\HP\Desktop\ERP\backend
```

### 3. Virtual environment yaratish (agar mavjud bo'lmasa):
```bash
python -m venv venv
```

### 4. Virtual environment aktivatsiya qilish:
```bash
venv\Scripts\activate
```

### 5. Dependencies o'rnatish:
```bash
pip install -r requirements.txt
```

### 6. Server ishga tushirish:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔍 Tekshirish

Server ishga tushgandan keyin:

1. Browser'da oching: `http://localhost:8000/docs`
2. Yoki: `http://localhost:8000/health`
3. Frontend'da login qilib ko'ring

## ❌ Muammo Hal Qilish

### Port 8000 allaqachon ishlatilmoqda
```bash
# Jarayonni topish
netstat -ano | findstr :8000

# Jarayonni to'xtatish (PID o'rniga jarayon ID)
taskkill /PID <PID> /F
```

### FastAPI topilmadi
```bash
pip install fastapi uvicorn
```

### Boshqa xatoliklar
```bash
# Debug mode
start_backend_debug.bat
```

## 📝 Eslatma

- Server ishga tushganda terminal yopilmasligi kerak
- Server'ni to'xtatish uchun `Ctrl+C` bosing
- Agar server yopilsa, qayta `ISHGA_TUSHIRISH.bat` ni ishga tushiring

