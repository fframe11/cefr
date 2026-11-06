-- Supabase Database Migration: Realtime Multiplayer Synchronous Speed Battle
-- Supporting TASK-03 (Compete Studio & Elo Rating Engine)

CREATE TABLE IF NOT EXISTS public.competition_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID NOT NULL REFERENCES auth.users(id),
    player2_id UUID REFERENCES auth.users(id), -- NULL if AI Bot opponent
    is_bot_match BOOLEAN DEFAULT false,
    player1_score INT NOT NULL DEFAULT 0,
    player2_score INT NOT NULL DEFAULT 0,
    winner_id UUID,
    player1_elo_delta INT NOT NULL DEFAULT 0,
    player2_elo_delta INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_competition_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    elo_rating INT NOT NULL DEFAULT 1000,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
    highest_streak INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_competition_elo ON public.user_competition_profiles(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_competition_matches_p1 ON public.competition_matches(player1_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competition_matches_p2 ON public.competition_matches(player2_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.competition_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_competition_profiles ENABLE ROW LEVEL SECURITY;

-- Competition Matches Policies
CREATE POLICY "Users can view all competition matches"
    ON public.competition_matches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own matches"
    ON public.competition_matches FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- User Competition Profiles Policies
CREATE POLICY "Users can view competition profiles"
    ON public.user_competition_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own competition profile"
    ON public.user_competition_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
