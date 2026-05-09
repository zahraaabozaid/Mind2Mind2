import { useState } from 'react';
import { Calendar, ChevronRight, BookOpen, TrendingUp, Coffee, Code, Briefcase } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { Page } from '../types';

const mockPosts = [
  { id: '1', title: 'How to Price Your Freelance Skills in 2025', excerpt: 'A comprehensive guide to setting competitive rates for your expertise based on market research and skill level.', category: 'Business', date: '2025-05-01', readTime: '7 min read', icon: Briefcase, color: 'teal' as const, tags: ['Pricing', 'Freelance', 'Strategy'] },
  { id: '2', title: 'The Art of the Skill Exchange Pitch', excerpt: 'Learn how to craft a compelling proposal when reaching out to someone for a skill exchange. Templates included.', category: 'Tips', date: '2025-04-27', readTime: '5 min read', icon: TrendingUp, color: 'blue' as const, tags: ['Communication', 'Proposals', 'Networking'] },
  { id: '3', title: '10 Most In-Demand Skills on Mind2Mind This Month', excerpt: 'React, Arabic, UI/UX, and 7 more skills that are seeing record exchange requests on the platform right now.', category: 'Trends', date: '2025-04-20', readTime: '4 min read', icon: TrendingUp, color: 'amber' as const, tags: ['Skills', 'Trends', 'Career'] },
  { id: '4', title: 'Building a Portfolio That Wins Exchange Requests', excerpt: 'Show, don\'t tell. Here\'s how to create work samples that convince experts to exchange with you.', category: 'Portfolio', date: '2025-04-15', readTime: '6 min read', icon: BookOpen, color: 'green' as const, tags: ['Portfolio', 'Design', 'Career'] },
  { id: '5', title: 'Remote Learning: Async Skills Exchange Guide', excerpt: 'How to structure a skill exchange across time zones with async video lessons and progress tracking.', category: 'How-To', date: '2025-04-10', readTime: '8 min read', icon: Code, color: 'cyan' as const, tags: ['Remote', 'Async', 'Learning'] },
  { id: '6', title: 'Avoiding Common Skill Exchange Mistakes', excerpt: 'Community members share the biggest pitfalls they\'ve encountered and how to avoid them from day one.', category: 'Tips', date: '2025-04-05', readTime: '5 min read', icon: Coffee, color: 'rose' as const, tags: ['Tips', 'Community', 'Warning'] },
];

const catColors: Record<string, 'teal' | 'blue' | 'amber' | 'green' | 'slate' | 'cyan' | 'rose' | 'orange'> = {
  Business: 'teal', Tips: 'blue', Trends: 'amber', Portfolio: 'green', 'How-To': 'cyan', Learning: 'rose',
};

interface BlogPageProps {
  onNavigate: (page: Page) => void;
}

export default function BlogPage({ onNavigate }: BlogPageProps) {
  const { t } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(mockPosts.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? mockPosts : mockPosts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-10">
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-12 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-teal-300 text-sm font-medium">Tips & Resources</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{t('home.blog')}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Expert guides, platform tips, and community stories to help you get the most out of skill exchanges.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="bg-gradient-to-br from-slate-800 to-teal-900 rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/5 rounded-full -translate-y-20 translate-x-20" />
          <Badge color="teal" size="sm" className="mb-4">Featured</Badge>
          <h2 className="text-xl md:text-2xl font-bold mb-3 max-w-xl">{mockPosts[0].title}</h2>
          <p className="text-slate-300 text-sm mb-5 max-w-lg">{mockPosts[0].excerpt}</p>
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Read Article <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-slate-400 text-sm">{mockPosts[0].readTime}</span>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(post => {
            const Icon = post.icon;
            return (
              <div key={post.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-900/30`}>
                    <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <Badge color={catColors[post.category] ?? 'slate'} size="sm">{post.category}</Badge>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map(tag => <Badge key={tag} color="slate" size="sm">{tag}</Badge>)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <span>{post.readTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
