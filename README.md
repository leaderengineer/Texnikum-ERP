# Texnikum ERP

Zamonaviy Texnikum uchun ta'limga mo'ljallangan ERP tizimi.

## Texnologiyalar

- **Frontend**: React 19 + Vite
- **UI**: TailwindCSS + shadcn/ui style components
- **State Management**: Zustand
- **Routing**: React Router v6
- **Form Validation**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## O'rnatish

```bash
# Dependencies o'rnatish
npm install

# Development server ishga tushirish
npm run dev

# Production build yaratish
npm run build

# Build preview
npm run preview
```

## Konfiguratsiya

`.env.example` faylini `.env` ga ko'chiring va backend API URL ni kiriting:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Struktura

```
src/
├── components/          # Reusable komponentlar
│   ├── ui/            # UI komponentlar (Button, Input, Card, va h.k.)
│   ├── layout/        # Layout komponentlar (Sidebar, Header)
│   ├── auth/          # Authentication komponentlar
│   └── modals/        # Modal oynalar
├── pages/             # Sahifalar
│   ├── Login.jsx      # Kirish sahifasi
│   ├── Dashboard.jsx  # Dashboard
│   └── admin/         # Admin modullari
├── services/          # API servislar
├── store/             # State management (Zustand)
├── contexts/          # React Context API
├── lib/               # Utility funksiyalar
└── App.jsx            # Asosiy App komponenti
```

## Funksiyalar

### Autentifikatsiya
- Login/Logout
- Rol-asosidagi kirish (Admin, O'qituvchi)
- Sessiya saqlash (localStorage)

### Admin Panel
- **Dashboard**: Umumiy statistika va diagrammalar
- **O'qituvchilar**: CRUD operatsiyalari
- **Talabalar**: CRUD operatsiyalari
- **Dars jadvallari**: Yaratish, tahrirlash, ko'rish
- **Davomat**: Kunlik/oylik davomat boshqaruvi
- **Kutubxona**: Kitoblar boshqaruvi
- **Yo'nalishlar**: Kafedralar boshqaruvi
- **Audit log**: O'zgartirishlar tarixi

### O'qituvchi Panel
- Profil ko'rish va yangilash
- Davomatni belgilash
- Talabalar ro'yxatini ko'rish
- Dars jadvalini ko'rish

## Dizayn

- **Light/Dark mode**: Tugma orqali o'zgartirish
- **Responsive**: Mobil va desktop uchun optimallashtirilgan
- **Accessibility**: Keyboard navigation va semantic HTML
- **Performance**: Code-splitting va lazy-loading

## API Kontraktlar

Barcha API endpointlar `src/services/api.js` faylida belgilangan. Backend bilan bog'lanishda ushbu kontraktlardan foydalaning.

### Example Endpoints:
- `GET /api/teachers` - O'qituvchilar ro'yxati
- `POST /api/teachers` - Yangi o'qituvchi qo'shish
- `PUT /api/teachers/:id` - O'qituvchini yangilash
- `DELETE /api/teachers/:id` - O'qituvchini o'chirish

Hammasi uchun shu struktura kuzatiladi.

## Test Login

Development uchun:
- **Admin**: `admin@example.com` (istalgan parol, 6+ belgi)
- **O'qituvchi**: `teacher@example.com` (istalgan parol, 6+ belgi)

## Backend

Backend FastAPI asosida yaratilgan va `backend/` papkasida joylashgan.

### Backend o'rnatish

```bash
cd backend

# Virtual environment yaratish
python -m venv venv
venv\Scripts\activate  # Windows
# yoki
source venv/bin/activate  # Linux/Mac

# Dependencies o'rnatish
pip install -r requirements.txt

# Database initializatsiya
python init_db.py

# Server ishga tushirish
python run.py
```

Backend `http://localhost:8000` da ishga tushadi.

### API Dokumentatsiya

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Batafsil ma'lumot uchun `backend/README.md` ni ko'ring.

### Deployment

#### Backend Deployment (Railway)

Backend'ni Railway'da deploy qilish uchun `backend/DEPLOYMENT.md` ni ko'ring.

**Tezkor qadamlar:**
1. Railway'ga kirish va GitHub repo'ni ulash
2. PostgreSQL database qo'shish
3. Environment variables sozlash
4. Deploy!

API URL oling va frontend environment variable ga qo'shing:
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

#### Frontend Deployment (Vercel)

**MUHIM**: Vercel'da backend ishlamaydi! Backend'ni Railway'ga deploy qiling.

Frontend'ni Vercel'ga deploy qilish uchun `VERCEL_DEPLOYMENT.md` ni ko'ring.

**Tezkor qadamlar:**
1. Vercel'ga kirish va GitHub repo'ni ulash
2. Build settings sozlash (Vite)
3. Environment variable qo'shish: `VITE_API_BASE_URL=https://your-backend.railway.app/api`
4. Deploy!

**Batafsil qo'llanma**: `VERCEL_DEPLOYMENT.md` faylini ko'ring.

## Keyingi qadamlar

1. ✅ Backend API yaratish (FastAPI)
2. ✅ Haqiqiy authentication integratsiyasi
3. Real-time updates (WebSocket)
4. Fayl yuklash funksiyasi
5. Eksport/Import funksiyalari
6. Unit va E2E testlar

## Yordam

Savollar bo'lsa, loyiha issues bo'limiga yozing.