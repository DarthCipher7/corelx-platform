-- ============================================================
-- NOTIFICATIONS FOR DMs AND POD MESSAGES
-- Date: 2026-05-22
-- ============================================================

-- Ensure notifications table has the right columns
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS link TEXT;

-- ── 1. DM NOTIFICATION TRIGGER ──────────────────────────────

-- Function: fires when a new direct message is inserted
CREATE OR REPLACE FUNCTION public.notify_on_dm()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify recipient if sender != recipient
  IF NEW.sender_id IS DISTINCT FROM NEW.recipient_id THEN
    INSERT INTO public.notifications (user_id, type, from_user_id, message, related_id, link, read, created_at)
    VALUES (
      NEW.recipient_id,
      'dm',
      NEW.sender_id,
      'sent you a message',
      NEW.id,
      '/messages',
      false,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_dm ON public.messages;
CREATE TRIGGER trg_notify_on_dm
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_dm();

-- ── 2. POD MESSAGE NOTIFICATION TRIGGER ─────────────────────

-- Function: fires when a new pod message is inserted
-- Notifies all pod members EXCEPT the sender
CREATE OR REPLACE FUNCTION public.notify_on_pod_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, from_user_id, message, related_id, link, read, created_at)
  SELECT
    pm.user_id,
    'pod_message',
    NEW.sender_id,
    'sent a message in the pod',
    NEW.id,
    '/pods/' || NEW.pod_id::TEXT,
    false,
    NOW()
  FROM public.pod_members pm
  WHERE pm.pod_id = NEW.pod_id
    AND pm.user_id != NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_pod_message ON public.pod_messages;
CREATE TRIGGER trg_notify_on_pod_message
  AFTER INSERT ON public.pod_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_pod_message();

-- ── 3. RLS FOR NOTIFICATIONS ─────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- triggers run as SECURITY DEFINER, allow all inserts

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
