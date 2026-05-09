-- ONLY ADD CATEGORY COLUMN
-- This script ONLY adds the category column without touching anything else
-- Safe to run even if other tables/policies already exist

-- Add the category column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category text;

-- Drop old constraint if exists, then add new one
DO $$ 
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_category_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_category_check 
      CHECK (category IN ('Technology', 'Design', 'Language', 'Music', 'Fitness', 'Cooking', 'Business', 'Arts') OR category IS NULL);
END $$;

-- Add index for performance
DROP INDEX IF EXISTS idx_profiles_category;
CREATE INDEX idx_profiles_category ON profiles(category);

-- Show success
SELECT 'SUCCESS: Category column added to profiles table!' as status;
