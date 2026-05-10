import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables at client initialization
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined. Please set it in your environment variables.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined. Please set it in your environment variables.');
}

// Create client with fallback to prevent crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Export validation status for use in components
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/** Extract a human-readable message from any thrown value (Error, PostgrestError, etc.) */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}
