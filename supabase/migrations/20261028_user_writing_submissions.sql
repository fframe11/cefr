-- Migration: 20261028_user_writing_submissions.sql
-- Description: Create user_writing_submissions table for Writing Studio AES NLP evaluations

CREATE TABLE IF NOT EXISTS public.user_writing_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id TEXT NOT NULL,
    target_cefr VARCHAR(5) NOT NULL,
    submission_text TEXT NOT NULL,
    word_count INT NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    cefr_band VARCHAR(5) NOT NULL,
    rubric_scores JSONB NOT NULL,
    lexical_distribution JSONB NOT NULL,
    grammar_issues JSONB DEFAULT '[]'::jsonb,
    feedback_th JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user submissions sorted by recency
CREATE INDEX IF NOT EXISTS idx_user_writing_user ON public.user_writing_submissions(user_id, created_at DESC);

-- Index for prompt-specific submissions
CREATE INDEX IF NOT EXISTS idx_user_writing_prompt ON public.user_writing_submissions(prompt_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_writing_submissions ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own submissions
CREATE POLICY "Users can view their own writing submissions"
    ON public.user_writing_submissions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own submissions
CREATE POLICY "Users can insert their own writing submissions"
    ON public.user_writing_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
