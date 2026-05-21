-- ============================================================
-- CORELX EVENT CHAT AND MEDIA SHARING — Migration
-- Date: 2026-05-21
-- ============================================================

-- 1. ADD MEDIA_URL TO POD_MESSAGES
ALTER TABLE public.pod_messages 
  ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 2. CREATE EVENT_MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.event_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  media_url       TEXT,
  is_pinned       BOOLEAN DEFAULT false,
  is_system       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRIGGER FOR EVENT MESSAGE PIN LIMIT (MAX 3)
CREATE OR REPLACE FUNCTION public.check_event_message_pins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_pinned = true AND (
    SELECT COUNT(*) 
    FROM public.event_messages 
    WHERE event_id = NEW.event_id AND is_pinned = true AND id != NEW.id
  ) >= 3 THEN
    RAISE EXCEPTION 'An Event can have at most 3 pinned messages.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_event_message_pins
  BEFORE INSERT OR UPDATE OF is_pinned ON public.event_messages
  FOR EACH ROW EXECUTE FUNCTION public.check_event_message_pins();

-- 4. ENABLE ROW LEVEL SECURITY FOR EVENT_MESSAGES
ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR EVENT_MESSAGES
DROP POLICY IF EXISTS "Users can read event messages if host or attendee" ON public.event_messages;
CREATE POLICY "Users can read event messages if host or attendee" ON public.event_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_messages.event_id AND events.organiser_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.event_rsvps 
      WHERE event_rsvps.event_id = event_messages.event_id 
        AND event_rsvps.user_id = auth.uid() 
        AND event_rsvps.status IN ('approved', 'attending')
    )
  );

DROP POLICY IF EXISTS "Users can insert event messages if host or attendee" ON public.event_messages;
CREATE POLICY "Users can insert event messages if host or attendee" ON public.event_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = event_messages.event_id AND events.organiser_id = auth.uid()
      ) OR EXISTS (
        SELECT 1 FROM public.event_rsvps 
        WHERE event_rsvps.event_id = event_messages.event_id 
          AND event_rsvps.user_id = auth.uid() 
          AND event_rsvps.status IN ('approved', 'attending')
      )
    )
  );

DROP POLICY IF EXISTS "Event hosts can update pins" ON public.event_messages;
CREATE POLICY "Event hosts can update pins" ON public.event_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_messages.event_id AND events.organiser_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event hosts can delete messages" ON public.event_messages;
CREATE POLICY "Event hosts can delete messages" ON public.event_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_messages.event_id AND events.organiser_id = auth.uid()
    )
  );

-- 6. ADD BOTH CHAT TABLES TO SUPABASE_REALTIME PUBLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.pod_messages;
    EXCEPTION
      WHEN duplicate_object OR database_to_xml_not_supported OR object_not_in_prerequisite_state THEN NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.event_messages;
    EXCEPTION
      WHEN duplicate_object OR database_to_xml_not_supported OR object_not_in_prerequisite_state THEN NULL;
    END;
  END IF;
END $$;
