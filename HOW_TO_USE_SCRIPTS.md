# 📋 Database Ma'lumotlarini Ko'rish - Qo'llanma

## ⚠️ MUHIM: Virtual Environment Aktivatsiya Qilish

**Barcha scriptlarni ishga tushirishdan oldin virtual environment'ni aktivatsiya qilish kerak!**

### Git Bash'da:

```bash
cd /c/Users/HP/Desktop/ERP/backend
source venv/Scripts/activate
```

### Windows Command Prompt'da:

```cmd
cd backend
venv\Scripts\activate
```

---

## 1️⃣ Database Ma'lumotlarini Ko'rish (view_database.py)

### Barcha ma'lumotlarni ko'rish:

```bash
# Virtual environment aktivatsiya qiling
source venv/Scripts/activate

# Scriptni ishga tushiring
python view_database.py
```

**Chiqadi:**
- ✅ Barcha talabalar
- ✅ Barcha o'qituvchilar
- ✅ Barcha guruhlar
- ✅ Barcha yo'nalishlar
- ✅ Dars jadvali
- ✅ Davomat
- ✅ Umumiy statistika

### Oxirgi qo'shilgan ma'lumotlarni ko'rish:

```bash
python view_database.py recent 10
```

### Aniq talabani ko'rish:

```bash
python view_database.py student STUDENT_ID
```

**Misol:**
```bash
python view_database.py student 101
```

---

## 2️⃣ API Test (test_api.py)

### Backend API'ni test qilish:

**MUHIM:** Backend server ishlayotgan bo'lishi kerak!

```bash
# 1. Virtual environment aktivatsiya qiling
source venv/Scripts/activate

# 2. Backend server ishga tushiring (boshqa terminal'da)
python run.py

# 3. Yana bir terminal ochib, API test qiling
python test_api.py
```

**Bu script:**
- ✅ Backend API ishlayotganini tekshiradi
- ✅ Login qiladi (`admin@example.com` / `admin123`)
- ✅ Barcha ma'lumotlarni API orqali ko'rsatadi
- ✅ Frontend'dan qo'shilgan ma'lumotlar backend'da borligini tasdiqlaydi

### Login Ma'lumotlari:

- **Email:** `admin@example.com`
- **Parol:** `admin123`

Agar login ishlamasa, database'ni initializatsiya qiling:

```bash
python init_db.py
```

---

## 3️⃣ SQLite Browser (GUI)

### O'rnatish:

1. **SQLite Browser yuklab oling:**
   - https://sqlitebrowser.org/
   - Yoki: https://github.com/sqlitebrowser/sqlitebrowser/releases

2. **O'rnatish:**
   - Windows: `.exe` faylini yuklab oling va o'rnating
   - Mac: `.dmg` faylini yuklab oling
   - Linux: `sudo apt install sqlitebrowser`

### Database'ni ochish:

1. **SQLite Browser'ni oching**
2. **"Open Database" tugmasini bosing**
3. **Faylni tanlang:** `backend/texnikum_erp.db`
4. **"Browse Data" tab'ini oching**
5. **Jadvallarni tanlang:**
   - `students` - Talabalar
   - `teachers` - O'qituvchilar
   - `groups` - Guruhlar
   - `departments` - Yo'nalishlar
   - `schedules` - Dars jadvali
   - `attendance` - Davomat
   - `users` - Foydalanuvchilar

---

## 🔍 Frontend'dan Qo'shilgan Ma'lumotlar Backend'da Bormi?

### Tekshirish usullari:

#### 1. **Python Script (Tavsiya):**

```bash
source venv/Scripts/activate
python view_database.py
```

#### 2. **API Test:**

```bash
# Backend server ishga tushiring (boshqa terminal'da)
python run.py

# Yana bir terminal'da
source venv/Scripts/activate
python test_api.py
```

#### 3. **Browser Developer Tools:**

1. **Frontend'ni oching** (http://localhost:5173)
2. **F12 tugmasini bosing** (Developer Tools)
3. **Network tab'ini oching**
4. **Ma'lumot qo'shing** (masalan, yangi talaba)
5. **API so'rovini ko'ring:**
   - `POST /api/students` - Talaba qo'shish
   - Status: `200 OK` - Muvaffaqiyatli
   - Response'da yangi talaba ma'lumotlari bo'lishi kerak

---

## ⚠️ Xatoliklar va Yechimlar

### "ModuleNotFoundError: No module named 'requests'"

**Sabab:** Virtual environment aktivatsiya qilinmagan yoki `requests` o'rnatilmagan.

**Yechim:**
```bash
source venv/Scripts/activate
pip install requests
```

### "ModuleNotFoundError: No module named 'sqlalchemy'"

**Sabab:** Virtual environment aktivatsiya qilinmagan.

**Yechim:**
```bash
source venv/Scripts/activate
python view_database.py
```

### "Backend ulanib bo'lmadi"

**Sabab:** Backend server ishlamayapti.

**Yechim:**
```bash
# Boshqa terminal'da
cd backend
source venv/Scripts/activate
python run.py
```

### "Login xatolik: 401"

**Sabab:** Email yoki parol noto'g'ri.

**Yechim:**
1. Database'ni initializatsiya qiling:
   ```bash
   python init_db.py
   ```
2. To'g'ri login ma'lumotlarini ishlating:
   - Email: `admin@example.com`
   - Parol: `admin123`

---

## 📝 Tezkor Qo'llanma

### Database ma'lumotlarini ko'rish:

```bash
cd /c/Users/HP/Desktop/ERP/backend
source venv/Scripts/activate
python view_database.py
```

### API test qilish:

```bash
# Terminal 1: Backend server
cd /c/Users/HP/Desktop/ERP/backend
source venv/Scripts/activate
python run.py

# Terminal 2: API test
cd /c/Users/HP/Desktop/ERP/backend
source venv/Scripts/activate
python test_api.py
```

---

## ✅ Checklist

- [ ] Virtual environment aktivatsiya qilindi
- [ ] Backend server ishlayapti (API test uchun)
- [ ] Database fayli mavjud (`backend/texnikum_erp.db`)
- [ ] Login ma'lumotlari to'g'ri (`admin@example.com` / `admin123`)

---

## 🎯 Eng Qulay Usul

**Tavsiya:** 
1. **`view_database.py`** - Tezkor tekshirish uchun (server kerak emas)
2. **`test_api.py`** - Frontend-backend ulanishini tekshirish uchun (server kerak)
3. **SQLite Browser** - Ko'rish uchun eng qulay (GUI)

**Savol bo'lsa, ayting!** 😊

