
/*
  # Mind2Mind Platform Schema

  ## Overview
  This migration creates the core schema for the Mind2Mind skill exchange platform.

  ## Tables Created

  ### skill_categories
  - Stores categories like Technology, Design, Languages, etc.
  - Fields: id, name, icon, color, description

  ### profiles
  - Public user profiles with skill teaching/learning info
  - Fields: id, user_id, display_name, username, avatar_url, bio, location,
    video_verified, teaching_skills, learning_skills, rating, exchange_count,
    response_rate, languages, is_available

  ### knowledge_demos
  - Video demos users upload to showcase their teaching style
  - Fields: id, profile_id, title, description, video_url, thumbnail_url,
    skill_name, category, duration_seconds, views, likes, is_published

  ### exchange_requests
  - Skill exchange proposals between users
  - Fields: id, requester_profile_id, provider_profile_id, requester_skill,
    provider_skill, message, status, created_at

  ### reviews
  - Post-exchange reviews and ratings
  - Fields: id, exchange_id, reviewer_id, reviewee_id, rating, comment

  ## Security
  - RLS enabled on all tables
  - Profiles and categories are publicly readable
  - Only authenticated owners can write their own data
*/

-- Skill Categories
CREATE TABLE IF NOT EXISTS skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL DEFAULT 'teal',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill categories"
  ON skill_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON skill_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text DEFAULT '',
  cover_url text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  video_verified boolean DEFAULT false,
  verification_video_url text DEFAULT '',
  teaching_skills text[] DEFAULT '{}',
  learning_skills text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  exchange_count integer DEFAULT 0,
  response_rate integer DEFAULT 100,
  languages text[] DEFAULT '{"English"}',
  is_available boolean DEFAULT true,
  is_demo boolean DEFAULT false,
  member_since timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Knowledge Demos
CREATE TABLE IF NOT EXISTS knowledge_demos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text DEFAULT '',
  thumbnail_url text DEFAULT '',
  skill_name text NOT NULL,
  category text DEFAULT '',
  duration_seconds integer DEFAULT 0,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published demos"
  ON knowledge_demos FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can insert own demos"
  ON knowledge_demos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own demos"
  ON knowledge_demos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exchange Requests
CREATE TABLE IF NOT EXISTS exchange_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_skill text NOT NULL,
  provider_skill text NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exchange requests"
  ON exchange_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = provider_id);

CREATE POLICY "Authenticated users can create exchange requests"
  ON exchange_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own exchange requests"
  ON exchange_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = provider_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = provider_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id uuid REFERENCES exchange_requests(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);
