import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  Building2,
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
import { GroupModal } from '../../components/modals/GroupModal';
import { GroupDetailsModal } from '../../components/modals/GroupDetailsModal';
import { groupsAPI, studentsAPI, departmentsAPI } from '../../services/api';

const groupColors = [
  { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', light: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', light: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800' },
  { bg: 'bg-gradient-to-br from-green-500 to-emerald-500', light: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800' },
  { bg: 'bg-gradient-to-br from-orange-500 to-red-500', light: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800' },
  { bg: 'bg-gradient-to-br from-indigo-500 to-blue-500', light: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-800' },
  { bg: 'bg-gradient-to-br from-teal-500 to-green-500', light: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-200 dark:border-teal-800' },
];

export function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadGroups();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Yo\'nalishlarni yuklashda xatolik:', error);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getAll();
      const groupsData = response.data || [];
      
      // Har bir guruh uchun talabalar sonini olish
      const groupsWithStats = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const studentsResponse = await studentsAPI.getAll({ group: group.name });
            const students = studentsResponse.data || [];
            return {
              id: group.id,
              name: group.name,
              code: group.code || group.name,
              department: group.department || '',
              description: group.description || '',
              studentsCount: students.length,
              status: group.is_active !== false ? 'active' : 'inactive',
              year: group.year || new Date().getFullYear(),
              curator: group.curator || '',
            };
          } catch (error) {
            console.error(`Guruh ${group.name} uchun statistikani yuklashda xatolik:`, error);
            return {
              id: group.id,
              name: group.name,
              code: group.code || group.name,
              department: group.department || '',
              description: group.description || '',
              studentsCount: 0,
              status: group.is_active !== false ? 'active' : 'inactive',
              year: group.year || new Date().getFullYear(),
              curator: group.curator || '',
            };
          }
        })
      );
      
      setGroups(groupsWithStats);
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter((group) =>
    `${group.name} ${group.code} ${group.department} ${group.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalStudents = groups.reduce((sum, group) => sum + group.studentsCount, 0);
  const activeGroups = groups.filter((group) => group.status === 'active').length;
  const totalGroups = groups.length;

  const getGroupColor = (index) => {
    return groupColors[index % groupColors.length];
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu guruhni o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await groupsAPI.delete(id);
      await loadGroups();
    } catch (error) {
      console.error('Guruhni o\'chirishda xatolik:', error);
      alert('Guruhni o\'chirishda xatolik yuz berdi');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setTimeout(() => {
      loadGroups();
    }, 100);
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Guruhlar</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Barcha guruhlarni boshqarish va ko'rish
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
          <Plus className="mr-2 h-4 w-4" />
          Yangi guruh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami guruhlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">Barcha guruhlar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol guruhlar</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGroups}</div>
            <p className="text-xs text-muted-foreground">Ishlamoqda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami talabalar</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Barcha guruhlarda</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish (guruh nomi, kod, yo'nalish)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="touch-manipulation"
              >
                <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="touch-manipulation"
              >
                <div className="flex flex-col gap-0.5 h-4 w-4">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups List/Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Guruhlar topilmadi</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Qidiruv natijasiga mos guruhlar topilmadi' : 'Hozircha guruhlar mavjud emas'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Birinchi guruhni qo'shish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGroups.map((group, index) => {
            const color = getGroupColor(index);
            return (
              <Card key={group.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${color.border} border-2`}>
                <div className={`${color.bg} h-24 sm:h-32 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl sm:text-3xl font-bold mb-1">{group.code}</div>
                      <div className="text-sm sm:text-base opacity-90">{group.name}</div>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl truncate">{group.name}</CardTitle>
                      <CardDescription className="mt-1 truncate">{group.department || 'Yo\'nalish belgilanmagan'}</CardDescription>
                    </div>
                    <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                      {group.status === 'active' ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className={`${color.light} p-2 sm:p-3 rounded-lg`}>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Talabalar</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold">{group.studentsCount}</p>
                    </div>
                    <div className={`${color.light} p-2 sm:p-3 rounded-lg`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Yil</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold">{group.year}</p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(group)}
                      className="flex-1 touch-manipulation"
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      Batafsil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(group)}
                      className="flex-1 touch-manipulation"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(group.id)}
                      className="touch-manipulation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group, index) => {
            const color = getGroupColor(index);
            return (
              <Card key={group.id} className={`${color.border} border-l-4 hover:shadow-md transition-shadow`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`${color.bg} w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl`}>
                          {group.code.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold truncate">{group.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{group.department || 'Yo\'nalish belgilanmagan'}</p>
                        </div>
                        <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                          {group.status === 'active' ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Talabalar:</span>
                          <span className="font-semibold">{group.studentsCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Yil:</span>
                          <span className="font-semibold">{group.year}</span>
                        </div>
                        {group.curator && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Kurator:</span>
                            <span className="font-semibold">{group.curator}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(group)}
                        className="flex-1 sm:flex-none touch-manipulation"
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Batafsil
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(group)}
                        className="flex-1 sm:flex-none touch-manipulation"
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Tahrirlash
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(group.id)}
                        className="touch-manipulation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <GroupModal
          group={selectedGroup}
          departments={departments}
          onClose={handleModalClose}
        />
      )}
      {isDetailsModalOpen && (
        <GroupDetailsModal
          group={selectedGroup}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
}

