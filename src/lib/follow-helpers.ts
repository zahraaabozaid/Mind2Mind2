import { supabase } from './supabase';

export async function toggleFollow(followerId: string, followingId: string) {
  try {
    // Check if already following
    const { data: existing } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existing) {
      // Unfollow
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (error) throw error;
      return { action: 'unfollowed' };
    } else {
      // Follow
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: followerId,
          following_id: followingId
        });
      
      if (error) throw error;
      return { action: 'followed' };
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
}

export async function getFollowStatus(followerId: string, followingId: string) {
  const { data } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  
  return !!data;
}
