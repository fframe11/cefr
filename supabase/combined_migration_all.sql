-- ==============================================================================
-- Migration: 20260925000001_create_cefr_platform_schema.sql
-- Description: Core 20 Tables for CEFR English Learning & Exam Platform
-- Source of Truth: Phase 2.2 Finalized Database Schema Specification
-- ==============================================================================

-- 0. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Master Reference Tables
-- ------------------------------------------------------------------------------

-- Table 1: cefr_levels
CREATE TABLE IF NOT EXISTS public.cefr_levels (
  code VARCHAR(2) PRIMARY KEY,
  name_en VARCHAR(50) NOT NULL,
  name_th VARCHAR(50) NOT NULL,
  cambridge_equivalent VARCHAR(50) NOT NULL,
  cambridge_scale_min SMALLINT NOT NULL CHECK (cambridge_scale_min >= 80),
  cambridge_scale_max SMALLINT NOT NULL CHECK (cambridge_scale_max <= 230),
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL,
  can_do_descriptors_th JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index SMALLINT NOT NULL UNIQUE,
  CONSTRAINT chk_scale_order CHECK (cambridge_scale_min < cambridge_scale_max)
);

-- Table 2: skills
CREATE TABLE IF NOT EXISTS public.skills (
  code VARCHAR(20) PRIMARY KEY,
  name_en VARCHAR(50) NOT NULL,
  name_th VARCHAR(50) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  order_index SMALLINT NOT NULL UNIQUE
);

-- ------------------------------------------------------------------------------
-- 2. User & Profile Tables
-- ------------------------------------------------------------------------------

-- Table 3: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_cefr_level VARCHAR(2) NOT NULL DEFAULT 'A1' REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  target_exam VARCHAR(10) NOT NULL DEFAULT 'KET' CHECK (target_exam IN ('KET','PET','FCE','CAE')),
  estimated_cambridge_score SMALLINT NOT NULL DEFAULT 100 CHECK (estimated_cambridge_score >= 80),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  daily_goal_minutes SMALLINT NOT NULL DEFAULT 20 CHECK (daily_goal_minutes > 0),
  last_active_date DATE NULL,
  assessment_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.user_profiles.estimated_cambridge_score IS 'Platform estimated score based on Cambridge English Scale; not an official certificate score.';

-- ------------------------------------------------------------------------------
-- 3. Content Bank Tables
-- ------------------------------------------------------------------------------

-- Table 4: vocabularies
CREATE TABLE IF NOT EXISTS public.vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL,
  lemma VARCHAR(100) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  part_of_speech VARCHAR(20) NOT NULL CHECK (part_of_speech IN ('noun','verb','adjective','adverb','preposition','conjunction','phrase')),
  ipa VARCHAR(100) NOT NULL,
  meaning_th TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  example_sentence_en TEXT NOT NULL,
  example_sentence_th TEXT NOT NULL,
  topic VARCHAR(100) NOT NULL,
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  antonyms TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: vocabulary_collocations
CREATE TABLE IF NOT EXISTS public.vocabulary_collocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id UUID NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
  collocation_text VARCHAR(150) NOT NULL
);

-- Table 6: grammar_topics
CREATE TABLE IF NOT EXISTS public.grammar_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  title_en VARCHAR(150) NOT NULL,
  title_th VARCHAR(150) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  summary_th TEXT NOT NULL,
  concept_th TEXT NOT NULL,
  concept_en TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: reading_passages
CREATE TABLE IF NOT EXISTS public.reading_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  target_exam VARCHAR(10) NOT NULL CHECK (target_exam IN ('KET','PET','FCE','CAE')),
  topic VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL CHECK (word_count > 0),
  vocabulary_glossary JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: listening_exercises
CREATE TABLE IF NOT EXISTS public.listening_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  target_exam VARCHAR(10) NOT NULL CHECK (target_exam IN ('KET','PET','FCE','CAE')),
  speaker_accents VARCHAR(100) NOT NULL,
  audio_storage_path TEXT NULL,
  audio_script TEXT NOT NULL,
  speed_options NUMERIC(3,2)[] NOT NULL DEFAULT '{0.75, 1.0, 1.25}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 9: writing_prompts
CREATE TABLE IF NOT EXISTS public.writing_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  target_exam VARCHAR(10) NOT NULL CHECK (target_exam IN ('KET','PET','FCE','CAE')),
  task_type VARCHAR(30) NOT NULL CHECK (task_type IN ('Email','Essay','Article','Story','Review')),
  prompt_th TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  min_words SMALLINT NOT NULL CHECK (min_words > 0),
  max_words SMALLINT NOT NULL CHECK (max_words >= min_words),
  guidelines_th TEXT[] NOT NULL DEFAULT '{}',
  useful_phrases JSONB NOT NULL DEFAULT '[]'::jsonb,
  sample_model_answer TEXT NOT NULL,
  rubrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 10: speaking_prompts
CREATE TABLE IF NOT EXISTS public.speaking_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  target_exam VARCHAR(10) NOT NULL CHECK (target_exam IN ('KET','PET','FCE','CAE')),
  part SMALLINT NOT NULL CHECK (part BETWEEN 1 AND 4),
  prompt_th TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  guiding_questions_th TEXT[] NOT NULL DEFAULT '{}',
  target_phrases TEXT[] NOT NULL DEFAULT '{}',
  model_answer TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Assessment Engine Tables
-- ------------------------------------------------------------------------------

-- Table 11: questions
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill VARCHAR(20) NOT NULL REFERENCES public.skills(code) ON DELETE RESTRICT,
  cefr_level VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  type VARCHAR(30) NOT NULL CHECK (type IN ('multiple_choice','fill_blank','true_false','matching','ordering','sentence_transformation')),
  prompt_th TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  context_passage TEXT NULL,
  audio_script TEXT NULL,
  audio_storage_path TEXT NULL,
  correct_answer_text TEXT NULL,
  explanation_th TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  weakness_tag VARCHAR(50) NOT NULL,
  difficulty_weight SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty_weight BETWEEN 1 AND 5),
  grammar_topic_id UUID NULL REFERENCES public.grammar_topics(id) ON DELETE SET NULL,
  reading_passage_id UUID NULL REFERENCES public.reading_passages(id) ON DELETE SET NULL,
  listening_exercise_id UUID NULL REFERENCES public.listening_exercises(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_single_parent_content CHECK (
    num_nonnulls(grammar_topic_id, reading_passage_id, listening_exercise_id) <= 1
  )
);

-- Table 12: question_options
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  key VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  feedback_th TEXT NOT NULL,
  CONSTRAINT uq_question_option_key UNIQUE (question_id, key)
);

-- ------------------------------------------------------------------------------
-- 5. Mock Exam Engine Tables
-- ------------------------------------------------------------------------------

-- Table 13: mock_exams
CREATE TABLE IF NOT EXISTS public.mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_code VARCHAR(10) NOT NULL CHECK (exam_code IN ('KET','PET','FCE','CAE')),
  name VARCHAR(150) NOT NULL,
  target_cefr VARCHAR(2) NOT NULL REFERENCES public.cefr_levels(code) ON DELETE RESTRICT,
  description_th TEXT NOT NULL,
  total_duration_minutes INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  passing_score SMALLINT NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
  version SMALLINT NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 14: mock_exam_sections
CREATE TABLE IF NOT EXISTS public.mock_exam_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  skill VARCHAR(20) NOT NULL REFERENCES public.skills(code) ON DELETE RESTRICT,
  duration_minutes SMALLINT NOT NULL CHECK (duration_minutes > 0),
  question_count SMALLINT NOT NULL CHECK (question_count > 0),
  order_index SMALLINT NOT NULL,
  CONSTRAINT uq_section_order UNIQUE (mock_exam_id, order_index)
);

-- Table 15: mock_exam_questions
CREATE TABLE IF NOT EXISTS public.mock_exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.mock_exam_sections(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  order_index SMALLINT NOT NULL,
  marks SMALLINT NOT NULL DEFAULT 1 CHECK (marks > 0),
  CONSTRAINT uq_section_question_order UNIQUE (section_id, order_index),
  CONSTRAINT uq_section_question_unique UNIQUE (section_id, question_id)
);

-- ------------------------------------------------------------------------------
-- 6. Telemetry & User Attempt Tables
-- ------------------------------------------------------------------------------

-- Table 16: user_mock_exam_attempts
CREATE TABLE IF NOT EXISTS public.user_mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mock_exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE RESTRICT,
  session_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','timed_out','abandoned')),
  raw_score SMALLINT NULL CHECK (raw_score >= 0),
  total_marks SMALLINT NULL CHECK (total_marks > 0),
  percentage_score NUMERIC(5,2) NULL CHECK (percentage_score BETWEEN 0 AND 100),
  estimated_cambridge_score SMALLINT NULL CHECK (estimated_cambridge_score >= 80),
  estimated_cefr_level VARCHAR(2) NULL REFERENCES public.cefr_levels(code) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.user_mock_exam_attempts.estimated_cambridge_score IS 'Platform estimated score based on Cambridge English Scale; not an official certificate score.';
COMMENT ON COLUMN public.user_mock_exam_attempts.estimated_cefr_level IS 'Platform estimated CEFR level; not an official certificate.';

-- Table 17: user_question_attempts
CREATE TABLE IF NOT EXISTS public.user_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  selected_key VARCHAR(5) NULL,
  text_answer TEXT NULL,
  complex_answer JSONB NULL,
  audio_storage_path TEXT NULL,
  is_correct BOOLEAN NULL,
  score_awarded SMALLINT NOT NULL DEFAULT 0 CHECK (score_awarded >= 0),
  evaluation_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (evaluation_status IN ('pending', 'processing', 'completed', 'failed')),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  context_type VARCHAR(20) NOT NULL CHECK (context_type IN ('practice','mock_exam','placement')),
  context_attempt_id UUID NULL REFERENCES public.user_mock_exam_attempts(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_attempt_context_integrity CHECK (
    (context_type = 'mock_exam' AND context_attempt_id IS NOT NULL) OR
    (context_type IN ('practice', 'placement') AND context_attempt_id IS NULL)
  )
);

-- ------------------------------------------------------------------------------
-- 7. Progress & Derived State Tables
-- ------------------------------------------------------------------------------

-- Table 18: user_skill_progress
CREATE TABLE IF NOT EXISTS public.user_skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  skill VARCHAR(20) NOT NULL REFERENCES public.skills(code) ON DELETE RESTRICT,
  proficiency_score SMALLINT NOT NULL DEFAULT 0 CHECK (proficiency_score BETWEEN 0 AND 100),
  questions_completed INTEGER NOT NULL DEFAULT 0 CHECK (questions_completed >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_skill UNIQUE (user_id, skill)
);

-- Table 19: user_weaknesses
CREATE TABLE IF NOT EXISTS public.user_weaknesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  weakness_tag VARCHAR(50) NOT NULL,
  error_count INTEGER NOT NULL DEFAULT 1 CHECK (error_count >= 1),
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_weakness UNIQUE (user_id, weakness_tag)
);

-- Table 20: user_vocabulary_mastery
CREATE TABLE IF NOT EXISTS public.user_vocabulary_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
  mastery_percentage SMALLINT NOT NULL DEFAULT 0 CHECK (mastery_percentage BETWEEN 0 AND 100),
  review_count SMALLINT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  consecutive_correct SMALLINT NOT NULL DEFAULT 0 CHECK (consecutive_correct >= 0),
  next_review_at TIMESTAMPTZ NULL,
  first_learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_vocab UNIQUE (user_id, vocabulary_id)
);
-- ==============================================================================
-- Migration: 20260925000002_create_indexes.sql
-- Description: Core Performance & Concurrency Indexes
-- Source of Truth: Phase 2.2 Finalized Database Schema Specification
-- ==============================================================================

-- 1. Required Foreign Key Integrity Indexes
CREATE INDEX IF NOT EXISTS idx_question_options_qid 
  ON public.question_options (question_id);

CREATE INDEX IF NOT EXISTS idx_mock_exam_sections_exam_id 
  ON public.mock_exam_sections (mock_exam_id);

CREATE INDEX IF NOT EXISTS idx_mock_exam_questions_section_id 
  ON public.mock_exam_questions (section_id);

CREATE INDEX IF NOT EXISTS idx_user_mock_exam_attempts_user_id 
  ON public.user_mock_exam_attempts (user_id);

CREATE INDEX IF NOT EXISTS idx_user_mock_exam_attempts_mock_exam_id 
  ON public.user_mock_exam_attempts (mock_exam_id);

CREATE INDEX IF NOT EXISTS idx_user_question_attempts_user_id 
  ON public.user_question_attempts (user_id);

CREATE INDEX IF NOT EXISTS idx_user_vocab_mastery_user_id 
  ON public.user_vocabulary_mastery (user_id);

-- 2. Explicit Content Parent Lookups
CREATE INDEX IF NOT EXISTS idx_questions_grammar_topic 
  ON public.questions (grammar_topic_id) 
  WHERE grammar_topic_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_reading_passage 
  ON public.questions (reading_passage_id) 
  WHERE reading_passage_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_listening_exercise 
  ON public.questions (listening_exercise_id) 
  WHERE listening_exercise_id IS NOT NULL;

-- 3. Core Mock Exam Concurrency Index (Partial Unique Index)
-- Prevents duplicate question answers in the same mock exam session while allowing repeated practice attempts
CREATE UNIQUE INDEX IF NOT EXISTS uq_attempt_question 
  ON public.user_question_attempts (context_attempt_id, question_id) 
  WHERE context_attempt_id IS NOT NULL;

-- 4. Mock Exam Active Session Lookup
CREATE INDEX IF NOT EXISTS idx_user_mock_exam_active 
  ON public.user_mock_exam_attempts (user_id, status) 
  WHERE status = 'in_progress';

-- 5. Useful High-Frequency Query Indexes
CREATE INDEX IF NOT EXISTS idx_questions_skill_cefr 
  ON public.questions (skill, cefr_level) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_vocab_due 
  ON public.user_vocabulary_mastery (user_id, next_review_at) 
  WHERE next_review_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_date 
  ON public.user_question_attempts (user_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_vocabularies_topic 
  ON public.vocabularies (topic) 
  WHERE is_active = true;
-- ==============================================================================
-- Migration: 20260925000003_create_rls_policies.sql
-- Description: Row Level Security (RLS) Policies for all 20 Tables
-- Source of Truth: Phase 2.2 Table 8 RLS Matrix & Phase 2.3 Audit Findings
-- ==============================================================================

-- 1. Enable RLS on all 20 Application Tables
ALTER TABLE public.cefr_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_collocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mock_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weaknesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary_mastery ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Master & Public Content Read Policies
-- ------------------------------------------------------------------------------

-- Master Reference Tables (Public Read)
CREATE POLICY "Public read for cefr_levels" 
  ON public.cefr_levels FOR SELECT 
  TO authenticated, anon 
  USING (true);

CREATE POLICY "Public read for skills" 
  ON public.skills FOR SELECT 
  TO authenticated, anon 
  USING (true);

-- Active Content Bank (Public Read for Active Items)
CREATE POLICY "Public read for vocabularies" 
  ON public.vocabularies FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

CREATE POLICY "Public read for vocabulary_collocations" 
  ON public.vocabulary_collocations FOR SELECT 
  TO authenticated, anon 
  USING (true);

CREATE POLICY "Public read for grammar_topics" 
  ON public.grammar_topics FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

CREATE POLICY "Public read for reading_passages" 
  ON public.reading_passages FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

CREATE POLICY "Public read for listening_exercises" 
  ON public.listening_exercises FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

CREATE POLICY "Public read for writing_prompts" 
  ON public.writing_prompts FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

CREATE POLICY "Public read for speaking_prompts" 
  ON public.speaking_prompts FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

-- Questions & Options Read Policies (Active Items)
CREATE POLICY "Public read for active questions" 
  ON public.questions FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

CREATE POLICY "Public read for question_options" 
  ON public.question_options FOR SELECT 
  TO authenticated, anon 
  USING (true);

-- Published Mock Exams (Public Read for Published Items)
CREATE POLICY "Public read for published mock_exams" 
  ON public.mock_exams FOR SELECT 
  TO authenticated, anon 
  USING (is_published = true);

CREATE POLICY "Public read for mock_exam_sections" 
  ON public.mock_exam_sections FOR SELECT 
  TO authenticated, anon 
  USING (
    EXISTS (
      SELECT 1 FROM public.mock_exams me 
      WHERE me.id = mock_exam_sections.mock_exam_id 
        AND me.is_published = true
    )
  );

CREATE POLICY "Public read for mock_exam_questions" 
  ON public.mock_exam_questions FOR SELECT 
  TO authenticated, anon 
  USING (
    EXISTS (
      SELECT 1 FROM public.mock_exam_sections mes
      JOIN public.mock_exams me ON me.id = mes.mock_exam_id
      WHERE mes.id = mock_exam_questions.section_id 
        AND me.is_published = true
    )
  );

-- ------------------------------------------------------------------------------
-- 3. User-Owned Data Policies
-- ------------------------------------------------------------------------------

-- User Profiles (User can read own profile; direct UPDATE prohibited to protect server-owned fields)
-- Profile updates are strictly mediated via Serverless API (PATCH /api/user/profile) using Service Role Key
CREATE POLICY "Users can read own profile" 
  ON public.user_profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- User Attempts (User can read own attempts)
CREATE POLICY "Users can read own mock exam attempts" 
  ON public.user_mock_exam_attempts FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own question attempts" 
  ON public.user_question_attempts FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- User Progress & Weaknesses (Strictly READ-ONLY for users)
-- Direct client UPDATE/INSERT is prohibited; updates occur exclusively via Serverless Service Role
CREATE POLICY "Users can read own skill progress" 
  ON public.user_skill_progress FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own weaknesses" 
  ON public.user_weaknesses FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- User Vocabulary Mastery (Strictly READ-ONLY for users to prevent SRS forgery)
-- Derived learning metrics and SRS state are updated exclusively via Serverless Service Role
CREATE POLICY "Users can read own vocabulary mastery" 
  ON public.user_vocabulary_mastery FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Role Permissions & Table Privileges (Defensive Grant Matrix)
-- ------------------------------------------------------------------------------

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;

-- Full access for service_role (Used by serverless backend for grading, scoring, sync, attempts)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Master reference tables (Read-only for anon and authenticated)
GRANT SELECT ON public.cefr_levels TO anon, authenticated;
GRANT SELECT ON public.skills TO anon, authenticated;

-- Content bank tables (Read-only for active items, governed by RLS)
GRANT SELECT ON public.vocabularies TO anon, authenticated;
GRANT SELECT ON public.vocabulary_collocations TO anon, authenticated;
GRANT SELECT ON public.grammar_topics TO anon, authenticated;
GRANT SELECT ON public.reading_passages TO anon, authenticated;
GRANT SELECT ON public.listening_exercises TO anon, authenticated;
GRANT SELECT ON public.writing_prompts TO anon, authenticated;
GRANT SELECT ON public.speaking_prompts TO anon, authenticated;

-- Mock exam structural tables (Read-only for published items, governed by RLS)
GRANT SELECT ON public.mock_exams TO anon, authenticated;
GRANT SELECT ON public.mock_exam_sections TO anon, authenticated;
GRANT SELECT ON public.mock_exam_questions TO anon, authenticated;

-- Defense-in-depth: Grant SELECT ONLY on sanitized non-answer columns to anon and authenticated
-- Sensitive answer keys (correct_answer_text, explanations, is_correct, feedback_th) are EXCLUDED
GRANT SELECT (
  id, skill, cefr_level, type, prompt_th, prompt_en,
  context_passage, audio_script, audio_storage_path,
  weakness_tag, difficulty_weight, grammar_topic_id,
  reading_passage_id, listening_exercise_id, metadata,
  is_active, created_at
) ON public.questions TO anon, authenticated;

GRANT SELECT (
  id, question_id, key, text
) ON public.question_options TO anon, authenticated;

-- User-owned tables: Granted SELECT ONLY to authenticated (anon receives NO grants)
-- Row isolation is strictly enforced by RLS USING (auth.uid() = ...)
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_mock_exam_attempts TO authenticated;
GRANT SELECT ON public.user_question_attempts TO authenticated;
GRANT SELECT ON public.user_skill_progress TO authenticated;
GRANT SELECT ON public.user_weaknesses TO authenticated;
GRANT SELECT ON public.user_vocabulary_mastery TO authenticated;


-- ==============================================================================
-- Migration: 20260925000004_seed_reference_data.sql
-- Description: Deterministic Reference Data Seed for cefr_levels and skills
-- Source of Truth: Phase 2.2 Table 1-2 & src/data/cefrData.ts
-- ==============================================================================

-- 1. Seed Master Skills (6 core skills)
INSERT INTO public.skills (code, name_en, name_th, icon_name, order_index)
VALUES 
  ('vocabulary', 'Vocabulary', 'คำศัพท์', 'BookOpen', 1),
  ('grammar', 'Grammar', 'ไวยากรณ์', 'FileText', 2),
  ('reading', 'Reading', 'การอ่าน', 'BookMarked', 3),
  ('listening', 'Listening', 'การฟัง', 'Headphones', 4),
  ('writing', 'Writing', 'การเขียน', 'PenTool', 5),
  ('speaking', 'Speaking', 'การพูด', 'Mic', 6)
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  icon_name = EXCLUDED.icon_name,
  order_index = EXCLUDED.order_index;

-- 2. Seed Master CEFR Levels (A1 to C2)
INSERT INTO public.cefr_levels (
  code, name_en, name_th, cambridge_equivalent, 
  cambridge_scale_min, cambridge_scale_max, 
  description_th, description_en, 
  can_do_descriptors_th, order_index
)
VALUES 
  (
    'A1', 'Beginner', 'ผู้ใช้ภาษาขั้นเริ่มต้น', 'Pre-A1 / A1 Movers', 
    80, 99, 
    'เข้าใจและใช้ประโยคง่ายๆ ในชีวิตประจำวัน แนะนำตัวเองและถามตอบข้อมูลส่วนตัวพื้นฐานได้', 
    'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of needs of a concrete type.',
    '["เข้าใจและใช้วลีง่ายๆ ในชีวิตประจำวันได้", "แนะนำตัวเองและผู้อื่นได้", "ถามตอบคำถามเกี่ยวกับรายละเอียดส่วนตัว เช่น ที่อยู่อาศัย คนที่รู้จัก"]'::jsonb,
    1
  ),
  (
    'A2', 'Elementary', 'ผู้ใช้ภาษาขั้นพื้นฐาน', 'A2 Key (KET)', 
    100, 119, 
    'เข้าใจประโยคและสำนวนที่พบบ่อย สื่อสารในสถานการณ์ประจำวัน แลกเปลี่ยนข้อมูลง่ายๆ ได้', 
    'Can understand sentences and frequently used expressions related to areas of most immediate relevance.',
    '["เข้าใจประโยคและสำนวนที่เกี่ยวข้องกับชีวิตประจำวัน", "สื่อสารในภารกิจที่ง่ายและเป็นกิจวัตร", "อธิบายความเป็นมา สภาพแวดล้อม และสิ่งจำเป็นเร่งด่วนได้"]'::jsonb,
    2
  ),
  (
    'B1', 'Intermediate', 'ผู้ใช้ภาษาอิสระระดับต้น', 'B1 Preliminary (PET)', 
    120, 139, 
    'เข้าใจประเด็นหลักของเรื่องที่คุ้นเคย จัดการกับสถานการณ์ส่วนใหญ่ระหว่างเดินทาง เขียนข้อความเชื่อมโยงเรียบง่ายได้', 
    'Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.',
    '["เข้าใจประเด็นหลักในเรื่องที่คุ้นเคยในที่ทำงาน โรงเรียน การพักผ่อน", "รับมือกับสถานการณ์ส่วนใหญ่ที่อาจเกิดขึ้นขณะเดินทาง", "เขียนข้อความเชื่อมโยงเรียบง่ายในหัวข้อที่คุ้นเคยหรือสนใจ"]'::jsonb,
    3
  ),
  (
    'B2', 'Upper Intermediate', 'ผู้ใช้ภาษาอิสระระดับสูง', 'B2 First (FCE)', 
    140, 159, 
    'เข้าใจใจความสำคัญของข้อความซับซ้อน สื่อสารได้อย่างคล่องแคล่วและเป็นธรรมชาติกับเจ้าของภาษา', 
    'Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialization.',
    '["เข้าใจใจความสำคัญของข้อความซับซ้อนทั้งรูปธรรมและนามธรรม", "สื่อสารอย่างคล่องแคล่วเป็นธรรมชาติกับเจ้าของภาษาโดยไม่เกร็ง", "เขียนข้อความที่ชัดเจนละเอียดในหัวข้อที่หลากหลาย"]'::jsonb,
    4
  ),
  (
    'C1', 'Advanced', 'ผู้ใช้ภาษาชำนาญการ', 'C1 Advanced (CAE)', 
    160, 179, 
    'เข้าใจข้อความยาวและยากที่หลากหลาย ใช้ภาษาได้อย่างยืดหยุ่นและมีประสิทธิภาพเพื่อสังคม วิชาการ และวิชาชีพ', 
    'Can understand a wide range of demanding, longer texts, and recognise implicit meaning.',
    '["เข้าใจข้อความยาวและยากที่หลากหลาย รวมถึงความหมายแฝง", "แสดงออกได้อย่างคล่องแคล่วเป็นธรรมชาติโดยไม่ต้องค้นหาคำศัพท์", "ใช้ภาษาอย่างยืดหยุ่นและมีประสิทธิภาพเพื่อสังคม วิชาการ และการทำงาน"]'::jsonb,
    5
  ),
  (
    'C2', 'Proficiency', 'ผู้ใช้ภาษาเชี่ยวชาญสูงสุด', 'C2 Proficiency (CPE)', 
    180, 230, 
    'เข้าใจสิ่งที่ได้ยินหรืออ่านได้อย่างง่ายดาย สรุปข้อมูลจากแหล่งต่างๆ และสร้างข้อโต้แย้งอย่างสอดคล้อง', 
    'Can understand with ease virtually everything heard or read.',
    '["เข้าใจสิ่งที่ได้ยินหรืออ่านแทบทุกอย่างได้อย่างง่ายดาย", "สรุปข้อมูลจากแหล่งข้อความและการพูดที่แตกต่างกัน", "แสดงออกอย่างเป็นธรรมชาติ แม่นยำ และแยกแยะความหมายที่ละเอียดอ่อนได้"]'::jsonb,
    6
  )
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  cambridge_equivalent = EXCLUDED.cambridge_equivalent,
  cambridge_scale_min = EXCLUDED.cambridge_scale_min,
  cambridge_scale_max = EXCLUDED.cambridge_scale_max,
  description_th = EXCLUDED.description_th,
  description_en = EXCLUDED.description_en,
  can_do_descriptors_th = EXCLUDED.can_do_descriptors_th,
  order_index = EXCLUDED.order_index;
