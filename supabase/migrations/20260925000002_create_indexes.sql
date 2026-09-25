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
