import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, ArrowLeft, Mail, Key, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { authAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Noto\'g\'ri email manzil'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'Kod 6 xonali bo\'lishi kerak'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
  confirmPassword: z.string().min(6, 'Parolni tasdiqlang'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Parollar mos kelmayapti',
  path: ['confirmPassword'],
});

export function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Email kiritish
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // Step 2: SMS kodini kiritish
  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: errorsCode },
  } = useForm({
    resolver: zodResolver(codeSchema),
  });

  // Step 3: Yangi parol o'rnatish
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    watch,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleRequestCode = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const emailLower = data.email.trim().toLowerCase();
      const response = await authAPI.requestPasswordReset(emailLower);
      
      if (response.data && response.data.success) {
        setEmail(emailLower);
        setSuccess(response.data.message || 'Parolni tiklash kodi elektron pochtangizga yuborildi!');
        setStep(2);
      } else {
        setError('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'Xatolik yuz berdi';
      
      if (err.response) {
        // Server javob berdi
        const detail = err.response.data?.detail;
        if (detail) {
          errorMessage = Array.isArray(detail) ? detail[0] : detail;
        } else {
          errorMessage = err.response.data?.message || `Server xatolik: ${err.response.status}`;
        }
      } else if (err.request) {
        // So'rov yuborildi, lekin javob kelmadi
        errorMessage = 'Server bilan bog\'lanishda xatolik. Iltimos, backend server ishlayotganini tekshiring.';
      } else {
        errorMessage = err.message || 'Noma\'lum xatolik';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.verifyPasswordResetCode(email, data.code);
      setCode(data.code);
      setSuccess('Kod to\'g\'ri! Endi yangi parol o\'rnatishingiz mumkin.');
      setStep(3);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Xatolik yuz berdi';
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.confirmPasswordReset(email, code, data.newPassword);
      setSuccess('Parol muvaffaqiyatli o\'zgartirildi!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Xatolik yuz berdi';
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Top green line */}
        <div className="h-1 bg-primary"></div>
        
        {/* Theme toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Theme toggle"
            title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Login sahifasiga qaytish
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-primary bg-primary/5 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Parolni tiklash
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {step === 1 && 'Elektron pochtangizni kiriting'}
              {step === 2 && 'Email\'dagi kodni kiriting'}
              {step === 3 && 'Yangi parol o\'rnating'}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                3
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-600 dark:text-green-400 mb-4">
              {success}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSubmitEmail(handleRequestCode)} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Elektron pochta
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="h-11 pl-10 pr-4"
                    autoComplete="email"
                    {...registerEmail('email')}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errorsEmail.email && (
                  <p className="text-xs text-red-600 mt-1">{errorsEmail.email.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tizimga qo'shilgan elektron pochtangizni kiriting
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={loading}
              >
                {loading ? 'Yuborilmoqda...' : 'Kod yuborish'}
              </Button>
            </form>
          )}

          {/* Step 2: Code */}
          {step === 2 && (
            <form onSubmit={handleSubmitCode(handleVerifyCode)} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SMS kodi
                </Label>
                <div className="relative">
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="h-11 pl-10 pr-4 text-center text-2xl tracking-widest"
                    {...registerCode('code')}
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errorsCode.code && (
                  <p className="text-xs text-red-600 mt-1">{errorsCode.code.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {email} manziliga yuborilgan 6 xonali kodni kiriting
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={loading}
              >
                {loading ? 'Tekshirilmoqda...' : 'Kodni tekshirish'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Email manzilini o'zgartirish
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleSubmitPassword(handleResetPassword)} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yangi parol
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-4"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    {...registerPassword('newPassword')}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errorsPassword.newPassword && (
                  <p className="text-xs text-red-600 mt-1">{errorsPassword.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Parolni tasdiqlash
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-4"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    {...registerPassword('confirmPassword')}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errorsPassword.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errorsPassword.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={loading}
              >
                {loading ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

