-- ============================================================
-- CORELX TRACES RICH MEDIA SHARING — Migration
-- Date: 2026-05-23
-- ============================================================

ALTER TABLE public.traces
  ADD COLUMN IF NOT EXISTS media_url  TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')) DEFAULT NULL;
