/**
 * masterclass-helpers.ts
 *
 * All Supabase data operations for the Masterclasses feature.
 * Keeps data logic separate from UI components.
 */

import { supabase } from './supabase';
import { Masterclass, MasterclassEnrollment, AISummaryContent, SessionSummary } from '../types';

// ============================================================================
// FETCH MASTERCLASSES
// ============================================================================

/**
 * Fetch all upcoming/live masterclasses with expert profile and enrollment count.
 */
export async function fetchMasterclasses(): Promise<Masterclass[]> {
  const { data, error } = await supabase
    .from('masterclasses')
    .select(`
      *,
      expert_profile:profiles!masterclasses_expert_id_fkey(
        id, display_name, avatar_url, rating, review_count
      )
    `)
    .in('status', ['upcoming', 'live'])
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Error fetching masterclasses:', error);
    return [];
  }

  // Fetch enrollment counts for each masterclass
  const masterclasses = await Promise.all(
    (data || []).map(async (mc) => {
      const { data: countData } = await supabase
        .rpc('get_masterclass_enrollment_count', { mc_id: mc.id });
      return {
        ...mc,
        enrollment_count: countData ?? 0,
      } as Masterclass;
    })
  );

  return masterclasses;
}

/**
 * Fetch masterclasses created by a specific expert (for their dashboard).
 */
export async function fetchExpertMasterclasses(expertUserId: string): Promise<Masterclass[]> {
  const { data, error } = await supabase
    .from('masterclasses')
    .select('*')
    .eq('expert_id', expertUserId)
    .order('scheduled_at', { ascending: false });

  if (error) {
    console.error('Error fetching expert masterclasses:', error);
    return [];
  }

  return (data || []) as Masterclass[];
}

/**
 * Fetch a single masterclass by ID.
 */
export async function fetchMasterclassById(id: string): Promise<Masterclass | null> {
  const { data, error } = await supabase
    .from('masterclasses')
    .select(`
      *,
      expert_profile:profiles!masterclasses_expert_id_fkey(
        id, display_name, avatar_url, rating, review_count, bio
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  const { data: countData } = await supabase
    .rpc('get_masterclass_enrollment_count', { mc_id: id });

  return { ...data, enrollment_count: countData ?? 0 } as Masterclass;
}

// ============================================================================
// CREATE MASTERCLASS
// ============================================================================

export interface CreateMasterclassInput {
  title: string;
  description: string;
  topic: string;
  scheduled_at: string;
  max_participants: number;
  price_cents: number;
  session_link?: string;
}

/**
 * Create a new masterclass. Only authenticated users can call this.
 */
export async function createMasterclass(input: CreateMasterclassInput): Promise<Masterclass> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('masterclasses')
    .insert({
      ...input,
      expert_id: user.id,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Masterclass;
}

/**
 * Update an existing masterclass (expert only).
 */
export async function updateMasterclass(
  id: string,
  updates: Partial<CreateMasterclassInput>
): Promise<Masterclass> {
  const { data, error } = await supabase
    .from('masterclasses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Masterclass;
}

// ============================================================================
// ENROLLMENT
// ============================================================================

/**
 * Check if the current user is enrolled in a masterclass.
 */
export async function checkEnrollmentStatus(
  masterclassId: string,
  userId: string
): Promise<MasterclassEnrollment | null> {
  const { data } = await supabase
    .from('masterclass_enrollments')
    .select('*')
    .eq('masterclass_id', masterclassId)
    .eq('user_id', userId)
    .maybeSingle();

  return data as MasterclassEnrollment | null;
}

/**
 * Fetch all enrollments for a user (to show their purchased masterclasses).
 */
export async function fetchUserEnrollments(userId: string): Promise<MasterclassEnrollment[]> {
  const { data, error } = await supabase
    .from('masterclass_enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('payment_status', 'paid')
    .order('enrolled_at', { ascending: false });

  if (error) return [];
  return (data || []) as MasterclassEnrollment[];
}

/**
 * Initiate Stripe Checkout by calling the Supabase Edge Function.
 * Returns the Stripe Checkout URL to redirect the user to.
 */
export async function initiateCheckout(
  masterclassId: string,
  userId: string
): Promise<{ url: string; sessionId: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ masterclassId, userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Confirm enrollment after successful Stripe payment.
 * Called on the success page to verify payment status.
 */
export async function confirmEnrollmentBySession(
  stripeSessionId: string,
  masterclassId: string,
  userId: string
): Promise<MasterclassEnrollment | null> {
  // Poll for up to 10 seconds for the webhook to process
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from('masterclass_enrollments')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .eq('masterclass_id', masterclassId)
      .eq('user_id', userId)
      .maybeSingle();

    if (data?.payment_status === 'paid') {
      return data as MasterclassEnrollment;
    }

    // Wait 2 seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return null;
}

// ============================================================================
// SESSION SUMMARIES
// ============================================================================

/**
 * Fetch an existing session summary from the database.
 */
export async function fetchSessionSummary(sessionId: string): Promise<SessionSummary | null> {
  const { data, error } = await supabase
    .from('session_summaries')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error || !data) return null;
  return data as SessionSummary;
}

/**
 * Generate an AI session summary by calling the Supabase Edge Function.
 * The Edge Function calls Claude and stores the result in the DB.
 */
export async function generateSessionSummary(params: {
  sessionId: string;
  sessionType: 'exchange' | 'masterclass';
  sessionTitle: string;
  sessionTopic: string;
  expertName: string;
  learnerName: string;
  durationMinutes: number;
  sessionNotes?: string;
}): Promise<{ summary: AISummaryContent; saved: boolean; id?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-session-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate summary');
  }

  return response.json();
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Format price from cents to a display string (e.g. 2999 → "$29.99")
 */
export function formatPrice(priceCents: number): string {
  if (priceCents === 0) return 'Free';
  return `$${(priceCents / 100).toFixed(2)}`;
}

/**
 * Calculate spots remaining for a masterclass.
 */
export function getSpotsRemaining(masterclass: Masterclass): number {
  return masterclass.max_participants - (masterclass.enrollment_count ?? 0);
}

/**
 * Check if a masterclass is sold out.
 */
export function isSoldOut(masterclass: Masterclass): boolean {
  return getSpotsRemaining(masterclass) <= 0;
}
