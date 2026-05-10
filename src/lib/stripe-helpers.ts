/**
 * stripe-helpers.ts
 *
 * Stripe integration for masterclass payments
 */

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { Masterclass, MasterclassEnrollment } from '../types';

// Initialize Stripe with your publishable key
// In production, use environment variables
const stripePromise = loadStripe('pk_test_5123456789012345678901234'); // Test key

export interface StripeCheckoutInput {
  masterclassId: string;
  userId: string;
  priceCents: number;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout session for masterclass enrollment
 */
export async function createStripeCheckout(input: StripeCheckoutInput) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      masterclass_id: input.masterclassId,
      user_id: input.userId,
      price_cents: input.priceCents,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToStripeCheckout(sessionId: string) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw error;
  }
}

/**
 * Check if user is enrolled in a masterclass
 */
export async function checkEnrollmentStatus(
  masterclassId: string,
  userId: string
): Promise<{ isEnrolled: boolean; enrollment?: MasterclassEnrollment }> {
  const { data, error } = await supabase
    .from('masterclass_enrollments')
    .select('*')
    .eq('masterclass_id', masterclassId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking enrollment status:', error);
    return { isEnrolled: false };
  }

  return {
    isEnrolled: !!data,
    enrollment: data || undefined,
  };
}

/**
 * Get all enrollments for a user
 */
export async function getUserEnrollments(userId: string): Promise<MasterclassEnrollment[]> {
  const { data, error } = await supabase
    .from('masterclass_enrollments')
    .select(`
      *,
      masterclass:masterclasses(
        id,
        title,
        description,
        scheduled_at,
        status,
        session_link
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    console.error('Error fetching user enrollments:', error);
    return [];
  }

  return data as MasterclassEnrollment[];
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Get Stripe publishable key
 */
export function getStripePublishableKey(): string {
  // In production, use environment variable
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_5123456789012345678901234';
}
