import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2,
  GraduationCap,
  Users,
  TrendingUp,
  MoreVertical,
  Eye
} from 'lucide-react';
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
import { DepartmentModal } from '../../components/modals/DepartmentModal';
import { DepartmentDetailsModal } from '../../components/modals/DepartmentDetailsModal';

const departmentColors = [
  { bg: 'bg-gradient-to-br from-blue-500 to-blue-700', light: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-gradient-to-br from-green-500 to-green-700', light: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800' },
  { bg: 'bg-gradient-to-br from-purple-500 to-purple-700', light: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800' },
  { bg: 'bg-gradient-to-br from-orange-500 to-orange-700', light: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800' },
  { bg: 'bg-gradient-to-br from-pink-500 to-pink-700', light: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800' },
  { bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700', light: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-800' },
];

export function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    // Mock data - yanada ko'p ma'lumotlar bilan
    setDepartments([
      {
        id: 1,
        name: 'Axborot texnologiyalari',
        code: 'AT',
        description: 'Axborot texnologiyalari va kompyuter fanlari yo\'nalishi. Dasturlash, web dizayn, ma\'lumotlar bazasi va zamonaviy IT texnologiyalarini o\'rgatadi.',
        studentsCount: 320,
        teachersCount: 15,
        groupsCount: 12,
        coursesCount: 24,
        status: 'active',
        establishedYear: 2015,
        head: 'Prof. Alisher Nazirov',
      },
      {
        id: 2,
        name: 'Muhandislik',
        code: 'M',
        description: 'Muhandislik va texnika yo\'nalishi. Qurilish, mashinasozlik, elektrotexnika va boshqa muhandislik sohalari.',
        studentsCount: 280,
        teachersCount: 12,
        groupsCount: 10,
        coursesCount: 20,
        status: 'active',
        establishedYear: 2013,
        head: 'Prof. Dilshoda Karimova',
      },
      {
        id: 3,
        name: 'Iqtisodiyot',
        code: 'I',
        description: 'Iqtisodiyot va menejment yo\'nalishi. Buxgalteriya, moliya, marketing va biznes boshqaruvi.',
        studentsCount: 245,
        teachersCount: 10,
        groupsCount: 8,
        coursesCount: 18,
        status: 'active',
        establishedYear: 2014,
        head: 'Prof. Jahongir Umarov',
      },
      {
        id: 4,
        name: 'Ta\'lim',
        code: 'T',
        description: 'Pedagogika va ta\'lim yo\'nalishi. Boshlang\'ich ta\'lim, maktabgacha ta\'lim va maxsus ta\'lim.',
        studentsCount: 203,
        teachersCount: 8,
        groupsCount: 7,
        coursesCount: 16,
        status: 'active',
        establishedYear: 2012,
        head: 'Prof. Malika Yuldasheva',
      },
      {
        id: 5,
        name: 'San\'at va dizayn',
        code: 'SD',
        description: 'San\'at va dizayn yo\'nalishi. Grafik dizayn, interyer dizayn va amaliy san\'at.',
        studentsCount: 156,
        teachersCount: 6,
        groupsCount: 5,
        coursesCount: 12,
        status: 'active',
        establishedYear: 2018,
        head: 'Prof. Aziz Karimov',
      },
    ]);
    setLoading(false);
  };

  const filteredDepartments = departments.filter((dept) =>
    `${dept.name} ${dept.code} ${dept.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalStudents = departments.reduce((sum, dept) => sum + dept.studentsCount, 0);
  const totalTeachers = departments.reduce((sum, dept) => sum + dept.teachersCount, 0);
  const totalGroups = departments.reduce((sum, dept) => sum + dept.groupsCount, 0);
  const activeDepartments = departments.filter((dept) => dept.status === 'active').length;

  const handleEdit = (dept) => {
    setSelectedDepartment(dept);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleViewDetails = (dept) => {
    setSelectedDepartment(dept);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = (id) => {
    const dept = departments.find((d) => d.id === id);
    if (window.confirm(`"${dept.name}" yo'nalishini o'chirishni tasdiqlaysizmi?`)) {
      setDepartments(departments.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <span className="truncate">Yo'nalishlar</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Kafedralar va yo'nalishlar boshqaruvi
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Yangi yo'nalish
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami yo'nalishlar</p>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{activeDepartments} faol</p>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami talabalar</p>
                <p className="text-2xl font-bold text-green-600">{totalStudents}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami o'qituvchilar</p>
                <p className="text-2xl font-bold text-blue-600">{totalTeachers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami guruhlar</p>
                <p className="text-2xl font-bold text-purple-600">{totalGroups}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Yo'nalish nomi, kodi yoki tavsif bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
      ) : filteredDepartments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">Yo'nalishlar topilmadi</p>
            <p className="text-sm text-muted-foreground mt-2">
              Qidiruv so'zini o'zgartiring yoki yangi yo'nalish qo'shing
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDepartments.map((dept, index) => {
            const colorScheme = departmentColors[index % departmentColors.length];
            return (
              <Card
                key={dept.id}
                className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${colorScheme.border} border-2`}
              >
                {/* Header with gradient */}
                <div className={`${colorScheme.bg} h-32 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Badge className="text-xs font-bold bg-white/0 text-white border-white/30">
                        {dept.code}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => handleEdit(dept)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white text-destructive hover:text-destructive"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-white/90 line-clamp-1">
                      {dept.description}
                    </p>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dept.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className={`${colorScheme.light} rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Talabalar</span>
                        </div>
                        <p className="text-xl font-bold">{dept.studentsCount}</p>
                      </div>
                      <div className={`${colorScheme.light} rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">O'qituvchilar</span>
                        </div>
                        <p className="text-xl font-bold">{dept.teachersCount}</p>
                      </div>
                      <div className={`${colorScheme.light} rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Guruhlar</span>
                        </div>
                        <p className="text-xl font-bold">{dept.groupsCount}</p>
                      </div>
                      <div className={`${colorScheme.light} rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Fanlar</span>
                        </div>
                        <p className="text-xl font-bold">{dept.coursesCount}</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Rahbar:</span>
                        <span className="font-medium">{dept.head}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tashkil etilgan:</span>
                        <span className="font-medium">{dept.establishedYear}</span>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Badge
                        variant={dept.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {dept.status === 'active' ? 'Faol' : 'Nofaol'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(dept)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Batafsil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Department Edit/Add Modal */}
      {isModalOpen && (
        <DepartmentModal
          department={selectedDepartment}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDepartment(null);
            loadDepartments();
          }}
        />
      )}

      {/* Department Details Modal */}
      {isDetailsModalOpen && (
        <DepartmentDetailsModal
          department={selectedDepartment}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedDepartment(null);
          }}
        />
      )}
    </div>
  );
}