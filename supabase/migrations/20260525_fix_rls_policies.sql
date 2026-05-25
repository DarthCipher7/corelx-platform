-- ============================================================
-- CORELX RLS POLICY PATCH — Migration (v2)
-- Date: 2026-05-25
-- Fixes: RLS infinite recursion on company_admins and org_members
-- ============================================================

-- ── 1. DROP EXISTING CONFLICTING POLICIES ────────────────────
DROP POLICY IF EXISTS "Users can insert their own company profile" ON public.company_accounts;
DROP POLICY IF EXISTS "Users can insert their own organisation profile" ON public.org_accounts;

DROP POLICY IF EXISTS "Company owners can insert team members" ON public.company_admins;
DROP POLICY IF EXISTS "Owners and admins can manage team" ON public.company_admins;
DROP POLICY IF EXISTS "Owners and admins can update team members" ON public.company_admins;
DROP POLICY IF EXISTS "Owners and admins can delete team members" ON public.company_admins;

DROP POLICY IF EXISTS "Org creators can insert memberships" ON public.org_members;
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.org_members;
DROP POLICY IF EXISTS "Admins can update memberships" ON public.org_members;
DROP POLICY IF EXISTS "Admins can delete memberships" ON public.org_members;


-- ── 2. COMPANY ACCOUNTS POLICIES ─────────────────────────────
CREATE POLICY "Users can insert their own company profile"
  ON public.company_accounts FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── 3. ORGANISATION ACCOUNTS POLICIES ────────────────────────
CREATE POLICY "Users can insert their own organisation profile"
  ON public.org_accounts FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── 4. COMPANY ADMINS POLICIES (NON-RECURSIVE) ────────────────
CREATE POLICY "Company owners can insert team members"
  ON public.company_admins FOR INSERT
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Owners and admins can update team members"
  ON public.company_admins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins admin_check
      WHERE admin_check.company_id = company_admins.company_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can delete team members"
  ON public.company_admins FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins admin_check
      WHERE admin_check.company_id = company_admins.company_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('owner', 'admin')
    )
  );


-- ── 5. ORGANISATION MEMBERS POLICIES (NON-RECURSIVE) ──────────
CREATE POLICY "Org creators can insert memberships"
  ON public.org_members FOR INSERT
  WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Admins can update memberships"
  ON public.org_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members admin_check
      WHERE admin_check.org_id = org_members.org_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('creator', 'admin')
    )
  );

CREATE POLICY "Admins can delete memberships"
  ON public.org_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members admin_check
      WHERE admin_check.org_id = org_members.org_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('creator', 'admin')
    )
  );
