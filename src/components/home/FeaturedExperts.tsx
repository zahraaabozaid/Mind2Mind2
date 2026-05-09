import { useEffect, useState } from 'react';
import { Star, MapPin, ArrowRight, Video, Repeat } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile, Page } from '../../types';
import Badge from '../ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { generateArabAvatarUrl } from '../../lib/arab-data';

interface Props {
  onNavigate: (page: Page, profileId?: string) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        />
      ))}
      <span className="text-sm font-semibold text-slate-700 ml-1">{rating.toFixed(2)}</span>
    </div>
  );
}

export default function FeaturedExperts({ onNavigate }: Props) {
  const { t } = useTheme();
  const [experts, setExperts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_demo', false) // Only real profiles
          .neq('username', 'mohamedhosamm81') // Exclude admin by username prefix
          .order('rating', { ascending: false })
          .limit(4);

        if (error) throw error;
        setExperts(data || []);
      } catch (error) {
        console.error('Error fetching featured experts:', error);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Don't render section if no experts
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  if (experts.length === 0) {
    return null; // Don't show section if no experts
  }

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white text-slate-600 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              {t('admin.highlights')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t('home.experts.title')}</h2>
            <p className="text-slate-500 text-base md:text-lg mt-2">{t('home.cta.subtitle')}</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="hidden md:flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
          >
            Browse All Experts <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((expert) => (
            <div
              key={expert.id}
              onClick={() => onNavigate('profile', expert.id)}
              className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="relative mb-4">
                <img
                  src={expert.avatar_url || generateArabAvatarUrl(expert.display_name)}
                  alt={expert.display_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                  loading="lazy"
                />
                {expert.video_verified && (
                  <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 bg-teal-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                    <Video className="w-2.5 h-2.5" />
                    Verified
                  </div>
                )}
                {expert.is_available && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                  {expert.display_name}
                </h3>
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  {expert.location}
                </div>
              </div>

              <StarRating rating={expert.rating} />

              <p className="text-slate-500 text-xs leading-relaxed mt-3 mb-4 line-clamp-2">{expert.bio}</p>

              <div className="space-y-2 mb-4">
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">Teaches</div>
                  <div className="flex flex-wrap gap-1">
                    {expert.teaching_skills.slice(0, 2).map((skill, i) => (
                      <Badge key={i} color="teal" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">Wants to Learn</div>
                  <div className="flex flex-wrap gap-1">
                    {expert.learning_skills.slice(0, 2).map((skill, i) => (
                      <Badge key={i} color="amber" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {expert.exchange_count} exchanges
                </div>
                <div>{expert.review_count} reviews</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
