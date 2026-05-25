-- ============================================================
-- CORELX DELETE ACCOUNT ENGINE — Migration
-- Date: 2026-05-25
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS VOID AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from public.users first. 
  -- Cascading constraints will clean up related public tables (skills, posts, flares, etc.).
  DELETE FROM public.users WHERE id = current_user_id;

  -- Then delete from auth.users.
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
