import { Users, BookOpen, Globe, Repeat } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const stats = [
  { icon: Users, value: '52K+', label: 'home.stats.users', color: 'text-cyan-600' },
  { icon: BookOpen, value: '240+', label: 'home.stats.categories', color: 'text-blue-600' },
  { icon: Repeat, value: '18K+', label: 'home.stats.exchanges', color: 'text-amber-600' },
  { icon: Globe, value: '180+', label: 'home.stats.regions', color: 'text-emerald-600' },
];

export default function StatsBar() {
  const { t } = useTheme();
  return (
    <section className="bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white shadow-sm mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{t(stat.label)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
