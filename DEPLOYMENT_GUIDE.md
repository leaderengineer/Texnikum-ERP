# Backend Deployment Qo'llanmasi

## 🆓 Bepul Hosting Variantlar (Tavsiya etiladi)

### 1. **Railway** ⭐ (ENG TAVSIYA ETILADI)

**Afzalliklari:**
- ✅ **To'liq bepul** - $5 kredit har oy (yetarli)
- ✅ **PostgreSQL database** bepul
- ✅ **Automatic HTTPS** (SSL sertifikat)
- ✅ **Custom domain** qo'shish bepul
- ✅ **GitHub integration** - avtomatik deploy
- ✅ **Environment variables** oson sozlash
- ✅ **Logs** va monitoring
- ✅ **Sleep qilmaydi** (24/7 ishlaydi)

**Narxi:** Bepul (har oy $5 kredit)

**Qo'shish:**
1. https://railway.app/ ga kiring
2. GitHub bilan sign up qiling
3. "New Project" → "Deploy from GitHub repo"
4. Repository'ni tanlang
5. PostgreSQL database qo'shing
6. Environment variables sozlang

**Domain qo'shish:**
1. Settings → Domains → "Custom Domain"
2. Domain'ingizni kiriting
3. DNS sozlamalarini qiling (CNAME yoki A record)

---

### 2. **Render** ⭐ (Ikkinchi tavsiya)

**Afzalliklari:**
- ✅ **Bepul tier** mavjud
- ✅ **PostgreSQL** bepul (90 kun, keyin to'lov)
- ✅ **Automatic HTTPS**
- ✅ **Custom domain**
- ✅ **Sleep qiladi** (15 daqiqada uyg'onadi)

**Kamchiliklari:**
- ⚠️ Free tier'da sleep qiladi (15 daqiqada uyg'onadi)
- ⚠️ PostgreSQL 90 kundan keyin pullik bo'ladi

**Narxi:** Bepul (sleep bilan) yoki $7/oy (sleep yo'q)

**Qo'shish:**
1. https://render.com/ ga kiring
2. GitHub bilan sign up
3. "New Web Service"
4. Repository'ni tanlang
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

### 3. **Fly.io** ⭐ (Tez va yaxshi)

**Afzalliklari:**
- ✅ **Bepul tier** - 3 shared-cpu-1x VM
- ✅ **PostgreSQL** bepul (3GB storage)
- ✅ **Global CDN** - tez
- ✅ **Custom domain**
- ✅ **Sleep qilmaydi**

**Narxi:** Bepul (3 VM, 3GB storage)

**Qo'shish:**
1. https://fly.io/ ga kiring
2. CLI o'rnating: `curl -L https://fly.io/install.sh | sh`
3. `fly auth signup`
4. `fly launch` (loyiha papkasida)
5. PostgreSQL: `fly postgres create`

---

### 4. **Koyeb** (Yangi, yaxshi)

**Afzalliklari:**
- ✅ **To'liq bepul**
- ✅ **Sleep qilmaydi**
- ✅ **PostgreSQL** mavjud
- ✅ **Custom domain**

**Narxi:** Bepul

**Qo'shish:**
1. https://www.koyeb.com/ ga kiring
2. GitHub bilan sign up
3. "Create App" → GitHub repo tanlang

---

## 💰 Pullik Hosting Variantlar (Production uchun)

### 1. **DigitalOcean** ⭐ (Eng arzon va sifatli)

**Afzalliklari:**
- ✅ **$6/oy** dan boshlanadi (Droplet)
- ✅ **SSD storage**
- ✅ **99.99% uptime**
- ✅ **Global datacenters**
- ✅ **Managed PostgreSQL** ($15/oy)
- ✅ **Custom domain**

**Narxi:** $6-12/oy (Droplet) + $15/oy (PostgreSQL)

**Qo'shish:**
1. https://www.digitalocean.com/ ga kiring
2. Droplet yarating (Ubuntu 22.04)
3. PostgreSQL o'rnating yoki Managed Database qo'shing

---

### 2. **Vultr** (Arzon va tez)

**Afzalliklari:**
- ✅ **$2.50/oy** dan boshlanadi
- ✅ **SSD storage**
- ✅ **Global datacenters**
- ✅ **Custom domain**

**Narxi:** $2.50-6/oy

**Qo'shish:**
1. https://www.vultr.com/ ga kiring
2. Server yarating
3. PostgreSQL o'rnating

---

### 3. **Linode** (Akamai orqali)

**Afzalliklari:**
- ✅ **$5/oy** dan boshlanadi
- ✅ **Akamai CDN** (tez)
- ✅ **99.99% uptime**
- ✅ **Custom domain**

**Narxi:** $5-10/oy

---

### 4. **AWS Lightsail** (Amazon)

**Afzalliklari:**
- ✅ **$3.50/oy** dan boshlanadi
- ✅ **AWS infrastructure**
- ✅ **Custom domain**

**Narxi:** $3.50-10/oy

---

## 🎯 O'zbekiston uchun Tavsiya

### Boshlanish uchun (Bepul):
1. **Railway** - eng yaxshi bepul variant
2. **Fly.io** - tez va bepul
3. **Render** - oson, lekin sleep qiladi

### Production uchun (Pullik):
1. **DigitalOcean** - $6/oy, sifatli
2. **Vultr** - $2.50/oy, arzon
3. **Linode** - $5/oy, Akamai CDN

---

## 📋 Domain Qo'shish Qo'llanmasi

### 1. Domain sotib olish

**O'zbekistonda:**
- https://reg.uz/ - .uz domainlar
- https://www.nic.uz/ - rasmiy registrar

**Xalqaro:**
- https://namecheap.com/ - arzon ($8-15/yil)
- https://cloudflare.com/ - bepul DNS + arzon domain
- https://porkbun.com/ - juda arzon

### 2. Domain'ni serverga ulash

**Railway uchun:**
1. Railway dashboard → Settings → Domains
2. "Custom Domain" → domain'ingizni kiriting
3. DNS sozlamalar:
   - **CNAME**: `your-domain.com` → `your-app.railway.app`
   - **A Record**: `@` → Railway IP (agar CNAME ishlamasa)

**Render uchun:**
1. Render dashboard → Settings → Custom Domains
2. Domain'ingizni kiriting
3. DNS sozlamalar:
   - **CNAME**: `your-domain.com` → `your-app.onrender.com`

**Fly.io uchun:**
1. `fly certs add your-domain.com`
2. DNS sozlamalar:
   - **A Record**: `@` → Fly.io IP
   - **CNAME**: `www` → `your-app.fly.dev`

---

## 🚀 Railway'da Deploy Qilish (Bepul)

### 1. Railway'ga kirish
```bash
# https://railway.app/ ga kiring
# GitHub bilan sign up qiling
```

### 2. Project yaratish
1. "New Project" → "Deploy from GitHub repo"
2. Repository'ni tanlang
3. Root Directory: `backend` ni tanlang

### 3. PostgreSQL Database qo'shish
1. "New" → "Database" → "Add PostgreSQL"
2. Database avtomatik yaratiladi
3. `DATABASE_URL` environment variable avtomatik qo'shiladi

### 4. Environment Variables
Settings → Variables bo'limida quyidagilarni qo'shing:

```env
# Database (avtomatik qo'shiladi)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
SECRET_KEY=your-very-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173

# Server
PORT=$PORT
HOST=0.0.0.0

# Database Pool
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_RECYCLE=3600

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=100
```

### 5. Build Settings
Settings → Build & Deploy:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 6. Deploy
Railway avtomatik deploy qiladi. Birinchi deploy 2-3 daqiqa davom etadi.

### 7. Domain qo'shish
1. Settings → Domains → "Custom Domain"
2. Domain'ingizni kiriting (masalan: `api.yourdomain.com`)
3. DNS sozlamalar:
   - **CNAME**: `api` → `your-app.up.railway.app`

---

## 🔧 Production Sozlamalari

### 1. Environment Variables (Production)
```env
# Production'da SECRET_KEY ni o'zgartiring!
SECRET_KEY=$(openssl rand -hex 32)  # Linux/Mac
# yoki https://randomkeygen.com/ dan oling

# CORS - faqat production domain'lar
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database Pool (katta miqyos uchun)
DB_POOL_SIZE=50
DB_MAX_OVERFLOW=100
```

### 2. Database Migration
Railway'da terminal ochib:
```bash
cd backend
alembic upgrade head
```

### 3. Health Check
```bash
curl https://your-api-domain.com/health
```

---

## 📊 Xizmatlar Taqqoslash

| Xizmat | Narx | Sleep | PostgreSQL | Custom Domain | Tavsiya |
|--------|------|-------|------------|---------------|---------|
| **Railway** | Bepul ($5/oy) | ❌ | ✅ Bepul | ✅ | ⭐⭐⭐⭐⭐ |
| **Fly.io** | Bepul | ❌ | ✅ Bepul | ✅ | ⭐⭐⭐⭐⭐ |
| **Render** | Bepul | ✅ (15 min) | ⚠️ 90 kun | ✅ | ⭐⭐⭐⭐ |
| **Koyeb** | Bepul | ❌ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **DigitalOcean** | $6/oy | ❌ | $15/oy | ✅ | ⭐⭐⭐⭐⭐ |
| **Vultr** | $2.50/oy | ❌ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Linode** | $5/oy | ❌ | ✅ | ✅ | ⭐⭐⭐⭐ |

---

## 🎯 Final Tavsiya

### Boshlanish uchun:
1. **Railway** - bepul, sleep qilmaydi, PostgreSQL bepul
2. **Fly.io** - bepul, tez, global CDN

### Production uchun:
1. **DigitalOcean** - $6/oy, sifatli, 99.99% uptime
2. **Vultr** - $2.50/oy, arzon

### Domain:
1. **Cloudflare** - bepul DNS + arzon domain
2. **Namecheap** - arzon domain ($8-15/yil)

---

## 📝 Keyingi Qadamlar

1. Railway yoki Fly.io'da account yarating
2. Repository'ni deploy qiling
3. PostgreSQL database qo'shing
4. Environment variables sozlang
5. Domain sotib oling va ulang
6. Test qiling

**Yordam kerak bo'lsa, ayting!** 🚀
