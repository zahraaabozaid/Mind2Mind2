-- ============================================================
-- Mind2Mind Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension (should already be on, but just in case)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username      text UNIQUE NOT NULL,
  display_name  text NOT NULL DEFAULT '',
  bio           text DEFAULT '',
  avatar_url    text DEFAULT '',
  cover_url     text DEFAULT '',
  location      text DEFAULT '',
  skills_to_teach text[] DEFAULT '{}',
  skills_to_learn text[] DEFAULT '{}',
  -- legacy columns expected by the existing frontend
  teaching_skills text[] DEFAULT '{}',
  learning_skills text[] DEFAULT '{}',
  languages     text[] DEFAULT '{}',
  video_verified boolean DEFAULT false,
  verification_video_url text DEFAULT '',
  rating        numeric(3,2) DEFAULT 0,
  review_count  integer DEFAULT 0,
  exchange_count integer DEFAULT 0,
  response_rate integer DEFAULT 100,
  is_available  boolean DEFAULT true,
  is_demo       boolean DEFAULT false,
  member_since  timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 2. DEMOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS demos (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text NOT NULL DEFAULT '',
  description   text DEFAULT '',
  file_url      text NOT NULL,
  file_type     text NOT NULL CHECK (file_type IN ('video', 'pdf')),
  visibility    text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'custom')),
  allowed_users text[] DEFAULT '{}',
  skill_name    text DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

-- Public demos can be read by anyone; custom demos only by allowed users or the owner
CREATE POLICY "Public demos are readable by all"
  ON demos FOR SELECT USING (
    visibility = 'public'
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.username = ANY(demos.allowed_users)
    )
  );

-- Users can insert their own demos
CREATE POLICY "Users can insert their own demos"
  ON demos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own demos
CREATE POLICY "Users can update their own demos"
  ON demos FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own demos
CREATE POLICY "Users can delete their own demos"
  ON demos FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. EXCHANGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS exchanges (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_requested  text NOT NULL,
  skill_offered    text NOT NULL,
  message          text DEFAULT '',
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  rejection_reason text DEFAULT '',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;

-- Sender and receiver can read their own exchanges
CREATE POLICY "Users can read their own exchanges"
  ON exchanges FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Authenticated users can create exchanges
CREATE POLICY "Authenticated users can create exchanges"
  ON exchanges FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Receiver can update (accept/reject) and sender can cancel
CREATE POLICY "Users can update their own exchanges"
  ON exchanges FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- ============================================================
-- 4. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message      text NOT NULL,
  exchange_id  uuid REFERENCES exchanges(id) ON DELETE SET NULL,
  is_read      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

-- System / authenticated can insert (we allow the sender to create the notification for the receiver)
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 5. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE exchanges;

-- ============================================================
-- 6. STORAGE BUCKETS
-- ============================================================

-- Create 'demos' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('demos', 'demos', true)
ON CONFLICT (id) DO NOTHING;

-- Create 'avatars' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'demos' bucket
CREATE POLICY "Authenticated users can upload demos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'demos' AND auth.role() = 'authenticated');

CREATE POLICY "Public can read demo files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'demos');

CREATE POLICY "Users can delete their own demo files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'demos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies for 'avatars' bucket
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Public can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Done! Your Mind2Mind schema is ready.
-- ============================================================
