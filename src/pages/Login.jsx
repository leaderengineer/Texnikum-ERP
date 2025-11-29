import { useState, useEffect } from 'react';
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

      if (response.data && response.data.access_token && response.data.user) {
        const { access_token, user } = response.data;
        
        // User formatini frontend formatiga o'tkazish
        const formattedUser = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          username: user.username,
          institution_id: user.institution_id,
        };

        login(formattedUser, access_token);

        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError('Server javobida ma\'lumotlar to\'liq emas');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Kirishda xatolik yuz berdi';
      
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

  // Google Password Manager ogohlantirishlarini o'chirish
  useEffect(() => {
    const removePasswordManagerPopups = () => {
      // Barcha iframe'larni tekshirish
      document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.src && (
          iframe.src.includes('accounts.google.com') ||
          iframe.src.includes('password-manager') ||
          iframe.src.includes('passwords.google.com')
        )) {
          iframe.remove();
        }
      });

      // Google Password Manager modal'larini topish
      document.querySelectorAll('div, section, dialog').forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Change your password') ||
            text.includes('password that you just used') ||
            text.includes('data breach') ||
            text.includes('Google Password Manager recommends')) {
          // Modal yoki popup ekanligini tekshirish
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute' || 
              el.classList.toString().includes('modal') ||
              el.classList.toString().includes('popup') ||
              el.classList.toString().includes('dialog')) {
            el.remove();
          }
        }
      });
    };

    // Dastlabki tekshirish
    removePasswordManagerPopups();

    // Har 300ms da tekshirish
    const interval = setInterval(removePasswordManagerPopups, 300);

    // MutationObserver qo'shish
    const observer = new MutationObserver(removePasswordManagerPopups);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Top green line */}
        <div className="h-1 bg-primary"></div>
        
        {/* Theme toggle */}
        <div className="absolute top-3 right-3 z-10">
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Theme toggle"
            title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Logo and Title - Horizontal Layout */}
          <div className="flex items-center gap-4 mb-5">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-primary bg-primary/5 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
            </div>
            
            {/* Title */}
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                Texnikum ERP
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ta'lim boshqaruvi tizimi
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" autoComplete="on" data-lpignore="false">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Email/User ID */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Email yoki Foydalanuvchi ID
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="h-10 pl-9 pr-3 text-sm"
                  autoComplete="email"
                  {...register('email')}
                />
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Parol
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-10 pl-3 pr-9 text-sm"
                  autoComplete="current-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me and Login button */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group touch-manipulation">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  Eslab qolish
                </span>
              </label>
              <Button
                type="submit"
                className="px-6 h-10 text-sm font-medium touch-manipulation"
                disabled={loading}
              >
                {loading ? 'Kirilmoqda...' : 'Kirish'}
              </Button>
            </div>

            {/* Forgot password link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-primary hover:underline"
              >
                Parolni unutdingizmi?
              </button>
            </div>
          </form>

          {/* Test credentials - Compact Grid */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
              Test uchun:
            </p>
            <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <p className="font-medium mb-0.5">Admin</p>
                <p className="font-mono text-[9px]">admin@example.com</p>
              </div>
              <div className="text-center">
                <p className="font-medium mb-0.5">O'qituvchi</p>
                <p className="font-mono text-[9px]">teacher@example.com</p>
              </div>
              <div className="text-center">
                <p className="font-medium mb-0.5">Talaba</p>
                <p className="font-mono text-[9px]">student@example.com</p>
              </div>
              <div className="text-center">
                <p className="font-medium mb-0.5">Parol</p>
                <p className="font-mono text-[9px]">admin: admin123, teacher: teacher123, student: student123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="px-5 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[9px] text-center text-gray-500 dark:text-gray-400 break-words">
            Versiya: {getVersion()}
          </p>
        </div>
      </div>
    </div>
  );
}