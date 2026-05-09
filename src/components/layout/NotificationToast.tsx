import { useEffect, useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Page } from '../../types';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function NotificationToast({ onNavigate }: Props) {
  const { latestToast, clearToast } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (latestToast) {
      setVisible(true);
    }
  }, [latestToast]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(clearToast, 300);
  };

  const handleClick = () => {
    handleDismiss();
    if (latestToast?.exchange_id) {
      onNavigate('exchanges');
    }
  };

  if (!latestToast) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={handleClick}
      >
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
          <ArrowLeftRight className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 mb-0.5">New Exchange Request</p>
          <p className="text-xs text-slate-600 line-clamp-2">{latestToast.message}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
