"""
JSHSHIR raqamini parse qilish va ma'lumotlarni chiqarish
JSHSHIR formati: YYMMDDSSSSSS (14 xona)
- YYMMDD: Tug'ilgan sana (YY-MM-DD)
- S: Jins (7-raqam: toq = erkak, juft = ayol)
- SSSSSS: Seriya va tartib raqamlari
"""

from typing import Optional, Dict
from datetime import datetime, date


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
    if year <= 30:  # 30 yoshgacha bo'lsa 2000+, aks holda 1900+
        full_year = 2000 + year
    else:
        full_year = 1900 + year
    
    month = int(month_str)
    day = int(day_str)
    
    # Sana to'g'riligini tekshirish
    try:
        birth_date = date(full_year, month, day)
    except ValueError:
        raise ValueError(f"Noto'g'ri tug'ilgan sana: {day:02d}.{month:02d}.{full_year}")
    
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
    }


def get_person_info_by_jshshir(jshshir: str) -> Dict:
    """
    JSHSHIR raqami bo'yicha shaxs ma'lumotlarini olish
    (Demo/Mock funksiya - haqiqiy API integratsiyasi uchun o'zgartirish kerak)
    
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
    
    # Demo ma'lumotlar (Haqiqiy API integratsiyasi uchun bu yerda tashqi API'ga so'rov yuborish kerak)
    # Masalan: O'zbekiston Respublikasi Fuqarolik holati davlat xizmatlari API'siga
    
    # JSHSHIR raqamidan chiqarilgan ma'lumotlar
    birth_date = parsed['birth_date']
    gender = parsed['gender']
    region_code = parsed['region_code']
    
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
    
    return {
        'first_name': '',  # Haqiqiy API'dan keladi (hozircha bo'sh)
        'last_name': '',   # Haqiqiy API'dan keladi (hozircha bo'sh)
        'middle_name': '',  # Haqiqiy API'dan keladi (hozircha bo'sh)
        'birth_date': birth_date.strftime('%Y-%m-%d'),  # Format: YYYY-MM-DD
        'birth_year': parsed['birth_year'],
        'birth_month': parsed['birth_month'],
        'birth_day': parsed['birth_day'],
        'birth_date_formatted': birth_date.strftime('%d.%m.%Y'),  # Format: DD.MM.YYYY
        'gender': gender,
        'gender_uz': 'Erkak' if gender == 'male' else 'Ayol',
        'region_code': region_code,
        'region': region_name,
        'address': f'{region_name}',  # Haqiqiy API'dan keladi (hozircha faqat viloyat)
        'district': '',  # Haqiqiy API'dan keladi (hozircha bo'sh)
        'jshshir': jshshir,
        'note': 'Bu demo ma\'lumotlar. Haqiqiy ism, familiya va manzil ma\'lumotlari uchun API integratsiyasi kerak.',
    }

