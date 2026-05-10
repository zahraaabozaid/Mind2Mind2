import { Home, Compass, ArrowLeftRight, MessageCircle, User } from 'lucide-react';
import { Page } from '../../types';

interface MobileBottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  hasUnreadMessages?: boolean;
}

export default function MobileBottomNav({
  currentPage,
  onNavigate,
  hasUnreadMessages = false,
}: MobileBottomNavProps) {
  const navItems = [
    { label: 'Home', page: 'home' as Page, icon: Home },
    { label: 'Explore', page: 'browse' as Page, icon: Compass },
    { label: 'Exchanges', page: 'exchanges' as Page, icon: ArrowLeftRight },
    { label: 'Messages', page: 'messages' as Page, icon: MessageCircle, badge: hasUnreadMessages },
    { label: 'Profile', page: 'profile' as Page, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className="flex flex-col items-center justify-center w-16 h-16 relative transition-colors"
            >
              <div
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-teal-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
