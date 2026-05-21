-- ============================================================
-- CORELX — Fix RLS Policies for Pods & Pod Members
-- Date: 2026-05-21
-- ============================================================

-- ── 1. PODS: Add missing UPDATE and DELETE policies ──────────

-- Allow creators to update their own pod (name, description, cover, status)
CREATE POLICY "Creators can update own pods" ON public.pods
  FOR UPDATE USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Allow creators to delete their own pod (trigger will block if members exist)
CREATE POLICY "Creators can delete own pods" ON public.pods
  FOR DELETE USING (auth.uid() = creator_id);


-- ── 2. POD MEMBERS: Add missing INSERT, DELETE policies ──────

-- Allow authenticated users to insert themselves as members
CREATE POLICY "Users can join open pods" ON public.pod_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.pods
      WHERE pods.id = pod_members.pod_id
        AND pods.visibility = 'open'
        AND pods.pod_status = 'active'
    )
  );

-- Allow members to remove themselves (leave)
CREATE POLICY "Members can leave pods" ON public.pod_members
  FOR DELETE USING (auth.uid() = user_id);

-- Allow creators and admins to remove other members (kick)
CREATE POLICY "Admins can kick members" ON public.pod_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.pod_members AS pm
      WHERE pm.pod_id = pod_members.pod_id
        AND pm.user_id = auth.uid()
        AND pm.role IN ('creator', 'admin')
    )
  );

-- Allow creators to promote members to admin
CREATE POLICY "Creators can update member roles" ON public.pod_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pod_members AS pm
      WHERE pm.pod_id = pod_members.pod_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'creator'
    )
  );

-- Allow members to read the membership list of pods they belong to
CREATE POLICY "Pod members can read member list" ON public.pod_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pod_members AS pm
      WHERE pm.pod_id = pod_members.pod_id
        AND pm.user_id = auth.uid()
    )
  );
