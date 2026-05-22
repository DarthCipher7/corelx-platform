-- ============================================================
-- ADD MEDIA URL COLUMN TO DIRECT MESSAGES TABLE
-- Date: 2026-05-22
-- ============================================================

-- Add media_url to the public.messages table to support image/video sharing
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Refresh schema cache if needed
COMMENT ON COLUMN public.messages.media_url IS 'Direct URL to files shared in chat (stored in media bucket)';
