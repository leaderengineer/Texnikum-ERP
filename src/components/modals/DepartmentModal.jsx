import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building2, GraduationCap, Users, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { departmentsAPI } from '../../services/api';

const departmentSchema = z.object({
  name: z.string().min(2, 'Nomi kamida 2 ta belgi bo\'lishi kerak'),
  code: z.string().min(1, 'Kod kiritilishi kerak'),
  description: z.string().min(10, 'Tavsif kamida 10 ta belgi bo\'lishi kerak'),
  head: z.string().min(2, 'Rahbar ismi kiritilishi kerak'),
  establishedYear: z.string().min(4, 'To\'liq yil kiritilishi kerak'),
  status: z.enum(['active', 'inactive']),
});

export function DepartmentModal({ department, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: department || {
      name: '',
      code: '',
      description: '',
      head: '',
      establishedYear: new Date().getFullYear().toString(),
      status: 'active',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        ...department,
        establishedYear: department.establishedYear?.toString() || new Date().getFullYear().toString(),
      });
    }
  }, [department, reset]);

  const onSubmit = async (data) => {
    try {
      // Backend API formatiga o'tkazish
      const payload = {
        name: data.name,
        code: data.code || '',
        description: data.description || '',
        is_active: data.status === 'active',
        established_year: data.establishedYear || new Date().getFullYear(),
        head: data.head || '',
      };

      if (department) {
        await departmentsAPI.update(department.id, payload);
      } else {
        await departmentsAPI.create(payload);
      }
      onClose();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Saqlashda xatolik yuz berdi';
      alert(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {department ? 'Yo\'nalishni tahrirlash' : 'Yangi yo\'nalish qo\'shish'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 touch-manipulation ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Yo'nalish nomi *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Kod *</Label>
              <Input id="code" {...register('code')} placeholder="AT, M, I..." />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif *</Label>
            <textarea
              id="description"
              {...register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Yo'nalish haqida batafsil ma'lumot..."
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="head">Rahbar *</Label>
              <Input id="head" {...register('head')} placeholder="Prof. Ism Familiya" />
              {errors.head && (
                <p className="text-sm text-destructive">{errors.head.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishedYear">Tashkil etilgan yil *</Label>
              <Input
                id="establishedYear"
                type="number"
                {...register('establishedYear')}
                placeholder="2020"
              />
              {errors.establishedYear && (
                <p className="text-sm text-destructive">{errors.establishedYear.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Holat *</Label>
            <Select id="status" {...register('status')}>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saqlanmoqda...' : department ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
