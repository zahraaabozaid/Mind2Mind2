import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, Star } from 'lucide-react';
import { Profile, Page } from '../../types';
import { RecommendationEngine } from '../../lib/recommendation-engine';
import Button from '../ui/Button';

interface RecommendedProfilesProps {
  userProfile?: Profile;
  allProfiles: Profile[];
  onNavigate: (page: Page, profileId?: string) => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  title?: string;
  limit?: number;
}

export default function RecommendedProfiles({
  userProfile,
  allProfiles,
  onNavigate,
  onOpenAuth,
  title = 'Recommended for You',
  limit = 4,
}: RecommendedProfilesProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile && allProfiles.length > 0) {
      const recs = RecommendationEngine.getRecommendations(userProfile, allProfiles, limit);
      setRecommendations(recs);
    } else {
      // If no user profile, show top-rated profiles
      const topRated = RecommendationEngine.getTopRatedProfiles(allProfiles, limit);
      setRecommendations(topRated.map(p => ({ profile: p, score: p.rating * 20, reason: 'Highly rated' })));
    }
    setLoading(false);
  }, [userProfile, allProfiles, limit]);

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Zap className="w-3.5 h-3.5" />
              Smart Matches
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-500 text-base md:text-lg mt-2">
              Based on your skills and interests
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="hidden md:flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors flex-shrink-0"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((rec, i) => {
            const profile = rec.profile;
            return (
              <div
                key={i}
                className="group bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => onNavigate('profile', profile.id)}
              >
                {/* Score Badge */}
                <div className="absolute top-3 right-3 bg-teal-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {Math.round(rec.score)}% match
                </div>

                {/* Avatar */}
                <div className="relative mb-4">
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                    loading="lazy"
                  />
                  {profile.video_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px]">✓</span>
                    </div>
                  )}
                  {profile.is_available && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Name & Location */}
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors mb-1">
                  {profile.display_name}
                </h3>
                <p className="text-slate-500 text-xs mb-3">{profile.location}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className={`w-3 h-3 ${n <= Math.round(profile.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                  <span className="text-xs font-semibold text-slate-700 ml-1">{profile.rating.toFixed(1)}</span>
                </div>

                {/* Reason */}
                <p className="text-xs text-teal-600 bg-teal-50 px-2 py-1.5 rounded-lg mb-4 line-clamp-2">
                  {t(rec.reason)}
                </p>

                {/* Skills */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                      Teaches
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.teaching_skills.slice(0, 2).map((skill: string, j: number) => (
                        <span
                          key={j}
                          className="inline-block bg-teal-100 text-teal-700 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('profile', profile.id);
                  }}
                >
                  View Profile
                </Button>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => onNavigate('browse')}
            className="w-full"
          >
            View All Recommendations
          </Button>
        </div>
      </div>
    </section>
  );
}
