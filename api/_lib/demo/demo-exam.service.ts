import crypto from 'crypto';
import {
  LEAD_DEMO_EXAM,
  LEAD_DEMO_EXAM_ID,
  LEAD_DEMO_EXAM_CATALOG_ITEM,
  getSanitizedDemoSections,
} from '../../../data/demoExamData';
import { calculateExamTiming, FinalizeExamResult } from '../../mock-exams/_engine';
import { estimatePlatformCefr } from '../assessment/cefr-calculator';
import { NotFoundError, BadRequestError } from '../errors/api-error';

export interface DemoCandidateAnswer {
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
}

export interface DemoExamSessionState {
  attemptId: string;
  userId: string;
  sessionToken: string;
  mockExamId: string;
  startedAt: string;
  submittedAt?: string | null;
  status: 'in_progress' | 'submitted' | 'timed_out';
  durationMinutes: number;
  answers: Map<string, DemoCandidateAnswer>;
  result?: FinalizeExamResult | null;
}

// In-memory isolated store for active and completed demo sessions
const demoSessions = new Map<string, DemoExamSessionState>();
const userActiveDemoTokens = new Map<string, string>();

export class DemoExamService {
  /**
   * Checks whether a session token belongs to an isolated demo session.
   */
  public static isDemoSessionToken(token?: string | null): boolean {
    if (!token) return false;
    return demoSessions.has(token) || token.startsWith('dddddddd-demo-') || token.startsWith('demo-session-');
  }

  /**
   * Initializes a fresh, isolated demo exam session for the Lead or demo student.
   * Enables easy reset: clears any previous active session for this user.
   */
  public static startDemoSession(userId = 'demo-student-id'): DemoExamSessionState {
    const sessionToken = crypto.randomUUID();
    const attemptId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const durationMinutes = LEAD_DEMO_EXAM.totalDurationMinutes;

    const sessionState: DemoExamSessionState = {
      attemptId,
      userId,
      sessionToken,
      mockExamId: LEAD_DEMO_EXAM_ID,
      startedAt,
      submittedAt: null,
      status: 'in_progress',
      durationMinutes,
      answers: new Map<string, DemoCandidateAnswer>(),
      result: null,
    };

    demoSessions.set(sessionToken, sessionState);
    userActiveDemoTokens.set(userId, sessionToken);

    return sessionState;
  }

  /**
   * Retrieves active demo session state.
   */
  public static getDemoSession(token: string): DemoExamSessionState | null {
    return demoSessions.get(token) || null;
  }

  /**
   * Builds the safe, sanitized session DTO for GET /api/mock-exams/session.
   * Under no circumstances are answer keys leaked to the client.
   */
  public static getSanitizedSessionDTO(token: string) {
    let session = demoSessions.get(token);
    if (!session) {
      // Re-hydrate ephemeral session on demand for valid demo token
      session = this.startDemoSession('demo-student-id');
      demoSessions.set(token, { ...session, sessionToken: token });
      session = demoSessions.get(token)!;
    }

    const timing = calculateExamTiming(session.startedAt, session.durationMinutes);
    let currentStatus = session.status;
    let remainingSeconds = timing.remainingSeconds;

    // Timeout auto-finalization past grace
    if (timing.isPastGrace && currentStatus === 'in_progress') {
      this.submitDemoSession(token);
      currentStatus = 'timed_out';
      remainingSeconds = 0;
    }

    const rawSections = getSanitizedDemoSections();

    // Attach saved answers without leaking evaluation
    const sections = rawSections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((q) => {
        const saved = session!.answers.get(q.id);
        return {
          ...q,
          saved_answer: saved
            ? {
                selected_option_key: saved.selected_option_key || null,
                text_answer: saved.text_answer || null,
              }
            : null,
        };
      }),
    }));

    return {
      session_token: session.sessionToken,
      mock_exam: {
        id: LEAD_DEMO_EXAM.id,
        exam_code: LEAD_DEMO_EXAM.examCode,
        name: LEAD_DEMO_EXAM.name,
        target_cefr: LEAD_DEMO_EXAM.targetCefr,
        total_duration_minutes: LEAD_DEMO_EXAM.totalDurationMinutes,
      },
      status: currentStatus,
      started_at: session.startedAt,
      expires_at: new Date(timing.expiresMs).toISOString(),
      remaining_seconds: remainingSeconds,
      sections,
      disclaimer: 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications',
      is_demo: true,
    };
  }

  /**
   * Safely autosaves intermediate answer in demo store.
   */
  public static autosaveDemoAnswer(
    token: string,
    questionId: string,
    answer: DemoCandidateAnswer
  ): { success: boolean; saved_at: string } {
    const session = demoSessions.get(token);
    if (!session) {
      throw new NotFoundError('Demo exam session not found.');
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestError(`Cannot autosave answers for demo attempt with status '${session.status}'.`);
    }

    const timing = calculateExamTiming(session.startedAt, session.durationMinutes);
    if (timing.isPastGrace) {
      this.submitDemoSession(token);
      throw new BadRequestError('Demo exam session has timed out. Submission is locked.');
    }

    // Verify question belongs to demo exam
    const allQuestions = LEAD_DEMO_EXAM.sections.flatMap((s) => s.questions);
    const exists = allQuestions.some((q) => q.id === questionId);
    if (!exists) {
      throw new BadRequestError(`Question ${questionId} does not belong to this demo mock exam.`);
    }

    session.answers.set(questionId, {
      selected_option_key: answer.selected_option_key ?? null,
      text_answer: answer.text_answer ?? null,
      time_spent_seconds: answer.time_spent_seconds ?? 0,
    });

    return {
      success: true,
      saved_at: new Date().toISOString(),
    };
  }

  /**
   * Atomically finalizes and objectively grades demo exam attempt.
   * Server-authoritative grading against LEAD_DEMO_EXAM definitions.
   * Completely isolated from production databases.
   */
  public static submitDemoSession(
    token: string,
    incomingAnswers: Array<{
      question_id: string;
      selected_option_key?: string | null;
      text_answer?: string | null;
      time_spent_seconds?: number;
    }> = []
  ): FinalizeExamResult {
    const session = demoSessions.get(token);
    if (!session) {
      throw new NotFoundError('Demo exam session not found.');
    }

    // Idempotent return if already finalized
    if (session.status !== 'in_progress' && session.result) {
      return {
        ...session.result,
        already_finalized: true,
      };
    }

    const submittedAt = new Date().toISOString();
    const timing = calculateExamTiming(session.startedAt, session.durationMinutes);
    const targetStatus = timing.isPastGrace ? 'timed_out' : 'submitted';

    // Merge incoming answers
    for (const ans of incomingAnswers) {
      session.answers.set(ans.question_id, {
        selected_option_key: ans.selected_option_key,
        text_answer: ans.text_answer,
        time_spent_seconds: ans.time_spent_seconds,
      });
    }

    const allSections = LEAD_DEMO_EXAM.sections;
    const allQuestions = allSections.flatMap((s) => s.questions);

    let objectiveRawScore = 0;
    let totalMarks = 0;
    const sectionScores: Record<string, { raw_score: number; total_marks: number; percentage: number }> = {};

    for (const sec of allSections) {
      sectionScores[sec.name] = { raw_score: 0, total_marks: 0, percentage: 0 };

      for (const q of sec.questions) {
        const marks = q.marks || 1;
        totalMarks += marks;
        sectionScores[sec.name].total_marks += marks;

        const candidateAns = session.answers.get(q.id);
        let isCorrect = false;

        if (q.type === 'multiple_choice') {
          const correctOpt = q.options.find((opt) => opt.isCorrect);
          if (candidateAns?.selected_option_key && correctOpt && candidateAns.selected_option_key === correctOpt.key) {
            isCorrect = true;
          }
        } else if (q.type === 'fill_blank') {
          const expected = (q.correctAnswerText || '').trim().toLowerCase();
          const actual = (candidateAns?.text_answer || '').trim().toLowerCase();
          if (expected.length > 0 && actual === expected) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          objectiveRawScore += marks;
          sectionScores[sec.name].raw_score += marks;
        }
      }

      if (sectionScores[sec.name].total_marks > 0) {
        sectionScores[sec.name].percentage = Math.round(
          (sectionScores[sec.name].raw_score / sectionScores[sec.name].total_marks) * 100
        );
      }
    }

    const percentageScore = totalMarks > 0 ? Math.round((objectiveRawScore / totalMarks) * 100) : 0;
    const estimation = estimatePlatformCefr(objectiveRawScore, totalMarks);

    const result: FinalizeExamResult = {
      attempt_id: session.attemptId,
      session_token: session.sessionToken,
      status: targetStatus,
      started_at: session.startedAt,
      submitted_at: submittedAt,
      raw_score: objectiveRawScore,
      total_marks: totalMarks,
      percentage_score: percentageScore,
      objective_score: objectiveRawScore,
      objective_total_marks: totalMarks,
      objective_percentage: percentageScore,
      pending_subjective_marks: 0,
      has_pending_subjective: false,
      evaluation_status: 'completed',
      estimated_cefr_level: estimation.estimatedLevel,
      estimated_cambridge_score: estimation.estimatedCambridgeScore,
      section_scores: sectionScores,
      is_official: false,
      disclaimer: 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications',
      is_demo: true,
      dataset: 'lead_demo',
    };

    session.status = targetStatus;
    session.submittedAt = submittedAt;
    session.result = result;

    return result;
  }

  /**
   * Retrieves full result DTO for GET /api/mock-exams/results.
   */
  public static getDemoResultsDTO(token: string) {
    const session = demoSessions.get(token);
    if (!session) {
      throw new NotFoundError('Demo exam attempt session not found.');
    }

    if (session.status === 'in_progress') {
      const timing = calculateExamTiming(session.startedAt, session.durationMinutes);
      if (!timing.isPastGrace) {
        throw new BadRequestError('Mock exam is still in progress. Results are available only after submission.');
      }
      this.submitDemoSession(token);
    }

    const res = session.result || this.submitDemoSession(token);
    const isPassed = res.percentage_score >= LEAD_DEMO_EXAM.passingScore;

    const skillBreakdown: Record<string, { total_questions: number; correct_questions: number; percentage: number }> = {
      reading: { total_questions: 1, correct_questions: 0, percentage: 0 },
      grammar: { total_questions: 2, correct_questions: 0, percentage: 0 },
      listening: { total_questions: 2, correct_questions: 0, percentage: 0 },
    };

    // Calculate skill breakdown
    for (const sec of LEAD_DEMO_EXAM.sections) {
      for (const q of sec.questions) {
        const candidateAns = session.answers.get(q.id);
        let correct = false;
        if (q.type === 'multiple_choice') {
          const c = q.options.find((o) => o.isCorrect);
          if (candidateAns?.selected_option_key === c?.key) correct = true;
        } else if (q.type === 'fill_blank') {
          if (candidateAns?.text_answer?.trim().toLowerCase() === q.correctAnswerText?.toLowerCase()) correct = true;
        }

        if (skillBreakdown[q.skill]) {
          if (correct) skillBreakdown[q.skill].correct_questions += 1;
        }
      }
    }

    for (const sk of Object.keys(skillBreakdown)) {
      const item = skillBreakdown[sk];
      item.percentage = item.total_questions > 0 ? Math.round((item.correct_questions / item.total_questions) * 100) : 0;
    }

    const reviewQuestions: Array<{
      question_id: string;
      is_correct: boolean;
      user_selected_key?: string | null;
      user_text_answer?: string | null;
      correct_option_key?: string | null;
      correct_answer_text?: string | null;
      explanation_th?: string | null;
      explanation_en?: string | null;
    }> = [];

    for (const sec of LEAD_DEMO_EXAM.sections) {
      for (const q of sec.questions) {
        const candidateAns = session.answers.get(q.id);
        let correct = false;
        let correctKey: string | null = null;
        let explanation: string | null = null;

        if (q.type === 'multiple_choice') {
          const correctOpt = q.options.find((o) => o.isCorrect);
          correctKey = correctOpt?.key || null;
          if (candidateAns?.selected_option_key && candidateAns.selected_option_key === correctKey) {
            correct = true;
          }
          explanation = correctOpt?.feedbackTh || null;
        } else if (q.type === 'fill_blank') {
          const expected = (q.correctAnswerText || '').trim().toLowerCase();
          const actual = (candidateAns?.text_answer || '').trim().toLowerCase();
          if (expected.length > 0 && actual === expected) {
            correct = true;
          }
          explanation = `คำตอบที่ถูกต้องคือ "${q.correctAnswerText}" (${q.promptTh})`;
        }

        reviewQuestions.push({
          question_id: q.id,
          is_correct: correct,
          user_selected_key: candidateAns?.selected_option_key || null,
          user_text_answer: candidateAns?.text_answer || null,
          correct_option_key: correctKey,
          correct_answer_text: q.correctAnswerText || null,
          explanation_th: explanation,
          explanation_en: null,
        });
      }
    }

    return {
      attempt_id: session.attemptId,
      session_token: session.sessionToken,
      exam: {
        id: LEAD_DEMO_EXAM.id,
        exam_code: LEAD_DEMO_EXAM.examCode,
        name: LEAD_DEMO_EXAM.name,
        target_cefr: LEAD_DEMO_EXAM.targetCefr,
        passing_score: LEAD_DEMO_EXAM.passingScore,
        total_duration_minutes: LEAD_DEMO_EXAM.totalDurationMinutes,
      },
      status: session.status as 'submitted' | 'timed_out',
      started_at: session.startedAt,
      submitted_at: session.submittedAt || session.startedAt,
      raw_score: res.raw_score,
      total_marks: res.total_marks,
      percentage_score: res.percentage_score,
      objective_score: res.objective_score,
      objective_total_marks: res.objective_total_marks,
      objective_percentage: res.objective_percentage,
      pending_subjective_marks: 0,
      has_pending_subjective: false,
      evaluation_status: 'completed' as const,
      is_passed: isPassed,
      estimated_cefr_level: res.estimated_cefr_level,
      estimated_cambridge_score: res.estimated_cambridge_score,
      section_breakdown: res.section_scores,
      skill_breakdown: skillBreakdown,
      is_official: false as const,
      disclaimer: 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications',
      is_demo: true,
      review_questions: reviewQuestions,
    };
  }

  /**
   * Resets all demo sessions for a user (Easy Reset).
   */
  public static resetDemoSession(userId = 'demo-student-id'): void {
    const existingToken = userActiveDemoTokens.get(userId);
    if (existingToken) {
      demoSessions.delete(existingToken);
      userActiveDemoTokens.delete(userId);
    }
  }

  public static getCatalogItem() {
    return LEAD_DEMO_EXAM_CATALOG_ITEM;
  }
}
