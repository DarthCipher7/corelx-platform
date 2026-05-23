-- ============================================================
-- CORELX PULSE & OFFICIAL TAGS LAYER — Migration
-- Date: 2026-05-22
-- ============================================================

-- ── 1. EXTEND USERS TABLE ────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS pulse_score   INTEGER DEFAULT 150,
  ADD COLUMN IF NOT EXISTS pulse_frozen  BOOLEAN DEFAULT false;

-- ── 2. PULSE EVENT LOG TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pulse_event (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  source_id   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for pulse_event
ALTER TABLE public.pulse_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pulse events"
  ON public.pulse_event FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert pulse events"
  ON public.pulse_event FOR INSERT
  WITH CHECK (true);

-- ── 3. PULSE ENDORSEMENTS TABLE ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.pulse_endorsements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flagged     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- RLS for pulse_endorsements
ALTER TABLE public.pulse_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pulse endorsements"
  ON public.pulse_endorsements FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can endorse others"
  ON public.pulse_endorsements FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ── 4. AUTO-UPDATE PULSE SCORE TRIGGER ──────────────────────
CREATE OR REPLACE FUNCTION public.update_user_pulse_score()
RETURNS TRIGGER AS $$
BEGIN
  -- If user's Pulse is frozen, do not apply changes
  IF (SELECT pulse_frozen FROM public.users WHERE id = NEW.user_id) = true THEN
    RETURN NEW;
  END IF;

  UPDATE public.users
  SET pulse_score = GREATEST(0, LEAST(1000, COALESCE(pulse_score, 150) + NEW.delta))
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_pulse_event_inserted ON public.pulse_event;
CREATE TRIGGER trg_on_pulse_event_inserted
  AFTER INSERT ON public.pulse_event
  FOR EACH ROW EXECUTE FUNCTION public.update_user_pulse_score();

-- ── 5. ENDORSE MEMBER FUNCTION ───────────────────────────────
CREATE OR REPLACE FUNCTION public.endorse_member(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  existing_endorsement_id UUID;
  recent_endorsement_count INTEGER;
  is_mutual BOOLEAN := false;
  sender_handle TEXT;
  receiver_frozen BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'You cannot endorse yourself';
  END IF;

  -- Check if receiver exists and is frozen
  SELECT pulse_frozen INTO receiver_frozen FROM public.users WHERE id = target_user_id;
  IF receiver_frozen = true THEN
    RAISE EXCEPTION 'This user''s Pulse is frozen';
  END IF;

  -- Check if already endorsed in the last 30 days
  SELECT id INTO existing_endorsement_id
  FROM public.pulse_endorsements
  WHERE sender_id = current_user_id
    AND receiver_id = target_user_id
    AND created_at > NOW() - INTERVAL '30 days';

  IF existing_endorsement_id IS NOT NULL THEN
    RAISE EXCEPTION 'You have already endorsed this member in the last 30 days';
  END IF;

  -- Check for mutual simultaneous endorsement (target user endorsed sender in last 30 days)
  SELECT COUNT(*) INTO recent_endorsement_count
  FROM public.pulse_endorsements
  WHERE sender_id = target_user_id
    AND receiver_id = current_user_id
    AND created_at > NOW() - INTERVAL '30 days';

  IF recent_endorsement_count > 0 THEN
    is_mutual := true;
  END IF;

  -- Insert the endorsement record
  INSERT INTO public.pulse_endorsements (sender_id, receiver_id, flagged)
  VALUES (current_user_id, target_user_id, is_mutual);

  -- Fetch sender's handle for the reason text
  SELECT handle INTO sender_handle FROM public.users WHERE id = current_user_id;

  -- Add Pulse event (+8) for target user
  INSERT INTO public.pulse_event (user_id, delta, reason, source_id)
  VALUES (target_user_id, 8, 'Received a +1 endorsement from @' || COALESCE(sender_handle, 'user'), current_user_id::TEXT);

  -- If it's mutual, we also flag it and could hold it or log it
  RETURN jsonb_build_object(
    'success', true,
    'flagged', is_mutual,
    'message', 'Endorsement registered successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. OFFICIAL VERIFICATION TAGS TABLE ──────────────────────
CREATE TABLE IF NOT EXISTS public.entity_verification (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type       TEXT NOT NULL CHECK (entity_type IN ('college', 'organisation', 'club', 'creator')),
  entity_id         UUID NOT NULL, -- references colleges(id), users(id) (org/creator), or pods(id) (club)
  tag_type          TEXT NOT NULL CHECK (tag_type IN ('institution', 'organisation', 'club', 'creator')),
  status            TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'revoked')),
  granted_by        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  granted_at        TIMESTAMPTZ DEFAULT NOW(),
  revoked_at        TIMESTAMPTZ,
  revocation_reason TEXT
);

-- RLS for entity_verification
ALTER TABLE public.entity_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entity verifications"
  ON public.entity_verification FOR SELECT
  USING (true);

CREATE POLICY "System can manage entity verifications"
  ON public.entity_verification FOR ALL
  USING (true);
