import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { examsAPI, studentsAPI, groupsAPI, departmentsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export function Exams() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    group: '',
    department: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    max_attempts: 1,
    total_points: 100,
    auto_close: true,
    allowed_students: [],
    excluded_students: [],
    questions: [],
  });

  useEffect(() => {
    loadExams();
    loadGroups();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadStudents(selectedGroup);
    } else {
      setStudents([]);
    }
  }, [selectedGroup]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examsAPI.getAll();
      setExams(response.data);
    } catch (err) {
      console.error('Imtihonlarni yuklashda xatolik:', err);
      setError('Imtihonlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (err) {
      console.error('Yo\'nalishlarni yuklashda xatolik:', err);
    }
  };

  const loadStudents = async (groupName) => {
    try {
      const response = await studentsAPI.getAll({ group: groupName });
      setStudents(response.data);
    } catch (err) {
      console.error('Talabalarni yuklashda xatolik:', err);
    }
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description || '',
        subject: exam.subject,
        group: exam.group,
        department: exam.department,
        start_time: exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : '',
        end_time: exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : '',
        duration_minutes: exam.duration_minutes || 60,
        max_attempts: exam.max_attempts || 1,
        total_points: exam.total_points || 100,
        auto_close: exam.auto_close !== false,
        allowed_students: exam.allowed_students || [],
        excluded_students: exam.excluded_students || [],
        questions: exam.questions || [],
      });
      setSelectedGroup(exam.group);
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        description: '',
        subject: '',
        group: '',
        department: '',
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        max_attempts: 1,
        total_points: 100,
        auto_close: true,
        allowed_students: [],
        excluded_students: [],
        questions: [],
      });
      setSelectedGroup('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const examData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      if (editingExam) {
        await examsAPI.update(editingExam.id, examData);
      } else {
        await examsAPI.create(examData);
      }

      await loadExams();
      handleCloseModal();
    } catch (err) {
      console.error('Imtihon saqlashda xatolik:', err);
      setError(err.response?.data?.detail || 'Imtihon saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu imtihonni o\'chirishni xohlaysizmi?')) return;

    try {
      await examsAPI.delete(id);
      await loadExams();
    } catch (err) {
      console.error('Imtihonni o\'chirishda xatolik:', err);
      alert('Imtihonni o\'chirishda xatolik yuz berdi');
    }
  };

  const toggleStudentSelection = (student, listType) => {
    const list = formData[listType] || [];
    const exists = list.some(s => s.id === student.id);
    
    if (exists) {
      setFormData({
        ...formData,
        [listType]: list.filter(s => s.id !== student.id),
      });
    } else {
      setFormData({
        ...formData,
        [listType]: [...list, { id: student.id, name: `${student.first_name} ${student.last_name}` }],
      });
    }
  };

  const isStudentSelected = (student, listType) => {
    const list = formData[listType] || [];
    return list.some(s => s.id === student.id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum';
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (!exam.is_active) return { label: 'Nofaol', variant: 'secondary' };
    if (now < start) return { label: 'Kutilmoqda', variant: 'default' };
    if (now >= start && now <= end) return { label: 'Aktiv', variant: 'success' };
    return { label: 'Tugagan', variant: 'destructive' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Imtihonlar
          </h1>
          <p className="text-muted-foreground mt-1">
            Talabalar uchun imtihonlar yarating va boshqaring
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Yangi imtihon
        </Button>
      </div>

      {/* Exams List */}
      <div className="grid gap-4">
        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Hozircha imtihonlar mavjud emas</p>
              <Button onClick={() => handleOpenModal()} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Birinchi imtihonni yarating
              </Button>
            </CardContent>
          </Card>
        ) : (
          exams.map((exam) => {
            const status = getExamStatus(exam);
            return (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {exam.title}
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {exam.description || 'Tavsif yo\'q'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(exam)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Boshlanish:</span>
                      <span>{formatDate(exam.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tugash:</span>
                      <span>{formatDate(exam.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Davomiyligi:</span>
                      <span>{exam.duration_minutes} daqiqa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Urinishlar:</span>
                      <span>{exam.max_attempts} marta</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{exam.subject}</Badge>
                    <Badge variant="outline">{exam.group}</Badge>
                    <Badge variant="outline">{exam.department}</Badge>
                    <Badge variant="outline">{exam.total_points} ball</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingExam ? 'Imtihonni tahrirlash' : 'Yangi imtihon yaratish'}
              </CardTitle>
              <CardDescription>
                Imtihon ma'lumotlarini kiriting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Sarlavha *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Fan *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Tavsif</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="group">Guruh *</Label>
                    <select
                      id="group"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.group}
                      onChange={(e) => {
                        setFormData({ ...formData, group: e.target.value });
                        setSelectedGroup(e.target.value);
                      }}
                      required
                    >
                      <option value="">Tanlang</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="department">Yo'nalish *</Label>
                    <select
                      id="department"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    >
                      <option value="">Tanlang</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="total_points">Jami ball *</Label>
                    <Input
                      id="total_points"
                      type="number"
                      min="1"
                      value={formData.total_points}
                      onChange={(e) => setFormData({ ...formData, total_points: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Boshlanish vaqti *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">Tugash vaqti *</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration_minutes">Davomiyligi (daqiqa) *</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_attempts">Urinishlar soni *</Label>
                    <Input
                      id="max_attempts"
                      type="number"
                      min="1"
                      value={formData.max_attempts}
                      onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.auto_close}
                        onChange={(e) => setFormData({ ...formData, auto_close: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Avtomatik yopish</span>
                    </label>
                  </div>
                </div>

                {/* Talabalar tanlash */}
                {selectedGroup && students.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Talabalar tanlash</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Ruxsat berilgan talabalar</Label>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                          {students.map((student) => {
                            const isAllowed = isStudentSelected(student, 'allowed_students');
                            const isExcluded = isStudentSelected(student, 'excluded_students');
                            return (
                              <label
                                key={student.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                  isAllowed ? 'bg-primary/10' : isExcluded ? 'opacity-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => toggleStudentSelection(student, 'allowed_students')}
                                  disabled={isExcluded}
                                  className="w-4 h-4"
                                />
                                <span>
                                  {student.first_name} {student.last_name} ({student.student_id})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Chetlashtirilgan talabalar</Label>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                          {students.map((student) => {
                            const isExcluded = isStudentSelected(student, 'excluded_students');
                            const isAllowed = isStudentSelected(student, 'allowed_students');
                            return (
                              <label
                                key={student.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                  isExcluded ? 'bg-destructive/10' : isAllowed ? 'opacity-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isExcluded}
                                  onChange={() => toggleStudentSelection(student, 'excluded_students')}
                                  disabled={isAllowed}
                                  className="w-4 h-4"
                                />
                                <span>
                                  {student.first_name} {student.last_name} ({student.student_id})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions - keyinroq qo'shiladi */}
                <div className="border-t pt-4">
                  <Label>Savollar</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Savollar qo'shish funksiyasi keyingi versiyada qo'shiladi
                  </p>
                  <div className="bg-muted p-4 rounded-md text-center text-muted-foreground">
                    Savollar qo'shish bo'limi
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Bekor qilish
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      'Saqlash'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

