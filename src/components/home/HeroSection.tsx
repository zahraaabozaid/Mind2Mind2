import { useState, useEffect } from 'react';
import { ArrowRight, Play, Shield, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Page } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { generateArabAvatarUrl } from '../../lib/arab-data';

interface HeroProps {
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: 'signup') => void;
}

export default function HeroSection({ onNavigate, onOpenAuth }: HeroProps) {
  const { user } = useAuth();
  const { t, lang } = useTheme();
  const [exchangeCount, setExchangeCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [activeExperts, setActiveExperts] = useState<{ name: string; teaching: string; learning: string; avatar: string; verified: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total exchanges count
        const { count } = await supabase
          .from('exchange_requests')
          .select('*', { count: 'exact', head: true });
        
        if (count) setExchangeCount(count);

        // Fetch all profiles to calculate skills and countries
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('teaching_skills, location');
        
        if (allProfiles) {
          const uniqueSkills = new Set<string>();
          const uniqueCountries = new Set<string>();
          
          allProfiles.forEach(p => {
            if (p.teaching_skills) p.teaching_skills.forEach((s: string) => uniqueSkills.add(s.toLowerCase()));
            if (p.location) uniqueCountries.add(p.location.split(',').pop()?.trim() || p.location);
          });
          
          setSkillCount(uniqueSkills.size);
          setCountryCount(uniqueCountries.size);
        }

        // Fetch recent active experts
        const { data: experts } = await supabase
          .from('profiles')
          .select('display_name, teaching_skills, learning_skills, avatar_url, video_verified')
          .eq('is_demo', false)
          .neq('username', 'mohamedhosamm81')
          .limit(3);
        
        if (experts && experts.length > 0) {
          setActiveExperts(experts.map(e => ({
            name: e.display_name,
            teaching: e.teaching_skills[0] || 'Skill',
            learning: e.learning_skills[0] || 'Knowledge',
            avatar: e.avatar_url || generateArabAvatarUrl(e.display_name),
            verified: e.video_verified
          })));
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleStartExchanging = () => {
    if (user) {
      onNavigate('browse');
    } else {
      onOpenAuth('signup');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(6,182,212,0.1)_0%,_transparent_60%)]" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-teal-300 text-sm font-medium">{t('home.hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              {lang === 'ar' ? (
                <>
                  بادل مهاراتك.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    ابنِ مستقبلك.
                  </span>
                  <br />
                  تعلّم ما تحتاجه.
                </>
              ) : (
                <>
                  Trade What
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    You Know.
                  </span>
                  <br />
                  Learn What
                  <br />
                  You Need.
                </>
              )}
            </h1>

            <p className="text-slate-300 text-base md:text-lg lg:text-xl leading-relaxed mb-10 max-w-lg">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-10">
              <Button size="lg" onClick={handleStartExchanging} className="group w-full sm:w-auto">
                {user ? t('nav.browse') : t('nav.joinFree')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </Button>
              <button
                onClick={() => onNavigate('demos-library')}
                className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-medium text-white/90 border border-white/20 hover:bg-white/10 transition-all duration-200 w-full sm:w-auto"
              >
                <Play className="w-4 h-4" />
                {t('home.hero.watchDemos')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">{t('home.hero.verified')}</span>
                <span className="sm:hidden">{t('home.hero.verifiedShort')}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
              <div className="hidden sm:block">{t('home.hero.noCard')}</div>
              <div className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
              <div>{t('home.hero.joinToday')}</div>
            </div>
          </div>

          <div className="hidden lg:block relative mt-8 lg:mt-0">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-full h-full bg-teal-500/5 rounded-3xl border border-teal-500/10" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-slate-400 text-xs md:text-sm mb-1">{t('home.hero.activeExchanges')}</div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {loading ? '...' : exchangeCount.toLocaleString()}
                  </div>
                  <div className="text-teal-400 text-xs md:text-sm mt-1">{t('home.hero.growth')}</div>
                </div>

                {activeExperts.length > 0 ? (
                  activeExperts.map((card, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={card.avatar} alt={card.name} className="w-12 h-12 rounded-xl object-cover" loading="lazy" />
                        {card.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{card.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-teal-400 text-xs bg-teal-500/10 px-2 py-0.5 rounded-full">{t('home.hero.teaches')} {card.teaching}</span>
                          <span className="text-slate-500 text-xs">→</span>
                          <span className="text-amber-400 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">{t('home.hero.learns')} {card.learning}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    {t('home.hero.connecting')}
                  </div>
                )}

                <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 text-center">
                  <div className="text-teal-300 text-sm font-medium">{loading ? '...' : skillCount}+ {t('home.hero.skillsShared')}</div>
                  <div className="text-slate-400 text-xs mt-1">{t('home.hero.across')} {loading ? '...' : countryCount}+ {t('home.hero.regions')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
          <path d="M0,80 C360,20 720,60 1080,20 C1260,0 1380,40 1440,40 L1440,80 Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}
