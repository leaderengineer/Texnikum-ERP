# Texnikum ERP Tizimi

Texnikumlar uchun yaratilgan o'quv jarayonlarini boshqarish tizimi. Bu dastur yordamida talabalar, o'qituvchilar va ma'murlar barcha ishlarni bir joydan boshqarishlari mumkin.

## Bu tizim nima qiladi?

Bu tizim texnikumning barcha faoliyatini raqamlashtirishga yordam beradi. Qog'oz va daftarlardan foydalanishning o'rniga, hamma narsa kompyuterda va telefonlarda boshqariladi.

## Kimlar foydalanishi mumkin?

Tizimda 3 turdagi foydalanuvchilar bor:

1. **Admin (Ma'mur)** - Tizimning barcha qismlarini boshqaradi
2. **O'qituvchi** - Darslar, davomat va baholarni boshqaradi
3. **Talaba** - O'z natijalari va darslarini ko'radi

## Asosiy imkoniyatlar

### 📊 Dashboard (Asosiy sahifa)
- Barcha ma'lumotlarni bir ko'rinishda ko'rish
- Statistika va grafiklar (qancha talaba, o'qituvchi, darslar va h.k.)
- Oxirgi qilingan ishlarni ko'rish

### 👥 O'qituvchilar boshqaruvi
- O'qituvchilar ro'yxatini ko'rish
- Yangi o'qituvchi qo'shish
- O'qituvchi ma'lumotlarini o'zgartirish
- O'qituvchini o'chirish
- O'qituvchi profil rasmini o'zgartirish

### 🎓 Talabalar boshqaruvi
- Talabalar ro'yxatini ko'rish va qidirish
- Yangi talaba qo'shish
- Talaba ma'lumotlarini tahrirlash
- Talabani guruhga tayinlash
- Talabani o'chirish yoki faollashtirish

### 📚 Guruhlar va Yo'nalishlar
- Guruhlar ro'yxatini ko'rish (masalan: 1-kurs, 2-kurs)
- Yangi guruh yaratish
- Yo'nalishlar boshqaruvi (Kafedralar)
- Guruhlarga talabalar tayinlash

### 📅 Dars Jadvali
- Har bir guruh uchun dars jadvali yaratish
- Dars jadvalini ko'rish (qaysi kuni, qaysi vaqtda, qaysi fan)
- Dars jadvalini tahrirlash
- O'qituvchi va xona ma'lumotlarini kiritish

### ✅ Davomat Tizimi
- Talabalarning darsga qatnashishini belgilash
- Geolocation (GPS) orqali davomat olish (faqat muassasa hududida)
- Dars vaqtini tekshirish (faqat dars vaqtida davomat olish mumkin)
- Kunlik va oylik davomat statistikasi
- Davomat ma'lumotlarini Excel fayliga yuklab olish
- Qatnashgan va qatnashmagan talabalarni ko'rish

### 📖 Kutubxona Tizimi
- Kitoblar ro'yxatini ko'rish
- Yangi kitob qo'shish
- Talabaga kitob berish
- Kitobni qaytarish
- Qaysi talaba qaysi kitobni olganini kuzatish
- Qaytarish muddatini ko'rish

### 📄 Dars Materiallari
- Dars materiallarini yuklash (PDF, Word, PowerPoint fayllar)
- Materiallarni fanlar bo'yicha tartiblash
- Talabalar materiallarni yuklab olishi mumkin
- O'qituvchilar materiallarni yuklash va boshqarishi mumkin
- Yangi fanlar qo'shish (faqat admin)

### 📝 Baholash Tizimi
- Talabalarga baho berish
- Fanlar bo'yicha baholarni ko'rish
- Baholarni tahrirlash
- Statistika va o'rtacha baholarni hisoblash

### 📋 Imtihonlar (Testlar)
- Imtihonlar yaratish
- Savollar qo'shish
- Talabalar imtihon topshirishi mumkin
- Avtomatik baholash
- Imtihon natijalarini ko'rish

### 🔍 Audit Log (Harakatlar Tarixi)
- Tizimda kim, qachon, qanday o'zgarishlar qilganini ko'rish
- Barcha qilingan ishlarni kuzatish (qo'shish, o'zgartirish, o'chirish)
- Login va Logout ma'lumotlari
- Xavfsizlik va nazorat uchun

### ⚙️ Sozlamalar
- Muassasa ma'lumotlarini o'zgartirish
- Geolocation sozlamalari (GPS koordinatalari va radius)
- Xaritada muassasa joylashuvini belgilash
- Xaritada qidirish orqali joylashuvni topish

## Qanday ishlatiladi?

### O'qituvchi uchun:
1. Tizimga kirish (email va parol bilan)
2. Dars jadvalini ko'rish
3. Dars vaqtida davomat olish (faqat dars vaqtida)
4. Dars materiallarini yuklash
5. Talabalarga baho berish
6. Imtihonlar yaratish

### Talaba uchun:
1. Tizimga kirish
2. O'z dars jadvalini ko'rish
3. Dars materiallarini yuklab olish
4. O'z baholarini ko'rish
5. Imtihonlar topshirish
6. O'z profilini ko'rish

### Admin uchun:
1. Barcha bo'limlarni boshqarish
2. O'qituvchilar va talabalar qo'shish
3. Guruhlar va yo'nalishlar yaratish
4. Dars jadvalini tayyorlash
5. Kutubxonani boshqarish
6. Barcha statistikani ko'rish
7. Audit log orqali barcha ishlarni kuzatish

## Maxsus funksiyalar

### Geolocation (Joylashuv tekshiruvi)
- Davomat olishda GPS orqali muassasa joylashuvini tekshirish
- Faqat muassasa atrofida bo'lganda davomat olish mumkin
- Xaritada muassasa joylashuvini ko'rish va o'zgartirish

### Dark Mode (Qorong'i rejim)
- Tizim yorug' va qorong'i rejimda ishlaydi
- Foydalanuvchi o'z xohishiga ko'ra tanlaydi

### Responsive dizayn
- Kompyuterdan ham, telefondan ham ishlatish mumkin
- Barcha qurilmalarda qulay ko'rinadi

## Qanday o'rnatiladi?

### 1. Backend (Server qismi) o'rnatish:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python init_db.py
python run.py
```

Server `http://localhost:8000` da ishga tushadi.

### 2. Frontend (Veb qismi) o'rnatish:

```bash
npm install
npm run dev
```

Veb sahifa `http://localhost:5173` da ochiladi.

## Foydalanish uchun kerakli narsalar

1. **Python** - Backend ishlashi uchun
2. **Node.js** - Frontend ishlashi uchun
3. **Brauzer** - Veb sahifani ko'rish uchun (Chrome, Firefox, Edge)
4. **Internet** - Geolocation funksiyasi uchun

## Xavfsizlik

- Parollar xavfsiz tarzda saqlanadi
- Har bir foydalanuvchi o'z huquqlariga ega
- Barcha harakatlar kuzatiladi (Audit Log)
- JWT token orqali xavfsiz kirish

## Yordam

Muammo bo'lsa yoki savollar bo'lsa, loyiha issues bo'limiga yozing.

---

**Texnikum ERP** - Ta'limni raqamlashtirish orqali sizning texnikumingiz zamonaviy va samarali ishlaydi! 🚀
