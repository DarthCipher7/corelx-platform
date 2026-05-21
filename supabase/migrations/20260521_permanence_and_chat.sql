-- ============================================================
-- CORELX PERMANENCE & POD CHAT SPACE — Migration
-- Date: 2026-05-21
-- ============================================================

-- ── 1. POD PERMANENCE CHANGES ────────────────────────────────
-- Create pod_status ENUM
DO $$ BEGIN
  CREATE TYPE public.pod_status_t AS ENUM ('active', 'archived', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alter pods table
ALTER TABLE public.pods
  ADD COLUMN IF NOT EXISTS pod_status public.pod_status_t NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_purge_at TIMESTAMPTZ;

-- Trigger to block delete if pod has members
CREATE OR REPLACE FUNCTION public.check_pod_delete_allowed()
RETURNS TRIGGER AS $$
BEGIN
  -- We block delete if there are other members besides the creator.
  IF (SELECT COUNT(*) FROM public.pod_members WHERE pod_id = OLD.id AND user_id != OLD.creator_id) > 0 THEN
    RAISE EXCEPTION 'Cannot delete a Pod with active members. Please archive it instead.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_pod_delete_allowed
  BEFORE DELETE ON public.pods
  FOR EACH ROW EXECUTE FUNCTION public.check_pod_delete_allowed();


-- Verify pod_members role column is present and add constraint
ALTER TABLE public.pod_members
  DROP CONSTRAINT IF EXISTS chk_pod_member_role,
  ADD CONSTRAINT chk_pod_member_role CHECK (role IN ('creator', 'admin', 'member'));

-- Trigger to auto-add creator to pod_members on pod launch
CREATE OR REPLACE FUNCTION public.auto_join_creator_to_pod()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pod_members (pod_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator')
  ON CONFLICT (pod_id, user_id) DO UPDATE SET role = 'creator';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_auto_join_creator
  AFTER INSERT ON public.pods
  FOR EACH ROW EXECUTE FUNCTION public.auto_join_creator_to_pod();

-- Trigger to transfer ownership when creator leaves
CREATE OR REPLACE FUNCTION public.handle_pod_member_leave()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_id UUID;
  v_new_owner_id UUID;
BEGIN
  -- Find the pod creator
  SELECT creator_id INTO v_creator_id FROM public.pods WHERE id = OLD.pod_id;
  
  -- If the creator left (deleted their membership)
  IF OLD.user_id = v_creator_id THEN
    -- Find the oldest standing Admin
    SELECT user_id INTO v_new_owner_id 
    FROM public.pod_members 
    WHERE pod_id = OLD.pod_id AND role = 'admin'
    ORDER BY joined_at ASC
    LIMIT 1;
    
    -- If no admin, find the oldest standing Member
    IF v_new_owner_id IS NULL THEN
      SELECT user_id INTO v_new_owner_id 
      FROM public.pod_members 
      WHERE pod_id = OLD.pod_id AND role = 'member'
      ORDER BY joined_at ASC
      LIMIT 1;
    END IF;
    
    IF v_new_owner_id IS NOT NULL THEN
      -- Transfer ownership to this new user, and make them creator
      UPDATE public.pods SET creator_id = v_new_owner_id WHERE id = OLD.pod_id;
      UPDATE public.pod_members SET role = 'creator' WHERE pod_id = OLD.pod_id AND user_id = v_new_owner_id;
    ELSE
      -- No one else is left, archive the pod
      UPDATE public.pods 
      SET is_active = false, 
          pod_status = 'archived',
          archived_at = NOW(),
          auto_purge_at = NOW() + INTERVAL '30 days'
      WHERE id = OLD.pod_id;
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_handle_pod_member_leave
  AFTER DELETE ON public.pod_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_pod_member_leave();


-- ── 3. POD CHAT SPACE ─────────────────────────────────────────
-- Create pod_messages table
CREATE TABLE IF NOT EXISTS public.pod_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id          UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_pinned       BOOLEAN DEFAULT false,
  is_system       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to enforce maximum of 3 pinned messages per pod
CREATE OR REPLACE FUNCTION public.check_pod_message_pins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_pinned = true AND (SELECT COUNT(*) FROM public.pod_messages WHERE pod_id = NEW.pod_id AND is_pinned = true AND id != NEW.id) >= 3 THEN
    RAISE EXCEPTION 'A Pod can have at most 3 pinned messages.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_pod_message_pins
  BEFORE INSERT OR UPDATE OF is_pinned ON public.pod_messages
  FOR EACH ROW EXECUTE FUNCTION public.check_pod_message_pins();

-- Enable RLS for pod_messages
ALTER TABLE public.pod_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pod members can read messages" ON public.pod_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_members.pod_id = pod_messages.pod_id AND pod_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Pod members can insert messages" ON public.pod_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_members.pod_id = pod_messages.pod_id AND pod_members.user_id = auth.uid()
    ) AND (
      SELECT pod_status FROM public.pods WHERE pods.id = pod_messages.pod_id
    ) = 'active' -- Read-only when archived
  );

CREATE POLICY "Pod creators/admins can update pins" ON public.pod_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_members.pod_id = pod_messages.pod_id AND pod_members.user_id = auth.uid() AND pod_members.role IN ('creator', 'admin')
    )
  );


-- ── 4. COLLAB PERMANENCE CHANGES ──────────────────────────────
-- Create collab_status ENUM
DO $$ BEGIN
  CREATE TYPE public.collab_status_t AS ENUM ('open', 'has_responses', 'closed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alter collab_calls table
ALTER TABLE public.collab_calls
  ADD COLUMN IF NOT EXISTS collab_status public.collab_status_t NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Trigger to update collab_status when response (spark) is created
CREATE OR REPLACE FUNCTION public.update_collab_status_on_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_type = 'collab' AND NEW.target_id IS NOT NULL THEN
    UPDATE public.collab_calls
    SET collab_status = 'has_responses'
    WHERE id = NEW.target_id AND collab_status = 'open';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_update_collab_status_on_response
  AFTER INSERT ON public.sparks
  FOR EACH ROW EXECUTE FUNCTION public.update_collab_status_on_response();

-- Prevent updating or deleting collab if it has responses
CREATE OR REPLACE FUNCTION public.check_collab_edit_allowed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.collab_status != 'open' THEN
      RAISE EXCEPTION 'Cannot delete a collaboration post after responses have been received.';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.collab_status != 'open' THEN
      -- Allow updating only collab_status and closed_at
      IF (NEW.title IS DISTINCT FROM OLD.title OR
          NEW.description IS DISTINCT FROM OLD.description OR
          NEW.type IS DISTINCT FROM OLD.type OR
          NEW.budget IS DISTINCT FROM OLD.budget OR
          NEW.skills IS DISTINCT FROM OLD.skills OR
          NEW.time_commitment IS DISTINCT FROM OLD.time_commitment OR
          NEW.spots IS DISTINCT FROM OLD.spots OR
          NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
        RAISE EXCEPTION 'Cannot edit details of a collaboration post after responses have been received. You can only close it.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_collab_edit_allowed
  BEFORE UPDATE OR DELETE ON public.collab_calls
  FOR EACH ROW EXECUTE FUNCTION public.check_collab_edit_allowed();
