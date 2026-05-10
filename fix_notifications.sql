-- ============================================================================
-- FIX NOTIFICATIONS
-- ============================================================================

-- Update notifications table schema to match the code expectations
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS exchange_id uuid REFERENCES exchange_requests(id) ON DELETE SET NULL,
DROP COLUMN IF EXISTS related_id CASCADE,
DROP COLUMN IF EXISTS type CASCADE,
DROP COLUMN IF EXISTS title CASCADE;

-- Update RLS policies to match the new schema
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their notifications as read" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert notifications (for system-generated notifications)
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_exchange_id ON notifications(exchange_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
