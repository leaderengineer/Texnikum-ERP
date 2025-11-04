# JSHSHIR Auto-Fill Integration

## Tushuntirish

JSHSHIR (Jismoniy shaxs shaxsiy identifikatsiya raqami) bo'yicha avtomatik ma'lumot to'ldirish funksiyasi qo'shildi. Bu funksiya yangi o'qituvchi qo'shishda JSHSHIR raqamini kiritganda, ma'lumotlarni avtomatik to'ldirishga yordam beradi.

## Qanday ishlaydi?

### 1. JSHSHIR raqami format
- JSHSHIR raqami **14 xonali raqam** bo'lishi kerak
- Format: `YYMMDDSSSSSS`
  - `YYMMDD`: Tug'ilgan sana (YY-MM-DD)
  - `S`: Jins (7-raqam: toq = erkak, juft = ayol)
  - `SSSSSS`: Seriya va tartib raqamlari

### 2. JSHSHIR raqamidan chiqariladigan ma'lumotlar

**Avtomatik chiqariladigan ma'lumotlar:**
- ✅ Tug'ilgan sana (YY-MM-DD formatida)
- ✅ Tug'ilgan yil, oy, kun
- ✅ Jins (Erkak/Ayol)
- ✅ Viloyat kodi va nomi

**Haqiqiy API integratsiyasi kerak bo'lgan ma'lumotlar:**
- ❌ Ism (first_name)
- ❌ Familiya (last_name)
- ❌ Otasining ismi (middle_name)
- ❌ To'liq manzil (address)
- ❌ Tuman (district)

## Hozirgi holat (Demo Mode)

Hozircha funksiya **demo mode**da ishlaydi. Bu quyidagilarni anglatadi:

1. JSHSHIR raqamidan tug'ilgan sana, jins va viloyat ma'lumotlari avtomatik chiqariladi
2. Ism, familiya va manzil ma'lumotlari **bo'sh** qaytariladi (hozircha)
3. Foydalanuvchiga demo xabar ko'rsatiladi

## Haqiqiy API integratsiyasi

### O'zbekiston Respublikasi Fuqarolik holati davlat xizmatlari API'si

Haqiqiy API integratsiyasi uchun quyidagi qadamlarni bajarishingiz kerak:

1. **API kalit olish** - O'zbekiston Respublikasi Fuqarolik holati davlat xizmatlaridan API kalit olish
2. **Backend'ni yangilash** - `backend/app/utils/jshshir.py` faylida `get_person_info_by_jshshir` funksiyasini o'zgartirish

#### Misol integratsiya kodi:

```python
import requests
import os

def get_person_info_by_jshshir(jshshir: str) -> Dict:
    """
    Haqiqiy API integratsiyasi
    """
    # JSHSHIR raqamini parse qilish
    parsed = parse_jshshir(jshshir)
    
    # API so'rovi
    API_URL = os.getenv("JSHSHIR_API_URL", "https://api.fuqarolik.uz/v1/jshshir")
    API_KEY = os.getenv("JSHSHIR_API_KEY")
    
    try:
        response = requests.get(
            f"{API_URL}/{jshshir}",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        response.raise_for_status()
        
        api_data = response.json()
        
        # API ma'lumotlarini birlashtirish
        return {
            'first_name': api_data.get('first_name', ''),
            'last_name': api_data.get('last_name', ''),
            'middle_name': api_data.get('middle_name', ''),
            'birth_date': parsed['birth_date'].strftime('%Y-%m-%d'),
            'birth_year': parsed['birth_year'],
            'birth_month': parsed['birth_month'],
            'birth_day': parsed['birth_day'],
            'gender': parsed['gender'],
            'gender_uz': 'Erkak' if parsed['gender'] == 'male' else 'Ayol',
            'region_code': parsed['region_code'],
            'region': api_data.get('region', ''),
            'address': api_data.get('address', ''),
            'district': api_data.get('district', ''),
            'jshshir': jshshir,
        }
    except requests.exceptions.RequestException as e:
        # Xatolik bo'lsa, faqat JSHSHIR raqamidan chiqarilgan ma'lumotlarni qaytarish
        return {
            'first_name': '',
            'last_name': '',
            'middle_name': '',
            'birth_date': parsed['birth_date'].strftime('%Y-%m-%d'),
            'birth_year': parsed['birth_year'],
            'birth_month': parsed['birth_month'],
            'birth_day': parsed['birth_day'],
            'gender': parsed['gender'],
            'gender_uz': 'Erkak' if parsed['gender'] == 'male' else 'Ayol',
            'region_code': parsed['region_code'],
            'region': regions.get(parsed['region_code'], 'Noma\'lum viloyat'),
            'address': '',
            'district': '',
            'jshshir': jshshir,
            'error': f'API xatolik: {str(e)}',
        }
```

### Environment variables

`.env` fayliga quyidagilarni qo'shing:

```env
JSHSHIR_API_URL=https://api.fuqarolik.uz/v1/jshshir
JSHSHIR_API_KEY=your_api_key_here
```

## Frontend'da ishlatish

1. **Yangi o'qituvchi qo'shish** sahifasiga o'ting
2. **JSHSHIR raqami** maydoniga 14 xonali raqam kiriting
3. **"Qidirish"** tugmasini bosing yoki **Enter** tugmasini bosing
4. Agar ma'lumotlar topilsa, form avtomatik to'ldiriladi
5. Agar ism va familiya bo'sh bo'lsa, demo xabar ko'rsatiladi va qo'lda kiritishingiz kerak

## API Endpoints

### GET `/api/teachers/jshshir/{jshshir}`

JSHSHIR raqami bo'yicha shaxs ma'lumotlarini olish.

**Parameters:**
- `jshshir` (path): 14 xonali JSHSHIR raqami

**Response:**
```json
{
  "success": true,
  "data": {
    "first_name": "",
    "last_name": "",
    "middle_name": "",
    "birth_date": "1990-01-15",
    "birth_year": 1990,
    "birth_month": 1,
    "birth_day": 15,
    "birth_date_formatted": "15.01.1990",
    "gender": "male",
    "gender_uz": "Erkak",
    "region_code": "01",
    "region": "Toshkent shahri",
    "address": "Toshkent shahri",
    "district": "",
    "jshshir": "12345678901234",
    "note": "Bu demo ma'lumotlar. Haqiqiy ism, familiya va manzil ma'lumotlari uchun API integratsiyasi kerak."
  }
}
```

## Foydalanish misollari

### Misol JSHSHIR raqamlari (test uchun)

**Eslatma:** Bu demo raqamlar. Haqiqiy JSHSHIR raqamlari ishlatilmaydi.

- `9001151234567` - 1990-yil 15-yanvar, Erkak
- `9505208765432` - 1995-yil 20-may, Ayol
- `8801011122334` - 1988-yil 1-yanvar, Erkak

## Xatoliklar

### "JSHSHIR raqami 14 xonali raqam bo'lishi kerak"
- JSHSHIR raqami aniq 14 xonali bo'lishi kerak
- Faqat raqamlar qabul qilinadi

### "Noto'g'ri tug'ilgan sana"
- JSHSHIR raqamidagi sana noto'g'ri formatda
- Masalan: 32-kun, 13-oy kabi noto'g'ri sana

### "JSHSHIR bo'yicha ma'lumot topilmadi"
- Backend server bilan ulanishda muammo
- Yoki API xatolik

## Keyingi qadamlar

1. Haqiqiy API integratsiyasini qo'shish
2. JSHSHIR raqamini database'da saqlash (optional)
3. Tug'ilgan sana va manzil fieldlarini forma'ga qo'shish (optional)
4. Xatoliklarni yaxshiroq boshqarish

## Foydali havolalar

- [O'zbekiston Respublikasi Fuqarolik holati davlat xizmatlari](https://my.gov.uz/)
- JSHSHIR raqami haqida ma'lumot

