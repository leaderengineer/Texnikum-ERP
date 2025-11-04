"""
JSHSHIR raqamini parse qilish va ma'lumotlarni chiqarish
JSHSHIR formati: YYMMDDSSSSSS (14 xona)
- YYMMDD: Tug'ilgan sana (YY-MM-DD)
- S: Jins (7-raqam: toq = erkak, juft = ayol)
- SSSSSS: Seriya va tartib raqamlari
"""

from typing import Optional, Dict
from datetime import datetime, date
import os
import logging

logger = logging.getLogger(__name__)


def parse_jshshir(jshshir: str) -> Dict:
    """
    JSHSHIR raqamini parse qilish va ma'lumotlarni qaytarish
    
    Args:
        jshshir: 14 xonali JSHSHIR raqami
        
    Returns:
        Dict with parsed information:
        - birth_date: datetime.date
        - gender: str ('male' or 'female')
        - birth_year: int
        - birth_month: int
        - birth_day: int
        - region_code: str (8-9 raqamlar)
    """
    if not jshshir or len(jshshir) != 14 or not jshshir.isdigit():
        raise ValueError("JSHSHIR raqami 14 xonali raqam bo'lishi kerak")
    
    # Tug'ilgan sana (birinchi 6 ta raqam: YYMMDD)
    year_str = jshshir[0:2]
    month_str = jshshir[2:4]
    day_str = jshshir[4:6]
    
    # 20-asr yoki 21-asr?
    year = int(year_str)
    # Yilni aniqlash: 00-30 -> 2000-2030, 31-99 -> 1931-1999
    if year <= 30:
        full_year = 2000 + year
    else:
        full_year = 1900 + year
    
    month = int(month_str)
    day = int(day_str)
    
    # Sana to'g'riligini tekshirish
    # Agar sana noto'g'ri bo'lsa, warning bilan davom etish
    birth_date = None
    date_valid = False
    date_error = None
    
    try:
        # Oy va kun to'g'riligini tekshirish
        if month < 1 or month > 12:
            date_error = f"Oy noto'g'ri: {month}"
        elif day < 1 or day > 31:
            date_error = f"Kun noto'g'ri: {day}"
        else:
            # Sana yaratishga harakat qilish
            try:
                birth_date = date(full_year, month, day)
                date_valid = True
            except ValueError as e:
                date_error = f"Noto'g'ri tug'ilgan sana: {day:02d}.{month:02d}.{full_year}"
    except Exception as e:
        date_error = f"Sana parse qilishda xatolik: {str(e)}"
    
    # Agar sana noto'g'ri bo'lsa, default sana yoki 1-yanvar qo'yish
    if not date_valid or not birth_date:
        # Default sana sifatida 1-yanvar qo'yamiz
        try:
            birth_date = date(full_year, 1, 1)
        except:
            # Agar yil ham noto'g'ri bo'lsa, 2000-yil qo'yamiz
            birth_date = date(2000, 1, 1)
            full_year = 2000
            month = 1
            day = 1
    
    # Jins (7-raqam: toq = erkak, juft = ayol)
    gender_digit = int(jshshir[6])
    gender = 'male' if gender_digit % 2 == 1 else 'female'
    
    # Viloyat kodi (8-9 raqamlar)
    region_code = jshshir[7:9]
    
    return {
        'birth_date': birth_date,
        'birth_year': full_year,
        'birth_month': month,
        'birth_day': day,
        'gender': gender,
        'region_code': region_code,
        'jshshir': jshshir,
        'date_valid': date_valid,
        'date_error': date_error,
    }


def fetch_from_real_api(jshshir: str) -> Optional[Dict]:
    """
    Haqiqiy API'dan JSHSHIR ma'lumotlarini olish
    
    Args:
        jshshir: 14 xonali JSHSHIR raqami
        
    Returns:
        Dict with person information yoki None (agar xatolik bo'lsa)
    """
    try:
        from app.config import settings
        import requests
        
        if not settings.JSHSHIR_API_ENABLED:
            return None
        
        api_url = settings.JSHSHIR_API_URL
        api_key = settings.JSHSHIR_API_KEY
        timeout = settings.JSHSHIR_API_TIMEOUT
        
        # API endpoint (bu endpoint'ni haqiqiy API dokumentatsiyasiga qarab o'zgartirish kerak)
        endpoint = f"{api_url}/jshshir/{jshshir}"
        
        headers = {
            "Content-Type": "application/json",
        }
        
        # API kalit kerak bo'lsa
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
            # yoki boshqa format: headers["X-API-Key"] = api_key
        
        # API so'rovi
        response = requests.get(
            endpoint,
            headers=headers,
            timeout=timeout
        )
        
        # Muvaffaqiyatli javob
        if response.status_code == 200:
            data = response.json()
            
            # API javobini formatlash (API strukturasiga qarab o'zgartirish kerak)
            # Bu misol - haqiqiy API strukturasiga moslashtirish kerak
            return {
                'first_name': data.get('first_name') or data.get('firstName') or data.get('name') or '',
                'last_name': data.get('last_name') or data.get('lastName') or data.get('surname') or '',
                'middle_name': data.get('middle_name') or data.get('middleName') or data.get('patronymic') or '',
                'address': data.get('address') or data.get('full_address') or '',
                'region': data.get('region') or data.get('region_name') or '',
                'district': data.get('district') or data.get('tuman') or '',
                'phone': data.get('phone') or data.get('phone_number') or '',
                'email': data.get('email') or '',
            }
        else:
            logger.warning(f"JSHSHIR API xatolik: {response.status_code} - {response.text}")
            return None
            
    except ImportError:
        logger.warning("requests moduli topilmadi. pip install requests qiling.")
        return None
    except Exception as e:
        logger.error(f"JSHSHIR API so'rovida xatolik: {str(e)}")
        return None


def get_person_info_by_jshshir(jshshir: str) -> Dict:
    """
    JSHSHIR raqami bo'yicha shaxs ma'lumotlarini olish
    Avval haqiqiy API'dan urinib ko'radi, agar mavjud bo'lmasa yoki xatolik bo'lsa,
    JSHSHIR raqamidan chiqarilgan ma'lumotlarni qaytaradi.
    
    Args:
        jshshir: 14 xonali JSHSHIR raqami
        
    Returns:
        Dict with person information:
        - first_name: str
        - last_name: str
        - middle_name: Optional[str]
        - birth_date: date
        - gender: str
        - address: str
        - region: str
        - district: str
    """
    # JSHSHIR raqamini parse qilish
    parsed = parse_jshshir(jshshir)
    
    # JSHSHIR raqamidan chiqarilgan ma'lumotlar
    birth_date = parsed['birth_date']
    gender = parsed['gender']
    region_code = parsed['region_code']
    date_valid = parsed.get('date_valid', True)
    date_error = parsed.get('date_error')
    
    # Haqiqiy API'dan ma'lumotlarni olishga harakat qilish
    api_data = fetch_from_real_api(jshshir)
    
    # Region kodlari (demo)
    regions = {
        '01': 'Toshkent shahri',
        '02': 'Toshkent viloyati',
        '03': 'Andijon viloyati',
        '04': 'Farg\'ona viloyati',
        '05': 'Namangan viloyati',
        '06': 'Samarqand viloyati',
        '07': 'Buxoro viloyati',
        '08': 'Xorazm viloyati',
        '09': 'Surxondaryo viloyati',
        '10': 'Qashqadaryo viloyati',
        '11': 'Jizzax viloyati',
        '12': 'Sirdaryo viloyati',
        '13': 'Navoiy viloyati',
        '14': 'Qoraqalpog\'iston Respublikasi',
    }
    
    region_name = regions.get(region_code, 'Noma\'lum viloyat')
    
    # ==========================================
    # DEMO MODE: Haqiqiy API integratsiyasi uchun bu qismni o'zgartirish kerak
    # ==========================================
    # Haqiqiy API integratsiyasi uchun quyidagicha ishlatish mumkin:
    # 
    # import requests
    # API_URL = "https://api.fuqarolik.uz/v1/jshshir"
    # API_KEY = os.getenv("JSHSHIR_API_KEY")
    # response = requests.get(f"{API_URL}/{jshshir}", headers={"Authorization": f"Bearer {API_KEY}"})
    # person_data = response.json()
    #
    # Lekin hozircha demo ma'lumotlar qaytariladi
    # ==========================================
    
    # Demo ma'lumotlar (JSHSHIR raqamidan chiqarilgan asosiy ma'lumotlar)
    # Haqiqiy ism, familiya, manzil ma'lumotlari API'dan keladi
    # Bu yerda faqat JSHSHIR raqamidan chiqarilgan ma'lumotlar qaytariladi
    
    # Haqiqiy API ma'lumotlarini birlashtirish
    first_name = api_data.get('first_name', '') if api_data else ''
    last_name = api_data.get('last_name', '') if api_data else ''
    middle_name = api_data.get('middle_name', '') if api_data else ''
    api_address = api_data.get('address', '') if api_data else ''
    api_region = api_data.get('region', '') if api_data else ''
    api_district = api_data.get('district', '') if api_data else ''
    api_phone = api_data.get('phone', '') if api_data else ''
    api_email = api_data.get('email', '') if api_data else ''
    
    # Agar API'dan region kelgan bo'lsa, uni ishlatamiz, aks holda JSHSHIR'dan chiqarilganini
    final_region = api_region or region_name
    final_address = api_address or final_region
    
    # Sana haqida eslatma
    note_parts = []
    if api_data:
        note_parts.append("Ma'lumotlar haqiqiy API'dan olindi.")
    else:
        if not date_valid and date_error:
            note_parts.append(f"Diqqat: {date_error}. JSHSHIR raqamidan chiqarilgan sana noto'g'ri bo'lishi mumkin.")
        note_parts.append("Haqiqiy API integratsiyasi o'rnatilmagan yoki ishlamayapti. JSHSHIR raqamidan chiqarilgan ma'lumotlar ko'rsatilmoqda.")
    
    return {
        'first_name': first_name,
        'last_name': last_name,
        'middle_name': middle_name,
        'birth_date': birth_date.strftime('%Y-%m-%d'),  # Format: YYYY-MM-DD
        'birth_year': parsed['birth_year'],
        'birth_month': parsed['birth_month'],
        'birth_day': parsed['birth_day'],
        'birth_date_formatted': birth_date.strftime('%d.%m.%Y'),  # Format: DD.MM.YYYY
        'gender': gender,
        'gender_uz': 'Erkak' if gender == 'male' else 'Ayol',
        'region_code': region_code,
        'region': final_region,
        'address': final_address,
        'district': api_district,
        'phone': api_phone,
        'email': api_email,
        'jshshir': jshshir,
        'date_valid': date_valid,
        'date_error': date_error,
        'api_enabled': api_data is not None,
        'note': ' '.join(note_parts),
    }

