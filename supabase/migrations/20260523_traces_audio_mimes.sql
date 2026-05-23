-- ============================================================
-- CORELX TRACES AUDIO MIME TYPES — Migration
-- Date: 2026-05-23
-- ============================================================

-- Update allowed mime types on the 'media' bucket to include audio formats
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/x-m4a', 'audio/mp4'
]
WHERE id = 'media';
