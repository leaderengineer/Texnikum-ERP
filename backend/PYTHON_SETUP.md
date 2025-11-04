# Python O'rnatish va Backend Ishga Tushirish

## Muammo

Agar backend'ni ishga tushirishda xatolik bo'lsa, Python o'rnatilmagan bo'lishi mumkin.

## Python O'rnatish (Windows)

### 1. Python yuklab olish

1. https://www.python.org/downloads/ ga kiring
2. "Download Python 3.11.x" (yoki eng yangi versiya) tugmasini bosing
3. Yuklab olingan `.exe` faylni ishga tushiring

### 2. O'rnatish

**MUHIM:** O'rnatish paytida:
- ✅ **"Add Python to PATH"** ni belgilang (enabled)
- ✅ **"Install for all users"** ni tanlang (ixtiyoriy)

### 3. Tekshirish

Yangı terminal ochib:

```bash
python --version
```

Python versiyasi ko'rsatilsa, o'rnatilgan.

## Backend Ishga Tushirish

### Variant 1: Batch fayl orqali (Oson)

1. `backend` papkasida `start_backend_simple.bat` faylini ikki marta bosib oching
2. Bu fayl avtomatik:
   - Virtual environment yaratadi
   - Dependencies o'rnatadi
   - Database initializatsiya qiladi
   - Server'ni ishga tushiradi

### Variant 2: Qo'lda (Manual)

1. Terminal ochib `backend` papkasiga kiring:
```bash
cd backend
```

2. Virtual environment yaratish:
```bash
python -m venv venv
```

3. Virtual environment aktivatsiya qilish:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Dependencies o'rnatish:
```bash
pip install -r requirements.txt
```

5. Database initializatsiya:
```bash
python init_db.py
```

6. Server ishga tushirish:
```bash
python run.py
```

## Test Login

Database initializatsiya qilgandan keyin:

- **Admin**: `admin@example.com` / `admin123`
- **Teacher**: `teacher@example.com` / `teacher123`

## Xatoliklar

### "Python was not found"

**Yechim:** Python o'rnatilmagan yoki PATH'ga qo'shilmagan.

1. Python'ni o'rnating (yuqoridagi qadamlarni bajaring)
2. Terminal'ni yopib qayta oching
3. `python --version` komandasini tekshiring

### "pip is not recognized"

**Yechim:** Python o'rnatilganda pip ham o'rnatilishi kerak. Python'ni qayta o'rnating.

### "Module not found"

**Yechim:** Virtual environment aktivatsiya qilinmagan yoki dependencies o'rnatilmagan.

```bash
venv\Scripts\activate
pip install -r requirements.txt
```

## Yordam

Agar muammo davom etsa:
1. Python versiyasini tekshiring: `python --version`
2. Virtual environment aktivatsiya qilinganligini tekshiring (terminal'da `(venv)` ko'rinishi kerak)
3. `pip list` komandasi bilan o'rnatilgan paketlarni ko'ring

