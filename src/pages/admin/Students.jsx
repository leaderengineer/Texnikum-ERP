import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, GraduationCap, Mail, Phone, Users, Building2, Filter, X } from 'lucide-react';
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
import { studentsAPI, groupsAPI, departmentsAPI } from '../../services/api';
import { StudentModal } from '../../components/modals/StudentModal';
import { Pagination } from '../../components/ui/Pagination';

export function Students() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [currentPage, itemsPerPage, filterDepartment, filterGroup, filterStatus, searchTerm]);

  const loadFilters = async () => {
    try {
      setLoadingFilters(true);
      // Guruhlarni yuklash
      const groupsResponse = await groupsAPI.getAll();
      const groupsData = groupsResponse.data || [];
      setGroups(groupsData);

      // Yo'nalishlarni yuklash
      const departmentsResponse = await departmentsAPI.getAll();
      const departmentsData = departmentsResponse.data || [];
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Filter ma\'lumotlarini yuklashda xatolik:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Backend'ga pagination parametrlarini yuborish
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Filterlar
      if (filterDepartment !== 'all') {
        params.department = filterDepartment;
      }
      if (filterGroup !== 'all') {
        params.group = filterGroup;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await studentsAPI.getAll(params);
      
      // Pagination response format: { items: [...], meta: { total, page, limit, ... } }
      const responseData = response.data || {};
      const studentsData = responseData.items || [];
      const meta = responseData.meta || {};
      
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
      setTotalItems(meta.total || 0);
      setTotalPages(meta.total_pages || 0);
      
      // Agar joriy sahifa mavjud bo'lmasa, birinchi sahifaga o'tish
      if (meta.total_pages > 0 && currentPage > meta.total_pages) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Talabalarni yuklashda xatolik:', error);
      setStudents([]);
      setTotalItems(0);
      setTotalPages(0);
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

  // Frontend'da filterlash endi kerak emas, chunki backend'da qilinadi
  // Lekin eski kod bilan mos kelish uchun filteredStudents o'zgaruvchisini saqlaymiz
  const filteredStudents = students;

  // Filterlarni tozalash funksiyasi
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('all');
    setFilterGroup('all');
    setFilterStatus('all');
    setCurrentPage(1); // Filter tozalanganda birinchi sahifaga qaytish
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Items per page o'zgarganda birinchi sahifaga qaytish
  };

  // Search debounce - qidiruvni biroz kechiktirish
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Qidiruv o'zgarganda birinchi sahifaga qaytish
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Faol filterlar soni
  const activeFiltersCount = [
    searchTerm,
    filterDepartment !== 'all',
    filterGroup !== 'all',
    filterStatus !== 'all',
  ].filter(Boolean).length;

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
            {/* Qidirish va Filterlar */}
            <div className="space-y-3">
              {/* Qidirish input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish (ism, familiya, ID, email, guruh, yo'nalish)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filterlar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  disabled={loadingFilters}
                  className="w-full sm:w-[200px]"
                >
                  <option value="all">Barcha yo'nalishlar</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  disabled={loadingFilters}
                  className="w-full sm:w-[200px]"
                >
                  <option value="all">Barcha guruhlar</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-[150px]"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Tozalash ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Natijalar va statistika */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Jami: <span className="font-semibold text-foreground">{totalItems}</span> ta talaba
                {totalItems !== filteredStudents.length && (
                  <span className="ml-1">
                    (Ko'rsatilmoqda: {filteredStudents.length} ta)
                  </span>
                )}
              </span>
            </div>
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Qidiruv: "{searchTerm}"
                    </Badge>
                  )}
                  {filterDepartment !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Yo'nalish: {filterDepartment}
                    </Badge>
                  )}
                  {filterGroup !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Guruh: {filterGroup}
                    </Badge>
                  )}
                  {filterStatus !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Holat: {filterStatus === 'active' ? 'Faol' : 'Nofaol'}
                    </Badge>
                  )}
                </div>
              )}
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

          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
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
