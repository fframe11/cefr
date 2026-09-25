import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

const mockUserId = '33333333-3333-4333-a333-333333333333';
const mockUser = {
  id: mockUserId,
  email: 'student@example.com',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
};

const mockUnassessedProfile = {
  id: mockUserId,
  current_cefr_level: 'A1',
  target_exam: 'KET',
  estimated_cambridge_score: 100,
  streak_days: 0,
  daily_goal_minutes: 20,
  last_active_date: null,
  assessment_completed: false,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
};

const mockAssessedProfile = {
  id: mockUserId,
  current_cefr_level: 'B1',
  target_exam: 'PET',
  estimated_cambridge_score: 130,
  streak_days: 4,
  daily_goal_minutes: 25,
  last_active_date: '2026-09-24',
  assessment_completed: true,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-24T12:00:00Z',
};

const mockQuestion1 = {
  id: '11111111-1111-4111-a111-111111111111',
  skill: 'grammar',
  cefr_level: 'A1',
  type: 'multiple_choice',
  prompt_th: 'เลือกคำตอบที่ถูกต้อง',
  prompt_en: 'She _____ tea every morning.',
  correct_answer_text: null,
  weakness_tag: 'present_simple',
  difficulty_weight: 1,
  is_active: true,
};

const mockOptions1 = [
  { id: 'opt-1', question_id: mockQuestion1.id, key: 'A', text: 'drink', is_correct: false, feedback_th: 'ผิด' },
  { id: 'opt-2', question_id: mockQuestion1.id, key: 'B', text: 'drinks', is_correct: true, feedback_th: 'ถูกต้อง' },
];

const mockQuestion2 = {
  id: '22222222-2222-4222-a222-222222222222',
  skill: 'vocabulary',
  cefr_level: 'B1',
  type: 'fill_blank',
  prompt_th: 'เติมคำในช่องว่าง',
  prompt_en: 'The opposite of hot is _____.',
  correct_answer_text: 'cold',
  weakness_tag: 'antonyms',
  difficulty_weight: 1,
  is_active: true,
};

const mockVocabId = '88888888-8888-4888-a888-888888888888';
const mockVocabWord = {
  id: mockVocabId,
  word: 'diligent',
  lemma: 'diligent',
  cefr_level: 'B2',
  part_of_speech: 'adjective',
  meaning_th: 'ขยันหมั่นเพียร',
  is_active: true,
};

// In-memory test database tables
let currentProfile = { ...mockUnassessedProfile };
let inMemoryAttempts: any[] = [];
let inMemorySkills: any[] = [];
let inMemoryWeaknesses: any[] = [];
let inMemoryVocabMastery: any[] = [];

// Helper to mock chainable PostgREST calls
function createFluentPostgrestMock(dataGetter: () => any, count = 1) {
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.gte = vi.fn(() => builder);
  builder.lt = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);
  builder.range = vi.fn(async () => {
    const data = dataGetter();
    return { data: Array.isArray(data) ? data : [data], count, error: null };
  });
  builder.single = vi.fn(async () => {
    const data = dataGetter();
    if (!data) return { data: null, error: new Error('Record not found') };
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  });
  builder.then = (resolve: any, reject?: any) => {
    const data = dataGetter();
    return Promise.resolve({ data, count, error: null }).then(resolve, reject);
  };
  return builder;
}

// Mock Supabase Client
vi.mock('../api/_lib/supabase/client', () => {
  return {
    createServerUserClient: vi.fn((token: string) => ({
      auth: {
        getUser: vi.fn(async () => {
          if (token === 'valid-token') {
            return { data: { user: mockUser }, error: null };
          }
          return { data: { user: null }, error: new Error('Invalid token') };
        }),
      },
    })),
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: vi.fn(() => createFluentPostgrestMock(() => currentProfile)),
            update: vi.fn((payload: any) => ({
              eq: vi.fn((_col: string, val: string) => {
                if (val === mockUserId) {
                  currentProfile = { ...currentProfile, ...payload };
                }
                return {
                  select: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: currentProfile, error: null })),
                  })),
                  single: vi.fn(async () => ({ data: currentProfile, error: null })),
                };
              }),
            })),
          };
        }

        if (table === 'questions') {
          let targetId: string | null = null;
          const b: any = {};
          b.select = vi.fn(() => b);
          b.eq = vi.fn((col: string, val: any) => {
            if (col === 'id') targetId = val;
            return b;
          });
          b.single = vi.fn(async () => {
            if (targetId === mockQuestion1.id) return { data: mockQuestion1, error: null };
            if (targetId === mockQuestion2.id) return { data: mockQuestion2, error: null };
            return { data: null, error: new Error('Question not found') };
          });
          return b;
        }

        if (table === 'question_options') {
          let qId: string | null = null;
          const b: any = {};
          b.select = vi.fn(() => b);
          b.eq = vi.fn((col: string, val: any) => {
            if (col === 'question_id') qId = val;
            return b;
          });
          b.then = (resolve: any) => {
            if (qId === mockQuestion1.id) return Promise.resolve({ data: mockOptions1, error: null }).then(resolve);
            return Promise.resolve({ data: [], error: null }).then(resolve);
          };
          return b;
        }

        if (table === 'user_question_attempts') {
          return {
            insert: vi.fn((record: any) => {
              inMemoryAttempts.push(record);
              return Promise.resolve({ data: record, error: null });
            }),
            select: vi.fn(() => createFluentPostgrestMock(() => inMemoryAttempts, inMemoryAttempts.length)),
          };
        }

        if (table === 'user_skill_progress') {
          return {
            select: vi.fn(() => {
              const b = createFluentPostgrestMock(() => inMemorySkills, inMemorySkills.length);
              b.single = vi.fn(async () => ({ data: inMemorySkills[0] || null, error: null }));
              return b;
            }),
            insert: vi.fn((record: any) => {
              inMemorySkills.push(record);
              return Promise.resolve({ data: record, error: null });
            }),
            update: vi.fn((payload: any) => ({
              eq: vi.fn(() => Promise.resolve({ data: payload, error: null })),
            })),
          };
        }

        if (table === 'user_weaknesses') {
          return {
            select: vi.fn(() => createFluentPostgrestMock(() => inMemoryWeaknesses, inMemoryWeaknesses.length)),
            insert: vi.fn((record: any) => {
              inMemoryWeaknesses.push(record);
              return Promise.resolve({ data: record, error: null });
            }),
            update: vi.fn((payload: any) => ({
              eq: vi.fn(() => Promise.resolve({ data: payload, error: null })),
            })),
          };
        }

        if (table === 'vocabularies') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((_col: string, val: string) => ({
                single: vi.fn(async () => {
                  if (val === mockVocabId) return { data: mockVocabWord, error: null };
                  return { data: null, error: new Error('Vocab not found') };
                }),
              })),
            })),
          };
        }

        if (table === 'user_vocabulary_mastery') {
          return {
            select: vi.fn(() => createFluentPostgrestMock(() => inMemoryVocabMastery, inMemoryVocabMastery.length)),
            insert: vi.fn((record: any) => {
              const inserted = { id: 'vm-test', ...record };
              inMemoryVocabMastery.push(inserted);
              return {
                select: vi.fn(() => ({
                  single: vi.fn(async () => ({ data: inserted, error: null })),
                })),
              };
            }),
            update: vi.fn((payload: any) => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(async () => ({ data: payload, error: null })),
                })),
              })),
            })),
          };
        }

        return createFluentPostgrestMock(() => []);
      }),
    })),
    createPublicServerClient: vi.fn(),
  };
});

// Mock HTTP Request / Response Helpers
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
import assessmentSubmitHandler from '../api/assessment/submit';
import assessmentResultHandler from '../api/assessment/result';
import userProgressHandler from '../api/user/progress';
import vocabMasteryHandler from '../api/user/vocabulary-mastery';
import weaknessesHandler from '../api/user/weaknesses';
import { estimatePlatformCefr } from '../api/_lib/assessment/cefr-calculator';

describe('Phase 4.5: Student Progress & Assessment API Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentProfile = { ...mockUnassessedProfile };
    inMemoryAttempts = [];
    inMemorySkills = [];
    inMemoryWeaknesses = [];
    inMemoryVocabMastery = [];
  });

  describe('1. Assessment Submission (POST /api/assessment/submit)', () => {
    it('should return 401 for unauthenticated assessment submission', async () => {
      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        body: {
          answers: [{ question_id: mockQuestion1.id, selected_option_key: 'B' }],
        },
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should evaluate placement assessment deterministically server-side', async () => {
      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          answers: [
            { question_id: mockQuestion1.id, selected_option_key: 'B', time_spent_seconds: 15 },
            { question_id: mockQuestion2.id, text_answer: 'cold', time_spent_seconds: 20 },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.total_questions).toBe(2);
      expect(data.correct_count).toBe(2);
      expect(data.percentage_score).toBe(100);
      expect(data.estimated_cefr_level).toBe('C2');
      expect(data.recommended_exam).toBe('CAE');
      // BOUNDARY CHECK: user-owned target_exam is preserved from user_profiles, NEVER overwritten
      expect(data.target_exam).toBe('KET');
      expect(currentProfile.target_exam).toBe('KET');
      expect(data.estimation_method).toBe('platform_diagnostic_heuristic');
      expect(data.is_official).toBe(false);
      expect(data.disclaimer).toContain('Platform diagnostic estimate');

      // Verify attempts ledger recorded
      expect(inMemoryAttempts.length).toBe(2);
      expect(inMemoryAttempts[0].context_type).toBe('placement');
      expect(inMemoryAttempts[0].is_correct).toBe(true);

      // Verify user_profile updated for server-owned fields
      expect(currentProfile.assessment_completed).toBe(true);
      expect(currentProfile.current_cefr_level).toBe('C2');
      expect(currentProfile.estimated_cambridge_score).toBeGreaterThanOrEqual(180);
    });

    it('should preserve user-owned target_exam when student achieves different level', async () => {
      // User explicitly set target_exam to FCE
      currentProfile.target_exam = 'FCE';

      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          answers: [
            { question_id: mockQuestion1.id, selected_option_key: 'A', time_spent_seconds: 10 },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      // Level evaluated as A1
      expect(res.body.data.estimated_cefr_level).toBe('A1');
      expect(res.body.data.recommended_exam).toBe('KET');
      // Target exam remains user's choice: FCE
      expect(res.body.data.target_exam).toBe('FCE');
      expect(currentProfile.target_exam).toBe('FCE');
    });

    it('should record weaknesses when student submits incorrect answers', async () => {
      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          answers: [
            { question_id: mockQuestion1.id, selected_option_key: 'A', time_spent_seconds: 10 },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.correct_count).toBe(0);
      expect(res.body.data.estimated_cefr_level).toBe('A1');
      expect(res.body.data.recommended_exam).toBe('KET');

      // Verify weakness created
      expect(res.body.data.identified_weaknesses.length).toBe(1);
      expect(res.body.data.identified_weaknesses[0].tag).toBe('present_simple');
      expect(inMemoryWeaknesses.length).toBe(1);
    });

    it('should ignore client claims of cefr_level and score', async () => {
      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          answers: [
            { question_id: mockQuestion1.id, selected_option_key: 'A' },
          ],
          cefr_level: 'C2',
          score: 100,
        },
      });

      expect(res.statusCode).toBe(200);
      // Even though client claimed C2, server evaluated 0 correct answers as A1
      expect(res.body.data.estimated_cefr_level).toBe('A1');
      expect(res.body.data.correct_count).toBe(0);
    });

    it('should reject empty answers array with 400', async () => {
      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          answers: [],
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('2. Assessment Result (GET /api/assessment/result)', () => {
    it('should return 401 for unauthenticated result access', async () => {
      const res = await invokeHandler(assessmentResultHandler, {
        method: 'GET',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when assessment has not been completed yet', async () => {
      currentProfile = { ...mockUnassessedProfile };

      const res = await invokeHandler(assessmentResultHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Please complete the diagnostic assessment first');
    });

    it('should return latest assessment results with non-official disclaimer for assessed user', async () => {
      currentProfile = { ...mockAssessedProfile };
      inMemoryWeaknesses = [
        { weakness_tag: 'present_perfect', error_count: 3, last_failed_at: '2026-09-24T10:00:00Z' },
      ];

      const res = await invokeHandler(assessmentResultHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.assessment_completed).toBe(true);
      expect(data.estimated_cefr_level).toBe('B1');
      expect(data.estimation_method).toBe('platform_diagnostic_heuristic');
      expect(data.is_official).toBe(false);
      expect(data.disclaimer).toContain('Platform diagnostic estimate');
      expect(data.identified_weaknesses.length).toBe(1);
    });
  });

  describe('3. Student Learning Progress (GET /api/user/progress)', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await invokeHandler(userProgressHandler, {
        method: 'GET',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should aggregate user profile, skills, and telemetry', async () => {
      currentProfile = { ...mockAssessedProfile };
      inMemoryAttempts = [{ id: 'a1' }, { id: 'a2' }];

      const res = await invokeHandler(userProgressHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.profile.current_cefr_level).toBe('B1');
      expect(data.profile.streak_days).toBe(4);
      expect(data.skills.grammar).toBeDefined();
      expect(data.telemetry.questions_attempted).toBe(2);
    });
  });

  describe('4. Vocabulary Mastery (GET & POST /api/user/vocabulary-mastery)', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await invokeHandler(vocabMasteryHandler, {
        method: 'GET',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should record review outcome and increase mastery percentage', async () => {
      const res = await invokeHandler(vocabMasteryHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          vocabulary_id: mockVocabId,
          is_correct: true,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const record = res.body.data.mastery_record;
      expect(record.mastery_percentage).toBe(20);
      expect(record.consecutive_correct).toBe(1);
      expect(record.next_review_at).toBeDefined();
    });

    it('should return paginated mastery records on GET', async () => {
      inMemoryVocabMastery = [
        {
          id: 'vm-1',
          vocabulary_id: mockVocabId,
          mastery_percentage: 85,
          review_count: 4,
          consecutive_correct: 3,
        },
      ];

      const res = await invokeHandler(vocabMasteryHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.mastery_records.length).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });
  });

  describe('5. Weaknesses Tracking (GET /api/user/weaknesses)', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await invokeHandler(weaknessesHandler, {
        method: 'GET',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return active weaknesses ordered by error count', async () => {
      inMemoryWeaknesses = [
        { id: 'w1', weakness_tag: 'prepositions_of_time', error_count: 5, last_failed_at: '2026-09-24T12:00:00Z' },
        { id: 'w2', weakness_tag: 'past_simple', error_count: 2, last_failed_at: '2026-09-24T11:00:00Z' },
      ];

      const res = await invokeHandler(weaknessesHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.weaknesses.length).toBe(2);
      expect(res.body.data.weaknesses[0].weakness_tag).toBe('prepositions_of_time');
      expect(res.body.data.weaknesses[0].error_count).toBe(5);
    });
  });

  describe('6. CEFR & Cambridge Integrity & Non-Official Guardrails', () => {
    it('should correctly classify heuristic thresholds across the entire curve', () => {
      // Threshold 0% (<25%) -> A1, score 80
      const a1Low = estimatePlatformCefr(0, 100);
      expect(a1Low.estimatedLevel).toBe('A1');
      expect(a1Low.estimatedCambridgeScore).toBe(80);
      expect(a1Low.recommendedExam).toBe('KET');
      expect(a1Low.isOfficial).toBe(false);
      expect(a1Low.estimationMethod).toBe('platform_diagnostic_heuristic');

      // Threshold 24% (<25%) -> A1
      const a1High = estimatePlatformCefr(24, 100);
      expect(a1High.estimatedLevel).toBe('A1');
      expect(a1High.estimatedCambridgeScore).toBeLessThanOrEqual(119);

      // Threshold 25% (<45%) -> A2, score 120
      const a2Low = estimatePlatformCefr(25, 100);
      expect(a2Low.estimatedLevel).toBe('A2');
      expect(a2Low.estimatedCambridgeScore).toBe(120);
      expect(a2Low.recommendedExam).toBe('KET');

      // Threshold 44% (<45%) -> A2
      const a2High = estimatePlatformCefr(44, 100);
      expect(a2High.estimatedLevel).toBe('A2');
      expect(a2High.estimatedCambridgeScore).toBeLessThanOrEqual(139);

      // Threshold 45% (<65%) -> B1, score 140
      const b1Low = estimatePlatformCefr(45, 100);
      expect(b1Low.estimatedLevel).toBe('B1');
      expect(b1Low.estimatedCambridgeScore).toBe(140);
      expect(b1Low.recommendedExam).toBe('PET');

      // Threshold 64% (<65%) -> B1
      const b1High = estimatePlatformCefr(64, 100);
      expect(b1High.estimatedLevel).toBe('B1');
      expect(b1High.estimatedCambridgeScore).toBeLessThanOrEqual(159);

      // Threshold 65% (<80%) -> B2, score 160
      const b2Low = estimatePlatformCefr(65, 100);
      expect(b2Low.estimatedLevel).toBe('B2');
      expect(b2Low.estimatedCambridgeScore).toBe(160);
      expect(b2Low.recommendedExam).toBe('FCE');

      // Threshold 79% (<80%) -> B2
      const b2High = estimatePlatformCefr(79, 100);
      expect(b2High.estimatedLevel).toBe('B2');
      expect(b2High.estimatedCambridgeScore).toBeLessThanOrEqual(179);

      // Threshold 80% (<92%) -> C1, score 180
      const c1Low = estimatePlatformCefr(80, 100);
      expect(c1Low.estimatedLevel).toBe('C1');
      expect(c1Low.estimatedCambridgeScore).toBe(180);
      expect(c1Low.recommendedExam).toBe('CAE');

      // Threshold 91% (<92%) -> C1
      const c1High = estimatePlatformCefr(91, 100);
      expect(c1High.estimatedLevel).toBe('C1');
      expect(c1High.estimatedCambridgeScore).toBeLessThanOrEqual(199);

      // Threshold 92% (>=92%) -> C2, score 200
      const c2Low = estimatePlatformCefr(92, 100);
      expect(c2Low.estimatedLevel).toBe('C2');
      expect(c2Low.estimatedCambridgeScore).toBe(200);
      expect(c2Low.recommendedExam).toBe('CAE');

      // Threshold 100% -> C2, score 230
      const c2Max = estimatePlatformCefr(100, 100);
      expect(c2Max.estimatedLevel).toBe('C2');
      expect(c2Max.estimatedCambridgeScore).toBe(230);
    });

    it('should strictly deny client-side injection of official score, cefr level or certified status', async () => {
      const res = await invokeHandler(assessmentSubmitHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          answers: [
            { question_id: mockQuestion1.id, selected_option_key: 'A' },
          ],
          cefr_level: 'C2',
          estimated_cambridge_score: 230,
          is_official: true,
          score: 100,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.is_official).toBe(false);
      expect(res.body.data.estimated_cefr_level).toBe('A1');
      expect(res.body.data.estimated_cambridge_score).toBe(80);
      expect(res.body.data.disclaimer).toContain('Platform diagnostic estimate');
    });

    it('should verify response contract contains zero official certification claims', async () => {
      currentProfile = { ...mockAssessedProfile };

      const res = await invokeHandler(assessmentResultHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      const data = res.body.data;
      expect(data.is_official).toBe(false);
      expect(data.estimation_method).toBe('platform_diagnostic_heuristic');
      // Assert absence of misleading official certification keys
      expect((data as any).official_certificate).toBeUndefined();
      expect((data as any).certified_level).toBeUndefined();
      expect((data as any).cambridge_official_score).toBeUndefined();
      expect((data as any).official_placement).toBeUndefined();
    });

    it('should include non-official flags and disclaimer in user progress API', async () => {
      currentProfile = { ...mockAssessedProfile };

      const res = await invokeHandler(userProgressHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.is_official).toBe(false);
      expect(res.body.data.estimation_method).toBe('platform_diagnostic_heuristic');
      expect(res.body.data.disclaimer).toContain('Platform diagnostic estimate');
    });
  });
});
