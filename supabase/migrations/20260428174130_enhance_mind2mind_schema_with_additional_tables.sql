
/*
  # Enhance Mind2Mind with Additional Tables

  This migration adds the missing tables to complete the comprehensive schema:
  - demo_likes (for tracking knowledge demo likes)
  - notifications (for user notifications)
  - user_preferences (for user settings)
  - skill_endorsements (for skill validation)
  - exchange_messages (for in-app messaging)

  And creates triggers for automatic timestamp updates.
*/

-- ============================================================================
-- DEMO LIKES
-- ============================================================================

CREATE TABLE IF NOT EXISTS demo_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id uuid REFERENCES knowledge_demos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(demo_id, user_id)
);

ALTER TABLE demo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view demo likes count"
  ON demo_likes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can like demos"
  ON demo_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON demo_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_demo_likes_demo_id ON demo_likes(demo_id);
CREATE INDEX IF NOT EXISTS idx_demo_likes_user_id ON demo_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_likes_created_at ON demo_likes(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('exchange_request', 'exchange_accepted', 'exchange_declined', 'review_received', 'message', 'milestone')),
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  exchange_notifications boolean DEFAULT true,
  review_notifications boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  language_preference text DEFAULT 'en' CHECK (language_preference IN ('en', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh')),
  theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  newsletter_subscribed boolean DEFAULT true,
  navbar_color text DEFAULT 'green' CHECK (navbar_color IN ('green', 'blue', 'purple', 'red')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- SKILL ENDORSEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endorsee_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(endorser_id, endorsee_profile_id, skill_name)
);

ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill endorsements"
  ON skill_endorsements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can endorse skills"
  ON skill_endorsements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can remove their endorsements"
  ON skill_endorsements FOR DELETE
  TO authenticated
  USING (auth.uid() = endorser_id);

CREATE INDEX IF NOT EXISTS idx_skill_endorsements_endorser_id ON skill_endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_endorsee_profile_id ON skill_endorsements(endorsee_profile_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill_name ON skill_endorsements(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_created_at ON skill_endorsements(created_at DESC);

-- ============================================================================
-- EXCHANGE MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS exchange_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id uuid REFERENCES exchange_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 5000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exchange_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exchange participants can view messages"
  ON exchange_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exchange_requests
      WHERE id = exchange_id
      AND (auth.uid() = requester_id OR auth.uid() = provider_id)
    )
  );

CREATE POLICY "Exchange participants can send messages"
  ON exchange_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM exchange_requests
      WHERE id = exchange_id
      AND (auth.uid() = requester_id OR auth.uid() = provider_id)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON exchange_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON exchange_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_exchange_messages_exchange_id ON exchange_messages(exchange_id);
CREATE INDEX IF NOT EXISTS idx_exchange_messages_sender_id ON exchange_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_exchange_messages_created_at ON exchange_messages(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update user_preferences's updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_preferences table
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to update exchange_messages's updated_at timestamp
CREATE OR REPLACE FUNCTION update_exchange_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for exchange_messages table
DROP TRIGGER IF EXISTS trigger_update_exchange_messages_updated_at ON exchange_messages;
CREATE TRIGGER trigger_update_exchange_messages_updated_at
  BEFORE UPDATE ON exchange_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_messages_updated_at();

-- Function to increment demo views
CREATE OR REPLACE FUNCTION increment_demo_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE knowledge_demos
  SET views = views + 1
  WHERE id = NEW.knowledge_demo_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync demo likes count
CREATE OR REPLACE FUNCTION sync_demo_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE knowledge_demos SET likes = likes + 1 WHERE id = NEW.demo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_demos SET likes = likes - 1 WHERE id = OLD.demo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update likes count when demo_likes are added/removed
DROP TRIGGER IF EXISTS trigger_sync_demo_likes ON demo_likes;
CREATE TRIGGER trigger_sync_demo_likes
  AFTER INSERT OR DELETE ON demo_likes
  FOR EACH ROW
  EXECUTE FUNCTION sync_demo_likes();
