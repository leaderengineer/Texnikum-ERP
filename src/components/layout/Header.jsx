import { Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui/Button';
import CryptoJS from 'crypto-js';

export function Header({ sidebarOpen, onMenuClick }) {
  const { user } = useAuthStore();

  // Gravatar URL yaratish
  const getGravatarUrl = (email) => {
    if (!email) return null;
    try {
      const emailLower = email.toLowerCase().trim();
      const hash = CryptoJS.MD5(emailLower).toString();
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
    } catch (error) {
      return null;
    }
  };

  // Profil rasmini olish (avatar_url yoki Gravatar)
  const getProfileImage = () => {
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    if (user?.email) {
      return getGravatarUrl(user.email);
    }
    return null;
  };

  const profileImage = getProfileImage();
  
  // Ism va familiyani olish (ikkala formatni qo'llab-quvvatlash)
  const firstName = user?.firstName || user?.first_name;
  const lastName = user?.lastName || user?.last_name;
  
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || lastName || user?.email || 'User';

  const getPanelTitle = () => {
    if (user?.role === 'admin') return "Admin panel";
    if (user?.role === 'teacher') return "O'qituvchi paneli";
    if (user?.role === 'student') return "Talaba paneli";
    return "Panel";
  };

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-card px-3 sm:px-4 md:px-6 sticky top-0 z-30 backdrop-blur-sm bg-card/95">
      <div className="flex items-center gap-3">
        {/* Mobile'da sidebar yopilganda menu tugmasini ko'rsatish */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-base sm:text-lg font-semibold truncate">
          {getPanelTitle()}
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px] md:max-w-none">
          {displayName}
        </div>
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt={displayName}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border-2 border-primary shrink-0"
              onError={(e) => {
                // Agar rasm yuklanmasa, default rasmni ko'rsatish
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-medium shrink-0 ${profileImage ? 'hidden' : ''}`}
          >
            {(firstName?.[0] || lastName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
