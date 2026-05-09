/**
 * Supabase Edge Function: stripe-webhook
 *
 * Handles Stripe webhook events to confirm payments and grant access.
 * Register this URL in your Stripe dashboard as a webhook endpoint.
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2024-06-20',
  });

  let event: Stripe.Event;

  try {
    // Verify the webhook signature to ensure it came from Stripe
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Initialize Supabase admin client (service role bypasses RLS)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const masterclassId = session.metadata?.masterclass_id;
    const userId = session.metadata?.user_id;
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? '';

    if (!masterclassId || !userId) {
      console.error('Missing metadata in checkout session:', session.id);
      return new Response('Missing metadata', { status: 400 });
    }

    // Update enrollment to paid status and store payment intent ID
    const { error } = await supabaseAdmin
      .from('masterclass_enrollments')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
        stripe_session_id: session.id,
      })
      .eq('masterclass_id', masterclassId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating enrollment:', error);
      return new Response('Database error', { status: 500 });
    }

    console.log(`✅ Enrollment confirmed for user ${userId} in masterclass ${masterclassId}`);
  }

  // Handle payment_intent.payment_failed
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const masterclassId = paymentIntent.metadata?.masterclass_id;
    const userId = paymentIntent.metadata?.user_id;

    if (masterclassId && userId) {
      await supabaseAdmin
        .from('masterclass_enrollments')
        .update({ payment_status: 'failed' })
        .eq('masterclass_id', masterclassId)
        .eq('user_id', userId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
