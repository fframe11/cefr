import { apiClient } from './client';
import { AssessmentSubmitInput, AssessmentResultDTO } from './types';

/**
 * POST /api/assessment/submit
 * Submits diagnostic assessment answers to server for deterministic CEFR calculation.
 * Client-side score or CEFR claims are strictly stripped.
 */
export async function submitAssessment(input: AssessmentSubmitInput): Promise<AssessmentResultDTO> {
  const sanitizedAnswers = (input.answers || []).map((ans) => ({
    question_id: ans.question_id,
    selected_option_key: ans.selected_option_key || undefined,
    text_answer: ans.text_answer || undefined,
    time_spent_seconds: ans.time_spent_seconds ?? 0,
  }));

  return apiClient.post<AssessmentResultDTO>('/api/assessment/submit', {
    answers: sanitizedAnswers,
  });
}

/**
 * GET /api/assessment/result
 * Fetches the authenticated user's latest placement assessment result from the server.
 */
export async function getAssessmentResult(): Promise<AssessmentResultDTO> {
  return apiClient.get<AssessmentResultDTO>('/api/assessment/result');
}
