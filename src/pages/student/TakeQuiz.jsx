import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { quizzesAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await quizzesAPI.getById(quizId);
        const data = response.data;
        setQuiz(data);
        if (data.estimated_time_minutes) {
          setSecondsLeft(data.estimated_time_minutes * 60);
        }
      } catch (err) {
        console.error('Testni yuklashda xatolik:', err);
        setError(
          err.response?.data?.detail ||
            "Testni yuklashda xatolik yuz berdi. Keyinroq qayta urinib ko'ring."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!secondsLeft || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && quiz && !submitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answers, questions.length]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return '--:--';
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    try {
      setSubmitting(true);
      setError('');
      const minutesSpent =
        quiz.estimated_time_minutes && secondsLeft != null
          ? Math.round(
              quiz.estimated_time_minutes - secondsLeft / 60
            )
          : quiz.estimated_time_minutes || 0;

      const payload = {
        quiz_id: quiz.id,
        answers,
        time_spent_minutes: minutesSpent > 0 ? minutesSpent : 1,
      };

      const response = await quizzesAPI.submit(quiz.id, payload);
      navigate(`/quizzes/${quiz.id}/results`, {
        state: { result: response.data, quiz },
      });
    } catch (err) {
      console.error('Testni yuborishda xatolik:', err);
      setError(
        err.response?.data?.detail ||
          "Javoblarni yuborishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Yuklanmoqda...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error || 'Test topilmadi'}</p>
        <Button onClick={() => navigate(-1)}>Ortga qaytish</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/student/quizzes')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              Savol {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">To&apos;ldirilganlik</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
            <span className="font-semibold text-sm">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-50 border-slate-700 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              Savol #{currentIndex + 1}
            </CardTitle>
          </div>
          <Badge className="px-4 py-1 rounded-full bg-indigo-600 text-xs">
            {quiz.is_premium ? "Premium test" : "Oddiy test"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-semibold">
            {currentQuestion?.question}
          </div>

          {/* Javob variantlari */}
          <div className="space-y-4">
            {currentQuestion?.type === 'multiple_choice' &&
              currentQuestion.options?.map((opt, index) => {
                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                const letter = letters[index] || '?';
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/20 shadow-lg'
                        : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-100'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="text-sm md:text-base">{opt.text}</span>
                    </div>
                  </button>
                );
              })}

            {currentQuestion?.type === 'true_false' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'true', label: 'To\'g\'ri' },
                  { id: 'false', label: 'Noto\'g\'ri' },
                ].map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                      className={`w-full flex items-center justify-center px-5 py-4 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? 'border-indigo-400 bg-indigo-500/20 shadow-lg'
                          : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-sm md:text-base font-medium">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion?.type === 'short_answer' && (
              <textarea
                className="w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Javobingizni yozing..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) =>
                  handleAnswer(currentQuestion.id, e.target.value)
                }
              />
            )}
          </div>

          {/* Navigatsiya tugmalari */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              Oldingi savol
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Javoblar har bir bosishda avtomatik saqlanadi
              </span>
              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentIndex((i) =>
                      Math.min(questions.length - 1, i + 1)
                    )
                  }
                >
                  Keyingi savol
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Javobni yuborish'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


