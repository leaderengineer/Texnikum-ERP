import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, GraduationCap, Mail, Phone, Users, Building2, Filter } from 'lucide-react';
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
import { studentsAPI } from '../../services/api';
import { StudentModal } from '../../components/modals/StudentModal';

export function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      const studentsData = response.data || [];
      
      // Backend formatidan frontend formatiga o'tkazish
      const formattedStudents = studentsData.map((student) => ({
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        studentId: student.student_id || '',
        email: student.email || '',
        phone: student.phone || '',
        group: student.group || '',
        department: student.department || '',
        status: student.status === 'active' || student.status === 'Active' ? 'active' : 'inactive',
      }));
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Talabalarni yuklashda xatolik:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu talabani o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await studentsAPI.delete(id);
      // Ro'yxatni yangilash
      await loadStudents();
      // Yoki lokal state'ni yangilash
      // setStudents(students.filter((s) => s.id !== id));
    } catch (error) {
      console.error('O\'chirishda xatolik:', error);
      
      // Xatolikni to'g'ri ko'rsatish
      let errorMessage = 'O\'chirishda xatolik yuz berdi';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = String(errorData.detail);
        } else if (errorData.message) {
          errorMessage = String(errorData.message);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Axborot texnologiyalari': 'from-blue-500 to-cyan-500',
      'Muhandislik': 'from-purple-500 to-pink-500',
      'Iqtisodiyot': 'from-green-500 to-emerald-500',
      'Ta\'lim': 'from-orange-500 to-red-500',
    };
    return colors[department] || 'from-gray-500 to-gray-600';
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = `${student.firstName} ${student.lastName} ${student.studentId} ${student.email} ${student.group}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const uniqueDepartments = [...new Set(students.map(s => s.department))];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <span className="truncate">Talabalar</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Talabalar ro'yxati va boshqaruvi</p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Qo'shish
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talabalar ro'yxati</CardTitle>
          <CardDescription>Barcha talabalar haqida ma'lumot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish (ism, ID, email, guruh)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full sm:w-[180px]"
                >
                  <option value="all">Barcha yo'nalishlar</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-[140px]"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Jami: {filteredStudents.length} ta talaba</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredStudents.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Talabalar topilmadi
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getDepartmentColor(student.department)}`}></div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br ${getDepartmentColor(student.department)} flex items-center justify-center text-white text-base sm:text-xl font-bold shadow-lg shrink-0`}>
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold mb-1 truncate">
                              {student.firstName} {student.lastName}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <GraduationCap className="h-3 w-3" />
                              <span className="font-mono">{student.studentId}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                          {student.status === 'active' ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-0 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 shrink-0" />
                          <span className="font-medium">{student.group}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">{student.department}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="flex-1 sm:flex-none touch-manipulation"
                        >
                          <Edit className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Tahrirlash</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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
        <StudentModal
          student={selectedStudent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
            // Modal ichida saqlashdan keyin ro'yxat yangilanadi
            setTimeout(() => {
              loadStudents();
            }, 100);
          }}
        />
      )}
    </div>
  );
}
