-- ============================================================================
-- MIND2MIND MASTER DATABASE SYNCHRONIZATION SCRIPT (FIXED VERSION)
-- ============================================================================
-- Purpose: Integrate all fixes, updates, and new features into single script
-- Handles existing tables safely without data loss
-- Fixed: Column name consistency in exchange_requests table
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ADMIN ISOLATION FUNCTION
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'mohamedhosamm81@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SKILL CATEGORIES (with proper seeding)
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
DROP POLICY IF EXISTS "Admin manage categories" ON skill_categories;
CREATE POLICY "Categories readable by all" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON skill_categories FOR ALL TO authenticated 
  USING (is_admin()) WITH CHECK (is_admin());

-- Insert comprehensive skill categories
INSERT INTO skill_categories (name, icon, color, description) VALUES
('Programming', 'Code', 'teal', 'Software development, coding, and programming languages'),
('Design', 'Palette', 'indigo', 'UI/UX design, graphic design, and visual arts'),
('Language', 'Languages', 'blue', 'Language learning, translation, and linguistics'),
('Music', 'Music', 'amber', 'Music production, instruments, and audio engineering'),
('Fitness', 'Dumbbell', 'red', 'Personal training, workouts, and health coaching'),
('Cooking', 'Utensils', 'orange', 'Culinary arts, recipes, and nutrition'),
('Business', 'Briefcase', 'slate', 'Business strategy, entrepreneurship, and management'),
('Arts', 'Brush', 'pink', 'Fine arts, crafts, and creative expression'),
('Technology', 'Cpu', 'purple', 'Tech support, IT, and digital skills'),
('Education', 'BookOpen', 'green', 'Teaching, tutoring, and academic subjects'),
('Marketing', 'TrendingUp', 'yellow', 'Digital marketing, SEO, and growth strategies'),
('Writing', 'PenTool', 'gray', 'Content writing, copywriting, and editing')
ON CONFLICT (name) DO NOTHING;

-- 4. PROFILES TABLE (ensure all columns exist)
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username      text UNIQUE NOT NULL,
  display_name  text NOT NULL DEFAULT '',
  bio           text DEFAULT '',
  avatar_url    text DEFAULT '',
  cover_url     text DEFAULT '',
  location      text DEFAULT '',
  category      text DEFAULT 'General',
  teaching_skills text[] DEFAULT '{}',
  learning_skills text[] DEFAULT '{}',
  languages     text[] DEFAULT '{}',
  video_verified boolean DEFAULT false,
  verification_video_url text DEFAULT '',
  rating        numeric(3,2) DEFAULT 5.0,
  review_count  integer DEFAULT 0,
  exchange_count integer DEFAULT 0,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  response_rate integer DEFAULT 100,
  is_available  boolean DEFAULT true,
  is_demo       boolean DEFAULT false,
  member_since  timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Ensure all profile columns exist (safe additions)
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
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users/Admin update profile" ON profiles;
DROP POLICY IF EXISTS "Admin delete profile" ON profiles;
CREATE POLICY "Profiles readable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users/Admin update profile" ON profiles FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admin delete profile" ON profiles FOR DELETE USING (is_admin());

-- 5. KNOWLEDGE DEMOS TABLE (with all required columns)
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

-- Ensure all demo columns exist
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
DROP POLICY IF EXISTS "Owner manage demos" ON demos;
CREATE POLICY "Demos visibility logic" ON demos FOR SELECT USING (is_published = true AND (visibility = 'public' OR auth.uid() = user_id OR is_admin()));
CREATE POLICY "Owner manage demos" ON demos FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

-- 6. FOLLOW SYSTEM
CREATE TABLE IF NOT EXISTS followers (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id   uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Followers readable by all" ON followers;
DROP POLICY IF EXISTS "Users manage own following" ON followers;
CREATE POLICY "Followers readable by all" ON followers FOR SELECT USING (true);
CREATE POLICY "Users manage own following" ON followers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = follower_id AND profiles.user_id = auth.uid()));

-- 7. PROJECT IDEAS
CREATE TABLE IF NOT EXISTS ideas (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text NOT NULL,
  description   text NOT NULL,
  category      text NOT NULL,
  budget        numeric DEFAULT 0,
  tags          text[] DEFAULT '{}',
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged')),
  is_featured   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Approved ideas readable by all" ON ideas;
DROP POLICY IF EXISTS "Users post ideas" ON ideas;
DROP POLICY IF EXISTS "Owner/Admin manage ideas" ON ideas;
CREATE POLICY "Approved ideas readable by all" ON ideas FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR is_admin());
CREATE POLICY "Users post ideas" ON ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner/Admin manage ideas" ON ideas FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

-- 8. EXCHANGE REQUESTS (FIXED TABLE NAME)
-- First check if we need to rename exchanges to exchange_requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchanges') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchange_requests') THEN
        ALTER TABLE exchanges RENAME TO exchange_requests;
    END IF;
END $$;

-- Now create exchange_requests table with proper structure
CREATE TABLE IF NOT EXISTS exchange_requests (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requester_profile_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_profile_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  requester_skill        text NOT NULL,
  provider_skill         text NOT NULL,
  message               text DEFAULT '',
  status                text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  rejection_reason       text DEFAULT '',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants/Admin view exchanges" ON exchange_requests;
DROP POLICY IF EXISTS "Sender create exchanges" ON exchange_requests;
DROP POLICY IF EXISTS "Participants update exchanges" ON exchange_requests;
CREATE POLICY "Participants/Admin view exchanges" ON exchange_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = provider_id OR is_admin());
CREATE POLICY "Sender create exchanges" ON exchange_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants update exchanges" ON exchange_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = provider_id OR is_admin());

-- 9. NOTIFICATIONS TABLE (UPDATED SCHEMA)
CREATE TABLE IF NOT EXISTS notifications (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exchange_id   uuid REFERENCES exchange_requests(id) ON DELETE SET NULL,
  message      text NOT NULL,
  is_read      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 10. REVIEWS TABLE (NEW RATING SYSTEM)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id uuid REFERENCES exchange_requests(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >=1 AND rating <= 5),
  comment text DEFAULT '',
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are publicly readable" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- 11. MASTERCLASSES TABLE (ENHANCED)
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
  status           text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view masterclasses" ON masterclasses;
DROP POLICY IF EXISTS "Experts manage own masterclasses" ON masterclasses;
CREATE POLICY "Public view masterclasses" ON masterclasses FOR SELECT USING (status IN ('upcoming', 'live') OR expert_id = auth.uid() OR is_admin());
CREATE POLICY "Experts manage own masterclasses" ON masterclasses FOR ALL TO authenticated USING (expert_id = auth.uid() OR is_admin());

-- 12. MASTERCLASS ENROLLMENTS (FIXED TYPO)
CREATE TABLE IF NOT EXISTS masterclass_enrollments (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  masterclass_id    uuid REFERENCES masterclasses(id) ON DELETE CASCADE NOT NULL,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_status    text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_intent_id text,
  stripe_session_id text,
  enrolled_at       timestamptz DEFAULT now(),
  UNIQUE(masterclass_id, user_id)
);

ALTER TABLE masterclass_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own enrollments" ON masterclass_enrollments;
CREATE POLICY "Users view own enrollments" ON masterclass_enrollments FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- 13. SESSION SUMMARIES
CREATE TABLE IF NOT EXISTS session_summaries (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   uuid NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('exchange', 'masterclass')),
  summary_json jsonb NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants view summaries" ON session_summaries;
CREATE POLICY "Participants view summaries" ON session_summaries FOR SELECT USING (true);

-- 14. ADMIN SUITE
CREATE TABLE IF NOT EXISTS support_tickets (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      text NOT NULL,
  message      text NOT NULL,
  status       text DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
  priority     text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         text UNIQUE NOT NULL,
  discount     integer NOT NULL,
  expiry       date NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage suite" ON support_tickets;
DROP POLICY IF EXISTS "Users view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Public view active coupons" ON coupons;
CREATE POLICY "Admin manage suite" ON support_tickets FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public view active coupons" ON coupons FOR SELECT USING (expiry > CURRENT_DATE);

-- 15. EXCHANGE MESSAGES TABLE (FOR REALTIME CHAT)
CREATE TABLE IF NOT EXISTS exchange_messages (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_id    uuid REFERENCES exchange_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message        text NOT NULL,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE exchange_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Exchange participants can view messages" ON exchange_messages;
DROP POLICY IF EXISTS "Exchange participants can send messages" ON exchange_messages;
CREATE POLICY "Exchange participants can view messages" ON exchange_messages FOR SELECT TO authenticated USING (EXISTS (
  SELECT 1 FROM exchange_requests WHERE id = exchange_id AND (auth.uid() = requester_id OR auth.uid() = provider_id)
));
CREATE POLICY "Exchange participants can send messages" ON exchange_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM exchange_requests WHERE id = exchange_id AND (auth.uid() = requester_id OR auth.uid() = provider_id)
  )
);

-- 16. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES 
('demos', 'demos', true), 
('avatars', 'avatars', true), 
('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Demos Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Demos Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Demos Owner Delete" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Covers Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Covers Auth Upload" ON storage.objects;

CREATE POLICY "Demos Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'demos');
CREATE POLICY "Demos Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'demos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Demos Owner Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'demos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatars Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatars Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Covers Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Covers Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 17. FUNCTIONS AND TRIGGERS

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Profile rating calculation function
CREATE OR REPLACE FUNCTION recalculate_profile_rating(profile_id uuid)
RETURNS void AS $$
DECLARE
  avg_rating numeric;
  review_count integer;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE reviewee_profile_id = profile_id;
  
  UPDATE profiles
  SET rating = avg_rating,
      review_count = review_count
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rating update trigger
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

-- Follow count updates
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    INSERT INTO notifications (user_id, exchange_id, message)
    SELECT user_id, NEW.follower_id, 
           (SELECT display_name FROM profiles WHERE id = NEW.follower_id) || ' started following you'
    FROM profiles WHERE id = NEW.following_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Masterclass expert ID setter
CREATE OR REPLACE FUNCTION set_masterclass_expert_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expert_id IS NULL OR NEW.expert_id != auth.uid() THEN
    NEW.expert_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Masterclass permission checker
CREATE OR REPLACE FUNCTION can_create_masterclass()
RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enrollment counter function
CREATE OR REPLACE FUNCTION get_masterclass_enrollment_count(mc_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM masterclass_enrollments WHERE masterclass_id = mc_id AND payment_status = 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stripe webhook processor
CREATE OR REPLACE FUNCTION process_stripe_webhook(webhook_data jsonb)
RETURNS void AS $$
DECLARE
  event_type text;
  payment_intent_id text;
  session_id text;
  masterclass_id uuid;
  user_id uuid;
BEGIN
  event_type := webhook_data->>'type';
  
  IF event_type = 'checkout.session.completed' THEN
    session_id := webhook_data->'data'->'object'->>'id';
    payment_intent_id := webhook_data->'data'->'object'->>'payment_intent';
    masterclass_id := webhook_data->'data'->'object'->'metadata'->>'masterclass_id'::uuid;
    user_id := webhook_data->'data'->'object'->'metadata'->>'user_id'::uuid;
    
    INSERT INTO masterclass_enrollments (
      masterclass_id, user_id, stripe_payment_intent_id, stripe_session_id, payment_status
    ) VALUES (
      masterclass_id, user_id, payment_intent_id, session_id, 'paid'
    ) ON CONFLICT (masterclass_id, user_id) 
    DO UPDATE SET 
      stripe_payment_intent_id = payment_intent_id,
      stripe_session_id = session_id,
      payment_status = 'paid';
      
    INSERT INTO notifications (user_id, exchange_id, message) VALUES (
      user_id, NULL, 'Payment successful! You are now enrolled in the masterclass.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. CREATE ALL TRIGGERS
DROP TRIGGER IF EXISTS update_masterclasses_updated_at ON masterclasses;
CREATE TRIGGER update_masterclasses_updated_at BEFORE UPDATE ON masterclasses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_demos_updated_at ON demos;
CREATE TRIGGER update_demos_updated_at BEFORE UPDATE ON demos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_requests_updated_at ON exchange_requests;
CREATE TRIGGER update_exchange_requests_updated_at BEFORE UPDATE ON exchange_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS on_follow_update ON followers;
CREATE TRIGGER on_follow_update AFTER INSERT OR DELETE ON followers FOR EACH ROW EXECUTE PROCEDURE update_follow_counts();

DROP TRIGGER IF EXISTS trigger_set_masterclass_expert_id ON masterclasses;
CREATE TRIGGER trigger_set_masterclass_expert_id BEFORE INSERT ON masterclasses FOR EACH ROW EXECUTE FUNCTION set_masterclass_expert_id();

DROP TRIGGER IF EXISTS trigger_update_profile_rating ON reviews;
CREATE TRIGGER trigger_update_profile_rating AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION trigger_update_profile_rating();

-- 19. ENABLE REALTIME FOR ALL RELEVANT TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE demos;
ALTER PUBLICATION supabase_realtime ADD TABLE exchange_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE exchange_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE masterclasses;
ALTER PUBLICATION supabase_realtime ADD TABLE masterclass_enrollments;

-- 20. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating DESC);

CREATE INDEX IF NOT EXISTS idx_demos_user_id ON demos(user_id);
CREATE INDEX IF NOT EXISTS idx_demos_profile_id ON demos(profile_id);
CREATE INDEX IF NOT EXISTS idx_demos_category ON demos(category);
CREATE INDEX IF NOT EXISTS idx_demos_file_type ON demos(file_type);
CREATE INDEX IF NOT EXISTS idx_demos_is_published ON demos(is_published);
CREATE INDEX IF NOT EXISTS idx_demos_views ON demos(views DESC);
CREATE INDEX IF NOT EXISTS idx_demos_created_at ON demos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON followers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_id ON exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_id ON exchange_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_profile_id ON exchange_requests(requester_profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_profile_id ON exchange_requests(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_created_at ON exchange_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_exchange_id ON notifications(exchange_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_exchange_id ON reviews(exchange_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_profile_id ON reviews(reviewee_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_masterclasses_expert_id ON masterclasses(expert_id);
CREATE INDEX IF NOT EXISTS idx_masterclasses_status ON masterclasses(status);
CREATE INDEX IF NOT EXISTS idx_masterclasses_scheduled_at ON masterclasses(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_masterclasses_created_at ON masterclasses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_masterclass_id ON masterclass_enrollments(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_user_id ON masterclass_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_payment_status ON masterclass_enrollments(payment_status);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- ============================================================================
-- SCRIPT COMPLETED SUCCESSFULLY
-- ============================================================================
-- All tables, functions, triggers, policies, and indexes have been created
-- Fixed: Column name consistency in exchange_requests table
-- Database is now synchronized with all features and fixes
-- ============================================================================
