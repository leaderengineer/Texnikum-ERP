import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Search, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { teachersAPI, departmentsAPI } from '../../services/api';

const teacherSchema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta belgi bo\'lishi kerak'),
  email: z.string().email('Noto\'g\'ri email manzil'),
  phone: z.string().min(9, 'Noto\'g\'ri telefon raqami'),
  department: z.string().min(1, 'Yo\'nalish tanlanishi kerak'),
  status: z.enum(['active', 'inactive']),
});

export function TeacherModal({ teacher, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [jshshir, setJshshir] = useState('');
  const [loadingJshshir, setLoadingJshshir] = useState(false);
  const [jshshirError, setJshshirError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacher || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      status: 'active',
    },
  });

  // Yo'nalishlarni yuklash
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await departmentsAPI.getAll();
        const departmentsData = response.data || [];
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Yo\'nalishlarni yuklashda xatolik:', error);
        // Fallback to default departments
        setDepartments([
          { id: 1, name: 'Axborot texnologiyalari' },
          { id: 2, name: 'Muhandislik' },
          { id: 3, name: 'Iqtisodiyot' },
          { id: 4, name: 'Ta\'lim' },
        ]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    
    loadDepartments();
  }, []);

  // JSHSHIR raqamini tekshirish va ma'lumotlarni yuklash
  const handleJshshirSearch = async () => {
    if (!jshshir || jshshir.length !== 14 || !/^\d+$/.test(jshshir)) {
      setJshshirError('JSHSHIR raqami 14 xonali raqam bo\'lishi kerak');
      return;
    }

    try {
      setLoadingJshshir(true);
      setJshshirError('');
      
      const response = await teachersAPI.getByJshshir(jshshir);
      const personData = response.data?.data;
      
      if (personData) {
        // Ma'lumotlarni formaga to'ldirish - barcha mavjud ma'lumotlarni avtomatik to'ldirish
        let hasData = false;
        
        // Ism
        if (personData.first_name) {
          setValue('firstName', personData.first_name);
          hasData = true;
        }
        
        // Familiya
        if (personData.last_name) {
          setValue('lastName', personData.last_name);
          hasData = true;
        }
        
        // Telefon (agar API'dan kelgan bo'lsa)
        if (personData.phone) {
          setValue('phone', personData.phone);
        }
        
        // Email - avtomatik yaratish yoki API'dan olish
        if (personData.email) {
          // API'dan kelgan email
          setValue('email', personData.email);
        } else if (personData.first_name && personData.last_name) {
          // Email avtomatik yaratish (ism.familiya@example.com)
          const emailBase = `${personData.first_name.toLowerCase()}.${personData.last_name.toLowerCase()}`;
          const email = `${emailBase.replace(/\s+/g, '')}@example.com`;
          setValue('email', email);
        }
        
        // Agar API'dan ma'lumotlar kelgan bo'lsa, muvaffaqiyat xabari
        if (hasData && personData.api_enabled) {
          // API'dan ma'lumotlar kelgan - xabar ko'rsatmaymiz, chunki formaga to'ldirildi
          console.log('JSHSHIR ma\'lumotlari API\'dan muvaffaqiyatli yuklandi va formaga to\'ldirildi');
        } else if (!hasData) {
          // Agar ism va familiya bo'sh bo'lsa, demo xabar berish
          const birthDate = personData.birth_date_formatted || personData.birth_date;
          const gender = personData.gender_uz || personData.gender;
          const region = personData.region || personData.address;
          const dateValid = personData.date_valid !== false;
          const dateError = personData.date_error;
          
          // Xabar matnini tayyorlash
          let message = `JSHSHIR raqami topildi!\n\n`;
          
          if (dateValid) {
            message += `Tug'ilgan sana: ${birthDate}\n`;
          } else {
            message += `Tug'ilgan sana: ${birthDate} (taxminan)\n`;
            if (dateError) {
              message += `Diqqat: ${dateError}\n`;
            }
          }
          
          message += `Jins: ${gender}\n`;
          message += `Viloyat: ${region}\n\n`;
          
          if (personData.api_enabled === false) {
            message += `Eslatma: Haqiqiy API integratsiyasi o'rnatilmagan yoki ishlamayapti.\n`;
            message += `Iltimos, ism va familiyani qo'lda kiriting.`;
          } else {
            message += `Eslatma: API'da ma'lumotlar topilmadi.\n`;
            message += `Iltimos, ism va familiyani qo'lda kiriting.`;
          }
          
          // Foydalanuvchiga xabar berish
          alert(message);
        }
      }
    } catch (error) {
      console.error('JSHSHIR ma\'lumotlarini yuklashda xatolik:', error);
      setJshshirError(
        error.response?.data?.detail || 
        error.message || 
        'JSHSHIR bo\'yicha ma\'lumot topilmadi. Iltimos, ma\'lumotlarni qo\'lda kiriting.'
      );
    } finally {
      setLoadingJshshir(false);
    }
  };

  // JSHSHIR input'da Enter bosilganda
  const handleJshshirKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJshshirSearch();
    }
  };

  useEffect(() => {
    if (teacher) {
      // Status'ni to'g'ri formatda o'rnatish
      let normalizedStatus = 'active'; // Default
      if (teacher.status) {
        const statusStr = String(teacher.status).toLowerCase().trim();
        normalizedStatus = (statusStr === 'active') ? 'active' : 'inactive';
      } else if (teacher.is_active !== undefined) {
        normalizedStatus = teacher.is_active ? 'active' : 'inactive';
      }
      
      reset({
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        department: teacher.department || '',
        status: normalizedStatus,
      });
    }
  }, [teacher, reset]);

  const onSubmit = async (data) => {
    try {
      // Status'ni to'g'ri formatlash va normalizatsiya qilish
      let normalizedStatus = 'active'; // Default
      if (data.status) {
        const statusStr = String(data.status).toLowerCase().trim();
        normalizedStatus = (statusStr === 'active') ? 'active' : 'inactive';
      }
      
      // Backend API formatiga o'tkazish - status har doim yuborilishi kerak
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || '',
        department: data.department,
        status: normalizedStatus, // Status har doim yuborilishi kerak
      };

      if (teacher) {
        await teachersAPI.update(teacher.id, payload);
      } else {
        // Create uchun password yuborish (yoki backend default yaratadi)
        await teachersAPI.create(payload);
      }
      
      // Modal yopilgandan keyin parent component'ga xabar berish
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      // Xatolikni to'g'ri ko'rsatish
      let errorMessage = 'Saqlashda xatolik yuz berdi';
      
      // Network error tekshirish
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Server bilan ulanib bo\'lmadi. Iltimos, backend server ishga tushganligini tekshiring.';
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Validation xatoliklar
            errorMessage = errorData.detail.map(err => {
              if (typeof err === 'object' && err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return String(err);
            }).join('\n');
          } else {
            errorMessage = String(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = String(errorData.message);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg sm:text-xl font-semibold truncate pr-2">
            {teacher ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi qo\'shish'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 touch-manipulation">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          {/* JSHSHIR input - faqat yangi o'qituvchi qo'shishda */}
          {!teacher && (
            <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Label htmlFor="jshshir">JSHSHIR raqami (ixtiyoriy - avtomatik to'ldirish)</Label>
              <div className="flex gap-2">
                <Input
                  id="jshshir"
                  type="text"
                  placeholder="12345678901234"
                  value={jshshir}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setJshshir(value);
                    setJshshirError('');
                  }}
                  onKeyPress={handleJshshirKeyPress}
                  maxLength={14}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleJshshirSearch}
                  disabled={loadingJshshir || jshshir.length !== 14}
                  className="shrink-0"
                >
                  {loadingJshshir ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Qidirish</span>
                </Button>
              </div>
              {jshshirError && (
                <p className="text-sm text-destructive">{jshshirError}</p>
              )}
              {jshshir && jshshir.length === 14 && !jshshirError && (
                <p className="text-xs text-muted-foreground">
                  JSHSHIR raqami kiritildi. "Qidirish" tugmasini bosing yoki Enter tugmasini bosing.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ism *</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Familiya *</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Yo'nalish *</Label>
            <Select id="department" {...register('department')} disabled={loadingDepartments}>
              <option value="">Tanlang...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </Select>
            {errors.department && (
              <p className="text-sm text-destructive">{errors.department.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Holat *</Label>
            <Select id="status" {...register('status')}>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </Select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto touch-manipulation">
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto touch-manipulation">
              {isSubmitting ? 'Saqlanmoqda...' : teacher ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
