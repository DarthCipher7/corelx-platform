-- Add duration and expiration columns to public.pods
ALTER TABLE public.pods
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_type TEXT NOT NULL DEFAULT 'unlimited';
