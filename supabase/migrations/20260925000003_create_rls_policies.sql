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

