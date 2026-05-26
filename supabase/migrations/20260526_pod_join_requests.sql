-- Join requests table for request-gated pods
CREATE TABLE IF NOT EXISTS public.pod_join_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id      UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pod_id, user_id),
  CONSTRAINT pod_join_requests_pod_id_fkey FOREIGN KEY (pod_id) REFERENCES public.pods(id) ON DELETE CASCADE,
  CONSTRAINT pod_join_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.pod_join_requests ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "pod_join_requests_select" ON public.pod_join_requests;
CREATE POLICY "pod_join_requests_select" ON public.pod_join_requests FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.pod_members WHERE pod_id = pod_join_requests.pod_id AND user_id = auth.uid() AND role IN ('admin', 'creator')
  )
);

-- Insert policy (anyone can request for themselves)
DROP POLICY IF EXISTS "pod_join_requests_insert" ON public.pod_join_requests;
CREATE POLICY "pod_join_requests_insert" ON public.pod_join_requests FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Update policy (only creator or admin can update status)
DROP POLICY IF EXISTS "pod_join_requests_update" ON public.pod_join_requests;
CREATE POLICY "pod_join_requests_update" ON public.pod_join_requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.pod_members WHERE pod_id = pod_join_requests.pod_id AND user_id = auth.uid() AND role IN ('admin', 'creator')
  )
);

-- Delete policy (request owner can cancel, admins can delete/clean up)
DROP POLICY IF EXISTS "pod_join_requests_delete" ON public.pod_join_requests;
CREATE POLICY "pod_join_requests_delete" ON public.pod_join_requests FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.pod_members WHERE pod_id = pod_join_requests.pod_id AND user_id = auth.uid() AND role IN ('admin', 'creator')
  )
);
