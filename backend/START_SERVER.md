# Backend Server Ishga Tushirish

## ✅ Dependencies O'rnatildi!

Barcha kerakli paketlar o'rnatildi. Endi server'ni ishga tushirishingiz mumkin.

## Server Ishga Tushirish

### Git Bash'da:

```bash
# 1. Backend papkasiga kiring
cd /c/Users/HP/Desktop/ERP/backend

# 2. Virtual environment aktivatsiya qiling
source venv/Scripts/activate

# 3. Server ishga tushiring
python run.py
```

### Windows Command Prompt'da:

1. `backend` papkasida `start_backend_simple.bat` faylini ikki marta bosib oching

## Server URL

Server ishga tushgandan keyin:

- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Login Ma'lumotlari

Agar database initializatsiya qilinmagan bo'lsa:

```bash
python init_db.py
```

Keyin:

- **Email:** `admin@example.com`
- **Parol:** `admin123`

## Server'ni To'xtatish

Server'ni to'xtatish uchun terminal'da `Ctrl+C` bosing.

## Xatoliklar

### "ModuleNotFoundError: No module named 'uvicorn'"

**Yechim:** Virtual environment aktivatsiya qilinmagan:

```bash
source venv/Scripts/activate  # Git Bash
```

### "Address already in use"

**Yechim:** Port 8000 band. Yoki server allaqachon ishlayapti.

```bash
# Server'ni to'xtatish: Ctrl+C
# Yoki boshqa port ishlatish
uvicorn app.main:app --port 8001
```

