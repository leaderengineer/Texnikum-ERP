import { useEffect, useState } from 'react';
import { User, Mail, School, GraduationCap, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import useAuthStore from '../../store/authStore';
import { studentsAPI } from '../../services/api';

export function StudentSettings() {
  const { user } = useAuthStore();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentInfo = async () => {
      try {
        setLoading(true);
        // Hozircha admin/student API orqali barcha talabalar ichidan email bo'yicha topamiz
        const response = await studentsAPI.getAll({ limit: 1000, search: user?.email || '' });
        const items = response.data?.items || response.data || [];
        const match =
          items.find(
            (s) =>
              s.email === user?.email ||
              s.student_id === user?.username ||
              s.student_id === user?.student_id
          ) || null;
        setStudentInfo(match);
      } catch (error) {
        console.error('Talaba ma\'lumotlarini yuklashda xatolik:', error);
        setStudentInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadStudentInfo();
  }, [user]);

  const firstName = user?.firstName || user?.first_name;
  const lastName = user?.lastName || user?.last_name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Talaba profili</h1>
          <p className="text-muted-foreground mt-1">
            Shaxsiy ma&apos;lumotlaringiz va o&apos;qish haqidagi qisqacha ma&apos;lumot.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Shaxsiy ma&apos;lumotlar
          </CardTitle>
          <CardDescription>
            Bu ma&apos;lumotlar admin va o&apos;qituvchilar tomonidan boshqariladi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ism</Label>
            <Input value={firstName || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Familiya</Label>
            <Input value={lastName || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            O&apos;qish ma&apos;lumotlari
          </CardTitle>
          <CardDescription>
            Guruh, yo&apos;nalish va talaba ID ma&apos;lumotlari.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Yuklanmoqda...
            </div>
          ) : !studentInfo ? (
            <div className="text-sm text-muted-foreground">
              Talaba jadvalidan mos ma&apos;lumot topilmadi. Bu demo akkaunti bo&apos;lishi mumkin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Talaba ID</Label>
                <Input value={studentInfo.student_id} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Guruh</Label>
                <Input value={studentInfo.group} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Yo&apos;nalish</Label>
                <Input value={studentInfo.department} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Holat</Label>
                <Input
                  value={studentInfo.status === 'active' ? 'Faol' : 'Nofaol'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


