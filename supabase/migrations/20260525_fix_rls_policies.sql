-- ============================================================
-- CORELX RLS POLICY PATCH — Migration
-- Date: 2026-05-25
-- ============================================================

-- Drop if exist to prevent duplicate errors
DROP POLICY IF EXISTS "Users can insert their own company profile" ON public.company_accounts;
DROP POLICY IF EXISTS "Users can insert their own organisation profile" ON public.org_accounts;
DROP POLICY IF EXISTS "Company owners can insert team members" ON public.company_admins;
DROP POLICY IF EXISTS "Org creators can insert memberships" ON public.org_members;

-- 1. Company Accounts: Allow users to insert their own company profiles
CREATE POLICY "Users can insert their own company profile"
  ON public.company_accounts FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Organisation Accounts: Allow users to insert their own organisation profiles
CREATE POLICY "Users can insert their own organisation profile"
  ON public.org_accounts FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Company Admins: Allow owners/creators to insert initial admin members
CREATE POLICY "Company owners can insert team members"
  ON public.company_admins FOR INSERT
  WITH CHECK (auth.uid() = company_id);

-- 4. Organisation Members: Allow owners/creators to insert initial membership rows
CREATE POLICY "Org creators can insert memberships"
  ON public.org_members FOR INSERT
  WITH CHECK (auth.uid() = org_id);
