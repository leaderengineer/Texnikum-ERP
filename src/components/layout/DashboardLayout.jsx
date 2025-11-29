import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }) {
  // localStorage'dan sidebar holatini olish (default: true - desktop'da ochiq)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });

  // Sidebar holatini localStorage'ga saqlash
  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

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

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden w-full lg:w-auto">
        <Header 
          sidebarOpen={sidebarOpen}
          onMenuClick={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
