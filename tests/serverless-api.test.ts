import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

// Create persistent mock state for Supabase
const mockUser = {
  id: '33333333-3333-4333-a333-333333333333',
  email: 'learner@example.com',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
};

const mockProfile = {
  id: '33333333-3333-4333-a333-333333333333',
  current_cefr_level: 'B1',
  target_exam: 'PET',
  estimated_cambridge_score: 140,
  streak_days: 5,
  daily_goal_minutes: 20,
  last_active_date: '2026-09-24',
  assessment_completed: true,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};

const mockCefrLevels = [
  { code: 'A1', name: 'Beginner', cambridge_scale_min: 80, cambridge_scale_max: 99, description_en: 'Basic', description_th: 'เริ่มต้น', order_index: 1 },
  { code: 'A2', name: 'Elementary', cambridge_scale_min: 100, cambridge_scale_max: 119, description_en: 'Elementary', description_th: 'พื้นฐาน', order_index: 2 },
  { code: 'B1', name: 'Intermediate', cambridge_scale_min: 120, cambridge_scale_max: 139, description_en: 'Intermediate', description_th: 'ปานกลาง', order_index: 3 },
  { code: 'B2', name: 'Upper Intermediate', cambridge_scale_min: 140, cambridge_scale_max: 159, description_en: 'Upper', description_th: 'ระดับกลางสูง', order_index: 4 },
  { code: 'C1', name: 'Advanced', cambridge_scale_min: 160, cambridge_scale_max: 179, description_en: 'Advanced', description_th: 'ระดับสูง', order_index: 5 },
  { code: 'C2', name: 'Proficiency', cambridge_scale_min: 180, cambridge_scale_max: 230, description_en: 'Mastery', description_th: 'ระดับเชี่ยวชาญ', order_index: 6 },
];

const mockQuestionMC = {
  id: '11111111-1111-4111-a111-111111111111',
  skill: 'grammar',
  cefr_level: 'B1',
  type: 'multiple_choice',
  prompt_th: 'เลือกคำตอบที่ถูกต้อง',
  prompt_en: 'She _____ to London last summer.',
  context_passage: null,
  audio_script: null,
  audio_storage_path: null,
  correct_answer_text: null,
  explanation_th: 'กริยาช่อง 2 สำหรับอดีตคือ went',
  explanation_en: 'Past simple of go is went',
  weakness_tag: 'past_simple',
  difficulty_weight: 1,
  is_active: true,
};

const mockOptionsMC = [
  { id: 'opt-1', question_id: mockQuestionMC.id, key: 'A', text: 'go', is_correct: false, feedback_th: 'go เป็นรูปปัจจุบัน' },
  { id: 'opt-2', question_id: mockQuestionMC.id, key: 'B', text: 'went', is_correct: true, feedback_th: 'ถูกต้อง! went เป็นอดีต' },
  { id: 'opt-3', question_id: mockQuestionMC.id, key: 'C', text: 'gone', is_correct: false, feedback_th: 'gone ต้องมี have/has นำหน้า' },
];

const mockQuestionFill = {
  id: '22222222-2222-4222-a222-222222222222',
  skill: 'vocabulary',
  cefr_level: 'B1',
  type: 'fill_blank',
  prompt_th: 'เติมคำในช่องว่าง',
  prompt_en: 'The opposite of hot is _____.',
  context_passage: null,
  audio_script: null,
  audio_storage_path: null,
  correct_answer_text: 'cold',
  explanation_th: 'ตรงข้ามกับ hot คือ cold',
  explanation_en: 'Opposite of hot is cold',
  weakness_tag: 'antonyms',
  difficulty_weight: 1,
  is_active: true,
};

// Inserted attempts store for verification
let recordedAttempts: any[] = [];

function createFluentMockBuilder(getData: () => any, getCount = 1) {
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.ilike = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.range = vi.fn(async () => {
    const data = getData();
    return { data: Array.isArray(data) ? data : [data], count: getCount, error: null };
  });
  builder.single = vi.fn(async () => {
    const data = getData();
    if (!data) return { data: null, error: new Error('Not found') };
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  });
  // Enable await builder
  builder.then = (resolve: any, reject?: any) => {
    const data = getData();
    return Promise.resolve({ data, count: getCount, error: null }).then(resolve, reject);
  };
  return builder;
}

// Mock the Supabase client factory
vi.mock('../api/_lib/supabase/client', () => {
  return {
    createServerUserClient: vi.fn((token: string) => {
      return {
        auth: {
          getUser: vi.fn(async () => {
            if (token === 'valid-token') {
              return { data: { user: mockUser }, error: null };
            }
            if (token === 'user-b-token') {
              return { data: { user: { ...mockUser, id: '44444444-4444-4444-a444-444444444444', email: 'userb@example.com' } }, error: null };
            }
            return { data: { user: null }, error: new Error('Invalid token') };
          }),
        },
      };
    }),
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: vi.fn(() => {
              const b = createFluentMockBuilder(() => mockProfile);
              return b;
            }),
            update: vi.fn((payload: any) => ({
              eq: vi.fn((col: string, val: any) => ({
                select: vi.fn(() => ({
                  single: vi.fn(async () => {
                    if (val === mockUser.id) {
                      return { data: { ...mockProfile, ...payload }, error: null };
                    }
                    return { data: null, error: new Error('Profile update failed') };
                  }),
                })),
              })),
            })),
          };
        }

        if (table === 'questions') {
          let currentId: string | null = null;
          const builder: any = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn((col: string, val: any) => {
            if (col === 'id') currentId = val;
            return builder;
          });
          builder.single = vi.fn(async () => {
            let q = null;
            if (currentId === mockQuestionMC.id) q = { ...mockQuestionMC };
            if (currentId === mockQuestionFill.id) q = { ...mockQuestionFill };
            return { data: q, error: q ? null : new Error('Question not found') };
          });
          return builder;
        }

        if (table === 'question_options') {
          let questionId: string | null = null;
          const builder: any = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn((col: string, val: any) => {
            if (col === 'question_id') questionId = val;
            return builder;
          });
          builder.then = (resolve: any) => {
            const opts = questionId === mockQuestionMC.id ? [...mockOptionsMC] : [];
            return Promise.resolve({ data: opts, error: null }).then(resolve);
          };
          return builder;
        }

        if (table === 'user_question_attempts') {
          return {
            insert: vi.fn((record: any) => {
              const inserted = { id: 'att_test_12345', ...record, attempted_at: new Date().toISOString() };
              recordedAttempts.push(inserted);
              return {
                select: vi.fn(() => ({
                  single: vi.fn(async () => ({ data: inserted, error: null })),
                })),
              };
            }),
          };
        }

        if (table === 'user_skill_progress') {
          const builder: any = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn(() => builder);
          builder.single = vi.fn(async () => ({ data: null, error: new Error('Not found') }));
          builder.insert = vi.fn(async () => ({ data: null, error: null }));
          builder.update = vi.fn(() => builder);
          return builder;
        }

        return createFluentMockBuilder(() => []);
      }),
    })),
    createPublicServerClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'cefr_levels') {
          return {
            select: vi.fn(() => ({
              order: vi.fn(async () => ({ data: mockCefrLevels, error: null })),
            })),
          };
        }

        if (table === 'vocabularies') {
          const vocabItems = [
            { id: 'v1', word: 'abandon', cefr_level: 'B2', part_of_speech: 'verb', is_active: true },
            { id: 'v2', word: 'ability', cefr_level: 'A2', part_of_speech: 'noun', is_active: true },
          ];
          return {
            select: vi.fn(() => createFluentMockBuilder(() => vocabItems, 2)),
          };
        }

        if (table === 'writing_prompts') {
          const prompts = [
            {
              id: 'wp1',
              title: 'An unforgettable trip',
              cefr_level: 'B1',
              target_exam: 'PET',
              task_type: 'Story',
              prompt_en: 'Write a story about a memorable holiday.',
              min_words: 100,
              max_words: 120,
            },
          ];
          return {
            select: vi.fn(() => createFluentMockBuilder(() => prompts, 1)),
          };
        }

        if (table === 'questions') {
          let currentId: string | null = null;
          const builder: any = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn((col: string, val: any) => {
            if (col === 'id') currentId = val;
            return builder;
          });
          builder.order = vi.fn(() => builder);
          builder.range = vi.fn(async () => ({
            data: [
              {
                ...mockQuestionMC,
                question_options: [
                  { id: 'opt-1', key: 'A', text: 'go' },
                  { id: 'opt-2', key: 'B', text: 'went' },
                ],
              },
            ],
            count: 1,
            error: null,
          }));
          builder.single = vi.fn(async () => {
            let q = null;
            if (currentId === mockQuestionMC.id) q = { ...mockQuestionMC };
            return { data: q, error: q ? null : new Error('Question not found') };
          });
          return builder;
        }

        if (table === 'question_options') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(async () => ({
                  data: [
                    { id: 'opt-1', key: 'A', text: 'go' },
                    { id: 'opt-2', key: 'B', text: 'went' },
                  ],
                  error: null,
                })),
              })),
            })),
          };
        }

        return createFluentMockBuilder(() => []);
      }),
    })),
  };
});

// Helper to simulate request / response
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
    req.url = options.url || '/';
    req.headers = options.headers || {};
    req.body = options.body;
    req.query = options.query;

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
      writableEnded: false,
    };

    handler(req, res);
  });
}

// Import handlers after mocking
import authMeHandler from '../api/auth/me';
import profileHandler from '../api/user/profile';
import cefrLevelsHandler from '../api/cefr/levels';
import contentVocabularyHandler from '../api/content/vocabulary';
import contentWritingHandler from '../api/content/writing';
import questionsHandler from '../api/questions/index';
import practiceSubmitHandler from '../api/practice/submit';

describe('Serverless API: Auth Endpoint (GET /api/auth/me)', () => {
  beforeEach(() => {
    recordedAttempts = [];
  });

  it('should return 401 Unauthorized for anonymous request', async () => {
    const res = await invokeHandler(authMeHandler, {
      method: 'GET',
      headers: {},
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return safe user identity for authenticated request and never leak tokens', async () => {
    const res = await invokeHandler(authMeHandler, {
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toEqual({
      id: '33333333-3333-4333-a333-333333333333',
      email: 'learner@example.com',
      role: 'authenticated',
    });
    // Verify no secret leakage
    expect(res.body.data.user.token).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.service_role_key).toBeUndefined();
  });
});

describe('Serverless API: Profile Endpoint (GET & PATCH /api/user/profile)', () => {
  it('should return 401 for unauthenticated profile access', async () => {
    const res = await invokeHandler(profileHandler, {
      method: 'GET',
    });
    expect(res.status).toBe(401);
  });

  it('should return own profile for authenticated user', async () => {
    const res = await invokeHandler(profileHandler, {
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.id).toBe('33333333-3333-4333-a333-333333333333');
    expect(res.body.data.profile.current_cefr_level).toBe('B1');
  });

  it('should allow updating client-whitelisted fields (target_exam, daily_goal_minutes)', async () => {
    const res = await invokeHandler(profileHandler, {
      method: 'PATCH',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        target_exam: 'FCE',
        daily_goal_minutes: 45,
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.target_exam).toBe('FCE');
    expect(res.body.data.profile.daily_goal_minutes).toBe(45);
  });

  it('should reject modification of server-owned fields (current_cefr, estimated_cambridge_score, streak_days)', async () => {
    const res = await invokeHandler(profileHandler, {
      method: 'PATCH',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        target_exam: 'FCE',
        current_cefr_level: 'C2', // FORBIDDEN
        streak_days: 999,         // FORBIDDEN
      },
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should prevent user A from modifying user B profile via spoofed payload', async () => {
    // Authenticated as User A (usr_test_123) but sending body with user_id: 'usr_test_456'
    const res = await invokeHandler(profileHandler, {
      method: 'PATCH',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        user_id: 'usr_test_456', // Extra field, forbidden by strict whitelist
        target_exam: 'CAE',
      },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Serverless API: CEFR & Content Reference APIs', () => {
  it('GET /api/cefr/levels should return all 6 CEFR reference levels', async () => {
    const res = await invokeHandler(cefrLevelsHandler, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.levels.length).toBe(6);
    expect(res.body.data.levels[0].code).toBe('A1');
    expect(res.body.data.levels[5].code).toBe('C2');
  });

  it('GET /api/content/vocabulary should return vocabulary items with pagination', async () => {
    const res = await invokeHandler(contentVocabularyHandler, {
      method: 'GET',
      query: { cefr_level: 'B2', limit: '10' },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.pagination.limit).toBe(10);
  });

  it('GET /api/content/writing should NEVER leak sample_model_answer in student practice list', async () => {
    const res = await invokeHandler(contentWritingHandler, {
      method: 'GET',
      query: { cefr_level: 'B1' },
    });
    expect(res.status).toBe(200);
    expect(res.body.data.prompts.length).toBeGreaterThan(0);
    const prompt = res.body.data.prompts[0];
    expect(prompt.sample_model_answer).toBeUndefined();
    expect(prompt.model_answer).toBeUndefined();
  });
});

describe('Serverless API: Secure Question API (GET /api/questions)', () => {
  it('should retrieve question while strictly stripping answers, is_correct, and feedback before grading', async () => {
    const res = await invokeHandler(questionsHandler, {
      method: 'GET',
      query: { id: mockQuestionMC.id },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const q = res.body.data.question;

    // Verify sanitized structure
    expect(q.id).toBe(mockQuestionMC.id);
    expect(q.prompt_en).toBe(mockQuestionMC.prompt_en);

    // CRITICAL: Sensitive answer keys and feedback must NOT be present
    expect(q.correct_answer_text).toBeUndefined();
    expect(q.explanation_th).toBeUndefined();
    expect(q.explanation_en).toBeUndefined();
    expect((q as any).explanationTh).toBeUndefined();
    expect((q as any).explanationEn).toBeUndefined();

    // Verify options are present without is_correct, isCorrect, feedback_th, or feedbackTh
    expect(q.options.length).toBe(2);
    for (const opt of q.options) {
      expect(opt.key).toBeDefined();
      expect(opt.text).toBeDefined();
      expect(opt.is_correct).toBeUndefined();
      expect((opt as any).isCorrect).toBeUndefined();
      expect(opt.feedback_th).toBeUndefined();
      expect((opt as any).feedbackTh).toBeUndefined();
    }
  });
});

describe('Serverless API: Practice Submission & Objective Grading (POST /api/practice/submit)', () => {
  it('should return 401 for unauthenticated practice submission', async () => {
    const res = await invokeHandler(practiceSubmitHandler, {
      method: 'POST',
      body: {
        question_id: mockQuestionMC.id,
        selected_option_key: 'B',
      },
    });
    expect(res.status).toBe(401);
  });

  it('should grade multiple_choice deterministically and return score + feedback', async () => {
    const res = await invokeHandler(practiceSubmitHandler, {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        question_id: mockQuestionMC.id,
        selected_option_key: 'B', // Correct answer
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_correct).toBe(true);
    expect(res.body.data.score_awarded).toBe(1);
    expect(res.body.data.correct_option_key).toBe('B');
    expect(res.body.data.explanation_en).toBe('Past simple of go is went');

    // Verify ledger entry
    expect(recordedAttempts.length).toBe(1);
    expect(recordedAttempts[0].user_id).toBe('33333333-3333-4333-a333-333333333333');
    expect(recordedAttempts[0].is_correct).toBe(true);
    expect(recordedAttempts[0].score_awarded).toBe(1);
    expect(recordedAttempts[0].context_attempt_id).toBeNull();
  });

  it('should evaluate incorrect answer accurately', async () => {
    const res = await invokeHandler(practiceSubmitHandler, {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        question_id: mockQuestionMC.id,
        selected_option_key: 'A', // Incorrect answer
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.data.is_correct).toBe(false);
    expect(res.body.data.score_awarded).toBe(0);
    expect(res.body.data.correct_option_key).toBe('B');
  });

  it('should ignore client claims of is_correct=true or score_awarded=999 and grade on server', async () => {
    const res = await invokeHandler(practiceSubmitHandler, {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        question_id: mockQuestionMC.id,
        selected_option_key: 'A', // Actually incorrect
        is_correct: true,         // Spoofed
        score_awarded: 999,       // Spoofed
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.data.is_correct).toBe(false);
    expect(res.body.data.score_awarded).toBe(0);
    expect(recordedAttempts[recordedAttempts.length - 1].is_correct).toBe(false);
    expect(recordedAttempts[recordedAttempts.length - 1].score_awarded).toBe(0);
  });

  it('should prevent user_id spoofing: user_id is derived strictly from server token', async () => {
    const res = await invokeHandler(practiceSubmitHandler, {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        question_id: mockQuestionMC.id,
        selected_option_key: 'B',
        user_id: 'spoofed_victim_id', // Spoofed user ID
      },
    });

    expect(res.status).toBe(200);
    // Ledger must record the authenticated user's ID, NOT the spoofed one
    const latestAttempt = recordedAttempts[recordedAttempts.length - 1];
    expect(latestAttempt.user_id).toBe('33333333-3333-4333-a333-333333333333');
    expect(latestAttempt.user_id).not.toBe('spoofed_victim_id');
  });

  it('should grade fill_blank questions deterministically with case-insensitivity', async () => {
    const res = await invokeHandler(practiceSubmitHandler, {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        question_id: mockQuestionFill.id,
        text_answer: '  COLD  ', // Correct with whitespace & caps
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.data.is_correct).toBe(true);
    expect(res.body.data.score_awarded).toBe(1);
    expect(res.body.data.correct_answer_text).toBe('cold');
  });
});
