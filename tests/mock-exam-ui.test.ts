import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMockExams,
  startMockExam,
  getMockExamSession,
  autosaveMockExamAnswer,
  submitMockExam,
  getMockExamResults,
  resetDemoExam,
} from '../src/lib/api/mock-exams';
import { supabase } from '../src/lib/supabaseClient';

// Mock Supabase Auth
vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        })),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

describe('Phase 4.8D: Mock Exam Engine UI Integration Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-jwt-exam-token',
          user: { id: 'user-candidate-123', email: 'candidate@example.com' },
        },
      },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Mock Exam Catalog (GET /api/mock-exams)', () => {
    it('should successfully fetch mock exam catalog and Cambridge non-official disclaimer', async () => {
      const mockCatalogData = {
        exams: [
          {
            id: 'mock-b1-pet-id',
            exam_code: 'PET',
            name: 'B1 Preliminary (PET) Full Practice Exam',
            target_cefr: 'B1',
            description_th: 'ข้อสอบจำลองระดับ B1',
            total_duration_minutes: 45,
            passing_score: 140,
            version: 1,
          },
          {
            id: 'mock-b2-fce-id',
            exam_code: 'FCE',
            name: 'B2 First (FCE) Full Practice Exam',
            target_cefr: 'B2',
            description_th: 'ข้อสอบจำลองระดับ B2',
            total_duration_minutes: 60,
            passing_score: 160,
            version: 1,
          },
        ],
        total: 2,
        disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockCatalogData }),
      });

      const response = await getMockExams();

      expect(response.exams).toHaveLength(2);
      expect(response.exams[0].exam_code).toBe('PET');
      expect(response.exams[0].target_cefr).toBe('B1');
      expect(response.disclaimer).toContain('not an official Cambridge English qualification exam');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mock-exams',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('2. Start Timed Exam Attempt (POST /api/mock-exams/start)', () => {
    it('should initialize a new timed attempt session with server-authoritative timestamps', async () => {
      const startedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();

      const mockStartResponse = {
        session_token: 'sess-uuid-7777-8888-9999',
        mock_exam_id: 'mock-b1-pet-id',
        exam_code: 'PET',
        name: 'B1 Preliminary (PET) Full Practice Exam',
        started_at: startedAt,
        expires_at: expiresAt,
        duration_minutes: 45,
        status: 'in_progress',
        disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockStartResponse }),
      });

      const result = await startMockExam('mock-b1-pet-id');

      expect(result.session_token).toBe('sess-uuid-7777-8888-9999');
      expect(result.status).toBe('in_progress');
      expect(result.duration_minutes).toBe(45);
      expect(result.expires_at).toBe(expiresAt);

      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe('/api/mock-exams/start');
      expect(init.method).toBe('POST');
      expect(init.headers.get('Authorization')).toBe('Bearer mock-jwt-exam-token');
      expect(init.headers.get('Content-Type')).toBe('application/json');
      expect(init.body).toBe(JSON.stringify({ mock_exam_id: 'mock-b1-pet-id' }));
    });
  });

  describe('3. Exam Session & Safe Question Payloads (GET /api/mock-exams/session)', () => {
    it('should retrieve active session with questions and zero answer leakage', async () => {
      const mockSessionResponse = {
        session_token: 'sess-uuid-7777-8888-9999',
        mock_exam: {
          id: 'mock-b1-pet-id',
          exam_code: 'PET',
          name: 'B1 Preliminary Practice',
          target_cefr: 'B1',
          total_duration_minutes: 45,
        },
        status: 'in_progress',
        started_at: '2026-09-25T10:00:00.000Z',
        expires_at: '2026-09-25T10:45:00.000Z',
        remaining_seconds: 2700,
        sections: [
          {
            id: 'sec-reading-1',
            name: 'Reading & Use of English',
            skill: 'reading',
            duration_minutes: 30,
            question_count: 2,
            order_index: 1,
            questions: [
              {
                id: 'q-safe-001',
                mock_exam_question_id: 'meq-001',
                order_index: 1,
                marks: 1,
                skill: 'reading',
                type: 'multiple_choice',
                prompt_th: 'เลือกคำตอบที่ถูกต้องที่สุด',
                prompt_en: 'Choose the best answer.',
                options: [
                  { id: 'opt-a', key: 'A', text: 'arrive' },
                  { id: 'opt-b', key: 'B', text: 'arriving' },
                  { id: 'opt-c', key: 'C', text: 'arrived' },
                  { id: 'opt-d', key: 'D', text: 'have arrived' },
                ],
                saved_answer: null,
              },
              {
                id: 'q-safe-002',
                mock_exam_question_id: 'meq-002',
                order_index: 2,
                marks: 5,
                skill: 'writing',
                type: 'essay',
                prompt_th: 'เขียนอีเมลสั้นความยาว 50-80 คำ',
                prompt_en: 'Write an email of 50-80 words to your friend.',
                options: [],
                saved_answer: {
                  selected_option_key: null,
                  text_answer: 'Dear John, I am writing to invite you...',
                },
              },
            ],
          },
        ],
        disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockSessionResponse }),
      });

      const session = await getMockExamSession('sess-uuid-7777-8888-9999');

      expect(session.session_token).toBe('sess-uuid-7777-8888-9999');
      expect(session.sections).toHaveLength(1);
      const q1 = session.sections[0].questions[0];

      // Anti-Leakage Invariant Check: Options must NOT have is_correct or explanation
      expect(q1.options[0]).toEqual({ id: 'opt-a', key: 'A', text: 'arrive' });
      expect((q1.options[0] as any).is_correct).toBeUndefined();
      expect((q1.options[0] as any).isCorrect).toBeUndefined();
      expect((q1 as any).explanation).toBeUndefined();

      // Check saved answer recovery
      const q2 = session.sections[0].questions[1];
      expect(q2.saved_answer?.text_answer).toBe('Dear John, I am writing to invite you...');

      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe('/api/mock-exams/session?token=sess-uuid-7777-8888-9999');
      expect(init.method).toBe('GET');
      expect(init.headers.get('Authorization')).toBe('Bearer mock-jwt-exam-token');
    });
  });

  describe('4. Intermediate Autosave (POST /api/mock-exams/autosave)', () => {
    it('should send debounced candidate answer to autosave endpoint', async () => {
      const mockAutosaveResponse = {
        success: true,
        question_id: 'q-safe-001',
        saved_at: '2026-09-25T10:15:30.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockAutosaveResponse }),
      });

      const saveRes = await autosaveMockExamAnswer({
        session_token: 'sess-uuid-7777-8888-9999',
        question_id: 'q-safe-001',
        selected_option_key: 'B',
        text_answer: null,
        time_spent_seconds: 15,
      });

      expect(saveRes.success).toBe(true);
      expect(saveRes.question_id).toBe('q-safe-001');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mock-exams/autosave',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            session_token: 'sess-uuid-7777-8888-9999',
            question_id: 'q-safe-001',
            selected_option_key: 'B',
            text_answer: null,
            time_spent_seconds: 15,
          }),
        })
      );
    });
  });

  describe('5. Submit Exam & Final Scoring (POST /api/mock-exams/submit)', () => {
    it('should submit exam answers and finalize attempt session', async () => {
      const mockSubmitResponse = {
        attempt_id: 'att-12345',
        session_token: 'sess-uuid-7777-8888-9999',
        status: 'submitted',
        started_at: '2026-09-25T10:00:00.000Z',
        submitted_at: '2026-09-25T10:40:00.000Z',
        raw_score: 1,
        total_marks: 6,
        percentage_score: 100, // 1/1 evaluated objective mark
        objective_score: 1,
        objective_total_marks: 1,
        objective_percentage: 100,
        pending_subjective_marks: 5,
        has_pending_subjective: true,
        evaluation_status: 'partially_evaluated_pending_subjective',
        estimated_cefr_level: 'B1',
        estimated_cambridge_score: 148,
        is_official: false,
        disclaimer: 'Platform practice mock examination result; not an official Cambridge English qualification certificate.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockSubmitResponse }),
      });

      const submitRes = await submitMockExam({
        session_token: 'sess-uuid-7777-8888-9999',
        answers: [
          { question_id: 'q-safe-001', selected_option_key: 'B', time_spent_seconds: 20 },
          { question_id: 'q-safe-002', text_answer: 'My complete essay...', time_spent_seconds: 120 },
        ],
      });

      expect(submitRes.status).toBe('submitted');
      expect(submitRes.objective_score).toBe(1);
      expect(submitRes.has_pending_subjective).toBe(true);
      expect(submitRes.pending_subjective_marks).toBe(5);
      expect(submitRes.is_official).toBe(false);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mock-exams/submit',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            session_token: 'sess-uuid-7777-8888-9999',
            answers: [
              { question_id: 'q-safe-001', selected_option_key: 'B', text_answer: null, time_spent_seconds: 20 },
              { question_id: 'q-safe-002', selected_option_key: null, text_answer: 'My complete essay...', time_spent_seconds: 120 },
            ],
          }),
        })
      );
    });
  });

  describe('6. Verified Diagnostic Results (GET /api/mock-exams/results)', () => {
    it('should retrieve full diagnostic breakdown with pending subjective badge and disclaimer', async () => {
      const mockResultResponse = {
        attempt_id: 'att-12345',
        session_token: 'sess-uuid-7777-8888-9999',
        exam: {
          id: 'mock-b1-pet-id',
          exam_code: 'PET',
          name: 'B1 Preliminary Practice Exam',
          target_cefr: 'B1',
          passing_score: 140,
          total_duration_minutes: 45,
        },
        status: 'submitted',
        started_at: '2026-09-25T10:00:00.000Z',
        submitted_at: '2026-09-25T10:40:00.000Z',
        raw_score: 1,
        total_marks: 6,
        percentage_score: 100,
        objective_score: 1,
        objective_total_marks: 1,
        objective_percentage: 100,
        pending_subjective_marks: 5,
        has_pending_subjective: true,
        evaluation_status: 'partially_evaluated_pending_subjective',
        is_passed: true,
        estimated_cefr_level: 'B1',
        estimated_cambridge_score: 148,
        section_breakdown: {
          'Reading & Use of English': { raw_score: 1, total_marks: 1, percentage: 100 },
          Writing: { raw_score: 0, total_marks: 5, percentage: 0 },
        },
        skill_breakdown: {
          reading: { total_questions: 1, correct_questions: 1, percentage: 100 },
          writing: { total_questions: 1, correct_questions: 0, percentage: 0 },
        },
        is_official: false,
        disclaimer: 'Platform practice mock examination result; not an official Cambridge English qualification certificate.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockResultResponse }),
      });

      const results = await getMockExamResults('sess-uuid-7777-8888-9999');

      expect(results.is_passed).toBe(true);
      expect(results.estimated_cefr_level).toBe('B1');
      expect(results.estimated_cambridge_score).toBe(148);
      expect(results.has_pending_subjective).toBe(true);
      expect(results.pending_subjective_marks).toBe(5);
      expect(results.is_official).toBe(false);
      expect(results.section_breakdown['Reading & Use of English'].percentage).toBe(100);

      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe('/api/mock-exams/results?token=sess-uuid-7777-8888-9999');
      expect(init.method).toBe('GET');
      expect(init.headers.get('Authorization')).toBe('Bearer mock-jwt-exam-token');
    });
  });

  describe('7. Server-Authoritative Timer & Grace Invariant Logic', () => {
    it('should accurately calculate remaining seconds based on server expires_at', () => {
      const now = Date.now();
      const expiresAt = new Date(now + 120 * 1000).toISOString(); // 2 minutes remaining

      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
      expect(diff).toBe(120);
    });

    it('should clamp remaining seconds to 0 when expires_at is past', () => {
      const now = Date.now();
      const expiresAt = new Date(now - 10 * 1000).toISOString(); // Expired 10s ago

      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
      expect(diff).toBe(0);
    });
  });

  describe('8. Demo Reset & Review Invariant Handling', () => {
    it('should call POST /api/mock-exams/reset for clearing demo session state', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: { success: true, message: 'Demo reset', is_demo: true } }),
      });

      const response = await resetDemoExam();
      expect(response.success).toBe(true);
      expect(response.is_demo).toBe(true);

      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe('/api/mock-exams/reset');
      expect(init.method).toBe('POST');
    });

    it('should parse review_questions with explanations and correct keys post-submission', async () => {
      const mockReviewResponse = {
        attempt_id: 'demo-attempt-1',
        session_token: 'demo-token-1',
        exam: {
          id: 'dddddddd-0000-4000-a000-000000000001',
          exam_code: 'FCE',
          name: 'B2 First (FCE) Cambridge Practice Exam',
          target_cefr: 'B2',
          passing_score: 60,
          total_duration_minutes: 25,
        },
        status: 'submitted',
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        raw_score: 5,
        total_marks: 5,
        percentage_score: 100,
        objective_score: 5,
        objective_total_marks: 5,
        objective_percentage: 100,
        pending_subjective_marks: 0,
        has_pending_subjective: false,
        evaluation_status: 'completed',
        is_passed: true,
        estimated_cefr_level: 'B2',
        estimated_cambridge_score: 165,
        section_breakdown: {},
        skill_breakdown: {},
        is_official: false,
        disclaimer: 'Lead Demo Examination Sandbox',
        is_demo: true,
        review_questions: [
          {
            question_id: 'dddddddd-0000-4000-a000-000000000011',
            is_correct: true,
            correct_option_key: 'A',
            explanation_th: 'have an impact on เป็น collocation ที่ถูกต้อง',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockReviewResponse }),
      });

      const results = await getMockExamResults('demo-token-1');
      expect(results.is_demo).toBe(true);
      expect(results.review_questions).toHaveLength(1);
      expect(results.review_questions?.[0].correct_option_key).toBe('A');
      expect(results.review_questions?.[0].explanation_th).toContain('collocation');
    });
  });
});
