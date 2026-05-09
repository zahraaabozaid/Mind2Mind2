import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark';
type Lang = 'en' | 'ar';


interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
  isDarkMode: boolean;
  isArabic: boolean;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    'nav.browse': 'Browse Skills',
    'nav.exchanges': 'Exchange Requests',
    'nav.howItWorks': 'How It Works',
    'nav.ideas': 'Browse Ideas',
    'nav.postIdea': 'Post an Idea',
    'nav.signIn': 'Sign In',
    'nav.joinFree': 'Join Free',
    'nav.myProfile': 'My Profile',
    'nav.signOut': 'Sign Out',
    'nav.admin': 'Admin',
    'home.hero.cta': 'Start Exchanging',
    'home.trending': 'Trending Ideas',
    'home.blog': 'Tips & Resources',
    'ideas.title': 'Browse Ideas',
    'ideas.search': 'Search ideas…',
    'ideas.filter.category': 'Category',
    'ideas.filter.budget': 'Budget',
    'ideas.postIdea': 'Post an Idea',
    'ideas.save': 'Save',
    'ideas.report': 'Report',
    'ideas.propose': 'Send Proposal',
    'profile.follow': 'Follow',
    'profile.following': 'Following',
    'profile.followers': 'followers',
    'profile.portfolio': 'Portfolio',
    'profile.reviews': 'Reviews',
    'admin.login': 'Admin Login',
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Manage Users',
    'admin.ideas': 'Manage Ideas',
    'admin.tickets': 'Support Tickets',
    'admin.categories': 'Categories',
    'admin.announcements': 'Announcements',
    'admin.fraud': 'Fraud Alerts',
    'admin.featured': 'Featured Listings',
    'admin.coupons': 'Coupon Manager',
    'admin.moderation': 'Content Moderation',
    'admin.overview': 'Overview',
    'admin.totalUsers': 'Total Users',
    'admin.ideasPosted': 'Ideas Posted',
    'admin.totalExchanges': 'Total Exchanges',
    'admin.avgRating': 'Avg. Rating',
    'admin.highlights': 'Platform Highlights',
    'admin.realUsers': 'Real Users',
    'admin.activeIdeas': 'Active Ideas',
    'admin.verifiedUsers': 'Verified Users',
    'admin.manageUsers': 'Manage Users',
    'admin.user': 'User',
    'admin.userID': 'User ID',
    'admin.joined': 'Joined',
    'admin.status': 'Status',
    'admin.actions': 'Actions',
    'admin.ban': 'Ban',
    'admin.unban': 'Unban',
    'admin.verify': 'Verify',
    'admin.delete': 'Delete',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.flag': 'Flag',
    'admin.remove': 'Remove',
    'admin.sendToAll': 'Send to All Users',
    'admin.logout': 'Logout',
    'admin.panel': 'Admin Panel',
    'home.hero.title': 'Exchange Skills, Build the Future',
    'home.hero.subtitle': 'Join the largest community of experts exchanging knowledge and collaborating on innovative ideas.',
    'home.howItWorks.title': 'How It Works',
    'home.categories.title': 'Explore Categories',
    'home.experts.title': 'Recommended Experts',
    'home.cta.title': 'Ready to start exchanging?',
    'home.cta.subtitle': 'Join thousands of experts who are already growing their skills through exchange.',
    'home.stats.users': 'Verified Experts',
    'home.stats.categories': 'Skill Categories',
    'home.stats.exchanges': 'Knowledge Exchanges',
    'home.stats.regions': 'Global Regions',
    'home.cta.joinCount': 'Join 52,000+ knowledge traders',
    'home.cta.benefit1': 'Video-verified expert profiles',
    'home.cta.benefit2': 'No fees — pure knowledge exchange',
    'home.cta.benefit3': 'Match with 52,000+ global experts',
    'home.cta.benefit4': 'Rate & review system for trust',
    'home.cta.start': 'Start Trading Knowledge',
    'home.cta.learnMore': 'Learn More',
    'home.how.badge': 'Simple Process',
    'home.how.title': 'How Mind2Mind Works',
    'home.how.subtitle': 'From profile creation to mutual growth — a transparent, trust-first exchange process.',
    'home.how.step1.title': 'Create Your Expert Profile',
    'home.how.step1.desc': 'List the skills you can teach with depth and genuine experience. Also share the skills you\'re eager to learn.',
    'home.how.step2.title': 'Record a Knowledge Demo',
    'home.how.step2.desc': 'Film a short demo proving your teaching style. This video-verification builds trust before any exchange happens.',
    'home.how.step3.title': 'Find Your Perfect Match',
    'home.how.step3.desc': 'Browse profiles where someone teaches what you want to learn — and wants to learn what you teach.',
    'home.how.step4.title': 'Exchange & Both Grow',
    'home.how.step4.desc': 'Connect, schedule sessions, and exchange expertise. Rate each other to maintain platform quality.',
    'home.hero.badge': '100% Free · No Money. Just Knowledge.',
    'home.hero.watchDemos': 'Watch Demos',
    'home.hero.verified': 'Video-verified experts',
    'home.hero.verifiedShort': 'Verified experts',
    'home.hero.noCard': 'No credit card needed',
    'home.hero.joinToday': 'Join free today',
    'home.hero.activeExchanges': 'Active Exchanges Right Now',
    'home.hero.growth': '↑ 12% from last week',
    'home.hero.teaches': 'Teaches',
    'home.hero.learns': 'Learns',
    'home.hero.connecting': 'Connecting experts...',
    'home.hero.skillsShared': 'skills shared',
    'home.hero.across': 'across',
    'home.hero.regions': 'regions',
  },
  ar: {
    'nav.browse': 'استعرض المهارات',
    'nav.exchanges': 'طلبات التبادل',
    'nav.howItWorks': 'كيف يعمل',
    'nav.ideas': 'استعرض الأفكار',
    'nav.postIdea': 'انشر فكرة',
    'nav.signIn': 'تسجيل الدخول',
    'nav.joinFree': 'انضم مجاناً',
    'nav.myProfile': 'ملفي الشخصي',
    'nav.signOut': 'تسجيل الخروج',
    'nav.admin': 'الإدارة',
    'home.hero.cta': 'ابدأ التبادل',
    'home.trending': 'الأفكار الرائجة',
    'home.blog': 'نصائح وموارد',
    'ideas.title': 'استعرض الأفكار',
    'ideas.search': 'ابحث عن الأفكار…',
    'ideas.filter.category': 'الفئة',
    'ideas.filter.budget': 'الميزانية',
    'ideas.postIdea': 'انشر فكرة',
    'ideas.save': 'حفظ',
    'ideas.report': 'إبلاغ',
    'ideas.propose': 'أرسل عرضاً',
    'profile.follow': 'متابعة',
    'profile.following': 'تتابع',
    'profile.followers': 'متابع',
    'profile.portfolio': 'الأعمال',
    'profile.reviews': 'التقييمات',
    'admin.login': 'تسجيل دخول المدير',
    'admin.dashboard': 'لوحة التحكم',
    'admin.users': 'إدارة المستخدمين',
    'admin.ideas': 'إدارة الأفكار',
    'admin.tickets': 'تذاكر الدعم',
    'admin.categories': 'الفئات',
    'admin.announcements': 'الإعلانات',
    'admin.fraud': 'تنبيهات الاحتيال',
    'admin.featured': 'القوائم المميزة',
    'admin.coupons': 'إدارة الكوبونات',
    'admin.moderation': 'إشراف المحتوى',
    'admin.overview': 'نظرة عامة',
    'admin.totalUsers': 'إجمالي المستخدمين',
    'admin.ideasPosted': 'الأفكار المنشورة',
    'admin.totalExchanges': 'إجمالي التبادلات',
    'admin.avgRating': 'متوسط التقييم',
    'admin.highlights': 'أبرز أحداث المنصة',
    'admin.realUsers': 'المستخدمون الحقيقيون',
    'admin.activeIdeas': 'الأفكار النشطة',
    'admin.verifiedUsers': 'المستخدمون الموثقون',
    'admin.manageUsers': 'إدارة المستخدمين',
    'admin.user': 'المستخدم',
    'admin.userID': 'معرف المستخدم',
    'admin.joined': 'تاريخ الانضمام',
    'admin.status': 'الحالة',
    'admin.actions': 'الإجراءات',
    'admin.ban': 'حظر',
    'admin.unban': 'إلغاء الحظر',
    'admin.verify': 'توثيق',
    'admin.delete': 'حذف',
    'admin.approve': 'موافقة',
    'admin.reject': 'رفض',
    'admin.flag': 'تعليم بعلامة',
    'admin.remove': 'إزالة',
    'admin.sendToAll': 'إرسال للجميع',
    'admin.logout': 'تسجيل الخروج',
    'admin.panel': 'لوحة الإدارة',
    'home.hero.title': 'تبادل المهارات، ابنِ المستقبل',
    'home.hero.subtitle': 'انضم إلى أكبر مجتمع من الخبراء الذين يتبادللون المعرفة ويتعاونون في أفكار مبتكرة.',
    'home.howItWorks.title': 'كيف يعمل',
    'home.categories.title': 'استكشف الفئات',
    'home.experts.title': 'خبراء مقترحون',
    'home.cta.title': 'هل أنت مستعد لبدء التبادل؟',
    'home.cta.subtitle': 'انضم إلى آلاف الخبراء الذين ينمون مهاراتهم بالفعل من خلال التبادل.',
    'home.stats.users': 'خبير موثق',
    'home.stats.categories': 'فئة مهارات',
    'home.stats.exchanges': 'تبادل معرفي',
    'home.stats.regions': 'منطقة عالمية',
    'home.cta.joinCount': 'انضم إلى 52,000+ من متبادلي المعرفة',
    'home.cta.benefit1': 'ملفات خبراء موثقة بالفيديو',
    'home.cta.benefit2': 'بدون رسوم — تبادل معرفي بحت',
    'home.cta.benefit3': 'طابق مع 52,000+ خبير عالمي',
    'home.cta.benefit4': 'نظام تقييم ومراجعة للثقة',
    'home.cta.start': 'ابدأ تبادل المعرفة',
    'home.cta.learnMore': 'تعرف على المزيد',
    'home.how.badge': 'عملية بسيطة',
    'home.how.title': 'كيف يعمل Mind2Mind',
    'home.how.subtitle': 'من إنشاء الملف الشخصي إلى النمو المتبادل — عملية تبادل شفافة تعتمد على الثقة أولاً.',
    'home.how.step1.title': 'أنشئ ملفك الشخصي كخبير',
    'home.how.step1.desc': 'أدرج المهارات التي يمكنك تعليمها بعمق وخبرة حقيقية. شارك أيضاً المهارات التي تتوق لتعلمها.',
    'home.how.step2.title': 'سجل عرضاً معرفياً',
    'home.how.step2.desc': 'صور عرضاً قصيراً يثبت أسلوبك في التدريس. هذا التوثيق بالفيديو يبني الثقة قبل حدوث أي تبادل.',
    'home.how.step3.title': 'ابحث عن تطابقك المثالي',
    'home.how.step3.desc': 'تصفح الملفات الشخصية حيث يعلّم شخص ما تريد تعلمه — ويريد تعلم ما تعلمه.',
    'home.how.step4.title': 'تبادل وانموا معاً',
    'home.how.step4.desc': 'تواصل، حدد المواعيد، وتبادل الخبرات. قيموا بعضكم البعض للحفاظ على جودة المنصة.',
    'home.hero.badge': 'مجاني 100% · لا مال. فقط معرفة.',
    'home.hero.watchDemos': 'شاهد العروض',
    'home.hero.verified': 'خبراء موثقون بالفيديو',
    'home.hero.verifiedShort': 'خبراء موثقون',
    'home.hero.noCard': 'لا حاجة لبطاقة ائتمان',
    'home.hero.joinToday': 'انضم مجاناً اليوم',
    'home.hero.activeExchanges': 'تبادلات نشطة الآن',
    'home.hero.growth': '↑ 12% منذ الأسبوع الماضي',
    'home.hero.teaches': 'يعلّم',
    'home.hero.learns': 'يتعلم',
    'home.hero.connecting': 'جاري توصيل الخبراء...',
    'home.hero.skillsShared': 'مهارة تمت مشاركتها',
    'home.hero.across': 'عبر',
    'home.hero.regions': 'منطقة',
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key,
  isDarkMode: false,
  isArabic: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('m2m-theme') as Theme) || 'light';
  });

  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('m2m-lang') as Lang) || 'en';
  });

  // Sync with backend on mount and auth change
  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('theme_preference, language_preference, navbar_color')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (data) {
          if (data.theme_preference && (data.theme_preference === 'light' || data.theme_preference === 'dark')) {
            setTheme(data.theme_preference as Theme);
          }
          if (data.language_preference && (data.language_preference === 'en' || data.language_preference === 'ar')) {
            setLang(data.language_preference as Lang);
          }
        }
      }
    };

    fetchPreferences();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchPreferences();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#e2e8f0';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#1e293b';
    }
    localStorage.setItem('m2m-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    if (lang === 'ar') {
      document.body.style.fontFamily = "'Segoe UI', 'Helvetica Neue', sans-serif, 'Arial', 'Droid Arabic Kufi'";
    } else {
      document.body.style.fontFamily = "'Segoe UI', 'Helvetica Neue', sans-serif";
    }
    localStorage.setItem('m2m-lang', lang);
  }, [lang]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: session.user.id, 
          theme_preference: newTheme 
        }, { onConflict: 'user_id' });
    }
    
    // Apply theme globally to all pages
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const toggleLang = async () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: session.user.id, 
          language_preference: newLang 
        }, { onConflict: 'user_id' });
    }
    
    // Apply language globally to all pages
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    if (newLang === 'ar') {
      document.body.style.fontFamily = "'Segoe UI', 'Helvetica Neue', sans-serif, 'Arial', 'Droid Arabic Kufi'";
    } else {
      document.body.style.fontFamily = "'Segoe UI', 'Helvetica Neue', sans-serif";
    }
  };

  const t = (key: string): string => {
    const translation = translations[lang][key] ?? translations['en'][key] ?? key;
    // Ensure translations are applied globally
    return translation;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t, isDarkMode: theme === 'dark', isArabic: lang === 'ar' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

