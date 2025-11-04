import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Building2, Filter, Award } from 'lucide-react';
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
import { Select } from '../../components/ui/Select';
import { teachersAPI } from '../../services/api';
import { TeacherModal } from '../../components/modals/TeacherModal';

export function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await teachersAPI.getAll();
      const teachersData = response.data || [];
      
      // Backend formatidan frontend formatiga o'tkazish
      const formattedTeachers = teachersData.map((teacher) => ({
        id: teacher.id,
        firstName: teacher.first_name || '',
        lastName: teacher.last_name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        department: teacher.department || '',
        status: teacher.status === 'active' || teacher.status === 'Active' || (teacher.is_active !== undefined ? (teacher.is_active ? 'active' : 'inactive') : 'active'),
      }));
      
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error('O\'qituvchilarni yuklashda xatolik:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu o\'qituvchini o\'chirishni tasdiqlaysizmi?')) {
      try {
        await teachersAPI.delete(id);
        setTeachers(teachers.filter((t) => t.id !== id));
      } catch (error) {
        console.error('O\'chirishda xatolik:', error);
        alert('O\'chirishda xatolik yuz berdi');
      }
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Axborot texnologiyalari': 'from-blue-600 to-indigo-600',
      'Muhandislik': 'from-purple-600 to-pink-600',
      'Iqtisodiyot': 'from-green-600 to-teal-600',
      'Ta\'lim': 'from-orange-600 to-amber-600',
    };
    return colors[department] || 'from-gray-600 to-gray-700';
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = `${teacher.firstName} ${teacher.lastName} ${teacher.email} ${teacher.phone} ${teacher.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const uniqueDepartments = [...new Set(teachers.map(t => t.department))];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <span className="truncate">O'qituvchilar</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">O'qituvchilar ro'yxati va boshqaruvi</p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Qo'shish
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>O'qituvchilar ro'yxati</CardTitle>
          <CardDescription>
            Barcha o'qituvchilar haqida ma'lumot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish (ism, email, telefon, yo'nalish)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-[180px]"
                >
                  <option value="all">Barcha yo'nalishlar</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-[140px]"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Jami: {filteredTeachers.length} ta o'qituvchi</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredTeachers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  O'qituvchilar topilmadi
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <Card
                    key={teacher.id}
                    className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getDepartmentColor(teacher.department)}`}></div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br ${getDepartmentColor(teacher.department)} flex items-center justify-center text-white text-base sm:text-xl font-bold shadow-xl ring-4 ring-primary/10 shrink-0`}>
                            {getInitials(teacher.firstName, teacher.lastName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold mb-1 flex items-center gap-2">
                              <span className="truncate">{teacher.firstName} {teacher.lastName}</span>
                              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70 shrink-0" />
                            </CardTitle>
                            <div className="text-xs text-muted-foreground">
                              O'qituvchi
                            </div>
                          </div>
                        </div>
                        <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                          {teacher.status === 'active' ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-0 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{teacher.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 shrink-0 text-primary" />
                          <span className="font-medium truncate">{teacher.department}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                          className="flex-1 sm:flex-none touch-manipulation"
                        >
                          <Edit className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Tahrirlash</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                          className="text-destructive hover:text-destructive touch-manipulation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <TeacherModal
          teacher={selectedTeacher}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTeacher(null);
            // Modal ichida saqlashdan keyin ro'yxat yangilanadi
            setTimeout(() => {
              loadTeachers();
            }, 100);
          }}
        />
      )}
    </div>
  );
}
