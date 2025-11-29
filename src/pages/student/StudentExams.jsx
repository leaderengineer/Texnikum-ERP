import { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  Loader2,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { examsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export function StudentExams() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await examsAPI.getAvailable();
      setExams(response.data || []);
    } catch (err) {
      console.error('Imtihonlarni yuklashda xatolik:', err);
      setError('Imtihonlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
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

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Muddati tugagan';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} soat ${minutes} daqiqa qoldi`;
    }
    return `${minutes} daqiqa qoldi`;
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await examsAPI.startAttempt(examId);
      navigate(`/exams/${examId}/take`, { state: { attempt: response.data } });
    } catch (err) {
      console.error('Imtihonni boshlashda xatolik:', err);
      alert(err.response?.data?.detail || 'Imtihonni boshlashda xatolik yuz berdi');
    }
  };

  const handleViewResults = (examId) => {
    navigate(`/exams/${examId}/results`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive">{error}</p>
          <Button onClick={loadExams} className="mt-4">
            Qayta urinib ko'rish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Mavjud imtihonlar
        </h1>
        <p className="text-muted-foreground mt-1">
          Sizga berilgan imtihonlarni ko'ring va yeching
        </p>
      </div>

      {/* Exams List */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Hozircha mavjud imtihonlar yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => {
            const now = new Date();
            const start = new Date(exam.start_time);
            const end = new Date(exam.end_time);
            const isActive = now >= start && now <= end;
            const isUpcoming = now < start;
            const isExpired = now > end;

            return (
              <Card key={exam.id} className={isActive ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {exam.title}
                        {isActive && (
                          <Badge variant="default" className="bg-green-500">
                            <Play className="h-3 w-3 mr-1" />
                            Aktiv
                          </Badge>
                        )}
                        {isUpcoming && (
                          <Badge variant="default">
                            <Clock className="h-3 w-3 mr-1" />
                            Kutilmoqda
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Tugagan
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {exam.description || 'Tavsif yo\'q'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Boshlanish:</div>
                        <div className="font-medium">{formatDate(exam.start_time)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Tugash:</div>
                        <div className="font-medium">{formatDate(exam.end_time)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Davomiyligi:</div>
                        <div className="font-medium">{exam.duration_minutes} daqiqa</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Jami ball:</div>
                        <div className="font-medium">{exam.total_points}</div>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md mb-4">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{getTimeRemaining(exam.end_time)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{exam.subject}</Badge>
                    <Badge variant="outline">{exam.group}</Badge>
                    <Badge variant="outline">{exam.department}</Badge>
                    <Badge variant="outline">Urinishlar: {exam.max_attempts}</Badge>
                  </div>

                  <div className="flex gap-2">
                    {isActive && (
                      <Button onClick={() => handleStartExam(exam.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Imtihonni boshlash
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleViewResults(exam.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Natijalarni ko'rish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

