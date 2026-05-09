
import { Flame, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { Page } from '../../types';

interface Props {
  onNavigate: (page: Page) => void;
}

const trendingIdeas = [
  { id: '1', title: 'AI-Powered Recipe App', author: 'Sara R.', category: 'Tech', budget: '$500 - $1K', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop' },
  { id: '2', title: 'Language Learning Game', author: 'Omar Z.', category: 'Education', budget: 'Equity', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop' },
  { id: '3', title: 'Freelancer Legal Templates', author: 'Leila M.', category: 'Legal', budget: '$1K - $5K', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=200&fit=crop' },
  { id: '4', title: 'Eco-Friendly Product Marketplace', author: 'Khaled A.', category: 'E-Commerce', budget: '$10K+', image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=200&fit=crop' },
];

export default function TrendingIdeas({ onNavigate }: Props) {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-semibold px-3 py-1.5 rounded-full mb-3">
              <Flame className="w-4 h-4" /> Trending This Week
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Hot Ideas Seeking Talent</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Discover popular project concepts and submit your proposal to collaborate.</p>
          </div>
          <button
            onClick={() => onNavigate('ideas')}
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            Browse all ideas <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Scroll Area */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x hide-scrollbar">
          {trendingIdeas.map((idea) => (
            <div key={idea.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 hover:shadow-xl transition-all cursor-pointer group" onClick={() => onNavigate('ideas')}>
              <div className="relative h-32 overflow-hidden">
                <img src={idea.image} alt={idea.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute right-3 top-3">
                  <Badge color="rose" size="sm"><Flame className="w-3 h-3 mr-1" /> Hot</Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge color="slate" size="sm">{idea.category}</Badge>
                  <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">{idea.budget}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{idea.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Posted by {idea.author}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
