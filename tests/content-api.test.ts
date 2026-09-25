import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

const mockVocabularyId1 = '99999999-9999-4999-a999-999999999991';
const mockVocabularyId2 = '99999999-9999-4999-a999-999999999992';
const mockGrammarTopicId = '44444444-4444-4444-a444-444444444444';
const mockReadingPassageId = '55555555-5555-4555-a555-555555555555';
const mockListeningExerciseId = '66666666-6666-4666-a666-666666666666';
const mockWritingPromptId = '77777777-7777-4777-a777-777777777777';
const mockSpeakingPromptId = '88888888-8888-4888-a888-888888888888';
const mockQuestionId1 = '11111111-1111-4111-a111-111111111111';
const mockQuestionId2 = '22222222-2222-4222-a222-222222222222';

// Mock datasets for Content and Learning domains
const mockVocabularies = [
  {
    id: mockVocabularyId1,
    word: 'abandon',
    lemma: 'abandon',
    cefr_level: 'B2',
    part_of_speech: 'verb',
    ipa: '/əˈbændən/',
    meaning_th: 'ละทิ้ง',
    meaning_en: 'To leave behind',
    example_sentence_en: 'They had to abandon the car.',
    example_sentence_th: 'พวกเขาต้องทิ้งรถไว้',
    topic: 'Daily Life',
    synonyms: ['desert', 'leave'],
    antonyms: ['keep', 'stay'],
    is_active: true,
  },
  {
    id: mockVocabularyId2,
    word: 'ability',
    lemma: 'ability',
    cefr_level: 'A2',
    part_of_speech: 'noun',
    ipa: '/əˈbɪl.ə.ti/',
    meaning_th: 'ความสามารถ',
    meaning_en: 'The power or skill to do something',
    example_sentence_en: 'She has the ability to speak three languages.',
    example_sentence_th: 'เธอมีความสามารถในการพูดสามภาษา',
    topic: 'Skills',
    synonyms: ['capacity', 'talent'],
    antonyms: ['inability'],
    is_active: true,
  },
];

const mockGrammarTopics = [
  {
    id: mockGrammarTopicId,
    slug: 'present-perfect-vs-past-simple',
    title_en: 'Present Perfect vs Past Simple',
    title_th: 'ความแตกต่างระหว่าง Present Perfect และ Past Simple',
    cefr_level: 'B1',
    summary_th: 'สรุปการใช้ Present Perfect และ Past Simple',
    concept_th: 'ใช้ Past Simple กับเวลาที่ระบุชัดเจนในอดีต',
    concept_en: 'Use Past Simple for completed actions with specific time.',
    rules: [{ rule: 'Have/Has + V3 for unspecified time' }],
    common_mistakes: [{ mistake: 'I have seen him yesterday', correction: 'I saw him yesterday' }],
    is_active: true,
  },
];

const mockReadingPassages = [
  {
    id: mockReadingPassageId,
    title: 'The Future of Renewable Energy',
    cefr_level: 'B2',
    target_exam: 'FCE',
    topic: 'Environment',
    content: 'Solar and wind energy power global electrical systems...',
    word_count: 350,
    vocabulary_glossary: [{ word: 'renewable', meaning_th: 'หมุนเวียน' }],
    is_active: true,
  },
];

const mockListeningExercises = [
  {
    id: mockListeningExerciseId,
    title: 'Booking a Hotel Room',
    cefr_level: 'A2',
    target_exam: 'KET',
    speaker_accents: ['British', 'Australian'],
    audio_storage_path: 'listening/audio/l-1.mp3',
    speed_options: [0.75, 1.0, 1.25],
    audio_script: 'Receptionist: Good morning, Grand Hotel...',
    is_active: true,
  },
];

const mockWritingPrompts = [
  {
    id: mockWritingPromptId,
    title: 'Write an email to an English friend',
    cefr_level: 'B1',
    target_exam: 'PET',
    task_type: 'Email',
    prompt_th: 'เขียนอีเมลถึงเพื่อนเพื่อชวนไปดูคอนเสิร์ต',
    prompt_en: 'Write an email inviting your friend to a concert.',
    min_words: 100,
    max_words: 150,
    guidelines_th: 'บอกเวลา สถานที่ และเหตุผลที่ควรไปด้วยกัน',
    useful_phrases: ['Would you like to come?', 'Let me know!'],
    rubrics: { content: 5, communicative_achievement: 5 },
    sample_model_answer: 'SUPER_SECRET_MODEL_ANSWER_SHOULD_NEVER_LEAK',
    is_active: true,
  },
];

const mockSpeakingPrompts = [
  {
    id: mockSpeakingPromptId,
    title: 'Describing a Memorable Holiday',
    cefr_level: 'B1',
    target_exam: 'PET',
    part: 2,
    prompt_th: 'บรรยายวันหยุดที่คุณประทับใจ',
    prompt_en: 'Describe a holiday that you really enjoyed.',
    guiding_questions_th: ['ไปที่ไหน?', 'ไปกับใคร?'],
    target_phrases: ['I will never forget...', 'It was fascinating.'],
    model_answer: 'SECRET_SPEAKING_MODEL_ANSWER_DO_NOT_LEAK',
    is_active: true,
  },
];

const mockQuestions = [
  {
    id: mockQuestionId1,
    skill: 'grammar',
    cefr_level: 'B1',
    type: 'multiple_choice',
    prompt_th: 'เลือกคำตอบที่ถูกต้อง',
    prompt_en: 'She _____ to London last summer.',
    context_passage: null,
    audio_storage_path: null,
    difficulty_weight: 1,
    weakness_tag: 'past_simple',
    grammar_topic_id: mockGrammarTopicId,
    reading_passage_id: null,
    listening_exercise_id: null,
    correct_answer_text: 'went',
    explanation_th: 'กริยาช่อง 2 คือ went',
    explanation_en: 'Past simple is went',
    is_active: true,
    question_options: [
      { id: 'opt-1', key: 'A', text: 'go', is_correct: false, feedback_th: 'ผิด' },
      { id: 'opt-2', key: 'B', text: 'went', is_correct: true, feedback_th: 'ถูก' },
    ],
  },
  {
    id: mockQuestionId2,
    skill: 'reading',
    cefr_level: 'B2',
    type: 'multiple_choice',
    prompt_th: 'จากบทความ ผู้เขียนต้องการสื่อถึงอะไร?',
    prompt_en: 'What is the main advantage of renewable energy mentioned in paragraph 1?',
    context_passage: 'Solar and wind energy...',
    audio_storage_path: null,
    difficulty_weight: 2,
    weakness_tag: 'main_idea',
    grammar_topic_id: null,
    reading_passage_id: mockReadingPassageId,
    listening_exercise_id: null,
    correct_answer_text: 'sustainability',
    explanation_th: 'ในย่อหน้าแรกระบุถึงความยั่งยืน',
    explanation_en: 'Paragraph 1 emphasizes sustainability',
    is_active: true,
    question_options: [
      { id: 'opt-3', key: 'A', text: 'Lower carbon emissions', is_correct: true, feedback_th: 'ถูกต้อง' },
      { id: 'opt-4', key: 'B', text: 'High initial setup cost', is_correct: false, feedback_th: 'ผิด' },
    ],
  },
];

// Helper to mock chainable PostgREST queries with column projection
function createPostgrestMock(initialData: any[]) {
  let filtered = [...initialData];
  let projectedColumns: string[] | null = null;

  const builder: any = {};
  builder.select = vi.fn((cols?: string) => {
    if (cols && typeof cols === 'string') {
      projectedColumns = cols.split(',').map((c) => c.trim().split('(')[0].trim());
    }
    return builder;
  });
  builder.eq = vi.fn((col: string, val: any) => {
    filtered = filtered.filter((item: any) => item[col] === val);
    return builder;
  });
  builder.ilike = vi.fn((col: string, val: string) => {
    const term = val.replace(/%/g, '').toLowerCase();
    filtered = filtered.filter((item: any) =>
      item[col] && item[col].toString().toLowerCase().includes(term)
    );
    return builder;
  });
  builder.order = vi.fn(() => builder);

  function projectItem(item: any) {
    if (!item) return item;
    if (!projectedColumns) return { ...item };
    const projected: any = {};
    for (const key of projectedColumns) {
      if (key in item) {
        projected[key] = item[key];
      }
    }
    return projected;
  }

  builder.range = vi.fn(async (start: number, end: number) => {
    const sliced = filtered.slice(start, end + 1).map(projectItem);
    return { data: sliced, count: filtered.length, error: null };
  });

  builder.single = vi.fn(async () => {
    if (filtered.length === 0) {
      return { data: null, error: new Error('Record not found') };
    }
    return { data: projectItem(filtered[0]), error: null };
  });

  return builder;
}

// Mock Supabase Client
vi.mock('../api/_lib/supabase/client', () => {
  return {
    createPublicServerClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'vocabularies') return createPostgrestMock(mockVocabularies);
        if (table === 'grammar_topics') return createPostgrestMock(mockGrammarTopics);
        if (table === 'reading_passages') return createPostgrestMock(mockReadingPassages);
        if (table === 'listening_exercises') return createPostgrestMock(mockListeningExercises);
        if (table === 'writing_prompts') return createPostgrestMock(mockWritingPrompts);
        if (table === 'speaking_prompts') return createPostgrestMock(mockSpeakingPrompts);
        if (table === 'questions') return createPostgrestMock(mockQuestions);
        if (table === 'question_options') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((_col: string, val: string) => ({
                order: vi.fn(async () => {
                  const q = mockQuestions.find((m) => m.id === val);
                  return { data: q ? q.question_options : [], error: null };
                }),
              })),
            })),
          };
        }
        return createPostgrestMock([]);
      }),
    })),
    createServerUserClient: vi.fn(),
    createServiceRoleClient: vi.fn(),
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
import vocabularyHandler from '../api/content/vocabulary';
import grammarHandler from '../api/content/grammar';
import readingHandler from '../api/content/reading';
import listeningHandler from '../api/content/listening';
import writingHandler from '../api/content/writing';
import speakingHandler from '../api/content/speaking';
import questionsHandler from '../api/questions/index';

describe('Phase 4.4: Content / Learning API Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Vocabulary API (GET /api/content/vocabulary)', () => {
    it('should return paginated list of vocabularies with total count', async () => {
      const res = await invokeHandler(vocabularyHandler, {
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(2);
      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        total_pages: 1,
      });
    });

    it('should filter vocabulary by cefr_level', async () => {
      const res = await invokeHandler(vocabularyHandler, {
        method: 'GET',
        query: { cefr_level: 'B2' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].word).toBe('abandon');
      expect(res.body.data.items[0].cefr_level).toBe('B2');
    });

    it('should filter vocabulary by search term', async () => {
      const res = await invokeHandler(vocabularyHandler, {
        method: 'GET',
        query: { search: 'abil' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].word).toBe('ability');
    });

    it('should return safe empty state when no vocabulary matches filter', async () => {
      const res = await invokeHandler(vocabularyHandler, {
        method: 'GET',
        query: { search: 'nonexistentwordxyz' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
      expect(res.body.data.pagination.total_pages).toBe(0);
    });

    it('should reject invalid cefr_level with 400 VALIDATION_ERROR', async () => {
      const res = await invokeHandler(vocabularyHandler, {
        method: 'GET',
        query: { cefr_level: 'Z9' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('2. Grammar API (GET /api/content/grammar)', () => {
    it('should return grammar topics with rules and common mistakes', async () => {
      const res = await invokeHandler(grammarHandler, {
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.topics.length).toBe(1);
      const topic = res.body.data.topics[0];
      expect(topic.slug).toBe('present-perfect-vs-past-simple');
      expect(topic.rules).toBeDefined();
      expect(topic.common_mistakes).toBeDefined();
    });

    it('should filter grammar topics by cefr_level', async () => {
      const res = await invokeHandler(grammarHandler, {
        method: 'GET',
        query: { cefr_level: 'B1' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.topics.length).toBe(1);
      expect(res.body.data.topics[0].cefr_level).toBe('B1');
    });

    it('should filter grammar topics by slug', async () => {
      const res = await invokeHandler(grammarHandler, {
        method: 'GET',
        query: { slug: 'present-perfect-vs-past-simple' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.topics.length).toBe(1);
    });

    it('should return empty list when slug is not found', async () => {
      const res = await invokeHandler(grammarHandler, {
        method: 'GET',
        query: { slug: 'unknown-slug-xyz' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.topics).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
    });
  });

  describe('3. Reading API (GET /api/content/reading)', () => {
    it('should return reading passages with vocabulary glossary', async () => {
      const res = await invokeHandler(readingHandler, {
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.passages.length).toBe(1);
      const passage = res.body.data.passages[0];
      expect(passage.title).toBe('The Future of Renewable Energy');
      expect(passage.vocabulary_glossary).toBeDefined();
    });

    it('should filter reading passages by target_exam and topic', async () => {
      const res = await invokeHandler(readingHandler, {
        method: 'GET',
        query: { target_exam: 'FCE', topic: 'Environment' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.passages.length).toBe(1);
      expect(res.body.data.passages[0].target_exam).toBe('FCE');
    });

    it('should reject invalid target_exam with 400', async () => {
      const res = await invokeHandler(readingHandler, {
        method: 'GET',
        query: { target_exam: 'IELTS' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('4. Listening API (GET /api/content/listening)', () => {
    it('should return listening exercises with audio metadata and accents', async () => {
      const res = await invokeHandler(listeningHandler, {
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.exercises.length).toBe(1);
      const exercise = res.body.data.exercises[0];
      expect(exercise.speaker_accents).toEqual(['British', 'Australian']);
      expect(exercise.audio_storage_path).toBe('listening/audio/l-1.mp3');
      expect(exercise.speed_options).toEqual([0.75, 1.0, 1.25]);
    });

    it('should filter listening exercises by target_exam', async () => {
      const res = await invokeHandler(listeningHandler, {
        method: 'GET',
        query: { target_exam: 'KET' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.exercises.length).toBe(1);
      expect(res.body.data.exercises[0].target_exam).toBe('KET');
    });
  });

  describe('5. Writing API (GET /api/content/writing)', () => {
    it('should return writing practice prompts without leaking sample_model_answer', async () => {
      const res = await invokeHandler(writingHandler, {
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.prompts.length).toBe(1);
      const prompt = res.body.data.prompts[0];
      expect(prompt.title).toBe('Write an email to an English friend');
      expect(prompt.task_type).toBe('Email');
      // SECURITY INVARIANT: sample_model_answer MUST NOT exist
      expect(prompt.sample_model_answer).toBeUndefined();
    });

    it('should filter writing prompts by task_type', async () => {
      const res = await invokeHandler(writingHandler, {
        method: 'GET',
        query: { task_type: 'Email' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.prompts.length).toBe(1);
    });

    it('should reject invalid task_type with 400', async () => {
      const res = await invokeHandler(writingHandler, {
        method: 'GET',
        query: { task_type: 'Novel' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('6. Speaking API (GET /api/content/speaking)', () => {
    it('should return speaking prompts without leaking model_answer', async () => {
      const res = await invokeHandler(speakingHandler, {
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.prompts.length).toBe(1);
      const prompt = res.body.data.prompts[0];
      expect(prompt.title).toBe('Describing a Memorable Holiday');
      expect(prompt.part).toBe(2);
      // SECURITY INVARIANT: model_answer MUST NOT exist
      expect(prompt.model_answer).toBeUndefined();
    });

    it('should filter speaking prompts by exam part (1-4)', async () => {
      const res = await invokeHandler(speakingHandler, {
        method: 'GET',
        query: { part: '2' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.prompts.length).toBe(1);
      expect(res.body.data.prompts[0].part).toBe(2);
    });

    it('should reject invalid speaking part (> 4) with 400', async () => {
      const res = await invokeHandler(speakingHandler, {
        method: 'GET',
        query: { part: '5' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('7. Questions API (GET /api/questions)', () => {
    it('should return a single question by id with stripped sensitive keys', async () => {
      const res = await invokeHandler(questionsHandler, {
        method: 'GET',
        query: { id: mockQuestionId1 },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.question).toBeDefined();
      const q = res.body.data.question;
      expect(q.id).toBe(mockQuestionId1);
      expect(q.grammarTopicId).toBe(mockGrammarTopicId);
      // SECURITY INVARIANTS:
      expect(q.correct_answer_text).toBeUndefined();
      expect(q.explanation_th).toBeUndefined();
      expect(q.explanation_en).toBeUndefined();
      for (const opt of q.options) {
        expect(opt.is_correct).toBeUndefined();
        expect(opt.feedback_th).toBeUndefined();
      }
    });

    it('should filter questions by parent reading_passage_id', async () => {
      const res = await invokeHandler(questionsHandler, {
        method: 'GET',
        query: { reading_passage_id: mockReadingPassageId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.questions.length).toBe(1);
      expect(res.body.data.questions[0].readingPassageId).toBe(mockReadingPassageId);
      expect(res.body.data.questions[0].skill).toBe('reading');
    });

    it('should filter questions by parent grammar_topic_id', async () => {
      const res = await invokeHandler(questionsHandler, {
        method: 'GET',
        query: { grammar_topic_id: mockGrammarTopicId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.questions.length).toBe(1);
      expect(res.body.data.questions[0].grammarTopicId).toBe(mockGrammarTopicId);
      expect(res.body.data.questions[0].skill).toBe('grammar');
    });

    it('should filter questions by skill and cefr', async () => {
      const res = await invokeHandler(questionsHandler, {
        method: 'GET',
        query: { skill: 'grammar', cefr: 'B1' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.questions.length).toBe(1);
      expect(res.body.data.questions[0].cefrLevel).toBe('B1');
    });

    it('should return safe empty array when no questions match filter', async () => {
      const res = await invokeHandler(questionsHandler, {
        method: 'GET',
        query: { skill: 'speaking' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.questions).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('should reject invalid skill query with 400', async () => {
      const res = await invokeHandler(questionsHandler, {
        method: 'GET',
        query: { skill: 'coding' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
