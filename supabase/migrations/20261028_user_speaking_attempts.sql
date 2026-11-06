-- Migration: 20261028_user_speaking_attempts.sql
-- Description: Create user_speaking_attempts table for Speaking Lab AI evaluation records

CREATE TABLE IF NOT EXISTS public.user_speaking_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id TEXT NOT NULL,
    target_cefr VARCHAR(5) NOT NULL,
    audio_storage_path TEXT NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    cefr_band VARCHAR(5) NOT NULL,
    pronunciation_score NUMERIC(5, 2) NOT NULL,
    fluency_score NUMERIC(5, 2) NOT NULL,
    completeness_score NUMERIC(5, 2) NOT NULL,
    prosody_score NUMERIC(5, 2) NOT NULL,
    transcription TEXT,
    words_analysis JSONB DEFAULT '[]'::jsonb,
    feedback_th TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user attempts sorted by recency
CREATE INDEX IF NOT EXISTS idx_user_speaking_attempts_user ON public.user_speaking_attempts(user_id, created_at DESC);

-- Index for prompt-specific analytics
CREATE INDEX IF NOT EXISTS idx_user_speaking_attempts_prompt ON public.user_speaking_attempts(prompt_id, created_at DESC);
