/*
  # Auto-Categorization System

  This migration adds the infrastructure for automatically categorizing profiles
  based on their teaching skills. When a user teaches a skill, they are 
  automatically added as an expert to the corresponding skill category.

  Tables:
  - skill_to_category_mapping: Maps individual skills to skill categories
  - profile_skill_categories: Links profiles to skill categories as experts
*/

-- ============================================================================
-- SKILL TO CATEGORY MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_to_category_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text NOT NULL UNIQUE,
  category_id uuid REFERENCES skill_categories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skill_to_category_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill mappings"
  ON skill_to_category_mapping FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_skill_to_category_skill_name ON skill_to_category_mapping(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_to_category_category_id ON skill_to_category_mapping(category_id);

-- Seed the skill-to-category mappings
INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'React', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'TypeScript', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Node.js', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Python', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'JavaScript', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Java', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'C++', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Web Development', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Machine Learning', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'System Design', sc.id FROM skill_categories sc WHERE sc.name = 'Technology'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'UX Design', sc.id FROM skill_categories sc WHERE sc.name = 'Design'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'UI Design', sc.id FROM skill_categories sc WHERE sc.name = 'Design'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Figma', sc.id FROM skill_categories sc WHERE sc.name = 'Design'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Graphic Design', sc.id FROM skill_categories sc WHERE sc.name = 'Design'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Illustration', sc.id FROM skill_categories sc WHERE sc.name = 'Design'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Spanish', sc.id FROM skill_categories sc WHERE sc.name = 'Languages'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'French', sc.id FROM skill_categories sc WHERE sc.name = 'Languages'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'German', sc.id FROM skill_categories sc WHERE sc.name = 'Languages'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Portuguese', sc.id FROM skill_categories sc WHERE sc.name = 'Languages'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Japanese', sc.id FROM skill_categories sc WHERE sc.name = 'Languages'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Mandarin', sc.id FROM skill_categories sc WHERE sc.name = 'Languages'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Guitar', sc.id FROM skill_categories sc WHERE sc.name = 'Music'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Piano', sc.id FROM skill_categories sc WHERE sc.name = 'Music'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Music Production', sc.id FROM skill_categories sc WHERE sc.name = 'Music'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Ableton Live', sc.id FROM skill_categories sc WHERE sc.name = 'Music'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Music Theory', sc.id FROM skill_categories sc WHERE sc.name = 'Music'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Yoga', sc.id FROM skill_categories sc WHERE sc.name = 'Fitness'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Fitness Training', sc.id FROM skill_categories sc WHERE sc.name = 'Fitness'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Personal Training', sc.id FROM skill_categories sc WHERE sc.name = 'Fitness'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Nutrition', sc.id FROM skill_categories sc WHERE sc.name = 'Fitness'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Meditation', sc.id FROM skill_categories sc WHERE sc.name = 'Fitness'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Cooking', sc.id FROM skill_categories sc WHERE sc.name = 'Cooking'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'French Cooking', sc.id FROM skill_categories sc WHERE sc.name = 'Cooking'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Indian Cooking', sc.id FROM skill_categories sc WHERE sc.name = 'Cooking'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Pastry Arts', sc.id FROM skill_categories sc WHERE sc.name = 'Cooking'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Baking', sc.id FROM skill_categories sc WHERE sc.name = 'Cooking'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Painting', sc.id FROM skill_categories sc WHERE sc.name = 'Arts & Crafts'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Watercolor Painting', sc.id FROM skill_categories sc WHERE sc.name = 'Arts & Crafts'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Photography', sc.id FROM skill_categories sc WHERE sc.name = 'Arts & Crafts'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Sculpture', sc.id FROM skill_categories sc WHERE sc.name = 'Arts & Crafts'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Marketing', sc.id FROM skill_categories sc WHERE sc.name = 'Business'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Finance', sc.id FROM skill_categories sc WHERE sc.name = 'Business'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Entrepreneurship', sc.id FROM skill_categories sc WHERE sc.name = 'Business'
ON CONFLICT DO NOTHING;

INSERT INTO skill_to_category_mapping (skill_name, category_id)
SELECT 'Management', sc.id FROM skill_categories sc WHERE sc.name = 'Business'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PROFILE SKILL CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profile_skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES skill_categories(id) ON DELETE CASCADE NOT NULL,
  is_expert boolean DEFAULT true,
  added_via_skill text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, category_id)
);

ALTER TABLE profile_skill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profile categories"
  ON profile_skill_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert their own"
  ON profile_skill_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_skill_categories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_profile_skill_categories_profile_id ON profile_skill_categories(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_skill_categories_category_id ON profile_skill_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_profile_skill_categories_is_expert ON profile_skill_categories(is_expert);

-- ============================================================================
-- FUNCTION TO AUTO-CATEGORIZE PROFILE
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_categorize_profile(profile_id uuid)
RETURNS void AS $$
DECLARE
  skill text;
  category_id_val uuid;
BEGIN
  -- Get all teaching skills for the profile
  FOR skill IN
    SELECT unnest(teaching_skills)
    FROM profiles
    WHERE id = profile_id
      AND teaching_skills IS NOT NULL
      AND array_length(teaching_skills, 1) > 0
  LOOP
    -- Find the category for this skill (case-insensitive)
    SELECT sc.id INTO category_id_val
    FROM skill_to_category_mapping stcm
    JOIN skill_categories sc ON stcm.category_id = sc.id
    WHERE LOWER(stcm.skill_name) = LOWER(skill)
    LIMIT 1;

    -- If we found a category, add the profile to it
    IF category_id_val IS NOT NULL THEN
      INSERT INTO profile_skill_categories (profile_id, category_id, added_via_skill)
      VALUES (profile_id, category_id_val, skill)
      ON CONFLICT (profile_id, category_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION TO GET PROFILE CATEGORIES
-- ============================================================================

CREATE OR REPLACE FUNCTION get_profile_categories(profile_id uuid)
RETURNS TABLE (
  category_id uuid,
  category_name text,
  category_icon text,
  category_color text,
  is_expert boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.name,
    sc.icon,
    sc.color,
    psc.is_expert
  FROM profile_skill_categories psc
  JOIN skill_categories sc ON psc.category_id = sc.id
  WHERE psc.profile_id = $1
  ORDER BY sc.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- TRIGGER TO AUTO-CATEGORIZE ON PROFILE UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auto_categorize_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the auto-categorization function
  PERFORM auto_categorize_profile(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS auto_categorize_on_profile_update ON profiles;

-- Create trigger
CREATE TRIGGER auto_categorize_on_profile_update
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_auto_categorize_profile();
