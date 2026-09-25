import { apiClient } from './client';

export interface PracticeSubmitInput {
  question_id: string;
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
  context_type?: 'practice' | 'placement';
  // Forbidden client fields that will be stripped
  user_id?: never;
  is_correct?: never;
  score_awarded?: never;
}

export interface PracticeGradingResultDTO {
  attempt_id: string;
  question_id: string;
  is_correct: boolean | null;
  score_awarded: number;
  evaluation_status: 'completed' | 'pending';
  correct_option_key: string | null;
  correct_answer_text: string | null;
  explanation_en: string;
  explanation_th: string;
  feedback_th: string;
  attempted_at: string;
}

export interface PracticeSubmitResponseDTO {
  result: PracticeGradingResultDTO;
}

/**
 * POST /api/practice/submit
 * Submits student answer for server-authoritative grading.
 * 
 * SECURITY INVARIANT:
 * Strictly discards client claims of correctness or score.
 * Only question_id, selected_option_key / text_answer, and time_spent_seconds are sent.
 */
export async function submitPracticeAnswer(input: PracticeSubmitInput): Promise<PracticeSubmitResponseDTO> {
  // Sanitize payload to guarantee no forbidden grading keys are transmitted
  const sanitizedPayload: Record<string, unknown> = {
    question_id: input.question_id,
    time_spent_seconds: input.time_spent_seconds || 0,
    context_type: input.context_type || 'practice',
  };

  if (input.selected_option_key !== undefined) {
    sanitizedPayload.selected_option_key = input.selected_option_key;
  }
  if (input.text_answer !== undefined) {
    sanitizedPayload.text_answer = input.text_answer;
  }

  return apiClient.post<PracticeSubmitResponseDTO>('/api/practice/submit', sanitizedPayload);
}
