import { useState } from 'react';
import { Search, SlidersHorizontal, Heart, Flag, Flame, Send, X, Lightbulb, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Page } from '../types';
import { useTheme } from '../context/ThemeContext';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  author: string;
  authorAvatar: string;
  date: string;
  trending: boolean;
  saved: boolean;
  tags: string[];
}

const mockIdeas: Idea[] = [
  { id: '1', title: 'AI-Powered Recipe Generator', description: 'A mobile app that generates personalized recipes based on ingredients in your fridge using GPT-4 vision.', category: 'Technology', budget: 2500, author: 'Sara Rahman', authorAvatar: 'https://ui-avatars.com/api/?name=Sara+Rahman&background=0d9488&color=fff', date: '2025-05-01', trending: true, saved: false, tags: ['AI', 'Mobile', 'Food'] },
  { id: '2', title: 'Sustainable Fashion Marketplace', description: 'A peer-to-peer platform for buying and selling second-hand clothes locally with carbon tracking.', category: 'E-Commerce', budget: 5000, author: 'Khaled Ali', authorAvatar: 'https://ui-avatars.com/api/?name=Khaled+Ali&background=7c3aed&color=fff', date: '2025-04-28', trending: true, saved: false, tags: ['Sustainability', 'Marketplace', 'Fashion'] },
  { id: '3', title: 'Arabic Language Learning Game', description: 'Gamified Arabic learning for non-native speakers with spaced repetition and cultural context.', category: 'Education', budget: 3200, author: 'Fatima Hassan', authorAvatar: 'https://ui-avatars.com/api/?name=Fatima+Hassan&background=db2777&color=fff', date: '2025-04-25', trending: false, saved: false, tags: ['Language', 'Gaming', 'Education'] },
  { id: '4', title: 'Smart Home Energy Optimizer', description: 'IoT dashboard that learns usage patterns and automatically reduces home energy bills.', category: 'Technology', budget: 8000, author: 'Ahmed Nasser', authorAvatar: 'https://ui-avatars.com/api/?name=Ahmed+Nasser&background=f59e0b&color=fff', date: '2025-04-20', trending: false, saved: false, tags: ['IoT', 'Energy', 'Smart Home'] },
  { id: '5', title: 'Freelancer Health Insurance Pool', description: 'Cooperative health insurance platform for freelancers and gig workers to get affordable coverage.', category: 'FinTech', budget: 15000, author: 'Leila Mansour', authorAvatar: 'https://ui-avatars.com/api/?name=Leila+Mansour&background=0891b2&color=fff', date: '2025-04-15', trending: true, saved: false, tags: ['Insurance', 'FinTech', 'Freelance'] },
  { id: '6', title: 'Virtual Co-Working Accountability App', description: 'Video-based accountability partner matching for remote workers who need structured focus sessions.', category: 'Productivity', budget: 1800, author: 'Omar Zaki', authorAvatar: 'https://ui-avatars.com/api/?name=Omar+Zaki&background=16a34a&color=fff', date: '2025-04-10', trending: false, saved: false, tags: ['Productivity', 'Remote Work', 'Accountability'] },
];

const categories = ['All', 'Technology', 'Education', 'E-Commerce', 'FinTech', 'Productivity', 'Health'];
const budgetRanges = ['Any Budget', 'Under $1K', '$1K–$5K', '$5K–$15K', '$15K+'];

interface Props {
  onNavigate: (page: Page, id?: string) => void;
}

// ─── Proposal Modal ───────────────────────────────────────────────────────────
function ProposalModal({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-900 to-teal-900 px-6 pt-6 pb-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Send Proposal</h2>
              <p className="text-slate-400 text-sm">{idea.title}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-7 h-7 text-teal-600" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">Proposal Sent!</p>
              <p className="text-sm text-slate-500 mt-1">The idea owner will review your proposal shortly.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your Proposal</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe how you'd approach this project, your relevant skills, and expected timeline…"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>
              <Button className="w-full" onClick={handleSend}>
                <Send className="w-4 h-4" />
                Submit Proposal
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const reasons = ['Spam', 'Inappropriate Content', 'Duplicate Idea', 'Copyright Violation', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Flag className="w-5 h-5 text-rose-500" />
          Report "{idea.title}"
        </h3>
        {submitted ? (
          <p className="text-sm text-teal-600 text-center py-4">Thank you. We'll review this idea.</p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {reasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                    reason === r ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="danger" className="w-full" onClick={() => { if(reason) setSubmitted(true); }}>
              Submit Report
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Idea Card ────────────────────────────────────────────────────────────────
function IdeaCard({ idea, onPropose, onReport }: { idea: Idea; onPropose: () => void; onReport: () => void }) {
  const [saved, setSaved] = useState(() => {
    const savedIds: string[] = JSON.parse(localStorage.getItem('m2m-saved-ideas') || '[]');
    return savedIds.includes(idea.id);
  });

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const savedIds: string[] = JSON.parse(localStorage.getItem('m2m-saved-ideas') || '[]');
    const updated = saved ? savedIds.filter(id => id !== idea.id) : [...savedIds, idea.id];
    localStorage.setItem('m2m-saved-ideas', JSON.stringify(updated));
    setSaved(!saved);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <img src={idea.authorAvatar} alt={idea.author} className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">{idea.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{idea.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {idea.trending && (
              <span className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                <Flame className="w-2.5 h-2.5" /> Hot
              </span>
            )}
            <button
              onClick={toggleSave}
              className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
              title={saved ? 'Remove bookmark' : 'Bookmark idea'}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onReport(); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              title="Report idea"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{idea.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {idea.tags.map(tag => (
            <Badge key={tag} color="slate" size="sm">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">${idea.budget.toLocaleString()}</span>
          </div>
          <Badge color="blue" size="sm">{idea.category}</Badge>
        </div>
      </div>

      <div className="px-5 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); onPropose(); }}
          className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Proposal
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IdeasPage({ onNavigate }: Props) {
  const { t } = useTheme();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [budget, setBudget] = useState('Any Budget');
  const [proposalIdea, setProposalIdea] = useState<Idea | null>(null);
  const [reportIdea, setReportIdea] = useState<Idea | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockIdeas.filter(idea => {
    const matchesSearch = !search || idea.title.toLowerCase().includes(search.toLowerCase()) || idea.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || idea.category === category;
    const matchesBudget = budget === 'Any Budget' ||
      (budget === 'Under $1K' && idea.budget < 1000) ||
      (budget === '$1K–$5K' && idea.budget >= 1000 && idea.budget < 5000) ||
      (budget === '$5K–$15K' && idea.budget >= 5000 && idea.budget < 15000) ||
      (budget === '$15K+' && idea.budget >= 15000);
    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-10">
      {/* Hero Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-10 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-teal-400" />
                <h1 className="text-2xl font-bold text-white">{t('ideas.title')}</h1>
              </div>
              <p className="text-slate-400 text-sm">Discover projects to collaborate on or post your own idea</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => onNavigate('post-idea')}>
                <Lightbulb className="w-4 h-4" />
                {t('ideas.postIdea')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('ideas.search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t('ideas.filter.category')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        category === c ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t('ideas.filter.budget')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {budgetRanges.map(b => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        budget === b ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} ideas found</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((_idea) => (
            <IdeaCard
              key={_idea.id}
              idea={_idea}
              onPropose={() => setProposalIdea(_idea)}
              onReport={() => setReportIdea(_idea)}
            />
          ))}
        </div>
      </div>

      {proposalIdea && <ProposalModal idea={proposalIdea} onClose={() => setProposalIdea(null)} />}
      {reportIdea && <ReportModal idea={reportIdea} onClose={() => setReportIdea(null)} />}
    </div>
  );
}
