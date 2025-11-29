import { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  User,
  Mail,
  Save,
  Camera
} from 'lucide-react';
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

export function TeacherSettings() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  
  // Institution ma'lumotlari
  const [institution, setInstitution] = useState(null);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  
  // Akkaunt sozlamalari
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

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

  // Gravatar URL yaratish
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
        return;
      }
      
      // Fayl hajmini tekshirish (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        setAccountError('Rasm hajmi 5 MB dan katta bo\'lmasligi kerak');
        return;
      }
      
      setSelectedFile(file);
      setAccountError('');
      
      // Preview yaratish
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target.result);
      };
      reader.readAsDataURL(file);
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
      const instData = response.data;
      setInstitution(instData);
      setGeolocationEnabled(instData.geolocation_enabled || false);
      setLatitude(instData.latitude?.toString() || '');
      setLongitude(instData.longitude?.toString() || '');
      setRadius(instData.geolocation_radius?.toString() || '');
    } catch (error) {
      console.error('Muassasa ma\'lumotlarini yuklashda xatolik:', error);
      setError(error.response?.data?.detail || 'Muassasa ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
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
            Muassasa sozlamalari va geolocation ma'lumotlari
          </p>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Geolocation Settings Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geolocation sozlamalari
          </CardTitle>
          <CardDescription>
            Davomat olish uchun geolocation cheklovlari haqida ma'lumot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Geolocation Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Geolocation cheklovi</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {geolocationEnabled 
                  ? 'Geolocation cheklovi yoqilgan. Davomat olish uchun muassasa radius ichida bo\'lishingiz kerak.'
                  : 'Geolocation cheklovi o\'chirilgan. Davomat olish uchun joylashuv talab qilinmaydi.'}
              </p>
            </div>
            <Badge variant={geolocationEnabled ? 'default' : 'secondary'}>
              {geolocationEnabled ? 'Yoqilgan' : 'O\'chirilgan'}
            </Badge>
          </div>

          {geolocationEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              {/* Info Box */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Geolocation cheklovi qanday ishlaydi?
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300 ml-2">
                      <li>Davomat olish uchun muassasa radius ichida bo'lishingiz kerak</li>
                      <li>Brauzer sozlamalarida joylashuvga ruxsat bering</li>
                      <li>Agar radiusdan tashqarida bo'lsangiz, davomat olish imkoni bo'lmaydi</li>
                      <li>Sozlamalarni o'zgartirish uchun admin bilan bog'laning</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Institution Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Muassasa kengligi</p>
                  <p className="text-lg font-semibold">{latitude || 'Belgilanmagan'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Muassasa uzunligi</p>
                  <p className="text-lg font-semibold">{longitude || 'Belgilanmagan'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ruxsat etilgan radius</p>
                  <p className="text-lg font-semibold">{radius ? `${radius} metr` : 'Belgilanmagan'}</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Eslatma:</strong> Geolocation sozlamalarini o'zgartirish uchun admin bilan bog'laning. 
                  Faqat admin geolocation cheklovini yoqib/o'chirishi va radiusni sozlashi mumkin.
                </p>
              </div>
            </div>
          )}

          {!geolocationEnabled && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Yaxshi xabar:</strong> Geolocation cheklovi hozirda o'chirilgan. 
                Davomat olish uchun joylashuv talab qilinmaydi. Har qanday joydan davomat olishingiz mumkin.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institution Info */}
      {institution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Muassasa ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Muassasa nomi</p>
                <p className="text-lg font-semibold">{institution.name || 'Belgilanmagan'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kod</p>
                <p className="text-lg font-semibold">{institution.code || 'Belgilanmagan'}</p>
              </div>
              {institution.region && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Viloyat</p>
                  <p className="text-lg font-semibold">{institution.region}</p>
                </div>
              )}
              {institution.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manzil</p>
                  <p className="text-lg font-semibold">{institution.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

