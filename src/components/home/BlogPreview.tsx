import { ArrowRight, BookOpen } from 'lucide-react';
import Badge from '../ui/Badge';
import { Page } from '../../types';

interface Props {
  onNavigate: (page: Page) => void;
}

const posts = [
  { id: '1', title: 'How to Write a Winning Proposal on Mind2Mind', category: 'Tips & Tricks', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1554200876-56c2f25224fa?w=400&h=250&fit=crop', date: 'May 06, 2025' },
  { id: '2', title: 'Top 10 High-Demand Skills for Freelancers in 2025', category: 'Industry Trends', readTime: '8 min read', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop', date: 'May 03, 2025' },
  { id: '3', title: 'Navigating Cross-Culture Skill Exchanges', category: 'Community', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop', date: 'Apr 28, 2025' }
];

export default function BlogPreview({ onNavigate }: Props) {
  return (
    <section className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-teal-100 dark:border-teal-800">
            <BookOpen className="w-4 h-4" /> Official Blog
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Latest Insights & Tips</h2>
          <p className="text-slate-500 dark:text-slate-400">Read the latest strategies, guides, and stories from the Mind2Mind freelancer community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <div key={post.id} onClick={() => onNavigate('blog')} className="group flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-4 left-4">
                  <Badge color="teal" size="sm">{post.category}</Badge>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{post.title}</h3>
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('blog')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-400 rounded-xl font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Visit Our Blog
          </button>
        </div>
      </div>
    </section>
  );
}
