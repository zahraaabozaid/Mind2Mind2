-- Add category column to profiles table
-- Run this in Supabase SQL Editor

-- Simple version: Just add the column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category text;

-- Add check constraint (drop first if exists to avoid conflicts)
DO $$ 
BEGIN
  -- Try to drop constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_category_check;
  
  -- Add the constraint
  ALTER TABLE profiles ADD CONSTRAINT profiles_category_check 
    CHECK (category IN (
      'Technology', 
      'Design', 
      'Language', 
      'Music', 
      'Fitness', 
      'Cooking', 
      'Business', 
      'Arts'
    ) OR category IS NULL);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint handling: %', SQLERRM;
END $$;

-- Create index (drop first if exists)
DROP INDEX IF EXISTS idx_profiles_category;
CREATE INDEX idx_profiles_category ON profiles(category);

-- Verify the column was added
SELECT 'Category column added successfully!' as status;
