import { Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui/Button';

export function Header({ onMenuClick }) {
  const { user } = useAuthStore();

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-card px-3 sm:px-4 md:px-6 sticky top-0 z-30 backdrop-blur-sm bg-card/95">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-base sm:text-lg font-semibold truncate">
          {user?.role === 'admin' ? 'Admin panel' : 'O\'qituvchi paneli'}
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px] md:max-w-none">
          {user?.firstName} {user?.lastName}
        </div>
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-medium shrink-0">
          {user?.firstName?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
