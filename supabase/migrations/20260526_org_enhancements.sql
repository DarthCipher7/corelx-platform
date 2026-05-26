-- Add cover banner + social links to org_accounts
ALTER TABLE org_accounts
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Real badge table with explicit foreign key constraint names
CREATE TABLE IF NOT EXISTS org_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  awarded_to UUID NOT NULL,
  badge_name TEXT NOT NULL,
  badge_emoji TEXT DEFAULT '✦',
  issued_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT org_badges_org_id_fkey FOREIGN KEY (org_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT org_badges_awarded_to_fkey FOREIGN KEY (awarded_to) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT org_badges_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Enable RLS for org_badges if not already enabled
ALTER TABLE org_badges ENABLE ROW LEVEL SECURITY;

-- Recreate policies for org_badges (using IF NOT EXISTS via drop and create pattern to be safe)
DROP POLICY IF EXISTS "org_badges_public_read" ON org_badges;
CREATE POLICY "org_badges_public_read" ON org_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "org_badges_admin_insert" ON org_badges;
CREATE POLICY "org_badges_admin_insert" ON org_badges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM org_members WHERE org_id = org_badges.org_id AND user_id = auth.uid() AND role IN ('admin','creator')
  ));

DROP POLICY IF EXISTS "org_badges_admin_delete" ON org_badges;
CREATE POLICY "org_badges_admin_delete" ON org_badges FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM org_members WHERE org_id = org_badges.org_id AND user_id = auth.uid() AND role IN ('admin','creator')
  ));

-- Join requests table (for gated orgs) with explicit foreign key constraints
CREATE TABLE IF NOT EXISTS org_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id),
  CONSTRAINT org_join_requests_org_id_fkey FOREIGN KEY (org_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT org_join_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enable RLS for org_join_requests
ALTER TABLE org_join_requests ENABLE ROW LEVEL SECURITY;

-- Policies for org_join_requests
DROP POLICY IF EXISTS "join_requests_user_read" ON org_join_requests;
CREATE POLICY "join_requests_user_read" ON org_join_requests FOR SELECT USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM org_members WHERE org_id = org_join_requests.org_id AND user_id = auth.uid() AND role IN ('admin','creator')
));

DROP POLICY IF EXISTS "join_requests_user_insert" ON org_join_requests;
CREATE POLICY "join_requests_user_insert" ON org_join_requests FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "join_requests_admin_update" ON org_join_requests;
CREATE POLICY "join_requests_admin_update" ON org_join_requests FOR UPDATE USING (EXISTS (
  SELECT 1 FROM org_members WHERE org_id = org_join_requests.org_id AND user_id = auth.uid() AND role IN ('admin','creator')
));
