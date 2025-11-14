# Railway'da Backend Deploy Qilish - Qadam-baqadam Qo'llanma

## 🚀 Boshlanish

### 1. Railway Account Yaratish

1. https://railway.app/ ga kiring
2. "Start a New Project" tugmasini bosing
3. "Login with GitHub" ni tanlang
4. GitHub account'ingizni ulang va ruxsat bering

---

### 2. Project Yaratish

1. Railway dashboard'da "New Project" tugmasini bosing
2. "Deploy from GitHub repo" ni tanlang
3. Repository'ingizni tanlang (Texnikum-ERP)
4. Railway avtomatik detect qiladi va deploy boshlaydi

---

### 3. Root Directory Sozlash

1. Project'ni oching
2. Settings → General → "Root Directory"
3. `backend` ni kiriting
4. "Save" tugmasini bosing

---

### 4. PostgreSQL Database Qo'shish

1. Project dashboard'da "New" tugmasini bosing
2. "Database" → "Add PostgreSQL" ni tanlang
3. Database avtomatik yaratiladi va `DATABASE_URL` environment variable qo'shiladi

**Muhim:** Database service nomini yodda tuting (masalan: `Postgres`)

---

### 5. Environment Variables Sozlash

Settings → Variables bo'limida quyidagilarni qo'shing:

#### Database (Avtomatik)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
**Eslatma:** `Postgres` o'rniga sizning database service nomingizni yozing.

#### JWT Settings
```env
SECRET_KEY=your-very-secret-key-min-32-chars-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**SECRET_KEY yaratish:**
- Linux/Mac: `openssl rand -hex 32`
- Windows: PowerShell'da: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
- Yoki: https://randomkeygen.com/ dan oling

#### CORS Settings
```env
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173,http://localhost:5174
```

**Production'da:** Faqat production frontend URL'larini qo'shing.

#### Server Settings
```env
HOST=0.0.0.0
PORT=$PORT
```

#### Database Pool Settings
```env
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_RECYCLE=3600
```

#### Rate Limiting
```env
API_RATE_LIMIT_PER_MINUTE=100
```

---

### 6. Build Settings

Settings → Build & Deploy:

- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Yoki `railway.json` fayli avtomatik ishlatiladi.

---

### 7. Deploy

1. Railway avtomatik deploy qiladi
2. Deploy Logs'ni kuzatib turing
3. Agar xatolik bo'lsa, logs'ni ko'rib chiqing

**Birinchi deploy 2-5 daqiqa davom etadi.**

---

### 8. Database Migration

Deploy qilgandan keyin:

1. Settings → Service → "Shell" ni oching
2. Quyidagi komandalarni bajaring:

```bash
cd backend
python -m alembic upgrade head
```

Yoki agar `init_db.py` fayli bo'lsa:

```bash
cd backend
python init_db.py
```

---

### 9. Domain Olish

#### Railway Domain (Bepul)

1. Settings → Networking → "Generate Domain"
2. Domain oling (masalan: `texnikum-erp-production.up.railway.app`)
3. Bu domain avtomatik HTTPS bilan ishlaydi

#### Custom Domain Qo'shish

1. Settings → Networking → "Custom Domain"
2. Domain'ingizni kiriting (masalan: `api.yourdomain.com`)
3. DNS sozlamalarini qiling:

**DNS Sozlamalari:**

**Variant 1: CNAME (Tavsiya)**
```
Type: CNAME
Name: api (yoki @)
Value: your-app.up.railway.app
TTL: 3600
```

**Variant 2: A Record**
```
Type: A
Name: api (yoki @)
Value: Railway IP (Railway dashboard'da ko'rsatiladi)
TTL: 3600
```

**Eslatma:** DNS o'zgarishlari 5-30 daqiqada kuchga kiradi.

---

### 10. Test Qilish

#### Health Check
```bash
curl https://your-domain.railway.app/health
```

Javob:
```json
{"status": "healthy"}
```

#### API Docs
- Swagger: `https://your-domain.railway.app/docs`
- ReDoc: `https://your-domain.railway.app/redoc`

#### API Test
```bash
curl https://your-domain.railway.app/api/
```

---

### 11. Frontend'ni Ulash

Frontend `.env` faylida:

```env
VITE_API_BASE_URL=https://your-domain.railway.app/api
```

Yoki production'da:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 🔧 Troubleshooting

### Database Connection Xatosi

**Muammo:** `could not connect to server`

**Yechim:**
1. PostgreSQL service ishlamoqda ekanligini tekshiring
2. `DATABASE_URL` to'g'ri ekanligini tekshiring
3. Database service'ni qayta ishga tushiring

### Build Xatosi

**Muammo:** `pip install` xatosi

**Yechim:**
1. `requirements.txt` da barcha dependencies borligini tekshiring
2. Python version 3.11+ ekanligini tekshiring
3. Build logs'ni batafsil ko'rib chiqing

### CORS Xatosi

**Muammo:** `CORS policy blocked`

**Yechim:**
1. Frontend URL'ni `CORS_ORIGINS` ga qo'shing
2. `http://localhost:5173` ni ham qo'shing (development uchun)
3. Environment variables'ni qayta deploy qiling

### Port Xatosi

**Muammo:** `Port already in use`

**Yechim:**
1. `PORT=$PORT` environment variable qo'shildi ekanligini tekshiring
2. Start command'da `--port $PORT` ishlatilganligini tekshiring

---

## 📊 Monitoring

Railway dashboard'da:

- **Metrics** - CPU, Memory, Network usage
- **Logs** - Real-time application logs
- **Deployments** - Deployment history
- **Settings** - Environment variables, domains

---

## 💰 Narx

**Bepul Tier:**
- $5 kredit har oy
- PostgreSQL database bepul
- Custom domain bepul
- Sleep qilmaydi (24/7 ishlaydi)

**Pullik Tier:**
- $5/oy dan boshlanadi
- Ko'proq resurslar
- Ko'proq bandwidth

---

## 🎯 Keyingi Qadamlar

1. ✅ Railway'da account yarating
2. ✅ Repository'ni deploy qiling
3. ✅ PostgreSQL database qo'shing
4. ✅ Environment variables sozlang
5. ✅ Domain qo'shing
6. ✅ Test qiling
7. ✅ Frontend'ni ulang

**Muvaffaqiyatlar!** 🚀

