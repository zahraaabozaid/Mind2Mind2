/**
 * MasterclassesPage.tsx
 *
 * Displays all upcoming group masterclasses with filtering, pricing,
 * and Stripe Checkout integration. Matches the existing teal/slate design system.
 */

import { useState, useEffect } from 'react';
import {
  Users, Calendar, Clock, Star, Search, Filter,
  Zap, Lock, CheckCircle, AlertCircle, ExternalLink,
  BookOpen, Video, Tag
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Masterclass, Page } from '../types';
import {
  fetchMasterclasses,
  initiateCheckout,
  checkEnrollmentStatus,
  formatPrice,
  getSpotsRemaining,
  isSoldOut,
} from '../lib/masterclass-helpers';

interface Props {
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

// ─── Masterclass Card ─────────────────────────────────────────────────────────
function MasterclassCard({
  masterclass,
  onJoin,
  isEnrolled,
  isLoading,
}: {
  masterclass: Masterclass;
  onJoin: (mc: Masterclass) => void;
  isEnrolled: boolean;
  isLoading: boolean;
}) {
  const spotsLeft = getSpotsRemaining(masterclass);
  const soldOut = isSoldOut(masterclass);
  const scheduledDate = new Date(masterclass.scheduled_at);
  const isPast = scheduledDate < new Date();

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* Card Header */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-900 p-5 relative">
        {/* Premium badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full">
          <Zap className="w-2.5 h-2.5" />
          PAID
        </div>

        <div className="flex items-start gap-3">
          {/* Expert avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-700 flex-shrink-0 flex items-center justify-center">
            {masterclass.expert_profile?.avatar_url ? (
              <img
                src={masterclass.expert_profile.avatar_url}
                alt={masterclass.expert_profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {masterclass.expert_profile?.display_name?.[0]?.toUpperCase() ?? 'E'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-1">
              {masterclass.title}
            </h3>
            <p className="text-teal-300 text-xs">
              by {masterclass.expert_profile?.display_name ?? 'Expert'}
            </p>
          </div>
        </div>

        {/* Topic badge */}
        {masterclass.topic && (
          <div className="mt-3 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-teal-400" />
            <span className="text-teal-300 text-xs font-medium">{masterclass.topic}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Description */}
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
          {masterclass.description}
        </p>

        {/* Meta info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span>
              {scheduledDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span>
              {scheduledDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span>
              {soldOut ? (
                <span className="text-red-500 font-medium">Sold out</span>
              ) : (
                <>
                  <span className={spotsLeft <= 5 ? 'text-amber-600 font-medium' : ''}>
                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                  </span>
                  {' '}/ {masterclass.max_participants} total
                </>
              )}
            </span>
          </div>
          {masterclass.expert_profile && masterclass.expert_profile.rating > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <span>
                {masterclass.expert_profile.rating.toFixed(1)} rating
                ({masterclass.expert_profile.review_count} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {formatPrice(masterclass.price_cents)}
            </span>
            {isEnrolled && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Enrolled
              </span>
            )}
          </div>

          {isEnrolled ? (
            <div className="space-y-2">
              {masterclass.session_link ? (
                <a
                  href={masterclass.session_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join Session
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm px-4 py-2.5 rounded-xl">
                  <Clock className="w-4 h-4" />
                  Session link coming soon
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onJoin(masterclass)}
              disabled={soldOut || isPast || isLoading}
              className={`w-full inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${
                soldOut || isPast
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : soldOut ? (
                <>
                  <Users className="w-4 h-4" />
                  Sold Out
                </>
              ) : isPast ? (
                <>
                  <Clock className="w-4 h-4" />
                  Ended
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay to Enroll (${formatPrice(masterclass.price_cents)})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MasterclassesPage({ onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');

  // Load masterclasses on mount
  useEffect(() => {
    loadMasterclasses();
  }, []);

  // Check enrollment status for logged-in user
  useEffect(() => {
    if (!user || masterclasses.length === 0) return;
    checkAllEnrollments();
  }, [user, masterclasses]);

  // Handle Stripe success redirect (URL params set by checkout success_url)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const sessionId = params.get('session_id');
    const masterclassId = params.get('masterclass_id');

    if (page === 'masterclass-success' && sessionId && masterclassId) {
      // Clean up URL and navigate to success page
      window.history.replaceState({}, '', window.location.pathname);
      onNavigate('masterclass-success', `${masterclassId}|${sessionId}`);
    }
  }, []);

  const loadMasterclasses = async () => {
    setLoading(true);
    try {
      const data = await fetchMasterclasses();
      setMasterclasses(data);
    } catch (err) {
      console.error('Error loading masterclasses:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAllEnrollments = async () => {
    if (!user) return;
    const enrolled = new Set<string>();
    await Promise.all(
      masterclasses.map(async (mc) => {
        const enrollment = await checkEnrollmentStatus(mc.id, user.id);
        if (enrollment?.payment_status === 'paid') {
          enrolled.add(mc.id);
        }
      })
    );
    setEnrolledIds(enrolled);
  };

  const handleJoin = async (masterclass: Masterclass) => {
    // Require login
    if (!user) {
      onOpenAuth('signup');
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(masterclass.id);

    try {
      const { url } = await initiateCheckout(masterclass.id, user.id);
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  };

  // Derive unique topics for filter
  const topics = ['All', ...Array.from(new Set(masterclasses.map((mc) => mc.topic).filter(Boolean)))];

  // Filter masterclasses
  const filtered = masterclasses.filter((mc) => {
    const matchesSearch =
      !search ||
      mc.title.toLowerCase().includes(search.toLowerCase()) ||
      mc.description.toLowerCase().includes(search.toLowerCase()) ||
      mc.topic.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter === 'All' || mc.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-teal-400 text-sm font-medium uppercase tracking-wide">
                  Premium Feature
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Group Masterclasses</h1>
              <p className="text-slate-400 max-w-xl">
                Live group sessions hosted by verified experts. Pay once, learn with a community.
              </p>
            </div>
            {/* CTA for experts */}
            {user && (
              <Button
                onClick={() => onNavigate('create-masterclass')}
                className="flex-shrink-0"
              >
                <Zap className="w-4 h-4" />
                Host a Masterclass
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error banner */}
        {checkoutError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{checkoutError}</span>
            <button
              onClick={() => setCheckoutError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search masterclasses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setTopicFilter(topic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      topicFilter === topic
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'Loading...' : `${filtered.length} masterclass${filtered.length !== 1 ? 'es' : ''} available`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          // Skeleton loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-80 border border-slate-100 dark:border-slate-700" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mc) => (
              <MasterclassCard
                key={mc.id}
                masterclass={mc}
                onJoin={handleJoin}
                isEnrolled={enrolledIds.has(mc.id)}
                isLoading={checkoutLoading === mc.id}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No masterclasses found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {search || topicFilter !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'No upcoming masterclasses yet. Check back soon!'}
            </p>
            {user && (
              <Button onClick={() => onNavigate('create-masterclass')} variant="outline">
                <Zap className="w-4 h-4" />
                Host the first masterclass
              </Button>
            )}
          </div>
        )}

        {/* Sign-in prompt for guests */}
        {!user && !loading && filtered.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <Lock className="w-8 h-8 text-teal-600 flex-shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-slate-900 dark:text-white">
                Sign in to join a masterclass
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create a free account to purchase and attend live sessions.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenAuth('signin')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => onOpenAuth('signup')}>
                Join Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
