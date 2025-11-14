# ⚡ Tezkor Deploy Qo'llanmasi

## 🎯 5 Daqiqada Deploy

### Backend (Railway) - 3 daqiqa

1. **Railway'ga kiring:** https://railway.app/
2. **GitHub bilan sign up**
3. **New Project** → **Deploy from GitHub repo**
4. **Repository tanlang:** `Texnikum-ERP`
5. **Root Directory:** `backend` ni tanlang
6. **PostgreSQL qo'shing:** New → Database → Add PostgreSQL
7. **Environment Variables:**
   ```env
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
   ```
8. **Deploy!** ✅

**Backend URL:** Railway → Settings → Networking → Generate Domain

---

### Frontend (Vercel) - 2 daqiqa

1. **Vercel'ga kiring:** https://vercel.com/
2. **GitHub bilan sign up**
3. **Add New Project**
4. **Repository tanlang:** `Texnikum-ERP`
5. **Environment Variable:**
   ```env
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```
6. **Deploy!** ✅

**Frontend URL:** Vercel dashboard'da ko'rsatiladi

---

## 🔄 Keyingi Push'lar

Har safar GitHub'ga push qilganda:
- ✅ Railway avtomatik backend deploy qiladi
- ✅ Vercel avtomatik frontend deploy qiladi

**Hech qanday qo'shimcha ish kerak emas!** 🚀

