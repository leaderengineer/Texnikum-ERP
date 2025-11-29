# 📊 Frontend'dan Qo'shilgan Ma'lumotlarni API Orqali Ko'rish

## ⚠️ MUHIM: Authentication Kerak!

**Ko'pchilik API endpoint'lar authentication (login) talab qiladi!**

---

## 🔐 1-qadam: Login Qilish

### Browser'da (Swagger UI):

1. **Swagger UI'ni oching:**
   ```
   http://localhost:8000/docs
   ```

2. **`/api/auth/login` endpoint'ini toping**

3. **"Try it out" tugmasini bosing**

4. **Ma'lumotlarni kiriting:**
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

5. **"Execute" tugmasini bosing**

6. **Response'dan `access_token` ni oling**

7. **Yuqoridagi "Authorize" tugmasini bosing**

8. **Token'ni kiriting:** `Bearer YOUR_TOKEN`

9. **Endi barcha endpoint'larni ishlatishingiz mumkin!**

---

## 📚 2-qadam: Talabalarni Ko'rish

### Swagger UI orqali:

1. **`/api/students` endpoint'ini toping**
2. **"Try it out" tugmasini bosing**
3. **"Execute" tugmasini bosing**
4. **Response'da barcha talabalar ko'rsatiladi**

### Browser'da to'g'ridan-to'g'ri:

**⚠️ Browser'da to'g'ridan-to'g'ri ko'rish mumkin emas, chunki authentication kerak!**

**Yechim:** Swagger UI yoki Postman ishlating.

---

## 🔧 3-qadam: Postman Orqali (Tavsiya)

### 1. Postman O'rnatish:

- https://www.postman.com/downloads/ yuklab oling

### 2. Login Qilish:

**Request:**
- **Method:** POST
- **URL:** `http://localhost:8000/api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  ...
}
```

### 3. Talabalarni Ko'rish:

**Request:**
- **Method:** GET
- **URL:** `http://localhost:8000/api/students`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN
  ```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "first_name": "Nodirbek",
      "last_name": "Toshpulatov",
      "student_id": "101",
      "email": "nodirbek0106303@gmail.com",
      "group": "AT-102",
      "department": "Data Science",
      "status": "active"
    },
    ...
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 20,
    ...
  }
}
```

---

## 🐍 4-qadam: Python Script Orqali

### test_api.py ishlatish:

```bash
cd backend
source venv/Scripts/activate
python test_api.py
```

Bu script:
- ✅ Avtomatik login qiladi
- ✅ Barcha ma'lumotlarni ko'rsatadi
- ✅ Frontend'dan qo'shilgan ma'lumotlarni ko'rsatadi

---

## 🌐 5-qadam: Browser Developer Tools Orqali

### Frontend'dan qo'shilgan ma'lumotlarni tekshirish:

1. **Frontend'ni oching:** `http://localhost:5173`

2. **F12 tugmasini bosing** (Developer Tools)

3. **Network tab'ini oching**

4. **Ma'lumot qo'shing** (masalan, yangi talaba)

5. **Network tab'da `POST /api/students` so'rovini toping**

6. **Response'ni ko'ring:**
   - Status: `200 OK` - Muvaffaqiyatli
   - Response body'da yangi talaba ma'lumotlari bo'lishi kerak

7. **Keyin `GET /api/students` so'rovini toping**

8. **Response'da yangi qo'shilgan talaba ko'rinishi kerak**

---

## 🔍 6-qadam: Database'dan To'g'ridan-To'g'ri

### Python Script:

```bash
cd backend
source venv/Scripts/activate
python view_database.py
```

Bu script:
- ✅ Database'dan to'g'ridan-to'g'ri ma'lumotlarni ko'rsatadi
- ✅ Server kerak emas
- ✅ Barcha ma'lumotlarni ko'rsatadi

---

## ⚠️ Muammo: Ma'lumotlar Ko'rinmayapti

### 1. Authentication Muammosi:

**Belgi:** `401 Unauthorized` xatolik

**Yechim:**
- Avval login qiling
- Token oling
- Har bir so'rovda token'ni yuboring

### 2. Ma'lumotlar Saqlanmayapti:

**Tekshirish:**
```bash
python view_database.py
```

Agar database'da ma'lumotlar yo'q bo'lsa, frontend'dan qo'shilgan ma'lumotlar saqlanmagan.

**Yechim:**
- Browser Developer Tools → Network tab
- `POST /api/students` so'rovini tekshiring
- Status `200 OK` bo'lishi kerak
- Agar xatolik bo'lsa, xatolik xabarni ko'ring

### 3. CORS Muammosi:

**Belgi:** Browser console'da CORS xatolik

**Yechim:**
- Backend `config.py` da `CORS_ORIGINS` ga frontend URL qo'shing
- Backend'ni qayta ishga tushiring

### 4. Server Ishlamayapti:

**Tekshirish:**
```bash
curl http://localhost:8000/health
```

**Yechim:**
- Backend server'ni ishga tushiring:
  ```bash
  cd backend
  source venv/Scripts/activate
  python run.py
  ```

---

## ✅ Tekshirish Checklist

- [ ] Backend server ishlayapti (`http://localhost:8000`)
- [ ] Login qildim va token oldim
- [ ] Swagger UI'da `/api/students` endpoint'ini test qildim
- [ ] Browser Developer Tools'da Network tab'ni tekshirdim
- [ ] `POST /api/students` so'rovi `200 OK` qaytardi
- [ ] `GET /api/students` so'rovida yangi talaba ko'rinadi
- [ ] `python view_database.py` orqali database'da ma'lumotlar borligini tekshirdim

---

## 🎯 Eng Qulay Usul

**Tavsiya:**

1. **Swagger UI** (`http://localhost:8000/docs`) - Interaktiv test
2. **Python Script** (`python test_api.py`) - Tezkor tekshirish
3. **Database Script** (`python view_database.py`) - To'g'ridan-to'g'ri ko'rish

---

## 📝 Misol: Yangi Talaba Qo'shish va Ko'rish

### 1. Frontend'dan qo'shish:

- Frontend'da yangi talaba qo'shing
- Browser Developer Tools → Network tab
- `POST /api/students` so'rovini ko'ring
- Status `200 OK` bo'lishi kerak

### 2. API orqali ko'rish:

**Swagger UI:**
1. `http://localhost:8000/docs` ga kiring
2. Login qiling (Authorize)
3. `/api/students` endpoint'ini test qiling
4. Yangi talaba ko'rinishi kerak

**Yoki Python Script:**
```bash
python test_api.py
```

**Yoki Database Script:**
```bash
python view_database.py
```

---

## 🚀 Tezkor Qo'llanma

### Ma'lumotlarni ko'rish:

```bash
# 1. Database'dan to'g'ridan-to'g'ri (eng oson)
cd backend
source venv/Scripts/activate
python view_database.py

# 2. API orqali (authentication kerak)
python test_api.py
```

### Swagger UI orqali:

1. `http://localhost:8000/docs` ga kiring
2. Login qiling
3. Endpoint'larni test qiling

---

**Savol bo'lsa, ayting!** 😊

