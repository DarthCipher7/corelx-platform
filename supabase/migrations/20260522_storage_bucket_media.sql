-- ============================================================
-- CORELX STORAGE BUCKET & RLS POLICIES FOR MEDIA
-- Date: 2026-05-22
-- ============================================================

-- 1. CREATE THE 'media' BUCKET IF IT DOES NOT EXIST
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. ENABLE ROW LEVEL SECURITY ON STORAGE.OBJECTS (Supabase enables this by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES FOR 'media' BUCKET TO AVOID CONFLICTS
DROP POLICY IF EXISTS "Public Access to Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Uploads to Media Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access to Media Bucket" ON storage.objects;

-- 4. CREATE RLS POLICIES FOR 'media' BUCKET

-- Allow public read access to all files inside the 'media' bucket
CREATE POLICY "Public Access to Media Bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- Allow authenticated users to upload new files into the 'media' bucket
CREATE POLICY "Authenticated User Uploads to Media Bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

-- Allow uploaders to delete their own uploaded files from the 'media' bucket
CREATE POLICY "Owner Delete Access to Media Bucket" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.uid() = owner
  );
