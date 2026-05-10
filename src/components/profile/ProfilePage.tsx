import { useState, useEffect } from 'react';
import { Star, MapPin, Video, Repeat, Globe, Clock, Play, ArrowLeft, MessageCircle, Edit, FileVideo, FileText, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile, KnowledgeDemo, Page } from '../../types';
import { fetchProfileDemos } from '../../lib/demo-helpers';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ExchangeModal from '../exchange/ExchangeModal';
import ProfileEditModal from './ProfileEditModal';
import { useAuth } from '../../context/AuthContext';
import { toggleFollow, getFollowStatus } from '../../lib/follow-helpers';
import { createNotification } from '../../lib/notification-helpers';
import DemoUploadModal from './DemoUploadModal';
import { Upload } from 'lucide-react';

interface Props {
  profileId?: string;
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}



export default function ProfilePage({ profileId, onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demos, setDemos] = useState<KnowledgeDemo[]>([]);
  const [reviews, setReviews] = useState<{ id: string; rating: number; comment: string; reviewer_id: string; created_at: string; profiles?: { display_name: string; avatar_url: string } | { display_name: string; avatar_url: string }[] }[]>([]);
  const [activeTab, setActiveTab] = useState<'demos' | 'reviews' | 'about'>('demos');
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        let idToFetch = profileId;

        // If no profileId provided and user is logged in, fetch their own profile
        if (!profileId && user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (userProfile) {
            idToFetch = userProfile.id;
          }
        }

        // Fetch profile and reviews
        if (idToFetch) {
          const [{ data: p }, { data: r }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', idToFetch).maybeSingle(),
            supabase.from('reviews')
              .select(`
                id, exchange_id, reviewer_id, rating, comment, created_at,
                profiles:reviewer_id(display_name, avatar_url)
              `)
              .eq('reviewee_profile_id', idToFetch)
              .order('created_at', { ascending: false }),
          ]);

          if (p) {
            setProfile(p as Profile);
            // Check if this is the current user's profile
            setIsOwnProfile(user ? p.user_id === user.id : false);

            // Fetch real follower counts from database
            const [{ count: followers }, { count: following }] = await Promise.all([
              supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', idToFetch),
              supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', idToFetch),
            ]);

            setFollowerCount(followers || 0);
            setFollowingCount(following || 0);

            // Fetch demos with visibility enforcement using the auth user_id
            const demosData = await fetchProfileDemos(p.user_id || '', user?.id);
            console.log("Demos found in DB for user:", p.user_id, demosData);
            setDemos(demosData);
            setReviews(r || []);
          } else {
            setProfile(null);
            setDemos([]);
            setReviews([]);
            setIsOwnProfile(false);
            setFollowerCount(0);
            setFollowingCount(0);
          }
        } else {
          // No profileId and not logged in
          setProfile(null);
          setDemos([]);
          setReviews([]);
          setIsOwnProfile(false);
          setFollowerCount(0);
          setFollowingCount(0);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
        setDemos([]);
        setReviews([]);
        setIsOwnProfile(false);
        setFollowerCount(0);
        setFollowingCount(0);
      }
    };

    loadProfile();
  }, [profileId, user]);

  // Check follow status separately
  useEffect(() => {
    const checkStatus = async () => {
      if (user && profile && !isOwnProfile) {
        // Find our own profile ID first
        const { data: ownProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (ownProfile) {
          const status = await getFollowStatus(ownProfile.id, profile.id);
          setIsFollowing(status);
        }
      }
    };
    checkStatus();
  }, [user, profile, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!user) {
      onOpenAuth('signup');
      return;
    }

    if (!profile) return;

    try {
      // Find our own profile ID
      const { data: ownProfile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!ownProfile) return;

      const result = await toggleFollow(ownProfile.id, profile.id);

      if (result.action === 'followed') {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);

        // Trigger notification
        if (profile.user_id) {
          await createNotification(
            profile.user_id,
            `${ownProfile.display_name} started following you`
          );
        }
      } else {
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleExchange = async () => {
    // Debug: Log current auth state
    console.log('🔍 Exchange button clicked on profile page');
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
        setExchangeOpen(true);
      } catch (err) {
        console.error('❌ Error checking session:', err);
        onOpenAuth('signup');
      }
      return;
    }

    // User is logged in
    console.log('✅ User is logged in, opening exchange modal');
    setExchangeOpen(true);
  };

  if (!profile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const memberMonths = Math.round((Date.now() - new Date(profile.member_since).getTime()) / (30 * 24 * 60 * 60 * 1000));

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-slate-700 to-teal-800 overflow-hidden">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover opacity-40" />
        )}
        <button
          onClick={() => onNavigate('browse')}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
              {profile.video_verified && (
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-teal-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
                  <Video className="w-3 h-3" />
                  Video Verified
                </div>
              )}
            </div>

            <div className="flex-1 pt-2 sm:pt-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{profile.display_name}</h1>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Globe className="w-4 h-4" />
                      {profile.languages.join(', ')}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {memberMonths} months on Mind2Mind
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= Math.round(profile.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-slate-800">{profile.rating.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm">({profile.review_count} reviews)</span>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm"><strong className="text-slate-900">{followerCount}</strong> <span className="text-slate-500">Followers</span></span>
                    <span className="text-sm"><strong className="text-slate-900">{followingCount}</strong> <span className="text-slate-500">Following</span></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <>
                        <Button onClick={() => setEditModalOpen(true)} size="md" variant="outline">
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </Button>
                        <Button onClick={() => setShowUploadModal(true)} size="md" className="bg-teal-600 hover:bg-teal-700">
                          <Upload className="w-4 h-4" />
                          Upload Demo
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleFollowToggle}
                          size="md"
                          variant={isFollowing ? 'outline' : 'primary'}
                          className={isFollowing ? 'border-teal-600 text-teal-600' : ''}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        {profile.is_available ? (
                          <Button onClick={handleExchange} size="md">
                            <MessageCircle className="w-4 h-4" />
                            Exchange
                          </Button>
                        ) : (
                          <div className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium">
                            Busy
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <Button onClick={() => onNavigate('portfolio')} size="sm" variant="outline" className="w-full">
                    View Public Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Exchanges', value: profile.exchange_count, icon: Repeat },
            { label: 'Reviews', value: profile.review_count, icon: Star },
            { label: 'Response Rate', value: `${profile.response_rate}%`, icon: MessageCircle },
            { label: 'Demos', value: demos.length, icon: Play },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex border-b border-slate-200 mb-8">
          {(['demos', 'reviews', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                  ? 'text-teal-600 border-teal-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
            >
              {tab === 'demos' ? 'Knowledge Demos' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'demos' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {demos.length > 0 ? (
              demos.map(demo => (
                <div key={demo.id} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                    {demo.file_type === 'video' ? (
                      <>
                        <FileVideo className="w-10 h-10 text-white/10" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-teal-50 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-teal-200" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm flex items-center gap-1 ${demo.visibility === 'public' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                        {demo.visibility === 'public' ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        {demo.visibility}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{demo.skill_name}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{demo.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">{demo.description}</p>

                    {demo.visibility === 'custom' && demo.allowed_users && demo.allowed_users.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {demo.allowed_users.map(u => (
                          <span key={u} className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium">@{u}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 capitalize"><Clock className="w-3 h-3" /> {new Date(demo.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                        {demo.file_type}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : isOwnProfile ? (
              <div className="col-span-full text-center py-12">
                <Play className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">You haven't uploaded any knowledge demos yet.</p>
                <p className="text-slate-400 text-sm">Share your teaching style with demos!</p>
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <Play className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No knowledge demos available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 mb-12">
            {reviews.length > 0 ? (
              reviews.map((review) => {
                const rawProfile = review.profiles;
                const reviewerProfile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
                return (
                  <div key={review.id} className="bg-white border border-slate-100 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={reviewerProfile?.avatar_url || 'https://via.placeholder.com/40'}
                        alt={reviewerProfile?.display_name || 'Reviewer'}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-slate-900 text-sm">{reviewerProfile?.display_name || 'Anonymous'}</span>
                            <span className="text-slate-400 text-xs ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : isOwnProfile ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">You don't have any reviews yet.</p>
                <p className="text-slate-400 text-sm">Complete exchanges to earn reviews!</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No reviews available yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">About</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Video Intro</h3>
                {profile.verification_video_url ? (
                  <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden group border border-slate-200">
                    <video
                      src={profile.verification_video_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-6">
                    <Video className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm font-medium">No Intro Video Uploaded</p>
                    {isOwnProfile && (
                      <p className="text-slate-400 text-xs mt-1">Upload an intro video in your profile settings to introduce yourself!</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Skills I Teach</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.teaching_skills.map((skill, i) => (
                    <Badge key={i} color="teal">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Skills I Want to Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.learning_skills.map((skill, i) => (
                    <Badge key={i} color="amber">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, i) => (
                    <Badge key={i} color="slate">{lang}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {exchangeOpen && profile && (
        <ExchangeModal expert={profile} onClose={() => setExchangeOpen(false)} />
      )}

      {editModalOpen && (
        <ProfileEditModal
          onClose={() => setEditModalOpen(false)}
          onSaved={() => {
            setEditModalOpen(false);
            // Reload the profile
            if (profile) {
              const reloadProfile = async () => {
                const { data: p } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', profile.id)
                  .maybeSingle();
                if (p) setProfile(p as Profile);
              };
              reloadProfile();
            }
          }}
        />
      )}
      {showUploadModal && (
        <DemoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={async (newDemo?: KnowledgeDemo) => {
            console.log("Upload Status: success", newDemo);
            setShowUploadModal(false);
            if (profile) {
              // Optimistic update if we have the new demo
              if (newDemo) {
                setDemos(prev => [newDemo, ...prev]);
              }
              // Still re-fetch to ensure sync
              const demosData = await fetchProfileDemos(profile.user_id || '', user?.id);
              console.log("Fetched Profile Demos (Post-Upload):", demosData);
              setDemos(demosData);
            }
          }}
        />
      )}
    </div>
  );
}
