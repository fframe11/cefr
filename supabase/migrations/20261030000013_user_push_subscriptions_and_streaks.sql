-- Migration: 20261030000013_user_push_subscriptions_and_streaks.sql
-- Description: TASK-05 Web Push Notifications, Daily Practice Streaks, Freeze & Retention Engine

-- 1. Create user_push_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying push subscriptions by user
CREATE INDEX IF NOT EXISTS idx_user_push_user ON public.user_push_subscriptions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.user_push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
    ON public.user_push_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can register own push subscriptions" ON public.user_push_subscriptions;
CREATE POLICY "Users can register own push subscriptions"
    ON public.user_push_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.user_push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
    ON public.user_push_subscriptions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on push subscriptions" ON public.user_push_subscriptions;
CREATE POLICY "Service role full access on push subscriptions"
    ON public.user_push_subscriptions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Create user_notification_settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    preferred_reminder_hour INT NOT NULL DEFAULT 20 CHECK (preferred_reminder_hour >= 0 AND preferred_reminder_hour <= 23),
    timezone TEXT NOT NULL DEFAULT 'Asia/Bangkok',
    streak_freeze_available INT NOT NULL DEFAULT 1 CHECK (streak_freeze_available >= 0),
    streak_freeze_used_this_month INT NOT NULL DEFAULT 0 CHECK (streak_freeze_used_this_month >= 0),
    last_freeze_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Settings Policies
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.user_notification_settings;
CREATE POLICY "Users can view own notification settings"
    ON public.user_notification_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.user_notification_settings;
CREATE POLICY "Users can insert own notification settings"
    ON public.user_notification_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification settings" ON public.user_notification_settings;
CREATE POLICY "Users can update own notification settings"
    ON public.user_notification_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on notification settings" ON public.user_notification_settings;
CREATE POLICY "Service role full access on notification settings"
    ON public.user_notification_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
