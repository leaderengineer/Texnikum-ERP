import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DepartmentModal } from '../../components/modals/DepartmentModal';
import { GroupModal } from '../../components/modals/GroupModal';
import { departmentsAPI, groupsAPI, studentsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

// Guruh nomidan kursni aniqlash funksiyasi
const getCourseFromGroupName = (groupName) => {
  // Guruh nomi: 01-24, 02-24, 03-24 (2-kurs) yoki 01-25, 02-25 (1-kurs)
  // Oxirgi 2 raqam yilni bildiradi
  const match = groupName.match(/-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1]);
    const currentYear = new Date().getFullYear() % 100; // Joriy yilning oxirgi 2 raqami
    const course = currentYear - year + 1;
    return course > 0 ? course : 1;
  }
  return null;
};

// Guruhlarni kurs bo'yicha guruhlash
const groupByCourse = (groups) => {
  const grouped = {};
  groups.forEach(group => {
    const course = getCourseFromGroupName(group.name || group.code);
    const courseKey = course ? `${course}-kurs` : 'boshqa';
    if (!grouped[courseKey]) {
      grouped[courseKey] = [];
    }
    grouped[courseKey].push(group);
  });
  // Kurs bo'yicha tartiblash (1-kurs, 2-kurs, ...)
  return Object.keys(grouped).sort((a, b) => {
    const aNum = parseInt(a) || 999;
    const bNum = parseInt(b) || 999;
    return aNum - bNum;
  }).reduce((acc, key) => {
    acc[key] = grouped[key];
    return acc;
  }, {});
};

export function Departments() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterCourse, setFilterCourse] = useState('all'); // 'all', '1', '2'
  
  // Group modal state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalDepartment, setGroupModalDepartment] = useState(null);
  
  // Accordion holati
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  
  // Ma'lumotlar
  const [departmentGroups, setDepartmentGroups] = useState({}); // { departmentId: [groups] }
  const [groupStudents, setGroupStudents] = useState({}); // { groupName: [students] }
  const [loadingGroups, setLoadingGroups] = useState({}); // { departmentId: boolean }
  const [loadingStudents, setLoadingStudents] = useState({}); // { groupName: boolean }

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentsAPI.getAll();
      const deptsData = response.data || [];
      
      const formattedDepartments = deptsData.map((dept) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code || '',
        description: dept.description || '',
        status: dept.status === 'active' || dept.status === 'Active' || (dept.is_active !== undefined ? (dept.is_active ? 'active' : 'inactive') : 'active'),
      }));
      
      setDepartments(formattedDepartments);
    } catch (error) {
      console.error('Yo\'nalishlarni yuklashda xatolik:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupsForDepartment = async (departmentId, departmentName, forceReload = false) => {
    // Agar forceReload false bo'lsa va cache'da ma'lumot bo'lsa, yuklamaslik
    if (!forceReload && departmentGroups[departmentId]) {
      return; // Allaqachon yuklangan
    }

    try {
      setLoadingGroups(prev => ({ ...prev, [departmentId]: true }));
      const response = await groupsAPI.getAll({ department: departmentName, limit: 1000 });
      const groups = response.data || [];
      console.log('Loaded groups for department:', departmentName, groups);
      setDepartmentGroups(prev => ({ ...prev, [departmentId]: groups }));
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setDepartmentGroups(prev => ({ ...prev, [departmentId]: [] }));
    } finally {
      setLoadingGroups(prev => ({ ...prev, [departmentId]: false }));
    }
  };

  const loadStudentsForGroup = async (groupName) => {
    if (groupStudents[groupName]) {
      return; // Allaqachon yuklangan
    }

    try {
      setLoadingStudents(prev => ({ ...prev, [groupName]: true }));
      const response = await studentsAPI.getAll({ group: groupName, limit: 1000 });
      const students = response.data?.items || response.data || [];
      setGroupStudents(prev => ({ ...prev, [groupName]: students }));
    } catch (error) {
      console.error('Talabalarni yuklashda xatolik:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setGroupStudents(prev => ({ ...prev, [groupName]: [] }));
    } finally {
      setLoadingStudents(prev => ({ ...prev, [groupName]: false }));
    }
  };

  const toggleDepartment = (departmentId, departmentName) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
      loadGroupsForDepartment(departmentId, departmentName);
    }
    setExpandedDepartments(newExpanded);
  };

  const toggleGroup = (groupName) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
      loadStudentsForGroup(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Barcha guruhlarni yig'ish (filter uchun)
  const allGroups = useMemo(() => {
    const groups = [];
    Object.values(departmentGroups).forEach(deptGroups => {
      groups.push(...deptGroups);
    });
    return groups;
  }, [departmentGroups]);

  // Filter qo'llash
  const filteredDepartments = departments.filter((dept) => {
    // Search filter
    const matchesSearch = `${dept.name} ${dept.code} ${dept.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Department filter
    const matchesDepartment = !filterDepartment || dept.name === filterDepartment || dept.id.toString() === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  }).map(dept => {
    // Guruhlar filterini qo'llash
    const groups = departmentGroups[dept.id] || [];
    let filteredGroups = groups;
    
    if (filterGroup) {
      filteredGroups = groups.filter(g => {
        const groupName = g.name || g.code || '';
        return groupName.toLowerCase().includes(filterGroup.toLowerCase());
      });
    }
    
    if (filterCourse && filterCourse !== 'all') {
      filteredGroups = filteredGroups.filter(g => {
        const groupName = g.name || g.code || '';
        const course = getCourseFromGroupName(groupName);
        return course && course.toString() === filterCourse;
      });
    }
    
    return {
      ...dept,
      filteredGroups: filteredGroups,
      hasFilteredGroups: filteredGroups.length > 0
    };
  }).filter(dept => {
    // Agar filter qo'llangan bo'lsa, faqat guruhlari bor yo'nalishlarni ko'rsatish
    if (filterGroup || (filterCourse && filterCourse !== 'all')) {
      return dept.hasFilteredGroups;
    }
    return true;
  });

  const handleEdit = (dept) => {
    setSelectedDepartment(dept);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const dept = departments.find((d) => d.id === id);
    if (window.confirm(`"${dept.name}" yo'nalishini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await departmentsAPI.delete(id);
        setDepartments(departments.filter((d) => d.id !== id));
        // O'chirilgan yo'nalish ma'lumotlarini tozalash
        setDepartmentGroups(prev => {
          const newGroups = { ...prev };
          delete newGroups[id];
          return newGroups;
        });
      } catch (error) {
        console.error('O\'chirishda xatolik:', error);
        alert('O\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleAddGroup = (department) => {
    setGroupModalDepartment(department);
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group, department) => {
    setGroupModalDepartment(department);
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async (group, departmentId) => {
    const groupName = group.name || group.code;
    if (window.confirm(`"${groupName}" guruhini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await groupsAPI.delete(group.id);
        // Guruhni ro'yxatdan olib tashlash
        setDepartmentGroups(prev => ({
          ...prev,
          [departmentId]: (prev[departmentId] || []).filter(g => g.id !== group.id)
        }));
        // Talabalar ma'lumotlarini tozalash
        setGroupStudents(prev => {
          const newStudents = { ...prev };
          delete newStudents[groupName];
          return newStudents;
        });
      } catch (error) {
        console.error('Guruhni o\'chirishda xatolik:', error);
        alert('Guruhni o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleGroupModalClose = () => {
    const departmentToRefresh = groupModalDepartment;
    
    setIsGroupModalOpen(false);
    setSelectedGroup(null);
    setGroupModalDepartment(null);
    
    // Agar guruh qo'shildi yoki yangilandi bo'lsa, ro'yxatni yangilash
    if (departmentToRefresh) {
      const departmentId = departmentToRefresh.id;
      const departmentName = departmentToRefresh.name;
      
      console.log('Refreshing groups for department:', departmentId, departmentName);
      
      // Agar yo'nalish kengaytirilgan bo'lsa, guruhlarni qayta yuklash (force reload bilan)
      if (expandedDepartments.has(departmentId)) {
        console.log('Department is expanded, force reloading groups...');
        // Force reload bilan yangi ma'lumotlarni yuklash
        loadGroupsForDepartment(departmentId, departmentName, true);
      } else {
        // Agar kengaytirilmagan bo'lsa, cache'dan o'chirish
        setDepartmentGroups(prev => {
          const newGroups = { ...prev };
          delete newGroups[departmentId];
          return newGroups;
        });
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <span className="truncate">Yo'nalishlar va guruhlar</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Yo'nalishlar, guruhlar va talabalar boshqaruvi
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
            <Plus className="mr-2 h-4 w-4" />
            Yangi yo'nalish
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Yo'nalish nomi, kodi yoki tavsif bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="filter-department" className="text-sm">Yo'nalish bo'yicha</Label>
              <Select
                id="filter-department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">Barcha yo'nalishlar</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-course" className="text-sm">Kurs bo'yicha</Label>
              <Select
                id="filter-course"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="all">Barcha kurslar</option>
                <option value="1">1-kurs</option>
                <option value="2">2-kurs</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-group" className="text-sm">Guruh bo'yicha</Label>
              <Input
                id="filter-group"
                placeholder="Guruh nomini kiriting..."
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
              />
            </div>
          </div>

          {/* Filter reset button */}
          {(filterDepartment || filterGroup || (filterCourse && filterCourse !== 'all')) && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterDepartment('');
                  setFilterGroup('');
                  setFilterCourse('all');
                }}
              >
                Filterni tozalash
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departments List */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Yuklanmoqda...</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">Yo'nalishlar topilmadi</p>
            <p className="text-sm text-muted-foreground mt-2">
              {isAdmin 
                ? "Qidiruv so'zini o'zgartiring yoki yangi yo'nalish qo'shing"
                : "Qidiruv so'zini o'zgartiring"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDepartments.map((dept) => {
            const isExpanded = expandedDepartments.has(dept.id);
            // Filter qo'llangan guruhlarni ishlatish
            const groups = dept.filteredGroups || departmentGroups[dept.id] || [];
            const isLoadingGroups = loadingGroups[dept.id];
            const groupedByCourse = groupByCourse(groups);

            return (
              <Card key={dept.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleDepartment(dept.id, dept.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary shrink-0" />
                          <span className="truncate">{dept.name}</span>
                          {dept.code && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {dept.code}
                            </Badge>
                          )}
                        </CardTitle>
                        {dept.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {dept.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {groups.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {groups.length} guruh
                        </Badge>
                      )}
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(dept);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(dept.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Groups */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    {isLoadingGroups ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Guruhlar yuklanmoqda...</p>
                      </div>
                    ) : groups.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm mb-4">Bu yo'nalishda guruhlar mavjud emas</p>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddGroup(dept);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Guruh qo'shish
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        {isAdmin && (
                          <div className="mb-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddGroup(dept);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Guruh qo'shish
                            </Button>
                          </div>
                        )}
                        <div className="space-y-4 mt-4 pl-8 border-l-2 border-primary/20">
                        {Object.entries(groupedByCourse).map(([courseKey, courseGroups]) => (
                          <div key={courseKey} className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                              {courseKey.replace('-kurs', '-kurs')}
                            </h4>
                            <div className="space-y-2">
                              {courseGroups.map((group) => {
                                const groupName = group.name || group.code;
                                const isGroupExpanded = expandedGroups.has(groupName);
                                const students = groupStudents[groupName] || [];
                                const isLoadingStudents = loadingStudents[groupName];
                                const course = getCourseFromGroupName(groupName);

                                return (
                                  <Card key={group.id || groupName} className="border-l-4 border-l-primary/50">
                                    <CardHeader 
                                      className="cursor-pointer hover:bg-accent/30 transition-colors py-3"
                                      onClick={() => toggleGroup(groupName)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          {isGroupExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                          )}
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <UserCircle className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-medium">{groupName}</span>
                                            {course && (
                                              <Badge variant="outline" className="text-xs">
                                                {course}-kurs
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {students.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                              {students.length} talaba
                                            </Badge>
                                          )}
                                          {isAdmin && (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditGroup(group, dept);
                                                }}
                                              >
                                                <Edit className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteGroup(group, dept.id);
                                                }}
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </CardHeader>

                                    {/* Students */}
                                    {isGroupExpanded && (
                                      <CardContent className="pt-0 pb-3">
                                        {isLoadingStudents ? (
                                          <div className="py-6 text-center text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                                            <p className="text-xs">Talabalar yuklanmoqda...</p>
                                          </div>
                                        ) : students.length === 0 ? (
                                          <div className="py-6 text-center text-muted-foreground">
                                            <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Bu guruhda talabalar mavjud emas</p>
                                          </div>
                                        ) : (
                                          <div className="space-y-2 mt-2 pl-6 border-l-2 border-primary/10">
                                            <div className="grid gap-2">
                                              {students.map((student) => (
                                                <div
                                                  key={student.id}
                                                  className="flex items-center justify-between p-2 rounded-md bg-accent/30 hover:bg-accent/50 transition-colors"
                                                >
                                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-medium truncate">
                                                        {student.first_name} {student.last_name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground truncate">
                                                        ID: {student.student_id || student.id}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  {student.status && (
                                                    <Badge 
                                                      variant={student.status === 'active' ? 'default' : 'secondary'}
                                                      className="text-xs shrink-0"
                                                    >
                                                      {student.status === 'active' ? 'Faol' : 'Nofaol'}
                                                    </Badge>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    )}
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
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

      {/* Group Edit/Add Modal */}
      {isGroupModalOpen && groupModalDepartment && (
        <GroupModal
          group={selectedGroup}
          departments={departments}
          defaultDepartment={groupModalDepartment.name}
          onClose={handleGroupModalClose}
        />
      )}
    </div>
  );
}
