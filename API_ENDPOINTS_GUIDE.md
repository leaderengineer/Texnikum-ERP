# 🔗 API Endpoint'lar Qo'llanmasi

## ⚠️ Muhim Eslatma

`/api` o'zi endpoint emas! Quyidagi endpoint'larni ishlating:

---

## 📋 Barcha API Endpoint'lar

### 🔐 Authentication (`/api/auth`)

- **POST** `/api/auth/login` - Login qilish
- **POST** `/api/auth/logout` - Logout qilish
- **GET** `/api/auth/me` - Joriy foydalanuvchi ma'lumotlari
- **POST** `/api/auth/register` - Ro'yxatdan o'tish

### 📚 Talabalar (`/api/students`)

- **GET** `/api/students` - Barcha talabalar (pagination bilan)
- **GET** `/api/students/{id}` - Aniq talaba ma'lumotlari
- **POST** `/api/students` - Yangi talaba qo'shish
- **PUT** `/api/students/{id}` - Talaba ma'lumotlarini yangilash
- **DELETE** `/api/students/{id}` - Talabani o'chirish
- **GET** `/api/students/group/{group}` - Guruh bo'yicha talabalar

### 👨‍🏫 O'qituvchilar (`/api/teachers`)

- **GET** `/api/teachers` - Barcha o'qituvchilar (pagination bilan)
- **GET** `/api/teachers/{id}` - Aniq o'qituvchi ma'lumotlari
- **POST** `/api/teachers` - Yangi o'qituvchi qo'shish
- **PUT** `/api/teachers/{id}` - O'qituvchi ma'lumotlarini yangilash
- **DELETE** `/api/teachers/{id}` - O'qituvchini o'chirish

### 👥 Guruhlar (`/api/groups`)

- **GET** `/api/groups` - Barcha guruhlar
- **GET** `/api/groups/{id}` - Aniq guruh ma'lumotlari
- **POST** `/api/groups` - Yangi guruh qo'shish
- **PUT** `/api/groups/{id}` - Guruh ma'lumotlarini yangilash
- **DELETE** `/api/groups/{id}` - Guruhni o'chirish

### 🏛️ Yo'nalishlar (`/api/departments`)

- **GET** `/api/departments` - Barcha yo'nalishlar
- **GET** `/api/departments/{id}` - Aniq yo'nalish ma'lumotlari
- **POST** `/api/departments` - Yangi yo'nalish qo'shish
- **PUT** `/api/departments/{id}` - Yo'nalish ma'lumotlarini yangilash
- **DELETE** `/api/departments/{id}` - Yo'nalishni o'chirish

### 📅 Dars Jadvali (`/api/schedules`)

- **GET** `/api/schedules` - Barcha dars jadvallari
- **GET** `/api/schedules/{id}` - Aniq dars ma'lumotlari
- **POST** `/api/schedules` - Yangi dars qo'shish
- **PUT** `/api/schedules/{id}` - Dars ma'lumotlarini yangilash
- **DELETE** `/api/schedules/{id}` - Darsni o'chirish
- **GET** `/api/schedules/group/{group}` - Guruh bo'yicha darslar

### ✅ Davomat (`/api/attendance`)

- **GET** `/api/attendance` - Barcha davomat yozuvlari
- **GET** `/api/attendance/{id}` - Aniq davomat ma'lumotlari
- **POST** `/api/attendance` - Yangi davomat yozuvi qo'shish
- **PUT** `/api/attendance/{id}` - Davomat ma'lumotlarini yangilash
- **DELETE** `/api/attendance/{id}` - Davomat yozuvini o'chirish

### 📖 Kitoblar (`/api/books`)

- **GET** `/api/books` - Barcha kitoblar
- **GET** `/api/books/{id}` - Aniq kitob ma'lumotlari
- **POST** `/api/books` - Yangi kitob qo'shish
- **PUT** `/api/books/{id}` - Kitob ma'lumotlarini yangilash
- **DELETE** `/api/books/{id}` - Kitobni o'chirish

### 📊 Dashboard (`/api/dashboard`)

- **GET** `/api/dashboard/stats` - Umumiy statistika
- **GET** `/api/dashboard/attendance` - Davomat statistikasi

### 📝 Audit Logs (`/api/audit-logs`)

- **GET** `/api/audit-logs` - Barcha audit loglar

---

## 🌐 Asosiy Endpoint'lar

### Root
- **GET** `/` - API haqida ma'lumot

### API Info
- **GET** `/api` - Barcha endpoint'lar ro'yxati

### Health Check
- **GET** `/health` - Server holati

### Documentation
- **GET** `/docs` - Swagger UI (interaktiv API documentation)
- **GET** `/redoc` - ReDoc (alternativ documentation)

---

## 🔍 Qanday Ishlatish?

### 1. Swagger UI (Tavsiya etiladi) ⭐

Browser'da oching:
```
http://localhost:8000/docs
```

Bu yerda:
- ✅ Barcha endpoint'larni ko'rishingiz mumkin
- ✅ Har bir endpoint'ni test qilishingiz mumkin
- ✅ Ma'lumotlarni ko'rishingiz mumkin
- ✅ API so'rovlar yuborishingiz mumkin

### 2. API Info Endpoint

Browser'da oching:
```
http://localhost:8000/api
```

Bu yerda barcha endpoint'lar ro'yxati ko'rsatiladi.

### 3. ReDoc

Browser'da oching:
```
http://localhost:8000/redoc
```

---

## 📝 Misollar

### 1. Talabalarni ko'rish:

```bash
# Browser'da
http://localhost:8000/api/students

# Yoki curl orqali
curl http://localhost:8000/api/students
```

**Eslatma:** Ko'pchilik endpoint'lar authentication kerak!

### 2. Login qilish:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### 3. Talabalarni ko'rish (token bilan):

```bash
curl http://localhost:8000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Xatoliklar

### "Not Found" xatolik

**Sabab:** Endpoint noto'g'ri yozilgan.

**Yechim:** 
- To'g'ri endpoint'ni ishlating (yuqoridagi ro'yxatdan)
- Yoki `/docs` ga kiring va interaktiv test qiling

### "401 Unauthorized" xatolik

**Sabab:** Authentication kerak.

**Yechim:**
1. Avval login qiling: `/api/auth/login`
2. Token oling
3. Har bir so'rovda token'ni yuboring:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

### "404 Not Found" `/api` uchun

**Yechim:** Endi `/api` endpoint'i mavjud! Qayta tekshiring:
```
http://localhost:8000/api
```

---

## 🎯 Eng Qulay Usul

**Tavsiya:** Swagger UI ishlating:
```
http://localhost:8000/docs
```

Bu yerda barcha endpoint'larni ko'rishingiz va test qilishingiz mumkin!

---

## ✅ Checklist

- [ ] Backend server ishlayapti (`http://localhost:8000`)
- [ ] `/docs` ga kirib, Swagger UI'ni ko'rdim
- [ ] `/api` endpoint'ini tekshirdim
- [ ] Login qildim va token oldim
- [ ] API so'rovlar yubordim

**Savol bo'lsa, ayting!** 😊

