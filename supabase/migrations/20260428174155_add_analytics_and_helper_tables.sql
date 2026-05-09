
/*
  # Analytics and Helper Tables

  This migration adds tables for tracking platform activity, user stats, and
  provides helper functions for common queries and operations.

  Tables:
  - exchange_stats (aggregate statistics for exchanges)
  - user_activity_log (audit trail of user actions)
  - featured_profiles (curated list of top experts)
*/

-- ============================================================================
-- EXCHANGE STATS (Denormalized for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS exchange_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_exchanges integer DEFAULT 0,
  completed_exchanges integer DEFAULT 0,
  pending_exchanges integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  positive_reviews integer DEFAULT 0,
  negative_reviews integer DEFAULT 0,
  response_time_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exchange_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exchange stats"
  ON exchange_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_exchange_stats_profile_id ON exchange_stats(profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_stats_completed_exchanges ON exchange_stats(completed_exchanges DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_stats_average_rating ON exchange_stats(average_rating DESC);

-- ============================================================================
-- USER ACTIVITY LOG (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- ============================================================================
-- FEATURED PROFILES (Curation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS featured_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  featured_reason text NOT NULL,
  featured_until timestamptz NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE featured_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view featured profiles"
  ON featured_profiles FOR SELECT
  TO anon, authenticated
  USING (featured_until > now());

CREATE INDEX IF NOT EXISTS idx_featured_profiles_profile_id ON featured_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_featured_profiles_featured_until ON featured_profiles(featured_until DESC);
CREATE INDEX IF NOT EXISTS idx_featured_profiles_display_order ON featured_profiles(display_order);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get profile with enriched data
CREATE OR REPLACE FUNCTION get_profile_with_stats(profile_id uuid)
RETURNS TABLE (
  profile_data jsonb,
  stats_data jsonb,
  demo_count bigint,
  endorsement_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    row_to_json(p.*)::jsonb as profile_data,
    row_to_json(es.*)::jsonb as stats_data,
    COUNT(DISTINCT kd.id)::bigint as demo_count,
    COUNT(DISTINCT se.id)::bigint as endorsement_count
  FROM profiles p
  LEFT JOIN exchange_stats es ON es.profile_id = p.id
  LEFT JOIN knowledge_demos kd ON kd.profile_id = p.id AND kd.is_published = true
  LEFT JOIN skill_endorsements se ON se.endorsee_profile_id = p.id
  WHERE p.id = $1
  GROUP BY p.id, es.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to calculate rating and update profile
CREATE OR REPLACE FUNCTION recalculate_profile_rating(profile_id uuid)
RETURNS numeric AS $$
DECLARE
  new_rating numeric(3,2);
  review_count integer;
BEGIN
  SELECT
    AVG(rating)::numeric(3,2) as avg_rating,
    COUNT(*)::integer as count
  INTO new_rating, review_count
  FROM reviews
  WHERE reviewee_profile_id = $1;

  -- Set defaults if no reviews
  new_rating := COALESCE(new_rating, 0);
  review_count := COALESCE(review_count, 0);

  -- Update profile
  UPDATE profiles
  SET rating = new_rating, review_count = review_count
  WHERE id = $1;

  RETURN new_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended experts based on skills
CREATE OR REPLACE FUNCTION get_recommended_experts(
  learning_skill text,
  limit_count integer DEFAULT 10,
  exclude_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  teaching_skills text[],
  rating numeric(3,2),
  exchange_count integer,
  is_available boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    p.teaching_skills,
    p.rating,
    p.exchange_count,
    p.is_available
  FROM profiles p
  WHERE
    p.is_available = true
    AND p.is_demo = false
    AND (exclude_user_id IS NULL OR p.user_id != exclude_user_id)
    AND p.teaching_skills @> ARRAY[learning_skill]
  ORDER BY p.rating DESC, p.exchange_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to search profiles by multiple criteria
CREATE OR REPLACE FUNCTION search_profiles(
  search_query text DEFAULT '',
  category_filter text DEFAULT '',
  verify_only boolean DEFAULT false,
  available_only boolean DEFAULT false,
  min_rating numeric DEFAULT 0,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  location text,
  rating numeric(3,2),
  teaching_skills text[],
  learning_skills text[],
  video_verified boolean,
  is_available boolean,
  exchange_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.location,
    p.rating,
    p.teaching_skills,
    p.learning_skills,
    p.video_verified,
    p.is_available,
    p.exchange_count
  FROM profiles p
  WHERE
    (search_query = '' OR
     p.display_name ILIKE '%' || search_query || '%' OR
     p.username ILIKE '%' || search_query || '%' OR
     p.bio ILIKE '%' || search_query || '%' OR
     p.location ILIKE '%' || search_query || '%' OR
     p.teaching_skills @> ARRAY[search_query] OR
     p.learning_skills @> ARRAY[search_query])
    AND (verify_only = false OR p.video_verified = true)
    AND (available_only = false OR p.is_available = true)
    AND p.rating >= min_rating
    AND p.is_demo = false
  ORDER BY p.rating DESC, p.exchange_count DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's exchange history
CREATE OR REPLACE FUNCTION get_user_exchange_history(user_id uuid, limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  exchange_date timestamptz,
  other_user_name text,
  other_user_avatar text,
  requester_skill text,
  provider_skill text,
  status text,
  rating_given integer,
  rating_received integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    er.id,
    er.created_at,
    CASE
      WHEN er.requester_id = $1 THEN rp.display_name
      ELSE rp2.display_name
    END as other_user_name,
    CASE
      WHEN er.requester_id = $1 THEN rp.avatar_url
      ELSE rp2.avatar_url
    END as other_user_avatar,
    er.requester_skill,
    er.provider_skill,
    er.status,
    (SELECT rating FROM reviews WHERE exchange_id = er.id AND reviewer_id = $1 LIMIT 1)::integer,
    (SELECT rating FROM reviews WHERE exchange_id = er.id AND reviewer_id != $1 LIMIT 1)::integer
  FROM exchange_requests er
  JOIN profiles rp ON er.requester_profile_id = rp.id
  JOIN profiles rp2 ON er.provider_profile_id = rp2.id
  WHERE er.requester_id = $1 OR er.provider_id = $1
  ORDER BY er.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if two users can exchange
CREATE OR REPLACE FUNCTION can_users_exchange(user_1_id uuid, user_2_id uuid)
RETURNS TABLE (
  can_exchange boolean,
  reason text
) AS $$
DECLARE
  p1 profiles%ROWTYPE;
  p2 profiles%ROWTYPE;
  recent_exchanges integer;
BEGIN
  SELECT * INTO p1 FROM profiles WHERE user_id = user_1_id;
  SELECT * INTO p2 FROM profiles WHERE user_id = user_2_id;

  IF p1 IS NULL OR p2 IS NULL THEN
    RETURN QUERY SELECT false::boolean, 'One or both profiles do not exist'::text;
  ELSIF p1.is_available = false OR p2.is_available = false THEN
    RETURN QUERY SELECT false::boolean, 'One or both users are not available'::text;
  ELSE
    SELECT COUNT(*) INTO recent_exchanges
    FROM exchange_requests
    WHERE (requester_id = user_1_id AND provider_id = user_2_id)
       OR (requester_id = user_2_id AND provider_id = user_1_id)
    AND status = 'pending'
    AND created_at > now() - interval '7 days';

    IF recent_exchanges > 0 THEN
      RETURN QUERY SELECT false::boolean, 'Recent pending exchange exists'::text;
    ELSE
      RETURN QUERY SELECT true::boolean, ''::text;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get dashboard stats for a user
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id uuid)
RETURNS TABLE (
  total_exchanges integer,
  pending_exchanges integer,
  completed_exchanges integer,
  average_rating numeric(3,2),
  total_reviews integer,
  demos_published integer,
  skills_taught text[],
  skills_learning text[],
  response_rate integer,
  new_notifications integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT exchange_count FROM profiles WHERE user_id = $1), 0)::integer,
    COALESCE((SELECT COUNT(*)::integer FROM exchange_requests WHERE (requester_id = $1 OR provider_id = $1) AND status = 'pending'), 0)::integer,
    COALESCE((SELECT COUNT(*)::integer FROM exchange_requests WHERE (requester_id = $1 OR provider_id = $1) AND status = 'completed'), 0)::integer,
    COALESCE((SELECT rating FROM profiles WHERE user_id = $1), 0)::numeric(3,2),
    COALESCE((SELECT review_count FROM profiles WHERE user_id = $1), 0)::integer,
    COALESCE((SELECT COUNT(*)::integer FROM knowledge_demos WHERE user_id = $1 AND is_published = true), 0)::integer,
    COALESCE((SELECT teaching_skills FROM profiles WHERE user_id = $1), '{}'::text[]),
    COALESCE((SELECT learning_skills FROM profiles WHERE user_id = $1), '{}'::text[]),
    COALESCE((SELECT response_rate FROM profiles WHERE user_id = $1), 100)::integer,
    COALESCE((SELECT COUNT(*)::integer FROM notifications WHERE user_id = $1 AND is_read = false), 0)::integer;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update exchange_stats when exchanges are completed
CREATE OR REPLACE FUNCTION update_exchange_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO exchange_stats (profile_id, completed_exchanges)
    VALUES (NEW.requester_profile_id, 1)
    ON CONFLICT (profile_id) DO UPDATE
    SET completed_exchanges = completed_exchanges + 1,
        updated_at = now();

    INSERT INTO exchange_stats (profile_id, completed_exchanges)
    VALUES (NEW.provider_profile_id, 1)
    ON CONFLICT (profile_id) DO UPDATE
    SET completed_exchanges = completed_exchanges + 1,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_exchange_stats_on_completion ON exchange_requests;
CREATE TRIGGER trigger_update_exchange_stats_on_completion
  AFTER UPDATE ON exchange_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_stats_on_completion();

-- Function to update exchange_stats when updated_at changes
CREATE OR REPLACE FUNCTION update_exchange_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE exchange_stats SET updated_at = now() WHERE profile_id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_exchange_stats_timestamp ON exchange_stats;
CREATE TRIGGER trigger_update_exchange_stats_timestamp
  AFTER UPDATE ON exchange_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_stats_timestamp();
