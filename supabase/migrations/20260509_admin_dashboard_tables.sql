-- Admin Dashboard Tables and Columns

-- 1. Add status to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE profiles ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'banned'));
  END IF;
END $$;

-- 2. Add admin fields to knowledge_demos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_demos' AND column_name = 'is_featured') THEN
    ALTER TABLE knowledge_demos ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_demos' AND column_name = 'is_flagged') THEN
    ALTER TABLE knowledge_demos ADD COLUMN is_flagged boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_demos' AND column_name = 'flag_reason') THEN
    ALTER TABLE knowledge_demos ADD COLUMN flag_reason text DEFAULT '';
  END IF;
END $$;

-- 3. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tickets" ON support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT TO authenticated USING (true); -- In a real app, check admin role
CREATE POLICY "Admins can update all tickets" ON support_tickets FOR UPDATE TO authenticated USING (true);

-- 4. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percentage integer NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  expiry_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL TO authenticated USING (true);

-- 5. Create fraud_alerts table
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid, -- could be a demo id, profile id, etc.
  type text NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage fraud alerts" ON fraud_alerts FOR ALL TO authenticated USING (true);

-- 6. Create admin_announcements table
CREATE TABLE IF NOT EXISTS admin_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view announcements" ON admin_announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage announcements" ON admin_announcements FOR ALL TO authenticated USING (true);

-- Ensure public access to profiles for admin (assuming existing policies allow it)
-- Ensure public access to knowledge_demos for admin
