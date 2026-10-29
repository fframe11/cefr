import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError } from '../_lib/errors/api-error';
import { calculateExamTiming, finalizeMockExamAttempt, convertCambridgeRawScore, convertIeltsBandScore } from './_engine';
import { DemoExamService } from '../_lib/demo/demo-exam.service';

const resultsQuerySchema = z.object({
  token: uuidSchema,
});

export interface MockExamReviewQuestionDTO {
  question_id: string;
  is_correct: boolean;
  user_selected_key?: string | null;
  user_text_answer?: string | null;
  correct_option_key?: string | null;
  correct_answer_text?: string | null;
  explanation_th?: string | null;
  explanation_en?: string | null;
}

export interface MockExamResultResponseDTO {
  attempt_id: string;
  session_token: string;
  exam: {
    id: string;
    exam_code: string;
    name: string;
    target_cefr: string;
    passing_score: number;
    total_duration_minutes: number;
  };
  status: 'submitted' | 'timed_out';
  started_at: string;
  submitted_at: string;
  raw_score: number;
  total_marks: number;
  percentage_score: number;
  objective_score: number;
  objective_total_marks: number;
  objective_percentage: number;
  pending_subjective_marks: number;
  has_pending_subjective: boolean;
  evaluation_status: 'completed' | 'partially_evaluated_pending_subjective';
  is_passed: boolean;
  estimated_cefr_level: string;
  estimated_cambridge_score: number;
  cambridge_grade?: string;
  ielts_band?: number;
  ielts_descriptor?: string;
  section_breakdown: Record<string, { raw_score: number; total_marks: number; percentage: number }>;
  skill_breakdown: Record<string, { total_questions: number; correct_questions: number; percentage: number }>;
  is_official: false;
  disclaimer: string;
  is_demo?: boolean;
  dataset?: string;
  review_questions?: MockExamReviewQuestionDTO[];
}

/**
 * GET /api/mock-exams/results?token=:token
 * Retrieves final scores and diagnostic breakdown for a submitted mock exam.
 * 
 * SECURITY INVARIANTS:
 * 1. Strict ownership: User can ONLY retrieve their own exam results.
 * 2. Status gate: Unsubmitted/active exams cannot view results until finalized.
 * 3. 60-Second Grace: If past grace, automatically finalizes and grades attempt as 'timed_out'.
 * 4. Non-Official Guardrail: Explicitly marked with is_official: false and platform disclaimer.
 * 5. Subjective Status: Clearly distinguishes objective scores from pending subjective marks.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to view exam results.');
    }

    const query = validateQuery(resultsQuerySchema, req.query);

    // 1. Isolated Demo Session Branch
    if (DemoExamService.isDemoSessionToken(query.token)) {
      return DemoExamService.getDemoResultsDTO(query.token);
    }

    const supabase = createServiceRoleClient();

    // 2. Locate production attempt and verify ownership
    let { data: attempt, error: attemptError } = await supabase
      .from('user_mock_exam_attempts')
      .select('id, user_id, mock_exam_id, session_token, started_at, submitted_at, status, raw_score, total_marks, percentage_score, estimated_cefr_level, estimated_cambridge_score')
      .eq('session_token', query.token)
      .single();

    if (attemptError || !attempt) {
      throw new NotFoundError('Mock exam attempt not found.');
    }

    if (attempt.user_id !== user.id) {
      throw new ForbiddenError('You do not have permission to view results for this attempt.');
    }

    // 2. Fetch associated exam metadata
    const { data: exam, error: examError } = await supabase
      .from('mock_exams')
      .select('id, exam_code, name, target_cefr, passing_score, total_duration_minutes')
      .eq('id', attempt.mock_exam_id)
      .single();

    if (examError || !exam) {
      throw new NotFoundError('Associated mock exam not found.');
    }

    // 3. Status guardrail with 60-second grace
    if (attempt.status === 'in_progress') {
      const timing = calculateExamTiming(attempt.started_at, exam.total_duration_minutes);

      if (!timing.isPastGrace) {
        throw new BadRequestError('Mock exam is still in progress. Results are available only after submission.');
      }

      // Past 60s grace: Automatically finalize and grade saved answers
      const finalizedResult = await finalizeMockExamAttempt({
        attemptId: attempt.id,
        userId: user.id,
        sessionToken: query.token,
        targetStatus: 'timed_out',
        submittedAt: new Date(timing.expiresMs).toISOString(),
        supabase,
      });

      attempt = {
        ...attempt,
        status: finalizedResult.status,
        submitted_at: finalizedResult.submitted_at,
        raw_score: finalizedResult.raw_score,
        total_marks: finalizedResult.total_marks,
        percentage_score: finalizedResult.percentage_score,
        estimated_cefr_level: finalizedResult.estimated_cefr_level,
        estimated_cambridge_score: finalizedResult.estimated_cambridge_score,
      };
    }

    // 4. Fetch sections and question attempts for breakdown
    const { data: sections } = await supabase
      .from('mock_exam_sections')
      .select('id, name, skill')
      .eq('mock_exam_id', exam.id);

    const sectionIds = (sections || []).map((s: any) => s.id);
    const { data: meqs } = await supabase
      .from('mock_exam_questions')
      .select('id, section_id, question_id, marks')
      .in('section_id', sectionIds.length > 0 ? sectionIds : ['00000000-0000-0000-0000-000000000000']);

    const { data: questionAttempts } = await supabase
      .from('user_question_attempts')
      .select('question_id, is_correct, score_awarded, evaluation_status')
      .eq('context_type', 'mock_exam')
      .eq('context_attempt_id', attempt.id);

    const questionIds = (meqs || []).map((m: any) => m.question_id);
    const { data: questions } = await supabase
      .from('questions')
      .select('id, skill')
      .in('id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

    const attemptMap = new Map((questionAttempts || []).map((qa: any) => [qa.question_id, qa]));
    const qMap = new Map((questions || []).map((q: any) => [q.id, q]));
    const secMap = new Map((sections || []).map((s: any) => [s.id, s]));

    const sectionBreakdown: Record<string, { raw_score: number; total_marks: number; percentage: number }> = {};
    const skillBreakdown: Record<string, { total_questions: number; correct_questions: number; percentage: number }> = {};

    let objectiveRawScore = 0;
    let objectiveTotalMarks = 0;
    let pendingSubjectiveMarks = 0;

    for (const meq of meqs || []) {
      const sec = secMap.get(meq.section_id);
      const q = qMap.get(meq.question_id);
      const qa = attemptMap.get(meq.question_id);
      const secName = sec?.name || 'Section';
      const skillName = q?.skill || 'general';
      const marks = meq.marks || 1;

      if (!sectionBreakdown[secName]) {
        sectionBreakdown[secName] = { raw_score: 0, total_marks: 0, percentage: 0 };
      }
      sectionBreakdown[secName].total_marks += marks;
      if (qa?.score_awarded) {
        sectionBreakdown[secName].raw_score += qa.score_awarded;
      }

      if (!skillBreakdown[skillName]) {
        skillBreakdown[skillName] = { total_questions: 0, correct_questions: 0, percentage: 0 };
      }

      if (skillName === 'writing' || skillName === 'speaking') {
        pendingSubjectiveMarks += marks;
      } else {
        objectiveTotalMarks += marks;
        skillBreakdown[skillName].total_questions += 1;
        if (qa?.is_correct === true) {
          skillBreakdown[skillName].correct_questions += 1;
          objectiveRawScore += marks;
        }
      }
    }

    for (const secKey of Object.keys(sectionBreakdown)) {
      const s = sectionBreakdown[secKey];
      s.percentage = s.total_marks > 0 ? Math.round((s.raw_score / s.total_marks) * 100) : 0;
    }

    for (const skillKey of Object.keys(skillBreakdown)) {
      const sk = skillBreakdown[skillKey];
      sk.percentage = sk.total_questions > 0 ? Math.round((sk.correct_questions / sk.total_questions) * 100) : 0;
    }

    const percentage = Number(attempt.percentage_score) || 0;
    const isPassed = percentage >= exam.passing_score;
    const hasPendingSubjective = pendingSubjectiveMarks > 0;
    const objectivePercentage = objectiveTotalMarks > 0 ? Math.round((objectiveRawScore / objectiveTotalMarks) * 100) : 0;

    let cambridgeGrade: string | undefined;
    let ieltsBand: number | undefined;
    let ieltsDescriptor: string | undefined;

    const examCode = (exam.exam_code || '').toUpperCase();
    const scoreToConvert = attempt.raw_score ?? objectiveRawScore;
    const totalToConvert = attempt.total_marks ?? (objectiveTotalMarks + pendingSubjectiveMarks);

    if (examCode === 'CAE' || examCode.includes('C1') || examCode.includes('ADVANCED')) {
      const res = convertCambridgeRawScore(scoreToConvert, totalToConvert, 'C1');
      cambridgeGrade = res.grade;
    } else if (examCode === 'CPE' || examCode.includes('C2') || examCode.includes('PROFICIENCY')) {
      const res = convertCambridgeRawScore(scoreToConvert, totalToConvert, 'C2');
      cambridgeGrade = res.grade;
    } else if (examCode === 'IELTS' || examCode.includes('IELTS')) {
      const res = convertIeltsBandScore(scoreToConvert, totalToConvert);
      ieltsBand = res.band;
      ieltsDescriptor = res.descriptor;
    }

    const response: MockExamResultResponseDTO = {
      attempt_id: attempt.id,
      session_token: attempt.session_token,
      exam: {
        id: exam.id,
        exam_code: exam.exam_code,
        name: exam.name,
        target_cefr: exam.target_cefr,
        passing_score: exam.passing_score,
        total_duration_minutes: exam.total_duration_minutes,
      },
      status: attempt.status as 'submitted' | 'timed_out',
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at || attempt.started_at,
      raw_score: attempt.raw_score || objectiveRawScore,
      total_marks: attempt.total_marks || (objectiveTotalMarks + pendingSubjectiveMarks),
      percentage_score: percentage,
      objective_score: objectiveRawScore,
      objective_total_marks: objectiveTotalMarks,
      objective_percentage: objectivePercentage,
      pending_subjective_marks: pendingSubjectiveMarks,
      has_pending_subjective: hasPendingSubjective,
      evaluation_status: hasPendingSubjective ? 'partially_evaluated_pending_subjective' : 'completed',
      is_passed: isPassed,
      estimated_cefr_level: attempt.estimated_cefr_level || 'A1',
      estimated_cambridge_score: attempt.estimated_cambridge_score || 80,
      cambridge_grade: cambridgeGrade,
      ielts_band: ieltsBand,
      ielts_descriptor: ieltsDescriptor,
      section_breakdown: sectionBreakdown,
      skill_breakdown: skillBreakdown,
      is_official: false,
      disclaimer: 'Platform practice mock examination result; not an official Cambridge English qualification certificate.',
    };

    return response;
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
    rateLimit: {
      action: 'mock_exam_results',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
