-- ============================================================
-- FIX: Pod messages INSERT RLS to allow pod creator
-- Date: 2026-05-22
-- ============================================================

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Pod members can insert messages" ON public.pod_messages;

-- New policy: allow pod members OR the pod creator to insert messages
CREATE POLICY "Pod members can insert messages" ON public.pod_messages
  FOR INSERT WITH CHECK (
    (
      -- User is in pod_members
      EXISTS (
        SELECT 1 FROM public.pod_members 
        WHERE pod_members.pod_id = pod_messages.pod_id 
          AND pod_members.user_id = auth.uid()
      )
      OR
      -- User is the pod creator (creator may not always be in pod_members)
      EXISTS (
        SELECT 1 FROM public.pods
        WHERE pods.id = pod_messages.pod_id
          AND pods.creator_id = auth.uid()
      )
    )
    AND (
      SELECT pod_status FROM public.pods WHERE pods.id = pod_messages.pod_id
    ) = 'active'
  );

-- Also fix SELECT policy so creator can read messages
DROP POLICY IF EXISTS "Pod members can read messages" ON public.pod_messages;

CREATE POLICY "Pod members can read messages" ON public.pod_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_members.pod_id = pod_messages.pod_id 
        AND pod_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.pods
      WHERE pods.id = pod_messages.pod_id
        AND pods.creator_id = auth.uid()
    )
  );

-- Also auto-insert creator into pod_members when a pod is created (idempotent)
INSERT INTO public.pod_members (pod_id, user_id, role)
SELECT id, creator_id, 'creator'
FROM public.pods
WHERE NOT EXISTS (
  SELECT 1 FROM public.pod_members pm
  WHERE pm.pod_id = pods.id AND pm.user_id = pods.creator_id
)
ON CONFLICT DO NOTHING;
