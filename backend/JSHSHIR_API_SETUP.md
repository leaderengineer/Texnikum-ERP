# JSHSHIR API Integratsiyasi Sozlash

## Qadamlar

### 1. Environment Variables Sozlash

`.env` fayliga quyidagilarni qo'shing:

```env
# JSHSHIR API sozlamalari
JSHSHIR_API_ENABLED=true
JSHSHIR_API_URL=https://api.fuqarolik.uz/v1
JSHSHIR_API_KEY=your_api_key_here
JSHSHIR_API_TIMEOUT=10
```

### 2. API Kalit Olish

O'zbekiston Respublikasi Fuqarolik holati davlat xizmatlaridan API kalit olish:

1. [my.gov.uz](https://my.gov.uz) saytiga kirish
2. Developer portal'ga kirish
3. API kalit so'rovi yuborish
4. Kalitni olish va `.env` fayliga qo'yish

**Yoki** boshqa rasmiy JSHSHIR API provayderidan kalit olish.

### 3. API Endpoint'ni Tekshirish

`backend/app/utils/jshshir.py` faylida `fetch_from_real_api` funksiyasini haqiqiy API strukturasiga moslashtirish:

```python
# API endpoint (bu endpoint'ni haqiqiy API dokumentatsiyasiga qarab o'zgartirish kerak)
endpoint = f"{api_url}/jshshir/{jshshir}"

# Agar endpoint boshqacha bo'lsa:
# endpoint = f"{api_url}/api/v1/person/{jshshir}"
# endpoint = f"{api_url}/citizen/{jshshir}"
```

### 4. API Response Formatini Moslashtirish

Haqiqiy API javobining formatiga qarab, `fetch_from_real_api` funksiyasidagi response parsing qismini o'zgartirish:

```python
# Haqiqiy API strukturasiga qarab o'zgartirish
return {
    'first_name': data.get('first_name') or data.get('firstName') or '',
    'last_name': data.get('last_name') or data.get('lastName') or '',
    # ... boshqa fieldlar
}
```

### 5. Test Qilish

1. Backend server'ni ishga tushiring
2. Browser'da frontend'ni oching
3. O'qituvchi qo'shish sahifasiga o'ting
4. JSHSHIR raqamini kiriting
5. "Qidirish" tugmasini bosing
6. Ma'lumotlar avtomatik to'ldirilishi kerak

## API Struktura Misollari

### Misol 1: Standard API Response

```json
{
  "success": true,
  "data": {
    "first_name": "Aziz",
    "last_name": "Karimov",
    "middle_name": "Akmalovich",
    "birth_date": "1990-01-15",
    "gender": "male",
    "address": "Toshkent shahri, Yunusobod tumani",
    "region": "Toshkent shahri",
    "district": "Yunusobod tumani",
    "phone": "+998901234567",
    "email": ""
  }
}
```

### Misol 2: Nested Response

```json
{
  "status": "ok",
  "person": {
    "personalInfo": {
      "firstName": "Aziz",
      "lastName": "Karimov",
      "middleName": "Akmalovich"
    },
    "birthInfo": {
      "date": "1990-01-15"
    },
    "contactInfo": {
      "phone": "+998901234567",
      "address": "Toshkent shahri"
    }
  }
}
```

## Xatoliklar

### "requests moduli topilmadi"
```bash
pip install requests
```

### "API xatolik: 401"
- API kalit noto'g'ri yoki eskirgan
- `.env` faylida `JSHSHIR_API_KEY` ni tekshiring

### "API xatolik: 404"
- API endpoint noto'g'ri
- `JSHSHIR_API_URL` ni tekshiring

### "API xatolik: 403"
- API kalit ruxsatsiz
- API provider'ga murojaat qiling

## Alternative API Provider'lar

Agar rasmiy API mavjud bo'lmasa, quyidagi alternativlarni ko'rib chiqing:

1. **Local Database** - O'zingizning database'ingizda JSHSHIR ma'lumotlarini saqlash
2. **Third-party API** - Ishontirli uchinchi tomon API provider'lar
3. **Manual Entry** - Qo'lda kiritish (hozirgi holat)

## Production Deployment

Production'da quyidagilarni tekshiring:

1. ✅ API kalit xavfsiz saqlanmoqdami (environment variables)
2. ✅ API timeout moslashtirilganmi
3. ✅ Error handling to'g'ri ishlayaptimi
4. ✅ Logging qo'shilganmi
5. ✅ Rate limiting bormi (agar kerak bo'lsa)

