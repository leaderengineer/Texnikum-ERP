import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import useAuthStore from '../../store/authStore';
import { ScheduleModal } from '../../components/modals/ScheduleModal';

const weekDays = [
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
];

const dayColors = {
  Dushanba: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  Seshanba: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  Chorshanba: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  Payshanba: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  Juma: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  Shanba: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800',
};

const dayIcons = {
  Dushanba: '🔵',
  Seshanba: '🟢',
  Chorshanba: '🟣',
  Payshanba: '🟠',
  Juma: '🔴',
  Shanba: '🔷',
};

export function Schedules() {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    // Mock data - barcha kunlar uchun
    setSchedules([
      {
        id: 1,
        group: 'AT-21-01',
        subject: 'Web dasturlash',
        teacher: 'Alisher Nazirov',
        day: 'Dushanba',
        time: '09:00-10:30',
        room: '101',
      },
      {
        id: 2,
        group: 'AT-21-01',
        subject: 'Ma\'lumotlar bazasi',
        teacher: 'Dilshoda Karimova',
        day: 'Dushanba',
        time: '11:00-12:30',
        room: '102',
      },
      {
        id: 3,
        group: 'AT-21-01',
        subject: 'Python dasturlash',
        teacher: 'Jahongir Umarov',
        day: 'Dushanba',
        time: '14:00-15:30',
        room: '203',
      },
      {
        id: 4,
        group: 'AT-21-01',
        subject: 'Kompyuter tarmoqlari',
        teacher: 'Aziz Karimov',
        day: 'Seshanba',
        time: '09:00-10:30',
        room: '104',
      },
      {
        id: 5,
        group: 'AT-21-01',
        subject: 'Algoritmlar va ma\'lumotlar strukturasi',
        teacher: 'Malika Yuldasheva',
        day: 'Seshanba',
        time: '11:00-12:30',
        room: '105',
      },
      {
        id: 6,
        group: 'AT-21-01',
        subject: 'JavaScript asoslari',
        teacher: 'Alisher Nazirov',
        day: 'Chorshanba',
        time: '09:00-10:30',
        room: '101',
      },
      {
        id: 7,
        group: 'AT-21-01',
        subject: 'Veb dizayn',
        teacher: 'Dilshoda Karimova',
        day: 'Chorshanba',
        time: '11:00-12:30',
        room: '106',
      },
      {
        id: 8,
        group: 'AT-21-01',
        subject: 'React.js',
        teacher: 'Jahongir Umarov',
        day: 'Payshanba',
        time: '09:00-10:30',
        room: '203',
      },
      {
        id: 9,
        group: 'AT-21-01',
        subject: 'Node.js',
        teacher: 'Aziz Karimov',
        day: 'Payshanba',
        time: '11:00-12:30',
        room: '104',
      },
      {
        id: 10,
        group: 'AT-21-01',
        subject: 'Mobile dasturlash',
        teacher: 'Malika Yuldasheva',
        day: 'Juma',
        time: '09:00-10:30',
        room: '107',
      },
      {
        id: 11,
        group: 'AT-21-01',
        subject: 'Loyiha boshqaruvi',
        teacher: 'Alisher Nazirov',
        day: 'Juma',
        time: '11:00-12:30',
        room: '101',
      },
      {
        id: 12,
        group: 'AT-21-01',
        subject: 'Texnik yozuvlar',
        teacher: 'Dilshoda Karimova',
        day: 'Shanba',
        time: '09:00-10:30',
        room: '102',
      },
    ]);
    setLoading(false);
  };

  const getSchedulesByDay = (day) => {
    let filtered = schedules.filter((schedule) => schedule.day === day);
    
    if (searchTerm) {
      filtered = filtered.filter((schedule) =>
        `${schedule.group} ${schedule.subject} ${schedule.teacher} ${schedule.room}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGroup) {
      filtered = filtered.filter((schedule) => schedule.group === selectedGroup);
    }
    
    return filtered.sort((a, b) => {
      const timeA = a.time.split('-')[0];
      const timeB = b.time.split('-')[0];
      return timeA.localeCompare(timeB);
    });
  };

  const uniqueGroups = [...new Set(schedules.map((s) => s.group))];

  const handleAdd = () => {
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const schedule = schedules.find((s) => s.id === id);
    if (window.confirm(`"${schedule.subject}" darsini o'chirishni tasdiqlaysizmi?`)) {
      setSchedules(schedules.filter((s) => s.id !== id));
    }
  };

  const handleSave = async (data) => {
    if (selectedSchedule) {
      // Update existing schedule
      setSchedules(schedules.map((s) => 
        s.id === selectedSchedule.id ? { ...s, ...data } : s
      ));
    } else {
      // Create new schedule
      const newSchedule = {
        id: Math.max(...schedules.map(s => s.id), 0) + 1,
        ...data,
      };
      setSchedules([...schedules, newSchedule]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Dars jadvallari</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Guruhlar uchun dars jadvallari
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
            <Plus className="mr-2 h-4 w-4" />
            Qo'shish
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Guruh, fan, o'qituvchi yoki xona bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Barcha guruhlar</option>
                {uniqueGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Schedule Cards */}
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Yuklanmoqda...</div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {weekDays.map((day) => {
            const daySchedules = getSchedulesByDay(day);
            return (
              <Card
                key={day}
                className={`${dayColors[day]} transition-all hover:shadow-lg`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{dayIcons[day]}</span>
                      <CardTitle className="text-xl">{day}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {daySchedules.length} dars
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {daySchedules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Bu kunda darslar yo'q
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  {schedule.subject}
                                </h4>
                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="font-medium">{schedule.group}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">O'qituvchi:</span>
                                    <span>{schedule.teacher}</span>
                                  </div>
                                </div>
                              </div>
                              {user?.role === 'admin' && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEdit(schedule)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(schedule.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 pt-2 border-t border-border">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <span className="font-medium">{schedule.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span className="font-medium">Xona {schedule.room}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <ScheduleModal
          schedule={selectedSchedule}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSchedule(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}