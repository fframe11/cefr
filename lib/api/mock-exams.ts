import { apiClient } from './client';
import {
  MockExamCatalogResponse,
  MockExamStartInput,
  MockExamStartResponseDTO,
  MockExamSessionResponseDTO,
  MockExamAutosaveInput,
  MockExamAutosaveResponse,
  MockExamSubmitInput,
  MockExamSubmitResponseDTO,
  MockExamResultResponseDTO,
} from './types';

/**
 * GET /api/mock-exams
 * Public endpoint to list all published Cambridge-style mock examinations.
 */
export async function getMockExams(): Promise<MockExamCatalogResponse> {
  return apiClient.get<MockExamCatalogResponse>('/api/mock-exams');
}

/**
 * POST /api/mock-exams/start
 * Initializes a new timed mock exam attempt session.
 * Requires authentication.
 */
export async function startMockExam(mockExamId: string): Promise<MockExamStartResponseDTO> {
  const body: MockExamStartInput = {
    mock_exam_id: mockExamId,
  };
  return apiClient.post<MockExamStartResponseDTO>('/api/mock-exams/start', body);
}

/**
 * GET /api/mock-exams/session?token=:token
 * Retrieves active or finalized mock exam session with safe question payloads (no answer keys).
 * Requires authentication.
 */
export async function getMockExamSession(token: string): Promise<MockExamSessionResponseDTO> {
  return apiClient.get<MockExamSessionResponseDTO>(
    `/api/mock-exams/session?token=${encodeURIComponent(token)}`
  );
}

/**
 * POST /api/mock-exams/autosave
 * Safely persists intermediate candidate answers during an active timed mock exam.
 * Allowed up to 60s grace period.
 * Requires authentication.
 */
export async function autosaveMockExamAnswer(input: MockExamAutosaveInput): Promise<MockExamAutosaveResponse> {
  const body = {
    session_token: input.session_token,
    question_id: input.question_id,
    selected_option_key: input.selected_option_key ?? null,
    text_answer: input.text_answer ?? null,
    time_spent_seconds: input.time_spent_seconds ?? 0,
  };
  return apiClient.post<MockExamAutosaveResponse>('/api/mock-exams/autosave', body);
}

/**
 * POST /api/mock-exams/submit
 * Submits and objectively grades a timed mock examination.
 * Accepts submissions up to 60s grace period as 'submitted'; past grace marked as 'timed_out'.
 * Requires authentication.
 */
export async function submitMockExam(input: MockExamSubmitInput): Promise<MockExamSubmitResponseDTO> {
  const sanitizedAnswers = (input.answers || []).map((ans) => ({
    question_id: ans.question_id,
    selected_option_key: ans.selected_option_key ?? null,
    text_answer: ans.text_answer ?? null,
    time_spent_seconds: ans.time_spent_seconds ?? 0,
  }));

  const body = {
    session_token: input.session_token,
    answers: sanitizedAnswers,
  };

  return apiClient.post<MockExamSubmitResponseDTO>('/api/mock-exams/submit', body);
}

/**
 * GET /api/mock-exams/results?token=:token
 * Retrieves final scores and diagnostic breakdown for a submitted mock exam.
 * Marked with is_official: false and platform disclaimer.
 * Requires authentication.
 */
export async function getMockExamResults(token: string): Promise<MockExamResultResponseDTO> {
  return apiClient.get<MockExamResultResponseDTO>(
    `/api/mock-exams/results?token=${encodeURIComponent(token)}`
  );
}

/**
 * POST /api/mock-exams/reset
 * Resets the demo exam session for the demo student without touching real data.
 */
export async function resetDemoExam(): Promise<{ success: boolean; message: string; is_demo: boolean }> {
  return apiClient.post<{ success: boolean; message: string; is_demo: boolean }>('/api/mock-exams/reset', {});
}
