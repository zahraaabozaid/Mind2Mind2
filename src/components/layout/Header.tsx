import { useState, useEffect } from 'react';
import { Brain, Menu, X, ChevronDown, Sun, Moon, Globe } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Page, Profile } from '../../types';
import { supabase } from '../../lib/supabase';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export default function Header({ currentPage, onNavigate, onOpenAuth }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, lang, toggleLang, t } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile when user is logged in
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserProfile(data as Profile);
          }
        });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const navLinks = [
    { label: t('nav.browse'), page: 'browse' as Page },
    { label: t('nav.ideas'), page: 'ideas' as Page },
    { label: 'Masterclasses', page: 'masterclasses' as Page },
  ];

  const textColor = scrolled || mobileOpen ? 'text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400' : 'text-white/90 hover:text-white hover:bg-white/10';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${
              scrolled ? 'text-slate-900 dark:text-white' : 'text-white'
            }`}>
              Mind<span className="text-cyan-400">2</span>Mind
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? scrolled ? 'text-cyan-600 bg-teal-50 dark:text-cyan-400 dark:bg-teal-900/30' : 'text-teal-300 bg-white/10'
                    : scrolled ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700' : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`p-2 rounded-xl transition-colors ${textColor}`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${textColor}`}
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {user ? (
              <>
                <NotificationBell scrolled={scrolled} onNavigate={onNavigate} />
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      scrolled ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-800 flex items-center justify-center">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt={userProfile.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-teal-700 dark:text-teal-300 text-xs font-bold">
                          {userProfile?.display_name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span>{userProfile?.display_name || user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50">
                      <button
                        onClick={() => {
                          // Navigate to logged-in user's profile
                          if (userProfile?.id) {
                            onNavigate('profile', userProfile.id);
                          } else {
                            onNavigate('profile');
                          }
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {t('nav.myProfile')}
                      </button>
                      {user.email !== 'mohamedhosamm81@gmail.com' && (
                        <>
                          <button
                            onClick={() => { onNavigate('exchanges'); setProfileMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Exchange Requests
                          </button>
                          <button
                            onClick={() => { onNavigate('messages'); setProfileMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Messages
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => { signOut(); setProfileMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('nav.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    scrolled ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('nav.signIn')}
                </button>
                <Button size="sm" onClick={() => onOpenAuth('signup')}>
                  {t('nav.joinFree')}
                </Button>
              </>
            )}
          </div>

          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-slate-700 dark:text-slate-200' : 'text-white'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => { onNavigate(link.page); setMobileOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {link.label}
            </button>
          ))}
          <div className="flex items-center gap-2 px-4 py-2">
            <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'عربي' : 'English'}
            </button>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                {user.email !== 'mohamedhosamm81@gmail.com' && (
                  <Button variant="outline" onClick={() => { onNavigate('exchanges'); setMobileOpen(false); }}>
                    Exchange Requests
                  </Button>
                )}
                <Button variant="outline" onClick={() => { signOut(); setMobileOpen(false); }}>
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => { onOpenAuth('signin'); setMobileOpen(false); }}>
                  {t('nav.signIn')}
                </Button>
                <Button onClick={() => { onOpenAuth('signup'); setMobileOpen(false); }}>
                  {t('nav.joinFree')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
