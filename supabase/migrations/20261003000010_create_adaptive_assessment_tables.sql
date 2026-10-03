-- ==============================================================================
-- Migration: 20261003000010_create_adaptive_assessment_tables.sql
-- Description: Creates persistent storage and audit trail for IRT adaptive
-- placement test sessions (Oxford OOPT standard) with RLS security policies.
-- ==============================================================================

-- 1. Create user_adaptive_assessments table
CREATE TABLE IF NOT EXISTS public.user_adaptive_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    theta NUMERIC(6,3) NOT NULL,
    standard_error NUMERIC(6,3) NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    items_completed INTEGER NOT NULL DEFAULT 0,
    skill_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    weak_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommendations JSONB DEFAULT '[]'::jsonb,
    time_taken_seconds INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create adaptive_assessment_responses table
CREATE TABLE IF NOT EXISTS public.adaptive_assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES public.user_adaptive_assessments(session_id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    skill TEXT NOT NULL CHECK (skill IN ('vocabulary', 'grammar', 'reading')),
    selected_key TEXT,
    is_correct BOOLEAN NOT NULL,
    theta_before NUMERIC(6,3),
    theta_after NUMERIC(6,3),
    se_after NUMERIC(6,3),
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_adaptive_assessments_user_id 
    ON public.user_adaptive_assessments(user_id);

CREATE INDEX IF NOT EXISTS idx_adaptive_assessments_session_id 
    ON public.user_adaptive_assessments(session_id);

CREATE INDEX IF NOT EXISTS idx_adaptive_assessments_completed_at 
    ON public.user_adaptive_assessments(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_adaptive_responses_session_id 
    ON public.adaptive_assessment_responses(session_id);

CREATE INDEX IF NOT EXISTS idx_adaptive_responses_item_id 
    ON public.adaptive_assessment_responses(item_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_adaptive_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_assessment_responses ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies
-- Users can view their own assessments
CREATE POLICY "Users can read own adaptive assessments"
    ON public.user_adaptive_assessments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can read responses associated with their sessions
CREATE POLICY "Users can read own assessment responses"
    ON public.adaptive_assessment_responses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_adaptive_assessments
            WHERE user_adaptive_assessments.session_id = adaptive_assessment_responses.session_id
            AND user_adaptive_assessments.user_id = auth.uid()
        )
    );

-- Service role full access for automated backend execution
CREATE POLICY "Service role full access on adaptive assessments"
    ON public.user_adaptive_assessments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on assessment responses"
    ON public.adaptive_assessment_responses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
