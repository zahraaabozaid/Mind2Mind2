-- Mind2Mind Supabase Setup Script
-- Run this in your Supabase SQL Editor to set up storage buckets and permissions

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

-- Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demo-videos',
  'demo-videos',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for demo PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demo-pdfs',
  'demo-pdfs',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Demo Videos: Anyone can read, authenticated users can upload their own
CREATE POLICY "Public read access for demo videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'demo-videos');

CREATE POLICY "Authenticated users can upload demo videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'demo-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own demo videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'demo-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own demo videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'demo-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Demo PDFs: Same policies as videos
CREATE POLICY "Public read access for demo PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'demo-pdfs');

CREATE POLICY "Authenticated users can upload demo PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'demo-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own demo PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'demo-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own demo PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'demo-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars: Public read, users can manage their own
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Covers: Same as avatars
CREATE POLICY "Public read access for covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own cover"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own cover"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own cover"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- DEMO PERMISSIONS TABLE (for custom visibility)
-- ============================================

CREATE TABLE IF NOT EXISTS demo_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id uuid NOT NULL REFERENCES knowledge_demos(id) ON DELETE CASCADE,
  allowed_username text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(demo_id, allowed_username)
);

-- Enable RLS
ALTER TABLE demo_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for demo_permissions
CREATE POLICY "Demo owners can manage permissions"
ON demo_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM knowledge_demos
    WHERE knowledge_demos.id = demo_permissions.demo_id
    AND knowledge_demos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view permissions for their accessible demos"
ON demo_permissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.username = demo_permissions.allowed_username
    AND profiles.user_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_demo_permissions_demo_id ON demo_permissions(demo_id);
CREATE INDEX IF NOT EXISTS idx_demo_permissions_username ON demo_permissions(allowed_username);

-- ============================================
-- HELPER FUNCTION: Check if user can view demo
-- ============================================

CREATE OR REPLACE FUNCTION can_view_demo(demo_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
DECLARE
  demo_owner_id uuid;
  demo_is_published boolean;
  user_username text;
  has_permission boolean;
BEGIN
  -- Get demo info
  SELECT user_id, is_published INTO demo_owner_id, demo_is_published
  FROM knowledge_demos
  WHERE id = demo_id_param;
  
  -- Owner can always view
  IF demo_owner_id = user_id_param THEN
    RETURN true;
  END IF;
  
  -- If not published, only owner can view
  IF NOT demo_is_published THEN
    RETURN false;
  END IF;
  
  -- Check if there are any permissions set (custom visibility)
  SELECT EXISTS(
    SELECT 1 FROM demo_permissions WHERE demo_id = demo_id_param
  ) INTO has_permission;
  
  -- If no custom permissions, it's public
  IF NOT has_permission THEN
    RETURN true;
  END IF;
  
  -- Check if user has explicit permission
  SELECT username INTO user_username
  FROM profiles
  WHERE user_id = user_id_param;
  
  RETURN EXISTS(
    SELECT 1 FROM demo_permissions
    WHERE demo_id = demo_id_param
    AND allowed_username = user_username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE KNOWLEDGE_DEMOS RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Published demos are publicly viewable" ON knowledge_demos;
DROP POLICY IF EXISTS "Users can view their own demos" ON knowledge_demos;

-- New policy: Users can view demos based on permissions
CREATE POLICY "Users can view accessible demos"
ON knowledge_demos FOR SELECT
TO authenticated
USING (
  is_published = true AND (
    user_id = auth.uid() OR
    can_view_demo(id, auth.uid())
  )
);

-- Public can view published demos without custom permissions
CREATE POLICY "Public can view published demos"
ON knowledge_demos FOR SELECT
TO public
USING (
  is_published = true AND
  NOT EXISTS(SELECT 1 FROM demo_permissions WHERE demo_id = knowledge_demos.id)
);

-- ============================================
-- PROFILES TABLE UPDATE - Add Category Column
-- ============================================

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'category') THEN
    ALTER TABLE profiles ADD COLUMN category text;
    
    -- Add check constraint for valid categories
    ALTER TABLE profiles ADD CONSTRAINT profiles_category_check 
      CHECK (category IN ('Technology', 'Design', 'Language', 'Music', 'Fitness', 'Cooking', 'Business', 'Arts') OR category IS NULL);
    
    -- Create index for category filtering
    CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
  END IF;
END $$;

-- ============================================
-- NOTIFICATIONS TABLE UPDATE
-- ============================================

-- Ensure notifications table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'type') THEN
    ALTER TABLE notifications ADD COLUMN type text DEFAULT 'general';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'title') THEN
    ALTER TABLE notifications ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'related_id') THEN
    ALTER TABLE notifications ADD COLUMN related_id uuid;
  END IF;
END $$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_knowledge_demos_profile_id ON knowledge_demos(profile_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_demos_user_id ON knowledge_demos(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_demos_is_published ON knowledge_demos(is_published);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_id ON exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_id ON exchange_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Mind2Mind database setup completed successfully!';
  RAISE NOTICE 'Storage buckets created: demo-videos, demo-pdfs, avatars, covers';
  RAISE NOTICE 'Demo permissions table created with RLS policies';
  RAISE NOTICE 'Helper function can_view_demo() created';
  RAISE NOTICE 'All indexes created for optimal performance';
END $$;
