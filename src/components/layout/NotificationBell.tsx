import { useState, useRef, useEffect } from 'react';
import { Bell, ArrowLeftRight, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Page } from '../../types';

interface Props {
  scrolled: boolean;
  onNavigate: (page: Page) => void;
}

export default function NotificationBell({ scrolled, onNavigate }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-colors ${
          scrolled
            ? 'text-slate-600 hover:bg-slate-100'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notification => (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                    if (notification.exchange_id) {
                      onNavigate('exchanges');
                    }
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start ${
                    !notification.is_read ? 'bg-teal-50/50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !notification.is_read ? 'bg-teal-100' : 'bg-slate-100'
                  }`}>
                    <ArrowLeftRight className={`w-4 h-4 ${!notification.is_read ? 'text-teal-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notification.is_read ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatTime(notification.created_at)}</p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5">
              <button
                onClick={() => { onNavigate('exchanges'); setOpen(false); }}
                className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-1"
              >
                View All Exchanges
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
