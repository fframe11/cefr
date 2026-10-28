-- ==============================================================================
-- Migration: 20261007000011_lockdown_question_options_rls.sql
-- Description: Zero Answer Leakage Lockdown for question_options
-- Security Invariant: Public (anon and authenticated) must never query `is_correct`
-- or `feedback_th` directly from public.question_options.
-- Only server-side service_role retains access for objective grading.
-- ==============================================================================

-- 1. Drop overly permissive public read policy that leaked `is_correct` to anon
DROP POLICY IF EXISTS "Public read for question_options" ON public.question_options;

-- 2. Restrict column-level SELECT grants for anon and authenticated
-- Prevents: SELECT is_correct, feedback_th FROM question_options
REVOKE ALL ON public.question_options FROM anon, authenticated;
GRANT SELECT (id, question_id, key, text) ON public.question_options TO anon, authenticated;

-- 3. Re-create secure RLS policy strictly for sanitized columns
CREATE POLICY "Public read safe columns for question_options" 
  ON public.question_options FOR SELECT 
  TO authenticated, anon 
  USING (true);

-- 4. Create explicit security-invoker view for safe options retrieval
CREATE OR REPLACE VIEW public.safe_question_options WITH (security_invoker = true) AS
  SELECT id, question_id, key, text
  FROM public.question_options;

GRANT SELECT ON public.safe_question_options TO anon, authenticated;

-- 5. Service role retains full access for server-side objective grading
GRANT ALL ON public.question_options TO service_role;
