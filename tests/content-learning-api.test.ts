import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getVocabulary, mapVocabularyDtoToWord, VocabularyItemDTO } from '../src/lib/api/content/vocabulary';
import { getGrammarTopics, mapGrammarDtoToTopic, GrammarTopicDTO } from '../src/lib/api/content/grammar';
import { getReadingPassages, mapReadingDtoToPassage, ReadingPassageDTO } from '../src/lib/api/content/reading';
import { getListeningExercises, mapListeningDtoToExercise, ListeningExerciseDTO } from '../src/lib/api/content/listening';
import { getWritingPrompts, mapWritingDtoToPrompt, WritingPromptDTO } from '../src/lib/api/content/writing';
import { getSpeakingPrompts, mapSpeakingDtoToPrompt, SpeakingPromptDTO } from '../src/lib/api/content/speaking';
import { getQuestions, getQuestionById, mapQuestionDtoToQuestion, SanitizedQuestionDTO } from '../src/lib/api/questions';
import { submitPracticeAnswer } from '../src/lib/api/practice';
import { ApiError } from '../src/lib/api/types';
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
              access_token: 'mock-auth-jwt-token-4.8b',
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

describe('Phase 4.8B: Content & Learning API Integration Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Vocabulary Content API & Adapter', () => {
    it('should call GET /api/content/vocabulary with query parameters', async () => {
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
                items: [
                  {
                    id: 'vocab-1',
                    word: 'accomplish',
                    lemma: 'accomplish',
                    cefr_level: 'B2',
                    part_of_speech: 'verb',
                    ipa: '/əˈkʌm.plɪʃ/',
                    meaning_th: 'ทำสำเร็จ',
                    meaning_en: 'to succeed in doing something',
                    example_sentence_en: 'She accomplished her goal.',
                    example_sentence_th: 'เธอทำตามเป้าหมายของเธอสำเร็จ',
                    topic: 'Success',
                    synonyms: ['achieve'],
                    antonyms: ['fail'],
                  },
                ],
                pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
              },
            }),
        });
      });

      const res = await getVocabulary({ cefr_level: 'B2', search: 'accomplish', page: 1, limit: 10 });
      expect(capturedUrl).toContain('/api/content/vocabulary');
      expect(capturedUrl).toContain('cefr_level=B2');
      expect(capturedUrl).toContain('search=accomplish');
      expect(capturedUrl).toContain('page=1');
      expect(capturedUrl).toContain('limit=10');
      expect(res.items.length).toBe(1);
      expect(res.items[0].word).toBe('accomplish');
    });

    it('should map VocabularyItemDTO to frontend VocabularyWord correctly', () => {
      const dto: VocabularyItemDTO = {
        id: 'v-101',
        word: 'diligent',
        lemma: 'diligent',
        cefr_level: 'B2',
        part_of_speech: 'adjective',
        ipa: '/ˈdɪl.ɪ.dʒənt/',
        meaning_th: 'ขยันหมั่นเพียร',
        meaning_en: 'hardworking',
        example_sentence_en: 'He is a diligent student.',
        example_sentence_th: 'เขาเป็นนักเรียนที่ขยัน',
        topic: 'Personality',
        synonyms: ['industrious'],
        antonyms: ['lazy'],
      };

      const word = mapVocabularyDtoToWord(dto, ['v-101']);
      expect(word.id).toBe('v-101');
      expect(word.cefrLevel).toBe('B2');
      expect(word.partOfSpeech).toBe('adjective');
      expect(word.masteryPercentage).toBe(100);
      expect(word.synonyms).toEqual(['industrious']);
    });
  });

  describe('2. Grammar Content API & Adapter', () => {
    it('should call GET /api/content/grammar with CEFR level', async () => {
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
                topics: [
                  {
                    id: 'gram-1',
                    slug: 'present-perfect',
                    title_en: 'Present Perfect Tense',
                    title_th: 'Present Perfect Tense',
                    cefr_level: 'B1',
                    summary_th: 'ใช้บอกเหตุการณ์ที่เกิดขึ้นในอดีตและยังส่งผลถึงปัจจุบัน',
                    concept_th: 'S + have/has + V.3',
                    concept_en: 'Subject + have/has + Past Participle',
                    rules: [{ formula: 'S + have/has + V.3', explanationTh: 'โครงสร้างหลัก', exampleEn: 'I have seen it.', exampleTh: 'ฉันเคยเห็นมันแล้ว' }],
                    common_mistakes: [{ incorrect: 'I have saw it.', correct: 'I have seen it.', reasonTh: 'ต้องใช้กริยาช่อง 3' }],
                  },
                ],
                pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
              },
            }),
        });
      });

      const res = await getGrammarTopics({ cefr_level: 'B1' });
      expect(capturedUrl).toContain('/api/content/grammar?cefr_level=B1');
      expect(res.topics.length).toBe(1);
      expect(res.topics[0].slug).toBe('present-perfect');
    });

    it('should map GrammarTopicDTO to frontend GrammarTopic with empty questions initially', () => {
      const dto: GrammarTopicDTO = {
        id: 'g-201',
        slug: 'conditionals',
        title_en: 'First Conditional',
        title_th: 'เงื่อนไขแบบที่ 1',
        cefr_level: 'B1',
        summary_th: 'สิ่งที่มีโอกาสเป็นไปได้จริง',
        concept_th: 'If + Present Simple, will + V.inf',
        concept_en: 'Real conditional in future',
        rules: [],
        common_mistakes: [],
      };

      const topic = mapGrammarDtoToTopic(dto);
      expect(topic.id).toBe('g-201');
      expect(topic.titleEn).toBe('First Conditional');
      expect(topic.practiceQuestions).toEqual([]);
    });
  });

  describe('3. Reading Content API & Adapter', () => {
    it('should call GET /api/content/reading with target_exam and topic', async () => {
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
                passages: [
                  {
                    id: 'read-1',
                    title: 'The Future of Renewable Energy',
                    cefr_level: 'B2',
                    target_exam: 'FCE',
                    topic: 'Environment',
                    content: 'Solar energy is becoming increasingly cost-effective worldwide...',
                    word_count: 250,
                    vocabulary_glossary: [{ word: 'renewable', meaningTh: 'หมุนเวียน' }],
                  },
                ],
                pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
              },
            }),
        });
      });

      const res = await getReadingPassages({ target_exam: 'FCE', topic: 'Environment' });
      expect(capturedUrl).toContain('/api/content/reading');
      expect(capturedUrl).toContain('target_exam=FCE');
      expect(capturedUrl).toContain('topic=Environment');
      expect(res.passages.length).toBe(1);
    });

    it('should map ReadingPassageDTO to frontend ReadingPassage model', () => {
      const dto: ReadingPassageDTO = {
        id: 'r-301',
        title: 'Deep Sea Exploration',
        cefr_level: 'C1',
        target_exam: 'CAE',
        topic: 'Science',
        content: 'The benthic zone remains one of the least mapped frontiers on Earth.',
        word_count: 310,
        vocabulary_glossary: [{ word: 'benthic', meaningTh: 'ใต้ก้นทะเลลึก' }],
      };

      const passage = mapReadingDtoToPassage(dto);
      expect(passage.id).toBe('r-301');
      expect(passage.targetExam).toBe('CAE');
      expect(passage.vocabularyGlossary.length).toBe(1);
    });
  });

  describe('4. Listening Content API & Audio Path Integrity', () => {
    it('should call GET /api/content/listening with CEFR and target_exam', async () => {
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
                exercises: [
                  {
                    id: 'listen-1',
                    title: 'Airport Announcements',
                    cefr_level: 'A2',
                    target_exam: 'KET',
                    speaker_accents: 'British English',
                    audio_storage_path: 'https://storage.supabase.co/audio/ket-1.mp3',
                    speed_options: [0.8, 1.0, 1.2],
                    audio_script: 'Attention passengers on flight BA 123...',
                  },
                ],
                pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
              },
            }),
        });
      });

      const res = await getListeningExercises({ cefr_level: 'A2', target_exam: 'KET' });
      expect(capturedUrl).toContain('/api/content/listening');
      expect(capturedUrl).toContain('cefr_level=A2');
      expect(capturedUrl).toContain('target_exam=KET');
      expect(res.exercises[0].audio_storage_path).toBe('https://storage.supabase.co/audio/ket-1.mp3');
    });

    it('should map ListeningExerciseDTO and handle null audio_storage_path gracefully', () => {
      const dto: ListeningExerciseDTO = {
        id: 'l-401',
        title: 'Interview with an Architect',
        cefr_level: 'B2',
        target_exam: 'FCE',
        speaker_accents: 'Australian',
        audio_storage_path: null,
        audio_script: 'Welcome to our weekly architecture podcast...',
      };

      const exercise = mapListeningDtoToExercise(dto);
      expect(exercise.id).toBe('l-401');
      expect(exercise.audioUrl).toBeUndefined();
      expect(exercise.speakerAccents).toBe('Australian');
    });
  });

  describe('5. Writing & Speaking Security: Model Answer Stripping', () => {
    it('should call GET /api/content/writing and verify sample_model_answer is stripped from content list', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            success: true,
            data: {
              prompts: [
                {
                  id: 'w-1',
                  title: 'Formal Letter of Complaint',
                  cefr_level: 'B2',
                  target_exam: 'FCE',
                  task_type: 'Essay',
                  prompt_th: 'เขียนจดหมายร้องเรียน',
                  prompt_en: 'Write a letter to the store manager...',
                  min_words: 140,
                  max_words: 190,
                  guidelines_th: ['ใช้ภาษาทางการ'],
                  useful_phrases: [{ phrase: 'I am writing to express my dissatisfaction', meaningTh: 'ฉันเขียนมาเพื่อแสดงความไม่พอใจ' }],
                  rubrics: [{ criterion: 'Content', descriptionTh: 'เนื้อหาครบถ้วน', maxScore: 5 }],
                  // sample_model_answer is intentionally absent from API response
                },
              ],
              pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
            },
          }),
      });

      const res = await getWritingPrompts({ task_type: 'Essay' });
      expect(res.prompts.length).toBe(1);
      const prompt = mapWritingDtoToPrompt(res.prompts[0]);
      // Security invariant: frontend does not hold pre-submission model answer
      expect(prompt.sampleModelAnswer).toBe('');
    });

    it('should call GET /api/content/speaking and verify model_answer is stripped from content list', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            success: true,
            data: {
              prompts: [
                {
                  id: 's-1',
                  title: 'Describing a Memorable Holiday',
                  cefr_level: 'B1',
                  target_exam: 'PET',
                  part: 2,
                  prompt_th: 'อธิบายวันหยุดที่น่าจดจำ',
                  prompt_en: 'Describe a holiday you remember well...',
                  guiding_questions_th: ['คุณไปที่ไหน?'],
                  target_phrases: ['It was an unforgettable trip'],
                },
              ],
              pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
            },
          }),
      });

      const res = await getSpeakingPrompts({ part: 2 });
      expect(res.prompts.length).toBe(1);
      const prompt = mapSpeakingDtoToPrompt(res.prompts[0]);
      // Security invariant: frontend does not hold pre-submission model answer
      expect(prompt.modelAnswer).toBe('');
    });
  });

  describe('6. Questions API & Practice Submission Grading Isolation', () => {
    it('should call GET /api/questions and verify all answer keys/correct indicators are stripped', async () => {
      const sanitizedQuestion: SanitizedQuestionDTO = {
        id: 'q-999',
        skill: 'grammar',
        cefrLevel: 'B2',
        questionType: 'multiple_choice',
        prompt_th: 'เลือกคำตอบที่ถูกต้อง',
        prompt_en: 'By next year, they _____ the new bridge.',
        contextPassage: null,
        audioStoragePath: null,
        difficultyWeight: 2,
        weaknessTag: 'future_perfect',
        options: [
          { id: 'opt-1', key: 'A', text: 'will finish' },
          { id: 'opt-2', key: 'B', text: 'will have finished' },
          { id: 'opt-3', key: 'C', text: 'finish' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            success: true,
            data: {
              questions: [sanitizedQuestion],
              pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
            },
          }),
      });

      const res = await getQuestions({ skill: 'grammar', cefr: 'B2' });
      expect(res.questions.length).toBe(1);

      const q = mapQuestionDtoToQuestion(res.questions[0]);
      expect(q.id).toBe('q-999');
      // Verify no choice has isCorrect = true before submission
      expect(q.options?.every((opt) => opt.isCorrect === false)).toBe(true);
      expect(q.explanationTh).toBe('');
    });

    it('should call POST /api/practice/submit and transmit only student answer without server claims', async () => {
      let sentBody: any;
      global.fetch = vi.fn().mockImplementation((url, init) => {
        sentBody = JSON.parse(init?.body as string);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                result: {
                  attempt_id: 'att-1234',
                  question_id: 'q-999',
                  is_correct: true,
                  score_awarded: 2,
                  evaluation_status: 'completed',
                  correct_option_key: 'B',
                  correct_answer_text: null,
                  explanation_en: 'Future Perfect is used for actions completed before a future time.',
                  explanation_th: 'ใช้ Future Perfect กับเหตุการณ์ที่จะเสร็จสิ้นก่อนจุดเวลาในอนาคต',
                  feedback_th: 'ถูกต้อง! will have finished เป็น Future Perfect',
                  attempted_at: '2026-09-25T12:00:00Z',
                },
              },
            }),
        });
      });

      const res = await submitPracticeAnswer({
        question_id: 'q-999',
        selected_option_key: 'B',
        time_spent_seconds: 15,
      });

      expect(res.result.is_correct).toBe(true);
      expect(res.result.score_awarded).toBe(2);
      expect(res.result.correct_option_key).toBe('B');

      // Check payload sent to server: no user_id, no is_correct spoofing
      expect(sentBody).toEqual({
        question_id: 'q-999',
        selected_option_key: 'B',
        time_spent_seconds: 15,
        context_type: 'practice',
      });
      expect(sentBody.user_id).toBeUndefined();
      expect(sentBody.is_correct).toBeUndefined();
      expect(sentBody.score_awarded).toBeUndefined();
    });
  });

  describe('7. Bundle Security Audit: No Leaked Secrets in src/', () => {
    it('should verify src/ has zero SUPABASE_SERVICE_ROLE_KEY or database credentials', () => {
      const srcDir = path.resolve(__dirname, '../src');

      function scanDir(dir: string): string[] {
        const findings: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findings.push(...scanDir(fullPath));
          } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('SUPABASE_SERVICE_ROLE_KEY') || content.includes('service_role')) {
              findings.push(`${fullPath}: contains service role references`);
            }
          }
        }
        return findings;
      }

      const leaks = scanDir(srcDir);
      expect(leaks).toEqual([]);
    });
  });
});
