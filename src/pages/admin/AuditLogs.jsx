import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
    // Real vaqtda yangilanish (har 30 soniyada)
    const interval = setInterval(() => {
      loadLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      // Mock data - backend bilan almashtiriladi
      // const response = await auditAPI.getAll();
      const now = new Date();
      const mockLogs = [
        {
          id: 1,
          user: 'Admin User',
          action: 'create',
          entity: 'Student',
          entityId: 123,
          details: 'Yangi talaba qo\'shildi: Aziz Karimov',
          timestamp: new Date(now.getTime() - 1000 * 60 * 5), // 5 daqiqa oldin
        },
        {
          id: 2,
          user: 'Admin User',
          action: 'update',
          entity: 'Teacher',
          entityId: 45,
          details: 'O\'qituvchi ma\'lumotlari yangilandi',
          timestamp: new Date(now.getTime() - 1000 * 60 * 15), // 15 daqiqa oldin
        },
        {
          id: 3,
          user: 'Admin User',
          action: 'delete',
          entity: 'Book',
          entityId: 78,
          details: 'Kitob o\'chirildi: JavaScript Guide',
          timestamp: new Date(now.getTime() - 1000 * 60 * 60), // 1 soat oldin
        },
        {
          id: 4,
          user: 'Teacher User',
          action: 'update',
          entity: 'Attendance',
          entityId: 234,
          details: 'Davomat yangilandi: 5 ta talaba belgilandi',
          timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 daqiqa oldin
        },
        {
          id: 5,
          user: 'Admin User',
          action: 'create',
          entity: 'Schedule',
          entityId: 89,
          details: 'Yangi dars jadvali qo\'shildi: AT-21-01',
          timestamp: new Date(now.getTime() - 1000 * 60 * 2), // 2 daqiqa oldin
        },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Loglarni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) =>
    `${log.user} ${log.action} ${log.entity} ${log.details}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const actionColors = {
    create: 'default',
    update: 'secondary',
    delete: 'destructive',
    read: 'outline',
  };

  const actionLabels = {
    create: 'Yaratish',
    update: 'Yangilash',
    delete: 'O\'chirish',
    read: 'Ko\'rish',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Audit log</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Tizimdagi barcha o'zgartirishlar tarixi
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit log ro'yxati</CardTitle>
          <CardDescription>
            Barcha foydalanuvchi harakatlari va o'zgartirishlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Yuklanmoqda...</div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Vaqt</TableHead>
                    <TableHead className="min-w-[120px]">Foydalanuvchi</TableHead>
                    <TableHead className="min-w-[100px]">Harakat</TableHead>
                    <TableHead className="min-w-[100px]">Ob'ekt</TableHead>
                    <TableHead className="min-w-[80px]">Ob'ekt ID</TableHead>
                    <TableHead className="min-w-[200px]">Tafsilotlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loglar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {log.timestamp.toLocaleString('uz-UZ', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">{log.user}</TableCell>
                        <TableCell>
                          <Badge variant={actionColors[log.action]} className="text-xs">
                            {actionLabels[log.action]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{log.entity}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{log.entityId}</TableCell>
                        <TableCell className="max-w-md truncate text-xs sm:text-sm">{log.details}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
