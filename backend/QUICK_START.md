# ⚡ Backend Tezkor Ishga Tushirish

## Eng Oson Usul (Tavsiya etiladi) ⭐

### Windows Command Prompt yoki PowerShell

1. **Windows Explorer'da** `backend` papkasini oching
2. **`start_backend_simple.bat`** faylini **ikki marta bosib oching**
3. ✅ Barcha narsa avtomatik bajariladi!

---

## Git Bash'da (MINGW64)

Agar Git Bash'da ishlashni xohlasangiz:

### 1. Backend papkasiga kiring
```bash
cd /c/Users/HP/Desktop/ERP/backend
```

### 2. Virtual environment yaratish (agar yo'q bo'lsa)
```bash
python -m venv venv
```

### 3. Virtual environment aktivatsiya qilish ⚠️

**MUHIM:** Git Bash'da forward slash (`/`) ishlatiladi:

```bash
# ✅ To'g'ri (Git Bash)
source venv/Scripts/activate

# ❌ Noto'g'ri (Git Bash'da ishlamaydi)
venv\Scripts\activate
```

### 4. Dependencies o'rnatish
```bash
pip install -r requirements.txt
```

### 5. Database initializatsiya
```bash
python init_db.py
```

### 6. Server ishga tushirish
```bash
python run.py
```

---

## Qisqa Qo'llanma

### Git Bash'da:
```bash
cd /c/Users/HP/Desktop/ERP/backend
python -m venv venv                    # 1. Virtual environment yaratish
source venv/Scripts/activate           # 2. Aktivatsiya (⚠️ forward slash!)
pip install -r requirements.txt        # 3. Dependencies
python init_db.py                      # 4. Database
python run.py                          # 5. Server
```

### Windows Command Prompt:
```cmd
cd backend
start_backend_simple.bat              # Hamma narsa avtomatik!
```

---

## Login Ma'lumotlari

Backend ishga tushgandan keyin:

- **Email:** `admin@example.com`
- **Parol:** `admin123`

---

## Xatoliklar

### "bash: venvScriptsactivate: command not found"

**Sabab:** Git Bash'da backslash (`\`) ishlamaydi.

**Yechim:**
```bash
source venv/Scripts/activate  # ✅ Forward slash ishlatish
```

### "No such file or directory"

**Sabab:** Backend papkasida emassiz yoki venv yo'q.

**Yechim:**
```bash
cd /c/Users/HP/Desktop/ERP/backend
ls venv  # venv papkasini tekshiring
```

---

## Yordam

Batafsil ma'lumot:
- Git Bash uchun: `BACKEND_SETUP_GITBASH.md`
- Python o'rnatish: `PYTHON_SETUP.md`
- Python versiyasini tekshirish: `HOW_TO_CHECK_PYTHON.md`

