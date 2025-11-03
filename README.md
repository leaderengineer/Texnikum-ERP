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

## Keyingi qadamlar

1. Backend API yaratish (Node.js/Express yoki boshqa)
2. Haqiqiy authentication integratsiyasi
3. Real-time updates (WebSocket)
4. Fayl yuklash funksiyasi
5. Eksport/Import funksiyalari
6. Unit va E2E testlar

## Yordam

Savollar bo'lsa, loyiha issues bo'limiga yozing.