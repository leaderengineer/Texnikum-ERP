import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Users, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Award,
  Building2,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { GeolocationErrorModal } from '../../components/modals/GeolocationErrorModal';
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
import { attendanceAPI, studentsAPI, schedulesAPI, gradesAPI, groupsAPI, institutionsAPI, departmentsAPI, lessonMaterialsAPI } from '../../services/api';

export function Attendance() {
  const { user } = useAuthStore();
  
  // Tab state (Davomat yoki Baholash)
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' yoki 'grades'
  
  // Davomat state
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState([]); // Barcha guruhlar
  const [groups, setGroups] = useState([]); // Filtrlangan guruhlar
  const [departments, setDepartments] = useState([]); // Yo'nalishlar
  const [subjects, setSubjects] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState(''); // Kurs (1, 2, 3, 4)
  const [selectedDepartment, setSelectedDepartment] = useState(''); // Yo'nalish
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Baholash state
  const [gradeGroups, setGradeGroups] = useState([]);
  const [gradeStudents, setGradeStudents] = useState([]);
  const [gradeDepartments, setGradeDepartments] = useState([]); // Baholash uchun yo'nalishlar
  const [selectedGradeCourse, setSelectedGradeCourse] = useState(''); // Baholash uchun kurs
  const [selectedGradeDepartment, setSelectedGradeDepartment] = useState(''); // Baholash uchun yo'nalish
  const [selectedGradeGroup, setSelectedGradeGroup] = useState('');
  const [selectedGradeSubject, setSelectedGradeSubject] = useState('');
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false); // Davomat saqlanganligini tekshirish
  const [geolocationEnabled, setGeolocationEnabled] = useState(false); // Institution geolocation sozlamasi
  const [geolocationError, setGeolocationError] = useState(null); // Geolocation xatolik ma'lumotlari
  const [institutionName, setInstitutionName] = useState(''); // Muassasa nomi

  // Institution geolocation sozlamalarini yuklash
  useEffect(() => {
    loadInstitutionSettings();
    loadDepartments();
  }, []);

  // Yo'nalishlarni yuklash
  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      const depts = response.data || [];
      setDepartments(depts);
      setGradeDepartments(depts);
    } catch (error) {
      console.error('Yo\'nalishlarni yuklashda xatolik:', error);
      setDepartments([]);
      setGradeDepartments([]);
    }
  };

  const loadInstitutionSettings = async () => {
    if (!user?.institution_id) {
      console.error('Institution ID topilmadi');
      return;
    }
    
    try {
      const response = await institutionsAPI.getById(user.institution_id);
      const institution = response.data;
      if (institution) {
        setGeolocationEnabled(institution.geolocation_enabled || false);
        setInstitutionName(institution.name || '');
      }
    } catch (error) {
      console.error('Institution sozlamalarini yuklashda xatolik:', error);
    }
  };

  // Barcha guruhlarni yuklash
  const loadAllGroups = useCallback(async () => {
    try {
      setLoadingFilters(true);
      
      // Guruhlarni yuklash
      const response = await groupsAPI.getAll({ limit: 1000 });
      const groupsData = response.data?.items || response.data || [];
      setAllGroups(groupsData);
      
      // Dars materiallaridan barcha fanlarni olish
      try {
        const materialsResponse = await lessonMaterialsAPI.getAll({ limit: 1000 });
        const materialsData = materialsResponse.data || [];
        
        // Unique fanlarni yig'ish
        const uniqueSubjects = [...new Set(materialsData.map(m => m.subject).filter(Boolean))].sort();
        setSubjects(uniqueSubjects);
      } catch (materialsError) {
        console.error('Fanlarni yuklashda xatolik:', materialsError);
        // Xatolik bo'lsa ham bo'sh ro'yxat qoldirish
        setSubjects([]);
      }
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
      setAllGroups([]);
      setSubjects([]);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  // Guruhlarni va fanlarni yuklash (davomat uchun)
  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAllGroups();
    }
  }, [activeTab, loadAllGroups]);

  // Fanlarni yangilash (dars materiallari yangilanganda)
  useEffect(() => {
    const refreshSubjects = async () => {
      try {
        const materialsResponse = await lessonMaterialsAPI.getAll({ limit: 1000 });
        const materialsData = materialsResponse.data || [];
        const uniqueSubjects = [...new Set(materialsData.map(m => m.subject).filter(Boolean))].sort();
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error('Fanlarni yangilashda xatolik:', error);
      }
    };

    // Har 2 daqiqada bir marta yangilash (yangi fan qo'shilganda)
    const interval = setInterval(refreshSubjects, 120000);
    
    return () => clearInterval(interval);
  }, []);

  // Kursni yildan aniqlash funksiyasi
  const getCourseFromYear = (year) => {
    if (!year) return null;
    const currentYear = new Date().getFullYear();
    const course = currentYear - year + 1;
    if (course >= 1 && course <= 4) {
      return course;
    }
    return null;
  };

  // Guruh nomidan kursni aniqlash (masalan, "01-24" formatida)
  const getCourseFromGroupName = (groupName) => {
    if (!groupName) return null;
    const match = groupName.match(/-(\d{2})$/);
    if (match) {
      const year = parseInt(match[1]);
      const currentYear = new Date().getFullYear() % 100;
      const course = currentYear - year + 1;
      if (course >= 1 && course <= 4) {
        return course;
      }
    }
    return null;
  };

  // Kurs tanlanganda, yo'nalish va guruhlarni tozalash
  useEffect(() => {
    if (!selectedCourse) {
      setSelectedDepartment('');
      setGroups([]);
      setSelectedGroup('');
      setAttendance([]);
    }
  }, [selectedCourse]);

  // Kurs va yo'nalish tanlanganda, guruhlarni filtrlash
  useEffect(() => {
    if (selectedCourse && selectedDepartment) {
      const courseNum = parseInt(selectedCourse);
      const filtered = allGroups.filter(g => {
        // Kurs bo'yicha tekshirish
        const courseFromYear = getCourseFromYear(g.year);
        const courseFromName = getCourseFromGroupName(g.name || g.code);
        const matchesCourse = courseFromYear === courseNum || courseFromName === courseNum;
        
        // Yo'nalish bo'yicha tekshirish
        const matchesDepartment = g.department === selectedDepartment;
        
        return matchesCourse && matchesDepartment;
      });
      
      // Guruhlarni nom bo'yicha tartiblash
      const sortedGroups = filtered
        .map(g => ({ name: g.name || g.code, code: g.code, id: g.id }))
        .filter(g => g.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setGroups(sortedGroups);
      
      // Agar tanlangan guruh yangi filtrlarda yo'q bo'lsa, uni tozalash
      if (selectedGroup && !sortedGroups.find(g => g.name === selectedGroup || g.code === selectedGroup)) {
        setSelectedGroup('');
        setAttendance([]);
      }
    } else {
      setGroups([]);
      if (!selectedDepartment) {
        setSelectedGroup('');
        setAttendance([]);
      }
    }
  }, [selectedCourse, selectedDepartment, allGroups]);

  // Guruh tanlanganda, talabalarni yuklash
  useEffect(() => {
    if (selectedGroup && selectedSubject && activeTab === 'attendance') {
      loadAttendance();
    } else if (!selectedGroup || !selectedSubject) {
      setAttendance([]);
      setLoading(false);
    }
  }, [selectedDate, selectedGroup, selectedSubject, activeTab]);

  // Baholash uchun kurs tanlanganda, yo'nalish va guruhlarni tozalash
  useEffect(() => {
    if (!selectedGradeCourse) {
      setSelectedGradeDepartment('');
      setGradeGroups([]);
      setSelectedGradeGroup('');
      setGradeStudents([]);
      setAttendanceSaved(false);
    }
  }, [selectedGradeCourse]);

  // Baholash uchun kurs va yo'nalish tanlanganda, guruhlarni filtrlash
  useEffect(() => {
    if (selectedGradeCourse && selectedGradeDepartment) {
      const courseNum = parseInt(selectedGradeCourse);
      const filtered = allGroups.filter(g => {
        // Kurs bo'yicha tekshirish
        const courseFromYear = getCourseFromYear(g.year);
        const courseFromName = getCourseFromGroupName(g.name || g.code);
        const matchesCourse = courseFromYear === courseNum || courseFromName === courseNum;
        
        // Yo'nalish bo'yicha tekshirish
        const matchesDepartment = g.department === selectedGradeDepartment;
        
        return matchesCourse && matchesDepartment;
      });
      
      const sortedGroups = filtered
        .map(g => ({ name: g.name || g.code, code: g.code, id: g.id, department: g.department }))
        .filter(g => g.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setGradeGroups(sortedGroups);
      
      // Agar tanlangan guruh yangi filtrlarda yo'q bo'lsa, uni tozalash
      if (selectedGradeGroup && !sortedGroups.find(g => g.name === selectedGradeGroup || g.code === selectedGradeGroup)) {
        setSelectedGradeGroup('');
        setGradeStudents([]);
        setAttendanceSaved(false);
      }
    } else {
      setGradeGroups([]);
      if (!selectedGradeDepartment) {
        setSelectedGradeGroup('');
        setGradeStudents([]);
        setAttendanceSaved(false);
      }
    }
  }, [selectedGradeCourse, selectedGradeDepartment, allGroups]);

  // Baholash uchun guruh tanlanganda, talabalarni yuklash va davomat holatini tekshirish
  useEffect(() => {
    if (selectedGradeGroup && selectedGradeSubject && selectedDate && activeTab === 'grades') {
      loadStudentsForGrading().then(() => {
        // Talabalar yuklangandan keyin davomat holatini tekshirish
        setTimeout(() => {
          checkAttendanceStatus();
        }, 300);
      });
    } else {
      setGradeStudents([]);
      setAttendanceSaved(false);
    }
  }, [selectedGradeGroup, selectedGradeSubject, selectedDate, activeTab]);

  const loadAttendance = async () => {
    if (!selectedGroup || !selectedSubject) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await attendanceAPI.getByDate(selectedDate, {
        group: selectedGroup,
        subject: selectedSubject,
      });
      
      const attendanceData = response.data || [];
      
      if (attendanceData.length === 0) {
        // Agar davomat yo'q bo'lsa, guruh talabalarini yuklash
        const studentsResponse = await studentsAPI.getAll({ 
          group: selectedGroup, 
          limit: 1000,
          page: 1
        });
        const studentsData = studentsResponse.data?.items || studentsResponse.data?.data || studentsResponse.data || [];
        
        const newAttendance = studentsData.map((student) => ({
          id: student.id,
          studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown',
          studentId: student.student_id || '',
          group: selectedGroup,
          status: 'present',
        }));
        
        setAttendance(newAttendance);
      } else {
        // Mavjud davomatni formatlash
        const formattedAttendance = attendanceData.map((item) => ({
          id: item.student_id,
          studentName: item.student_name || 'Unknown',
          studentId: item.student_student_id || '',
          group: item.group || selectedGroup,
          status: item.status || 'present',
        }));
        
        setAttendance(formattedAttendance);
      }
    } catch (error) {
      console.error('Davomatni yuklashda xatolik:', error);
      // Xatolik bo'lsa ham, talabalarni yuklashga harakat qilish
      try {
        const studentsResponse = await studentsAPI.getAll({ 
          group: selectedGroup, 
          limit: 1000,
          page: 1
        });
        const studentsData = studentsResponse.data?.items || studentsResponse.data?.data || studentsResponse.data || [];
        
        const newAttendance = studentsData.map((student) => ({
          id: student.id,
          studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown',
          studentId: student.student_id || '',
          group: selectedGroup,
          status: 'present',
        }));
        
        setAttendance(newAttendance);
      } catch (err) {
        console.error('Talabalarni yuklashda xatolik:', err);
        setAttendance([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Baholash uchun talabalarni yuklash
  const loadStudentsForGrading = async () => {
    if (!selectedGradeGroup) {
      setGradeStudents([]);
      return;
    }

    try {
      setLoadingGrades(true);
      console.log('Talabalarni yuklash:', { group: selectedGradeGroup });
      
      const studentsResponse = await studentsAPI.getAll({ 
        group: selectedGradeGroup, 
        limit: 1000,
        page: 1
      });
      
      console.log('Students API response:', studentsResponse.data);
      
      const students = studentsResponse.data?.items || studentsResponse.data?.data || studentsResponse.data || [];
      
      console.log('Parsed students:', students);
      
      const formattedStudents = students.map((student) => ({
        id: student.id,
        studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown',
        studentId: student.student_id || '',
        department: student.department || selectedGradeDepartment || '',
        group: selectedGradeGroup,
      }));
      
      console.log('Formatted students:', formattedStudents);
      setGradeStudents(formattedStudents);
      
      // Mavjud baholarni yuklash (talabalar yuklangandan keyin)
      if (selectedGradeSubject && selectedDate && formattedStudents.length > 0) {
        // To'g'ridan-to'g'ri formattedStudents ni yuborish
        await loadGrades(formattedStudents);
      }
    } catch (error) {
      console.error('Talabalarni yuklashda xatolik:', error);
      setGradeStudents([]);
    } finally {
      setLoadingGrades(false);
    }
  };

  // Baholarni yuklash
  const loadGrades = async (studentsList = null) => {
    try {
      if (!selectedGradeGroup || !selectedGradeSubject || !selectedDate) return;
      
      // Agar studentsList berilgan bo'lsa, uni ishlatish, aks holda state'dan olish
      const currentStudents = studentsList || gradeStudents;
      
      if (!currentStudents || currentStudents.length === 0) {
        console.log('Talabalar ro\'yxati bo\'sh, baholarni yuklash o\'tkazib yuborildi');
        return;
      }
      
      const response = await gradesAPI.getByGroupSubjectDate(
        selectedGradeGroup,
        selectedGradeSubject,
        selectedDate
      );
      const gradesData = response.data || [];
      
      // Talabalar bilan baholarni birlashtirish
      const studentsWithGrades = currentStudents.map((student) => {
        const grade = gradesData.find(g => g.student_id === student.id);
        return {
          ...student,
          grade: grade ? grade.grade : null,
          gradeId: grade ? grade.id : null,
          gradeType: grade ? grade.grade_type : 'oral',
        };
      });
      
      setGradeStudents(studentsWithGrades);
    } catch (error) {
      console.error('Baholarni yuklashda xatolik:', error);
    }
  };

  // Davomat olinganligini tekshirish
  const checkAttendanceStatus = async () => {
    try {
      if (!selectedGradeGroup || !selectedGradeSubject || !selectedDate) {
        setAttendanceSaved(false);
        return;
      }
      
      const response = await attendanceAPI.getByDate(selectedDate, {
        group: selectedGradeGroup,
        subject: selectedGradeSubject,
      });
      
      const attendanceData = response.data || [];
      
      // Barcha talabalar uchun davomat olinganligini tekshirish
      // Kamida bitta talaba uchun davomat olingan bo'lsa, ruxsat beriladi
      setAttendanceSaved(attendanceData.length > 0);
    } catch (error) {
      console.error('Davomat holatini tekshirishda xatolik:', error);
      setAttendanceSaved(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAttendance(
      attendance.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
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
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, rate };
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

  // Geolocation olish
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation qo\'llab-quvvatlanmaydi'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // O'qituvchi bo'lsa va geolocation yoqilgan bo'lsa, geolocation olish
      let location = null;
      if (user?.role === 'teacher' && geolocationEnabled) {
        try {
          location = await getCurrentLocation();
        } catch (error) {
          console.error('Geolocation olishda xatolik:', error);
          let errorMessage = 'Joylashuv ma\'lumotlarini olishda xatolik yuz berdi. ';
          if (error.code === 1) {
            errorMessage += 'Iltimos, brauzer sozlamalarida joylashuvga ruxsat bering.';
          } else if (error.code === 2) {
            errorMessage += 'Joylashuv ma\'lumotlari mavjud emas.';
          } else if (error.code === 3) {
            errorMessage += 'Joylashuv ma\'lumotlarini olish vaqti tugadi.';
          } else {
            errorMessage += error.message || 'Noma\'lum xatolik.';
          }
          alert(errorMessage);
          setLoading(false);
          return;
        }
      }

      const promises = attendance.map((item) => {
        const payload = {
          student_id: item.id,
          student_name: item.studentName || '',
          student_student_id: item.studentId || '',
          date: selectedDate,
          group: selectedGroup,
          subject: selectedSubject,
          status: item.status,
        };
        
        // Geolocation ma'lumotlarini qo'shish (o'qituvchi bo'lsa)
        if (location) {
          payload.latitude = location.latitude;
          payload.longitude = location.longitude;
        }
        
        return attendanceAPI.create(payload);
      });
      
      await Promise.all(promises);
      alert('Davomat muvaffaqiyatli saqlandi!');
      await loadAttendance();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      
      // Geolocation xatolikni tekshirish (403 status code va radius xatolik)
      if (error.response?.status === 403) {
        const errorDetail = error.response?.data?.detail || '';
        
        // Xatolik matnidan distance va radius ma'lumotlarini ajratib olish
        // Backend format: "Siz {distance} metr uzoqlikdasiz, lekin ruxsat etilgan radius {radius} metr."
        const distanceMatch = errorDetail.match(/Siz\s+(\d+(?:\.\d+)?)\s*metr/i) || 
                              errorDetail.match(/(\d+(?:\.\d+)?)\s*metr\s*uzoqlikdasiz/i);
        const radiusMatch = errorDetail.match(/radius\s*(\d+(?:\.\d+)?)\s*metr/i) ||
                            errorDetail.match(/ruxsat\s+etilgan\s+radius\s*(\d+(?:\.\d+)?)/i);
        
        let distance = distanceMatch ? parseFloat(distanceMatch[1]) : null;
        let radius = radiusMatch ? parseFloat(radiusMatch[1]) : null;
        
        // Institution sozlamalarini olish (radius uchun)
        if (!radius && user?.institution_id) {
          try {
            const instResponse = await institutionsAPI.getById(user.institution_id);
            const institution = instResponse.data;
            if (institution?.geolocation_radius) {
              radius = institution.geolocation_radius;
            }
            if (institution?.name && !institutionName) {
              setInstitutionName(institution.name);
            }
          } catch (err) {
            console.error('Institution ma\'lumotlarini olishda xatolik:', err);
          }
        }
        
        // Modal'ni ochish
        setGeolocationError({
          distance: distance,
          allowedRadius: radius,
          institutionName: institutionName || '',
        });
        setLoading(false);
        return;
      }
      
      // Boshqa xatoliklar uchun oddiy alert
      let errorMessage = 'Davomat saqlashda xatolik yuz berdi';
      if (error.response?.data?.detail) {
        errorMessage = String(error.response.data.detail);
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Baho qo'shish/yangilash
  const handleGradeChange = async (studentId, grade, gradeType = 'oral') => {
    if (!selectedGradeGroup || !selectedGradeSubject || !selectedDate) {
      alert('Barcha maydonlarni to\'ldiring!');
      return;
    }

    // Talaba qatnashganligini tekshirish
    try {
      const attendanceResponse = await attendanceAPI.getByDate(selectedDate, {
        group: selectedGradeGroup,
        subject: selectedGradeSubject,
      });
      
      const studentAttendance = attendanceResponse.data?.find(a => a.student_id === studentId);
      
      if (!studentAttendance || studentAttendance.status !== 'present') {
        alert('Bu talaba qatnashmagan! Avval davomat oling.');
        return;
      }

      const student = gradeStudents.find(s => s.id === studentId);
      if (!student) return;

      const payload = {
        student_id: studentId,
        student_name: student.studentName,
        student_student_id: student.studentId,
        group: selectedGradeGroup,
        department: student.department || '',
        subject: selectedGradeSubject,
        date: selectedDate,
        grade: parseFloat(grade),
        grade_type: gradeType,
      };

      await gradesAPI.create(payload);
      
      // Local state'ni yangilash
      setGradeStudents(gradeStudents.map(s => 
        s.id === studentId 
          ? { ...s, grade: parseFloat(grade), gradeType }
          : s
      ));
      
    } catch (error) {
      console.error('Bahoni saqlashda xatolik:', error);
      let errorMessage = 'Bahoni saqlashda xatolik yuz berdi';
      
      if (error.response?.data?.detail) {
        errorMessage = String(error.response.data.detail);
      }
      
      alert(errorMessage);
    }
  };

  const handleExport = () => {
    try {
      const headers = ['№', 'Talaba ID', 'Familiya va Ism', 'Davomat'];
      const rows = attendance.map((item, index) => [
        index + 1,
        item.studentId,
        item.studentName,
        statusConfig[item.status].label,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

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

  // Mavjud kurslarni olish (1-4 kurs)
  const availableCourses = [1, 2, 3, 4];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Elektron jurnal</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Davomat olish va talabalarni baholash
          </p>
        </div>
        {activeTab === 'attendance' && (
          <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none touch-manipulation" disabled={attendance.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Eksport</span>
            </Button>
            <Button onClick={handleSave} disabled={loading || !selectedGroup || !selectedSubject || attendance.length === 0} className="flex-1 sm:flex-none touch-manipulation">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="inline h-4 w-4 mr-2" />
              Davomat
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'grades'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Award className="inline h-4 w-4 mr-2" />
              Baholash
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Davomat Tab */}
      {activeTab === 'attendance' && (
        <>
          {/* Geolocation Warning/Info */}
          {user?.role === 'teacher' && geolocationEnabled && (
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <MapPin className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Geolocation cheklovi yoqilgan. Davomat olish uchun muassasa radius ichida bo'lishingiz kerak.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
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
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setSelectedDepartment('');
                      setSelectedGroup('');
                      setAttendance([]);
                    }}
                    className="w-full"
                    disabled={loadingFilters}
                  >
                    <option value="">Kursni tanlang...</option>
                    {availableCourses.map((course) => (
                      <option key={course} value={course}>
                        {course}-kurs
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedGroup('');
                      setAttendance([]);
                    }}
                    className="w-full"
                    disabled={loadingFilters || !selectedCourse}
                  >
                    <option value="">Yo'nalishni tanlang...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setAttendance([]);
                    }}
                    className="w-full"
                    disabled={loadingFilters || !selectedCourse || !selectedDepartment}
                  >
                    <option value="">Guruhni tanlang...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.name || group.code}>
                        {group.name || group.code}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setAttendance([]);
                    }}
                    className="w-full"
                    disabled={loadingFilters || !selectedGroup}
                  >
                    <option value="">Fanni tanlang...</option>
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
          {attendance.length > 0 && (
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
          )}

          {/* Attendance Table */}
          {selectedGroup && selectedSubject && (
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
                  {attendance.length > 0 && (
                    <Badge variant="secondary">
                      {stats.present}/{stats.total} qatnashgan
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
                ) : attendance.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Bu guruhda talabalar topilmadi yoki ma'lumotlar yuklanmoqda...
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <table className="w-full border-collapse min-w-[600px]">
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
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px] sm:min-w-[280px]">
                            Amallar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {attendance.map((item, index) => {
                          const config = statusConfig[item.status];
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
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(!selectedCourse || !selectedDepartment || !selectedGroup || !selectedSubject) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Davomat olish uchun</p>
                  <p className="text-sm">Kurs, yo'nalish, guruh va fanni tanlang</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Baholash Tab */}
      {activeTab === 'grades' && (
        <>
          {/* Filters for Grading */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
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
                    value={selectedGradeCourse}
                    onChange={(e) => {
                      setSelectedGradeCourse(e.target.value);
                      setSelectedGradeDepartment('');
                      setSelectedGradeGroup('');
                      setGradeStudents([]);
                      setAttendanceSaved(false);
                    }}
                    className="w-full"
                    disabled={loadingFilters}
                  >
                    <option value="">Kursni tanlang...</option>
                    {availableCourses.map((course) => (
                      <option key={course} value={course}>
                        {course}-kurs
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedGradeDepartment}
                    onChange={(e) => {
                      setSelectedGradeDepartment(e.target.value);
                      setSelectedGradeGroup('');
                      setGradeStudents([]);
                      setAttendanceSaved(false);
                    }}
                    className="w-full"
                    disabled={!selectedGradeCourse || loadingFilters}
                  >
                    <option value="">Yo'nalishni tanlang...</option>
                    {gradeDepartments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedGradeGroup}
                    onChange={(e) => {
                      setSelectedGradeGroup(e.target.value);
                      setGradeStudents([]);
                      setAttendanceSaved(false);
                    }}
                    className="w-full"
                    disabled={!selectedGradeCourse || !selectedGradeDepartment || loadingFilters}
                  >
                    <option value="">Guruhni tanlang...</option>
                    {gradeGroups.map((group) => (
                      <option key={group.id} value={group.name || group.code}>
                        {group.name || group.code}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedGradeSubject}
                    onChange={(e) => {
                      setSelectedGradeSubject(e.target.value);
                      setGradeStudents([]);
                      setAttendanceSaved(false);
                    }}
                    className="w-full"
                    disabled={!selectedGradeGroup}
                  >
                    <option value="">Fanni tanlang...</option>
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

          {/* Warning if attendance not saved */}
          {!attendanceSaved && selectedGradeGroup && selectedGradeSubject && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <XCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Avval davomat oling! Faqat qatnashgan talabalarga baho qo'yish mumkin.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grades Table */}
          {selectedGradeGroup && selectedGradeSubject && (
            <Card>
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Baholash jurnali
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(selectedDate)} • {selectedGradeGroup} • {selectedGradeSubject}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingGrades ? (
                  <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
                ) : gradeStudents.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Talabalar topilmadi yoki ma'lumotlar yuklanmoqda...
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <table className="w-full border-collapse min-w-[700px]">
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
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[120px]">
                            Baho
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[150px]">
                            Baho turi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {gradeStudents.map((student, index) => (
                          <tr
                            key={student.id}
                            className="hover:bg-muted/30 transition-colors border-b border-border"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold sticky left-0 bg-background z-20 border-r">
                              {index + 1}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium sticky left-[40px] sm:left-[50px] bg-background z-20 border-r">
                              {student.studentId}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm sticky left-[120px] sm:left-[150px] bg-background z-20 border-r">
                              {student.studentName}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                              <Select
                                value={student.grade ? student.grade.toString() : ''}
                                onChange={(e) => {
                                  const newGrade = e.target.value ? parseFloat(e.target.value) : null;
                                  setGradeStudents(gradeStudents.map(s => 
                                    s.id === student.id ? { ...s, grade: newGrade } : s
                                  ));
                                  if (newGrade) {
                                    handleGradeChange(student.id, newGrade, student.gradeType || 'oral');
                                  }
                                }}
                                className="w-24 mx-auto"
                                disabled={!attendanceSaved}
                              >
                                <option value="">Baho tanlang</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                              </Select>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                              <Select
                                value={student.gradeType || 'oral'}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  setGradeStudents(gradeStudents.map(s => 
                                    s.id === student.id ? { ...s, gradeType: newType } : s
                                  ));
                                  if (student.grade) {
                                    handleGradeChange(student.id, student.grade, newType);
                                  }
                                }}
                                className="w-full max-w-[150px] mx-auto"
                                disabled={!attendanceSaved}
                              >
                                <option value="oral">Og'zaki</option>
                                <option value="written">Yozma</option>
                                <option value="practical">Amaliy</option>
                                <option value="test">Test</option>
                                <option value="exam">Imtihon</option>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(!selectedGradeCourse || !selectedGradeDepartment || !selectedGradeGroup || !selectedGradeSubject) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Baholash uchun</p>
                  <p className="text-sm">Kurs, yo'nalish, guruh va fanni tanlang</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Geolocation Error Modal */}
      <GeolocationErrorModal
        isOpen={!!geolocationError}
        onClose={() => setGeolocationError(null)}
        distance={geolocationError?.distance}
        allowedRadius={geolocationError?.allowedRadius}
        institutionName={geolocationError?.institutionName || institutionName}
      />
    </div>
  );
}
