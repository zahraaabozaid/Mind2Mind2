-- SIMPLEST VERSION - Just add the category column
-- Copy and paste this entire block into Supabase SQL Editor

-- Add the column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category text;

-- Add validation
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_category_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_category_check 
  CHECK (category IN ('Technology', 'Design', 'Language', 'Music', 'Fitness', 'Cooking', 'Business', 'Arts') OR category IS NULL);

-- Add index for performance
DROP INDEX IF EXISTS idx_profiles_category;
CREATE INDEX idx_profiles_category ON profiles(category);

-- Success message
SELECT 'SUCCESS: Category column added!' as result;
