import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

const mockUserAId = '11111111-aaaa-4111-a111-111111111111';
const mockUserBId = '22222222-bbbb-4222-b222-222222222222';

const mockUserA = {
  id: mockUserAId,
  email: 'student_a@example.com',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
};

const mockUserB = {
  id: mockUserBId,
  email: 'student_b@example.com',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
};

const mockExamId = 'eeeeeeee-1111-4eee-aeee-eeeeeeeeeeee';
const mockUnpublishedExamId = 'eeeeeeee-2222-4eee-aeee-eeeeeeeeeeee';

const mockExam = {
  id: mockExamId,
  exam_code: 'B2_FIRST',
  name: 'B2 First (FCE) Mock Examination 1',
  target_cefr: 'B2',
  description_th: 'ข้อสอบจำลองเสมือนจริงระดับ B2 First',
  total_duration_minutes: 90,
  passing_score: 60,
  version: 1,
  is_published: true,
  created_at: '2026-09-01T00:00:00Z',
};

const mockSection1Id = '33333333-1111-4333-a333-333333333333';
const mockSection2Id = '33333333-2222-4333-a333-333333333333';

const mockSections = [
  {
    id: mockSection1Id,
    mock_exam_id: mockExamId,
    name: 'Reading & Use of English',
    skill: 'reading',
    duration_minutes: 60,
    question_count: 2,
    order_index: 1,
  },
  {
    id: mockSection2Id,
    mock_exam_id: mockExamId,
    name: 'Writing',
    skill: 'writing',
    duration_minutes: 30,
    question_count: 1,
    order_index: 2,
  },
];

const mockQ1Id = '55555555-1111-4555-a555-111111111111';
const mockQ2Id = '55555555-2222-4555-a555-222222222222';
const mockQ3WritingId = '55555555-3333-4555-a555-333333333333';
const mockForeignQId = '55555555-9999-4555-a555-999999999999';

const mockMeqs = [
  { id: 'meq-1', section_id: mockSection1Id, question_id: mockQ1Id, order_index: 1, marks: 2 },
  { id: 'meq-2', section_id: mockSection1Id, question_id: mockQ2Id, order_index: 2, marks: 2 },
  { id: 'meq-3', section_id: mockSection2Id, question_id: mockQ3WritingId, order_index: 1, marks: 5 },
];

const mockQuestions = [
  {
    id: mockQ1Id,
    skill: 'reading',
    cefr_level: 'B2',
    type: 'multiple_choice',
    prompt_th: 'เลือกคำตอบที่ถูกต้อง',
    prompt_en: 'According to paragraph 2, the author suggests that...',
    correct_answer_text: null,
    explanation_th: 'คำตอบที่ถูกต้องคือ B เพราะ...',
    explanation_en: 'Correct option is B because...',
    weakness_tag: 'reading_inference',
    difficulty_weight: 2,
  },
  {
    id: mockQ2Id,
    skill: 'reading',
    cefr_level: 'B2',
    type: 'fill_blank',
    prompt_th: 'เติมคำในช่องว่าง',
    prompt_en: 'He succeeded by _____ of hard work.',
    correct_answer_text: 'means',
    explanation_th: 'สำนวน by means of แปลว่า โดยอาศัย',
    explanation_en: 'Idiom: by means of',
    weakness_tag: 'collocations',
    difficulty_weight: 2,
  },
  {
    id: mockQ3WritingId,
    skill: 'writing',
    cefr_level: 'B2',
    type: 'sentence_transformation',
    prompt_th: 'เขียนเรียงความตามหัวข้อที่กำหนด',
    prompt_en: 'Write an essay discussing both views and give your opinion.',
    correct_answer_text: null,
    explanation_th: 'เกณฑ์การให้คะแนนการเขียน...',
    explanation_en: 'Writing rubric criteria...',
    weakness_tag: 'essay_structure',
    difficulty_weight: 5,
  },
];

const mockOptionsQ1 = [
  { id: 'opt-q1-a', question_id: mockQ1Id, key: 'A', text: 'It was accidental', is_correct: false, feedback_th: 'ข้อ A ผิด' },
  { id: 'opt-q1-b', question_id: mockQ1Id, key: 'B', text: 'It was carefully planned', is_correct: true, feedback_th: 'ข้อ B ถูกต้อง' },
];

// In-memory test state
let inMemoryAttempts: any[] = [];
let inMemoryQuestionAttempts: any[] = [];
let inMemorySkills: any[] = [];
let inMemoryWeaknesses: any[] = [];

// PostgREST fluent mock helper
function createMockQueryBuilder(dataGetter: () => any) {
  const b: any = {};
  b.select = vi.fn(() => b);
  b.insert = vi.fn((record: any) => {
    const list = Array.isArray(record) ? record : [record];
    const data = dataGetter();
    if (Array.isArray(data)) {
      list.forEach((r) => data.push(r));
    }
    return {
      select: vi.fn(() => ({
        single: vi.fn(async () => ({ data: list[0], error: null })),
      })),
      then: (res: any) => Promise.resolve({ data: list, error: null }).then(res),
    };
  });
  b.update = vi.fn((payload: any) => ({
    eq: vi.fn((col1: string, val1: any) => ({
      eq: vi.fn((col2: string, val2: any) => {
        const data = dataGetter();
        let updated: any = null;
        if (Array.isArray(data)) {
          const item = data.find((d: any) => d[col1] === val1 && d[col2] === val2);
          if (item) {
            Object.assign(item, payload);
            updated = item;
          }
        }
        return {
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: updated, error: null })),
            maybeSingle: vi.fn(async () => ({ data: updated, error: null })),
          })),
          then: (res: any) => Promise.resolve({ data: updated ? [updated] : [], error: null }).then(res),
        };
      }),
      select: vi.fn(() => ({
        single: vi.fn(async () => {
          const data = dataGetter();
          const item = Array.isArray(data) ? data.find((d: any) => d[col1] === val1) : data;
          if (item) Object.assign(item, payload);
          return { data: item || null, error: null };
        }),
        maybeSingle: vi.fn(async () => {
          const data = dataGetter();
          const item = Array.isArray(data) ? data.find((d: any) => d[col1] === val1) : data;
          if (item) Object.assign(item, payload);
          return { data: item || null, error: null };
        }),
      })),
      then: (res: any) => {
        const data = dataGetter();
        const item = Array.isArray(data) ? data.find((d: any) => d[col1] === val1) : data;
        if (item) Object.assign(item, payload);
        return Promise.resolve({ data: item ? [item] : [], error: null }).then(res);
      },
    })),
  }));
  b.eq = vi.fn((col: string, val: any) => {
    b._filterCol = col;
    b._filterVal = val;
    return b;
  });
  b.in = vi.fn(() => b);
  b.order = vi.fn(() => b);
  b.single = vi.fn(async () => {
    const data = dataGetter();
    if (!data) return { data: null, error: new Error('Record not found') };
    if (Array.isArray(data)) {
      if (b._filterCol) {
        const item = data.find((d: any) => d[b._filterCol] === b._filterVal);
        return { data: item || null, error: item ? null : new Error('Record not found') };
      }
      return { data: data[0] || null, error: null };
    }
    return { data, error: null };
  });
  b.maybeSingle = vi.fn(async () => {
    const data = dataGetter();
    if (!data) return { data: null, error: null };
    if (Array.isArray(data)) {
      if (b._filterCol) {
        const item = data.find((d: any) => d[b._filterCol] === b._filterVal);
        return { data: item || null, error: null };
      }
      return { data: data[0] || null, error: null };
    }
    return { data, error: null };
  });
  b.then = (resolve: any, reject?: any) => {
    const data = dataGetter();
    let res = Array.isArray(data) ? data : [data];
    if (b._filterCol) {
      res = res.filter((d: any) => d[b._filterCol] === b._filterVal);
    }
    return Promise.resolve({ data: res, error: null }).then(resolve, reject);
  };
  return b;
}

// Mock Supabase Client
vi.mock('../api/_lib/supabase/client', () => {
  return {
    createServerUserClient: vi.fn((token: string) => ({
      auth: {
        getUser: vi.fn(async () => {
          if (token === 'user-a-token') return { data: { user: mockUserA }, error: null };
          if (token === 'user-b-token') return { data: { user: mockUserB }, error: null };
          return { data: { user: null }, error: new Error('Invalid token') };
        }),
      },
    })),
    createPublicServerClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'mock_exams') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col: string, val: any) => {
                if (col === 'is_published' && val === true) {
                  return {
                    order: vi.fn(() => Promise.resolve({ data: [mockExam], error: null })),
                  };
                }
                return Promise.resolve({ data: [], error: null });
              }),
            })),
          };
        }
        return createMockQueryBuilder(() => []);
      }),
    })),
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'mock_exams') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col: string, val: any) => ({
                eq: vi.fn((col2: string, val2: any) => ({
                  single: vi.fn(async () => {
                    if (val === mockExamId && val2 === true) return { data: mockExam, error: null };
                    return { data: null, error: new Error('Not found') };
                  }),
                })),
                single: vi.fn(async () => {
                  if (val === mockExamId) return { data: mockExam, error: null };
                  return { data: null, error: new Error('Not found') };
                }),
              })),
            })),
          };
        }

        if (table === 'mock_exam_sections') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col: string, val: any) => ({
                order: vi.fn(() => Promise.resolve({ data: val === mockExamId ? mockSections : [], error: null })),
                then: (resolve: any) => Promise.resolve({ data: val === mockExamId ? mockSections : [], error: null }).then(resolve),
              })),
            })),
          };
        }

        if (table === 'mock_exam_questions') {
          return {
            select: vi.fn(() => ({
              in: vi.fn((_col: string, ids: string[]) => ({
                order: vi.fn(() => Promise.resolve({ data: mockMeqs.filter((m) => ids.includes(m.section_id)), error: null })),
                then: (resolve: any) => Promise.resolve({ data: mockMeqs.filter((m) => ids.includes(m.section_id)), error: null }).then(resolve),
              })),
              eq: vi.fn((col: string, val: any) => ({
                in: vi.fn((_col2: string, ids: string[]) => ({
                  maybeSingle: vi.fn(async () => {
                    const match = mockMeqs.find((m) => m.question_id === val && ids.includes(m.section_id));
                    return { data: match || null, error: null };
                  }),
                })),
              })),
            })),
          };
        }

        if (table === 'questions') {
          return {
            select: vi.fn(() => ({
              in: vi.fn((_col: string, ids: string[]) => Promise.resolve({
                data: mockQuestions.filter((q) => ids.includes(q.id)),
                error: null,
              })),
            })),
          };
        }

        if (table === 'question_options') {
          return {
            select: vi.fn(() => ({
              in: vi.fn((_col: string, ids: string[]) => Promise.resolve({
                data: mockOptionsQ1.filter((o) => ids.includes(o.question_id)),
                error: null,
              })),
            })),
          };
        }

        if (table === 'user_mock_exam_attempts') {
          return createMockQueryBuilder(() => inMemoryAttempts);
        }

        if (table === 'user_question_attempts') {
          return createMockQueryBuilder(() => inMemoryQuestionAttempts);
        }

        if (table === 'user_skill_progress') {
          return createMockQueryBuilder(() => inMemorySkills);
        }

        if (table === 'user_weaknesses') {
          return createMockQueryBuilder(() => inMemoryWeaknesses);
        }

        return createMockQueryBuilder(() => []);
      }),
    })),
  };
});

// Mock HTTP req/res helper
function createMockReqRes(options: {
  method?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const req: any = {
    method: options.method || 'GET',
    query: options.query || {},
    headers: options.headers || {},
    body: options.body || {},
    url: '/api/test',
  };

  const res: any = new EventEmitter();
  res.statusCode = 200;
  res.headers = {};
  res.body = null;

  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });

  res.setHeader = vi.fn((key: string, val: string) => {
    res.headers[key.toLowerCase()] = val;
    return res;
  });

  res.json = vi.fn((data: any) => {
    res.body = data;
    res.emit('finish');
    return res;
  });

  res.end = vi.fn(() => {
    res.emit('finish');
    return res;
  });

  return { req, res };
}

async function invokeHandler(handler: any, options: {
  method?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const { req, res } = createMockReqRes(options);
  const done = new Promise<void>((resolve) => {
    res.on('finish', resolve);
  });
  await handler(req, res);
  await done;
  return res;
}

// Handlers under test
import mockExamsIndexHandler from '../api/mock-exams/index';
import mockExamStartHandler from '../api/mock-exams/start';
import mockExamSessionHandler from '../api/mock-exams/session';
import mockExamAutosaveHandler from '../api/mock-exams/autosave';
import mockExamSubmitHandler from '../api/mock-exams/submit';
import mockExamResultsHandler from '../api/mock-exams/results';
import { RateLimiter } from '../api/_lib/rate-limit/rate-limiter';

describe('Phase 4.6: Mock Exam Engine & Timed Testing API Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RateLimiter.reset();
    inMemoryAttempts = [];
    inMemoryQuestionAttempts = [];
    inMemorySkills = [];
    inMemoryWeaknesses = [];
  });

  describe('1. Exam Catalog (GET /api/mock-exams)', () => {
    it('should list published mock exams without requiring authentication', async () => {
      const res = await invokeHandler(mockExamsIndexHandler, {
        method: 'GET',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.exams.length).toBe(1);
      expect(res.body.data.exams[0].exam_code).toBe('B2_FIRST');
      expect(res.body.data.disclaimer).toContain('Platform practice mock examination');
    });
  });

  describe('2. Start Exam (POST /api/mock-exams/start)', () => {
    it('should return 401 for anonymous exam start', async () => {
      const res = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        body: { mock_exam_id: mockExamId },
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when starting nonexistent exam', async () => {
      const res = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: { mock_exam_id: '00000000-0000-4000-a000-000000000000' },
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should start exam attempt with server-authoritative timer and secure session token', async () => {
      const res = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          mock_exam_id: mockExamId,
          // Malicious client claims must be stripped and ignored
          status: 'submitted',
          started_at: '2020-01-01T00:00:00Z',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.status).toBe('in_progress');
      expect(data.duration_minutes).toBe(90);
      expect(data.session_token).toBeDefined();
      expect(data.started_at).not.toBe('2020-01-01T00:00:00Z');
      expect(data.disclaimer).toContain('Platform practice mock examination');

      // Verify persisted in ledger
      expect(inMemoryAttempts.length).toBe(1);
      expect(inMemoryAttempts[0].user_id).toBe(mockUserAId);
      expect(inMemoryAttempts[0].status).toBe('in_progress');
    });
  });

  describe('3. Exam Session & Question Delivery (GET /api/mock-exams/session)', () => {
    let sessionToken: string;

    beforeEach(async () => {
      const res = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: { mock_exam_id: mockExamId },
      });
      sessionToken = res.body.data.session_token;
    });

    it('should return 401 for anonymous session request', async () => {
      const res = await invokeHandler(mockExamSessionHandler, {
        method: 'GET',
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 when User B tries to access User A session', async () => {
      const res = await invokeHandler(mockExamSessionHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-b-token' },
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should deliver sections and questions in strict order with ZERO answer leakage', async () => {
      const res = await invokeHandler(mockExamSessionHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-a-token' },
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(200);
      const data = res.body.data;
      expect(data.status).toBe('in_progress');
      expect(data.remaining_seconds).toBeGreaterThan(0);
      expect(data.sections.length).toBe(2);

      // Section 1: Reading & Use of English
      const s1 = data.sections[0];
      expect(s1.name).toBe('Reading & Use of English');
      expect(s1.questions.length).toBe(2);

      // ZERO ANSWER LEAKAGE AUDIT:
      const q1 = s1.questions[0];
      expect(q1.options.length).toBe(2);
      expect(q1.options[0].key).toBeDefined();
      expect(q1.options[0].text).toBeDefined();
      // Must NOT leak is_correct or feedback
      expect((q1.options[0] as any).is_correct).toBeUndefined();
      expect((q1.options[0] as any).feedback_th).toBeUndefined();
      // Must NOT leak correct_answer_text or explanations
      expect((q1 as any).correct_answer_text).toBeUndefined();
      expect((q1 as any).explanation_th).toBeUndefined();
      expect((q1 as any).explanation_en).toBeUndefined();
    });

    it('should automatically transition to timed_out when server timer expires', async () => {
      // Artificially age the session started_at by 100 minutes (exam is 90 mins)
      const pastDate = new Date(Date.now() - 100 * 60 * 1000).toISOString();
      inMemoryAttempts[0].started_at = pastDate;

      const res = await invokeHandler(mockExamSessionHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-a-token' },
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('timed_out');
      expect(res.body.data.remaining_seconds).toBe(0);
      expect(inMemoryAttempts[0].status).toBe('timed_out');
    });
  });

  describe('4. Answer Autosave (POST /api/mock-exams/autosave)', () => {
    let sessionToken: string;

    beforeEach(async () => {
      const res = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: { mock_exam_id: mockExamId },
      });
      sessionToken = res.body.data.session_token;
    });

    it('should reject autosave with 401 for anonymous request', async () => {
      const res = await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        body: {
          session_token: sessionToken,
          question_id: mockQ1Id,
          selected_option_key: 'B',
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should reject autosave for a question not in this exam', async () => {
      const res = await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          question_id: mockForeignQId,
          selected_option_key: 'A',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('Question does not belong to this mock exam');
    });

    it('should autosave intermediate answer without grading it (evaluation_status: pending)', async () => {
      const res = await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          question_id: mockQ1Id,
          selected_option_key: 'B',
          time_spent_seconds: 25,
          // Client claims of correctness must be strictly ignored
          is_correct: true,
          score_awarded: 99,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify persisted in question attempts with pending status
      expect(inMemoryQuestionAttempts.length).toBe(1);
      const attempt = inMemoryQuestionAttempts[0];
      expect(attempt.context_type).toBe('mock_exam');
      expect(attempt.selected_key).toBe('B');
      expect(attempt.evaluation_status).toBe('pending');
      expect(attempt.is_correct).toBeNull();
      expect(attempt.score_awarded).toBe(0);
    });

    it('should update existing autosaved answer adhering to unique index idempotency', async () => {
      // First save
      await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          question_id: mockQ1Id,
          selected_option_key: 'A',
          time_spent_seconds: 10,
        },
      });

      // Second save (changed answer to B)
      const res = await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          question_id: mockQ1Id,
          selected_option_key: 'B',
          time_spent_seconds: 15,
        },
      });

      expect(res.statusCode).toBe(200);
      // Still exactly 1 record for this (context_attempt_id, question_id)
      expect(inMemoryQuestionAttempts.length).toBe(1);
      expect(inMemoryQuestionAttempts[0].selected_key).toBe('B');
      expect(inMemoryQuestionAttempts[0].time_spent_seconds).toBe(25);
    });
  });

  describe('5. Submit & Server-Side Objective Grading (POST /api/mock-exams/submit)', () => {
    let sessionToken: string;

    beforeEach(async () => {
      const res = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: { mock_exam_id: mockExamId },
      });
      sessionToken = res.body.data.session_token;
    });

    it('should objectively grade mock exam server-side and calculate marks', async () => {
      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            // Q1: Correct (B) -> 2 marks
            { question_id: mockQ1Id, selected_option_key: 'B' },
            // Q2: Correct (means) -> 2 marks
            { question_id: mockQ2Id, text_answer: 'means' },
            // Q3: Writing (subjective) -> pending, 0 marks
            { question_id: mockQ3WritingId, text_answer: 'My complete English essay...' },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.status).toBe('submitted');
      expect(data.raw_score).toBe(4); // 2 + 2 = 4 marks awarded
      expect(data.total_marks).toBe(9); // 2 + 2 + 5 = 9 marks total
      expect(data.percentage_score).toBe(100); // 4/4 objective marks = 100%
      expect(data.objective_score).toBe(4);
      expect(data.objective_total_marks).toBe(4);
      expect(data.objective_percentage).toBe(100);
      expect(data.pending_subjective_marks).toBe(5);
      expect(data.has_pending_subjective).toBe(true);
      expect(data.evaluation_status).toBe('partially_evaluated_pending_subjective');
      expect(data.is_official).toBe(false);
      expect(data.disclaimer).toContain('Platform practice mock examination');

      // Writing answer is marked pending
      const writingAttempt = inMemoryQuestionAttempts.find((qa) => qa.question_id === mockQ3WritingId);
      expect(writingAttempt.evaluation_status).toBe('pending');
      expect(writingAttempt.is_correct).toBeNull();
      expect(writingAttempt.score_awarded).toBe(0);
    });

    it('should defend against double submit idempotently without mutating progress twice', async () => {
      // First submit
      const res1 = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            { question_id: mockQ1Id, selected_option_key: 'B' },
          ],
        },
      });

      expect(res1.statusCode).toBe(200);
      expect(res1.body.data.already_finalized).toBeUndefined();

      // Second identical submit
      const res2 = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            { question_id: mockQ1Id, selected_option_key: 'B' },
          ],
        },
      });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data.already_finalized).toBe(true);
      expect(res2.body.data.status).toBe('submitted');
    });

    it('should mark status as timed_out when submitted after timer expiration', async () => {
      // Expire session
      const pastDate = new Date(Date.now() - 120 * 60 * 1000).toISOString();
      inMemoryAttempts[0].started_at = pastDate;

      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            { question_id: mockQ1Id, selected_option_key: 'B' },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('timed_out');
    });
  });

  describe('6. Exam Results (GET /api/mock-exams/results)', () => {
    let sessionToken: string;

    beforeEach(async () => {
      const startRes = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: { mock_exam_id: mockExamId },
      });
      sessionToken = startRes.body.data.session_token;
    });

    it('should return 400 when accessing results while exam is still in progress', async () => {
      const res = await invokeHandler(mockExamResultsHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-a-token' },
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('still in progress');
    });

    it('should return 403 when User B attempts to access User A results', async () => {
      // Finalize User A attempt
      await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [{ question_id: mockQ1Id, selected_option_key: 'B' }],
        },
      });

      const res = await invokeHandler(mockExamResultsHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-b-token' },
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(403);
    });

    it('should retrieve comprehensive result breakdown with non-official indicators for submitted exam', async () => {
      await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            { question_id: mockQ1Id, selected_option_key: 'B' },
            { question_id: mockQ2Id, text_answer: 'means' },
          ],
        },
      });

      const res = await invokeHandler(mockExamResultsHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-a-token' },
        query: { token: sessionToken },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.status).toBe('submitted');
      expect(data.raw_score).toBe(4);
      expect(data.total_marks).toBe(9);
      expect(data.is_official).toBe(false);
      expect(data.disclaimer).toContain('Platform practice mock examination result');
      expect(data.section_breakdown['Reading & Use of English']).toBeDefined();
    });
  });

  describe('7. Critical Audits Verification (Timer Grace, Timeout Finalization, Subjective Scoring, Question Ownership, Spoofing Defense)', () => {
    let sessionToken: string;

    beforeEach(async () => {
      const startRes = await invokeHandler(mockExamStartHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: { mock_exam_id: mockExamId },
      });
      sessionToken = startRes.body.data.session_token;
    });

    it('Audit #1: should accept submit within 60-second grace period with status submitted', async () => {
      // 90 min exam -> 90 mins + 30 seconds ago (within 60s grace window)
      const graceTime = new Date(Date.now() - (90 * 60 + 30) * 1000).toISOString();
      inMemoryAttempts[0].started_at = graceTime;

      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [{ question_id: mockQ1Id, selected_option_key: 'B' }],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('submitted');
    });

    it('Audit #1: should accept submit exactly at duration expiration boundary with status submitted', async () => {
      // Exactly 90 minutes ago
      const exactTime = new Date(Date.now() - 90 * 60 * 1000).toISOString();
      inMemoryAttempts[0].started_at = exactTime;

      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [{ question_id: mockQ1Id, selected_option_key: 'B' }],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('submitted');
    });

    it('Audit #1: should mark submit after grace period (>60s past duration) as timed_out', async () => {
      // 90 mins + 65 seconds ago (after grace window)
      const pastGrace = new Date(Date.now() - (90 * 60 + 65) * 1000).toISOString();
      inMemoryAttempts[0].started_at = pastGrace;

      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [{ question_id: mockQ1Id, selected_option_key: 'B' }],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('timed_out');
    });

    it('Audit #2: should auto-finalize and grade saved answers when session is accessed past grace', async () => {
      // Autosave answer Q1 correctly (2 marks)
      await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          question_id: mockQ1Id,
          selected_option_key: 'B',
        },
      });

      // Age session to 100 mins ago (past 90m + 60s grace)
      inMemoryAttempts[0].started_at = new Date(Date.now() - 100 * 60 * 1000).toISOString();

      // Access session
      const sessionRes = await invokeHandler(mockExamSessionHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer user-a-token' },
        query: { token: sessionToken },
      });

      expect(sessionRes.statusCode).toBe(200);
      expect(sessionRes.body.data.status).toBe('timed_out');

      // Verify that saved answers were actually graded rather than left unfinalized
      const attemptInDb = inMemoryAttempts.find((a) => a.session_token === sessionToken);
      expect(attemptInDb.status).toBe('timed_out');
      expect(attemptInDb.raw_score).toBe(2); // Q1 was saved as B (correct = 2 marks)
      expect(attemptInDb.percentage_score).toBe(50); // 2/4 objective marks = 50%
    });

    it('Audit #4: should reject autosave and lock attempt when past grace period', async () => {
      // Age session to 95 mins ago (past grace)
      inMemoryAttempts[0].started_at = new Date(Date.now() - 95 * 60 * 1000).toISOString();

      const res = await invokeHandler(mockExamAutosaveHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          question_id: mockQ1Id,
          selected_option_key: 'B',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('timed out');
      expect(inMemoryAttempts[0].status).toBe('timed_out');
    });

    it('Audit #10: should strictly ignore client score/CEFR spoofing and grade from actual answers', async () => {
      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            // Q1: Wrong answer (A) -> 0 marks
            { question_id: mockQ1Id, selected_option_key: 'A' },
          ],
          // Malicious client spoofed scores
          raw_score: 9999,
          total_marks: 1,
          percentage_score: 100,
          estimated_cefr_level: 'C2',
          estimated_cambridge_score: 230,
        },
      });

      expect(res.statusCode).toBe(200);
      const data = res.body.data;
      // Server must calculate from answers: 0 marks out of 4 objective marks
      expect(data.raw_score).toBe(0);
      expect(data.percentage_score).toBe(0);
      expect(data.estimated_cefr_level).toBe('A1');
      expect(data.estimated_cambridge_score).toBe(80);
    });

    it('Audit #11: should reject submit containing a question that does not belong to this mock exam', async () => {
      const res = await invokeHandler(mockExamSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer user-a-token' },
        body: {
          session_token: sessionToken,
          answers: [
            { question_id: mockForeignQId, selected_option_key: 'A' },
          ],
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('does not belong to this mock exam');
    });
  });
});
