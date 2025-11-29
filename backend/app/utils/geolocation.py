"""
Geolocation utility functions for attendance validation
"""
import math


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Ikki nuqta orasidagi masofani metrlarda hisoblaydi (Haversine formula)
    
    Args:
        lat1: Birinchi nuqtaning kengligi
        lon1: Birinchi nuqtaning uzunligi
        lat2: Ikkinchi nuqtaning kengligi
        lon2: Ikkinchi nuqtaning uzunligi
    
    Returns:
        Masofa metrlarda
    """
    # Yer radiusi metrlarda
    R = 6371000  # 6371 km = 6371000 m
    
    # Radianlarga o'tkazish
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    # Masofa metrlarda
    distance = R * c
    
    return distance


def is_within_radius(
    user_lat: float,
    user_lon: float,
    institution_lat: float,
    institution_lon: float,
    radius_meters: float
) -> bool:
    """
    Foydalanuvchi belgilangan radius ichida ekanligini tekshiradi
    
    Args:
        user_lat: Foydalanuvchining kengligi
        user_lon: Foydalanuvchining uzunligi
        institution_lat: Institution kengligi
        institution_lon: Institution uzunligi
        radius_meters: Radius metrlarda
    
    Returns:
        True agar radius ichida bo'lsa, False aks holda
    """
    if not all([user_lat, user_lon, institution_lat, institution_lon, radius_meters]):
        return False
    
    distance = calculate_distance(user_lat, user_lon, institution_lat, institution_lon)
    return distance <= radius_meters

