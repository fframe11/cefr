-- ==============================================================================
-- Migration: 20260925000005_create_storage_buckets.sql
-- Description: Provision Supabase Storage Buckets and RLS Policies for CEFR Audio
-- ==============================================================================

-- 1. Insert Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('audio-listening', 'audio-listening', true, 20971520, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']::text[]),
  ('audio-speaking-submissions', 'audio-speaking-submissions', false, 10485760, ARRAY['audio/webm', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/mpeg']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Objects RLS Policies

-- audio-listening: public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for audio-listening'
  ) THEN
    CREATE POLICY "Public read for audio-listening"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'audio-listening');
  END IF;
END $$;

-- audio-speaking-submissions: authenticated upload restricted to own user ID folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload own speaking submissions'
  ) THEN
    CREATE POLICY "Authenticated users can upload own speaking submissions"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'audio-speaking-submissions' 
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- audio-speaking-submissions: authenticated read restricted to own user ID folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can read own speaking submissions'
  ) THEN
    CREATE POLICY "Authenticated users can read own speaking submissions"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'audio-speaking-submissions' 
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- audio-speaking-submissions: authenticated delete restricted to own user ID folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete own speaking submissions'
  ) THEN
    CREATE POLICY "Authenticated users can delete own speaking submissions"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'audio-speaking-submissions' 
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
