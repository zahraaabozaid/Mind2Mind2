import { useState, useEffect } from 'react';
import { Play, Search, Lock, FileText, FileVideo, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAccessibleDemos } from '../lib/demo-helpers';
import { KnowledgeDemo, Page } from '../types';
import Button from '../components/ui/Button';
import DemoUploadModal from '../components/profile/DemoUploadModal';

interface Props {
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export default function DemosLibraryPage({ onOpenAuth }: Props) {
  const { user } = useAuth();
  const [demos, setDemos] = useState<KnowledgeDemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'my'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadDemos = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchAccessibleDemos(user.id);
      console.log("Fetched Demos:", data);
      
      if (data.length === 0) {
        console.warn("No demos returned from Supabase. Check RLS policies or if data exists.");
      }
      
      setDemos(data);
    } catch (error) {
      console.error('Error loading demos library:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemos();
  }, [user]);

  const filteredDemos = demos.filter(demo => {
    const matchesSearch = demo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          demo.skill_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'my') return matchesSearch && demo.user_id === user?.id;
    return matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-8">Please sign in to access the Demos Library and view shared knowledge.</p>
          <Button onClick={() => onOpenAuth('signin')} className="w-full">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Knowledge Demos</h1>
            <p className="text-slate-600">Explore skills through video tutorials and guides shared by experts.</p>
          </div>
          <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Upload Demo
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'my'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300'
                }`}
              >
                {filter === 'all' ? 'Discovery' : 'My Demos'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-64 shadow-sm" />
            ))}
          </div>
        ) : filteredDemos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDemos.map(demo => (
              <div
                key={demo.id}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  {demo.file_type === 'video' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileVideo className="w-12 h-12 text-white/20" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-teal-50">
                      <FileText className="w-12 h-12 text-teal-200" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {demo.visibility === 'custom' && (
                      <div className="bg-amber-500/90 backdrop-blur-sm text-white p-1.5 rounded-lg shadow-lg">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-sm text-teal-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm uppercase">
                      {demo.file_type}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {demo.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {demo.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {demo.skill_name?.charAt(0) || 'D'}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{demo.skill_name}</span>
                    </div>
                    <a
                      href={demo.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 font-medium text-xs flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Resource
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Demos Found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
      {showUploadModal && (
        <DemoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={async () => {
            console.log("Upload Status: success");
            setShowUploadModal(false);
            await loadDemos();
          }}
        />
      )}
    </div>
  );
}
