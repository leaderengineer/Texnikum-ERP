import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Building2, Filter, Award, LayoutGrid, List } from 'lucide-react';
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
import { Pagination } from '../../components/ui/Pagination';

export function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // View mode state (card or table)
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('teachersViewMode');
    return saved || 'card';
  });

  useEffect(() => {
    loadTeachers();
  }, [currentPage, itemsPerPage, filterDepartment, filterStatus, searchTerm]);

  // View mode ni localStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem('teachersViewMode', viewMode);
  }, [viewMode]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Barcha o'qituvchilarni yuklab, frontend'da filterlash va pagination qilish
      // (chunki backend search qo'llab-quvvatlamaydi)
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
      
      // Barcha o'qituvchilarni saqlash (uniqueDepartments uchun)
      const formattedAllTeachers = allTeachersData.map((teacher) => {
        let normalizedStatus = 'active';
        if (teacher.status) {
          const statusStr = String(teacher.status).toLowerCase().trim();
          normalizedStatus = (statusStr === 'active') ? 'active' : 'inactive';
        } else if (teacher.is_active !== undefined) {
          normalizedStatus = teacher.is_active ? 'active' : 'inactive';
        }
        
        return {
          id: teacher.id,
          firstName: teacher.first_name || '',
          lastName: teacher.last_name || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          department: teacher.department || '',
          status: normalizedStatus,
        };
      });
      
      setAllTeachers(formattedAllTeachers);
      
      // Frontend'da filterlash
      let filtered = formattedAllTeachers.filter((teacher) => {
        const matchesSearch = searchTerm ? 
          `${teacher.firstName} ${teacher.lastName} ${teacher.email} ${teacher.phone} ${teacher.department}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) : true;
        const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment;
        const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
        return matchesSearch && matchesDepartment && matchesStatus;
      });
      
      // Pagination
      const skip = (currentPage - 1) * itemsPerPage;
      const totalFiltered = filtered.length;
      const paginatedTeachers = filtered.slice(skip, skip + itemsPerPage);
      
      setTeachers(paginatedTeachers);
      setTotalItems(totalFiltered);
      setTotalPages(Math.ceil(totalFiltered / itemsPerPage));
      
      // Agar joriy sahifa mavjud bo'lmasa, birinchi sahifaga o'tish
      const calculatedTotalPages = Math.ceil(totalFiltered / itemsPerPage);
      if (calculatedTotalPages > 0 && currentPage > calculatedTotalPages) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('O\'qituvchilarni yuklashda xatolik:', error);
      setTeachers([]);
      setAllTeachers([]);
      setTotalItems(0);
      setTotalPages(0);
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
        // Pagination bilan ishlash uchun loadTeachers ni chaqirish
        loadTeachers();
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

  // Pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [allTeachers, setAllTeachers] = useState([]); // Barcha o'qituvchilar (filterlar uchun)
  
  // Frontend'da filterlash endi kerak emas, chunki backend'da qilinadi
  // Lekin eski kod bilan mos kelish uchun filteredTeachers o'zgaruvchisini saqlaymiz
  const filteredTeachers = teachers;

  // Filterlarni tozalash funksiyasi
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('all');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Search debounce - qidiruvni biroz kechiktirish
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Faol filterlar soni
  const activeFiltersCount = [
    searchTerm,
    filterDepartment !== 'all',
    filterStatus !== 'all',
  ].filter(Boolean).length;

  const uniqueDepartments = [...new Set(allTeachers.map(t => t.department))];

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
            {/* Natijalar va statistika */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>
                  Jami: <span className="font-semibold text-foreground">{totalItems}</span> ta o'qituvchi
                  {totalItems !== filteredTeachers.length && (
                    <span className="ml-1">
                      (Ko'rsatilmoqda: {filteredTeachers.length} ta)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
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
                    {filterStatus !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Holat: {filterStatus === 'active' ? 'Faol' : 'Nofaol'}
                      </Badge>
                    )}
                  </div>
                )}
                {/* View Mode Toggle Buttons */}
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className="h-9 px-3"
                    title="Card ko'rinish"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-9 px-3"
                    title="Table ko'rinish"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              O'qituvchilar topilmadi
            </div>
          ) : viewMode === 'card' ? (
            // Card View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredTeachers.map((teacher) => (
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
              ))}
            </div>
          ) : (
            // Table View
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm">Ism Familiya</th>
                    <th className="text-left p-3 font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefon
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Yo'nalish
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-sm">Holat</th>
                    <th className="text-right p-3 font-semibold text-sm">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getDepartmentColor(teacher.department)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                            {getInitials(teacher.firstName, teacher.lastName)}
                          </div>
                          <div>
                            <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm truncate block max-w-[250px]">{teacher.email}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{teacher.phone}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm truncate block max-w-[250px]">{teacher.department}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                          {teacher.status === 'active' ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(teacher)}
                            className="h-8 w-8 p-0"
                            title="Tahrirlash"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(teacher.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="O'chirish"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
