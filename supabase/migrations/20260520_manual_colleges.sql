-- ============================================================
-- CORELX CAMPUS LAYER — Migration v2 (Manual Hubs & Tags)
-- Date: 2026-05-20
-- ============================================================

-- Allow email_domain to be NULL
ALTER TABLE public.colleges ALTER COLUMN email_domain DROP NOT NULL;

-- Allow authenticated users to insert new colleges/hubs
CREATE POLICY "Colleges insertable by authenticated users" ON public.colleges
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
