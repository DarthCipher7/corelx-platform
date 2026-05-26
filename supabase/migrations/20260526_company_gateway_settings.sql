-- ============================================================
-- CORELX COMPANY GATEWAY SETTINGS — Migration
-- Date: 2026-05-26
-- Adds dynamic limits to company accounts and updates the trigger check
-- ============================================================

-- 1. Alter company_accounts to support dynamic settings
ALTER TABLE public.company_accounts 
  ADD COLUMN IF NOT EXISTS reach_cooldown_days INTEGER DEFAULT 30 NOT NULL,
  ADD COLUMN IF NOT EXISTS reach_weekly_limit INTEGER DEFAULT 50 NOT NULL,
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

-- 2. Update reach limit check function to use company-specific dynamic limits
CREATE OR REPLACE FUNCTION public.check_reach_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_weekly_count INTEGER;
  v_last_reach_date TIMESTAMPTZ;
  v_weekly_limit INTEGER;
  v_cooldown_days INTEGER;
BEGIN
  -- Fetch custom limits configured by the company
  SELECT reach_weekly_limit, reach_cooldown_days 
  INTO v_weekly_limit, v_cooldown_days
  FROM public.company_accounts
  WHERE id = NEW.company_id;

  -- Default fallbacks if they are null
  IF v_weekly_limit IS NULL THEN 
    v_weekly_limit := 50; 
  END IF;
  IF v_cooldown_days IS NULL THEN 
    v_cooldown_days := 30; 
  END IF;

  -- 1. Check sender Weekly Limit
  SELECT COUNT(*) INTO v_weekly_count
  FROM public.reach_messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '7 days';

  IF v_weekly_count >= v_weekly_limit THEN
    RAISE EXCEPTION 'You have reached the limit of % Reach messages per week.', v_weekly_limit;
  END IF;

  -- 2. Check Cooldown per Company
  SELECT MAX(created_at) INTO v_last_reach_date
  FROM public.reach_messages
  WHERE sender_id = NEW.sender_id
    AND company_id = NEW.company_id;

  IF v_last_reach_date IS NOT NULL AND v_last_reach_date > NOW() - (v_cooldown_days * INTERVAL '1 day') THEN
    RAISE EXCEPTION 'You are on a %-day cooldown for reaching out to this company. Please wait.', v_cooldown_days;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If it's a validation error raised by us, re-raise it
    IF SQLERRM LIKE 'You have reached%' OR SQLERRM LIKE 'You are on%' THEN
      RAISE EXCEPTION '%', SQLERRM;
    ELSE
      -- Otherwise, wrap gracefully to prevent rolling back insertions in case of system DB issues
      RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
