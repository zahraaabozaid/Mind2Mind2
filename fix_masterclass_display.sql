-- ============================================================================
-- FIX MASTERCLASS DISPLAY ISSUES
-- ============================================================================

-- The issue is likely that the RLS policy is too restrictive
-- Let's update the insert policy to be more permissive for authenticated users
DROP POLICY IF EXISTS "Authenticated users can create masterclasses" ON masterclasses;

CREATE POLICY "Authenticated users can create masterclasses"
  ON masterclasses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = expert_id);

-- Also ensure the expert_id is properly set when inserting
-- Create a trigger to automatically set expert_id from the current user
CREATE OR REPLACE FUNCTION set_masterclass_expert_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure expert_id is set to the current authenticated user
  IF NEW.expert_id IS NULL OR NEW.expert_id != auth.uid() THEN
    NEW.expert_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_masterclass_expert_id ON masterclasses;

-- Create the trigger
CREATE TRIGGER trigger_set_masterclass_expert_id
  BEFORE INSERT ON masterclasses
  FOR EACH ROW
  EXECUTE FUNCTION set_masterclass_expert_id();

-- Also add a function to check if a user can create masterclasses
CREATE OR REPLACE FUNCTION can_create_masterclass()
RETURNS boolean AS $$
BEGIN
  -- For now, allow any authenticated user to create masterclasses
  -- You can add additional business logic here (e.g., premium users only)
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the insert policy to use this function
DROP POLICY IF EXISTS "Authenticated users can create masterclasses" ON masterclasses;

CREATE POLICY "Authenticated users can create masterclasses"
  ON masterclasses FOR INSERT
  TO authenticated
  WITH CHECK (can_create_masterclass() AND auth.uid() = expert_id);

-- Ensure realtime is enabled on masterclasses table
ALTER PUBLICATION supabase_realtime ADD TABLE masterclasses;
