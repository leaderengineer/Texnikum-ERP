# Backend Deployment - Railway

Railway'da backend'ni deploy qilish uchun qo'llanma.

## Railway Deployment

### 1. Railway'ga kirish

1. https://railway.app/ ga kiring
2. "Start a New Project" ni tanlang
3. "Deploy from GitHub repo" ni tanlang
4. GitHub account'ingizni ulang
5. `leaderengineer/Texnikum-ERP` repository'ni tanlang

### 2. Project sozlash

1. **New Service** → **Database** → **Add PostgreSQL** (Database yaratish)
2. **New Service** → **GitHub Repo** → `leaderengineer/Texnikum-ERP` ni tanlang

### 3. Environment Variables

**Settings** → **Variables** bo'limida quyidagi o'zgaruvchilarni qo'shing:

```env
# Database (Railway PostgreSQL avtomatik yaratadi)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Settings
SECRET_KEY=your-very-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Frontend URL'lar)
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173

# Server
HOST=0.0.0.0
PORT=$PORT
```

**Muhim**: 
- `DATABASE_URL` ni Railway PostgreSQL service'idan olishingiz kerak
- `SECRET_KEY` ni yaxshi random string qiling (masalan: `openssl rand -hex 32`)
- `CORS_ORIGINS` ga frontend URL'ingizni qo'shing

### 4. Build Settings

**Settings** → **Build & Deploy**:

- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 5. Database Initialization

Deploy qilgandan keyin, **Settings** → **Deployments** → **Deploy Logs** ni ochib, database initializatsiya qilish:

**Deploy logs** ichida terminal ochib:
```bash
python init_db.py
```

Yoki Railway'da **Settings** → **Service** → **Shell** ochib:
```bash
cd backend
python init_db.py
```

### 6. Deploy

Railway avtomatik deploy qiladi. Birinchi marta deploy qilganda:

1. **Deploy Logs** ni kuzatib turing
2. Xatoliklar bo'lsa, environment variables ni tekshiring
3. Database connection'ni tekshiring

### 7. API URL olish

Deploy qilgandan keyin:

1. **Settings** → **Networking** → **Generate Domain**
2. Domain oling (masalan: `texnikum-erp-backend.railway.app`)
3. API URL: `https://texnikum-erp-backend.railway.app/api`

### 8. Frontend bilan bog'lash

Frontend `.env` faylida:
```env
VITE_API_BASE_URL=https://texnikum-erp-backend.railway.app/api
```

### 9. API Dokumentatsiya

Deploy qilgandan keyin:
- **Swagger UI**: `https://your-domain.railway.app/docs`
- **ReDoc**: `https://your-domain.railway.app/redoc`

## Test Login

Database initializatsiya qilgandan keyin:
- **Admin**: `admin@example.com` / `admin123`
- **Teacher**: `teacher@example.com` / `teacher123`

## Troubleshooting

### Database connection xatosi

1. PostgreSQL service mavjudligini tekshiring
2. `DATABASE_URL` to'g'ri ekanligini tekshiring
3. Railway'da database service'ni qayta ishga tushiring

### Build xatosi

1. `requirements.txt` da barcha dependencies borligini tekshiring
2. Python version to'g'ri ekanligini tekshiring (3.11+)
3. Build logs'ni batafsil ko'rib chiqing

### CORS xatosi

1. Frontend URL'ni `CORS_ORIGINS` ga qo'shing
2. `http://localhost:5173` ni ham qo'shing (development uchun)

## Monitoring

Railway'da:
- **Metrics** - Server metrics
- **Logs** - Real-time logs
- **Deployments** - Deployment history

## Support

Muammo bo'lsa:
1. Railway logs'ni tekshiring
2. API endpoint'larni test qiling
3. Database connection'ni tekshiring

