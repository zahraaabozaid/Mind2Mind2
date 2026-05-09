-- ============================================================
-- Mind2Mind Database & Storage Fixes
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS skill_categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text UNIQUE NOT NULL,
  icon        text DEFAULT 'Zap',
  color       text DEFAULT 'teal',
  description text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- RLS for categories
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are readable by everyone" ON skill_categories FOR SELECT USING (true);

-- Seed Categories
INSERT INTO skill_categories (name, icon, color) VALUES
('Technology', 'Code', 'teal'),
('Design', 'Palette', 'indigo'),
('Language', 'Languages', 'blue'),
('Music', 'Music', 'amber'),
('Fitness', 'Dumbbell', 'red'),
('Cooking', 'Utensils', 'orange'),
('Business', 'Briefcase', 'slate'),
('Arts', 'Brush', 'pink')
ON CONFLICT (name) DO NOTHING;

-- 2. ENHANCE TABLES (Ensure they match exactly what we need)
-- Add category column to demos if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demos' AND column_name='category') THEN
    ALTER TABLE demos ADD COLUMN category text DEFAULT 'General';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='category') THEN
    ALTER TABLE profiles ADD COLUMN category text DEFAULT 'General';
  END IF;
END $$;

-- 3. FIX STORAGE BUCKET & POLICIES
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('demos', 'demos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies to ensure clean state
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload demos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read demo files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own demo files" ON storage.objects;

-- Create Storage Policies
-- 1. Allow everyone to read
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'demos');

-- 2. Allow authenticated users to upload to their folder
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'demos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Allow users to delete their own files
CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'demos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. RE-ENFORCE DEMO RLS (Custom Access Logic)
DROP POLICY IF EXISTS "Public demos are readable by all" ON demos;

CREATE POLICY "Demos Visibility Logic" ON public.demos FOR SELECT TO public 
USING (
  visibility = 'public' 
  OR auth.uid() = user_id 
  OR (
    visibility = 'custom' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.username = ANY(demos.allowed_users)
    )
  )
);

-- Ensure owner can manage their own records
CREATE POLICY "Owner Manage Own Demos" ON public.demos FOR ALL TO authenticated USING (user_id = auth.uid());
