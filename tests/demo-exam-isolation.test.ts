import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';
import mockExamsCatalogHandler from '../api/mock-exams/index';
import mockExamsStartHandler from '../api/mock-exams/start';
import mockExamsSessionHandler from '../api/mock-exams/session';
import mockExamsAutosaveHandler from '../api/mock-exams/autosave';
import mockExamsSubmitHandler from '../api/mock-exams/submit';
import mockExamsResultsHandler from '../api/mock-exams/results';
import mockExamsResetHandler from '../api/mock-exams/reset';
import assessmentSubmitHandler from '../api/assessment/submit';
import { DemoExamService } from '../api/_lib/demo/demo-exam.service';
import { LEAD_DEMO_EXAM, LEAD_DEMO_EXAM_ID, LEAD_DEMO_EXAM_CATALOG_ITEM } from '../data/demoExamData';

// Supabase mock for serverless endpoint tests
const mockDatabaseQuestions = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    skill: 'reading',
    cefr_level: 'B1',
    type: 'multiple_choice',
    prompt_th: 'เลือกข้อที่ถูก',
    prompt_en: 'Read and choose',
    correct_answer_text: null,
    weakness_tag: 'reading_inference',
    difficulty_weight: 1,
    is_active: true,
  },
];

const mockDatabaseOptions = [
  { id: 'opt-real-1', question_id: '11111111-1111-4111-a111-111111111111', key: 'A', text: 'Option A', is_correct: true, feedback_th: 'ถูก' },
  { id: 'opt-real-2', question_id: '11111111-1111-4111-a111-111111111111', key: 'B', text: 'Option B', is_correct: false, feedback_th: 'ผิด' },
];

const recordedDbInserts: Record<string, any[]> = {
  user_skill_progress: [],
  user_profiles: [],
  user_weaknesses: [],
  user_question_attempts: [],
  user_mock_exam_attempts: [],
};

vi.mock('../api/_lib/supabase/client', () => {
  return {
    createServerUserClient: vi.fn((token: string) => ({
      auth: {
        getUser: vi.fn(async () => {
          if (token.includes('demo-student-id')) {
            return {
              data: {
                user: {
                  id: 'demo-student-id',
                  email: 'student@glova.demo',
                  role: 'authenticated',
                },
              },
              error: null,
            };
          }
          if (token === 'mock-prod-token') {
            return {
              data: {
                user: {
                  id: '33333333-3333-4333-a333-333333333333',
                  email: 'real.learner@example.com',
                  role: 'authenticated',
                },
              },
              error: null,
            };
          }
          return { data: { user: null }, error: new Error('Invalid token') };
        }),
      },
    })),
    createPublicServerClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'mock_exams') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(async () => ({
                  data: [
                    {
                      id: '00000000-0000-4000-a000-000000000001',
                      exam_code: 'PET',
                      name: 'B1 Preliminary Production Exam',
                      target_cefr: 'B1',
                      description_th: 'ข้อสอบจริง',
                      total_duration_minutes: 120,
                      passing_score: 70,
                      version: 1,
                    },
                  ],
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(async () => ({ data: [], error: null })),
          })),
        };
      }),
    })),
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'questions') {
          let selectedId: string | null = null;
          const builder: any = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn((col: string, val: any) => {
            if (col === 'id') selectedId = val;
            return builder;
          });
          builder.single = vi.fn(async () => {
            const q = mockDatabaseQuestions.find((item) => item.id === selectedId);
            return { data: q || null, error: q ? null : new Error('Not found') };
          });
          return builder;
        }

        if (table === 'question_options') {
          let qId: string | null = null;
          const builder: any = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn((col: string, val: any) => {
            if (col === 'question_id') qId = val;
            return builder;
          });
          builder.then = (resolve: any) => {
            const opts = mockDatabaseOptions.filter((o) => o.question_id === qId);
            return Promise.resolve({ data: opts, error: null }).then(resolve);
          };
          return builder;
        }

        if (table in recordedDbInserts) {
          return {
            insert: vi.fn(async (payload: any) => {
              recordedDbInserts[table].push(payload);
              return { data: payload, error: null };
            }),
            update: vi.fn(async (payload: any) => {
              recordedDbInserts[table].push(payload);
              return {
                eq: vi.fn(async () => ({ data: payload, error: null })),
              };
            }),
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: null, error: null })),
              })),
            })),
          };
        }

        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({ data: null, error: null })),
            })),
          })),
        };
      }),
    })),
  };
});

// Helper simulating Vercel Serverless runtime request/response
function invokeHandler(
  handler: any,
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  } = {}
): Promise<{ status: number; body: any; headers: Record<string, string> }> {
  return new Promise((resolve) => {
    const req: any = new EventEmitter();
    req.method = options.method || 'GET';
    req.url = options.url || '/api/mock-exams';
    req.headers = { host: 'localhost:3000', ...options.headers };
    req.body = options.body !== undefined ? options.body : {};
    req.query = options.query || {};

    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    let responseBody: any = null;

    const res: any = {
      statusCode,
      setHeader(k: string, v: string) {
        resHeaders[k.toLowerCase()] = v;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: any) {
        responseBody = payload;
        this.writableEnded = true;
        resolve({ status: this.statusCode, body: responseBody, headers: resHeaders });
      },
      end(payload?: any) {
        if (payload && !responseBody) {
          try {
            responseBody = JSON.parse(payload);
          } catch {
            responseBody = payload;
          }
        }
        this.writableEnded = true;
        resolve({ status: this.statusCode, body: responseBody, headers: resHeaders });
      },
    };

    handler(req, res).catch((err: any) => {
      resolve({
        status: 500,
        body: { error: err.message, stack: err.stack },
        headers: resHeaders,
      });
    });
  });
}

describe('GLOVA — Safe Demo Exam Data Isolation QA Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DemoExamService.resetDemoSession('demo-student-id');
    Object.keys(recordedDbInserts).forEach((k) => (recordedDbInserts[k] = []));
  });

  // QA A & B: Data Source & Catalog Isolation
  describe('A & B. Catalog Isolation (Production vs. Demo)', () => {
    it('QA-A: Production user receives ONLY real production catalog (zero demo items)', async () => {
      const response = await invokeHandler(mockExamsCatalogHandler, {
        method: 'GET',
        url: '/api/mock-exams',
        headers: { authorization: 'Bearer mock-prod-token' },
      });

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.exams).toBeDefined();
      expect(data.is_demo).toBeUndefined();

      // Invariant: Lead demo exam MUST NOT be in the production pool
      const hasDemoExam = data.exams.some((ex: any) => ex.id === LEAD_DEMO_EXAM_ID || ex.source === 'demo');
      expect(hasDemoExam).toBe(false);
    });

    it('QA-B: Demo user receives ONLY the isolated Lead Demo Exam showcase', async () => {
      const response = await invokeHandler(mockExamsCatalogHandler, {
        method: 'GET',
        url: '/api/mock-exams',
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
      });

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.is_demo).toBe(true);
      expect(data.total).toBe(1);
      expect(data.exams).toHaveLength(1);
      expect(data.exams[0].id).toBe(LEAD_DEMO_EXAM_ID);
      expect(data.exams[0].name).toContain('B2 First (FCE)');
      expect(data.exams[0].source).toBe('demo');
      expect(data.exams[0].dataset).toBe('lead_demo');
    });
  });

  // QA C, D, L: Exam Lifecycle, Timer, and Zero Answer Leakage
  describe('C, D, L. Exam Start, Timing & Zero Answer Leakage', () => {
    it('QA-C & D: Demo user starts demo exam session with exact timing and structure', async () => {
      const response = await invokeHandler(mockExamsStartHandler, {
        method: 'POST',
        url: '/api/mock-exams/start',
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        body: { mock_exam_id: LEAD_DEMO_EXAM_ID },
      });

      expect(response.status).toBe(200);
      const startData = response.body.data;
      expect(startData.session_token).toBeDefined();
      expect(startData.duration_minutes).toBe(25);
      expect(startData.status).toBe('in_progress');
    });

    it('QA-L: GET /api/mock-exams/session sanitizes demo questions with ZERO answer key leakage', async () => {
      const session = DemoExamService.startDemoSession('demo-student-id');
      const response = await invokeHandler(mockExamsSessionHandler, {
        method: 'GET',
        url: `/api/mock-exams/session?token=${session.sessionToken}`,
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        query: { token: session.sessionToken },
      });

      expect(response.status).toBe(200);
      const sessionData = response.body.data;
      expect(sessionData.session_token).toBe(session.sessionToken);
      expect(sessionData.status).toBe('in_progress');
      expect(sessionData.remaining_seconds).toBeGreaterThan(0);
      expect(sessionData.sections).toHaveLength(2);

      // Verify strict zero answer leakage across all questions and options
      for (const sec of sessionData.sections) {
        for (const q of sec.questions) {
          expect(q).not.toHaveProperty('correct_answer_text');
          expect(q).not.toHaveProperty('correctAnswerText');
          expect(q).not.toHaveProperty('explanation_th');
          expect(q).not.toHaveProperty('explanation_en');

          for (const opt of q.options) {
            expect(opt).not.toHaveProperty('is_correct');
            expect(opt).not.toHaveProperty('isCorrect');
            expect(opt).not.toHaveProperty('feedback_th');
            expect(opt).not.toHaveProperty('feedbackTh');
            expect(opt.key).toBeDefined();
            expect(opt.text).toBeDefined();
          }
        }
      }
    });
  });

  // QA E, F, G, H: Autosave, Answer Submission, Scoring, and Review
  describe('E, F, G, H. Autosave, Submission, Scoring & Post-Exam Review', () => {
    it('QA-E: Demo user can autosave candidate answers without database mutation', async () => {
      const session = DemoExamService.startDemoSession('demo-student-id');
      const questionId = 'dddddddd-0000-4000-a000-000000000011'; // First demo question

      const response = await invokeHandler(mockExamsAutosaveHandler, {
        method: 'POST',
        url: '/api/mock-exams/autosave',
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        body: {
          session_token: session.sessionToken,
          question_id: questionId,
          selected_option_key: 'A',
          time_spent_seconds: 15,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.saved_at).toBeDefined();

      // Check in-memory store updated
      const activeSession = DemoExamService.getDemoSession(session.sessionToken);
      const savedAns = activeSession?.answers.get(questionId);
      expect(savedAns).toBeDefined();
      expect(savedAns?.selected_option_key).toBe('A');
    });

    it('QA-F & G: Demo user submits exam and receives server-graded results', async () => {
      const session = DemoExamService.startDemoSession('demo-student-id');

      // Submit all 5 demo questions (4 correct, 1 wrong to test realistic scoring)
      const answers = [
        { question_id: 'dddddddd-0000-4000-a000-000000000011', selected_option_key: 'A', time_spent_seconds: 20 }, // correct
        { question_id: 'dddddddd-0000-4000-a000-000000000012', selected_option_key: 'A', time_spent_seconds: 25 }, // correct
        { question_id: 'dddddddd-0000-4000-a000-000000000013', text_answer: 'on', time_spent_seconds: 30 }, // correct
        { question_id: 'dddddddd-0000-4000-a000-000000000014', selected_option_key: 'B', time_spent_seconds: 35 }, // correct
        { question_id: 'dddddddd-0000-4000-a000-000000000015', selected_option_key: 'A', time_spent_seconds: 20 }, // wrong (correct is B)
      ];

      const response = await invokeHandler(mockExamsSubmitHandler, {
        method: 'POST',
        url: '/api/mock-exams/submit',
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        body: {
          session_token: session.sessionToken,
          answers,
        },
      });

      expect(response.status).toBe(200);
      const submitData = response.body.data;
      expect(submitData.status).toBe('submitted');
      expect(submitData.percentage_score).toBe(80); // 4 out of 5 = 80%
      expect(submitData.estimated_cefr_level).toBe('C1');
      expect(submitData.objective_score).toBeGreaterThan(0);
      expect(submitData.is_demo).toBe(true);
      expect(submitData.dataset).toBe('lead_demo');
    });

    it('QA-H: Post-submission review endpoint reveals answers and explanations ONLY after submission', async () => {
      const session = DemoExamService.startDemoSession('demo-student-id');
      // Autosave and submit
      DemoExamService.autosaveDemoAnswer(session.sessionToken, 'dddddddd-0000-4000-a000-000000000011', {
        selected_option_key: 'A',
      });
      DemoExamService.submitDemoSession(session.sessionToken);

      const response = await invokeHandler(mockExamsResultsHandler, {
        method: 'GET',
        url: `/api/mock-exams/results?token=${session.sessionToken}`,
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        query: { token: session.sessionToken },
      });

      expect(response.status).toBe(200);
      const resultData = response.body.data;
      expect(resultData.status).toBe('submitted');
      expect(resultData.section_breakdown).toBeDefined();
      expect(resultData.skill_breakdown).toBeDefined();
      expect(resultData.is_demo).toBe(true);
      expect(resultData.raw_score).toBeGreaterThanOrEqual(1);

      // Verify review_questions and explanations are available ONLY post-submission
      expect(resultData.review_questions).toBeDefined();
      expect(resultData.review_questions).toHaveLength(5);

      const q1Review = resultData.review_questions.find((r: any) => r.question_id === 'dddddddd-0000-4000-a000-000000000011');
      expect(q1Review).toBeDefined();
      expect(q1Review.is_correct).toBe(true);
      expect(q1Review.correct_option_key).toBe('A');
      expect(q1Review.explanation_th).toContain('have an impact on');

      const q3Review = resultData.review_questions.find((r: any) => r.question_id === 'dddddddd-0000-4000-a000-000000000013');
      expect(q3Review).toBeDefined();
      expect(q3Review.correct_answer_text).toBe('on');
      expect(q3Review.explanation_th).toContain('on');
    });
  });

  // QA I, J, K: Analytics & Production Database Protection
  describe('I, J, K. Production Isolation & Zero Database Pollution', () => {
    it('QA-I & J: Demo assessment submission DOES NOT pollute user_skill_progress, user_profiles, or weaknesses', async () => {
      const response = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        url: '/api/assessment/submit',
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        body: {
          answers: [
            {
              question_id: '11111111-1111-4111-a111-111111111111',
              selected_option_key: 'A',
              time_spent_seconds: 15,
            },
          ],
        },
      });

      expect(response.status).toBe(200);
      const assessmentResult = response.body.data;
      expect(assessmentResult.total_questions).toBe(1);
      expect(assessmentResult.percentage_score).toBe(100);

      // Verify ZERO database inserts or updates on learner tables
      expect(recordedDbInserts.user_skill_progress).toHaveLength(0);
      expect(recordedDbInserts.user_profiles).toHaveLength(0);
      expect(recordedDbInserts.user_weaknesses).toHaveLength(0);
      expect(recordedDbInserts.user_question_attempts).toHaveLength(0);
      expect(recordedDbInserts.user_mock_exam_attempts).toHaveLength(0);
    });

    it('QA-K: Real production question records and catalog items remain immutable', () => {
      // Invariant: LEAD_DEMO_EXAM has dedicated ID and demo provenance
      expect(LEAD_DEMO_EXAM.id).toBe(LEAD_DEMO_EXAM_ID);
      expect(LEAD_DEMO_EXAM.source).toBe('demo');
      expect(LEAD_DEMO_EXAM.dataset).toBe('lead_demo');
      expect(LEAD_DEMO_EXAM.is_demo).toBe(true);

      // Verify that all demo questions are marked explicitly as demo
      for (const section of LEAD_DEMO_EXAM.sections) {
        for (const q of section.questions) {
          expect(q.source).toBe('demo');
          expect(q.dataset).toBe('lead_demo');
          expect(q.is_demo).toBe(true);
        }
      }
    });
  });

  // QA Easy Reset
  describe('Easy Reset Endpoint', () => {
    it('Allows the Lead to immediately reset active demo attempt state', async () => {
      // 1. Start a session
      const session = DemoExamService.startDemoSession('demo-student-id');
      expect(DemoExamService.getDemoSession(session.sessionToken)).not.toBeNull();

      // 2. Call reset endpoint
      const response = await invokeHandler(mockExamsResetHandler, {
        method: 'POST',
        url: '/api/mock-exams/reset',
        headers: {
          authorization: 'Bearer token-demo-student-id-active',
          'x-demo-mode': 'true',
        },
        body: {},
      });

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.is_demo).toBe(true);

      // 3. Verify session was purged from active store
      expect(DemoExamService.getDemoSession(session.sessionToken)).toBeNull();
    });
  });
});
