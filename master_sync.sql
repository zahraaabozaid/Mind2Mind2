-- ============================================================================
-- MIND2MIND — MASTER DATABASE SYNCHRONIZATION SCRIPT
-- ============================================================================
-- Generated: 2026-05-10
--
-- PURPOSE:  Merge the existing schema, teammate's update files, and
--           AI-generated SQL into ONE idempotent script.
--           Safe to run in the Supabase SQL Editor — will not destroy data.
--
-- SECTIONS:
--   1. Extensions
--   2. Admin Isolation Logic
--   3. Skill Categories (table + seed data)
--   4. Profiles
--   5. Knowledge Demos
--   6. Demo Likes (NEW — referenced by app code)
--   7. Follow System
--   8. Project Ideas
--   9. Exchange Requests (merged: exchanges → exchange_requests + backward-compat view)
--  10. Exchange Messages (NEW — referenced by app code)
--  11. Notifications (merged: keeps original columns + adds exchange_id)
--  12. Reviews & Rating System (from fix_rating_system.sql)
--  13. Masterclasses + Enrollments (merged with Stripe integration)
--  14. Session Summaries
--  15. Admin Suite (support_tickets, coupons)
--  16. Triggers & Functions
--  17. Storage Buckets & Policies
--  18. Realtime Publications
--  19. Performance Indexes
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- 2. ADMIN ISOLATION LOGIC
-- ============================================================================
-- Central function used by RLS policies to gate admin-only actions.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'mohamedhosamm81@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 3. SKILL CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text UNIQUE NOT NULL,
  icon        text DEFAULT 'Zap',
  color       text DEFAULT 'teal',
  description text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories readable by all" ON skill_categories;
CREATE POLICY "Categories readable by all"
  ON skill_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON skill_categories;
CREATE POLICY "Admin manage categories"
  ON skill_categories FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Seed standard categories (idempotent)
INSERT INTO skill_categories (name, icon, color) VALUES
  ('Technology',  'Code',       'teal'),
  ('Design',      'Palette',    'indigo'),
  ('Language',    'Languages',  'blue'),
  ('Music',       'Music',      'amber'),
  ('Fitness',     'Dumbbell',   'red'),
  ('Cooking',     'Utensils',   'orange'),
  ('Business',    'Briefcase',  'slate'),
  ('Arts',        'Brush',      'pink')
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- 4. PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username               text UNIQUE NOT NULL,
  display_name           text NOT NULL DEFAULT '',
  bio                    text DEFAULT '',
  avatar_url             text DEFAULT '',
  cover_url              text DEFAULT '',
  location               text DEFAULT '',
  category               text DEFAULT 'General',
  teaching_skills        text[] DEFAULT '{}',
  learning_skills        text[] DEFAULT '{}',
  languages              text[] DEFAULT '{}',
  video_verified         boolean DEFAULT false,
  verification_video_url text DEFAULT '',
  rating                 numeric(3,2) DEFAULT 5.0,
  review_count           integer DEFAULT 0,
  exchange_count         integer DEFAULT 0,
  follower_count         integer DEFAULT 0,
  following_count        integer DEFAULT 0,
  response_rate          integer DEFAULT 100,
  is_available           boolean DEFAULT true,
  is_demo                boolean DEFAULT false,
  member_since           timestamptz DEFAULT now(),
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- Safely add columns that may not exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='follower_count') THEN
    ALTER TABLE profiles ADD COLUMN follower_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='following_count') THEN
    ALTER TABLE profiles ADD COLUMN following_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='category') THEN
    ALTER TABLE profiles ADD COLUMN category text DEFAULT 'General';
  END IF;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles readable by all" ON profiles;
CREATE POLICY "Profiles readable by all"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users/Admin update profile" ON profiles;
CREATE POLICY "Users/Admin update profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admin delete profile" ON profiles;
CREATE POLICY "Admin delete profile"
  ON profiles FOR DELETE USING (is_admin());


-- ============================================================================
-- 5. KNOWLEDGE DEMOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS demos (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL DEFAULT '',
  description   text DEFAULT '',
  file_url      text NOT NULL,
  file_type     text NOT NULL CHECK (file_type IN ('video', 'pdf')),
  category      text DEFAULT 'General',
  visibility    text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'custom')),
  allowed_users text[] DEFAULT '{}',
  skill_name    text DEFAULT '',
  views         integer DEFAULT 0,
  likes         integer DEFAULT 0,
  is_published  boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demos' AND column_name='is_published') THEN
    ALTER TABLE demos ADD COLUMN is_published boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demos' AND column_name='views') THEN
    ALTER TABLE demos ADD COLUMN views integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demos' AND column_name='likes') THEN
    ALTER TABLE demos ADD COLUMN likes integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demos' AND column_name='category') THEN
    ALTER TABLE demos ADD COLUMN category text DEFAULT 'General';
  END IF;
END $$;

ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demos visibility logic" ON demos;
CREATE POLICY "Demos visibility logic"
  ON demos FOR SELECT
  USING (is_published = true AND (visibility = 'public' OR auth.uid() = user_id OR is_admin()));

DROP POLICY IF EXISTS "Owner manage demos" ON demos;
CREATE POLICY "Owner manage demos"
  ON demos FOR ALL TO authenticated
  USING (auth.uid() = user_id OR is_admin());


-- ============================================================================
-- 6. DEMO LIKES  (NEW — used by hooks.ts & demo-helpers.ts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS demo_likes (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id    uuid REFERENCES demos(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(demo_id, user_id)
);

ALTER TABLE demo_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo likes readable by all" ON demo_likes;
CREATE POLICY "Demo likes readable by all"
  ON demo_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own likes" ON demo_likes;
CREATE POLICY "Users manage own likes"
  ON demo_likes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 7. FOLLOW SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS followers (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Followers readable by all" ON followers;
CREATE POLICY "Followers readable by all"
  ON followers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own following" ON followers;
CREATE POLICY "Users manage own following"
  ON followers FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = follower_id AND profiles.user_id = auth.uid()
  ));


-- ============================================================================
-- 8. PROJECT IDEAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ideas (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  description text NOT NULL,
  category    text NOT NULL,
  budget      numeric DEFAULT 0,
  tags        text[] DEFAULT '{}',
  status      text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged')),
  is_featured boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved ideas readable by all" ON ideas;
CREATE POLICY "Approved ideas readable by all"
  ON ideas FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users post ideas" ON ideas;
CREATE POLICY "Users post ideas"
  ON ideas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owner/Admin manage ideas" ON ideas;
CREATE POLICY "Owner/Admin manage ideas"
  ON ideas FOR ALL TO authenticated
  USING (auth.uid() = user_id OR is_admin());


-- ============================================================================
-- 9. EXCHANGE REQUESTS
-- ============================================================================
-- CONFLICT RESOLUTION:
--   • Original schema created table "exchanges" with sender_id / receiver_id /
--     skill_requested / skill_offered columns.
--   • Teammate update (fix_exchange_requests.sql) renames "exchanges" → "exchange_requests"
--     and adds requester_profile_id / provider_profile_id.
--   • App code uses BOTH naming conventions across different files:
--       – ExchangeModal.tsx & hooks.ts:  "exchange_requests" table with
--           requester_id, provider_id, requester_skill, provider_skill
--       – ExchangeRequestsPage.tsx:      "exchange_requests" table with
--           sender_id, receiver_id, skill_offered, skill_requested
--       – db-helpers.ts & HeroSection.tsx: "exchanges" table
--
-- SOLUTION:
--   1. Create "exchange_requests" as the canonical table with ALL column variants.
--   2. Create a VIEW named "exchanges" for backward compatibility with db-helpers/HeroSection.
--   3. Both naming conventions for user IDs and skills co-exist as separate columns.
--      The app can write to whichever it uses; both will be stored.
-- ============================================================================

-- Step A: If the old "exchanges" TABLE exists, rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'exchanges' AND table_type = 'BASE TABLE'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'exchange_requests'
  ) THEN
    ALTER TABLE exchanges RENAME TO exchange_requests;
  END IF;
END $$;

-- Step B: Create the table if it does not exist yet (fresh install)
CREATE TABLE IF NOT EXISTS exchange_requests (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Auth-user references (two naming conventions used by different code paths)
  sender_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile references (used by ExchangeModal & db-helpers)
  requester_profile_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  provider_profile_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Skill columns (two naming conventions)
  skill_requested       text DEFAULT '',
  skill_offered         text DEFAULT '',
  requester_skill       text DEFAULT '',
  provider_skill        text DEFAULT '',

  message               text DEFAULT '',
  status                text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'accepted', 'rejected', 'declined', 'completed', 'cancelled')),
  rejection_reason      text DEFAULT '',
  notes                 text DEFAULT '',
  scheduled_date        timestamptz,

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Step C-0: Drop NOT NULL constraints inherited from the old "exchanges" table.
-- The old schema had sender_id/receiver_id NOT NULL, but the app's ExchangeModal
-- only populates requester_id/provider_id, causing insert failures.
DO $$
BEGIN
  ALTER TABLE exchange_requests ALTER COLUMN sender_id   DROP NOT NULL;
  ALTER TABLE exchange_requests ALTER COLUMN receiver_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Also ensure skill columns from old schema are nullable
DO $$
BEGIN
  ALTER TABLE exchange_requests ALTER COLUMN skill_requested DROP NOT NULL;
  ALTER TABLE exchange_requests ALTER COLUMN skill_offered   DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Step C: Safely add any columns that the rename path might be missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='sender_id') THEN
    ALTER TABLE exchange_requests ADD COLUMN sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='receiver_id') THEN
    ALTER TABLE exchange_requests ADD COLUMN receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='requester_id') THEN
    ALTER TABLE exchange_requests ADD COLUMN requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='provider_id') THEN
    ALTER TABLE exchange_requests ADD COLUMN provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='requester_profile_id') THEN
    ALTER TABLE exchange_requests ADD COLUMN requester_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='provider_profile_id') THEN
    ALTER TABLE exchange_requests ADD COLUMN provider_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='skill_requested') THEN
    ALTER TABLE exchange_requests ADD COLUMN skill_requested text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='skill_offered') THEN
    ALTER TABLE exchange_requests ADD COLUMN skill_offered text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='requester_skill') THEN
    ALTER TABLE exchange_requests ADD COLUMN requester_skill text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='provider_skill') THEN
    ALTER TABLE exchange_requests ADD COLUMN provider_skill text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='rejection_reason') THEN
    ALTER TABLE exchange_requests ADD COLUMN rejection_reason text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='notes') THEN
    ALTER TABLE exchange_requests ADD COLUMN notes text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exchange_requests' AND column_name='scheduled_date') THEN
    ALTER TABLE exchange_requests ADD COLUMN scheduled_date timestamptz;
  END IF;
END $$;

ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;

-- RLS: participants + admin can view
DROP POLICY IF EXISTS "Participants/Admin view exchanges" ON exchange_requests;
DROP POLICY IF EXISTS "Participants/Admin view exchange_requests" ON exchange_requests;
CREATE POLICY "Participants/Admin view exchange_requests"
  ON exchange_requests FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR auth.uid() = requester_id
    OR auth.uid() = provider_id
    OR is_admin()
  );

-- RLS: authenticated users can create exchange requests
DROP POLICY IF EXISTS "Sender create exchanges" ON exchange_requests;
DROP POLICY IF EXISTS "Auth create exchange_requests" ON exchange_requests;
CREATE POLICY "Auth create exchange_requests"
  ON exchange_requests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    OR auth.uid() = requester_id
    OR auth.uid() IS NOT NULL
  );

-- RLS: participants can update their own exchange requests
DROP POLICY IF EXISTS "Participants update exchanges" ON exchange_requests;
DROP POLICY IF EXISTS "Participants update exchange_requests" ON exchange_requests;
CREATE POLICY "Participants update exchange_requests"
  ON exchange_requests FOR UPDATE
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR auth.uid() = requester_id
    OR auth.uid() = provider_id
    OR is_admin()
  );

-- Step D: Create backward-compatible VIEW "exchanges" for db-helpers.ts & HeroSection.tsx
-- Drop existing view first (if any); if "exchanges" is still a table, skip
DO $$
BEGIN
  -- Only create the view if "exchanges" does not exist as a base table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'exchanges' AND table_type = 'BASE TABLE'
  ) THEN
    DROP VIEW IF EXISTS exchanges;
    CREATE VIEW exchanges AS SELECT * FROM exchange_requests;
  END IF;
END $$;


-- ============================================================================
-- 10. EXCHANGE MESSAGES  (NEW — used by db-helpers.ts & hooks.ts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS exchange_messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_id uuid REFERENCES exchange_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE exchange_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exchange participants can view messages" ON exchange_messages;
CREATE POLICY "Exchange participants can view messages"
  ON exchange_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exchange_requests er
      WHERE er.id = exchange_id
      AND (
        auth.uid() = er.sender_id
        OR auth.uid() = er.receiver_id
        OR auth.uid() = er.requester_id
        OR auth.uid() = er.provider_id
      )
    )
  );

DROP POLICY IF EXISTS "Exchange participants can send messages" ON exchange_messages;
CREATE POLICY "Exchange participants can send messages"
  ON exchange_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM exchange_requests er
      WHERE er.id = exchange_id
      AND (
        auth.uid() = er.sender_id
        OR auth.uid() = er.receiver_id
        OR auth.uid() = er.requester_id
        OR auth.uid() = er.provider_id
      )
    )
  );


-- ============================================================================
-- 11. NOTIFICATIONS  (MERGED)
-- ============================================================================
-- CONFLICT RESOLUTION:
--   • Original schema has: type, title, message, related_id, is_read
--   • fix_notifications.sql drops type, title, related_id and adds exchange_id
--   • App code STILL uses type, title, related_id in several places
--     (ExchangeModal.tsx, db-helpers.ts) while ExchangeRequestsPage.tsx uses
--     exchange_id.
--
-- SOLUTION: Keep ALL original columns AND add exchange_id. Nothing is dropped.
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        text DEFAULT 'general',
  title       text DEFAULT '',
  message     text NOT NULL,
  related_id  uuid,
  exchange_id uuid,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Safely add exchange_id if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='exchange_id') THEN
    ALTER TABLE notifications ADD COLUMN exchange_id uuid;
  END IF;
  -- Ensure type, title, related_id still exist (in case fix_notifications.sql was run before)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
    ALTER TABLE notifications ADD COLUMN type text DEFAULT 'general';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='title') THEN
    ALTER TABLE notifications ADD COLUMN title text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_id') THEN
    ALTER TABLE notifications ADD COLUMN related_id uuid;
  END IF;
END $$;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "System insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);


-- ============================================================================
-- 12. REVIEWS & RATING SYSTEM  (from fix_rating_system.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_id          uuid NOT NULL,
  reviewer_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating               integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment              text DEFAULT '',
  helpful_count        integer DEFAULT 0,
  created_at           timestamptz DEFAULT now()
);

-- Add FK to exchange_requests if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_exchange_id_fkey'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_exchange_id_fkey
      FOREIGN KEY (exchange_id) REFERENCES exchange_requests(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are publicly readable" ON reviews;
CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Function: recalculate a profile's average rating from reviews
CREATE OR REPLACE FUNCTION recalculate_profile_rating(p_profile_id uuid)
RETURNS void AS $$
DECLARE
  v_avg_rating  numeric;
  v_review_count integer;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM reviews
  WHERE reviewee_profile_id = p_profile_id;

  UPDATE profiles
  SET rating       = v_avg_rating,
      review_count = v_review_count
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 13. MASTERCLASSES + ENROLLMENTS  (MERGED with fix_masterclass_display.sql
--     and fix_stripe_integration.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS masterclasses (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title            text NOT NULL,
  description      text NOT NULL,
  topic            text NOT NULL,
  scheduled_at     timestamptz NOT NULL,
  max_participants integer NOT NULL DEFAULT 20,
  price_cents      integer NOT NULL DEFAULT 0,
  session_link     text,
  status           text NOT NULL DEFAULT 'upcoming'
                   CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;

-- Public can see upcoming/live masterclasses; experts see their own; admin sees all
DROP POLICY IF EXISTS "Public view masterclasses" ON masterclasses;
CREATE POLICY "Public view masterclasses"
  ON masterclasses FOR SELECT
  USING (status IN ('upcoming', 'live') OR expert_id = auth.uid() OR is_admin());

-- Experts manage their own masterclasses
DROP POLICY IF EXISTS "Experts manage own masterclasses" ON masterclasses;
CREATE POLICY "Experts manage own masterclasses"
  ON masterclasses FOR ALL TO authenticated
  USING (expert_id = auth.uid() OR is_admin());

-- INSERT policy from fix_masterclass_display.sql
DROP POLICY IF EXISTS "Authenticated users can create masterclasses" ON masterclasses;
CREATE POLICY "Authenticated users can create masterclasses"
  ON masterclasses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = expert_id);

-- Function: check if user can create masterclass (extensible for premium logic)
CREATE OR REPLACE FUNCTION can_create_masterclass()
RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-set expert_id on INSERT (from fix_masterclass_display.sql)
CREATE OR REPLACE FUNCTION set_masterclass_expert_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expert_id IS NULL OR NEW.expert_id != auth.uid() THEN
    NEW.expert_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_masterclass_expert_id ON masterclasses;
CREATE TRIGGER trigger_set_masterclass_expert_id
  BEFORE INSERT ON masterclasses
  FOR EACH ROW
  EXECUTE FUNCTION set_masterclass_expert_id();

-- Enrollment table (merged: adds stripe_payment_intent_id from fix_stripe_integration.sql)
CREATE TABLE IF NOT EXISTS masterclass_enrollments (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  masterclass_id           uuid REFERENCES masterclasses(id) ON DELETE CASCADE NOT NULL,
  user_id                  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_status           text NOT NULL DEFAULT 'pending'
                           CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_session_id        text,
  stripe_payment_intent_id text,
  enrolled_at              timestamptz DEFAULT now(),
  UNIQUE(masterclass_id, user_id)
);

-- Add stripe_payment_intent_id if table existed without it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='masterclass_enrollments' AND column_name='stripe_payment_intent_id') THEN
    ALTER TABLE masterclass_enrollments ADD COLUMN stripe_payment_intent_id text;
  END IF;
END $$;

ALTER TABLE masterclass_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own enrollments" ON masterclass_enrollments;
CREATE POLICY "Users view own enrollments"
  ON masterclass_enrollments FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Users can enroll" ON masterclass_enrollments;
CREATE POLICY "Users can enroll"
  ON masterclass_enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System update enrollments" ON masterclass_enrollments;
CREATE POLICY "System update enrollments"
  ON masterclass_enrollments FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- RPC: enrollment counter
CREATE OR REPLACE FUNCTION get_masterclass_enrollment_count(mc_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM masterclass_enrollments
    WHERE masterclass_id = mc_id AND payment_status = 'paid'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: check enrollment status (from fix_stripe_integration.sql)
CREATE OR REPLACE FUNCTION check_enrollment_status(
  p_masterclass_id uuid,
  p_user_id uuid
)
RETURNS TABLE (
  is_enrolled    boolean,
  payment_status text,
  enrolled_at    timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    true AS is_enrolled,
    me.payment_status,
    me.enrolled_at
  FROM masterclass_enrollments me
  WHERE me.masterclass_id = p_masterclass_id
    AND me.user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false::boolean, NULL::text, NULL::timestamptz;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stripe webhook processor (from fix_stripe_integration.sql)
CREATE OR REPLACE FUNCTION process_stripe_webhook(webhook_data jsonb)
RETURNS void AS $$
DECLARE
  v_event_type        text;
  v_payment_intent_id text;
  v_session_id        text;
  v_masterclass_id    uuid;
  v_user_id           uuid;
BEGIN
  v_event_type := webhook_data->>'type';

  IF v_event_type = 'checkout.session.completed' THEN
    v_session_id        := webhook_data->'data'->'object'->>'id';
    v_payment_intent_id := webhook_data->'data'->'object'->>'payment_intent';
    v_masterclass_id    := (webhook_data->'data'->'object'->'metadata'->>'masterclass_id')::uuid;
    v_user_id           := (webhook_data->'data'->'object'->'metadata'->>'user_id')::uuid;

    INSERT INTO masterclass_enrollments (
      masterclass_id, user_id, stripe_payment_intent_id, stripe_session_id, payment_status
    ) VALUES (
      v_masterclass_id, v_user_id, v_payment_intent_id, v_session_id, 'paid'
    ) ON CONFLICT (masterclass_id, user_id)
    DO UPDATE SET
      stripe_payment_intent_id = v_payment_intent_id,
      stripe_session_id        = v_session_id,
      payment_status           = 'paid';

    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      v_user_id,
      'enrollment',
      'Enrollment Confirmed',
      'Payment successful! You are now enrolled in the masterclass.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 14. SESSION SUMMARIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_summaries (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   uuid NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('exchange', 'masterclass')),
  summary_json jsonb NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants view summaries" ON session_summaries;
CREATE POLICY "Participants view summaries"
  ON session_summaries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth insert summaries" ON session_summaries;
CREATE POLICY "Auth insert summaries"
  ON session_summaries FOR INSERT TO authenticated
  WITH CHECK (true);


-- ============================================================================
-- 15. ADMIN SUITE  (support_tickets & coupons)
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  message    text NOT NULL,
  status     text DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
  priority   text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code       text UNIQUE NOT NULL,
  discount   integer NOT NULL,
  expiry     date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage suite" ON support_tickets;
CREATE POLICY "Admin manage suite"
  ON support_tickets FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Users view own tickets" ON support_tickets;
CREATE POLICY "Users view own tickets"
  ON support_tickets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create tickets" ON support_tickets;
CREATE POLICY "Users create tickets"
  ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public view active coupons" ON coupons;
CREATE POLICY "Public view active coupons"
  ON coupons FOR SELECT USING (expiry > CURRENT_DATE);


-- ============================================================================
-- 16. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_masterclasses_updated_at ON masterclasses;
CREATE TRIGGER update_masterclasses_updated_at
  BEFORE UPDATE ON masterclasses FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_requests_updated_at ON exchange_requests;
CREATE TRIGGER update_exchange_requests_updated_at
  BEFORE UPDATE ON exchange_requests FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_demos_updated_at ON demos;
CREATE TRIGGER update_demos_updated_at
  BEFORE UPDATE ON demos FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Follow count trigger + notification on follow
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE profiles SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;

    INSERT INTO notifications (user_id, type, title, message, related_id)
    SELECT p2.user_id, 'follow', 'New Follower',
           (SELECT display_name FROM profiles WHERE id = NEW.follower_id) || ' started following you',
           NEW.follower_id
    FROM profiles p2 WHERE p2.id = NEW.following_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE profiles SET follower_count  = GREATEST(follower_count  - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_update ON followers;
CREATE TRIGGER on_follow_update
  AFTER INSERT OR DELETE ON followers FOR EACH ROW
  EXECUTE PROCEDURE update_follow_counts();

-- Review rating trigger (from fix_rating_system.sql)
CREATE OR REPLACE FUNCTION trigger_update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM recalculate_profile_rating(NEW.reviewee_profile_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recalculate_profile_rating(OLD.reviewee_profile_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_rating ON reviews;
CREATE TRIGGER trigger_update_profile_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_rating();


-- ============================================================================
-- 17. STORAGE BUCKETS & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('demos',   'demos',   true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers',  'covers',  true) ON CONFLICT (id) DO NOTHING;

-- Demos storage policies
DROP POLICY IF EXISTS "Demos Public Read" ON storage.objects;
CREATE POLICY "Demos Public Read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'demos');

DROP POLICY IF EXISTS "Demos Auth Upload" ON storage.objects;
CREATE POLICY "Demos Auth Upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'demos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Demos Owner Delete" ON storage.objects;
CREATE POLICY "Demos Owner Delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'demos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Avatars storage policies
DROP POLICY IF EXISTS "Avatars Public Read" ON storage.objects;
CREATE POLICY "Avatars Public Read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars Auth Upload" ON storage.objects;
CREATE POLICY "Avatars Auth Upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatars Owner Delete" ON storage.objects;
CREATE POLICY "Avatars Owner Delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Covers storage policies
DROP POLICY IF EXISTS "Covers Public Read" ON storage.objects;
CREATE POLICY "Covers Public Read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Covers Auth Upload" ON storage.objects;
CREATE POLICY "Covers Auth Upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Covers Owner Delete" ON storage.objects;
CREATE POLICY "Covers Owner Delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ============================================================================
-- 18. REALTIME PUBLICATIONS
-- ============================================================================
-- Enable realtime on key tables so the frontend gets live updates.
-- Using DO blocks to avoid errors if the table is already in the publication.
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE exchange_requests; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications;     EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE masterclasses;     EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE exchange_messages;  EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE followers;          EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ============================================================================
-- 19. PERFORMANCE INDEXES
-- ============================================================================

-- Exchange requests
CREATE INDEX IF NOT EXISTS idx_exchange_requests_sender_id              ON exchange_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_receiver_id             ON exchange_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_id            ON exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_id             ON exchange_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_profile_id    ON exchange_requests(requester_profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_profile_id     ON exchange_requests(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status                  ON exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_created_at              ON exchange_requests(created_at DESC);

-- Exchange messages
CREATE INDEX IF NOT EXISTS idx_exchange_messages_exchange_id ON exchange_messages(exchange_id);
CREATE INDEX IF NOT EXISTS idx_exchange_messages_sender_id   ON exchange_messages(sender_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_exchange_id   ON notifications(exchange_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read       ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at    ON notifications(created_at DESC);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_exchange_id          ON reviews(exchange_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id          ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_profile_id  ON reviews(reviewee_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating               ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at           ON reviews(created_at DESC);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id         ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_category        ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_exchange_count   ON profiles(exchange_count DESC);

-- Demos
CREATE INDEX IF NOT EXISTS idx_demos_user_id    ON demos(user_id);
CREATE INDEX IF NOT EXISTS idx_demos_profile_id ON demos(profile_id);
CREATE INDEX IF NOT EXISTS idx_demos_category   ON demos(category);

-- Masterclasses
CREATE INDEX IF NOT EXISTS idx_masterclasses_expert_id    ON masterclasses(expert_id);
CREATE INDEX IF NOT EXISTS idx_masterclasses_status       ON masterclasses(status);
CREATE INDEX IF NOT EXISTS idx_masterclasses_scheduled_at ON masterclasses(scheduled_at);


-- ============================================================================
-- DONE — All tables, policies, triggers, functions, storage, and indexes
-- are now synchronized. Safe to run repeatedly (fully idempotent).
-- ============================================================================
