import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileText,
  LogOut,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Bosh sahifa', path: '/dashboard' },
  { icon: Users, label: 'O\'qituvchilar', path: '/teachers' },
  { icon: GraduationCap, label: 'Talabalar', path: '/students' },
  { icon: Calendar, label: 'Dars jadvallari', path: '/schedules' },
  { icon: ClipboardCheck, label: 'Davomat', path: '/attendance' },
  { icon: BookOpen, label: 'Kutubxona', path: '/library' },
  { icon: Building2, label: 'Yo\'nalishlar', path: '/departments' },
  { icon: FileText, label: 'Audit log', path: '/audit-logs' },
];

const teacherMenuItems = [
  { icon: LayoutDashboard, label: 'Bosh sahifa', path: '/dashboard' },
  { icon: GraduationCap, label: 'Talabalar', path: '/students' },
  { icon: Calendar, label: 'Dars jadvali', path: '/schedules' },
  { icon: ClipboardCheck, label: 'Davomat', path: '/attendance' },
];

export function Sidebar({ onClose }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : teacherMenuItems;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleLinkClick = () => {
    // Mobile'da link bosilganda sidebar'ni yopish
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card shadow-lg lg:shadow-none">
      <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4 sm:px-6">
        <h1 className="text-lg sm:text-xl font-bold truncate">Texnikum ERP</h1>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3 sm:p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'touch-manipulation', // Mobile touch optimization
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 sm:p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start touch-manipulation"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Yoru rejimi</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Qorong'i rejim</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive touch-manipulation"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Chiqish</span>
        </Button>
      </div>
    </div>
  );
}
