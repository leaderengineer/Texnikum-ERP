# Deployment Guide - Vercel Frontend + Railway Backend

## Muammo va Yechim

❌ **Muammo**: Vercel'da backend ishlamaydi, chunki:
- Vercel serverless functions uchun mo'ljallangan
- FastAPI backend doimiy server talab qiladi
- Database (PostgreSQL) kerak

✅ **Yechim**: 
- **Backend**: Railway yoki Render'ga deploy qilish
- **Frontend**: Vercel'ga deploy qilish
- **Connection**: Environment variable orqali

---

## Quick Start

### 1️⃣ Backend'ni Railway'ga Deploy Qilish

1. https://railway.app/ → GitHub bilan kirish
2. "New Project" → "Deploy from GitHub repo"
3. Repository'ni tanlang: `leaderengineer/Texnikum-ERP`
4. **New Service** → **Database** → **Add PostgreSQL**
5. **New Service** → **GitHub Repo** → Repository'ni tanlang
6. **Settings** → **Root Directory**: `backend`

**Environment Variables** (Settings → Variables):
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-secret-key-min-32-chars
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

**Build Settings**:
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Database Initialization**:
```bash
python backend/init_db.py
```

**Backend URL olish**: Settings → Networking → Generate Domain

---

### 2️⃣ Frontend'ni Vercel'ga Deploy Qilish

1. https://vercel.com/ → GitHub bilan kirish
2. "Add New Project" → Repository'ni tanlang
3. **Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

**Environment Variable** (Settings → Environment Variables):
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**Deploy**: Vercel avtomatik deploy qiladi

---

### 3️⃣ CORS Sozlash

Frontend deploy qilgandan keyin, Railway'da backend environment variable'ni yangilang:

```env
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app,http://localhost:5173
```

Backend'ni qayta deploy qiling.

---

## Test Login

- **Admin**: `admin@example.com` / `admin123`
- **Teacher**: `teacher@example.com` / `teacher123`

---

## Batafsil Qo'llanma

`VERCEL_DEPLOYMENT.md` faylini ko'ring.

