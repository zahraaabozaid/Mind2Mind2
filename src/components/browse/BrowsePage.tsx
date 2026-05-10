import { useState, useEffect } from 'react';
import { SlidersHorizontal, Video, X, UserCog, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile, Page } from '../../types';
import ExpertCard from './ExpertCard';
import ExchangeModal from '../exchange/ExchangeModal';
import ProfileEditModal from '../profile/ProfileEditModal';
import DemoUploadModal from '../profile/DemoUploadModal';
import { useAuth } from '../../context/AuthContext';
import SmartSearchBar from '../search/SmartSearchBar';

interface Props {
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}


export default function BrowsePage({ onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const [experts, setExperts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exchangeTarget, setExchangeTarget] = useState<Profile | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showDemoUpload, setShowDemoUpload] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Categories
        const { data: catData } = await supabase.from('skill_categories').select('name').order('name');
        if (catData) {
          setCategories(['All', ...catData.map(c => c.name)]);
        }

        // Fetch Experts
        const query = supabase
          .from('profiles')
          .select('*')
          .eq('is_demo', false) // Exclude demo profiles
          .neq('username', 'mohamedhosamm81') // Exclude admin
          .order('exchange_count', { ascending: false });

        const { data, error } = await query;
        
        if (error) throw error;
        
        // Only use real data from database
        setExperts(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayExperts = experts.filter(e => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      e.display_name.toLowerCase().includes(q) ||
      e.teaching_skills.some(s => s.toLowerCase().includes(q)) ||
      e.learning_skills.some(s => s.toLowerCase().includes(q)) ||
      e.location.toLowerCase().includes(q);
    
    // Filter by category using the profile's category field
    const matchesCategory = activeCategory === 'All' || 
                           e.category === activeCategory ||
                           e.teaching_skills.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
    
    const matchesVerified = !verifiedOnly || e.video_verified;
    const matchesAvailable = !availableOnly || e.is_available;
    
    return matchesSearch && matchesCategory && matchesVerified && matchesAvailable;
  });

  const handleRequestExchange = async (expert: Profile) => {
    // Debug: Log current auth state
    console.log('🔍 Exchange button clicked');
    console.log('📊 Current user from context:', user);
    
    // First check: Context user
    if (!user) {
      console.log('❌ No user in context, checking session...');
      
      // Second check: Verify session directly from Supabase
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📊 Session check result:', { session: !!session, error });
        
        if (error) {
          console.error('❌ Session check error:', error);
          onOpenAuth('signup');
          return;
        }
        
        if (!session) {
          console.log('❌ No active session, redirecting to auth');
          onOpenAuth('signup');
          return;
        }
        
        // Session exists but context not updated yet
        console.log('✅ Session exists! Opening exchange modal...');
        setExchangeTarget(expert);
      } catch (err) {
        console.error('❌ Error checking session:', err);
        onOpenAuth('signup');
      }
      return;
    }
    
    // User is logged in
    console.log('✅ User is logged in, opening exchange modal');
    setExchangeTarget(expert);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 md:pb-0">
      <div className="bg-gradient-to-br from-slate-900 to-teal-900 py-12 md:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 text-center">Browse Experts</h1>
          <p className="text-slate-300 text-sm md:text-base lg:text-lg mb-6 md:mb-8 text-center">Find someone who teaches what you want — and wants what you teach.</p>
          <div className="max-w-2xl mx-auto">
            <SmartSearchBar
              onSearch={(filters) => {
                setSearch(filters.query);
              }}
              placeholder="Search skills, names, or locations..."
              showAdvanced={false}
            />
          </div>
          {user && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium text-white transition-all"
              >
                <UserCog className="w-4 h-4" />
                Create / Edit My Profile
              </button>
              <button
                onClick={() => setShowDemoUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-500/80 hover:bg-teal-500 border border-teal-400/30 rounded-xl text-sm font-medium text-white transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Demo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex-shrink-0 ${
              showFilters ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 flex flex-wrap gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-10 h-5 rounded-full transition-colors relative ${verifiedOnly ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-teal-500" />
                Video Verified Only
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-10 h-5 rounded-full transition-colors relative ${availableOnly ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-700 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Available Now
              </span>
            </label>
            {(verifiedOnly || availableOnly || activeCategory !== 'All' || search) && (
              <button
                onClick={() => { setVerifiedOnly(false); setAvailableOnly(false); setActiveCategory('All'); setSearch(''); }}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 ml-auto"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="text-sm text-slate-500 mb-6">
          {loading ? (
            <span>Loading experts...</span>
          ) : (
            <>Showing <strong className="text-slate-700">{displayExperts.length}</strong> experts</>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayExperts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-slate-400 text-lg mb-2">No experts match your search.</div>
            <div className="text-slate-400 text-sm">Try different keywords or remove filters.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayExperts.map(expert => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                onNavigate={onNavigate}
                onRequestExchange={handleRequestExchange}
              />
            ))}
          </div>
        )}
      </div>

      {exchangeTarget && (
        <ExchangeModal
          expert={exchangeTarget}
          onClose={() => setExchangeTarget(null)}
        />
      )}

      {showProfileEdit && (
        <ProfileEditModal
          onClose={() => setShowProfileEdit(false)}
          onSaved={() => {
            // Refresh experts list
            supabase.from('profiles')
              .select('*')
              .eq('is_demo', false)
              .neq('username', 'mohamedhosamm81')
              .order('exchange_count', { ascending: false })
              .then(({ data }) => {
                if (data) setExperts(data as Profile[]);
              });
          }}
        />
      )}

      {showDemoUpload && (
        <DemoUploadModal
          onClose={() => setShowDemoUpload(false)}
          onUploaded={() => {}}
        />
      )}
    </div>
  );
}
