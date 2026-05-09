import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  Profile, KnowledgeDemo, Review, Notification, UserPreferences,
  SkillEndorsement, ExchangeMessage, ExchangeRequest, DashboardStats
} from '../types';

// ============================================================================
// PROFILE HOOKS
// ============================================================================

export function useProfile(profileId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        if (error) throw error;
        setProfile(data as Profile);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  return { profile, loading, error };
}

export function useProfiles(filter?: { verified_only?: boolean; available_only?: boolean; limit?: number }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      let query = supabase.from('profiles').select('*').eq('is_demo', false);

      if (filter?.verified_only) query = query.eq('video_verified', true);
      if (filter?.available_only) query = query.eq('is_available', true);

      const { data } = await query.order('exchange_count', { ascending: false }).limit(filter?.limit || 50);
      setProfiles((data as Profile[]) || []);
      setLoading(false);
    };

    fetchProfiles();
  }, [filter]);

  return { profiles, loading };
}

export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile((data as Profile) || null);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { profile, loading };
}

// ============================================================================
// KNOWLEDGE DEMO HOOKS
// ============================================================================

export function useDemos(profileId?: string, limit: number = 50) {
  const [demos, setDemos] = useState<KnowledgeDemo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemos = async () => {
      let query = supabase.from('demos').select('*');

      if (profileId) query = query.eq('user_id', profileId);

      const { data } = await query.order('created_at', { ascending: false }).limit(limit);
      setDemos((data as KnowledgeDemo[]) || []);
      setLoading(false);
    };

    fetchDemos();
  }, [profileId, limit]);

  return { demos, loading };
}

export function useLikeDemo(demoId: string) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('demo_likes')
        .select('id')
        .eq('demo_id', demoId)
        .eq('user_id', user.id)
        .maybeSingle();

      setLiked(!!data);
    };

    checkLike();
  }, [demoId]);

  const toggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      if (liked) {
        await supabase.from('demo_likes').delete().eq('demo_id', demoId).eq('user_id', user.id);
        setLiked(false);
      } else {
        await supabase.from('demo_likes').insert({ demo_id: demoId, user_id: user.id });
        setLiked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { liked, toggleLike, loading };
}

// ============================================================================
// EXCHANGE HOOKS
// ============================================================================

export function useExchanges(userId?: string) {
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchExchanges = async () => {
      const { data } = await supabase
        .from('exchange_requests')
        .select('*')
        .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      setExchanges((data as ExchangeRequest[]) || []);
      setLoading(false);
    };

    fetchExchanges();
  }, [userId]);

  return { exchanges, loading };
}

export function usePendingExchanges(userId?: string) {
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchExchanges = async () => {
      const { data } = await supabase
        .from('exchange_requests')
        .select('*')
        .eq('status', 'pending')
        .or(`requester_id.eq.${userId},provider_id.eq.${userId}`);

      setExchanges((data as ExchangeRequest[]) || []);
    };

    fetchExchanges();
  }, [userId]);

  return { exchanges };
}

export function useExchangeMessages(exchangeId: string) {
  const [messages, setMessages] = useState<ExchangeMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exchangeId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('exchange_messages')
        .select('*')
        .eq('exchange_id', exchangeId)
        .order('created_at', { ascending: true });

      setMessages((data as ExchangeMessage[]) || []);
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel(`exchange_${exchangeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'exchange_messages',
        filter: `exchange_id=eq.${exchangeId}`
      }, (payload) => {
        setMessages(m => [...m, payload.new as ExchangeMessage]);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [exchangeId]);

  return { messages, loading };
}

// ============================================================================
// REVIEW HOOKS
// ============================================================================

export function useProfileReviews(profileId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_profile_id', profileId)
        .order('created_at', { ascending: false });

      setReviews((data as Review[]) || []);
      setLoading(false);
    };

    fetchReviews();
  }, [profileId]);

  return { reviews, loading };
}

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setNotifications((data as Notification[]) || []);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return { notifications, loading };
}

export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setCount(unreadCount || 0);
    };

    fetchCount();
  }, []);

  return { count };
}

// ============================================================================
// USER PREFERENCES HOOKS
// ============================================================================

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setPreferences((data as UserPreferences) || null);
      setLoading(false);
    };

    fetchPreferences();
  }, []);

  return { preferences, loading };
}

// ============================================================================
// DASHBOARD STATS HOOKS
// ============================================================================

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase.rpc('get_user_dashboard_stats', { user_id: user.id });

      if (data && data.length > 0) {
        setStats(data[0] as DashboardStats);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

// ============================================================================
// SKILL ENDORSEMENT HOOKS
// ============================================================================

export function useSkillEndorsements(profileId: string) {
  const [endorsements, setEndorsements] = useState<SkillEndorsement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEndorsements = async () => {
      const { data } = await supabase
        .from('skill_endorsements')
        .select('*')
        .eq('endorsee_profile_id', profileId);

      setEndorsements((data as SkillEndorsement[]) || []);
      setLoading(false);
    };

    fetchEndorsements();
  }, [profileId]);

  return { endorsements, loading };
}

export function useEndorseSkill(endorseeProfileId: string, skillName: string) {
  const [loading, setLoading] = useState(false);

  const endorse = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      await supabase.from('skill_endorsements').insert({
        endorser_id: user.id,
        endorsee_profile_id: endorseeProfileId,
        skill_name: skillName
      });
    } finally {
      setLoading(false);
    }
  };

  return { endorse, loading };
}

// ============================================================================
// SEARCH & RECOMMENDATION HOOKS
// ============================================================================

export function useRecommendedExperts(skillName: string, limit: number = 10) {
  const [experts, setExperts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!skillName) return;

    const fetchExperts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.rpc('get_recommended_experts', {
        learning_skill: skillName,
        limit_count: limit,
        exclude_user_id: user?.id
      });

      setExperts((data as Profile[]) || []);
      setLoading(false);
    };

    fetchExperts();
  }, [skillName, limit]);

  return { experts, loading };
}

export function useSearchProfiles(
  query: string,
  verifyOnly: boolean = false,
  availableOnly: boolean = false,
  limit: number = 20
) {
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchProfiles = async () => {
      setLoading(true);
      const { data } = await supabase.rpc('search_profiles', {
        search_query: query,
        verify_only: verifyOnly,
        available_only: availableOnly,
        limit_count: limit
      });

      setResults((data as Profile[]) || []);
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchProfiles, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, verifyOnly, availableOnly, limit]);

  return { results, loading };
}
