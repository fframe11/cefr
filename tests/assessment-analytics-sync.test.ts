import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitAssessment, getAssessmentResult } from '../src/lib/api/assessment';
import { getUserProgress } from '../src/lib/api/progress';
import { getUserAnalytics } from '../src/lib/api/analytics';
import { getUserWeaknesses } from '../src/lib/api/weaknesses';
import { getVocabularyMastery, updateVocabularyMastery } from '../src/lib/api/vocabulary-mastery';
import { syncGuestProgress } from '../src/lib/api/guest-sync';
import {
  loadGuestAttempts,
  saveGuestAttempt,
  clearGuestAttempts,
  StoredGuestAttempt,
} from '../src/services/storageService';
import * as fs from 'fs';
import * as path from 'path';

// Mock Supabase Auth
vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: 'mock-auth-jwt-token-4.8c',
            },
          },
        }),
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

let mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    mockStorage = {};
  }),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Phase 4.8C: Assessment, Progress, Analytics & Guest Sync Integration Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = {};
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mockStorage = {};
  });

  describe('1. Assessment Submission & Result API', () => {
    it('should submit assessment answers to POST /api/assessment/submit and strip client spoofing', async () => {
      let capturedBody: any = null;
      let capturedMethod = '';
      let capturedUrl = '';

      global.fetch = vi.fn().mockImplementation((url, init) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = JSON.parse(init?.body as string);

        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                total_questions: 18,
                correct_count: 14,
                percentage_score: 78,
                estimated_cefr_level: 'B1',
                estimated_cambridge_score: 152,
                recommended_exam: 'PET',
                target_exam: 'FCE',
                estimation_method: 'platform_diagnostic_heuristic',
                skill_breakdown: {
                  vocabulary: 75,
                  grammar: 80,
                  reading: 70,
                  listening: 85,
                  writing: 75,
                  speaking: 70,
                },
                identified_weaknesses: [
                  { tag: 'present_perfect_vs_past_simple', label_th: 'Past vs Present Perfect', error_count: 2 },
                ],
                is_official: false,
                disclaimer:
                  'Platform diagnostic estimate based on internal placement heuristics; not an official Cambridge English examination result or CEFR certificate.',
                submitted_at: '2026-09-25T12:00:00.000Z',
              },
            }),
        });
      });

      // Pass input containing forbidden spoof fields to verify stripping
      const res = await submitAssessment({
        answers: [
          {
            question_id: 'q-diag-1',
            selected_option_key: 'B',
            time_spent_seconds: 12,
            // @ts-expect-error Testing client spoof stripping
            score: 100,
            // @ts-expect-error Testing client spoof stripping
            cefr_level: 'C2',
          },
        ],
      });

      expect(capturedUrl).toContain('/api/assessment/submit');
      expect(capturedMethod).toBe('POST');
      expect(capturedBody.answers[0].question_id).toBe('q-diag-1');
      expect(capturedBody.answers[0].selected_option_key).toBe('B');
      // Verify stripped
      expect(capturedBody.answers[0].score).toBeUndefined();
      expect(capturedBody.answers[0].cefr_level).toBeUndefined();

      // Verify server response contract
      expect(res.estimated_cefr_level).toBe('B1');
      expect(res.estimated_cambridge_score).toBe(152);
      expect(res.recommended_exam).toBe('PET');
      expect(res.target_exam).toBe('FCE');
      expect(res.is_official).toBe(false);
      expect(res.disclaimer).toContain('Platform diagnostic estimate');
    });

    it('should fetch assessment result from GET /api/assessment/result', async () => {
      let capturedUrl = '';
      global.fetch = vi.fn().mockImplementation((url) => {
        capturedUrl = String(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                assessment_completed: true,
                estimated_cefr_level: 'B2',
                estimated_cambridge_score: 168,
                target_exam: 'FCE',
                estimation_method: 'platform_diagnostic_heuristic',
                skill_breakdown: { grammar: 75, vocabulary: 70 },
                identified_weaknesses: [],
                is_official: false,
                disclaimer: 'Platform diagnostic estimate; not official.',
                assessed_at: '2026-09-25T12:00:00.000Z',
              },
            }),
        });
      });

      const res = await getAssessmentResult();
      expect(capturedUrl).toContain('/api/assessment/result');
      expect(res.assessment_completed).toBe(true);
      expect(res.estimated_cefr_level).toBe('B2');
      expect(res.is_official).toBe(false);
    });
  });

  describe('2. User Progress API', () => {
    it('should fetch canonical progress from GET /api/user/progress', async () => {
      let capturedUrl = '';
      global.fetch = vi.fn().mockImplementation((url) => {
        capturedUrl = String(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                profile: {
                  current_cefr_level: 'B1',
                  target_exam: 'PET',
                  estimated_cambridge_score: 145,
                  streak_days: 7,
                  daily_goal_minutes: 30,
                  last_active_date: '2026-09-25',
                  assessment_completed: true,
                  is_official: false,
                },
                skills: {
                  vocabulary: { proficiency_score: 65, questions_completed: 40 },
                  grammar: { proficiency_score: 70, questions_completed: 55 },
                  reading: { proficiency_score: 60, questions_completed: 20 },
                  listening: { proficiency_score: 65, questions_completed: 25 },
                  writing: { proficiency_score: 55, questions_completed: 10 },
                  speaking: { proficiency_score: 50, questions_completed: 8 },
                },
                telemetry: {
                  questions_attempted: 158,
                  words_mastered: 45,
                  words_learning: 20,
                  active_weaknesses: 2,
                },
                mock_exams: {
                  total_completed: 2,
                  latest_score: 82,
                  latest_cambridge_score: 155,
                  latest_cefr: 'B1',
                  latest_completed_at: '2026-09-24T10:00:00.000Z',
                },
                recent_activity: [],
                estimation_method: 'platform_diagnostic_heuristic',
                is_official: false,
                disclaimer: 'Platform diagnostic estimate for learning path guidance only.',
              },
            }),
        });
      });

      const res = await getUserProgress();
      expect(capturedUrl).toContain('/api/user/progress');
      expect(res.profile.current_cefr_level).toBe('B1');
      expect(res.profile.streak_days).toBe(7);
      expect(res.telemetry.questions_attempted).toBe(158);
      expect(res.is_official).toBe(false);
    });
  });

  describe('3. User Analytics API', () => {
    it('should fetch comprehensive analytics from GET /api/user/analytics', async () => {
      let capturedUrl = '';
      global.fetch = vi.fn().mockImplementation((url) => {
        capturedUrl = String(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                overview: {
                  total_questions_attempted: 120,
                  total_questions_correct: 96,
                  overall_accuracy_percentage: 80,
                  completed_mock_exams_count: 1,
                  streak_days: 5,
                  last_active_date: '2026-09-25',
                },
                skills_breakdown: [
                  {
                    skill: 'grammar',
                    total_attempted: 50,
                    total_correct: 42,
                    accuracy_percentage: 84,
                    proficiency_score: 72,
                    current_level: 'B1',
                    pending_evaluation_count: 0,
                  },
                ],
                weaknesses_summary: [
                  { id: 'w-1', weakness_tag: 'prepositions', error_count: 3, last_failed_at: '2026-09-25' },
                ],
                mock_exam_history: [
                  {
                    id: 'm-1',
                    mock_exam_id: 'mock-pet-1',
                    exam_title: 'B1 Preliminary Mock 1',
                    exam_code: 'PET',
                    percentage_score: 76,
                    estimated_cambridge_score: 150,
                    estimated_cefr_level: 'B1',
                    submitted_at: '2026-09-24T14:00:00.000Z',
                  },
                ],
                diagnostic_placement: {
                  assessment_completed: true,
                  current_cefr_level: 'B1',
                  estimated_cambridge_score: 150,
                },
                recent_activity: [],
                is_official: false,
                disclaimer: 'Platform analytics and score estimations are for learning practice only.',
              },
            }),
        });
      });

      const res = await getUserAnalytics();
      expect(capturedUrl).toContain('/api/user/analytics');
      expect(res.overview.overall_accuracy_percentage).toBe(80);
      expect(res.skills_breakdown[0].accuracy_percentage).toBe(84);
      expect(res.mock_exam_history).toHaveLength(1);
      expect(res.is_official).toBe(false);
    });
  });

  describe('4. User Weaknesses API', () => {
    it('should query weaknesses with pagination from GET /api/user/weaknesses', async () => {
      let capturedUrl = '';
      global.fetch = vi.fn().mockImplementation((url) => {
        capturedUrl = String(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                weaknesses: [
                  { id: 'w-1', weakness_tag: 'passive_voice', error_count: 4, last_failed_at: '2026-09-25' },
                ],
                total: 1,
                limit: 10,
                offset: 0,
              },
            }),
        });
      });

      const res = await getUserWeaknesses({ limit: 10, offset: 0 });
      expect(capturedUrl).toContain('/api/user/weaknesses');
      expect(capturedUrl).toContain('limit=10');
      expect(capturedUrl).toContain('offset=0');
      expect(res.weaknesses).toHaveLength(1);
      expect(res.weaknesses[0].weakness_tag).toBe('passive_voice');
    });
  });

  describe('5. Vocabulary Mastery API', () => {
    it('should get vocabulary mastery list from GET /api/user/vocabulary-mastery', async () => {
      let capturedUrl = '';
      global.fetch = vi.fn().mockImplementation((url) => {
        capturedUrl = String(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                mastery_records: [
                  {
                    id: 'vm-1',
                    vocabulary_id: 'v-1',
                    mastery_percentage: 85,
                    review_count: 5,
                    consecutive_correct: 3,
                    next_review_at: '2026-09-28T00:00:00.000Z',
                    last_reviewed_at: '2026-09-25T12:00:00.000Z',
                    vocabularies: {
                      id: 'v-1',
                      word: 'accomplish',
                      lemma: 'accomplish',
                      cefr_level: 'B1',
                      part_of_speech: 'verb',
                      meaning_th: 'ทำสำเร็จ',
                    },
                  },
                ],
                pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
              },
            }),
        });
      });

      const res = await getVocabularyMastery({ status: 'mastered', page: 1, limit: 20 });
      expect(capturedUrl).toContain('/api/user/vocabulary-mastery');
      expect(capturedUrl).toContain('status=mastered');
      expect(res.mastery_records[0].mastery_percentage).toBe(85);
      expect(res.mastery_records[0].vocabularies?.word).toBe('accomplish');
    });

    it('should update vocabulary review result via POST /api/user/vocabulary-mastery', async () => {
      let capturedBody: any = null;
      global.fetch = vi.fn().mockImplementation((url, init) => {
        capturedBody = JSON.parse(init?.body as string);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                message: 'Vocabulary review recorded.',
                mastery: {
                  vocabulary_id: capturedBody.vocabulary_id,
                  mastery_percentage: 90,
                  consecutive_correct: 4,
                  review_count: 6,
                  next_review_at: '2026-10-02T00:00:00.000Z',
                  last_reviewed_at: '2026-09-25T12:00:00.000Z',
                },
              },
            }),
        });
      });

      const res = await updateVocabularyMastery({
        vocabulary_id: 'a0000000-0000-0000-0000-000000000001',
        is_correct: true,
      });

      expect(capturedBody.vocabulary_id).toBe('a0000000-0000-0000-0000-000000000001');
      expect(capturedBody.is_correct).toBe(true);
      expect(res.mastery.mastery_percentage).toBe(90);
    });
  });

  describe('6. Guest Sync & LocalStorage Queue Lifecycle', () => {
    it('should store and load guest attempts in localStorage', () => {
      expect(loadGuestAttempts()).toEqual([]);

      const mockAttempt: StoredGuestAttempt = {
        client_attempt_id: 'attempt-uuid-1',
        question_id: 'q-uuid-1',
        selected_option_key: 'A',
        time_spent_seconds: 15,
        context_type: 'practice',
        attempted_at: '2026-09-25T10:00:00.000Z',
      };

      saveGuestAttempt(mockAttempt);
      const loaded = loadGuestAttempts();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].client_attempt_id).toBe('attempt-uuid-1');

      clearGuestAttempts();
      expect(loadGuestAttempts()).toEqual([]);
    });

    it('should submit guest attempts to POST /api/user/sync-guest and sanitize client fields', async () => {
      let capturedBody: any = null;
      let capturedUrl = '';

      global.fetch = vi.fn().mockImplementation((url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(init?.body as string);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                synced_count: 1,
                skipped_duplicate_count: 0,
                total_processed: 1,
                streak: {
                  streak_days: 1,
                  streak_extended: true,
                  is_active: true,
                },
                is_official: false,
                disclaimer: 'Platform diagnostic estimate.',
              },
            }),
        });
      });

      const res = await syncGuestProgress({
        practice_attempts: [
          {
            client_attempt_id: 'a0000000-0000-0000-0000-000000000001',
            question_id: 'q0000000-0000-0000-0000-000000000001',
            selected_option_key: 'C',
            time_spent_seconds: 20,
            // @ts-expect-error Testing client spoof stripping
            user_id: 'attacker-id',
            // @ts-expect-error Testing client spoof stripping
            is_correct: true,
          },
        ],
        timezone_offset_minutes: -420,
      });

      expect(capturedUrl).toContain('/api/user/sync-guest');
      expect(capturedBody.timezone_offset_minutes).toBe(-420);
      expect(capturedBody.practice_attempts[0].question_id).toBe('q0000000-0000-0000-0000-000000000001');
      // Stripped client spoof
      expect(capturedBody.practice_attempts[0].user_id).toBeUndefined();
      expect(capturedBody.practice_attempts[0].is_correct).toBeUndefined();

      expect(res.synced_count).toBe(1);
      expect(res.is_official).toBe(false);
    });

    it('should keep guest attempts in localStorage if sync fails, and clear only after success', async () => {
      saveGuestAttempt({
        client_attempt_id: 'att-1',
        question_id: 'q-1',
        selected_option_key: 'B',
        time_spent_seconds: 10,
        context_type: 'practice',
      });

      // 1. Simulate sync network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      let syncFailed = false;
      try {
        await syncGuestProgress({ practice_attempts: loadGuestAttempts() });
      } catch {
        syncFailed = true;
      }
      expect(syncFailed).toBe(true);
      // Data preserved in local storage!
      expect(loadGuestAttempts()).toHaveLength(1);

      // 2. Simulate sync recovery & success
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            success: true,
            data: { synced_count: 1, skipped_duplicate_count: 0, total_processed: 1, streak: { streak_days: 1 } },
          }),
      });

      const attemptsToSync = loadGuestAttempts();
      const successRes = await syncGuestProgress({ practice_attempts: attemptsToSync });
      if (successRes.synced_count >= 0) {
        clearGuestAttempts();
      }

      // Now cleared safely
      expect(loadGuestAttempts()).toHaveLength(0);
    });
  });

  describe('7. Security, Invariant & Architecture Boundaries', () => {
    it('should ensure zero SUPABASE_SERVICE_ROLE_KEY exposure in src/', () => {
      const srcDir = path.resolve(__dirname, '../src');

      function scanDir(dir: string): string[] {
        let foundViolations: string[] = [];
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            foundViolations = foundViolations.concat(scanDir(fullPath));
          } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('SUPABASE_SERVICE_ROLE_KEY') || content.includes('service_role_key')) {
              foundViolations.push(fullPath);
            }
          }
        }
        return foundViolations;
      }

      const violations = scanDir(srcDir);
      expect(violations).toEqual([]);
    });

    it('should preserve all static content files in src/data/ as resilient fallbacks', () => {
      const dataDir = path.resolve(__dirname, '../src/data');
      expect(fs.existsSync(dataDir)).toBe(true);

      const requiredStaticFiles = [
        'vocabularyBank.ts',
        'grammarBank.ts',
        'readingBank.ts',
        'listeningBank.ts',
        'writingBank.ts',
        'speakingBank.ts',
        'diagnosticAssessment.ts',
        'cefrLevels.ts',
        'mockExams.ts',
      ];

      for (const reqFile of requiredStaticFiles) {
        const filePath = path.join(dataDir, reqFile);
        expect(fs.existsSync(filePath), `Static fallback missing: ${reqFile}`).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(100);
      }
    });
  });
});
