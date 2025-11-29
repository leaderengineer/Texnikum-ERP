import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { studentsAPI, departmentsAPI, groupsAPI } from '../../services/api';

const studentSchema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta belgi bo\'lishi kerak'),
  studentId: z.string().min(1, 'Talaba ID kiritilishi kerak'),
  email: z.string().email('Noto\'g\'ri email manzil'),
  phone: z.string().min(9, 'Noto\'g\'ri telefon raqami'),
  group: z.string().min(1, 'Guruh tanlanishi kerak'),
  department: z.string().min(1, 'Yo\'nalish tanlanishi kerak'),
  status: z.enum(['active', 'inactive']),
});

export function StudentModal({ student, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: student || {
      firstName: '',
      lastName: '',
      studentId: '',
      email: '',
      phone: '',
      group: '',
      department: '',
      status: 'active',
    },
  });

  const watchedDepartment = watch('department');

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
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    
    loadDepartments();
  }, []);

  // Guruhlarni yuklash (yo'nalish bo'yicha)
  const loadGroupsByDepartment = async (departmentName) => {
    try {
      setLoadingGroups(true);
      const response = await groupsAPI.getAll({ limit: 1000 });
      const allGroups = response.data?.items || response.data || [];
      // Yo'nalish bo'yicha filter qilish
      const filteredGroups = allGroups.filter(g => g.department === departmentName);
      // Guruhlarni nom bo'yicha tartiblash
      const sortedGroups = filteredGroups.sort((a, b) => {
        const nameA = (a.name || a.code || '').toLowerCase();
        const nameB = (b.name || b.code || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setGroups(sortedGroups);
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Yo'nalish tanlanganda, uning guruhlarini yuklash
  useEffect(() => {
    if (watchedDepartment) {
      setSelectedDepartment(watchedDepartment);
      loadGroupsByDepartment(watchedDepartment);
    } else {
      setGroups([]);
      setValue('group', '');
    }
  }, [watchedDepartment, setValue]);

  useEffect(() => {
    if (student) {
      reset(student);
      if (student.department) {
        setSelectedDepartment(student.department);
        loadGroupsByDepartment(student.department);
      }
    } else {
      reset({
        firstName: '',
        lastName: '',
        studentId: '',
        email: '',
        phone: '',
        group: '',
        department: '',
        status: 'active',
      });
      setSelectedDepartment('');
      setGroups([]);
    }
  }, [student, reset]);

  const onSubmit = async (data) => {
    try {
      // Backend API formatiga o'tkazish
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        student_id: data.studentId,
        email: data.email,
        phone: data.phone,
        group: data.group,
        department: data.department,
        status: data.status, // Backend'da status field'i ishlatiladi
      };

      if (student) {
        await studentsAPI.update(student.id, payload);
      } else {
        await studentsAPI.create(payload);
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
          <h2 className="text-lg sm:text-xl font-semibold truncate pr-2">
            {student ? 'Talabani tahrirlash' : 'Yangi talaba qo\'shish'}
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
            <Label htmlFor="studentId">Talaba ID *</Label>
            <Input id="studentId" {...register('studentId')} />
            {errors.studentId && (
              <p className="text-sm text-destructive">{errors.studentId.message}</p>
            )}
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="group">Guruh *</Label>
              {!watchedDepartment ? (
                <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
                  <span className="text-sm text-muted-foreground">Avval yo'nalishni tanlang</span>
                </div>
              ) : loadingGroups ? (
                <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Guruhlar yuklanmoqda...</span>
                </div>
              ) : groups.length === 0 ? (
                <div className="flex items-center justify-center h-10 border rounded-md bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Bu yo'nalishda guruhlar topilmadi
                  </span>
                </div>
              ) : (
                <Select id="group" {...register('group')}>
                  <option value="">Tanlang...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.name || group.code}>
                      {group.name || group.code}
                    </option>
                  ))}
                </Select>
              )}
              {errors.group && (
                <p className="text-sm text-destructive">{errors.group.message}</p>
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
              {isSubmitting ? 'Saqlanmoqda...' : student ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
