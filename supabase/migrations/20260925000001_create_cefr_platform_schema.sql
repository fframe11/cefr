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
