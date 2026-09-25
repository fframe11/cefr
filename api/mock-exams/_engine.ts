import { estimatePlatformCefr } from '../_lib/assessment/cefr-calculator';
import { updateStreakOnActivity } from '../_lib/assessment/streak';
import { BadRequestError, ConflictError, NotFoundError } from '../_lib/errors/api-error';

export const GRACE_PERIOD_SECONDS = 60;
export const GRACE_PERIOD_MS = GRACE_PERIOD_SECONDS * 1000;

export interface ExamTimingInfo {
  startedMs: number;
  durationMs: number;
  expiresMs: number;
  graceExpiresMs: number;
  nowMs: number;
  isExpired: boolean;
  isInGrace: boolean;
  isPastGrace: boolean;
  remainingSeconds: number;
  targetSubmitStatus: 'submitted' | 'timed_out';
}

/**
 * Computes server-authoritative timing with mandatory 60-second grace period.
 * 
 * TIMING INVARIANTS:
 * 1. Normal duration: nowMs <= expiresMs -> remainingSeconds > 0, status 'in_progress', target 'submitted'.
 * 2. At expiration boundary: nowMs === expiresMs -> remainingSeconds = 0, target 'submitted'.
 * 3. Within 60-second grace: expiresMs < nowMs <= graceExpiresMs -> remainingSeconds = 0, target 'submitted'.
 * 4. After grace: nowMs > graceExpiresMs -> definitely 'timed_out'.
 */
export function calculateExamTiming(startedAt: string, durationMinutes: number): ExamTimingInfo {
  const startedMs = new Date(startedAt).getTime();
  const durationMs = durationMinutes * 60 * 1000;
  const expiresMs = startedMs + durationMs;
  const graceExpiresMs = expiresMs + GRACE_PERIOD_MS;
  const nowMs = Date.now();

  const isExpired = nowMs >= expiresMs;
  const isInGrace = nowMs > expiresMs && nowMs <= graceExpiresMs;
  const isPastGrace = nowMs > graceExpiresMs;
  const remainingSeconds = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
  const targetSubmitStatus: 'submitted' | 'timed_out' = isPastGrace ? 'timed_out' : 'submitted';

  return {
    startedMs,
    durationMs,
    expiresMs,
    graceExpiresMs,
    nowMs,
    isExpired,
    isInGrace,
    isPastGrace,
    remainingSeconds,
    targetSubmitStatus,
  };
}

export interface FinalizeExamOptions {
  attemptId: string;
  userId: string;
  sessionToken: string;
  targetStatus: 'submitted' | 'timed_out';
  submittedAt: string;
  incomingAnswers?: Array<{
    question_id: string;
    selected_option_key?: string | null;
    text_answer?: string | null;
    time_spent_seconds?: number;
  }>;
  supabase: any;
}

export interface FinalizeExamResult {
  attempt_id: string;
  session_token: string;
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
  estimated_cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimated_cambridge_score: number;
  section_scores: Record<string, { raw_score: number; total_marks: number; percentage: number }>;
  is_official: false;
  disclaimer: string;
  already_finalized?: boolean;
}

/**
 * Centrally and atomically finalizes a mock exam attempt.
 * Used identically by:
 * - POST /api/mock-exams/submit (user submission)
 * - GET /api/mock-exams/session (auto-timeout detection after grace)
 * - POST /api/mock-exams/autosave (timeout lock after grace)
 * - GET /api/mock-exams/results (results access after grace)
 */
export async function finalizeMockExamAttempt(opts: FinalizeExamOptions): Promise<FinalizeExamResult> {
  const { attemptId, userId, sessionToken, targetStatus, submittedAt, incomingAnswers = [], supabase } = opts;

  // 1. Fetch attempt and exam to validate state
  const { data: attempt, error: attemptError } = await supabase
    .from('user_mock_exam_attempts')
    .select('id, user_id, mock_exam_id, session_token, started_at, submitted_at, status, raw_score, total_marks, percentage_score, estimated_cefr_level, estimated_cambridge_score')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt) {
    throw new NotFoundError('Mock exam attempt not found.');
  }

  // Idempotent defense: if already finalized, return persisted state immediately
  if (attempt.status !== 'in_progress') {
    return {
      attempt_id: attempt.id,
      session_token: attempt.session_token,
      status: attempt.status as 'submitted' | 'timed_out',
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at || attempt.started_at,
      raw_score: attempt.raw_score || 0,
      total_marks: attempt.total_marks || 1,
      percentage_score: Number(attempt.percentage_score) || 0,
      objective_score: attempt.raw_score || 0,
      objective_total_marks: attempt.total_marks || 1,
      objective_percentage: Number(attempt.percentage_score) || 0,
      pending_subjective_marks: 0,
      has_pending_subjective: false,
      evaluation_status: 'completed',
      estimated_cefr_level: (attempt.estimated_cefr_level as any) || 'A1',
      estimated_cambridge_score: attempt.estimated_cambridge_score || 80,
      section_scores: {},
      is_official: false,
      disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
      already_finalized: true,
    };
  }

  // 2. Fetch all sections and mock exam questions for this exam
  const { data: sections } = await supabase
    .from('mock_exam_sections')
    .select('id, name, skill')
    .eq('mock_exam_id', attempt.mock_exam_id);

  const sectionIds = (sections || []).map((s: any) => s.id);
  const { data: meqs } = await supabase
    .from('mock_exam_questions')
    .select('id, section_id, question_id, marks')
    .in('section_id', sectionIds.length > 0 ? sectionIds : ['00000000-0000-0000-0000-000000000000']);

  const allowedQuestionIds = new Set((meqs || []).map((m: any) => m.question_id));

  // 3. CRITICAL AUDIT #11: Strictly reject any submitted questions that do not belong to this mock exam
  for (const ans of incomingAnswers) {
    if (!allowedQuestionIds.has(ans.question_id)) {
      throw new BadRequestError(`Question ${ans.question_id} does not belong to this mock exam.`);
    }
  }

  // 4. ATOMIC CONDITIONAL UPDATE: Secure against race condition between submit and timeout
  const { data: updatedAttempt, error: updateError } = await supabase
    .from('user_mock_exam_attempts')
    .update({
      status: targetStatus,
      submitted_at: submittedAt,
    })
    .eq('id', attempt.id)
    .eq('status', 'in_progress')
    .select('id, status, submitted_at')
    .maybeSingle();

  if (updateError || !updatedAttempt) {
    // Another concurrent worker finalized the attempt
    const { data: finalized } = await supabase
      .from('user_mock_exam_attempts')
      .select('id, status, submitted_at, raw_score, total_marks, percentage_score, estimated_cefr_level, estimated_cambridge_score')
      .eq('id', attempt.id)
      .single();

    if (finalized && finalized.status !== 'in_progress') {
      return {
        attempt_id: finalized.id,
        session_token: sessionToken,
        status: finalized.status as 'submitted' | 'timed_out',
        started_at: attempt.started_at,
        submitted_at: finalized.submitted_at || submittedAt,
        raw_score: finalized.raw_score || 0,
        total_marks: finalized.total_marks || 1,
        percentage_score: Number(finalized.percentage_score) || 0,
        objective_score: finalized.raw_score || 0,
        objective_total_marks: finalized.total_marks || 1,
        objective_percentage: Number(finalized.percentage_score) || 0,
        pending_subjective_marks: 0,
        has_pending_subjective: false,
        evaluation_status: 'completed',
        estimated_cefr_level: (finalized.estimated_cefr_level as any) || 'A1',
        estimated_cambridge_score: finalized.estimated_cambridge_score || 80,
        section_scores: {},
        is_official: false,
        disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
        already_finalized: true,
      };
    }

    throw new ConflictError('Concurrent modification detected on this exam session.');
  }

  // 5. Fetch question grading definitions
  const questionIds = Array.from(allowedQuestionIds);
  const { data: rawQuestions } = await supabase
    .from('questions')
    .select('id, skill, type, difficulty_weight, correct_answer_text, weakness_tag, prompt_th')
    .in('id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

  const { data: rawOptions } = await supabase
    .from('question_options')
    .select('id, question_id, key, is_correct')
    .in('question_id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

  // Fetch saved intermediate answers from user_question_attempts
  const { data: savedAnswers } = await supabase
    .from('user_question_attempts')
    .select('id, question_id, selected_key, text_answer, time_spent_seconds')
    .eq('context_type', 'mock_exam')
    .eq('context_attempt_id', attempt.id);

  // Merge: incoming answers take precedence over autosaved answers
  const answerMap = new Map<string, { selected_option_key?: string | null; text_answer?: string | null; time_spent_seconds?: number }>();
  if (savedAnswers) {
    for (const sa of savedAnswers) {
      answerMap.set(sa.question_id, {
        selected_option_key: sa.selected_key,
        text_answer: sa.text_answer,
        time_spent_seconds: sa.time_spent_seconds || 0,
      });
    }
  }
  for (const ans of incomingAnswers) {
    answerMap.set(ans.question_id, {
      selected_option_key: ans.selected_option_key,
      text_answer: ans.text_answer,
      time_spent_seconds: ans.time_spent_seconds || 0,
    });
  }

  const questionMap = new Map<string, any>((rawQuestions || []).map((q: any) => [q.id, q]));
  const sectionMap = new Map<string, any>((sections || []).map((s: any) => [s.id, s]));
  const optionsByQ = new Map<string, Array<{ key: string; is_correct: boolean }>>();
  for (const opt of rawOptions || []) {
    const list = optionsByQ.get(opt.question_id) || [];
    list.push(opt);
    optionsByQ.set(opt.question_id, list);
  }

  let objectiveRawScore = 0;
  let objectiveTotalMarks = 0;
  let pendingSubjectiveMarks = 0;
  let totalMarks = 0;

  const sectionScores: Record<string, { raw_score: number; total_marks: number; percentage: number }> = {};
  const skillCounts: Record<string, { total: number; correct: number }> = {};
  const weaknessesToRecord: Record<string, { tag: string; label_th: string }> = {};

  // 6. Objectively grade each mock exam question
  for (const meq of meqs || []) {
    const q = questionMap.get(meq.question_id);
    if (!q) continue;

    const marks = meq.marks || 1;
    totalMarks += marks;

    const sec = sectionMap.get(meq.section_id);
    const secName = sec?.name || 'Section';
    if (!sectionScores[secName]) {
      sectionScores[secName] = { raw_score: 0, total_marks: 0, percentage: 0 };
    }
    sectionScores[secName].total_marks += marks;

    if (!skillCounts[q.skill]) {
      skillCounts[q.skill] = { total: 0, correct: 0 };
    }

    const studentAns = answerMap.get(q.id);
    let isCorrect: boolean | null = false;
    let scoreAwarded = 0;
    let evalStatus: 'pending' | 'completed' = 'completed';

    // CRITICAL AUDIT #3: Differentiate subjective pending vs objective questions
    if (q.skill === 'writing' || q.skill === 'speaking') {
      evalStatus = 'pending';
      isCorrect = null;
      scoreAwarded = 0;
      pendingSubjectiveMarks += marks;
    } else {
      objectiveTotalMarks += marks;
      skillCounts[q.skill].total += 1;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const opts = optionsByQ.get(q.id) || [];
        const correctOpt = opts.find((o) => o.is_correct);
        if (studentAns?.selected_option_key && correctOpt && studentAns.selected_option_key === correctOpt.key) {
          isCorrect = true;
          scoreAwarded = marks;
        } else {
          isCorrect = false;
          scoreAwarded = 0;
        }
      } else if (q.type === 'fill_blank') {
        const expected = (q.correct_answer_text || '').trim().toLowerCase();
        const actual = (studentAns?.text_answer || '').trim().toLowerCase();
        if (expected.length > 0 && actual === expected) {
          isCorrect = true;
          scoreAwarded = marks;
        } else {
          isCorrect = false;
          scoreAwarded = 0;
        }
      } else {
        isCorrect = false;
        scoreAwarded = 0;
      }

      objectiveRawScore += scoreAwarded;
      sectionScores[secName].raw_score += scoreAwarded;

      if (isCorrect === true) {
        skillCounts[q.skill].correct += 1;
      } else if (isCorrect === false && q.weakness_tag) {
        weaknessesToRecord[q.weakness_tag] = {
          tag: q.weakness_tag,
          label_th: q.prompt_th ? q.prompt_th.slice(0, 80) : q.weakness_tag,
        };
      }
    }

    // Upsert attempt into user_question_attempts adhering to uq_attempt_question index
    const existing = savedAnswers?.find((s: any) => s.question_id === q.id);
    if (existing) {
      await supabase
        .from('user_question_attempts')
        .update({
          selected_key: studentAns?.selected_option_key || null,
          text_answer: studentAns?.text_answer || null,
          is_correct: isCorrect,
          score_awarded: scoreAwarded,
          evaluation_status: evalStatus,
          time_spent_seconds: studentAns?.time_spent_seconds || existing.time_spent_seconds || 0,
          attempted_at: submittedAt,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_question_attempts').insert({
        user_id: userId,
        question_id: q.id,
        selected_key: studentAns?.selected_option_key || null,
        text_answer: studentAns?.text_answer || null,
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        evaluation_status: evalStatus,
        time_spent_seconds: studentAns?.time_spent_seconds || 0,
        context_type: 'mock_exam',
        context_attempt_id: attempt.id,
        attempted_at: submittedAt,
      });
    }
  }

  // Section percentage breakdown
  for (const secKey of Object.keys(sectionScores)) {
    const s = sectionScores[secKey];
    s.percentage = s.total_marks > 0 ? Math.round((s.raw_score / s.total_marks) * 100) : 0;
  }

  // CRITICAL AUDIT #3: Evaluate percentage based on evaluated objective questions so pending subjective questions do NOT artificially depress score
  const objectivePercentage = objectiveTotalMarks > 0 ? Math.round((objectiveRawScore / objectiveTotalMarks) * 100) : 0;
  const estimation = estimatePlatformCefr(objectiveRawScore, objectiveTotalMarks || 1);
  const hasPendingSubjective = pendingSubjectiveMarks > 0;
  const evaluationStatus = hasPendingSubjective ? 'partially_evaluated_pending_subjective' : 'completed';

  // 7. Persist finalized scores into user_mock_exam_attempts
  await supabase
    .from('user_mock_exam_attempts')
    .update({
      raw_score: objectiveRawScore,
      total_marks: totalMarks || 1,
      percentage_score: objectivePercentage,
      estimated_cambridge_score: estimation.estimatedCambridgeScore,
      estimated_cefr_level: estimation.estimatedLevel,
    })
    .eq('id', attempt.id);

  // 8. Update user_skill_progress and user_weaknesses for objective evaluations
  for (const [skillKey, stat] of Object.entries(skillCounts)) {
    if (stat.total === 0) continue;
    const skillScore = Math.round((stat.correct / stat.total) * 100);
    try {
      const { data: existingSkill } = await supabase
        .from('user_skill_progress')
        .select('id, proficiency_score, questions_completed')
        .eq('user_id', userId)
        .eq('skill', skillKey)
        .maybeSingle();

      if (existingSkill) {
        await supabase
          .from('user_skill_progress')
          .update({
            proficiency_score: skillScore,
            questions_completed: existingSkill.questions_completed + stat.total,
            updated_at: submittedAt,
          })
          .eq('id', existingSkill.id);
      } else {
        await supabase.from('user_skill_progress').insert({
          user_id: userId,
          skill: skillKey,
          proficiency_score: skillScore,
          questions_completed: stat.total,
          updated_at: submittedAt,
        });
      }
    } catch {
      // Non-blocking telemetry
    }
  }

  for (const [tag] of Object.entries(weaknessesToRecord)) {
    try {
      const { data: existingWeakness } = await supabase
        .from('user_weaknesses')
        .select('id, error_count')
        .eq('user_id', userId)
        .eq('weakness_tag', tag)
        .maybeSingle();

      if (existingWeakness) {
        await supabase
          .from('user_weaknesses')
          .update({
            error_count: existingWeakness.error_count + 1,
            last_failed_at: submittedAt,
          })
          .eq('id', existingWeakness.id);
      } else {
        await supabase.from('user_weaknesses').insert({
          user_id: userId,
          weakness_tag: tag,
          error_count: 1,
          last_failed_at: submittedAt,
        });
      }
    } catch {
      // Non-blocking telemetry
    }
  }

  // 9. Update user streak on activity
  try {
    await updateStreakOnActivity(supabase, userId, new Date(submittedAt));
  } catch {
    // Non-blocking telemetry
  }

  return {
    attempt_id: attempt.id,
    session_token: sessionToken,
    status: targetStatus,
    started_at: attempt.started_at,
    submitted_at: submittedAt,
    raw_score: objectiveRawScore,
    total_marks: totalMarks,
    percentage_score: objectivePercentage,
    objective_score: objectiveRawScore,
    objective_total_marks: objectiveTotalMarks,
    objective_percentage: objectivePercentage,
    pending_subjective_marks: pendingSubjectiveMarks,
    has_pending_subjective: hasPendingSubjective,
    evaluation_status: evaluationStatus,
    estimated_cefr_level: estimation.estimatedLevel,
    estimated_cambridge_score: estimation.estimatedCambridgeScore,
    section_scores: sectionScores,
    is_official: false,
    disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
  };
}
