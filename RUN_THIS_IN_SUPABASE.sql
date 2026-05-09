-- ============================================================================
-- HOW TO RUN THIS FILE:
-- 1. Go to https://supabase.com/dashboard/project/qgqfbyaxssdmwxytyppm/sql/new
-- 2. Copy everything below this comment block
-- 3. Paste it into the SQL Editor
-- 4. Click the green "Run" button
-- ============================================================================

-- ============================================================================
-- TABLE 1: masterclasses
-- ============================================================================

CREATE TABLE IF NOT EXISTS masterclasses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  description text NOT NULL DEFAULT '',
  expert_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  max_participants integer NOT NULL DEFAULT 20 CHECK (max_participants > 0 AND max_participants <= 500),
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  stripe_product_id text DEFAULT '',
  stripe_price_id text DEFAULT '',
  session_link text DEFAULT '',
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view masterclasses"
  ON masterclasses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create masterclasses"
  ON masterclasses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update their own masterclasses"
  ON masterclasses FOR UPDATE
  TO authenticated
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own masterclasses"
  ON masterclasses FOR DELETE
  TO authenticated
  USING (auth.uid() = expert_id);

CREATE INDEX IF NOT EXISTS idx_masterclasses_expert_id ON masterclasses(expert_id);
CREATE INDEX IF NOT EXISTS idx_masterclasses_scheduled_at ON masterclasses(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_masterclasses_status ON masterclasses(status);
CREATE INDEX IF NOT EXISTS idx_masterclasses_created_at ON masterclasses(created_at DESC);

-- ============================================================================
-- TABLE 2: masterclass_enrollments
-- ============================================================================

CREATE TABLE IF NOT EXISTS masterclass_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id uuid REFERENCES masterclasses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text DEFAULT '',
  stripe_session_id text DEFAULT '',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(masterclass_id, user_id)
);

ALTER TABLE masterclass_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments"
  ON masterclass_enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Experts can view enrollments for their masterclasses"
  ON masterclass_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masterclasses
      WHERE id = masterclass_id
      AND expert_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert their own enrollment"
  ON masterclass_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollment"
  ON masterclass_enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_masterclass_id ON masterclass_enrollments(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_user_id ON masterclass_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_payment_status ON masterclass_enrollments(payment_status);

-- ============================================================================
-- TABLE 3: session_summaries
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('exchange', 'masterclass')),
  generated_summary jsonb NOT NULL DEFAULT '{}',
  generated_by_ai boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view session summaries"
  ON session_summaries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert session summaries"
  ON session_summaries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update session summaries"
  ON session_summaries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_session_summaries_session_id ON session_summaries(session_id);
CREATE INDEX IF NOT EXISTS idx_session_summaries_session_type ON session_summaries(session_type);
CREATE INDEX IF NOT EXISTS idx_session_summaries_created_at ON session_summaries(created_at DESC);

-- ============================================================================
-- FUNCTION: Count paid enrollments for a masterclass
-- ============================================================================

CREATE OR REPLACE FUNCTION get_masterclass_enrollment_count(mc_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM masterclass_enrollments
  WHERE masterclass_id = mc_id
  AND payment_status = 'paid';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-update masterclasses.updated_at on row update
-- ============================================================================

CREATE OR REPLACE FUNCTION update_masterclasses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_masterclasses_updated_at ON masterclasses;
CREATE TRIGGER trigger_update_masterclasses_updated_at
  BEFORE UPDATE ON masterclasses
  FOR EACH ROW
  EXECUTE FUNCTION update_masterclasses_updated_at();
