import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
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
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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

  useEffect(() => {
    if (teacher) {
      // Status'ni to'g'ri formatda o'rnatish
      const normalizedStatus = teacher.status === 'active' || teacher.status === 'Active' || teacher.status === true || (typeof teacher.status === 'string' && teacher.status.toLowerCase() === 'active') 
        ? 'active' 
        : 'inactive';
      
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
      // Backend API formatiga o'tkazish
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || '',
        department: data.department,
        status: data.status === 'active' ? 'active' : 'inactive',
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
