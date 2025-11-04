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
import { auditAPI } from '../../services/api';

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
      setLoading(true);
      const response = await auditAPI.getAll({ limit: 100 });
      const logsData = response.data || [];
      
      // Backend formatidan frontend formatiga o'tkazish
      const formattedLogs = logsData.map((log) => ({
        id: log.id,
        user: log.user_email || log.user_id?.toString() || 'Unknown',
        action: log.action,
        entity: log.resource_type,
        entityId: log.resource_id,
        details: log.description || `${log.action} ${log.resource_type}`,
        timestamp: new Date(log.created_at),
      }));
      
      setLogs(formattedLogs);
    } catch (error) {
      console.error('Loglarni yuklashda xatolik:', error);
      setLogs([]);
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
