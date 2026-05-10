-- ============================================================================
-- STRIPE INTEGRATION FOR MASTERCLASS PAYMENTS
-- ============================================================================

-- Add webhook processing function for Stripe
CREATE OR REPLACE FUNCTION process_stripe_webhook(
  webhook_data jsonb
)
RETURNS void AS $$
DECLARE
  event_type text;
  payment_intent_id text;
  session_id text;
  customer_email text;
  amount_cents integer;
  masterclass_id uuid;
  user_id uuid;
BEGIN
  -- Extract event type
  event_type := webhook_data->>'type';
  
  -- Only process checkout.session.completed events
  IF event_type = 'checkout.session.completed' THEN
    -- Extract session data
    session_id := webhook_data->'data'->'object'->>'id';
    payment_intent_id := webhook_data->'data'->'object'->>'payment_intent';
    customer_email := webhook_data->'data'->'object'->>'customer_details'->>'email';
    amount_cents := (webhook_data->'data'->'object'->>'amount_total')::integer;
    
    -- Extract metadata (masterclass_id and user_id should be stored in metadata)
    masterclass_id := webhook_data->'data'->'object'->'metadata'->>'masterclass_id'::uuid;
    user_id := webhook_data->'data'->'object'->'metadata'->>'user_id'::uuid;
    
    -- Create or update enrollment
    INSERT INTO masterclass_enrollments (
      masterclass_id,
      user_id,
      stripe_payment_intent_id,
      stripe_session_id,
      payment_status
    ) VALUES (
      masterclass_id,
      user_id,
      payment_intent_id,
      session_id,
      'paid'
    ) ON CONFLICT (masterclass_id, user_id) 
    DO UPDATE SET 
      stripe_payment_intent_id = payment_intent_id,
      stripe_session_id = session_id,
      payment_status = 'paid';
      
    -- Create notification for successful enrollment
    INSERT INTO notifications (
      user_id,
      message,
      exchange_id
    ) VALUES (
      user_id,
      'Payment successful! You are now enrolled in the masterclass.',
      NULL
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check enrollment status
CREATE OR REPLACE FUNCTION check_enrollment_status(
  p_masterclass_id uuid,
  p_user_id uuid
)
RETURNS TABLE (
  is_enrolled boolean,
  payment_status text,
  enrolled_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_enrolled,
    payment_status,
    enrolled_at
  FROM masterclass_enrollments
  WHERE masterclass_id = p_masterclass_id
    AND user_id = p_user_id;
  
  -- If no enrollment found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
