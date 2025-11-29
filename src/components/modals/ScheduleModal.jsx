import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, MapPin, Users, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { schedulesAPI, groupsAPI, teachersAPI } from '../../services/api';

const scheduleSchema = z.object({
  group: z.string().min(1, 'Guruh tanlanishi kerak'),
  subject: z.string().min(1, 'Fan nomi kiritilishi kerak'),
  teacher: z.string().min(1, 'O\'qituvchi tanlanishi kerak'),
  day: z.string().min(1, 'Kun tanlanishi kerak'),
  time: z.string().min(1, 'Vaqt kiritilishi kerak'),
  room: z.string().min(1, 'Xona raqami kiritilishi kerak'),
});

const weekDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const timeSlots = [
  '08:00-09:30',
  '09:00-10:30',
  '10:00-11:30',
  '11:00-12:30',
  '12:00-13:30',
  '13:00-14:30',
  '14:00-15:30',
  '15:00-16:30',
  '16:00-17:30',
];

export function ScheduleModal({ schedule, onClose, onSave }) {
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: schedule || {
      group: '',
      subject: '',
      teacher: '',
      day: '',
      time: '',
      room: '',
    },
  });

  // Guruhlarni yuklash
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await groupsAPI.getAll({ limit: 1000 });
        const groupsData = response.data?.items || response.data || [];
        // Guruhlarni nom bo'yicha tartiblash
        const sortedGroups = groupsData.sort((a, b) => {
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

    loadGroups();
  }, []);

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

  useEffect(() => {
    if (schedule) {
      reset(schedule);
    } else {
      reset({
        group: '',
        subject: '',
        teacher: '',
        day: '',
        time: '',
        room: '',
      });
    }
  }, [schedule, reset]);

  const onSubmit = async (data) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      alert('Saqlashda xatolik yuz berdi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {schedule ? 'Dars jadvalini tahrirlash' : 'Yangi dars qo\'shish'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 touch-manipulation ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group">Guruh *</Label>
              {loadingGroups ? (
                <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Guruhlar yuklanmoqda...</span>
                </div>
              ) : groups.length === 0 ? (
                <div className="flex items-center justify-center h-10 border rounded-md bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Guruhlar topilmadi. Avval guruh qo'shing.
                  </span>
                </div>
              ) : (
                <Select id="group" {...register('group')}>
                  <option value="">Tanlang...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.name || group.code}>
                      {group.name || group.code} {group.department ? `(${group.department})` : ''}
                    </option>
                  ))}
                </Select>
              )}
              {errors.group && (
                <p className="text-sm text-destructive">{errors.group.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="day">Hafta kuni *</Label>
              <Select id="day" {...register('day')}>
                <option value="">Tanlang...</option>
                {weekDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </Select>
              {errors.day && (
                <p className="text-sm text-destructive">{errors.day.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Fan nomi *</Label>
            <Input id="subject" {...register('subject')} placeholder="Web dasturlash" />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">O'qituvchi *</Label>
            {loadingTeachers ? (
              <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">O'qituvchilar yuklanmoqda...</span>
              </div>
            ) : teachers.length === 0 ? (
              <div className="flex items-center justify-center h-10 border rounded-md bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  O'qituvchilar topilmadi. Avval o'qituvchi qo'shing.
                </span>
              </div>
            ) : (
              <Select id="teacher" {...register('teacher')}>
                <option value="">Tanlang...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </Select>
            )}
            {errors.teacher && (
              <p className="text-sm text-destructive">{errors.teacher.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Vaqt *</Label>
              <Select id="time" {...register('time')}>
                <option value="">Tanlang...</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </Select>
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Xona raqami *</Label>
              <Input id="room" {...register('room')} placeholder="101" />
              {errors.room && (
                <p className="text-sm text-destructive">{errors.room.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto touch-manipulation">
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto touch-manipulation">
              {isSubmitting ? 'Saqlanmoqda...' : schedule ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

