import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardAPI } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBooks: 0,
    todayAttendance: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, attendanceResponse, studentsResponse, booksResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getAttendanceStats({ days: 7 }),
        dashboardAPI.getStudentStats(),
        dashboardAPI.getBookStats(),
      ]);

      const statsData = statsResponse.data;
      setStats({
        totalStudents: statsData.total_students || 0,
        totalTeachers: statsData.total_teachers || 0,
        totalBooks: statsData.total_books || 0,
        todayAttendance: statsData.today_attendance || 0,
        attendanceRate: statsData.attendance_rate || 0,
      });

      // Chart data'ni yangilash
      if (attendanceResponse.data) {
        // Weekly attendance data
        const weeklyData = attendanceResponse.data.slice().reverse().map((item, index) => {
          const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
          const date = new Date(item.date);
          return {
            name: days[date.getDay()] || `Kun ${index + 1}`,
            present: item.present || 0,
            absent: item.absent || 0,
          };
        });
        setAttendanceData(weeklyData);
      }

      if (studentsResponse.data) {
        setStudentsByDepartment(studentsResponse.data);
      }
    } catch (error) {
      console.error('Dashboard ma\'lumotlarini yuklashda xatolik:', error);
      // Fallback to mock data
      setStats({
        totalStudents: 1248,
        totalTeachers: 48,
        totalBooks: 3421,
        todayAttendance: 1187,
        attendanceRate: 95.1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data state
  const [attendanceData, setAttendanceData] = useState([
    { name: 'Dushanba', present: 1180, absent: 68 },
    { name: 'Seshanba', present: 1195, absent: 53 },
    { name: 'Chorshanba', present: 1187, absent: 61 },
    { name: 'Payshanba', present: 1200, absent: 48 },
    { name: 'Juma', present: 1187, absent: 61 },
    { name: 'Shanba', present: 1150, absent: 98 },
  ]);

  const [studentsByDepartment, setStudentsByDepartment] = useState([
    { name: 'Axborot texnologiyalari', value: 320 },
    { name: 'Muhandislik', value: 280 },
    { name: 'Iqtisodiyot', value: 245 },
    { name: 'Ta\'lim', value: 203 },
    { name: 'Boshqalar', value: 200 },
  ]);

  const monthlyAttendance = [
    { month: 'Sentabr', rate: 93.8 },
    { month: 'Oktabr', rate: 94.2 },
    { month: 'Noyabr', rate: 94.0 },
    { month: 'Dekabr', rate: 93.5 },
    { month: 'Yanvar', rate: 94.5 },
    { month: 'Fevral', rate: 95.2 },
    { month: 'Mart', rate: 96.1 },
    { month: 'Aprel', rate: 95.8 },
    { month: 'May', rate: 96.5 },
    { month: 'Iyun', rate: 95.1 },
  ];

  const statCards = [
    {
      title: 'Jami talabalar',
      value: stats.totalStudents,
      icon: GraduationCap,
      change: '+12%',
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Jami o\'qituvchilar',
      value: stats.totalTeachers,
      icon: Users,
      change: '+3%',
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Kutubxona kitoblari',
      value: stats.totalBooks,
      icon: BookOpen,
      change: '+25',
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Bugungi davomat',
      value: `${stats.todayAttendance} (${stats.attendanceRate}%)`,
      icon: ClipboardCheck,
      change: '+2.1%',
      trend: 'up',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Bosh sahifa</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Umumiy statistika va ko'rsatkichlar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`rounded-full p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {card.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span>{card.change}</span>
                  <span className="ml-1">o'tgan oydan</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Haftalik davomat</CardTitle>
            <CardDescription>Haftalik davomat statistikasi (Dushanba - Shanba)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} className="min-h-[280px] sm:h-[320px]">
              <BarChart 
                data={attendanceData}
                margin={{ top: 5, right: 30, left: 5, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 1200]} ticks={[0, 300, 600, 900, 1200]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Qatnashgan" />
                <Bar dataKey="absent" fill="#ef4444" name="Qatnashmagan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Talabalar bo'yicha yo'nalishlar</CardTitle>
            <CardDescription>Yo'nalishlar bo'yicha taqsimot</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} className="min-h-[280px] sm:h-[300px]">
              <PieChart>
                <Pie
                  data={studentsByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentsByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oylik davomat statistikasi</CardTitle>
          <CardDescription>To'liq o'quv yili davomat foizi (Sentabr - Iyun)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="min-h-[300px] sm:h-[350px]">
            <LineChart data={monthlyAttendance} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[90, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Davomat %"
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
