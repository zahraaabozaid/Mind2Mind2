import { useEffect, useState } from 'react';
import { Play, ArrowRight, FileVideo, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { KnowledgeDemo, Page } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { generateArabAvatarUrl } from '../../lib/arab-data';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function FeaturedDemos({ onNavigate }: Props) {
  const { t } = useTheme();
  const [demos, setDemos] = useState<KnowledgeDemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingDemo, setProcessingDemo] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const { data, error } = await supabase
          .from('demos')
          .select('*, profile:profiles(display_name, avatar_url, video_verified)')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setDemos((data || []) as KnowledgeDemo[]);
      } catch (error) {
        console.error('Error fetching featured demos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDemos();
  }, []);

  const displayDemos = demos.length > 0 ? demos : [];

  const handleDemoClick = async (demo: KnowledgeDemo) => {
    if (processingDemo) return;
    
    setProcessingDemo(demo.id);
    
    try {
      // Simulate processing (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Show success message or navigate
      alert(`Demo "${demo.title}" processed successfully! This would open the demo viewer or upload interface.`);
      
      // In a real implementation, you would:
      // 1. If video: Open video player modal
      // 2. If PDF: Open PDF viewer
      // 3. If upload: Show file picker and upload to storage
      
    } catch (error) {
      console.error('Error processing demo:', error);
      alert('Failed to process demo. Please try again.');
    } finally {
      setProcessingDemo(null);
    }
  };

  if (loading) return null;
  if (displayDemos.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 border border-teal-100 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              {t('profile.portfolio')}
            </div>
            <h2 className="text-4xl font-bold text-slate-900">
              {t('home.hero.title').split(',')[0]}
            </h2>
            <p className="text-slate-500 text-lg mt-2">{t('home.hero.subtitle')}</p>
          </div>
          <button
            onClick={() => onNavigate('demos-library')}
            className="hidden md:flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
          >
            See All Demos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDemos.map((demo) => (
            <div
              key={demo.id}
              className={`group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer relative ${
                processingDemo === demo.id ? 'opacity-75' : ''
              }`}
              onClick={() => handleDemoClick(demo)}
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                {demo.file_type === 'video' ? (
                  <>
                    <FileVideo className="w-12 h-12 text-white/10" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-teal-600 ml-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-teal-50 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-teal-200" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase shadow-sm">
                    {demo.file_type}
                  </span>
                </div>
              </div>

              {/* Loading Overlay */}
              {processingDemo === demo.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="bg-white rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span className="text-sm font-medium text-slate-700">Processing...</span>
                  </div>
                </div>
              )}

              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {demo.title}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={demo.profile?.avatar_url || generateArabAvatarUrl(demo.profile?.display_name || 'Expert')}
                      alt={demo.profile?.display_name || 'Expert'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-600 font-medium">{demo.profile?.display_name || 'Expert'}</span>
                      {demo.profile?.video_verified && (
                        <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                          <span className="text-white text-[8px]">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {demo.skill_name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
