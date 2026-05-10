import { supabase } from './supabase';
import { ExchangeRequest, Profile, ExchangeMessage } from '../types';

// ============================================================================
// EXCHANGE REQUEST OPERATIONS
// ============================================================================

export async function createExchangeRequest(
  requesterProfileId: string,
  providerProfileId: string,
  requesterSkill: string,
  providerSkill: string,
  message: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: providerProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', providerProfileId)
    .maybeSingle();

  if (!providerProfile) throw new Error('Provider profile not found');

  const { data, error } = await supabase.from('exchanges').insert({
    requester_profile_id: requesterProfileId,
    provider_profile_id: providerProfileId,
    requester_id: user.id,
    provider_id: providerProfile.user_id,
    requester_skill: requesterSkill,
    provider_skill: providerSkill,
    message
  }).select().single();

  if (error) throw error;

  // Create notification for provider
  await supabase.from('notifications').insert({
    user_id: providerProfile.user_id,
    type: 'exchange_request',
    title: 'New Exchange Proposal',
    message: `Someone wants to exchange ${providerSkill} for ${requesterSkill}`,
    related_id: data.id
  });

  return data as ExchangeRequest;
}

export async function updateExchangeStatus(
  exchangeId: string,
  status: 'accepted' | 'declined' | 'completed' | 'cancelled'
) {
  const { data, error } = await supabase
    .from('exchanges')
    .update({ status })
    .eq('id', exchangeId)
    .select()
    .single();

  if (error) throw error;

  const exchange = data as ExchangeRequest;

  // Create notification based on status
  const notificationType = status === 'accepted' ? 'exchange_accepted' : status === 'declined' ? 'exchange_declined' : null;

  if (notificationType) {
    const { data: { user } } = await supabase.auth.getUser();
    const otherUserId = user?.id === exchange.requester_id ? exchange.provider_id : exchange.requester_id;

    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: notificationType,
      title: status === 'accepted' ? 'Exchange Accepted!' : 'Exchange Declined',
      message: `Your exchange request was ${status}`,
      related_id: exchangeId
    });
  }

  return exchange;
}

export async function sendExchangeMessage(exchangeId: string, message: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('exchange_messages').insert({
    exchange_id: exchangeId,
    sender_id: user.id,
    message
  }).select().single();

  if (error) throw error;

  // Create notification for other participant
  const { data: exchange } = await supabase
    .from('exchanges')
    .select('requester_id, provider_id')
    .eq('id', exchangeId)
    .maybeSingle();

  if (exchange) {
    const recipientId = user.id === exchange.requester_id ? exchange.provider_id : exchange.requester_id;

    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message in your exchange',
      related_id: exchangeId
    });
  }

  return data as ExchangeMessage;
}

// ============================================================================
// REVIEW OPERATIONS
// ============================================================================

export async function createReview(
  exchangeId: string,
  revieweeProfileId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  comment: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('reviews').insert({
    exchange_id: exchangeId,
    reviewer_id: user.id,
    reviewee_profile_id: revieweeProfileId,
    rating,
    comment
  }).select().single();

  if (error) throw error;

  // Notify reviewee
  const { data: reviewee } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', revieweeProfileId)
    .maybeSingle();

  if (reviewee) {
    await supabase.from('notifications').insert({
      user_id: reviewee.user_id,
      type: 'review_received',
      title: 'New Review Received',
      message: `You received a ${rating}-star review`,
      related_id: exchangeId
    });
  }

  // Recalculate profile rating
  await supabase.rpc('recalculate_profile_rating', { profile_id: revieweeProfileId });

  return data;
}

// ============================================================================
// PROFILE UPDATE OPERATIONS
// ============================================================================

export async function updateUserProfile(profileId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfileAvailability(profileId: string, isAvailable: boolean) {
  return updateUserProfile(profileId, { is_available: isAvailable });
}

export async function addTeachingSkill(profileId: string, skill: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('teaching_skills')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) throw new Error('Profile not found');

  const skills = profile.teaching_skills || [];
  if (!skills.includes(skill)) {
    skills.push(skill);
  }

  return updateUserProfile(profileId, { teaching_skills: skills });
}

export async function removeTeachingSkill(profileId: string, skill: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('teaching_skills')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) throw new Error('Profile not found');

  const skills = (profile.teaching_skills || []).filter((s: string) => s !== skill);
  return updateUserProfile(profileId, { teaching_skills: skills });
}

export async function addLearningSkill(profileId: string, skill: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('learning_skills')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) throw new Error('Profile not found');

  const skills = profile.learning_skills || [];
  if (!skills.includes(skill)) {
    skills.push(skill);
  }

  return updateUserProfile(profileId, { learning_skills: skills });
}

export async function removeLearningSkill(profileId: string, skill: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('learning_skills')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) throw new Error('Profile not found');

  const skills = (profile.learning_skills || []).filter((s: string) => s !== skill);
  return updateUserProfile(profileId, { learning_skills: skills });
}

// ============================================================================
// KNOWLEDGE DEMO OPERATIONS
// ============================================================================

export async function publishKnowledgeDemo(demoId: string) {
  const { data, error } = await supabase
    .from('demos')
    .update({ visibility: 'public' })
    .eq('id', demoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteKnowledgeDemo(demoId: string) {
  const { error } = await supabase
    .from('demos')
    .delete()
    .eq('id', demoId);

  if (error) throw error;
}

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
}

export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

// ============================================================================
// USER PREFERENCES OPERATIONS
// ============================================================================

export async function updateUserPreferences(updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try to update existing preferences, or insert if they don't exist
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...updates
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export async function logActivity(action: string, details?: Record<string, any>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get user agent and basic IP info
  const userAgent = navigator.userAgent;

  await supabase.from('user_activity_log').insert({
    user_id: user.id,
    action,
    details: details || {},
    user_agent: userAgent
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function canUsersExchange(userId1: string, userId2: string): Promise<boolean> {
  const { data } = await supabase.rpc('can_users_exchange', {
    user_1_id: userId1,
    user_2_id: userId2
  });

  if (data && data.length > 0) {
    return data[0].can_exchange;
  }
  return false;
}

export async function getUserExchangeHistory(userId: string, limit: number = 50) {
  const { data } = await supabase.rpc('get_user_exchange_history', {
    user_id: userId,
    limit_count: limit
  });

  return data || [];
}

export async function getProfileWithStats(profileId: string) {
  const { data } = await supabase.rpc('get_profile_with_stats', {
    profile_id: profileId
  });

  if (data && data.length > 0) {
    return data[0];
  }
  return null;
}

export function formatRating(rating: number): string {
  return rating.toFixed(2);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(dateString);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateResponseTime(createdAt: string, respondedAt: string): number {
  const created = new Date(createdAt).getTime();
  const responded = new Date(respondedAt).getTime();
  return Math.floor((responded - created) / 3600000); // hours
}

// ============================================================================
// PROFILE CATEGORY OPERATIONS (AUTO-CATEGORIZATION)
// ============================================================================

export interface ProfileCategory {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  is_expert: boolean;
}

export async function getProfileCategories(profileId: string): Promise<ProfileCategory[]> {
  const { data, error } = await supabase.rpc('get_profile_categories', {
    profile_id: profileId
  });

  if (error) {
    console.error('Error fetching profile categories:', error);
    return [];
  }

  return data || [];
}

export async function autoCategorizeProfile(profileId: string): Promise<void> {
  const { error } = await supabase.rpc('auto_categorize_profile', {
    profile_id: profileId
  });

  if (error) {
    console.error('Error auto-categorizing profile:', error);
  }
}

export async function getSkillCategories() {
  const { data, error } = await supabase
    .from('skill_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching skill categories:', error);
    return [];
  }

  return data || [];
}
