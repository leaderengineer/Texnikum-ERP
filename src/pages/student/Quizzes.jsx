import { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Trophy,
  Play,
  Eye,
  Loader2,
  AlertCircle,
  Star,
  TrendingUp,
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
import { Input } from '../../components/ui/Input';
import { quizzesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export function Quizzes() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showPremium, setShowPremium] = useState(true);

  useEffect(() => {
    loadQuizzes();
    loadMyResults();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getAll();
      setQuizzes(response.data || []);
    } catch (err) {
      console.error('Testlarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyResults = async () => {
    try {
      setResultsLoading(true);
      const response = await quizzesAPI.getMyResults();
      setMyResults(response.data || []);
    } catch (err) {
      console.error('Natijalarni yuklashda xatolik:', err);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}/take`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/quizzes/${quizId}/results`);
  };

  const getQuizBestResult = (quizId) => {
    const results = myResults.filter(r => r.quiz_id === quizId);
    if (results.length === 0) return null;
    return results.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || quiz.subject === selectedSubject;
    const matchesPremium = showPremium || !quiz.is_premium;
    return matchesSearch && matchesSubject && matchesPremium;
  });

  const subjects = [...new Set(quizzes.map(q => q.subject))];

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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Testlar
        </h1>
        <p className="text-muted-foreground mt-1">
          O'z bilimingizni sinab ko'ring va natijalarni kuzating
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">Barcha fanlar</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPremium"
                checked={showPremium}
                onChange={(e) => setShowPremium(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showPremium" className="cursor-pointer">
                Premium testlarni ko'rsatish
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Testlar topilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuizzes.map((quiz) => {
            const bestResult = getQuizBestResult(quiz.id);
            
            return (
              <Card key={quiz.id} className={quiz.is_premium ? 'border-yellow-400' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {quiz.title}
                        {quiz.is_premium && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {quiz.description || 'Tavsif yo\'q'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Taxminiy vaqt:</div>
                        <div className="font-medium">
                          {quiz.estimated_time_minutes ? `${quiz.estimated_time_minutes} daqiqa` : 'Noma\'lum'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Jami ball:</div>
                        <div className="font-medium">{quiz.total_points}</div>
                      </div>
                    </div>
                    {bestResult && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-muted-foreground">Eng yaxshi natija:</div>
                          <div className="font-medium text-green-600">
                            {bestResult.percentage}% ({bestResult.score}/{bestResult.max_score})
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{quiz.subject}</Badge>
                    <Badge variant="outline">{quiz.department}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleStartQuiz(quiz.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Testni boshlash
                    </Button>
                    {bestResult && (
                      <Button
                        variant="outline"
                        onClick={() => handleViewResults(quiz.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Natijalarni ko'rish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* My Results Summary */}
      {!resultsLoading && myResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mening natijalarim</CardTitle>
            <CardDescription>Barcha testlardagi natijalaringiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myResults.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <div className="font-medium">Test ID: {result.quiz_id}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(result.completed_at).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {result.percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.score}/{result.max_score} ball
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

