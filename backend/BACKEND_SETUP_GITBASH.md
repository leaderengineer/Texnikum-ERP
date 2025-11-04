# Backend Ishga Tushirish - Git Bash uchun

## Muhim Tushuncha

Siz **Git Bash** (MINGW64) terminalida ishlayapsiz. Bu terminalda Windows komandalari (`venv\Scripts\activate`) ishlamaydi.

## Yechimlar

### Variant 1: Batch fayl ishlatish (Tavsiya etiladi) ⭐

**Windows Command Prompt yoki PowerShell** da ishga tushiring:

1. Windows Explorer'da `backend` papkasini oching
2. `start_backend_simple.bat` faylini **ikki marta bosib oching**
3. Bu avtomatik hamma narsani qiladi!

### Variant 2: Git Bash'da qo'lda

Agar Git Bash'da ishlashni xohlasangiz:

#### 1. Backend papkasiga kiring
```bash
cd /c/Users/HP/Desktop/ERP/backend
```

#### 2. Virtual environment yaratish (agar mavjud bo'lmasa)
```bash
python -m venv venv
```

#### 3. Virtual environment aktivatsiya qilish ⚠️
**Git Bash'da:**
```bash
source venv/Scripts/activate
```

**Yoki sh script ishlatish:**
```bash
bash activate_venv.sh
```

**⚠️ MUHIM:** Git Bash'da:
- ❌ `venv\Scripts\activate` - ishlamaydi (backslash)
- ✅ `source venv/Scripts/activate` - ishlaydi (forward slash)

#### 4. Dependencies o'rnatish
```bash
pip install -r requirements.txt
```

#### 5. Database initializatsiya
```bash
python init_db.py
```

#### 6. Server ishga tushirish
```bash
python run.py
```

---

## Qadamlarni Batafsil

### 1-qadam: Backend papkasiga kiring

Git Bash'da:
```bash
cd /c/Users/HP/Desktop/ERP/backend
```

Yoki full path:
```bash
cd ~/Desktop/ERP/backend
```

### 2-qadam: Virtual environment yaratish

Agar `venv` papkasi yo'q bo'lsa:
```bash
python -m venv venv
```

### 3-qadam: Aktivatsiya qilish

**Git Bash'da:**
```bash
source venv/Scripts/activate
```

Aktivatsiya qilingan bo'lsa, terminal'da `(venv)` ko'rinadi:
```bash
(venv) HP@Leadengineer MINGW64 ~/Desktop/ERP/backend
```

### 4-qadam: Dependencies o'rnatish
```bash
pip install -r requirements.txt
```

### 5-qadam: Database initializatsiya
```bash
python init_db.py
```

### 6-qadam: Server ishga tushirish
```bash
python run.py
```

Server `http://localhost:8000` da ishga tushadi.

---

## Xatoliklar

### "bash: venvScriptsactivate: command not found"

**Sabab:** Git Bash'da backslash (`\`) ishlamaydi.

**Yechim:**
```bash
# ❌ Noto'g'ri
venv\Scripts\activate

# ✅ To'g'ri
source venv/Scripts/activate
```

### "No such file or directory"

**Sabab:** Virtual environment yaratilmagan yoki noto'g'ri papkada.

**Yechim:**
```bash
# Backend papkasiga kiring
cd /c/Users/HP/Desktop/ERP/backend

# Virtual environment yaratish
python -m venv venv

# Aktivatsiya qilish
source venv/Scripts/activate
```

---

## Eng Oson Usul

Agar Git Bash bilan muammo bo'lsa, **Windows Command Prompt** yoki **PowerShell** ishlating:

1. Windows Explorer'da `backend` papkasini oching
2. `start_backend_simple.bat` faylini ikki marta bosib oching
3. Barcha narsa avtomatik bajariladi!

---

## Test Login

Backend ishga tushgandan keyin:

- **Email:** `admin@example.com`
- **Parol:** `admin123`

---

## Virtual Environment'dan Chiqish

Agar chiqishni xohlasangiz:
```bash
deactivate
```

