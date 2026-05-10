-- ============================================================================
-- FIX EXCHANGE REQUESTS
-- ============================================================================

-- Enable realtime on exchanges table for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE exchanges;

-- Create exchange_requests table alias for backward compatibility if needed
-- Actually, let's rename the existing table to match the code
-- First, let's check if exchanges table exists and rename it to exchange_requests
-- This is safer than updating all the code

DO $$
BEGIN
    -- Check if exchanges table exists but exchange_requests doesn't
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchanges') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchange_requests') THEN
        -- Rename the table to match the code
        ALTER TABLE exchanges RENAME TO exchange_requests;
        
        -- Update foreign key references
        ALTER TABLE exchange_messages RENAME CONSTRAINT exchange_messages_exchange_id_fkey TO exchange_messages_exchange_id_fkey;
        
        -- Update the foreign key column reference
        ALTER TABLE exchange_messages 
        DROP CONSTRAINT IF EXISTS exchange_messages_exchange_id_fkey,
        ADD CONSTRAINT exchange_messages_exchange_id_fkey 
        FOREIGN KEY (exchange_id) REFERENCES exchange_requests(id) ON DELETE CASCADE;
        
        -- Update RLS policy references
        DROP POLICY IF EXISTS "Exchange participants can view messages" ON exchange_messages;
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
        
        DROP POLICY IF EXISTS "Exchange participants can send messages" ON exchange_messages;
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
    END IF;
END $$;

-- Update the table structure to match what the code expects
ALTER TABLE exchange_requests 
ADD COLUMN IF NOT EXISTS requester_profile_id uuid,
ADD COLUMN IF NOT EXISTS provider_profile_id uuid;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_id ON exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_id ON exchange_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_profile_id ON exchange_requests(requester_profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_provider_profile_id ON exchange_requests(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_created_at ON exchange_requests(created_at DESC);
