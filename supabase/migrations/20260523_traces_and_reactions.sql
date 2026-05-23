-- ============================================================
-- CORELX TRACES & EPHEMERAL MOMENTS LAYER — Migration
-- Date: 2026-05-23
-- ============================================================

-- ── 1. CREATE TRACES TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.traces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('in_the_zone', 'stuck', 'just_shipped', 'looking_for', 'thought', 'working_on', 'vibe_check')),
  content       TEXT NOT NULL CHECK (char_length(content) <= 140),
  scope         TEXT NOT NULL CHECK (scope IN ('public', 'pod_only')) DEFAULT 'public',
  pod_id        UUID REFERENCES public.pods(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  reported_at   TIMESTAMPTZ DEFAULT NULL
);

-- Enable RLS for traces
ALTER TABLE public.traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public traces"
  ON public.traces FOR SELECT
  USING (scope = 'public');

CREATE POLICY "Pod members can view pod_only traces"
  ON public.traces FOR SELECT
  USING (
    scope = 'pod_only' AND (
      pod_id IS NULL OR EXISTS (
        SELECT 1 FROM public.pod_members
        WHERE pod_members.pod_id = traces.pod_id AND pod_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can insert own traces"
  ON public.traces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own traces"
  ON public.traces FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.pod_members
    WHERE pod_members.pod_id = traces.pod_id 
      AND pod_members.user_id = auth.uid() 
      AND pod_members.role IN ('creator', 'admin')
  ));

-- ── 2. CREATE TRACE REACTIONS TABLE ───────────────────────────
CREATE TABLE IF NOT EXISTS public.trace_reactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id      UUID NOT NULL REFERENCES public.traces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('resonate', 'reply', 'collab_request')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trace_id, user_id, reaction_type)
);

-- Enable RLS for trace_reactions
ALTER TABLE public.trace_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trace reactions"
  ON public.trace_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own trace reactions"
  ON public.trace_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trace reactions"
  ON public.trace_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ── 3. EXTEND SPARKS TABLE FOR COLLAB CONVERSIONS ────────────
ALTER TABLE public.sparks
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS trace_id UUID REFERENCES public.traces(id) ON DELETE SET NULL;

-- ── 4. AURA EVENT TRIGGERS ────────────────────────────────────

-- Trigger 1: AFTER INSERT ON public.traces (+2 Aura, daily cap: 1)
CREATE OR REPLACE FUNCTION public.handle_trace_aura_points()
RETURNS TRIGGER AS $$
DECLARE
  daily_posted_count INTEGER;
BEGIN
  -- Count trace posting events for this user in the last 24h
  SELECT COUNT(*) INTO daily_posted_count
  FROM public.pulse_event
  WHERE user_id = NEW.user_id
    AND reason = 'trace_posted'
    AND created_at > NOW() - INTERVAL '1 day';

  IF daily_posted_count = 0 THEN
    INSERT INTO public.pulse_event (user_id, delta, reason, source_id)
    VALUES (NEW.user_id, 2, 'trace_posted', NEW.id::TEXT);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_trace_inserted ON public.traces;
CREATE TRIGGER trg_on_trace_inserted
  AFTER INSERT ON public.traces
  FOR EACH ROW EXECUTE FUNCTION public.handle_trace_aura_points();


-- Trigger 2: AFTER INSERT ON public.trace_reactions (+5 Aura on 10+ resonate)
CREATE OR REPLACE FUNCTION public.handle_trace_resonate_aura_points()
RETURNS TRIGGER AS $$
DECLARE
  v_resonate_count INTEGER;
  v_trace_owner_id UUID;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Only trigger for 'resonate' reactions
  IF NEW.reaction_type != 'resonate' THEN
    RETURN NEW;
  END IF;

  -- Count resonate reactions
  SELECT COUNT(*) INTO v_resonate_count
  FROM public.trace_reactions
  WHERE trace_id = NEW.trace_id AND reaction_type = 'resonate';

  IF v_resonate_count >= 10 THEN
    -- Get trace owner
    SELECT user_id INTO v_trace_owner_id FROM public.traces WHERE id = NEW.trace_id;

    -- Check if already rewarded +5 for this trace
    SELECT EXISTS (
      SELECT 1 FROM public.pulse_event
      WHERE user_id = v_trace_owner_id
        AND reason = 'trace_resonate_milestone'
        AND source_id = NEW.trace_id::TEXT
    ) INTO v_already_rewarded;

    IF NOT v_already_rewarded AND v_trace_owner_id IS NOT NULL THEN
      INSERT INTO public.pulse_event (user_id, delta, reason, source_id)
      VALUES (v_trace_owner_id, 5, 'trace_resonate_milestone', NEW.trace_id::TEXT);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_trace_reaction_inserted ON public.trace_reactions;
CREATE TRIGGER trg_on_trace_reaction_inserted
  AFTER INSERT ON public.trace_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_trace_resonate_aura_points();


-- Trigger 3: AFTER INSERT ON public.sparks (+3 Aura when Collab? leads to application)
CREATE OR REPLACE FUNCTION public.handle_spark_trace_collab_aura_points()
RETURNS TRIGGER AS $$
DECLARE
  v_trace_owner_id UUID;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Verify if it's a collab application that originated from a trace
  IF NEW.intent_type = 'collab' AND NEW.source = 'trace_collab_request' AND NEW.trace_id IS NOT NULL THEN
    -- Get trace owner
    SELECT user_id INTO v_trace_owner_id FROM public.traces WHERE id = NEW.trace_id;

    -- Verify if we already rewarded for this specific collab spark ID
    SELECT EXISTS (
      SELECT 1 FROM public.pulse_event
      WHERE user_id = v_trace_owner_id
        AND reason = 'trace_collab_submitted'
        AND source_id = NEW.id::TEXT
    ) INTO v_already_rewarded;

    IF NOT v_already_rewarded AND v_trace_owner_id IS NOT NULL THEN
      INSERT INTO public.pulse_event (user_id, delta, reason, source_id)
      VALUES (v_trace_owner_id, 3, 'trace_collab_submitted', NEW.id::TEXT);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_spark_inserted_for_trace ON public.sparks;
CREATE TRIGGER trg_on_spark_inserted_for_trace
  AFTER INSERT ON public.sparks
  FOR EACH ROW EXECUTE FUNCTION public.handle_spark_trace_collab_aura_points();


-- ── 5. EXPIRY CLEANUP FUNCTION & CRON JOB ─────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_expired_traces()
RETURNS VOID AS $$
BEGIN
  -- Delete expired traces, excluding reported ones that are less than 7 days old
  DELETE FROM public.traces
  WHERE expires_at < NOW()
    AND (
      reported_at IS NULL 
      OR reported_at < NOW() - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cron job if pg_cron is enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('cleanup-expired-traces-job', '*/15 * * * *', 'SELECT public.cleanup_expired_traces();');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- ── 6. ENABLE REALTIME ────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.traces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trace_reactions;
