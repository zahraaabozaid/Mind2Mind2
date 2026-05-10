import { ExternalLink, Eye, Layers } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { Page } from '../types';

const portfolio = [
  { id: '1', title: 'Fintech Dashboard', description: 'A real-time financial analytics dashboard with live chart updates and risk indicators.', category: 'UI/UX Design', tech: ['Figma', 'React', 'Chart.js'], image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=260&fit=crop', color: 'teal' as const },
  { id: '2', title: 'E-Commerce Mobile App', description: 'Complete shopping experience app design with AR try-on feature for fashion retail.', category: 'Mobile Design', tech: ['Figma', 'Protopie', 'Adobe XD'], image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=260&fit=crop', color: 'blue' as const },
  { id: '3', title: 'AI Writing Assistant', description: 'Browser extension UI for AI content generation with multi-tone selector and history.', category: 'Web App', tech: ['React', 'TailwindCSS', 'OpenAI'], image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=260&fit=crop', color: 'amber' as const },
  { id: '4', title: 'Healthcare Portal', description: 'Patient management system with appointment booking and telemedicine integration.', category: 'Healthcare', tech: ['Next.js', 'TypeScript', 'Supabase'], image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=260&fit=crop', color: 'green' as const },
  { id: '5', title: 'Social Learning Platform', description: 'Community-driven course platform with live sessions, progress tracking, and certificates.', category: 'Education', tech: ['Vue.js', 'Node.js', 'MongoDB'], image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=260&fit=crop', color: 'rose' as const },
  { id: '6', title: 'Smart Home Control App', description: 'Voice-enabled IoT control hub with energy usage analytics and automation rules.', category: 'IoT', tech: ['React Native', 'MQTT', 'Python'], image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=260&fit=crop', color: 'cyan' as const },
];

interface Props {
  onNavigate: (page: Page) => void;
}

export default function PortfolioPage({ onNavigate }: Props) {
  useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-12 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-4">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-teal-300 text-sm font-medium">Public Portfolio</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sara Rahman's Portfolio</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Full-stack designer and developer specializing in SaaS products and mobile apps.</p>
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </button>
            <button className="inline-flex items-center gap-2 border border-white/20 text-white/80 hover:bg-white/10 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              <ExternalLink className="w-4 h-4" />
              Full Portfolio Site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Work Samples</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{portfolio.length} projects</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                  <button className="p-2 bg-white rounded-lg text-slate-800 hover:bg-teal-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                  <Badge color={item.color} size="sm">{item.category}</Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tech.map(t => (
                    <span key={t} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
