import { Star, MapPin, Video, Repeat, MessageCircle } from 'lucide-react';
import { Profile, Page } from '../../types';
import Badge from '../ui/Badge';

interface Props {
  expert: Profile;
  onNavigate: (page: Page, id?: string) => void;
  onRequestExchange: (expert: Profile) => void;
}

export default function ExpertCard({ expert, onNavigate, onRequestExchange }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div
        className="p-5 cursor-pointer"
        onClick={() => onNavigate('profile', expert.id)}
      >
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={expert.avatar_url}
              alt={expert.display_name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            {expert.is_available && (
              <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900 truncate">{expert.display_name}</span>
              {expert.video_verified && (
                <div className="flex items-center gap-1 bg-teal-50 text-teal-600 border border-teal-100 text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
                  <Video className="w-2.5 h-2.5" />
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
              <MapPin className="w-3 h-3" />
              {expert.location}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star
                    key={n}
                    className={`w-3 h-3 ${n <= Math.round(expert.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700">{expert.rating.toFixed(2)}</span>
              <span className="text-xs text-slate-400">({expert.review_count})</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mt-3 mb-4 line-clamp-2">{expert.bio}</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Teaches</div>
            <div className="flex flex-wrap gap-1">
              {expert.teaching_skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} color="teal" size="sm">{skill}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Wants to Learn</div>
            <div className="flex flex-wrap gap-1">
              {expert.learning_skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} color="amber" size="sm">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Repeat className="w-3 h-3" />
            {expert.exchange_count} exchanges
          </div>
          <div className={`flex items-center gap-1 ${expert.is_available ? 'text-emerald-600' : 'text-slate-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${expert.is_available ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            {expert.is_available ? 'Available' : 'Busy'}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRequestExchange(expert); }}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Propose Exchange
        </button>
      </div>
    </div>
  );
}
