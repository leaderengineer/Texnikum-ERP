import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Users, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { groupsAPI, teachersAPI } from '../../services/api';

// Schema - yangi guruh qo'shishda kurs majburiy, tahrirlashda optional
const createGroupSchema = (isEdit = false) => z.object({
  course: isEdit ? z.string().optional() : z.string().min(1, 'Kurs tanlanishi kerak'),
  name: z.string().min(2, 'Guruh nomi kamida 2 ta belgi bo\'lishi kerak'),
  code: z.string().min(1, 'Kod kiritilishi kerak'),
  department: z.string().min(1, 'Yo\'nalish tanlanishi kerak'),
  description: z.string().optional(),
  year: z.string().min(4, 'To\'liq yil kiritilishi kerak'),
  curator: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

// Kurs bo'yicha guruh nomlarini generatsiya qilish
const generateGroupNames = (course) => {
  if (!course) return [];
  
  const currentYear = new Date().getFullYear() % 100; // Oxirgi 2 raqam
  const courseNum = parseInt(course);
  const year = currentYear - courseNum + 1; // 1-kurs = currentYear, 2-kurs = currentYear-1, ...
  
  const groups = [];
  for (let i = 1; i <= 20; i++) {
    const groupNum = i.toString().padStart(2, '0');
    groups.push(`${groupNum}-${year}`);
  }
  return groups;
};

export function GroupModal({ group, departments = [], defaultDepartment = null, onClose }) {
  const isEdit = !!group;
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createGroupSchema(isEdit)),
    defaultValues: group || {
      course: '',
      name: '',
      code: '',
      department: defaultDepartment || '',
      description: '',
      year: new Date().getFullYear().toString(),
      curator: '',
      status: 'active',
    },
  });

  const selectedCourse = watch('course');
  const selectedGroupName = watch('name');

  // O'qituvchilarni yuklash
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoadingTeachers(true);
        
        // Backend limit maksimal 100, shuning uchun bir necha marta yuklash kerak
        let allTeachersData = [];
        let fetchSkip = 0;
        const limit = 100; // Backend maksimal limit
        let hasMore = true;
        
        while (hasMore) {
          const response = await teachersAPI.getAll({ skip: fetchSkip, limit });
          const teachersData = Array.isArray(response.data) ? response.data : [];
          allTeachersData = [...allTeachersData, ...teachersData];
          
          // Agar kamroq ma'lumot qaytsa, keyingi sahifa yo'q
          if (teachersData.length < limit) {
            hasMore = false;
          } else {
            fetchSkip += limit;
          }
        }
        
        // O'qituvchilarni formatlash
        const formattedTeachers = allTeachersData.map((teacher) => ({
          id: teacher.id,
          name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
          email: teacher.email || '',
        })).filter(teacher => teacher.name); // Bo'sh ismlarni olib tashlash
        
        // Ism bo'yicha tartiblash
        formattedTeachers.sort((a, b) => a.name.localeCompare(b.name));
        setTeachers(formattedTeachers);
      } catch (error) {
        console.error('O\'qituvchilarni yuklashda xatolik:', error);
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };

    loadTeachers();
  }, []);

  // Kurs tanlanganda, guruh nomlarini generatsiya qilish
  const availableGroupNames = useMemo(() => {
    return generateGroupNames(selectedCourse);
  }, [selectedCourse]);

  // Kurs o'zgarganda, guruh nomini tozalash
  useEffect(() => {
    if (selectedCourse && !group) {
      setValue('name', '');
      setValue('code', '');
    }
  }, [selectedCourse, setValue, group]);

  // Guruh nomi tanlanganda, code'ni ham o'rnatish
  useEffect(() => {
    if (selectedGroupName && !group) {
      setValue('code', selectedGroupName);
    }
  }, [selectedGroupName, setValue, group]);

  useEffect(() => {
    if (group) {
      // Mavjud guruhni tahrirlashda, kursni aniqlash
      const groupName = group.name || group.code || '';
      const match = groupName.match(/-(\d{2})$/);
      let course = '';
      if (match) {
        const year = parseInt(match[1]);
        const currentYear = new Date().getFullYear() % 100;
        const courseNum = currentYear - year + 1;
        if (courseNum > 0 && courseNum <= 4) {
          course = courseNum.toString();
        }
      }
      
      reset({
        ...group,
        course: course,
        year: group.year?.toString() || new Date().getFullYear().toString(),
      });
    } else if (defaultDepartment) {
      reset({
        course: '',
        name: '',
        code: '',
        department: defaultDepartment,
        description: '',
        year: new Date().getFullYear().toString(),
        curator: '',
        status: 'active',
      });
    }
  }, [group, defaultDepartment, reset]);

  const onSubmit = async (data) => {
    try {
      console.log('Form data:', data);
      
      // Backend API formatiga o'tkazish (course field'ini olib tashlash)
      const { course, ...restData } = data;
      const payload = {
        name: restData.name.trim(),
        code: (restData.code || restData.name).trim(),
        department: restData.department.trim(),
        description: (restData.description || '').trim(),
        is_active: restData.status === 'active',
        year: parseInt(restData.year) || new Date().getFullYear(),
        curator: (restData.curator || '').trim(),
      };

      console.log('Payload:', payload);

      if (group) {
        console.log('Updating group:', group.id);
        await groupsAPI.update(group.id, payload);
      } else {
        console.log('Creating new group');
        const response = await groupsAPI.create(payload);
        console.log('Group created:', response.data);
      }
      
      console.log('Success! Closing modal...');
      onClose();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      console.error('Error response:', error.response);
      
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
              <Label htmlFor="department">Yo'nalish *</Label>
              <Select 
                id="department" 
                {...register('department')}
                disabled={!!defaultDepartment && !group}
              >
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
              {defaultDepartment && !group && (
                <p className="text-xs text-muted-foreground">
                  Yo'nalish avtomatik tanlandi
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Kurs *</Label>
              <Select 
                id="course" 
                {...register('course')}
                disabled={!!group}
              >
                <option value="">Tanlang...</option>
                <option value="1">1-kurs</option>
                <option value="2">2-kurs</option>
              </Select>
              {errors.course && (
                <p className="text-sm text-destructive">{errors.course.message}</p>
              )}
            </div>
          </div>

          {selectedCourse && availableGroupNames.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="name">Guruh nomi *</Label>
              <Select 
                id="name" 
                {...register('name')}
                disabled={!!group}
              >
                <option value="">Guruhni tanlang...</option>
                {availableGroupNames.map((groupName) => (
                  <option key={groupName} value={groupName}>
                    {groupName}
                  </option>
                ))}
              </Select>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {selectedCourse}-kurs guruhlari: {availableGroupNames.slice(0, 5).join(', ')}...
              </p>
            </div>
          )}

          {!selectedCourse && (
            <div className="space-y-2">
              <Label htmlFor="name">Guruh nomi *</Label>
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="01-25, 02-25..." 
                disabled={!!group}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Guruh kodi *</Label>
              <Input 
                id="code" 
                {...register('code')} 
                placeholder="01-25" 
                disabled={!!group || !!selectedGroupName}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
              {selectedGroupName && (
                <p className="text-xs text-muted-foreground">
                  Kod avtomatik o'rnatildi
                </p>
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
            {loadingTeachers ? (
              <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">O'qituvchilar yuklanmoqda...</span>
              </div>
            ) : (
              <Select id="curator" {...register('curator')}>
                <option value="">Tanlang...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
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

