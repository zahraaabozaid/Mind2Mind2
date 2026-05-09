import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { isSupabaseConfigured } from './lib/supabase';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import NotificationToast from './components/layout/NotificationToast';
import HomePage from './pages/HomePage';
import BrowsePage from './components/browse/BrowsePage';
import ProfilePage from './components/profile/ProfilePage';
import MessagesPage from './components/messages/MessagesPage';
import ExchangeRequestsPage from './pages/ExchangeRequestsPage';
import AuthModal from './components/auth/AuthModal';
import IdeasPage from './pages/IdeasPage';
import PostIdeaPage from './pages/PostIdeaPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import PortfolioPage from './pages/PortfolioPage';
import BlogPage from './pages/BlogPage';
import WelcomePage from './pages/WelcomePage';
import DemosLibraryPage from './pages/DemosLibraryPage';
import MasterclassesPage from './pages/MasterclassesPage';
import CreateMasterclassPage from './pages/CreateMasterclassPage';
import MasterclassSuccessPage from './pages/MasterclassSuccessPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import { Page } from './types';
import { useAuth } from './context/AuthContext';
import ChatBot from './components/ChatBot';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({ open: false, mode: 'signup' });

  // Handle redirects based on auth state
  useEffect(() => {
    if (loading) return;

    if (sessionStorage.getItem('m2m-admin-auth') === 'true') {
      setCurrentPage('admin');
    } else if (!user && currentPage !== 'welcome' && currentPage !== 'admin-login' && currentPage !== 'blog') {
      // If user logs out or session expires, go to welcome
      setCurrentPage('welcome');
    } else if (user && currentPage === 'welcome') {
      // If user logs in from welcome, go to home
      setCurrentPage('home');
    }
  }, [user, loading, currentPage]);

  const handleNavigate = (page: Page, id?: string) => {
    setCurrentPage(page);
    if (id) setProfileId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModal({ open: true, mode });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1 pt-16 pb-20 md:pb-0">
        {currentPage === 'welcome' && (
          <WelcomePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'browse' && (
          <BrowsePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'profile' && (
          <ProfilePage
            profileId={profileId}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'messages' && (
          <MessagesPage />
        )}
        {currentPage === 'exchanges' && (
          <ExchangeRequestsPage />
        )}
        {currentPage === 'ideas' && (
          <IdeasPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'post-idea' && (
          <PostIdeaPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'admin-login' && (
          <AdminLoginPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'admin' && (
          <AdminPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'portfolio' && (
          <PortfolioPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'blog' && (
          <BlogPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'demos-library' && (
          <DemosLibraryPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'masterclasses' && (
          <MasterclassesPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'create-masterclass' && (
          <CreateMasterclassPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
        {currentPage === 'masterclass-success' && (
          <MasterclassSuccessPage
            masterclassId={profileId}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'session-summary' && (
          <SessionSummaryPage
            sessionId={profileId}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {(currentPage === 'home') && <Footer onNavigate={handleNavigate} />}

      {currentPage !== 'messages' && (
        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      )}

      <NotificationToast onNavigate={handleNavigate} />

      {/* AI Chatbot — visible on every page */}
      <ChatBot />

      {authModal.open && (
        <AuthModal
          mode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'signup' })}
          onSwitchMode={(mode) => setAuthModal({ open: true, mode })}
        />
      )}
    </div>
  );
}

function ConfigurationWarning() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <h1 className="text-xl font-bold text-yellow-600">Configuration Required</h1>
        </div>
        <p className="text-gray-700 mb-4">
          Supabase environment variables are not configured. Please set the following in your deployment platform:
        </p>
        <ul className="bg-gray-100 p-3 rounded text-sm text-gray-600 mb-4 space-y-2">
          <li><code className="bg-white px-2 py-1 rounded">VITE_SUPABASE_URL</code></li>
          <li><code className="bg-white px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
        </ul>
        <p className="text-xs text-gray-500">
          See .env.example for more details.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationWarning />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
