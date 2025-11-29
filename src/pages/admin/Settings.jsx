import { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Camera,
  Search
} from 'lucide-react';
import { LocationMap } from '../../components/map/LocationMap';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import useAuthStore from '../../store/authStore';
import { institutionsAPI, authAPI, uploadAPI } from '../../services/api';
import CryptoJS from 'crypto-js';

export function Settings() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  
  // Institution ma'lumotlari
  const [institution, setInstitution] = useState(null);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('500');
  const [mapsLink, setMapsLink] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  
  // Akkaunt sozlamalari
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Geolocation olish - haqiqiy GPS koordinatalarini olish uchun
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation qo\'llab-quvvatlanmaydi'));
        return;
      }

      console.log('Geolocation API chaqirilmoqda... GPS yoqilganligini tekshiring.');

      // watchPosition dan foydalanish - bu real-time GPS koordinatalarini oladi
      // Birinchi marta aniq koordinatalar olinganda, watchPosition'ni to'xtatamiz
      let watchId = null;
      let timeoutId = null;
      let bestPosition = null;
      let attempts = 0;
      const maxAttempts = 10; // 10 marta urinish - ko'proq vaqt beramiz
      const targetAccuracy = 100; // 100 metr aniqlik yetarli
      const maxAcceptableAccuracy = 5000; // 5 km - buning yuqorisi IP-based location

      const cleanup = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // Timeout - 30 soniyadan keyin eng yaxshi koordinatalarni qaytarish
      timeoutId = setTimeout(() => {
        cleanup();
        if (bestPosition) {
          const accuracy = bestPosition.coords.accuracy || Infinity;
          console.log('Geolocation timeout - eng yaxshi koordinatalar qaytarilmoqda:', {
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: accuracy,
          });
          
          // Accuracy tekshiruvi - agar accuracy juda past bo'lsa ham, koordinatalarni qaytarish
          // (desktop kompyuterlarda GPS yo'q, shuning uchun IP-based location ishlatiladi)
          if (accuracy > maxAcceptableAccuracy) {
            const accuracyKm = Math.round(accuracy / 1000);
            console.warn(`Accuracy juda past (${accuracyKm} km). Bu desktop kompyuter yoki IP-based location ekanligini ko'rsatadi.`);
            // Koordinatalarni qaytarish, lekin ogohlantirish bilan
            resolve({
              latitude: bestPosition.coords.latitude,
              longitude: bestPosition.coords.longitude,
              accuracy: accuracy,
              warning: `Joylashuv aniqligi past (${accuracyKm} km). Desktop kompyuterlarda GPS yo'q. Xaritada marker'ni harakatlantiring yoki koordinatalarni qo'lda kiriting.`
            });
            return;
          }
          
          resolve({
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
          });
        } else {
          reject(new Error('Joylashuv ma\'lumotlarini olish vaqti tugadi. Xaritada marker\'ni harakatlantiring yoki koordinatalarni qo\'lda kiriting.'));
        }
      }, 30000); // 30 soniyaga oshirildi

      // watchPosition - real-time GPS koordinatalarini oladi
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          attempts++;
          const accuracy = position.coords.accuracy || Infinity;
          
          console.log(`Geolocation API javob berdi (${attempts}/${maxAttempts}):`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: accuracy,
            timestamp: new Date(position.timestamp).toLocaleTimeString(),
          });

          // Eng aniq koordinatalarni saqlash (accuracy pastroq = yaxshiroq)
          if (!bestPosition || accuracy < (bestPosition.coords.accuracy || Infinity)) {
            bestPosition = position;
            console.log('Yangi eng yaxshi koordinatalar topildi:', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: accuracy,
            });
          }

          // Agar accuracy yaxshi bo'lsa (targetAccuracy metrdan kam) yoki maxAttempts marta urinish bo'lsa, to'xtatamiz
          if (accuracy <= targetAccuracy || attempts >= maxAttempts) {
            cleanup();
            const finalPosition = bestPosition || position;
            const finalAccuracy = finalPosition.coords.accuracy || Infinity;
            
            console.log('Geolocation natijasi:', {
              latitude: finalPosition.coords.latitude,
              longitude: finalPosition.coords.longitude,
              accuracy: finalAccuracy,
              attempts: attempts,
            });
            
            // Accuracy tekshiruvi - agar accuracy juda past bo'lsa ham, koordinatalarni qaytarish
            const maxAcceptableAccuracy = 5000; // 5 km
            if (finalAccuracy > maxAcceptableAccuracy) {
              const accuracyKm = Math.round(finalAccuracy / 1000);
              console.warn(`Accuracy juda past (${accuracyKm} km). Bu desktop kompyuter yoki IP-based location ekanligini ko'rsatadi.`);
              // Koordinatalarni qaytarish, lekin ogohlantirish bilan
              resolve({
                latitude: finalPosition.coords.latitude,
                longitude: finalPosition.coords.longitude,
                accuracy: finalAccuracy,
                warning: `Joylashuv aniqligi past (${accuracyKm} km). Desktop kompyuterlarda GPS yo'q. Xaritada marker'ni harakatlantiring yoki koordinatalarni qo'lda kiriting.`
              });
              return;
            }
            
            console.log('Geolocation muvaffaqiyatli - aniq koordinatalar olingan:', {
              latitude: finalPosition.coords.latitude,
              longitude: finalPosition.coords.longitude,
              accuracy: finalAccuracy,
              attempts: attempts,
            });
            
            resolve({
              latitude: finalPosition.coords.latitude,
              longitude: finalPosition.coords.longitude,
            });
          }
        },
        (error) => {
          cleanup();
          console.error('Geolocation API xatolik:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true, // GPS'ni majburiy qilish - bu IP-based location'ni o'chirib qo'yadi
          timeout: 30000, // 30 soniya
          maximumAge: 0, // Eski koordinatalarni ishlatmaslik - faqat yangi GPS koordinatalarini olish
        }
      );
    });
  };

  // Google Maps linkidan koordinatalarni olish
  const extractCoordinatesFromGoogleMapsLink = async (url) => {
    try {
      // Google Maps short link (goo.gl) yoki full link
      // Short linkni ochib, to'liq URL'ni olish kerak
      
      // Agar URL'da koordinatalar bo'lsa, ularni ajratib olish
      // Masalan: https://www.google.com/maps?q=41.3111,69.2797
      const match = url.match(/[?&]q=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }
      
      // Yoki @ koordinatalar (masalan: @41.3111,69.2797,17z)
      const match2 = url.match(/@([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/);
      if (match2) {
        return {
          latitude: parseFloat(match2[1]),
          longitude: parseFloat(match2[2]),
        };
      }
      
      // Short linkni ochib ko'rish (CORS muammosi bo'lishi mumkin)
      // Shuning uchun foydalanuvchiga "Hozirgi joylashuv" tugmasidan foydalanishni tavsiya qilamiz
      // Yoki Google Maps API'dan foydalanish kerak
      
      throw new Error('URL\'dan koordinatalarni ajratib bo\'lmadi. Iltimos, "Hozirgi joylashuv" tugmasidan foydalaning yoki koordinatalarni qo\'lda kiriting.');
    } catch (error) {
      throw error;
    }
  };

  // Institution ma'lumotlarini yuklash
  useEffect(() => {
    loadInstitution();
    loadUserData();
  }, []);

  // User ma'lumotlarini yuklash
  const loadUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data;
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
      setAvatarUrl(userData.avatar_url || '');
    } catch (error) {
      console.error('User ma\'lumotlarini yuklashda xatolik:', error);
    }
  };

  const loadInstitution = async () => {
    if (!user?.institution_id) {
      setError('Institution ID topilmadi. Iltimos, qayta kirib ko\'ring.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await institutionsAPI.getById(user.institution_id);
      const inst = response.data;
      setInstitution(inst);
      setGeolocationEnabled(inst.geolocation_enabled || false);
      setLatitude(inst.latitude?.toString() || '');
      setLongitude(inst.longitude?.toString() || '');
      setRadius(inst.geolocation_radius?.toString() || '500');
    } catch (error) {
      console.error('Institution ma\'lumotlarini yuklashda xatolik:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi';
      
      // CORS yoki network xatoliklarini aniqlash
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        setError('Backend server bilan bog\'lanishda xatolik. Iltimos, backend server ishlayotganligini tekshiring.');
      } else if (error.response?.status === 500) {
        setError('Server xatolik. Iltimos, backend loglarini tekshiring.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hozirgi joylashuvni olish
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const handleGetCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      setError('');
      setSuccess('');
      
      console.log('Geolocation so\'ralmoqda... GPS yoqilganligini tekshiring.');
      
      // Foydalanuvchiga xabar berish
      setSuccess('GPS koordinatalarini olish... Iltimos, kuting. GPS yoqilganligini tekshiring.');
      
      const location = await getCurrentLocation();
      
      // Koordinatalarni to'g'ri formatda olish
      const lat = location.latitude;
      const lng = location.longitude;
      const warning = location.warning; // Ogohlantirish mavjud bo'lsa
      
      // Validatsiya
      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
        throw new Error('Noto\'g\'ri koordinatalar olindi');
      }
      
      // Aniq formatda saqlash (7 xona aniqlik bilan)
      const newLat = lat.toFixed(7);
      const newLng = lng.toFixed(7);
      
      console.log('Geolocation natijasi:', { 
        lat: newLat, 
        lng: newLng,
        originalLat: lat,
        originalLng: lng,
        warning: warning
      });
      
      // State'ni yangilash - bu LocationMap komponentini yangilaydi
      setLatitude(newLat);
      setLongitude(newLng);
      
      // Agar ogohlantirish bo'lsa, uni ko'rsatish
      if (warning) {
        setError(warning);
      } else {
        setSuccess(`Joylashuv muvaffaqiyatli olingan! Koordinatalar: ${newLat}, ${newLng}`);
      }
      
      // Xarita yangilanishi uchun kichik kechikish
      setTimeout(() => {
        setGettingLocation(false);
      }, 1000);
    } catch (error) {
      console.error('Geolocation olishda xatolik:', error);
      setGettingLocation(false);
      
      // Xatolik xabarini tayyorlash
      let errorMessage = '';
      let showManualOption = false;
      
      if (error.code === 1) {
        errorMessage = 'Brauzer sozlamalarida joylashuvga ruxsat berilmagan. Iltimos, brauzer sozlamalarida joylashuvga ruxsat bering.';
      } else if (error.code === 2) {
        errorMessage = 'Joylashuv ma\'lumotlari mavjud emas. GPS\'ni yoqing va qayta urinib ko\'ring.';
        showManualOption = true;
      } else if (error.code === 3) {
        errorMessage = 'Joylashuv ma\'lumotlarini olish vaqti tugadi. GPS\'ni yoqing va qayta urinib ko\'ring.';
        showManualOption = true;
      } else if (error.message?.includes('aniqligi yetarli emas')) {
        // Accuracy juda past - desktop kompyuter yoki IP-based location
        errorMessage = error.message;
        showManualOption = true;
      } else {
        errorMessage = error.message || 'Noma\'lum xatolik. GPS\'ni yoqing va qayta urinib ko\'ring.';
        showManualOption = true;
      }
      
      // Qo'lda kiritish imkoniyatini taklif qilish
      if (showManualOption) {
        errorMessage += ' Alternativa: Quyidagi usullardan birini tanlang: 1) Xaritada marker\'ni harakatlantiring, 2) Koordinatalarni qo\'lda kiriting (quyida), 3) Joylashuvni qidiring.';
      }
      
      setError(errorMessage);
    }
  };

  // Xaritada qidirish (Nominatim API)
  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) {
      setError('Qidiruv so\'rovini kiriting!');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // Nominatim OpenStreetMap API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Texnikum ERP System'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setLatitude(result.lat);
        setLongitude(result.lon);
        setSuccess(`Joylashuv topildi: ${result.display_name}`);
        setMapSearchQuery('');
      } else {
        setError('Joylashuv topilmadi. Boshqa so\'rov bilan qayta urinib ko\'ring.');
      }
    } catch (error) {
      console.error('Qidiruvda xatolik:', error);
      setError('Qidiruvda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  // Google Maps linkidan koordinatalarni olish
  const handleExtractFromMapsLink = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!mapsLink.trim()) {
        setError('Google Maps linkini kiriting!');
        return;
      }

      const coords = await extractCoordinatesFromGoogleMapsLink(mapsLink);
      setLatitude(coords.latitude.toString());
      setLongitude(coords.longitude.toString());
      setSuccess('Koordinatalar muvaffaqiyatli olingan!');
      setMapsLink('');
    } catch (error) {
      console.error('Linkdan koordinatalarni olishda xatolik:', error);
      setError('Linkdan koordinatalarni ajratib bo\'lmadi. Iltimos, "Hozirgi joylashuv" tugmasidan foydalaning yoki koordinatalarni qo\'lda kiriting.');
    }
  };

  // Saqlash
  const handleSave = async () => {
    if (!user?.institution_id) {
      setError('Institution ID topilmadi. Iltimos, qayta kirib ko\'ring.');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validatsiya
      if (geolocationEnabled) {
        if (!latitude || !longitude || !radius) {
          setError('Geolocation yoqilgan bo\'lsa, barcha maydonlarni to\'ldiring!');
          setSaving(false);
          return;
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const rad = parseFloat(radius);

        if (isNaN(lat) || lat < -90 || lat > 90) {
          setError('Kenglik noto\'g\'ri! -90 dan 90 gacha bo\'lishi kerak.');
          setSaving(false);
          return;
        }

        if (isNaN(lon) || lon < -180 || lon > 180) {
          setError('Uzunlik noto\'g\'ri! -180 dan 180 gacha bo\'lishi kerak.');
          setSaving(false);
          return;
        }

        if (isNaN(rad) || rad <= 0) {
          setError('Radius musbat son bo\'lishi kerak!');
          setSaving(false);
          return;
        }
      }

      const updateData = {
        geolocation_enabled: geolocationEnabled,
        latitude: geolocationEnabled ? parseFloat(latitude) : null,
        longitude: geolocationEnabled ? parseFloat(longitude) : null,
        geolocation_radius: geolocationEnabled ? parseFloat(radius) : null,
      };

      await institutionsAPI.update(user.institution_id, updateData);
      setSuccess('Sozlamalar muvaffaqiyatli saqlandi!');
      
      // Institution ma'lumotlarini yangilash
      await loadInstitution();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      let errorMessage = 'Sozlamalarni saqlashda xatolik yuz berdi';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = String(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Akkaunt sozlamalarini saqlash
  const handleSaveAccount = async () => {
    try {
      setSavingAccount(true);
      setAccountError('');
      setAccountSuccess('');

      if (!firstName.trim() || !lastName.trim()) {
        setAccountError('Ism va familiya to\'ldirilishi kerak!');
        setSavingAccount(false);
        return;
      }

      const updateData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_url: avatarUrl.trim() || null,
      };

      const response = await authAPI.updateCurrentUser(updateData);
      const updatedUser = response.data;
      
      // User formatini frontend formatiga o'tkazish
      const formattedUser = {
        ...updatedUser,
        firstName: updatedUser.first_name || updatedUser.firstName,
        lastName: updatedUser.last_name || updatedUser.lastName,
      };
      
      // Store'ni yangilash
      updateUser(formattedUser);
      
      setAccountSuccess('Akkaunt sozlamalari muvaffaqiyatli saqlandi!');
    } catch (error) {
      console.error('Akkaunt sozlamalarini saqlashda xatolik:', error);
      let errorMessage = 'Akkaunt sozlamalarini saqlashda xatolik yuz berdi';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = String(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAccountError(errorMessage);
    } finally {
      setSavingAccount(false);
    }
  };

  // Gravatar URL yaratish (MD5 hash)
  const getGravatarUrl = (email) => {
    if (!email) return null;
    try {
      const emailLower = email.toLowerCase().trim();
      const hash = CryptoJS.MD5(emailLower).toString();
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
    } catch (error) {
      return null;
    }
  };

  // Rasm faylini tanlash
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Rasm turini tekshirish
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setAccountError('Faqat rasm fayllari ruxsat etiladi (JPG, PNG, GIF, WEBP)');
        setSelectedFile(null);
        e.target.value = ''; // Input'ni tozalash
        return;
      }
      
      // Fayl hajmini tekshirish (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        setAccountError('Rasm hajmi 5 MB dan katta bo\'lmasligi kerak');
        setSelectedFile(null);
        e.target.value = ''; // Input'ni tozalash
        return;
      }
      
      setSelectedFile(file);
      setAccountError('');
      setAccountSuccess(''); // Oldingi success xabarni tozalash
      
      // Preview yaratish (data URL)
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.onerror = () => {
        setAccountError('Rasmni o\'qishda xatolik yuz berdi');
        setSelectedFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
    }
  };

  // Rasmni yuklash
  const handleUploadImage = async () => {
    if (!selectedFile) {
      setAccountError('Rasm tanlanishi kerak');
      return;
    }

    try {
      setUploadingImage(true);
      setAccountError('');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await uploadAPI.uploadAvatar(formData);
      const uploadedUrl = response.data.url;
      
      // Relative path bo'lsa, to'liq URL yaratish
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const fullUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${baseURL}${uploadedUrl.startsWith('/') ? '' : '/'}${uploadedUrl}`;
      
      setAvatarUrl(fullUrl);
      setSelectedFile(null);
      
      // User ma'lumotlarini yangilash
      const userResponse = await authAPI.getCurrentUser();
      const userData = userResponse.data;
      
      // User formatini frontend formatiga o'tkazish
      const formattedUser = {
        ...userData,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
      };
      
      updateUser(formattedUser);
      
      setAccountSuccess('Rasm muvaffaqiyatli yuklandi!');
    } catch (error) {
      console.error('Rasm yuklashda xatolik:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Rasm yuklashda xatolik yuz berdi';
      setAccountError(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sozlamalar</h1>
          <p className="text-muted-foreground mt-1">
            Muassasa sozlamalarini boshqarish
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Akkaunt sozlamalari
          </CardTitle>
          <CardDescription>
            Profil ma'lumotlaringizni va rasmingizni o'zgartirish
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Error/Success Messages */}
          {accountError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{accountError}</p>
              </div>
            </div>
          )}

          {accountSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">{accountSuccess}</p>
              </div>
            </div>
          )}

          {/* Profile Picture */}
          <div className="space-y-2">
            <Label>Profil rasmi</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                    onError={(e) => {
                      // Agar rasm yuklanmasa, Gravatar yoki default rasmni ko'rsatish
                      const gravatarUrl = getGravatarUrl(user?.email);
                      if (gravatarUrl) {
                        e.target.src = gravatarUrl;
                      } else {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }
                    }}
                  />
                ) : null}
                {!avatarUrl && user?.email && (
                  <img
                    src={getGravatarUrl(user.email)}
                    alt="Gravatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                )}
                <div 
                  className={`h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium border-2 border-primary ${avatarUrl || (user?.email && getGravatarUrl(user.email)) ? 'hidden' : ''}`}
                >
                  {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={avatarUrl && !avatarUrl.startsWith('data:') ? avatarUrl : ''}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setSelectedFile(null);
                    }}
                    placeholder="Rasm URL'ini kiriting (masalan: https://example.com/photo.jpg)"
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                    disabled={uploadingImage}
                    onClick={() => {
                      // File input'ni trigger qilish
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Yuklanmoqda...' : 'Fayl tanlash'}
                  </Button>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Yuklanmoqda...
                        </>
                      ) : (
                        <>
                          <Camera className="h-3 w-3 mr-2" />
                          Yuklash
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {selectedFile.name}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Rasm URL'ini kiriting yoki kompyuterdan fayl yuklang (Gravatar ishlatiladi)
                </p>
              </div>
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Ism *</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ismingizni kiriting"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Familiya *</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Familiyangizni kiriting"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Elektron pochta</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Elektron pochta o'zgartirib bo'lmaydi
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveAccount} disabled={savingAccount}>
              {savingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Geolocation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geolocation sozlamalari
          </CardTitle>
          <CardDescription>
            Davomat olish uchun geolocation cheklovlarini sozlash. O'qituvchilar faqat belgilangan radius ichida davomat olishi mumkin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Geolocation Enabled Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Geolocation cheklovi</Label>
              <p className="text-sm text-muted-foreground mt-1">
                O'qituvchilar faqat belgilangan radius ichida davomat olishi mumkin
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={geolocationEnabled}
                onChange={(e) => setGeolocationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {geolocationEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              {/* Muassasa ma'lumotlari - Cheklov uchun kiritilgan manzil */}
              {institution && (
                <div className="p-4 bg-background border rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Cheklov uchun kiritilgan manzil ma'lumotlari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Muassasa nomi</p>
                      <p className="text-sm font-semibold mt-1">{institution.name || 'Belgilanmagan'}</p>
                    </div>
                    {institution.address && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Manzil</p>
                        <p className="text-sm font-semibold mt-1">{institution.address}</p>
                      </div>
                    )}
                    {institution.region && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Viloyat</p>
                        <p className="text-sm font-semibold mt-1">{institution.region}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Joylashuvni belgilash:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300 ml-2">
                  <li>Xaritada joylashuvni qidiring yoki xaritada click qiling</li>
                  <li>Marker'ni harakatlantiring yoki koordinatalarni qo'lda kiriting</li>
                  <li>Radiusni belgilang (masalan: 500 metr - politexnikum binosi atrofida)</li>
                </ol>
              </div>

              {/* Map Search */}
              <div className="space-y-2">
                <Label>Joylashuvni qidirish</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    placeholder="Masalan: Toshkent, Chilonzor tumani..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleMapSearch();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMapSearch}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Qidirish
                  </Button>
                </div>
              </div>

              {/* Hozirgi joylashuvni olish (xarita yonida ko'rinadigan tugma) */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Joylashuv olinmoqda...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Hozirgi joylashuvni olish
                    </>
                  )}
                </Button>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>Qanday ishlaydi:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                    <li><strong>Telefon/planshet:</strong> GPS'ni yoqing va ochiq havoda turib "Hozirgi joylashuvni olish" tugmasini bosing</li>
                    <li><strong>Desktop kompyuter:</strong> GPS yo'q. Quyidagi usullardan birini tanlang:</li>
                    <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
                      <li>Xaritada marker'ni harakatlantiring (eng oson)</li>
                      <li>Joylashuvni qidiring (yuqorida)</li>
                      <li>Koordinatalarni qo'lda kiriting (quyida)</li>
                    </ul>
                  </ul>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded mt-2">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>💡 Maslahat:</strong> Desktop kompyuterda ishlayotgan bo'lsangiz, xaritada marker'ni harakatlantirish yoki qidirish usuli eng qulay.
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="space-y-2">
                <Label>Xarita</Label>
                <LocationMap
                  latitude={latitude}
                  longitude={longitude}
                  radius={radius}
                  onLocationChange={(lat, lng) => {
                    setLatitude(lat.toString());
                    setLongitude(lng.toString());
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Xaritada click qiling yoki marker'ni harakatlantiring. Radius ko'k rangda ko'rsatiladi.
                </p>
              </div>

              {/* Coordinates and Radius - Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Latitude */}
                <div className="space-y-2">
                  <Label htmlFor="latitude">Kenglik (Latitude) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="41.3111"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLocation}
                      title="Hozirgi joylashuv"
                    >
                      {gettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Longitude */}
                <div className="space-y-2">
                  <Label htmlFor="longitude">Uzunlik (Longitude) *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="69.2797"
                  />
                </div>

                {/* Radius */}
                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (metr) *</Label>
                  <Input
                    id="radius"
                    type="number"
                    step="1"
                    min="1"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Eslatma:</strong> O'qituvchilar davomat olish uchun belgilangan radius ichida bo'lishlari kerak. 
                  Radiusdan tashqarida bo'lsa, davomat olish imkoni bo'lmaydi.
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

