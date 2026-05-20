-- ============================================================
-- CORELX CAMPUS LAYER — Migration v1
-- Date: 2026-05-20
-- ============================================================

-- ── 1. COLLEGES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.colleges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  short_name      TEXT,
  email_domain    TEXT NOT NULL UNIQUE,
  geofence        JSONB,           -- GeoJSON polygon (OpenStreetMap source)
  city            TEXT,
  country         TEXT DEFAULT 'IN',
  is_verified     BOOLEAN DEFAULT true,
  hub_type        TEXT DEFAULT 'college', -- 'college' | 'society' | 'corporate'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with known Indian institutions and community spaces
INSERT INTO public.colleges (name, short_name, email_domain, city, hub_type) VALUES
  ('Indian Institute of Technology Bombay',     'IIT Bombay',  'iitb.ac.in',     'Mumbai', 'college'),
  ('Indian Institute of Technology Delhi',      'IIT Delhi',   'iitd.ac.in',     'Delhi', 'college'),
  ('Indian Institute of Technology Madras',     'IIT Madras',  'iitm.ac.in',     'Chennai', 'college'),
  ('Indian Institute of Technology Bangalore',  'IISc',        'iisc.ac.in',     'Bangalore', 'college'),
  ('National Institute of Technology Trichy',   'NIT Trichy',  'nitt.edu',       'Tiruchirappalli', 'college'),
  ('BITS Pilani',                               'BITS',        'pilani.bits-pilani.ac.in', 'Pilani', 'college'),
  ('Delhi Technological University',            'DTU',         'dtu.ac.in',      'Delhi', 'college'),
  ('Vellore Institute of Technology',           'VIT',         'vit.ac.in',      'Vellore', 'college'),
  ('Manipal Academy of Higher Education',       'MAHE',        'manipal.edu',    'Manipal', 'college'),
  ('Symbiosis International University',        'SIU',         'siu.edu.in',     'Pune', 'college'),
  ('Prestige Palms Residential Society',        'Prestige Palms', 'prestigepalms.com', 'Bangalore', 'society'),
  ('Sherwood Heights RWA',                      'Sherwood',    'sherwoodheights.res', 'Mumbai', 'society')
ON CONFLICT (email_domain) DO NOTHING;


-- ── 2. EXTEND USERS TABLE ────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_domain         TEXT,
  ADD COLUMN IF NOT EXISTS college_id           UUID REFERENCES public.colleges(id),
  ADD COLUMN IF NOT EXISTS is_email_verified    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS campus_check_passed  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS campus_check_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS events_attended_count INTEGER DEFAULT 0;

-- ── 3. EVENTS ────────────────────────────────────────────────
-- NOTE: expires_at cannot be a GENERATED column because TIMESTAMPTZ + INTERVAL
-- is not considered immutable by PostgreSQL (timezone GUC dependency).
-- We use a BEFORE INSERT OR UPDATE trigger instead.
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  college_id      UUID REFERENCES public.colleges(id),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'social',
    -- 'sports' | 'music' | 'academic' | 'social' | 'misc' | 'hackathon'
  trust_tier      TEXT NOT NULL DEFAULT 'open',
    -- 'open' | 'checked' | 'guarded'
  location_name   TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  expires_at      TIMESTAMPTZ,              -- set by trigger: ends_at + 1 hour
  min_headcount   INTEGER DEFAULT 1,
  max_headcount   INTEGER,
  is_active       BOOLEAN DEFAULT true,
  require_mutual  BOOLEAN DEFAULT false,    -- Guarded: must share prior event
  require_face    BOOLEAN DEFAULT false,    -- Guarded: optional face liveness
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function: auto-set expires_at = ends_at + 1 hour
CREATE OR REPLACE FUNCTION set_event_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.ends_at + INTERVAL '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_event_expires_at
  BEFORE INSERT OR UPDATE OF ends_at ON public.events
  FOR EACH ROW EXECUTE FUNCTION set_event_expires_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_expires_at ON public.events(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_starts_at  ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_college    ON public.events(college_id);



-- ── 4. EVENT RSVPs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' | 'approved' | 'declined' | 'waitlist' | 'attending'
  verified_email  BOOLEAN DEFAULT false,
  verified_campus BOOLEAN DEFAULT false,
  verified_face   BOOLEAN DEFAULT false,
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event  ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user   ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON public.event_rsvps(status);

-- ── 5. ACADEMIC PODS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  college_id      UUID REFERENCES public.colleges(id),
  name            TEXT NOT NULL,
  pod_type        TEXT NOT NULL DEFAULT 'project',
    -- 'hackathon' | 'class' | 'club' | 'project'
  description     TEXT,
  visibility      TEXT NOT NULL DEFAULT 'open',
    -- 'open' | 'invite'
  max_members     INTEGER,
  role_tags       TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pod_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id          UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member',
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pod_id, user_id)
);

-- ── 6. VERIFICATION AUDIT LOG (no coordinates stored) ────────
CREATE TABLE IF NOT EXISTS public.verification_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id        UUID REFERENCES public.events(id) ON DELETE SET NULL,
  check_type      TEXT NOT NULL,  -- 'email' | 'campus' | 'face'
  result          TEXT NOT NULL,  -- 'pass' | 'fail'
  checked_at      TIMESTAMPTZ DEFAULT NOW()
  -- NO lat/lng ever stored — data retention 30 days
);

-- Auto-delete verification logs after 30 days (requires pg_cron)
-- SELECT cron.schedule('cleanup-verification-logs', '0 3 * * *',
--   'DELETE FROM verification_log WHERE checked_at < NOW() - INTERVAL ''30 days''');

-- ── 7. AUTO-EXPIRY pg_cron JOB ───────────────────────────────
-- Requires pg_cron extension enabled in Supabase dashboard
-- SELECT cron.schedule('expire-events', '*/15 * * * *',
--   'UPDATE events SET is_active = false WHERE expires_at < NOW() AND is_active = true');

-- ── 8. RLS POLICIES ─────────────────────────────────────────

-- Events: anyone authenticated can read active events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active events readable by all authenticated" ON public.events
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "Organisers can insert own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = organiser_id);
CREATE POLICY "Organisers can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = organiser_id);

-- RSVPs
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own RSVPs" ON public.event_rsvps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organisers see RSVPs for their events" ON public.event_rsvps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND events.organiser_id = auth.uid())
  );
CREATE POLICY "Users can create their own RSVPs" ON public.event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organisers can update RSVPs for their events" ON public.event_rsvps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND events.organiser_id = auth.uid())
  );

-- Pods
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open pods readable by all authenticated" ON public.pods
  FOR SELECT USING (auth.role() = 'authenticated' AND (visibility = 'open' OR creator_id = auth.uid()));
CREATE POLICY "Creators can insert own pods" ON public.pods
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Colleges: read-only for authenticated
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colleges readable by all authenticated" ON public.colleges
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── 9. NOTIFICATION TRIGGERS ─────────────────────────────────
-- Notify organiser when someone joins a Guarded event
CREATE OR REPLACE FUNCTION notify_on_join_request()
RETURNS TRIGGER AS $$
DECLARE
  v_organiser_id UUID;
  v_event_title  TEXT;
BEGIN
  SELECT organiser_id, title INTO v_organiser_id, v_event_title
  FROM events WHERE id = NEW.event_id;

  IF v_organiser_id IS NOT NULL AND v_organiser_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, message, actor_id, related_id)
    VALUES (
      v_organiser_id,
      'join_request',
      'Someone requested to join your event: ' || v_event_title,
      NEW.user_id,
      NEW.event_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_join_request
  AFTER INSERT ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION notify_on_join_request();
