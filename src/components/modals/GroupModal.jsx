import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { groupsAPI } from '../../services/api';

const groupSchema = z.object({
  name: z.string().min(2, 'Guruh nomi kamida 2 ta belgi bo\'lishi kerak'),
  code: z.string().min(1, 'Kod kiritilishi kerak'),
  department: z.string().min(1, 'Yo\'nalish tanlanishi kerak'),
  description: z.string().min(10, 'Tavsif kamida 10 ta belgi bo\'lishi kerak'),
  year: z.string().min(4, 'To\'liq yil kiritilishi kerak'),
  curator: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

export function GroupModal({ group, departments = [], onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: group || {
      name: '',
      code: '',
      department: '',
      description: '',
      year: new Date().getFullYear().toString(),
      curator: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (group) {
      reset({
        ...group,
        year: group.year?.toString() || new Date().getFullYear().toString(),
      });
    }
  }, [group, reset]);

  const onSubmit = async (data) => {
    try {
      // Backend API formatiga o'tkazish
      const payload = {
        name: data.name,
        code: data.code || data.name,
        department: data.department,
        description: data.description || '',
        is_active: data.status === 'active',
        year: parseInt(data.year) || new Date().getFullYear(),
        curator: data.curator || '',
      };

      if (group) {
        await groupsAPI.update(group.id, payload);
      } else {
        await groupsAPI.create(payload);
      }
      onClose();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      // Xatolikni to'g'ri ko'rsatish
      let errorMessage = 'Saqlashda xatolik yuz berdi';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
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
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {group ? 'Guruhni tahrirlash' : 'Yangi guruh qo\'shish'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 touch-manipulation ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Guruh nomi *</Label>
              <Input id="name" {...register('name')} placeholder="AT-21-01" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Guruh kodi *</Label>
              <Input id="code" {...register('code')} placeholder="AT-21-01" />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Yo'nalish *</Label>
              <Select id="department" {...register('department')}>
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
              <Label htmlFor="year">O'quv yili *</Label>
              <Input id="year" type="number" {...register('year')} placeholder="2024" />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="curator">Kurator (ixtiyoriy)</Label>
            <Input id="curator" {...register('curator')} placeholder="Kurator ismi" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif *</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Guruh haqida qisqacha ma'lumot..."
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
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
              {isSubmitting ? 'Saqlanmoqda...' : group ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

