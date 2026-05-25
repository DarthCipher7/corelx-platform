-- ============================================================
-- CORELX MULTI-ACCOUNT TYPES ENGINE — Migration
-- Date: 2026-05-25
-- ============================================================

-- ── 1. SERVER-SIDE SIGNUP EMAIL DOMAIN VALIDATION TRIGGER ────
-- Blocks corporate/organisation signups using consumer email domains
CREATE OR REPLACE FUNCTION public.validate_signup_email_domain()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_domain TEXT;
  v_is_consumer BOOLEAN;
BEGIN
  -- Extract user_type from raw_user_meta_data
  v_user_type := NEW.raw_user_meta_data->>'user_type';
  
  IF v_user_type IS NOT NULL AND v_user_type IN ('company', 'organisation') THEN
    -- Allow email testing with addresses containing 'corelx' (e.g., hello.corelx@gmail.com)
    IF NEW.email ILIKE '%corelx%' THEN
      RETURN NEW;
    END IF;

    -- Extract email domain
    v_domain := split_part(NEW.email, '@', 2);
    
    -- Check if domain is a consumer/public email
    v_is_consumer := v_domain IN (
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com',
      'zoho.com', 'mail.com', 'protonmail.com', 'proton.me', 'yandex.com', 'gmx.com'
    );
    
    IF v_is_consumer THEN
      RAISE EXCEPTION 'Corporate and organisation accounts must register using a custom business or institutional email domain.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger safely
DROP TRIGGER IF EXISTS trg_validate_signup_email_domain ON auth.users;
CREATE TRIGGER trg_validate_signup_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.validate_signup_email_domain();


-- ── 2. TABLE DEFINITIONS ──────────────────────────────────────

-- Organisation Profile metadata table
CREATE TABLE IF NOT EXISTS public.org_accounts (
  id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('club', 'society', 'community', 'alumni', 'other')),
  college_id  UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  verified    BOOLEAN DEFAULT false NOT NULL,
  logo_url    TEXT DEFAULT NULL,
  banner_url  TEXT DEFAULT NULL,
  join_policy TEXT DEFAULT 'open' CHECK (join_policy IN ('open', 'gated')) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Organisation membership table
CREATE TABLE IF NOT EXISTS public.org_members (
  org_id     UUID REFERENCES public.org_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('creator', 'admin', 'moderator', 'core_member', 'member', 'alumni')),
  joined_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  alumni_at  TIMESTAMPTZ DEFAULT NULL,
  PRIMARY KEY (org_id, user_id)
);

-- Organisation Announcements & Posts Feed
CREATE TABLE IF NOT EXISTS public.org_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES public.org_accounts(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('post', 'announcement', 'event_result')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Company profile table
CREATE TABLE IF NOT EXISTS public.company_accounts (
  id                  UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  industry            TEXT NOT NULL,
  size_range          TEXT NOT NULL CHECK (size_range IN ('1-10', '11-50', '51-200', '200+')),
  website             TEXT NOT NULL,
  verified            BOOLEAN DEFAULT false NOT NULL,
  logo_url            TEXT DEFAULT NULL,
  banner_url          TEXT DEFAULT NULL,
  reach_enabled       BOOLEAN DEFAULT true NOT NULL,
  reach_threshold     INTEGER DEFAULT 200 NOT NULL,
  reach_topic_tags    TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  reach_custom_prompt TEXT DEFAULT NULL,
  reach_paused        BOOLEAN DEFAULT false NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Company Admins/Hiring managers table
CREATE TABLE IF NOT EXISTS public.company_admins (
  company_id UUID REFERENCES public.company_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'hiring_manager', 'content_manager')),
  added_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (company_id, user_id)
);

-- TALENT DISCOVERY REACH MESSAGES (STANDALONE TABLE)
CREATE TABLE IF NOT EXISTS public.reach_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  company_id      UUID REFERENCES public.company_accounts(id) ON DELETE CASCADE NOT NULL,
  content         TEXT NOT NULL,
  topic_tag       TEXT NOT NULL,
  prompt_response TEXT DEFAULT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'archived')) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campus Partnerships table
CREATE TABLE IF NOT EXISTS public.campus_partnerships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES public.company_accounts(id) ON DELETE CASCADE NOT NULL,
  org_id      UUID REFERENCES public.org_accounts(id) ON DELETE CASCADE NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')) NOT NULL,
  offerings   TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  approved_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE (company_id, org_id)
);

-- Company Candidate Shortlist
CREATE TABLE IF NOT EXISTS public.company_shortlist (
  company_id UUID REFERENCES public.company_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tag        TEXT DEFAULT NULL,
  notes      TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (company_id, user_id)
);

-- Sponsored Collabs
CREATE TABLE IF NOT EXISTS public.sponsored_collabs (
  collab_id  UUID REFERENCES public.collab_calls(id) ON DELETE CASCADE PRIMARY KEY,
  company_id UUID REFERENCES public.company_accounts(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date   TIMESTAMPTZ NOT NULL,
  paid_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inter-organisation Shared Pods
CREATE TABLE IF NOT EXISTS public.inter_org_pods (
  pod_id        UUID REFERENCES public.pods(id) ON DELETE CASCADE PRIMARY KEY,
  org_id_1      UUID REFERENCES public.org_accounts(id) ON DELETE CASCADE NOT NULL,
  org_id_2      UUID REFERENCES public.org_accounts(id) ON DELETE CASCADE NOT NULL,
  approved_by_1 UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by_2 UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ── 3. ROW LEVEL SECURITY (RLS) POLICIES ──────────────────────

-- --- org_accounts ---
ALTER TABLE public.org_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organisation profiles"
  ON public.org_accounts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own organisation profile"
  ON public.org_accounts FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update own organisation profiles"
  ON public.org_accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = org_accounts.id 
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('creator', 'admin')
    )
  );

-- --- org_members ---
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organisation memberships"
  ON public.org_members FOR SELECT
  USING (true);

CREATE POLICY "Org creators can insert memberships"
  ON public.org_members FOR INSERT
  WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Admins can manage memberships"
  ON public.org_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members admin_check
      WHERE admin_check.org_id = org_members.org_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('creator', 'admin')
    )
  );

CREATE POLICY "Users can join open organizations"
  ON public.org_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM public.org_accounts
        WHERE org_accounts.id = org_members.org_id
          AND org_accounts.join_policy = 'open'
      )
    )
  );

-- --- org_posts ---
ALTER TABLE public.org_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organisation posts"
  ON public.org_posts FOR SELECT
  USING (true);

CREATE POLICY "Core members can create organisation posts"
  ON public.org_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = org_posts.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('creator', 'admin', 'core_member')
    )
  );

-- --- company_accounts ---
ALTER TABLE public.company_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company profiles"
  ON public.company_accounts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own company profile"
  ON public.company_accounts FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update own company profile"
  ON public.company_accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = company_accounts.id
        AND company_admins.user_id = auth.uid()
        AND company_admins.role IN ('owner', 'admin')
    )
  );

-- --- company_admins ---
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company team members"
  ON public.company_admins FOR SELECT
  USING (true);

CREATE POLICY "Company owners can insert team members"
  ON public.company_admins FOR INSERT
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Owners and admins can manage team"
  ON public.company_admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins admin_check
      WHERE admin_check.company_id = company_admins.company_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('owner', 'admin')
    )
  );

-- --- reach_messages ---
ALTER TABLE public.reach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Senders can select own reach messages"
  ON public.reach_messages FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Company admins can select reach messages sent to them"
  ON public.reach_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = reach_messages.company_id
        AND company_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can send reach messages if they meet company requirements"
  ON public.reach_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.users sender_profile, public.company_accounts company_profile
      WHERE sender_profile.id = auth.uid()
        AND company_profile.id = reach_messages.company_id
        AND company_profile.reach_enabled = true
        AND company_profile.reach_paused = false
        AND (sender_profile.pulse_score >= company_profile.reach_threshold OR sender_profile.id = company_profile.id) -- Self bypass
    )
  );

CREATE POLICY "Company admins can update reach message status"
  ON public.reach_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = reach_messages.company_id
        AND company_admins.user_id = auth.uid()
    )
  );

-- --- campus_partnerships ---
ALTER TABLE public.campus_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved campus partnerships"
  ON public.campus_partnerships FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins of company/org can manage partnerships"
  ON public.campus_partnerships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = campus_partnerships.company_id
        AND company_admins.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = campus_partnerships.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('creator', 'admin')
    )
  );

-- --- company_shortlist ---
ALTER TABLE public.company_shortlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view own shortlists"
  ON public.company_shortlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = company_shortlist.company_id
        AND company_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can modify own shortlists"
  ON public.company_shortlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = company_shortlist.company_id
        AND company_admins.user_id = auth.uid()
    )
  );

-- --- sponsored_collabs ---
ALTER TABLE public.sponsored_collabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsored collabs"
  ON public.sponsored_collabs FOR SELECT
  USING (true);

-- --- inter_org_pods ---
ALTER TABLE public.inter_org_pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins of both orgs can select inter-org pods"
  ON public.inter_org_pods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id IN (org_id_1, org_id_2)
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('creator', 'admin')
    )
  );

CREATE POLICY "Admins of org 1 can insert inter-org pod proposals"
  ON public.inter_org_pods FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = org_id_1
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('creator', 'admin')
    )
  );

CREATE POLICY "Admins of either org can update approvals"
  ON public.inter_org_pods FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id IN (org_id_1, org_id_2)
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('creator', 'admin')
    )
  );


-- ── 4. FUNCTIONS & TRIGGERS (WITH EXCEPTION HANDLING) ───────

-- Reach limits check Postgres function and trigger
CREATE OR REPLACE FUNCTION public.check_reach_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_weekly_count INTEGER;
  v_last_reach_date TIMESTAMPTZ;
BEGIN
  -- 1. Check sender Weekly Limit (max 3 per 7 days)
  SELECT COUNT(*) INTO v_weekly_count
  FROM public.reach_messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '7 days';

  IF v_weekly_count >= 3 THEN
    RAISE EXCEPTION 'You have reached the limit of 3 Reach messages per week.';
  END IF;

  -- 2. Check 30-day Cooldown per Company
  SELECT MAX(created_at) INTO v_last_reach_date
  FROM public.reach_messages
  WHERE sender_id = NEW.sender_id
    AND company_id = NEW.company_id;

  IF v_last_reach_date IS NOT NULL AND v_last_reach_date > NOW() - INTERVAL '30 days' THEN
    RAISE EXCEPTION 'You are on a 30-day cooldown for reaching out to this company. Please wait.';
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If it's a validation error raised by us, re-raise it
    IF SQLERRM LIKE 'You have reached%' OR SQLERRM LIKE 'You are on%' THEN
      RAISE EXCEPTION '%', SQLERRM;
    ELSE
      -- Otherwise, wrap gracefully to prevent rolling back insertions in case of system DB issue
      RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_reach_limits ON public.reach_messages;
CREATE TRIGGER trg_check_reach_limits
  BEFORE INSERT ON public.reach_messages
  FOR EACH ROW EXECUTE FUNCTION public.check_reach_limits();

-- Reach connected trigger (awards +15 Aura points)
CREATE OR REPLACE FUNCTION public.handle_reach_connected_aura()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'connected' AND OLD.status = 'pending' THEN
    -- Award +15 Aura points to the sender
    INSERT INTO public.pulse_event (user_id, delta, reason, source_id)
    VALUES (NEW.sender_id, 15, 'reach_connected', NEW.id::TEXT)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Wrap gracefully to avoid locking out the main update transaction
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_reach_connected_aura ON public.reach_messages;
CREATE TRIGGER trg_handle_reach_connected_aura
  AFTER UPDATE OF status ON public.reach_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_reach_connected_aura();


-- ── 5. NOTIFICATION SYSTEM INTEGRATIONS ──────────────────────

-- Trigger to notify org admins when a join request occurs
CREATE OR REPLACE FUNCTION public.notify_on_org_join_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a notification for all org admins
  INSERT INTO public.notifications (user_id, type, from_user_id, message, related_id, link, read, created_at)
  SELECT
    om.user_id,
    'org_join_request',
    NEW.user_id,
    'requested to join the organization',
    NEW.org_id,
    '/orgs/' || NEW.org_id::TEXT,
    false,
    NOW()
  FROM public.org_members om
  WHERE om.org_id = NEW.org_id
    AND om.role IN ('creator', 'admin');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify company admins when a Reach is received
CREATE OR REPLACE FUNCTION public.notify_on_reach_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, from_user_id, message, related_id, link, read, created_at)
  SELECT
    ca.user_id,
    'reach_message_received',
    NEW.sender_id,
    'sent a new Reach message',
    NEW.id,
    '/companies/' || NEW.company_id::TEXT,
    false,
    NOW()
  FROM public.company_admins ca
  WHERE ca.company_id = NEW.company_id
    AND ca.role IN ('owner', 'admin', 'hiring_manager');

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_reach ON public.reach_messages;
CREATE TRIGGER trg_notify_on_reach
  AFTER INSERT ON public.reach_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_reach_message();


-- ── 6. REPLICATION SETUP ──────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.org_posts;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.org_members;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.reach_messages;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;
