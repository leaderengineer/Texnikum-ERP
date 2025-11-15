# 📊 Ma'lumotlar Qayerga Saqlanadi?

## ✅ Javob: Ma'lumotlar Database'da Doimiy Saqlanadi!

**Barcha ma'lumotlaringiz database'da saqlanadi va o'chib ketmaydi!**

---

## 🗄️ Database Qayerda?

### 1. **Local Development (Hozirgi holat)**

**Fayl joylashuvi:**
```
backend/texnikum_erp.db
```

**Format:** SQLite database fayli

**Xususiyatlar:**
- ✅ Barcha ma'lumotlar shu faylda saqlanadi
- ✅ Server o'chib qolsa ham, fayl saqlanib qoladi
- ✅ Faylni ko'chirib, boshqa kompyuterga olib ketish mumkin
- ⚠️ Faqat local kompyuteringizda mavjud

**Tekshirish:**
```bash
# Windows
dir backend\texnikum_erp.db

# Linux/Mac
ls -lh backend/texnikum_erp.db
```

---

### 2. **Production (Server'ga Deploy Qilganda)**

**Joylashuv:** Railway PostgreSQL database

**Xususiyatlar:**
- ✅ Cloud'da saqlanadi (internet orqali kirish mumkin)
- ✅ Avtomatik backup
- ✅ Server o'chib qolsa ham, ma'lumotlar saqlanadi
- ✅ Bir nechta foydalanuvchi bir vaqtda kirishi mumkin

---

## 📋 Qanday Ma'lumotlar Saqlanadi?

### ✅ Database'da Saqlanadigan Ma'lumotlar:

1. **Talabalar (Students)**
   - Ism, familiya, email, telefon
   - Student ID, guruh, yo'nalish
   - Holat (faol/nofaol)
   - Yaratilgan vaqti

2. **O'qituvchilar (Teachers)**
   - Ism, familiya, email, telefon
   - Yo'nalish, holat
   - Parol (hash qilingan)
   - Yaratilgan vaqti

3. **Guruhlar (Groups)**
   - Nomi, kodi
   - Yo'nalish, yil
   - Kurator, tavsif
   - Holat

4. **Yo'nalishlar (Departments)**
   - Nomi, kodi
   - Tavsif, holat

5. **Dars Jadvali (Schedules)**
   - Guruh, fan, o'qituvchi
   - Kun, vaqt, xona
   - Yaratilgan vaqti

6. **Davomat (Attendance)**
   - Talaba, sana
   - Holat (kelgan/kelmagan)
   - Izoh

7. **Foydalanuvchilar (Users)**
   - Email, parol (hash)
   - Rol (admin/teacher)
   - Holat

---

## 🔍 Ma'lumotlar Qanday Saqlanadi?

### Backend Kodida:

```python
# Ma'lumot yaratish
student = Student(**student_data.model_dump())
db.add(student)
db.commit()  # ← Bu yerda database'ga yoziladi!
db.refresh(student)
```

**`db.commit()`** - Bu yerda ma'lumotlar database'ga **doimiy** yoziladi!

---

## ⚠️ Muhim Eslatmalar

### ✅ Ma'lumotlar O'chib Ketmaydi:

- ❌ Server'ni qayta ishga tushirganda
- ❌ Browser'ni yopganda
- ❌ Kompyuterni o'chirganda
- ❌ Frontend'ni yangilaganda

### ⚠️ Ma'lumotlar O'chib Ketishi Mumkin:

- ❌ Database faylini (`texnikum_erp.db`) o'chirib tashlasangiz
- ❌ Database'ni tozalab tashlasangiz
- ❌ Server'da database o'chib ketganda (backup yo'q bo'lsa)

---

## 💾 Backup Qilish

### Local Development:

```bash
# Database faylini nusxalash
copy backend\texnikum_erp.db backend\texnikum_erp_backup.db

# Yoki
cp backend/texnikum_erp.db backend/texnikum_erp_backup.db
```

### Production (Railway):

Railway avtomatik backup qiladi, lekin qo'lda ham qilishingiz mumkin:

```bash
# Database dump olish
pg_dump $DATABASE_URL > backup.sql
```

---

## 🔄 Database'ni Ko'rish

### SQLite Database'ni Ko'rish:

**1. SQLite Browser (GUI):**
- https://sqlitebrowser.org/ yuklab oling
- `backend/texnikum_erp.db` faylini oching
- Barcha jadvallarni ko'ring

**2. Terminal orqali:**
```bash
cd backend
python
>>> from app.database import SessionLocal
>>> from app.models.student import Student
>>> db = SessionLocal()
>>> students = db.query(Student).all()
>>> print([s.first_name for s in students])
```

---

## 📊 Ma'lumotlar Oqimi

```
Frontend (Browser)
    ↓
API Request (POST /api/students)
    ↓
Backend (FastAPI)
    ↓
Database (SQLite/PostgreSQL) ← Ma'lumotlar shu yerda saqlanadi!
```

---

## ✅ Xulosa

1. **Barcha ma'lumotlaringiz database'da saqlanadi**
2. **Local:** `backend/texnikum_erp.db` faylida
3. **Production:** Railway PostgreSQL'da
4. **Ma'lumotlar o'chib ketmaydi** (faylni o'chirmasangiz)
5. **Backup qilishni unutmang!**

---

## 🚀 Keyingi Qadamlar

1. **Backup qiling:** Database faylini nusxalang
2. **Server'ga deploy qiling:** Railway'ga deploy qilganda, ma'lumotlar cloud'da saqlanadi
3. **Regular backup:** Muntazam ravishda backup qiling

**Savol bo'lsa, ayting!** 😊

