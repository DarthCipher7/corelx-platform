-- ============================================================
-- FIX NOTIFICATIONS SCHEMA (ADD MISSING COLUMNS & UPDATE TYPES)
-- Date: 2026-05-22
-- ============================================================

-- 1. Ensure all columns used by triggers and navbar exist on public.notifications
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS related_id UUID;

-- 2. Drop and recreate check constraint to include new notification types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('spark', 'comment', 'follow', 'collab_request', 'message', 'spark_accepted', 'mention', 'dm', 'pod_message', 'join_request'));
