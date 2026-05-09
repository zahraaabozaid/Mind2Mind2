import { useState, useEffect } from 'react';
import { Code, Palette, Briefcase, Globe, Music, Dumbbell, ChefHat, Paintbrush, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Page } from '../../types';

const categoryIcons = {
  Technology: Code,
  Design: Palette,
  Business: Briefcase,
  Language: Globe,
  Music: Music,
  Fitness: Dumbbell,
  Cooking: ChefHat,
  Arts: Paintbrush,
};

const categoryColors = {
  Technology: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
  Design: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100',
  Business: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100',
  Language: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100',
  Music: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100',
  Fitness: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
  Cooking: 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100',
  Arts: 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100',
};

interface Props {
  onNavigate: (page: Page) => void;
}

export default function SkillCategories({ onNavigate }: Props) {
  const { t } = useTheme();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('category')
          .eq('is_demo', false);

        if (error) throw error;

        // Count profiles per category
        const counts: Record<string, number> = {};
        data?.forEach(profile => {
          if (profile.category) {
            counts[profile.category] = (counts[profile.category] || 0) + 1;
          }
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const categories = Object.keys(categoryIcons).map(name => ({
    name,
    icon: categoryIcons[name as keyof typeof categoryIcons],
    count: categoryCounts[name] || 0,
    color: categoryColors[name as keyof typeof categoryColors],
  }));

  const totalExperts = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-white text-slate-600 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              {loading ? '...' : `${totalExperts} ${t('admin.users')}`}
            </div>
            <h2 className="text-4xl font-bold text-slate-900">
              {t('home.categories.title')}
            </h2>
            <p className="text-slate-500 text-lg mt-2">{t('home.hero.subtitle')}</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="hidden md:flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
          >
            View All Skills <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => onNavigate('browse')}
              className={`group border rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${cat.color}`}
            >
              <div className="mb-4">
                <cat.icon className="w-7 h-7" />
              </div>
              <div className="font-semibold text-base mb-1">{cat.name}</div>
              <div className="text-sm opacity-70">
                {loading ? '...' : `${cat.count} expert${cat.count !== 1 ? 's' : ''}`}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
