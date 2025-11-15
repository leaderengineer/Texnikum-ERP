# 📊 Database Ma'lumotlarini Ko'rish Qo'llanmasi

## 🎯 3 Ta Usul

### 1️⃣ **Python Script (Eng Oson)** ⭐

#### Database'dagi barcha ma'lumotlarni ko'rish:

```bash
cd backend
python view_database.py
```

**Chiqadi:**
- Barcha talabalar
- Barcha o'qituvchilar
- Barcha guruhlar
- Barcha yo'nalishlar
- Dars jadvali
- Davomat
- Umumiy statistika

#### Oxirgi qo'shilgan ma'lumotlarni ko'rish:

```bash
python view_database.py recent 10
```

#### Aniq talabani ko'rish:

```bash
python view_database.py student STUDENT_ID
```

---

### 2️⃣ **API Test Script (Frontend'dan qo'shilgan ma'lumotlarni tekshirish)** ⭐⭐

#### Backend API'ni test qilish:

```bash
cd backend
pip install requests  # Agar o'rnatilmagan bo'lsa
python test_api.py
```

**Bu script:**
- ✅ Backend API ishlayotganini tekshiradi
- ✅ Login qiladi
- ✅ Barcha ma'lumotlarni API orqali ko'rsatadi
- ✅ Frontend'dan qo'shilgan ma'lumotlar backend'da borligini tasdiqlaydi

**Eslatma:** Backend server ishlayotgan bo'lishi kerak!

---

### 3️⃣ **SQLite Browser (GUI - Ko'rish uchun qulay)** ⭐⭐⭐

#### O'rnatish:

1. **SQLite Browser yuklab oling:**
   - https://sqlitebrowser.org/
   - Yoki: https://github.com/sqlitebrowser/sqlitebrowser/releases

2. **O'rnatish:**
   - Windows: `.exe` faylini yuklab oling va o'rnating
   - Mac: `.dmg` faylini yuklab oling
   - Linux: `sudo apt install sqlitebrowser`

#### Database'ni ochish:

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

**Afzalliklari:**
- ✅ Ko'rish uchun qulay
- ✅ Qidirish funksiyasi
- ✅ Ma'lumotlarni tahrirlash mumkin
- ✅ SQL query yozish mumkin

---

## 🔍 Frontend'dan Qo'shilgan Ma'lumotlar Backend'da Bormi?

### Tekshirish usullari:

#### 1. **API Test Script (Tavsiya etiladi):**

```bash
cd backend
python test_api.py
```

Bu script:
- Frontend'dan qo'shilgan ma'lumotlarni ko'rsatadi
- Backend API orqali ma'lumotlarni oladi
- Frontend va backend o'rtasidagi ulanishni tekshiradi

#### 2. **Browser Developer Tools:**

1. **Frontend'ni oching** (http://localhost:5173)
2. **F12 tugmasini bosing** (Developer Tools)
3. **Network tab'ini oching**
4. **Ma'lumot qo'shing** (masalan, yangi talaba)
5. **API so'rovini ko'ring:**
   - `POST /api/students` - Talaba qo'shish
   - Status: `200 OK` - Muvaffaqiyatli
   - Response'da yangi talaba ma'lumotlari bo'lishi kerak

#### 3. **Database'ni to'g'ridan-to'g'ri ko'rish:**

```bash
cd backend
python view_database.py
```

Yoki SQLite Browser orqali `backend/texnikum_erp.db` faylini oching.

---

## ✅ Tekshirish Checklist

### Frontend'dan qo'shilgan ma'lumotlar backend'da bormi?

1. **✅ Backend server ishlayaptimi?**
   ```bash
   curl http://localhost:8000/health
   ```

2. **✅ API so'rov muvaffaqiyatli bormi?**
   - Browser Developer Tools → Network tab
   - Status: `200 OK` bo'lishi kerak

3. **✅ Database'da ma'lumotlar bormi?**
   ```bash
   python view_database.py
   ```

4. **✅ API orqali ma'lumotlar olinyaptimi?**
   ```bash
   python test_api.py
   ```

---

## 🚨 Muammo Bo'lsa

### Ma'lumotlar qo'shilmayapti:

1. **Backend server ishlayaptimi?**
   ```bash
   cd backend
   python run.py
   ```

2. **Database fayli mavjudmi?**
   ```bash
   ls backend/texnikum_erp.db
   ```

3. **API so'rovlar muvaffaqiyatli bormi?**
   - Browser Developer Tools → Network tab
   - Xatoliklar bor bo'lsa, console'da ko'rsatiladi

4. **CORS muammosi bormi?**
   - Backend `config.py` da `CORS_ORIGINS` to'g'ri sozlanganmi?

---

## 📝 Misollar

### 1. Barcha ma'lumotlarni ko'rish:

```bash
cd backend
python view_database.py
```

**Chiqadi:**
```
📊 DATABASE MA'LUMOTLARI
================================================================================

📚 TALABALAR:
--------------------------------------------------------------------------------
Jami: 25 ta talaba
1. Alisher Karimov | ID: ST001 | Email: alisher@example.com | Guruh: IT-1 | Holat: active
2. Dilshod Rahimov | ID: ST002 | Email: dilshod@example.com | Guruh: IT-1 | Holat: active
...

👨‍🏫 O'QITUVCHILAR:
--------------------------------------------------------------------------------
Jami: 10 ta o'qituvchi
1. Akmal Toshmatov | Email: akmal@example.com | Yo'nalish: Axborot texnologiyalari | Holat: active
...
```

### 2. API orqali tekshirish:

```bash
cd backend
python test_api.py
```

**Chiqadi:**
```
🔍 BACKEND API TEST
================================================================================
✅ Backend API ishlayapti!
🔐 Login qilinmoqda...
✅ Login muvaffaqiyatli!

📚 TALABALAR (API orqali):
--------------------------------------------------------------------------------
Jami: 25 ta talaba
1. Alisher Karimov | ID: ST001 | Guruh: IT-1 | Holat: active
...
```

---

## 🎯 Eng Qulay Usul

**Tavsiya:** 
1. **SQLite Browser** - Ko'rish uchun eng qulay
2. **Python Script** - Tezkor tekshirish uchun
3. **API Test** - Frontend-backend ulanishini tekshirish uchun

**Savol bo'lsa, ayting!** 😊

