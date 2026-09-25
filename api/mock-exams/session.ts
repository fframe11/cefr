import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../_lib/errors/api-error';
import { calculateExamTiming, finalizeMockExamAttempt } from './_engine';

const sessionQuerySchema = z.object({
  token: uuidSchema,
});

export interface SafeMockOptionDTO {
  id: string;
  key: string;
  text: string;
}

export interface SafeMockQuestionDTO {
  id: string;
  mock_exam_question_id: string;
  order_index: number;
  marks: number;
  skill: string;
  type: string;
  prompt_th: string;
  prompt_en: string;
  options: SafeMockOptionDTO[];
  saved_answer?: {
    selected_option_key: string | null;
    text_answer: string | null;
  } | null;
}

export interface MockExamSectionDTO {
  id: string;
  name: string;
  skill: string;
  duration_minutes: number;
  question_count: number;
  order_index: number;
  questions: SafeMockQuestionDTO[];
}

export interface MockExamSessionResponseDTO {
  session_token: string;
  mock_exam: {
    id: string;
    exam_code: string;
    name: string;
    target_cefr: string;
    total_duration_minutes: number;
  };
  status: 'in_progress' | 'submitted' | 'timed_out' | 'abandoned';
  started_at: string;
  expires_at: string;
  remaining_seconds: number;
  sections: MockExamSectionDTO[];
  disclaimer: string;
}

/**
 * GET /api/mock-exams/session?token=:token
 * Retrieves active or finalized mock exam session with safe question payloads.
 * 
 * SECURITY INVARIANTS:
 * 1. Strict user ownership: Token must belong to authenticated user.
 * 2. Server-authoritative timer: remaining_seconds is calculated strictly from started_at + duration.
 * 3. 60-Second Grace: If within grace, remaining_seconds = 0 but status remains 'in_progress'.
 * 4. Timeout Auto-Finalization: If past grace, automatically finalizes and grades attempt as 'timed_out'.
 * 5. Zero Answer Leakage: Under no circumstances are is_correct, correct_answer_text, or explanations returned.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to access mock exam session.');
    }

    const query = validateQuery(sessionQuerySchema, req.query);
    const supabase = createServiceRoleClient();

    // 1. Locate attempt and verify ownership
    const { data: attempt, error: attemptError } = await supabase
      .from('user_mock_exam_attempts')
      .select('id, user_id, mock_exam_id, session_token, started_at, submitted_at, status')
      .eq('session_token', query.token)
      .single();

    if (attemptError || !attempt) {
      throw new NotFoundError('Mock exam session not found.');
    }

    if (attempt.user_id !== user.id) {
      throw new ForbiddenError('You do not have permission to access this exam session.');
    }

    // 2. Locate mock exam metadata
    const { data: exam, error: examError } = await supabase
      .from('mock_exams')
      .select('id, exam_code, name, target_cefr, total_duration_minutes')
      .eq('id', attempt.mock_exam_id)
      .single();

    if (examError || !exam) {
      throw new NotFoundError('Associated mock exam not found.');
    }

    // 3. Server-authoritative timer calculation with 60-second grace
    const timing = calculateExamTiming(attempt.started_at, exam.total_duration_minutes);
    let currentStatus = attempt.status;
    let remainingSeconds = timing.remainingSeconds;

    // Handle server-side timeout transition after grace window
    if (timing.isPastGrace && currentStatus === 'in_progress') {
      await finalizeMockExamAttempt({
        attemptId: attempt.id,
        userId: user.id,
        sessionToken: query.token,
        targetStatus: 'timed_out',
        submittedAt: new Date(timing.expiresMs).toISOString(),
        supabase,
      });

      currentStatus = 'timed_out';
      remainingSeconds = 0;
    }

    // 4. Fetch sections in strict display order
    const { data: sections } = await supabase
      .from('mock_exam_sections')
      .select('id, name, skill, duration_minutes, question_count, order_index')
      .eq('mock_exam_id', exam.id)
      .order('order_index', { ascending: true });

    // 5. Fetch mock exam questions in strict display order
    const sectionIds = (sections || []).map((s) => s.id);
    const { data: meqs } = await supabase
      .from('mock_exam_questions')
      .select('id, section_id, question_id, order_index, marks')
      .in('section_id', sectionIds.length > 0 ? sectionIds : ['00000000-0000-0000-0000-000000000000'])
      .order('order_index', { ascending: true });

    const questionIds = (meqs || []).map((m) => m.question_id);

    // 6. Fetch question content with SENSITIVE COLUMNS STRICTLY OMITTED
    const { data: rawQuestions } = await supabase
      .from('questions')
      .select('id, skill, cefr_level, type, prompt_th, prompt_en')
      .in('id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

    // 7. Fetch question options with is_correct and feedback STRICTLY OMITTED
    const { data: rawOptions } = await supabase
      .from('question_options')
      .select('id, question_id, key, text')
      .in('question_id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

    // 8. Fetch previously saved answers for this attempt
    const { data: savedAttempts } = await supabase
      .from('user_question_attempts')
      .select('question_id, selected_key, text_answer')
      .eq('context_type', 'mock_exam')
      .eq('context_attempt_id', attempt.id);

    const savedMap = new Map<string, { selected_option_key: string | null; text_answer: string | null }>();
    if (savedAttempts) {
      for (const sa of savedAttempts) {
        savedMap.set(sa.question_id, {
          selected_option_key: sa.selected_key,
          text_answer: sa.text_answer,
        });
      }
    }

    const questionMap = new Map((rawQuestions || []).map((q) => [q.id, q]));
    const optionsMap = new Map<string, SafeMockOptionDTO[]>();
    for (const opt of rawOptions || []) {
      const list = optionsMap.get(opt.question_id) || [];
      list.push({
        id: opt.id,
        key: opt.key,
        text: opt.text,
      });
      optionsMap.set(opt.question_id, list);
    }

    // Build structured sections and questions
    const structuredSections: MockExamSectionDTO[] = (sections || []).map((sec) => {
      const sectionMeqs = (meqs || [])
        .filter((m) => m.section_id === sec.id)
        .sort((a, b) => a.order_index - b.order_index);

      const sectionQuestions: SafeMockQuestionDTO[] = sectionMeqs
        .map((meq) => {
          const q = questionMap.get(meq.question_id);
          if (!q) return null;

          return {
            id: q.id,
            mock_exam_question_id: meq.id,
            order_index: meq.order_index,
            marks: meq.marks,
            skill: q.skill,
            type: q.type,
            prompt_th: q.prompt_th,
            prompt_en: q.prompt_en,
            options: (optionsMap.get(q.id) || []).sort((a, b) => a.key.localeCompare(b.key)),
            saved_answer: savedMap.get(q.id) || null,
          };
        })
        .filter(Boolean) as SafeMockQuestionDTO[];

      return {
        id: sec.id,
        name: sec.name,
        skill: sec.skill,
        duration_minutes: sec.duration_minutes,
        question_count: sec.question_count,
        order_index: sec.order_index,
        questions: sectionQuestions,
      };
    });

    const response: MockExamSessionResponseDTO = {
      session_token: attempt.session_token,
      mock_exam: {
        id: exam.id,
        exam_code: exam.exam_code,
        name: exam.name,
        target_cefr: exam.target_cefr,
        total_duration_minutes: exam.total_duration_minutes,
      },
      status: currentStatus as any,
      started_at: attempt.started_at,
      expires_at: new Date(timing.expiresMs).toISOString(),
      remaining_seconds: remainingSeconds,
      sections: structuredSections,
      disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
    };

    return response;
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
    rateLimit: {
      action: 'mock_exam_session',
      maxRequests: 120,
      windowMs: 60_000,
    },
  }
);
