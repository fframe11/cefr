import { describe, it, expect, vi, beforeEach } from 'vitest';
import userProgressHandler from '../api/user/progress';
import userAnalyticsHandler from '../api/user/analytics';
import userWeaknessesHandler from '../api/user/weaknesses';
import syncGuestHandler from '../api/user/sync-guest';
import { calculateNewStreak } from '../api/_lib/assessment/streak';

// Mock Identifiers
const mockUserId = '11111111-2222-4333-a444-555555555555';
const mockOtherUserId = '99999999-8888-4777-a666-555555555555';

const mockUser = {
  id: mockUserId,
  email: 'learner@example.com',
  role: 'authenticated',
};

const mockQuestionGrammar = {
  id: 'aaaaaaaa-1111-4111-a111-111111111111',
  skill: 'grammar',
  cefr_level: 'A2',
  type: 'multiple_choice',
  prompt_th: 'เลือกคำตอบที่ถูกต้อง',
  prompt_en: 'She _____ to work by bus every day.',
  correct_answer_text: null,
  weakness_tag: 'present_simple',
  difficulty_weight: 1,
  is_active: true,
};

const mockOptionsGrammar = [
  { id: 'opt-g1', question_id: mockQuestionGrammar.id, key: 'A', is_correct: false },
  { id: 'opt-g2', question_id: mockQuestionGrammar.id, key: 'B', is_correct: true },
];

const mockQuestionVocab = {
  id: 'bbbbbbbb-2222-4222-a222-222222222222',
  skill: 'vocabulary',
  cefr_level: 'B1',
  type: 'fill_blank',
  prompt_th: 'เติมคำศัพท์',
  prompt_en: 'A person who writes books is an _____.',
  correct_answer_text: 'author',
  weakness_tag: 'occupations_vocabulary',
  difficulty_weight: 2,
  is_active: true,
};

const mockQuestionWriting = {
  id: 'cccccccc-3333-4333-a333-333333333333',
  skill: 'writing',
  cefr_level: 'B2',
  type: 'sentence_transformation',
  prompt_th: 'เขียนประโยคใหม่',
  prompt_en: 'Rewrite using passive voice',
  correct_answer_text: null,
  weakness_tag: 'passive_voice',
  difficulty_weight: 3,
  is_active: true,
};

// In-Memory Database State
let inMemoryProfile: any = null;
let inMemoryAttempts: any[] = [];
let inMemorySkills: any[] = [];
let inMemoryWeaknesses: any[] = [];
let inMemoryVocabMastery: any[] = [];
let inMemoryMockAttempts: any[] = [];

function createFluentPostgrestMock(dataGetter: () => any, count?: number) {
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.gte = vi.fn(() => builder);
  builder.lt = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);
  builder.range = vi.fn(async () => {
    const data = dataGetter();
    const arr = Array.isArray(data) ? data : [data];
    return { data: arr, count: count ?? arr.length, error: null };
  });
  builder.maybeSingle = vi.fn(async () => {
    const data = dataGetter();
    if (!data) return { data: null, error: null };
    return { data: Array.isArray(data) ? data[0] || null : data, error: null };
  });
  builder.single = vi.fn(async () => {
    const data = dataGetter();
    if (!data) return { data: null, error: new Error('Record not found') };
    const res = Array.isArray(data) ? data[0] : data;
    if (!res) return { data: null, error: new Error('Record not found') };
    return { data: res, error: null };
  });
  builder.then = (resolve: any, reject?: any) => {
    const data = dataGetter();
    return Promise.resolve({ data, count: count ?? (Array.isArray(data) ? data.length : 1), error: null }).then(resolve, reject);
  };
  return builder;
}

vi.mock('../api/_lib/supabase/client', () => {
  return {
    createServerUserClient: vi.fn((token: string) => ({
      auth: {
        getUser: vi.fn(async () => {
          if (token === 'valid-token') {
            return { data: { user: mockUser }, error: null };
          }
          if (token === 'other-user-token') {
            return { data: { user: { id: mockOtherUserId, role: 'authenticated' } }, error: null };
          }
          return { data: { user: null }, error: new Error('Invalid token') };
        }),
      },
    })),
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: vi.fn(() => createFluentPostgrestMock(() => inMemoryProfile)),
            update: vi.fn((payload: any) => ({
              eq: vi.fn((_col: string, val: string) => {
                if (val === inMemoryProfile?.id) {
                  inMemoryProfile = { ...inMemoryProfile, ...payload };
                }
                return {
                  select: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: inMemoryProfile, error: null })),
                  })),
                  single: vi.fn(async () => ({ data: inMemoryProfile, error: null })),
                };
              }),
            })),
            insert: vi.fn((record: any) => {
              inMemoryProfile = { ...record };
              return Promise.resolve({ data: record, error: null });
            }),
          };
        }

        if (table === 'questions') {
          let filterIds: string[] = [];
          const b: any = {};
          b.select = vi.fn(() => b);
          b.in = vi.fn((_col: string, vals: string[]) => {
            filterIds = vals;
            return b;
          });
          b.then = (resolve: any) => {
            const allQ = [mockQuestionGrammar, mockQuestionVocab, mockQuestionWriting];
            const data = filterIds.length > 0 ? allQ.filter((q) => filterIds.includes(q.id)) : allQ;
            return Promise.resolve({ data, error: null }).then(resolve);
          };
          return b;
        }

        if (table === 'question_options') {
          let filterQIds: string[] = [];
          const b: any = {};
          b.select = vi.fn(() => b);
          b.in = vi.fn((_col: string, vals: string[]) => {
            filterQIds = vals;
            return b;
          });
          b.then = (resolve: any) => {
            const allOpts = [...mockOptionsGrammar];
            const data = filterQIds.length > 0 ? allOpts.filter((o) => filterQIds.includes(o.question_id)) : allOpts;
            return Promise.resolve({ data, error: null }).then(resolve);
          };
          return b;
        }

        if (table === 'user_question_attempts') {
          let filterUserId: string | null = null;
          let filterIds: string[] = [];
          const b: any = {};
          b.select = vi.fn(() => b);
          b.eq = vi.fn((col: string, val: any) => {
            if (col === 'user_id') filterUserId = val;
            return b;
          });
          b.in = vi.fn((col: string, vals: string[]) => {
            if (col === 'id' || col === 'question_id') filterIds = vals;
            return b;
          });
          b.order = vi.fn(() => b);
          b.limit = vi.fn((n: number) => {
            const filtered = inMemoryAttempts.filter((a) => !filterUserId || a.user_id === filterUserId);
            return createFluentPostgrestMock(() => filtered.slice(0, n), filtered.length);
          });
          b.insert = vi.fn((record: any) => {
            const row = { id: record.id || `att-${Date.now()}-${Math.random()}`, ...record };
            inMemoryAttempts.push(row);
            return {
              select: vi.fn(() => ({
                single: vi.fn(async () => ({ data: row, error: null })),
              })),
            };
          });
          b.then = (resolve: any) => {
            let filtered = inMemoryAttempts.filter((a) => !filterUserId || a.user_id === filterUserId);
            if (filterIds.length > 0) {
              filtered = filtered.filter((a) => filterIds.includes(a.id) || filterIds.includes(a.question_id));
            }
            return Promise.resolve({ data: filtered, count: filtered.length, error: null }).then(resolve);
          };
          return b;
        }

        if (table === 'user_skill_progress') {
          let filterUser: string | null = null;
          let filterSkill: string | null = null;
          const b: any = {};
          b.select = vi.fn(() => b);
          b.eq = vi.fn((col: string, val: any) => {
            if (col === 'user_id') filterUser = val;
            if (col === 'skill') filterSkill = val;
            return b;
          });
          b.maybeSingle = vi.fn(async () => {
            const item = inMemorySkills.find((s) => s.user_id === filterUser && s.skill === filterSkill);
            return { data: item || null, error: null };
          });
          b.insert = vi.fn((record: any) => {
            inMemorySkills.push(record);
            return Promise.resolve({ data: record, error: null });
          });
          b.update = vi.fn((payload: any) => ({
            eq: vi.fn((col: string, val: any) => {
              if (col === 'id') {
                const idx = inMemorySkills.findIndex((s) => s.id === val);
                if (idx >= 0) inMemorySkills[idx] = { ...inMemorySkills[idx], ...payload };
              }
              return Promise.resolve({ data: payload, error: null });
            }),
          }));
          b.then = (resolve: any) => {
            const data = inMemorySkills.filter((s) => !filterUser || s.user_id === filterUser);
            return Promise.resolve({ data, count: data.length, error: null }).then(resolve);
          };
          return b;
        }

        if (table === 'user_weaknesses') {
          let filterUser: string | null = null;
          let filterTag: string | null = null;
          let offsetVal = 0;
          let limitVal = 20;

          const b: any = {};
          b.select = vi.fn(() => b);
          b.eq = vi.fn((col: string, val: any) => {
            if (col === 'user_id') filterUser = val;
            if (col === 'weakness_tag') filterTag = val;
            return b;
          });
          b.order = vi.fn(() => b);
          b.range = vi.fn((from: number, to: number) => {
            offsetVal = from;
            limitVal = to - from + 1;
            const userWeaknesses = inMemoryWeaknesses.filter((w) => !filterUser || w.user_id === filterUser);
            const slice = userWeaknesses.slice(offsetVal, offsetVal + limitVal);
            return Promise.resolve({ data: slice, count: userWeaknesses.length, error: null });
          });
          b.limit = vi.fn((n: number) => {
            limitVal = n;
            return b;
          });
          b.maybeSingle = vi.fn(async () => {
            const item = inMemoryWeaknesses.find((w) => w.user_id === filterUser && w.weakness_tag === filterTag);
            return { data: item || null, error: null };
          });
          b.insert = vi.fn((record: any) => {
            const row = { id: `w-${Date.now()}`, ...record };
            inMemoryWeaknesses.push(row);
            return Promise.resolve({ data: row, error: null });
          });
          b.update = vi.fn((payload: any) => ({
            eq: vi.fn((_col: string, val: any) => {
              const idx = inMemoryWeaknesses.findIndex((w) => w.id === val);
              if (idx >= 0) inMemoryWeaknesses[idx] = { ...inMemoryWeaknesses[idx], ...payload };
              return Promise.resolve({ data: payload, error: null });
            }),
          }));
          b.then = (resolve: any) => {
            const userWeaknesses = inMemoryWeaknesses.filter((w) => !filterUser || w.user_id === filterUser);
            return Promise.resolve({ data: userWeaknesses.slice(0, limitVal), count: userWeaknesses.length, error: null }).then(resolve);
          };
          return b;
        }

        if (table === 'user_vocabulary_mastery') {
          return {
            select: vi.fn(() => createFluentPostgrestMock(() => inMemoryVocabMastery, inMemoryVocabMastery.length)),
          };
        }

        if (table === 'user_mock_exam_attempts') {
          let filterUser: string | null = null;
          const b: any = {};
          b.select = vi.fn(() => b);
          b.eq = vi.fn((col: string, val: any) => {
            if (col === 'user_id') filterUser = val;
            return b;
          });
          b.in = vi.fn(() => b);
          b.order = vi.fn(() => b);
          b.limit = vi.fn((n: number) => {
            const filtered = inMemoryMockAttempts.filter((m) => !filterUser || m.user_id === filterUser);
            return createFluentPostgrestMock(() => filtered.slice(0, n), filtered.length);
          });
          b.then = (resolve: any) => {
            const filtered = inMemoryMockAttempts.filter((m) => !filterUser || m.user_id === filterUser);
            return Promise.resolve({ data: filtered, count: filtered.length, error: null }).then(resolve);
          };
          return b;
        }

        return createFluentPostgrestMock(() => []);
      }),
    })),
  };
});

// Helper for calling serverless handlers
async function invokeHandler(handler: any, req: { method: string; headers?: Record<string, string>; query?: Record<string, any>; body?: any }) {
  let statusCode = 200;
  let responseBody: any = null;
  const headers: Record<string, string> = {};

  const res: any = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((data: any) => {
      responseBody = data;
      return res;
    }),
    setHeader: vi.fn((k: string, v: string) => {
      headers[k.toLowerCase()] = v;
      return res;
    }),
  };

  const reqObj: any = {
    method: req.method,
    headers: req.headers || {},
    query: req.query || {},
    body: req.body || null,
  };

  await handler(reqObj, res);
  return { statusCode, body: responseBody, headers };
}

describe('Phase 4.7: Progress / Analytics / Guest Sync Test Suite', () => {
  beforeEach(() => {
    inMemoryProfile = {
      id: mockUserId,
      current_cefr_level: 'B1',
      target_exam: 'PET',
      estimated_cambridge_score: 135,
      streak_days: 3,
      daily_goal_minutes: 20,
      last_active_date: '2026-09-24',
      assessment_completed: true,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-24T10:00:00Z',
    };
    inMemoryAttempts = [];
    inMemorySkills = [
      { id: 'sk-1', user_id: mockUserId, skill: 'grammar', proficiency_score: 65, questions_completed: 10 },
      { id: 'sk-2', user_id: mockUserId, skill: 'vocabulary', proficiency_score: 70, questions_completed: 12 },
    ];
    inMemoryWeaknesses = [
      { id: 'w-1', user_id: mockUserId, weakness_tag: 'present_simple', error_count: 4, last_failed_at: '2026-09-24T11:00:00Z' },
      { id: 'w-2', user_id: mockUserId, weakness_tag: 'prepositions', error_count: 2, last_failed_at: '2026-09-23T10:00:00Z' },
      { id: 'w-other', user_id: mockOtherUserId, weakness_tag: 'reported_speech', error_count: 9, last_failed_at: '2026-09-24T09:00:00Z' },
    ];
    inMemoryVocabMastery = [];
    inMemoryMockAttempts = [
      {
        id: 'mock-att-1',
        user_id: mockUserId,
        mock_exam_id: 'exam-pet-1',
        raw_score: 25,
        total_marks: 30,
        percentage_score: 83.33,
        estimated_cefr_level: 'B1',
        estimated_cambridge_score: 142,
        status: 'submitted',
        submitted_at: '2026-09-24T15:00:00Z',
        mock_exams: { name: 'PET Preliminary Practice Exam 1', exam_code: 'PET' },
      },
    ];
  });

  // --------------------------------------------------------------------------
  // 1. Streak Engine Tests
  // --------------------------------------------------------------------------
  describe('1. Server-Authoritative Streak Engine', () => {
    it('should initialize streak to 1 for first-time activity', () => {
      const res = calculateNewStreak(0, null, new Date('2026-09-25T10:00:00Z'));
      expect(res.streak_days).toBe(1);
      expect(res.last_active_date).toBe('2026-09-25');
      expect(res.is_new_day).toBe(true);
    });

    it('should maintain streak when multiple activities occur on the same calendar day', () => {
      const res = calculateNewStreak(3, '2026-09-25', new Date('2026-09-25T14:30:00Z'));
      expect(res.streak_days).toBe(3);
      expect(res.last_active_date).toBe('2026-09-25');
      expect(res.is_new_day).toBe(false);
    });

    it('should increment streak by 1 on consecutive calendar day', () => {
      const res = calculateNewStreak(3, '2026-09-24', new Date('2026-09-25T08:00:00Z'));
      expect(res.streak_days).toBe(4);
      expect(res.last_active_date).toBe('2026-09-25');
      expect(res.is_new_day).toBe(true);
    });

    it('should reset streak to 1 after missing more than 1 calendar day', () => {
      const res = calculateNewStreak(7, '2026-09-20', new Date('2026-09-25T09:00:00Z'));
      expect(res.streak_days).toBe(1);
      expect(res.last_active_date).toBe('2026-09-25');
      expect(res.is_new_day).toBe(true);
    });

    it('should not downgrade streak or date when syncing older historical attempt', () => {
      const res = calculateNewStreak(5, '2026-09-24', new Date('2026-09-20T10:00:00Z'));
      expect(res.streak_days).toBe(5);
      expect(res.last_active_date).toBe('2026-09-24');
      expect(res.is_new_day).toBe(false);
    });

    it('should respect client timezone offset for local day boundary', () => {
      // 2026-09-24 23:00:00 UTC with Bangkok offset (-420 mins = UTC+7) is 2026-09-25 06:00:00 local
      const bangkokOffsetMinutes = -420;
      const res = calculateNewStreak(2, '2026-09-24', new Date('2026-09-24T23:00:00Z'), bangkokOffsetMinutes);
      expect(res.streak_days).toBe(3);
      expect(res.last_active_date).toBe('2026-09-25');
      expect(res.is_new_day).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Student Progress API (GET /api/user/progress)
  // --------------------------------------------------------------------------
  describe('2. Student Progress API (GET /api/user/progress)', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await invokeHandler(userProgressHandler, { method: 'GET' });
      expect(res.statusCode).toBe(401);
    });

    it('should aggregate profile, skills, mock exam summary, and recent activity', async () => {
      const res = await invokeHandler(userProgressHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // Profile verification
      expect(data.profile.current_cefr_level).toBe('B1');
      expect(data.profile.target_exam).toBe('PET');
      expect(data.profile.streak_days).toBe(3);
      expect(data.profile.is_official).toBe(false);

      // 6 Skills presence
      expect(data.skills.grammar.proficiency_score).toBe(65);
      expect(data.skills.vocabulary.proficiency_score).toBe(70);
      expect(data.skills.reading.proficiency_score).toBe(50);
      expect(data.skills.listening.proficiency_score).toBe(50);
      expect(data.skills.writing.proficiency_score).toBe(50);
      expect(data.skills.speaking.proficiency_score).toBe(50);

      // Mock Exam Summary
      expect(data.mock_exams).toBeDefined();
      expect(data.mock_exams.total_completed).toBe(1);
      expect(data.mock_exams.latest_score).toBe(83.33);

      // Non-official disclaimer
      expect(data.is_official).toBe(false);
      expect(data.disclaimer).toContain('not an official Cambridge English certificate');
    });
  });

  // --------------------------------------------------------------------------
  // 3. User Analytics API (GET /api/user/analytics)
  // --------------------------------------------------------------------------
  describe('3. User Analytics API (GET /api/user/analytics)', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await invokeHandler(userAnalyticsHandler, { method: 'GET' });
      expect(res.statusCode).toBe(401);
    });

    it('should return overview, 6-skill breakdown radar, weaknesses, and mock exam history', async () => {
      inMemoryAttempts = [
        {
          id: 'att-1',
          user_id: mockUserId,
          question_id: mockQuestionGrammar.id,
          is_correct: true,
          score_awarded: 1,
          evaluation_status: 'completed',
          context_type: 'practice',
          attempted_at: '2026-09-24T12:00:00Z',
          questions: { skill: 'grammar' },
        },
        {
          id: 'att-2',
          user_id: mockUserId,
          question_id: mockQuestionVocab.id,
          is_correct: false,
          score_awarded: 0,
          evaluation_status: 'completed',
          context_type: 'practice',
          attempted_at: '2026-09-24T13:00:00Z',
          questions: { skill: 'vocabulary' },
        },
        {
          id: 'att-3',
          user_id: mockUserId,
          question_id: mockQuestionWriting.id,
          is_correct: null,
          score_awarded: 0,
          evaluation_status: 'pending',
          context_type: 'practice',
          attempted_at: '2026-09-24T14:00:00Z',
          questions: { skill: 'writing' },
        },
      ];

      const res = await invokeHandler(userAnalyticsHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // Overview
      expect(data.overview.total_questions_attempted).toBe(3);
      expect(data.overview.total_questions_correct).toBe(1);
      expect(data.overview.overall_accuracy_percentage).toBe(50); // 1 correct out of 2 evaluated
      expect(data.overview.completed_mock_exams_count).toBe(1);
      expect(data.overview.streak_days).toBe(3);

      // Skills Breakdown (all 6 skills)
      expect(data.skills_breakdown.length).toBe(6);
      const grammarStat = data.skills_breakdown.find((s: any) => s.skill === 'grammar');
      expect(grammarStat.total_attempted).toBe(1);
      expect(grammarStat.total_correct).toBe(1);
      expect(grammarStat.accuracy_percentage).toBe(100);
      expect(grammarStat.current_level).toBe('B2'); // score 65 maps to B2

      const writingStat = data.skills_breakdown.find((s: any) => s.skill === 'writing');
      expect(writingStat.pending_evaluation_count).toBe(1);

      // Weaknesses Summary
      expect(data.weaknesses_summary.length).toBe(2);
      expect(data.weaknesses_summary[0].weakness_tag).toBe('present_simple');
      expect(data.weaknesses_summary[0].error_count).toBe(4);

      // Mock Exam History
      expect(data.mock_exam_history.length).toBe(1);
      expect(data.mock_exam_history[0].percentage_score).toBe(83.33);
      expect(data.mock_exam_history[0].exam_title).toBe('PET Preliminary Practice Exam 1');

      // Diagnostic summary & disclaimer
      expect(data.diagnostic_placement.assessment_completed).toBe(true);
      expect(data.is_official).toBe(false);
      expect(data.disclaimer).toContain('Platform analytics and score estimations are for learning practice only');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Weaknesses API (GET /api/user/weaknesses)
  // --------------------------------------------------------------------------
  describe('4. Weaknesses API (GET /api/user/weaknesses)', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await invokeHandler(userWeaknessesHandler, { method: 'GET' });
      expect(res.statusCode).toBe(401);
    });

    it('should strictly isolate weaknesses by authenticated user.id (BOLA prevention)', async () => {
      const res = await invokeHandler(userWeaknessesHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const weaknesses = res.body.data.weaknesses;

      // MockUserId has 2 weaknesses; mockOtherUserId has 1
      expect(weaknesses.length).toBe(2);
      expect(weaknesses.some((w: any) => w.weakness_tag === 'reported_speech')).toBe(false);
      expect(weaknesses[0].weakness_tag).toBe('present_simple');
      expect(weaknesses[0].error_count).toBe(4);
    });

    it('should support pagination via limit and offset parameters', async () => {
      const res = await invokeHandler(userWeaknessesHandler, {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
        query: { limit: '1', offset: '1' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.weaknesses.length).toBe(1);
      expect(res.body.data.weaknesses[0].weakness_tag).toBe('prepositions');
      expect(res.body.data.total).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Guest Progress Sync (POST /api/user/sync-guest)
  // --------------------------------------------------------------------------
  describe('5. Guest Progress Sync (POST /api/user/sync-guest)', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await invokeHandler(syncGuestHandler, {
        method: 'POST',
        body: { practice_attempts: [] },
      });
      expect(res.statusCode).toBe(401);
    });

    it('should handle empty practice attempts cleanly', async () => {
      const res = await invokeHandler(syncGuestHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { practice_attempts: [] },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.synced_count).toBe(0);
      expect(res.body.data.skipped_duplicate_count).toBe(0);
      expect(res.body.data.is_official).toBe(false);
    });

    it('should evaluate answers server-authoritatively and reject spoofed scores/status', async () => {
      const clientAttemptId = '33333333-3333-4333-a333-333333333333';
      const res = await invokeHandler(syncGuestHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          practice_attempts: [
            {
              client_attempt_id: clientAttemptId,
              question_id: mockQuestionGrammar.id,
              selected_option_key: 'B', // Correct option is 'B'
              time_spent_seconds: 15,
              attempted_at: '2026-09-25T09:00:00Z',
              // Attacker attempts to spoof incorrect flag or extra points
              is_correct: false,
              score_awarded: 9999,
              user_id: mockOtherUserId,
            },
            {
              question_id: mockQuestionVocab.id,
              text_answer: 'wrong_word', // Correct answer is 'author'
              time_spent_seconds: 20,
              attempted_at: '2026-09-25T09:05:00Z',
              is_correct: true, // Attacker attempts to spoof correct
            },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.synced_count).toBe(2);
      expect(res.body.data.skipped_duplicate_count).toBe(0);

      // Verify attempts saved in database with server-evaluated correctness
      const grammarAttempt = inMemoryAttempts.find((a) => a.question_id === mockQuestionGrammar.id);
      expect(grammarAttempt).toBeDefined();
      expect(grammarAttempt.user_id).toBe(mockUserId); // Must NOT be mockOtherUserId
      expect(grammarAttempt.is_correct).toBe(true); // Server confirmed correct
      expect(grammarAttempt.score_awarded).toBe(1); // Difficulty weight = 1, NOT 9999

      const vocabAttempt = inMemoryAttempts.find((a) => a.question_id === mockQuestionVocab.id);
      expect(vocabAttempt).toBeDefined();
      expect(vocabAttempt.is_correct).toBe(false); // Server confirmed false despite client claim

      // Verify weakness was recorded for incorrect vocabulary attempt
      const vocabWeakness = inMemoryWeaknesses.find((w) => w.weakness_tag === 'occupations_vocabulary');
      expect(vocabWeakness).toBeDefined();
      expect(vocabWeakness.error_count).toBe(1);

      // Verify streak incremented to 4 (yesterday was 2026-09-24 with streak 3)
      expect(res.body.data.streak.streak_days).toBe(4);
      expect(res.body.data.streak.last_active_date).toBe('2026-09-25');
    });

    it('should be completely idempotent when client retries sync with identical attempt IDs', async () => {
      const stableAttemptId = '44444444-4444-4444-a444-444444444444';
      const payload = {
        practice_attempts: [
          {
            client_attempt_id: stableAttemptId,
            question_id: mockQuestionGrammar.id,
            selected_option_key: 'B',
            attempted_at: '2026-09-25T11:00:00Z',
          },
        ],
      };

      // First sync
      const firstRes = await invokeHandler(syncGuestHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: payload,
      });

      expect(firstRes.statusCode).toBe(200);
      expect(firstRes.body.data.synced_count).toBe(1);
      expect(firstRes.body.data.skipped_duplicate_count).toBe(0);

      // Second sync (identical payload)
      const secondRes = await invokeHandler(syncGuestHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: payload,
      });

      expect(secondRes.statusCode).toBe(200);
      expect(secondRes.body.data.synced_count).toBe(0);
      expect(secondRes.body.data.skipped_duplicate_count).toBe(1);

      // Total attempts in database should not have duplicated
      const matchingAttempts = inMemoryAttempts.filter((a) => a.id === stableAttemptId);
      expect(matchingAttempts.length).toBe(1);
    });

    it('should correctly set evaluation_status to pending for subjective questions', async () => {
      const res = await invokeHandler(syncGuestHandler, {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: {
          practice_attempts: [
            {
              question_id: mockQuestionWriting.id,
              text_answer: 'The book was written by an author.',
              attempted_at: '2026-09-25T12:00:00Z',
            },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.synced_count).toBe(1);

      const writingAttempt = inMemoryAttempts.find((a) => a.question_id === mockQuestionWriting.id);
      expect(writingAttempt).toBeDefined();
      expect(writingAttempt.evaluation_status).toBe('pending');
      expect(writingAttempt.is_correct).toBeNull();
      expect(writingAttempt.score_awarded).toBe(0);
    });
  });
});
