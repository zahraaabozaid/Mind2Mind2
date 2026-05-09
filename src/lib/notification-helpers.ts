import { supabase } from './supabase';

export async function createNotification(userId: string, message: string, exchangeId?: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message,
        exchange_id: exchangeId,
        is_read: false,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
