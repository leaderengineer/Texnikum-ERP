# Backend va Frontend Integratsiya Qo'llanmasi

## Umumiy ko'rinish

Loyiha backend va frontend to'liq integratsiya qilingan. Barcha sahifalar backend API bilan bog'langan.

## Sozlash

### 1. Backend ishga tushirish

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python run.py
```

Backend `http://localhost:8000` da ishga tushadi.

### 2. Frontend sozlash

`.env` faylini yarating:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Frontend ishga tushirish

```bash
npm install
npm run dev
```

Frontend `http://localhost:5173` da ishga tushadi.

## Integratsiya qilingan sahifalar

### ✅ Login (`src/pages/Login.jsx`)
- Backend authentication API bilan bog'langan
- JWT token saqlanadi
- User ma'lumotlari store'ga yoziladi

### ✅ Dashboard (`src/pages/Dashboard.jsx`)
- Statistika ma'lumotlari backend'dan olinadi
- Charts real-time data bilan ishlaydi

### ✅ Teachers (`src/pages/admin/Teachers.jsx`)
- CRUD operatsiyalari backend bilan bog'langan
- Create, Read, Update, Delete

### ✅ Students (`src/pages/admin/Students.jsx`)
- CRUD operatsiyalari backend bilan bog'langan
- Create, Read, Update, Delete

### ✅ Departments (`src/pages/admin/Departments.jsx`)
- CRUD operatsiyalari backend bilan bog'langan
- Create, Read, Update, Delete

### ✅ Schedules (`src/pages/admin/Schedules.jsx`)
- CRUD operatsiyalari backend bilan bog'langan
- Create, Read, Update, Delete

### ✅ Attendance (`src/pages/admin/Attendance.jsx`)
- Attendance ma'lumotlari backend'dan olinadi
- Save va Export funksiyalari ishlaydi

### ✅ Library (`src/pages/admin/Library.jsx`)
- Books CRUD operatsiyalari
- Read, Download, Borrow funksiyalari

### ✅ Audit Logs (`src/pages/admin/AuditLogs.jsx`)
- Real-time log updates (har 30 soniyada)
- Backend API bilan bog'langan

## API Endpoints

Barcha API endpoint'lar `src/services/api.js` da belgilangan:

- `authAPI` - Authentication
- `teachersAPI` - Teachers CRUD
- `studentsAPI` - Students CRUD
- `departmentsAPI` - Departments CRUD
- `schedulesAPI` - Schedules CRUD
- `attendanceAPI` - Attendance CRUD
- `libraryAPI` - Books CRUD
- `dashboardAPI` - Dashboard statistics
- `auditAPI` - Audit logs

## Data Format Conversion

Frontend va backend o'rtasida format o'zgarishi:

### Backend → Frontend
- `first_name` → `firstName`
- `last_name` → `lastName`
- `is_active` → `status: 'active' | 'inactive'`
- `created_at` → `timestamp`

### Frontend → Backend
- `firstName` → `first_name`
- `lastName` → `last_name`
- `status: 'active'` → `is_active: true`

## Xatoliklar bilan ishlash

Barcha API call'lar try-catch bloklarida:
- Xatoliklar console'ga yoziladi
- User'ga alert ko'rsatiladi
- Fallback to mock data (agar kerak bo'lsa)

## Test Login

Database initializatsiya qilgandan keyin:
- **Admin**: `admin@example.com` / `admin123`
- **Teacher**: `teacher@example.com` / `teacher123`

## Keyingi qadamlar

1. Error handling yaxshilash
2. Loading states yaxshilash
3. Optimistic updates
4. Cache management
5. Real-time updates (WebSocket)

