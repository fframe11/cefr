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

/**
 * Normalizes user text answer for Key Word Transformation and Gap Fill tasks:
 * - Trims whitespace and folds case
 * - Converts curly quotes / apostrophes to standard straight apostrophe
 * - Expands contractions to uncontracted forms for consistent evaluation
 * - Strips redundant trailing/leading punctuation
 */
export function normalizeKeyWordAnswer(text: string): string {
  if (!text) return '';

  let normalized = text
    .toLowerCase()
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.!?]+$/, '')
    .trim();

  // Expansion of common English contractions
  const contractionMap: Record<string, string> = {
    "didn't": 'did not',
    "don't": 'do not',
    "doesn't": 'does not',
    "can't": 'cannot',
    "couldn't": 'could not',
    "won't": 'will not',
    "wouldn't": 'would not',
    "shouldn't": 'should not',
    "haven't": 'have not',
    "hasn't": 'has not',
    "hadn't": 'had not',
    "isn't": 'is not',
    "aren't": 'are not',
    "wasn't": 'was not',
    "weren't": 'were not',
    "mustn't": 'must not',
    "needn't": 'need not',
    "i'm": 'i am',
    "you're": 'you are',
    "we're": 'we are',
    "they're": 'they are',
    "it's": 'it is',
    "he's": 'he is',
    "she's": 'she is',
    "i've": 'i have',
    "you've": 'you have',
    "we've": 'we have',
    "they've": 'they have',
    "i'll": 'i will',
    "you'll": 'you will',
    "he'll": 'he will',
    "she'll": 'she will',
    "we'll": 'we will',
    "they'll": 'they will',
    "i'd": 'i would',
    "you'd": 'you would',
    "he'd": 'he would',
    "she'd": 'she would',
    "we'd": 'we would',
    "they'd": 'they would',
  };

  for (const [contraction, expansion] of Object.entries(contractionMap)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
    normalized = normalized.replace(regex, expansion);
  }

  // Collapse multiple whitespaces
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Official Cambridge English Scale conversion:
 * C1 Advanced (CAE):
 * - 80%–100%: 200–210 (Grade A, CEFR C2)
 * - 75%–79%:  193–199 (Grade B, CEFR C1)
 * - 60%–74%:  180–192 (Grade C, CEFR C1)
 * - 45%–59%:  160–179 (Level B2, CEFR B2)
 * - < 45%:    142–159 (Fail)
 * 
 * C2 Proficiency (CPE):
 * - 80%–100%: 220–230 (Grade A, CEFR C2)
 * - 75%–79%:  213–219 (Grade B, CEFR C2)
 * - 60%–74%:  200–212 (Grade C, CEFR C2)
 * - 45%–59%:  180–199 (Level C1, CEFR C1)
 * - < 45%:    162–179 (Fail)
 */
export function convertCambridgeRawScore(
  rawScore: number,
  totalMarks: number,
  examType: 'C1' | 'C2' | 'CAE' | 'CPE' | string
): {
  cambridgeScore: number;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Level B2' | 'Level C1' | 'Fail';
  pass: boolean;
} {
  const percentage = totalMarks > 0 ? (rawScore / totalMarks) * 100 : 0;
  const isC2 = examType.toUpperCase().includes('C2') || examType.toUpperCase().includes('CPE');

  if (isC2) {
    if (percentage >= 80) {
      const score = Math.round(220 + ((percentage - 80) / 20) * 10);
      return { cambridgeScore: Math.min(230, score), cefrLevel: 'C2', grade: 'Grade A', pass: true };
    } else if (percentage >= 75) {
      const score = Math.round(213 + ((percentage - 75) / 5) * 6);
      return { cambridgeScore: Math.min(219, score), cefrLevel: 'C2', grade: 'Grade B', pass: true };
    } else if (percentage >= 60) {
      const score = Math.round(200 + ((percentage - 60) / 15) * 12);
      return { cambridgeScore: Math.min(212, score), cefrLevel: 'C2', grade: 'Grade C', pass: true };
    } else if (percentage >= 45) {
      const score = Math.round(180 + ((percentage - 45) / 15) * 19);
      return { cambridgeScore: Math.min(199, score), cefrLevel: 'C1', grade: 'Level C1', pass: false };
    } else {
      const score = Math.round(162 + (percentage / 45) * 17);
      return { cambridgeScore: Math.max(162, Math.min(179, score)), cefrLevel: 'B2', grade: 'Fail', pass: false };
    }
  } else {
    if (percentage >= 80) {
      const score = Math.round(200 + ((percentage - 80) / 20) * 10);
      return { cambridgeScore: Math.min(210, score), cefrLevel: 'C2', grade: 'Grade A', pass: true };
    } else if (percentage >= 75) {
      const score = Math.round(193 + ((percentage - 75) / 5) * 6);
      return { cambridgeScore: Math.min(199, score), cefrLevel: 'C1', grade: 'Grade B', pass: true };
    } else if (percentage >= 60) {
      const score = Math.round(180 + ((percentage - 60) / 15) * 12);
      return { cambridgeScore: Math.min(192, score), cefrLevel: 'C1', grade: 'Grade C', pass: true };
    } else if (percentage >= 45) {
      const score = Math.round(160 + ((percentage - 45) / 15) * 19);
      return { cambridgeScore: Math.min(179, score), cefrLevel: 'B2', grade: 'Level B2', pass: false };
    } else {
      const score = Math.round(142 + (percentage / 45) * 17);
      return { cambridgeScore: Math.max(142, Math.min(159, score)), cefrLevel: 'B1', grade: 'Fail', pass: false };
    }
  }
}

/**
 * Official IELTS Academic Band conversion (mapped from raw score normalized to 40 items):
 */
export function convertIeltsBandScore(
  rawScore: number,
  totalMarks: number
): {
  band: number;
  descriptor: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
} {
  const normalizedOutOf40 = totalMarks > 0 ? (rawScore / totalMarks) * 40 : 0;
  const roundedCorrect = Math.round(normalizedOutOf40);

  if (roundedCorrect >= 39) return { band: 9.0, descriptor: 'Expert user', cefrLevel: 'C2' };
  if (roundedCorrect >= 37) return { band: 8.5, descriptor: 'Very good user', cefrLevel: 'C2' };
  if (roundedCorrect >= 35) return { band: 8.0, descriptor: 'Very good user', cefrLevel: 'C1' };
  if (roundedCorrect >= 33) return { band: 7.5, descriptor: 'Good user', cefrLevel: 'C1' };
  if (roundedCorrect >= 30) return { band: 7.0, descriptor: 'Good user', cefrLevel: 'C1' };
  if (roundedCorrect >= 27) return { band: 6.5, descriptor: 'Competent user', cefrLevel: 'B2' };
  if (roundedCorrect >= 23) return { band: 6.0, descriptor: 'Competent user', cefrLevel: 'B2' };
  if (roundedCorrect >= 19) return { band: 5.5, descriptor: 'Modest user', cefrLevel: 'B2' };
  if (roundedCorrect >= 16) return { band: 5.0, descriptor: 'Modest user', cefrLevel: 'B1' };
  if (roundedCorrect >= 13) return { band: 4.5, descriptor: 'Limited user', cefrLevel: 'B1' };
  if (roundedCorrect >= 10) return { band: 4.0, descriptor: 'Limited user', cefrLevel: 'B1' };
  if (roundedCorrect >= 8)  return { band: 3.5, descriptor: 'Extremely limited user', cefrLevel: 'A2' };
  if (roundedCorrect >= 6)  return { band: 3.0, descriptor: 'Extremely limited user', cefrLevel: 'A2' };
  if (roundedCorrect >= 4)  return { band: 2.5, descriptor: 'Intermittent user', cefrLevel: 'A1' };
  return { band: 2.0, descriptor: 'Non-user', cefrLevel: 'A1' };
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
  cambridge_grade?: 'Grade A' | 'Grade B' | 'Grade C' | 'Level B2' | 'Level C1' | 'Fail';
  ielts_band?: number;
  ielts_descriptor?: string;
  section_scores: Record<string, { raw_score: number; total_marks: number; percentage: number }>;
  is_official: false;
  disclaimer: string;
  already_finalized?: boolean;
  is_demo?: boolean;
  dataset?: string;
}

/**
 * Centrally and atomically finalizes a mock exam attempt.
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

  // 2. Fetch mock exam info (for exam_code specific scale conversion)
  let mockExamRecord: any = null;
  try {
    const examQuery = supabase
      .from('mock_exams')
      .select('id, exam_code, target_cefr')
      .eq('id', attempt.mock_exam_id);
    if (examQuery && typeof examQuery.maybeSingle === 'function') {
      const res = await examQuery.maybeSingle();
      mockExamRecord = res?.data;
    } else if (examQuery && typeof examQuery.single === 'function') {
      const res = await examQuery.single();
      mockExamRecord = res?.data;
    } else if (examQuery && typeof examQuery.then === 'function') {
      const res = await examQuery;
      mockExamRecord = Array.isArray(res?.data) ? res.data[0] : res?.data;
    }
  } catch {
    // Graceful fallback for mock tests
  }

  // 3. Fetch all sections and mock exam questions for this exam
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

  // Reject any submitted questions that do not belong to this mock exam
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

    // Differentiate subjective pending vs objective questions
    if (q.skill === 'writing' || q.skill === 'speaking') {
      evalStatus = 'pending';
      isCorrect = null;
      scoreAwarded = 0;
      pendingSubjectiveMarks += marks;
    } else {
      objectiveTotalMarks += marks;
      skillCounts[q.skill].total += 1;

      if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'multiple_matching') {
        const opts = optionsByQ.get(q.id) || [];
        const correctOpt = opts.find((o) => o.is_correct);
        const actualKey = (studentAns?.selected_option_key || studentAns?.text_answer || '').trim();
        if (
          (correctOpt && actualKey === correctOpt.key) ||
          (q.correct_answer_text && actualKey.toUpperCase() === q.correct_answer_text.trim().toUpperCase())
        ) {
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
      } else if (q.type === 'keyword_transformation') {
        const actualNorm = normalizeKeyWordAnswer(studentAns?.text_answer || '');
        const expectedRaw = q.correct_answer_text || '';
        const alternatives = expectedRaw
          .split(/[|\/]/)
          .map((a: string) => normalizeKeyWordAnswer(a))
          .filter(Boolean);
        if (alternatives.length > 0 && alternatives.includes(actualNorm)) {
          isCorrect = true;
          scoreAwarded = marks;
        } else {
          isCorrect = false;
          scoreAwarded = 0;
        }
      } else if (q.type === 'gapped_text') {
        const actualVal = (studentAns?.selected_option_key || studentAns?.text_answer || '').trim().toUpperCase();
        const opts = optionsByQ.get(q.id) || [];
        const correctOpt = opts.find((o) => o.is_correct);
        const expectedVal = (q.correct_answer_text || correctOpt?.key || '').trim().toUpperCase();
        if (actualVal && (actualVal === expectedVal || (correctOpt && actualVal === correctOpt.key.toUpperCase()))) {
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

    // Upsert attempt into user_question_attempts
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

  const objectivePercentage = objectiveTotalMarks > 0 ? Math.round((objectiveRawScore / objectiveTotalMarks) * 100) : 0;
  const estimation = estimatePlatformCefr(objectiveRawScore, objectiveTotalMarks || 1);
  const hasPendingSubjective = pendingSubjectiveMarks > 0;
  const evaluationStatus = hasPendingSubjective ? 'partially_evaluated_pending_subjective' : 'completed';

  const examCode = (mockExamRecord?.exam_code || '').toUpperCase();
  let cambridgeGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Level B2' | 'Level C1' | 'Fail' | undefined;
  let ieltsBand: number | undefined;
  let ieltsDescriptor: string | undefined;

  let finalCambridgeScore = estimation.estimatedCambridgeScore;
  let finalCefrLevel = estimation.estimatedLevel;

  if (examCode === 'CAE' || examCode.includes('C1') || examCode.includes('ADVANCED')) {
    const cambridgeRes = convertCambridgeRawScore(objectiveRawScore, objectiveTotalMarks || 1, 'C1');
    finalCambridgeScore = cambridgeRes.cambridgeScore;
    finalCefrLevel = cambridgeRes.cefrLevel;
    cambridgeGrade = cambridgeRes.grade;
  } else if (examCode === 'CPE' || examCode.includes('C2') || examCode.includes('PROFICIENCY')) {
    const cambridgeRes = convertCambridgeRawScore(objectiveRawScore, objectiveTotalMarks || 1, 'C2');
    finalCambridgeScore = cambridgeRes.cambridgeScore;
    finalCefrLevel = cambridgeRes.cefrLevel;
    cambridgeGrade = cambridgeRes.grade;
  } else if (examCode === 'IELTS' || examCode.includes('IELTS')) {
    const ieltsRes = convertIeltsBandScore(objectiveRawScore, objectiveTotalMarks || 1);
    ieltsBand = ieltsRes.band;
    ieltsDescriptor = ieltsRes.descriptor;
    finalCefrLevel = ieltsRes.cefrLevel;
  }

  // 7. Persist finalized scores into user_mock_exam_attempts
  await supabase
    .from('user_mock_exam_attempts')
    .update({
      raw_score: objectiveRawScore,
      total_marks: totalMarks || 1,
      percentage_score: objectivePercentage,
      estimated_cambridge_score: finalCambridgeScore,
      estimated_cefr_level: finalCefrLevel,
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
    estimated_cefr_level: finalCefrLevel,
    estimated_cambridge_score: finalCambridgeScore,
    cambridge_grade: cambridgeGrade,
    ielts_band: ieltsBand,
    ielts_descriptor: ieltsDescriptor,
    section_scores: sectionScores,
    is_official: false,
    disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
  };
}
