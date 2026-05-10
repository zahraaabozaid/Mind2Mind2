import { supabase } from './supabase';
import { KnowledgeDemo } from '../types';

/**
 * Fetch demos for a profile with visibility enforcement
 * @param userId - The user ID to fetch demos for
 * @param currentUserId - The current logged-in user ID (optional)
 * @param limit - Maximum number of demos to fetch
 */
export async function fetchProfileDemos(
  userId: string,
  _currentUserId?: string,
  limit: number = 50
): Promise<KnowledgeDemo[]> {
  try {
    // Fetch all demos for the user
    // RLS in 'demos' table already handles visibility:
    // "Public demos are readable by all"
    const { data: demos, error } = await supabase
      .from('demos')
      .select('*, profile:profiles(display_name, avatar_url, username)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (demos || []) as KnowledgeDemo[];
  } catch (error) {
    console.error('Error fetching profile demos:', error);
    return [];
  }
}

/**
 * Check if a user can view a specific demo
 * (Client-side helper, but RLS is the source of truth)
 */
export async function canViewDemo(
  demo: KnowledgeDemo,
  currentUserId?: string,
  currentUsername?: string
): Promise<boolean> {
  if (demo.visibility === 'public') return true;
  if (currentUserId === demo.user_id) return true;
  if (currentUsername && demo.allowed_users?.includes(currentUsername)) return true;
  return false;
}

/**
 * Get all demos accessible to a user (Discovery/Library)
 * @param userId - The current user ID
 * @param limit - Maximum number of demos to fetch
 */
export async function fetchAccessibleDemos(
  _userId: string,
  limit: number = 50
): Promise<KnowledgeDemo[]> {
  try {
    // RLS handles the heavy lifting:
    // 1. visibility = 'public'
    // 2. user_id = auth.uid()
    // 3. auth.username IN allowed_users
    const { data: demos, error } = await supabase
      .from('demos')
      .select('*, profile:profiles(display_name, avatar_url, username)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (demos || []) as KnowledgeDemo[];
  } catch (error) {
    console.error('Error fetching accessible demos:', error);
    return [];
  }
}

/**
 * Toggle demo like for a user
 * Note: schema check needed if 'demo_likes' table exists. 
 * If not, we might need to add it or skip this feature.
 */
export async function toggleDemoLike(
  demoId: string,
  userId: string
): Promise<{ liked: boolean; error?: string }> {
  try {
    const { data: existing } = await supabase
      .from('demo_likes')
      .select('id')
      .eq('demo_id', demoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('demo_likes').delete().eq('id', existing.id);
      return { liked: false };
    } else {
      await supabase.from('demo_likes').insert({ demo_id: demoId, user_id: userId });
      return { liked: true };
    }
  } catch (error: unknown) {
    console.error('Error toggling demo like:', error);
    return { liked: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function hasUserLikedDemo(
  demoId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('demo_likes')
      .select('id')
      .eq('demo_id', demoId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  } catch (e) {
    console.error('Error checking demo like:', e);
    return false;
  }
}
