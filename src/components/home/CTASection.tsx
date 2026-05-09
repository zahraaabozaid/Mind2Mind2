import { ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Page } from '../../types';

interface Props {
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: 'signup') => void;
}

const benefits = [
  'home.cta.benefit1',
  'home.cta.benefit2',
  'home.cta.benefit3',
  'home.cta.benefit4',
];

export default function CTASection({ onNavigate, onOpenAuth }: Props) {
  const { t } = useTheme();
  const { user } = useAuth();
  
  // Handle Start Trading Knowledge button click
  const handleStartTrading = () => {
    console.log('🔍 Start Trading Knowledge clicked');
    console.log('📊 User logged in:', !!user);
    
    if (user) {
      // User is logged in - navigate to Browse page
      console.log('✅ User logged in, navigating to Browse page');
      onNavigate('browse');
    } else {
      // User not logged in - show signup modal
      console.log('❌ User not logged in, showing signup modal');
      onOpenAuth('signup');
    }
  };
  
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.15)_0%,_transparent_70%)]" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-8">
          <span className="text-teal-300 text-sm font-medium">{t('home.cta.joinCount')}</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
          {t('home.cta.title')}
        </h2>

        <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('home.cta.subtitle')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-4">
              <CheckCircle className="w-5 h-5 text-teal-400" />
              <span className="text-white/80 text-xs text-center leading-snug">{t(benefit)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleStartTrading} className="group">
            {user ? t('nav.browse') : t('home.cta.start')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
          </Button>
          <button 
            onClick={() => onNavigate('browse')}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium text-white/90 border border-white/20 hover:bg-white/10 transition-all duration-200"
          >
            {t('home.cta.learnMore')}
          </button>
        </div>
      </div>
    </section>
  );
}
