/**
 * Supabase Edge Function: create-checkout-session
 *
 * Creates a Stripe Checkout session for a masterclass enrollment.
 * Called from the client when a user clicks "Join / Buy" on a masterclass.
 *
 * Environment variables required (set in Supabase dashboard):
 *   STRIPE_SECRET_KEY
 *   SITE_URL (e.g. https://yourdomain.com)
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { masterclassId, userId } = await req.json();

    if (!masterclassId || !userId) {
      return new Response(
        JSON.stringify({ error: 'masterclassId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the masterclass details
    const { data: masterclass, error: mcError } = await supabaseAdmin
      .from('masterclasses')
      .select('*')
      .eq('id', masterclassId)
      .single();

    if (mcError || !masterclass) {
      return new Response(
        JSON.stringify({ error: 'Masterclass not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabaseAdmin
      .from('masterclass_enrollments')
      .select('id, payment_status')
      .eq('masterclass_id', masterclassId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingEnrollment?.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Already enrolled in this masterclass' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check spots availability
    const { data: enrollmentCount } = await supabaseAdmin
      .rpc('get_masterclass_enrollment_count', { mc_id: masterclassId });

    if (enrollmentCount >= masterclass.max_participants) {
      return new Response(
        JSON.stringify({ error: 'No spots available' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    });

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: masterclass.title,
              description: masterclass.description || `Live masterclass on ${masterclass.topic}`,
              metadata: {
                masterclass_id: masterclassId,
              },
            },
            unit_amount: masterclass.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}?page=masterclass-success&session_id={CHECKOUT_SESSION_ID}&masterclass_id=${masterclassId}`,
      cancel_url: `${siteUrl}?page=masterclasses`,
      metadata: {
        masterclass_id: masterclassId,
        user_id: userId,
      },
    });

    // Create a pending enrollment record
    await supabaseAdmin.from('masterclass_enrollments').upsert({
      masterclass_id: masterclassId,
      user_id: userId,
      stripe_session_id: session.id,
      payment_status: 'pending',
    }, { onConflict: 'masterclass_id,user_id' });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
