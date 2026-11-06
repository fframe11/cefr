-- Migration: 20261031_speaking_sentences_and_queue.sql
-- Description: Creates speaking_sentences table, updates speaking_attempts, and creates user_speaking_queue_state

-- 1. Create speaking_sentences table
CREATE TABLE IF NOT EXISTS public.speaking_sentences (
    id TEXT PRIMARY KEY,
    cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    topic TEXT NOT NULL,
    prompt_title TEXT NOT NULL,
    sentence TEXT NOT NULL,
    context_or_question TEXT,
    target_keywords TEXT[] NOT NULL DEFAULT '{}',
    difficulty NUMERIC NOT NULL DEFAULT 50 CHECK (difficulty >= 0 AND difficulty <= 100),
    mode TEXT NOT NULL DEFAULT 'read_aloud' CHECK (mode IN ('read_aloud', 'free_speaking')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying by CEFR, topic, and mode
CREATE INDEX IF NOT EXISTS idx_speaking_sentences_cefr_topic_mode 
ON public.speaking_sentences (cefr_level, topic, mode) 
WHERE is_active = true;

-- 2. Create user_speaking_queue_state table
CREATE TABLE IF NOT EXISTS public.user_speaking_queue_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    topic TEXT NOT NULL DEFAULT 'all',
    mode TEXT NOT NULL DEFAULT 'read_aloud' CHECK (mode IN ('read_aloud', 'free_speaking')),
    active_queue TEXT[] NOT NULL DEFAULT '{}',
    practiced_ids TEXT[] NOT NULL DEFAULT '{}',
    round_number INT NOT NULL DEFAULT 1,
    total_in_bank INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_speaking_queue UNIQUE (user_id, cefr_level, topic, mode)
);

CREATE INDEX IF NOT EXISTS idx_user_speaking_queue_lookup 
ON public.user_speaking_queue_state (user_id, cefr_level, topic, mode);

-- 3. Update public.user_speaking_attempts with sentence_id and mode
ALTER TABLE public.user_speaking_attempts 
ADD COLUMN IF NOT EXISTS sentence_id TEXT,
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'read_aloud';

-- RLS policies
ALTER TABLE public.speaking_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_speaking_queue_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active speaking sentences"
ON public.speaking_sentences FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can manage their own queue state"
ON public.user_speaking_queue_state FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
