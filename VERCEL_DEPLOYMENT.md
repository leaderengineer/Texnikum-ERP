# Vercel Deployment Guide - Frontend va Backend

## Muammo

Vercel serverless functions uchun mo'ljallangan va FastAPI backend'ni to'g'ridan-to'g'ri deploy qilish qiyin. Shuning uchun:

✅ **Yechim**: Backend'ni alohida platformaga (Railway/Render) deploy qilish
✅ Frontend'ni Vercel'ga deploy qilish
✅ Frontend'ni backend'ga environment variable orqali ulash

---

## Qadam 1: Backend'ni Railway'ga Deploy Qilish

### 1.1 Railway Account yaratish

1. https://railway.app/ ga kiring
2. GitHub bilan kirish (Sign in with GitHub)
3. "New Project" → "Deploy from GitHub repo"
4. `leaderengineer/Texnikum-ERP` repository'ni tanlang

### 1.2 PostgreSQL Database yaratish

1. **New Service** → **Database** → **Add PostgreSQL**
2. Railway avtomatik PostgreSQL database yaratadi

### 1.3 Backend Service yaratish

1. **New Service** → **GitHub Repo** → `leaderengineer/Texnikum-ERP` ni tanlang
2. **Settings** → **Root Directory**: `backend` ni tanlang

### 1.4 Environment Variables qo'shish

**Settings** → **Variables** bo'limida:

```env
# Database (Railway PostgreSQL avtomatik yaratadi)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Settings (o'zgartiring!)
SECRET_KEY=your-very-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS - Frontend URL'lar (Vercel domain'ingizni qo'shing)
CORS_ORIGINS=https://your-app-name.vercel.app,https://your-app-name-git-main.vercel.app,http://localhost:5173

# Server
HOST=0.0.0.0
PORT=$PORT
```

**Muhim**:
- `SECRET_KEY` ni yaxshi random string qiling:
  ```bash
  openssl rand -hex 32
  ```
- `CORS_ORIGINS` ga frontend Vercel URL'ingizni qo'shing

### 1.5 Build Settings

**Settings** → **Deploy**:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 1.6 Database Initialization

Deploy qilgandan keyin:

1. **Settings** → **Service** → **Shell** ochib:
   ```bash
   cd backend
   python init_db.py
   ```

2. Yoki Railway terminal'da:
   ```bash
   python backend/init_db.py
   ```

### 1.7 Backend URL olish

1. **Settings** → **Networking** → **Generate Domain**
2. Domain oling (masalan: `texnikum-erp-backend.railway.app`)
3. API URL: `https://texnikum-erp-backend.railway.app/api`

---

## Qadam 2: Frontend'ni Vercel'ga Deploy Qilish

### 2.1 Vercel Project yaratish

1. https://vercel.com/ ga kiring
2. GitHub bilan kirish
3. "Add New Project" → `leaderengineer/Texnikum-ERP` repository'ni tanlang

### 2.2 Build Settings

**Settings** → **Build & Development Settings**:

- **Framework Preset**: Vite
- **Root Directory**: (bo'sh qoldiring - frontend root'da)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Environment Variables qo'shish

**Settings** → **Environment Variables**:

```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**Muhim**: 
- `your-backend.railway.app` o'rniga Railway'dan olgan backend URL'ingizni yozing
- Har bir environment (Production, Preview, Development) uchun qo'shing

### 2.4 Deploy

1. "Deploy" tugmasini bosing
2. Vercel avtomatik build va deploy qiladi
3. Deploy qilgandan keyin frontend URL: `https://your-app-name.vercel.app`

---

## Qadam 3: Backend'da CORS sozlash

Frontend deploy qilgandan keyin, Railway'da backend environment variables'ni yangilang:

```env
CORS_ORIGINS=https://your-app-name.vercel.app,https://your-app-name-git-main.vercel.app,https://your-app-name-git-*-*.vercel.app,http://localhost:5173
```

Keyin backend'ni qayta deploy qiling.

---

## Qadam 4: Test Qilish

### 4.1 Backend Test

1. Backend URL'ni oching: `https://your-backend.railway.app/docs`
2. Swagger UI ochilishi kerak
3. `/health` endpoint'ni test qiling: `https://your-backend.railway.app/health`

### 4.2 Frontend Test

1. Frontend URL'ni oching: `https://your-app-name.vercel.app`
2. Login qilishga harakat qiling:
   - Email: `admin@example.com`
   - Parol: `admin123`

---

## Troubleshooting

### Backend ishlamayapti

1. Railway logs'ni tekshiring: **Deployments** → **View Logs**
2. Database connection'ni tekshiring
3. Environment variables to'g'ri ekanligini tekshiring

### Frontend backend'ga ulanmayapti

1. Browser console'ni oching (F12)
2. Network tab'da xatoliklarni tekshiring
3. `VITE_API_BASE_URL` to'g'ri ekanligini tekshiring
4. CORS xatosi bo'lsa, backend'da `CORS_ORIGINS` ni yangilang

### CORS xatosi

1. Backend'da `CORS_ORIGINS` ga frontend URL'ni qo'shing
2. Backend'ni qayta deploy qiling
3. Browser cache'ni tozalang (Ctrl+Shift+R)

---

## Alternative: Render Platform

Agar Railway ishlamasa, Render platform'dan ham foydalanishingiz mumkin:

1. https://render.com/ ga kiring
2. "New" → "Web Service"
3. GitHub repo'ni ulang
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## Summary

✅ **Backend**: Railway'da (yoki Render'da)
✅ **Frontend**: Vercel'da
✅ **Database**: Railway PostgreSQL
✅ **Connection**: Environment variable orqali

**Backend URL**: `https://your-backend.railway.app/api`
**Frontend URL**: `https://your-app-name.vercel.app`

**Test Login**:
- Admin: `admin@example.com` / `admin123`
- Teacher: `teacher@example.com` / `teacher123`

