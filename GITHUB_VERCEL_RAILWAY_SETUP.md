# GitHub → Vercel (Frontend) + Railway (Backend) Setup

## 🎯 Eng Qulay Workflow

**Frontend:** GitHub → Vercel (avtomatik deploy)  
**Backend:** GitHub → Railway (avtomatik deploy)

Bu kombinatsiya eng qulay, chunki:
- ✅ GitHub'dan avtomatik deploy
- ✅ Frontend va backend alohida
- ✅ Bepul tier'lar yetarli
- ✅ Custom domain oson

---

## 📋 Qadam-baqadam Qo'llanma

### 1. GitHub Repository Tuzilishi

Loyiha tuzilishi quyidagicha bo'lishi kerak:

```
Texnikum-ERP/
├── backend/          # Backend kodlari
│   ├── app/
│   ├── requirements.txt
│   ├── railway.json
│   └── ...
├── src/              # Frontend kodlari
├── package.json
├── vite.config.js
└── ...
```

---

### 2. Backend'ni Railway'ga Deploy Qilish

#### 2.1. Railway Account

1. https://railway.app/ ga kiring
2. "Start a New Project" → "Login with GitHub"
3. GitHub account'ingizni ulang

#### 2.2. Project Yaratish

1. Railway dashboard'da "New Project"
2. "Deploy from GitHub repo" ni tanlang
3. `Texnikum-ERP` repository'ni tanlang
4. Railway avtomatik detect qiladi

#### 2.3. Root Directory Sozlash

1. Settings → General → "Root Directory"
2. `backend` ni kiriting
3. Save

#### 2.4. PostgreSQL Database

1. Project dashboard'da "New" → "Database" → "Add PostgreSQL"
2. Database avtomatik yaratiladi
3. `DATABASE_URL` avtomatik qo'shiladi

#### 2.5. Environment Variables

Settings → Variables:

```env
# Database (avtomatik)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Vercel frontend URL)
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-git-main-your-username.vercel.app,http://localhost:5173

# Server
HOST=0.0.0.0
PORT=$PORT

# Database Pool
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_RECYCLE=3600

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=100
```

**Muhim:** `CORS_ORIGINS` ga Vercel URL'ini qo'shing (keyinroq)

#### 2.6. Build Settings

Settings → Build & Deploy:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Yoki `railway.json` avtomatik ishlatiladi.

#### 2.7. Deploy

Railway avtomatik deploy qiladi. Birinchi deploy 2-5 daqiqa.

#### 2.8. Backend URL Olish

1. Settings → Networking → "Generate Domain"
2. Domain oling (masalan: `texnikum-erp-backend.up.railway.app`)
3. Backend URL: `https://texnikum-erp-backend.up.railway.app`

**Yoki Custom Domain:**
1. Settings → Networking → "Custom Domain"
2. Domain'ingizni kiriting (masalan: `api.yourdomain.com`)

---

### 3. Frontend'ni Vercel'ga Deploy Qilish

#### 3.1. Vercel Account

1. https://vercel.com/ ga kiring
2. "Sign Up" → "Continue with GitHub"
3. GitHub account'ingizni ulang

#### 3.2. Project Import

1. Vercel dashboard'da "Add New..." → "Project"
2. `Texnikum-ERP` repository'ni tanlang
3. "Import" tugmasini bosing

#### 3.3. Project Settings

**Framework Preset:** Vite (yoki auto-detect)

**Root Directory:** `.` (root)

**Build Command:** `npm run build` (yoki `yarn build`)

**Output Directory:** `dist`

**Install Command:** `npm install` (yoki `yarn install`)

#### 3.4. Environment Variables

**Environment Variables** bo'limida:

```env
VITE_API_BASE_URL=https://texnikum-erp-backend.up.railway.app/api
```

**Yoki custom domain bo'lsa:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

#### 3.5. Deploy

1. "Deploy" tugmasini bosing
2. Vercel avtomatik build va deploy qiladi
3. Frontend URL oling (masalan: `texnikum-erp.vercel.app`)

---

### 4. CORS Sozlamalarini Yangilash

#### 4.1. Railway'da CORS Yangilash

Railway → Settings → Variables → `CORS_ORIGINS`:

```env
CORS_ORIGINS=https://texnikum-erp.vercel.app,https://texnikum-erp-git-main-your-username.vercel.app,http://localhost:5173
```

**Eslatma:** Vercel har bir branch uchun alohida URL yaratadi. Barcha URL'larni qo'shing.

#### 4.2. Redeploy

Railway avtomatik redeploy qiladi (environment variable o'zgarganda).

---

### 5. Database Migration

Railway'da terminal ochib:

```bash
cd backend
python -m alembic upgrade head
```

Yoki:

```bash
cd backend
python init_db.py
```

---

### 6. Test Qilish

#### Backend Test
```bash
curl https://texnikum-erp-backend.up.railway.app/health
```

#### Frontend Test
1. Vercel URL'ini oching
2. Login qiling
3. API so'rovlar ishlayotganini tekshiring

---

## 🔄 Avtomatik Deploy Workflow

### GitHub Push → Avtomatik Deploy

1. **GitHub'ga push qiling:**
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

2. **Railway avtomatik deploy qiladi:**
   - Backend o'zgarishlari → Railway deploy
   - 2-5 daqiqa

3. **Vercel avtomatik deploy qiladi:**
   - Frontend o'zgarishlari → Vercel deploy
   - 1-2 daqiqa

**Eslatma:** Har bir push avtomatik deploy'ni trigger qiladi.

---

## 🔧 Custom Domain Qo'shish

### Backend Domain (Railway)

1. Railway → Settings → Networking → "Custom Domain"
2. Domain kiriting: `api.yourdomain.com`
3. DNS sozlamalar:
   ```
   Type: CNAME
   Name: api
   Value: your-app.up.railway.app
   ```

### Frontend Domain (Vercel)

1. Vercel → Project → Settings → Domains
2. Domain kiriting: `yourdomain.com`
3. DNS sozlamalar (Vercel ko'rsatadi)

### Environment Variables Yangilash

**Vercel:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

**Railway:**
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 📊 Workflow Diagram

```
GitHub Repository
    │
    ├─── Frontend (src/) ────→ Vercel ────→ https://your-app.vercel.app
    │
    └─── Backend (backend/) ────→ Railway ────→ https://api.yourdomain.com
```

---

## 🎯 Eng Qulay Variantlar

### Variant 1: Railway (Tavsiya) ⭐

**Afzalliklari:**
- ✅ GitHub integration
- ✅ PostgreSQL bepul
- ✅ Sleep qilmaydi
- ✅ Custom domain bepul
- ✅ Avtomatik deploy

**Narxi:** Bepul ($5/oy kredit)

### Variant 2: Render

**Afzalliklari:**
- ✅ GitHub integration
- ✅ PostgreSQL (90 kun bepul)
- ⚠️ Sleep qiladi (free tier)

**Narxi:** Bepul (sleep bilan) yoki $7/oy

### Variant 3: Fly.io

**Afzalliklari:**
- ✅ GitHub integration
- ✅ PostgreSQL bepul
- ✅ Sleep qilmaydi
- ✅ Global CDN

**Narxi:** Bepul

---

## 🚀 Tezkor Start

### 1. Railway (5 daqiqa)

```bash
# 1. Railway'ga kiring
https://railway.app/

# 2. GitHub bilan sign up
# 3. New Project → Deploy from GitHub
# 4. Repository tanlang
# 5. Root Directory: backend
# 6. PostgreSQL qo'shing
# 7. Environment variables sozlang
# 8. Deploy!
```

### 2. Vercel (3 daqiqa)

```bash
# 1. Vercel'ga kiring
https://vercel.com/

# 2. GitHub bilan sign up
# 3. Add New Project
# 4. Repository tanlang
# 5. Environment variable: VITE_API_BASE_URL
# 6. Deploy!
```

---

## 📝 Checklist

- [ ] GitHub repository tayyor
- [ ] Railway account yaratildi
- [ ] Railway'da backend deploy qilindi
- [ ] PostgreSQL database qo'shildi
- [ ] Environment variables sozlandi
- [ ] Backend URL olindi
- [ ] Vercel account yaratildi
- [ ] Vercel'da frontend deploy qilindi
- [ ] VITE_API_BASE_URL sozlandi
- [ ] CORS_ORIGINS yangilandi
- [ ] Database migration qilindi
- [ ] Test qilindi

---

## 🎉 Xulosa

**Eng qulay workflow:**
1. GitHub'ga push qiling
2. Railway avtomatik backend deploy qiladi
3. Vercel avtomatik frontend deploy qiladi
4. Barchasi avtomatik! 🚀

**Yordam kerak bo'lsa, ayting!**

