import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import useAuthStore from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { authAPI } from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Noto\'g\'ri email manzil'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
});

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      // Backend API orqali login
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      const { access_token, user } = response.data;
      
      // User formatini frontend formatiga o'tkazish
      const formattedUser = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        username: user.username,
      };

      login(formattedUser, access_token);

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Kirishda xatolik yuz berdi';
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getVersion = () => {
    const now = new Date();
    const date = now.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = now.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `1.0.0 / UID: ${Math.floor(Math.random() * 1000)} / Sana: ${date} ${time}`;
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
            title={theme === 'dark' ? 'Yoru rejimi' : 'Qorong\'i rejim'}
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
              Texnikum ERP
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Ta'lim boshqaruvi tizimi
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email/User ID */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email yoki Foydalanuvchi ID
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="h-11 pl-10 pr-4"
                  {...register('email')}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Parol
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pl-4 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me and Login button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
              <label className="flex items-center space-x-2 cursor-pointer group touch-manipulation">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  Eslab qolish
                </span>
              </label>
              <Button
                type="submit"
                className="w-full sm:w-auto sm:px-8 h-11 font-medium touch-manipulation"
                disabled={loading}
              >
                {loading ? 'Kirilmoqda...' : 'Kirish'}
              </Button>
            </div>
          </form>

          {/* Test credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
              Test uchun:
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p className="text-center">Admin: <span className="font-mono">admin@example.com</span></p>
              <p className="text-center">O'qituvchi: <span className="font-mono">teacher@example.com</span></p>
              <p className="text-center">Parol: <span className="font-mono">istalgan (6+ belgi)</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400 break-words">
            Dastur versiyasi: {getVersion()}
          </p>
        </div>
      </div>
    </div>
  );
}