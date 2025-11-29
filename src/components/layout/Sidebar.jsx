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
  UserCircle,
  FolderOpen,
  Settings,
  Menu,
  ChevronLeft,
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
  { icon: ClipboardCheck, label: 'Elektron jurnal', path: '/attendance' },
  { icon: FolderOpen, label: 'Dars materiallari', path: '/lesson-materials' },
  { icon: BookOpen, label: 'Kutubxona', path: '/library' },
  { icon: Building2, label: 'Yo\'nalishlar', path: '/departments' },
  { icon: FileText, label: 'Audit log', path: '/audit-logs' },
  { icon: Settings, label: 'Sozlamalar', path: '/settings' },
];

const teacherMenuItems = [
  { icon: LayoutDashboard, label: 'Bosh sahifa', path: '/dashboard' },
  { icon: GraduationCap, label: 'Talabalar', path: '/students' },
  { icon: Calendar, label: 'Dars jadvali', path: '/schedules' },
  { icon: ClipboardCheck, label: 'Elektron jurnal', path: '/attendance' },
  { icon: FolderOpen, label: 'Dars materiallari', path: '/lesson-materials' },
  { icon: Building2, label: 'Yo\'nalishlar', path: '/departments' },
  { icon: BookOpen, label: 'Kutubxona', path: '/library' },
  { icon: Settings, label: 'Sozlamalar', path: '/teacher-settings' },
];

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Bosh sahifa', path: '/dashboard' },
  { icon: Calendar, label: 'Dars jadvali', path: '/schedules' },
  { icon: FolderOpen, label: 'Dars materiallari', path: '/lesson-materials' },
  { icon: BookOpen, label: 'Kutubxona', path: '/library' },
  { icon: Settings, label: 'Sozlamalar', path: '/student/settings' },
];

export function Sidebar({ isOpen, onClose, onToggle }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const menuItems = isAdmin ? adminMenuItems : isTeacher ? teacherMenuItems : studentMenuItems;

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
    <div className={cn(
      "flex h-screen flex-col border-r bg-card shadow-lg lg:shadow-none transition-all duration-300 ease-in-out overflow-hidden",
      isOpen ? "w-64" : "w-0 lg:w-16"
    )}>
      <div className={cn(
        "flex h-14 sm:h-16 items-center border-b shrink-0 transition-all duration-300",
        isOpen ? "justify-between px-4 sm:px-6" : "justify-center px-2"
      )}>
        {isOpen ? (
          <h1 className="text-lg sm:text-xl font-bold truncate">Texnikum ERP</h1>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            T
          </div>
        )}
      </div>

      <nav className={cn(
        "flex-1 space-y-1 overflow-y-auto transition-all duration-300",
        isOpen ? "p-3 sm:p-4" : "p-2"
      )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                'touch-manipulation', // Mobile touch optimization
                isOpen ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent'
              )}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "border-t space-y-2 transition-all duration-300",
        isOpen ? "p-3 sm:p-4" : "p-2"
      )}>
        {/* Mobile menu toggle button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full touch-manipulation lg:hidden",
            isOpen ? "justify-start" : "justify-center"
          )}
          onClick={onClose}
          title={!isOpen ? "Menuni yopish" : undefined}
        >
          <X className={cn("h-4 w-4 shrink-0", isOpen && "mr-2")} />
          {isOpen && <span className="truncate">Menuni yopish</span>}
        </Button>
        
        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full touch-manipulation hidden lg:flex",
            isOpen ? "justify-start" : "justify-center"
          )}
          onClick={onToggle}
          title={!isOpen ? "Menuni ochish" : "Menuni yopish"}
        >
          {isOpen ? (
            <>
              <ChevronLeft className={cn("h-4 w-4 shrink-0", isOpen && "mr-2")} />
              <span className="truncate">Menuni yopish</span>
            </>
          ) : (
            <Menu className="h-4 w-4 shrink-0" />
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full touch-manipulation",
            isOpen ? "justify-start" : "justify-center"
          )}
          onClick={toggleTheme}
          title={!isOpen ? (theme === 'dark' ? "Yorug' rejim" : "Qorong'i rejim") : undefined}
        >
          {theme === 'dark' ? (
            <>
              <Sun className={cn("h-4 w-4 shrink-0", isOpen && "mr-2")} />
              {isOpen && <span className="truncate">Yorug' rejim</span>}
            </>
          ) : (
            <>
              <Moon className={cn("h-4 w-4 shrink-0", isOpen && "mr-2")} />
              {isOpen && <span className="truncate">Qorong'i rejim</span>}
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-destructive hover:text-destructive touch-manipulation",
            isOpen ? "justify-start" : "justify-center"
          )}
          onClick={handleLogout}
          title={!isOpen ? "Chiqish" : undefined}
        >
          <LogOut className={cn("h-4 w-4 shrink-0", isOpen && "mr-2")} />
          {isOpen && <span className="truncate">Chiqish</span>}
        </Button>
      </div>
    </div>
  );
}
