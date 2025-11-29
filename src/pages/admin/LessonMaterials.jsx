import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Download,
  Upload,
  File,
  Filter,
  Building2,
  GraduationCap,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  X,
  LayoutGrid,
  List,
  ListChecks
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
import { lessonMaterialsAPI, departmentsAPI, groupsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { Pagination } from '../../components/ui/Pagination';

// Token olish uchun helper funksiya
const getToken = () => useAuthStore.getState().token;

const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function LessonMaterials() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  // View state: 'subjects' yoki 'materials'
  const [currentView, setCurrentView] = useState('subjects');
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // View mode state (card or table)
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('lessonMaterialsViewMode');
    return saved || 'card';
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Departments va groups
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  
  // View mode ni localStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem('lessonMaterialsViewMode', viewMode);
  }, [viewMode]);
  
  // Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  
  // View modal state
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [viewUrl, setViewUrl] = useState('');
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    group: '',
    department: '',
    title: '',
    description: '',
    file: null,
  });

  useEffect(() => {
    loadDepartments();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadGroups(selectedDepartment);
    } else {
      setGroups([]);
      setSelectedGroup('');
    }
  }, [selectedDepartment]);

  // Fan tanlanganda materiallarni yuklash
  useEffect(() => {
    if (currentView === 'materials' && selectedSubject) {
      loadMaterials();
    }
  }, [currentView, selectedSubject, selectedDepartment, selectedGroup]);

  // Fanlarni yuklash
  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await lessonMaterialsAPI.getAll({ limit: 1000 });
      const allMaterials = response.data || [];
      
      // Fanlarni yig'ish (unique) va har bir fan uchun materiallar sonini hisoblash
      const subjectMap = new Map();
      allMaterials.forEach((material) => {
        const subject = material.subject;
        if (subject) {
          if (!subjectMap.has(subject)) {
            subjectMap.set(subject, {
              name: subject,
              count: 0,
              departments: new Set(),
            });
          }
          const subjectData = subjectMap.get(subject);
          subjectData.count++;
          if (material.department) {
            subjectData.departments.add(material.department);
          }
        }
      });
      
      // Map'dan array'ga o'tkazish va tartiblash
      const subjectsList = Array.from(subjectMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        departments: Array.from(data.departments),
      }));
      
      subjectsList.sort((a, b) => a.name.localeCompare(b.name));
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Fanlarni yuklashda xatolik:', error);
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 1000,
        subject: selectedSubject?.name || '',
        ...(selectedDepartment && { department: selectedDepartment }),
        ...(selectedGroup && { group: selectedGroup }),
      };
      const response = await lessonMaterialsAPI.getAll(params);
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Materiallarni yuklashda xatolik:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Yo\'nalishlarni yuklashda xatolik:', error);
    }
  };

  const loadGroups = async (departmentName) => {
    try {
      const response = await groupsAPI.getAll({ department: departmentName, limit: 1000 });
      setGroups(response.data || []);
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
      setGroups([]);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setCurrentView('materials');
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedGroup('');
  };

  const handleBackToSubjects = () => {
    setCurrentView('subjects');
    setSelectedSubject(null);
    setMaterials([]);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedGroup('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Fayl turini tekshirish
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      setUploadError(`Ruxsat etilmagan fayl turi. Faqat quyidagilar ruxsat etiladi: ${ALLOWED_FILE_TYPES.join(', ')}`);
      e.target.value = '';
      return;
    }

    // Fayl hajmini tekshirish
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`Fayl hajmi juda katta. Maksimal hajm: 5 MB. Sizning faylingiz: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      e.target.value = '';
      return;
    }

    setUploadError('');
    setUploadForm(prev => ({ ...prev, file }));
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      setUploadError('Fan nomi kiritilishi kerak');
      return;
    }

    // Fan allaqachon mavjudligini tekshirish
    if (subjects.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      setUploadError('Bu fan allaqachon mavjud');
      return;
    }

    try {
      setAddingSubject(true);
      setUploadError('');

      // Frontend'da yangi fan qo'shish
      const newSubject = {
        name: newSubjectName.trim(),
        count: 0,
        departments: [],
      };
      
      setSubjects(prev => [...prev, newSubject].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSubjectName('');
      setIsAddSubjectModalOpen(false);
    } catch (error) {
      console.error('Fan qo\'shishda xatolik:', error);
      setUploadError('Fan qo\'shishda xatolik yuz berdi');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      setUploadError('Fayl tanlanishi kerak');
      return;
    }

    if (!selectedSubject || !uploadForm.group || !uploadForm.department || !uploadForm.title) {
      setUploadError('Barcha majburiy maydonlar to\'ldirilishi kerak');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('subject', selectedSubject.name); // Tanlangan fan nomi
      formData.append('group', uploadForm.group);
      formData.append('department', uploadForm.department);
      formData.append('title', uploadForm.title);
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }

      await lessonMaterialsAPI.create(formData);
      
      // Formani tozalash
      setUploadForm({
        group: '',
        department: '',
        title: '',
        description: '',
        file: null,
      });
      setIsUploadModalOpen(false);
      
      // Fanlar ro'yxatini yangilash
      await loadSubjects();
      
      // Agar materials view'da bo'lsak, materiallarni ham yangilash
      if (currentView === 'materials') {
        await loadMaterials();
      }
    } catch (error) {
      console.error('Yuklashda xatolik:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Yuklashda xatolik yuz berdi';
      setUploadError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setTestError('Avval fan tanlang');
      return;
    }
    if (!testForm.title.trim()) {
      setTestError('Test sarlavhasi kiritilishi kerak');
      return;
    }
    try {
      setTestSaving(true);
      setTestError('');

      const descriptionPrefix = `[type:${testForm.type}] `;
      const payload = {
        subject: selectedSubject.name,
        title: testForm.title.trim(),
        description: descriptionPrefix + (testForm.description || ''),
        is_active: true,
        questions: [], // savollar keyingi bosqichda qo'shiladi
      };

      await quizzesAPI.create(payload);
      setIsTestModalOpen(false);
      setTestForm({
        title: '',
        type: 'oddiy',
        description: '',
      });
      await loadQuizzesForSubject();
    } catch (error) {
      console.error('Test yaratishda xatolik:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Test yaratishda xatolik yuz berdi';
      setTestError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setTestSaving(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const response = await lessonMaterialsAPI.download(material.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Yuklab olishda xatolik:', error);
      alert('Yuklab olishda xatolik yuz berdi');
    }
  };

  const handleView = async (material) => {
    const fileType = material.file_type.toLowerCase();
    
    // PDF uchun brauzerda ochish
    if (fileType === 'pdf') {
      setViewingMaterial(material);
      // Token'ni auth store'dan olish
      const token = getToken();
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const url = `${baseURL}/lesson-materials/${material.id}/view?token=${encodeURIComponent(token || '')}`;
      setViewUrl(url);
    } 
    // DOC/DOCX uchun Word'da ochish
    else if (['doc', 'docx'].includes(fileType)) {
      try {
        const response = await lessonMaterialsAPI.download(material.id);
        const blob = new Blob([response.data], { 
          type: fileType === 'docx' 
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = material.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Faylni ochish (Windows'da Word avtomatik ochiladi)
        // Agar ochilmasa, foydalanuvchi yuklab olgan faylni ochishi mumkin
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        alert('Fayl yuklab olindi. Agar Word avtomatik ochilmasa, yuklab olgan faylni oching.');
      } catch (error) {
        console.error('Faylni ochishda xatolik:', error);
        alert('Faylni ochishda xatolik yuz berdi');
      }
    }
    // PPT/PPTX uchun PowerPoint'da ochish
    else if (['ppt', 'pptx'].includes(fileType)) {
      try {
        const response = await lessonMaterialsAPI.download(material.id);
        const blob = new Blob([response.data], { 
          type: fileType === 'pptx'
            ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            : 'application/vnd.ms-powerpoint'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = material.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Faylni ochish (Windows'da PowerPoint avtomatik ochiladi)
        // Agar ochilmasa, foydalanuvchi yuklab olgan faylni ochishi mumkin
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        alert('Fayl yuklab olindi. Agar PowerPoint avtomatik ochilmasa, yuklab olgan faylni oching.');
      } catch (error) {
        console.error('Faylni ochishda xatolik:', error);
        alert('Faylni ochishda xatolik yuz berdi');
      }
    }
  };

  const closeViewModal = () => {
    setViewingMaterial(null);
    setViewUrl('');
  };

  const canViewInline = (fileType) => {
    // PDF fayllarni to'g'ridan-to'g'ri ko'rsatish mumkin
    return fileType.toLowerCase() === 'pdf';
  };

  const getViewButtonLabel = (fileType) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') return 'O\'qish';
    if (['doc', 'docx'].includes(type)) return 'Word\'da ochish';
    if (['ppt', 'pptx'].includes(type)) return 'PowerPoint\'da ochish';
    return 'Ochish';
  };

  const handleDelete = async (id) => {
    const material = materials.find((m) => m.id === id);
    if (window.confirm(`"${material.title}" materialini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await lessonMaterialsAPI.delete(id);
        await loadMaterials();
        // Fanlar ro'yxatini ham yangilash
        await loadSubjects();
      } catch (error) {
        console.error('O\'chirishda xatolik:', error);
        alert('O\'chirishda xatolik yuz berdi');
      }
    }
  };

  const filteredMaterials = useMemo(() => {
    const filtered = materials.filter((material) =>
      `${material.title} ${material.subject} ${material.description || ''} ${material.file_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    
    // Pagination
    const skip = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(skip, skip + itemsPerPage);
    
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    return paginated;
  }, [materials, searchTerm, currentPage, itemsPerPage]);

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
    selectedDepartment,
    selectedGroup,
  ].filter(Boolean).length;
  
  // Barcha materiallar (pagination'siz)
  const allFilteredMaterials = useMemo(() => {
    return materials.filter((material) =>
      `${material.title} ${material.subject} ${material.description || ''} ${material.file_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [materials, searchTerm]);

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄';
    if (['doc', 'docx'].includes(fileType)) return '📝';
    if (['ppt', 'pptx'].includes(fileType)) return '📊';
    return '📎';
  };

  const formatFileSize = (sizeMB) => {
    if (sizeMB < 1) {
      return `${(sizeMB * 1024).toFixed(2)} KB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {currentView === 'materials' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSubjects}
                className="shrink-0"
              >
                ← Orqaga
              </Button>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              <span className="truncate">
                {currentView === 'subjects' ? 'Dars materiallari' : selectedSubject?.name || 'Dars materiallari'}
              </span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {currentView === 'subjects' 
              ? 'Fanlarni tanlang va dars materiallarini ko\'ring'
              : 'Dars materiallarini yuklash, ko\'rish va yuklab olish'}
          </p>
        </div>
        {currentView === 'subjects' && (isAdmin || user?.role === 'teacher') && (
          <Button 
            onClick={() => setIsAddSubjectModalOpen(true)} 
            className="w-full sm:w-auto touch-manipulation"
          >
            <Plus className="mr-2 h-4 w-4" />
            Yangi fan qo'shish
          </Button>
        )}
        {currentView === 'materials' && (isAdmin || user?.role === 'teacher') && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setIsUploadModalOpen(true)} 
              className="w-full sm:w-auto touch-manipulation"
            >
              <Upload className="mr-2 h-4 w-4" />
              Material yuklash
            </Button>
          </div>
        )}
      </div>

      {/* Subjects View */}
      {currentView === 'subjects' ? (
        <>
          {/* View Mode Toggle for Subjects */}
          {!subjectsLoading && subjects.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end">
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
              </CardContent>
            </Card>
          )}

          {subjectsLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Fanlar yuklanmoqda...</p>
            </div>
          ) : subjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Fanlar topilmadi</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Hozircha dars materiallari mavjud emas
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'card' ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card 
                  key={subject.name} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSubjectClick(subject)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{subject.name}</span>
                      <Badge variant="secondary">{subject.count} ta</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{subject.departments.length} ta yo'nalish</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {subject.departments.slice(0, 3).join(', ')}
                        {subject.departments.length > 3 && '...'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm">Fan nomi</th>
                    <th className="text-left p-3 font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Materiallar soni
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Yo'nalishlar
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr
                      key={subject.name}
                      className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleSubjectClick(subject)}
                    >
                      <td className="p-3">
                        <div className="font-medium">{subject.name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{subject.count} ta</Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {subject.departments.join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Filters - faqat materials view'da */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Material nomi yoki fayl nomi bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="filter-department" className="text-sm">Yo'nalish</Label>
                  <Select
                    id="filter-department"
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedGroup('');
                    }}
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
                  <Label htmlFor="filter-group" className="text-sm">Guruh</Label>
                  <Select
                    id="filter-group"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    disabled={!selectedDepartment}
                  >
                    <option value="">Barcha guruhlar</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.name || group.code}>
                        {group.name || group.code}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

          {/* Filter reset va statistika */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Jami: <span className="font-semibold text-foreground">{totalItems}</span> ta material
                {totalItems !== filteredMaterials.length && (
                  <span className="ml-1">
                    (Ko'rsatilmoqda: {filteredMaterials.length} ta)
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
                  {selectedDepartment && (
                    <Badge variant="secondary" className="text-xs">
                      Yo'nalish: {selectedDepartment}
                    </Badge>
                  )}
                  {selectedGroup && (
                    <Badge variant="secondary" className="text-xs">
                      Guruh: {selectedGroup}
                    </Badge>
                  )}
                </div>
              )}
              {(selectedDepartment || selectedGroup) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedGroup('');
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Tozalash ({activeFiltersCount})
                </Button>
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
        </CardContent>
      </Card>

          {/* Materials List */}
          {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Yuklanmoqda...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">Materiallar topilmadi</p>
            <p className="text-sm text-muted-foreground mt-2">
              Qidiruv so'zini o'zgartiring yoki yangi material yuklang
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        // Card View
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-3xl shrink-0">
                      {getFileIcon(material.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 mb-1">
                        {material.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {material.subject}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">{material.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">{material.group}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <File className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">{material.file_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Hajm:</span>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(material.file_size)}
                    </Badge>
                  </div>
                  {material.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(material.created_at).toLocaleDateString('uz-UZ')}</span>
                    <span>•</span>
                    <span>{material.uploaded_by_name}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(material)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {getViewButtonLabel(material.file_type)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(material)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Yuklab olish
                  </Button>
                  {(isAdmin || material.uploaded_by === user?.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
                <th className="text-left p-3 font-semibold text-sm">Material nomi</th>
                <th className="text-left p-3 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fan
                  </div>
                </th>
                <th className="text-left p-3 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Yo'nalish
                  </div>
                </th>
                <th className="text-left p-3 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Guruh
                  </div>
                </th>
                <th className="text-left p-3 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Fayl nomi
                  </div>
                </th>
                <th className="text-left p-3 font-semibold text-sm">Hajm</th>
                <th className="text-left p-3 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Sana
                  </div>
                </th>
                <th className="text-right p-3 font-semibold text-sm">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted-foreground">Materiallar topilmadi</td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr
                    key={material.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl shrink-0">
                          {getFileIcon(material.file_type)}
                        </div>
                        <div>
                          <div className="font-medium">{material.title}</div>
                          {material.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {material.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{material.subject}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm truncate block max-w-[150px]">{material.department}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{material.group}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm truncate block max-w-[200px]">{material.file_name}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(material.file_size)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{new Date(material.created_at).toLocaleDateString('uz-UZ')}</div>
                        <div className="text-xs text-muted-foreground">{material.uploaded_by_name}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(material)}
                          className="h-8 px-2"
                          title={getViewButtonLabel(material.file_type)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(material)}
                          className="h-8 px-2"
                          title="Yuklab olish"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {(isAdmin || material.uploaded_by === user?.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="O'chirish"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
        </>
      )}

      {/* Add Subject Modal */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold">Yangi fan qo'shish</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setIsAddSubjectModalOpen(false);
                setNewSubjectName('');
                setUploadError('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {uploadError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-subject-name">Fan nomi *</Label>
                <Input
                  id="new-subject-name"
                  value={newSubjectName}
                  onChange={(e) => {
                    setNewSubjectName(e.target.value);
                    setUploadError('');
                  }}
                  placeholder="Masalan: Matematika, Fizika, Web dasturlash..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Yangi fan nomini kiriting. Keyin bu fan uchun materiallar yuklashingiz mumkin.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddSubjectModalOpen(false);
                    setNewSubjectName('');
                    setUploadError('');
                  }}
                >
                  Bekor qilish
                </Button>
                <Button 
                  onClick={handleAddSubject}
                  disabled={addingSubject || !newSubjectName.trim()}
                >
                  {addingSubject ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Qo'shilmoqda...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Qo'shish
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold">Material yuklash</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(false)}>
                <span className="text-xl">×</span>
              </Button>
            </div>

            <form onSubmit={handleUpload} className="p-4 sm:p-6 space-y-4">
              {uploadError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-department">Yo'nalish *</Label>
                  <Select
                    id="upload-department"
                    value={uploadForm.department}
                    onChange={(e) => {
                      setUploadForm(prev => ({ ...prev, department: e.target.value, group: '' }));
                      if (e.target.value) {
                        loadGroups(e.target.value);
                      }
                    }}
                    required
                  >
                    <option value="">Tanlang...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-group">Guruh *</Label>
                  <Select
                    id="upload-group"
                    value={uploadForm.group}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, group: e.target.value }))}
                    disabled={!uploadForm.department}
                    required
                  >
                    <option value="">Tanlang...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.name || group.code}>
                        {group.name || group.code}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-title">Material nomi *</Label>
                <Input
                  id="upload-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masalan: 1-dars. Kirish"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-description">Tavsif (ixtiyoriy)</Label>
                <textarea
                  id="upload-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Material haqida qisqacha ma'lumot..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-file">Fayl * (Maksimal 5 MB)</Label>
                <Input
                  id="upload-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Ruxsat etilgan formatlar: PDF, DOC, DOCX, PPT, PPTX
                </p>
                {uploadForm.file && (
                  <div className="mt-2 p-2 bg-accent rounded-md">
                    <p className="text-sm font-medium">{uploadForm.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Hajm: {formatFileSize(uploadForm.file.size / 1024 / 1024)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({
                      group: '',
                      department: '',
                      title: '',
                      description: '',
                      file: null,
                    });
                    setUploadError('');
                  }}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Yuklash
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4">
          <div className="bg-card rounded-lg shadow-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{viewingMaterial.title}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {viewingMaterial.subject} • {viewingMaterial.file_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(viewingMaterial)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Yuklab olish
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeViewModal}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
              {viewingMaterial.file_type.toLowerCase() === 'pdf' ? (
                <iframe
                  src={viewUrl}
                  className="w-full h-full border-0"
                  title={viewingMaterial.title}
                  style={{ minHeight: '600px' }}
                  onError={(e) => {
                    console.error('Iframe yuklashda xatolik:', e);
                    alert('PDF faylni yuklashda xatolik yuz berdi. Token tekshirib ko\'ring.');
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center max-w-md">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      PDF fayl emas
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Bu fayl turini brauzerda ko'rsatib bo'lmaydi. Yuklab olish tugmasini bosing.
                    </p>
                    <Button onClick={() => handleDownload(viewingMaterial)}>
                      <Download className="h-4 w-4 mr-2" />
                      Yuklab olish
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

