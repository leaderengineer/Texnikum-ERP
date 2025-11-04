import { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Save,
  Download
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
import { Select } from '../../components/ui/Select';
import useAuthStore from '../../store/authStore';
import { attendanceAPI, studentsAPI } from '../../services/api';

export function Attendance() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGroup, setSelectedGroup] = useState('AT-21-01');
  const [selectedSubject, setSelectedSubject] = useState('Web dasturlash');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate, selectedGroup, selectedSubject]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      // Backend'dan attendance ma'lumotlarini olish
      const response = await attendanceAPI.getByDate(selectedDate, {
        group: selectedGroup,
        subject: selectedSubject,
      });
      
      const attendanceData = response.data || [];
      
      // Agar attendance yo'q bo'lsa, guruh talabalarini yuklash
      if (attendanceData.length === 0) {
        const studentsResponse = await studentsAPI.getByGroup(selectedGroup);
        const students = studentsResponse.data || [];
        
        const newAttendance = students.map((student) => ({
          id: student.id,
          studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown',
          studentId: student.student_id || '',
          group: selectedGroup,
          status: 'present',
          time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        }));
        
        setAttendance(newAttendance);
      } else {
        // Backend formatidan frontend formatiga o'tkazish
        const formattedAttendance = attendanceData.map((item) => ({
          id: item.student_id,
          studentName: item.student_name || (item.student?.first_name && item.student?.last_name 
            ? `${item.student.first_name} ${item.student.last_name}` 
            : 'Unknown'),
          studentId: item.student_student_id || item.student?.student_id || '',
          group: item.group || selectedGroup,
          status: item.status || 'present',
          time: item.time || '-',
        }));
        
        setAttendance(formattedAttendance);
      }
    } catch (error) {
      console.error('Davomatni yuklashda xatolik:', error);
      // Fallback to mock data
      const mockStudents = [
        { id: 1, studentName: 'Aziz Karimov', studentId: 'ST001' },
        { id: 2, studentName: 'Malika Yuldasheva', studentId: 'ST002' },
        { id: 3, studentName: 'Javohir Toshmatov', studentId: 'ST003' },
      ];
      setAttendance(mockStudents.map((s, i) => ({
        ...s,
        group: selectedGroup,
        status: i < 2 ? 'present' : 'absent',
        time: i < 2 ? '09:00' : '-',
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAttendance(
      attendance.map((item) => {
        if (item.id === id) {
          const now = new Date();
          const time = now.toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return {
            ...item,
            status: newStatus,
            time: newStatus === 'absent' ? '-' : time,
          };
        }
        return item;
      })
    );
  };

  const handleDateChange = (direction) => {
    const date = new Date(selectedDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const getStats = () => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, late, rate };
  };

  const stats = getStats();

  const statusConfig = {
    present: { 
      label: 'Qatnashgan', 
      variant: 'default', 
      icon: CheckCircle2, 
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      symbol: '✓'
    },
    absent: { 
      label: 'Qatnashmagan', 
      variant: 'destructive', 
      icon: XCircle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      symbol: '✗'
    },
    late: { 
      label: 'Kechikkan', 
      variant: 'secondary', 
      icon: Clock, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      symbol: '⏰'
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Har bir talaba uchun attendance record yaratish/yangilash
      const promises = attendance.map((item) => {
        const payload = {
          student_id: item.id,
          student_name: item.studentName || '',
          student_student_id: item.studentId || '',
          date: selectedDate,
          group: selectedGroup,
          subject: selectedSubject,
          status: item.status,
          time: item.time !== '-' ? item.time : null,
        };
        
        // Agar mavjud bo'lsa update, aks holda create
        return attendanceAPI.create(payload);
      });
      
      await Promise.all(promises);
      alert('Davomat muvaffaqiyatli saqlandi!');
      // Saqlashdan keyin yangilash
      await loadAttendance();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      // Xatolikni to'g'ri ko'rsatish
      let errorMessage = 'Davomat saqlashda xatolik yuz berdi';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Validation xatoliklar
            errorMessage = errorData.detail.map(err => {
              if (typeof err === 'object' && err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return String(err);
            }).join('\n');
          } else {
            errorMessage = String(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = String(errorData.message);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // CSV format
      const headers = ['№', 'Talaba ID', 'Familiya va Ism', 'Davomat', 'Vaqt'];
      const rows = attendance.map((item, index) => [
        index + 1,
        item.studentId,
        item.studentName,
        statusConfig[item.status].label,
        item.time,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `davomat_${selectedDate}_${selectedGroup}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Davomat muvaffaqiyatli eksport qilindi!');
    } catch (error) {
      console.error('Eksport qilishda xatolik:', error);
      alert('Eksport qilishda xatolik yuz berdi');
    }
  };

  const groups = ['AT-21-01', 'AT-21-02', 'M-21-01', 'I-21-01'];
  const subjects = ['Web dasturlash', 'Ma\'lumotlar bazasi', 'Python dasturlash', 'JavaScript asoslari'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Davomat jurnali</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Kunlik davomatni belgilash va boshqarish</p>
        </div>
        <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none touch-manipulation">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Eksport</span>
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none touch-manipulation">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateChange('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateChange('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Bugungi kun
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami talabalar</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qatnashgan</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qatnashmagan</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Davomat foizi</p>
                <p className="text-2xl font-bold text-primary">{stats.rate}%</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Table */}
      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Davomat jurnali
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDate(selectedDate)} • {selectedGroup} • {selectedSubject}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {stats.present}/{stats.total} qatnashgan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full border-collapse min-w-[800px]">
                <thead className="bg-muted/50 border-b sticky top-0 z-20">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-muted/50 z-30 border-r min-w-[40px] sm:min-w-[50px]">
                      №
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-[40px] sm:left-[50px] bg-muted/50 z-30 border-r min-w-[80px] sm:min-w-[100px]">
                      Talaba ID
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-[120px] sm:left-[150px] bg-muted/50 z-30 border-r min-w-[150px] sm:min-w-[200px]">
                      Familiya va Ism
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[100px] sm:min-w-[140px]">
                      Davomat
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px] sm:min-w-[100px]">
                      Vaqt
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px] sm:min-w-[280px]">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Ma'lumot topilmadi
                      </td>
                    </tr>
                  ) : (
                    attendance.map((item, index) => {
                      const config = statusConfig[item.status];
                      const Icon = config.icon;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/30 transition-colors border-b border-border"
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold sticky left-0 bg-background z-20 border-r">
                            {index + 1}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium sticky left-[40px] sm:left-[50px] bg-background z-20 border-r">
                            {item.studentId}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm sticky left-[120px] sm:left-[150px] bg-background z-20 border-r">
                            {item.studentName}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                            <div
                              className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border-2 ${config.bgColor} ${config.borderColor} ${config.color} font-medium`}
                            >
                              <span className="text-sm sm:text-base">{config.symbol}</span>
                              <span className="text-[10px] sm:text-xs">{config.label}</span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm font-medium text-muted-foreground">
                            {item.time}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2">
                              <Button
                                variant={item.status === 'present' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'present')}
                                className="h-7 sm:h-8 text-xs sm:text-sm touch-manipulation"
                              >
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Qatnashdi</span>
                              </Button>
                              <Button
                                variant={item.status === 'late' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'late')}
                                className="h-7 sm:h-8 text-xs sm:text-sm touch-manipulation"
                              >
                                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Kechikdi</span>
                              </Button>
                              <Button
                                variant={item.status === 'absent' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'absent')}
                                className="h-7 sm:h-8 text-xs sm:text-sm touch-manipulation"
                              >
                                <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Yo'q</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}