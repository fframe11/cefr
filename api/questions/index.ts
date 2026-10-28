import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import {
  cefrLevelSchema,
  skillTypeSchema,
  questionTypeSchema,
} from '../_lib/validation/common-schemas';
import readingData from '../../data/reading-passages.json';
import grammarData from '../../data/grammar-question-bank.json';
import { LISTENING_BANK } from '../../data/listeningBank';
import { READING_BANK } from '../../data/readingBank';
import { GRAMMAR_BANK } from '../../data/grammarBank';

const questionsQuerySchema = z.object({
  id: z.string().min(1).max(100).optional(),
  skill: skillTypeSchema.optional(),
  cefr: cefrLevelSchema.optional(),
  question_type: questionTypeSchema.optional(),
  weakness_tag: z.string().max(50).optional(),
  grammar_topic_id: z.string().min(1).max(100).optional(),
  reading_passage_id: z.string().min(1).max(100).optional(),
  listening_exercise_id: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * Sanitized Option DTO.
 * CRITICAL SECURITY INVARIANT:
 * isCorrect, is_correct, feedbackTh, feedback_th are strictly FORBIDDEN.
 * Answer evaluation is performed server-authoritatively via POST /api/practice/submit.
 */
export interface SanitizedOptionDTO {
  id: string;
  key: string;
  text: string;
}

/**
 * Sanitized Question DTO.
 * CRITICAL SECURITY INVARIANT:
 * Answers, correct keys, and full explanations are strictly withheld
 * until a verified submission is evaluated by the server grading engine.
 */
export interface SanitizedQuestionDTO {
  id: string;
  skill: string;
  cefrLevel: string;
  questionType: string;
  prompt_th: string;
  prompt_en: string;
  contextPassage: string | null;
  audioStoragePath: string | null;
  difficultyWeight: number;
  weaknessTag: string;
  grammarTopicId?: string | null;
  readingPassageId?: string | null;
  listeningExerciseId?: string | null;
  options: SanitizedOptionDTO[];
}

export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(questionsQuerySchema, req.query);
    const supabase = createPublicServerClient();

    try {
      // 1. Single Question Retrieval via Supabase
      if (query.id) {
        const { data: q, error: qError } = await supabase
          .from('questions')
          .select(
            'id, skill, cefr_level, type, prompt_th, prompt_en, context_passage, audio_storage_path, weakness_tag, difficulty_weight, grammar_topic_id, reading_passage_id, listening_exercise_id, is_active'
          )
          .eq('id', query.id)
          .eq('is_active', true)
          .single();

        if (!qError && q) {
          // Explicitly select ONLY safe columns, never is_correct or feedback_th
          const { data: rawOptions } = await supabase
            .from('question_options')
            .select('id, key, text')
            .eq('question_id', q.id)
            .order('key', { ascending: true });

          const sanitizedQuestion: SanitizedQuestionDTO = {
            id: q.id,
            skill: q.skill,
            cefrLevel: q.cefr_level,
            questionType: q.type,
            prompt_th: q.prompt_th,
            prompt_en: q.prompt_en,
            contextPassage: q.context_passage,
            audioStoragePath: q.audio_storage_path,
            difficultyWeight: q.difficulty_weight,
            weaknessTag: q.weakness_tag,
            grammarTopicId: q.grammar_topic_id ?? null,
            readingPassageId: q.reading_passage_id ?? null,
            listeningExerciseId: q.listening_exercise_id ?? null,
            options: (rawOptions || []).map((opt) => ({
              id: opt.id,
              key: opt.key,
              text: opt.text,
            })),
          };

          return { question: sanitizedQuestion };
        }
      }

      // 2. Question Bank Query with Safe Filtering via Supabase
      let dbQuery = supabase
        .from('questions')
        .select(
          'id, skill, cefr_level, type, prompt_th, prompt_en, context_passage, audio_storage_path, weakness_tag, difficulty_weight, grammar_topic_id, reading_passage_id, listening_exercise_id, question_options(id, key, text)',
          { count: 'exact' }
        )
        .eq('is_active', true);

      if (query.skill) dbQuery = dbQuery.eq('skill', query.skill);
      if (query.cefr) dbQuery = dbQuery.eq('cefr_level', query.cefr);
      if (query.question_type) dbQuery = dbQuery.eq('type', query.question_type);
      if (query.weakness_tag) dbQuery = dbQuery.eq('weakness_tag', query.weakness_tag);
      if (query.grammar_topic_id) dbQuery = dbQuery.eq('grammar_topic_id', query.grammar_topic_id);
      if (query.reading_passage_id) dbQuery = dbQuery.eq('reading_passage_id', query.reading_passage_id);
      if (query.listening_exercise_id) dbQuery = dbQuery.eq('listening_exercise_id', query.listening_exercise_id);

      const offset = (query.page - 1) * query.limit;
      dbQuery = dbQuery.order('created_at', { ascending: false }).range(offset, offset + query.limit - 1);

      const { data: rawQuestions, count, error } = await dbQuery;

      if (!error && rawQuestions && rawQuestions.length > 0) {
        const sanitizedQuestions: SanitizedQuestionDTO[] = rawQuestions.map((q: any) => ({
          id: q.id,
          skill: q.skill,
          cefrLevel: q.cefr_level,
          questionType: q.type,
          prompt_th: q.prompt_th,
          prompt_en: q.prompt_en,
          contextPassage: q.context_passage,
          audioStoragePath: q.audio_storage_path,
          difficultyWeight: q.difficulty_weight,
          weaknessTag: q.weakness_tag,
          grammarTopicId: q.grammar_topic_id ?? null,
          readingPassageId: q.reading_passage_id ?? null,
          listeningExerciseId: q.listening_exercise_id ?? null,
          options: ((q.question_options as any[]) || []).map((opt: any) => ({
            id: opt.id,
            key: opt.key,
            text: opt.text,
          })),
        }));

        return {
          questions: sanitizedQuestions,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / query.limit),
          },
        };
      }
    } catch {
      // Fall through to local banks fallback
    }

    // =========================================================================
    // LOCAL CALIBRATED QUESTION BANK FALLBACK (ZERO-LEAK SANITIZATION)
    // =========================================================================
    let localPool: SanitizedQuestionDTO[] = [];

    // A. Reading Passage Questions
    if (query.reading_passage_id) {
      const p = (readingData as any[]).find((x) => x.id === query.reading_passage_id);
      if (p && p.questions) {
        localPool = p.questions.map((q: any) => ({
          id: q.id,
          skill: 'reading',
          cefrLevel: p.cefr_level,
          questionType: q.question_type || 'multiple_choice',
          prompt_th: q.stem_en,
          prompt_en: q.stem_en,
          contextPassage: p.passage_en,
          audioStoragePath: null,
          difficultyWeight: p.cefr_level === 'A1' ? 1 : p.cefr_level === 'A2' ? 2 : 3,
          weaknessTag: q.weakness_tag || 'reading_comprehension',
          readingPassageId: p.id,
          options: (q.options || []).map((opt: any) => ({
            id: `${q.id}_${opt.key}`,
            key: opt.key,
            text: opt.text,
          })),
        }));
      } else {
        const rpStatic = READING_BANK.find((x) => x.id === query.reading_passage_id);
        if (rpStatic && rpStatic.questions) {
          localPool = rpStatic.questions.map((q) => ({
            id: q.id,
            skill: 'reading',
            cefrLevel: q.cefrLevel,
            questionType: q.type,
            prompt_th: q.promptTh,
            prompt_en: q.promptEn,
            contextPassage: rpStatic.content,
            audioStoragePath: null,
            difficultyWeight: q.difficultyWeight || 2,
            weaknessTag: q.weaknessTag || 'reading_comprehension',
            readingPassageId: rpStatic.id,
            options: (q.options || []).map((opt) => ({
              id: `${q.id}_${opt.key}`,
              key: opt.key,
              text: opt.text,
            })),
          }));
        }
      }
    } else if (query.listening_exercise_id) {
      const le = LISTENING_BANK.find((x) => x.id === query.listening_exercise_id);
      if (le && le.questions) {
        localPool = le.questions.map((q) => ({
          id: q.id,
          skill: 'listening',
          cefrLevel: q.cefrLevel,
          questionType: q.type,
          prompt_th: q.promptTh,
          prompt_en: q.promptEn,
          contextPassage: le.audioScript,
          audioStoragePath: null,
          difficultyWeight: q.difficultyWeight || 2,
          weaknessTag: q.weaknessTag || 'listening_comprehension',
          listeningExerciseId: le.id,
          options: (q.options || []).map((opt) => ({
            id: `${q.id}_${opt.key}`,
            key: opt.key,
            text: opt.text,
          })),
        }));
      }
    } else if (query.grammar_topic_id) {
      const gQuestions = (grammarData as any[]).filter((q) => q.topic_id === query.grammar_topic_id);
      if (gQuestions.length > 0) {
        localPool = gQuestions.map((q: any) => ({
          id: q.id,
          skill: 'grammar',
          cefrLevel: q.cefr_level,
          questionType: 'multiple_choice',
          prompt_th: q.stem_th || q.stem_en,
          prompt_en: q.stem_en,
          contextPassage: null,
          audioStoragePath: null,
          difficultyWeight: 2,
          weaknessTag: q.weakness_tag || 'grammar_rules',
          grammarTopicId: q.topic_id,
          options: (q.options || []).map((opt: any) => ({
            id: `${q.id}_${opt.key}`,
            key: opt.key,
            text: opt.text,
          })),
        }));
      } else {
        const topic = GRAMMAR_BANK.find((t) => t.id === query.grammar_topic_id);
        if (topic && topic.practiceQuestions) {
          localPool = topic.practiceQuestions.map((q) => ({
            id: q.id,
            skill: 'grammar',
            cefrLevel: q.cefrLevel,
            questionType: q.type,
            prompt_th: q.promptTh,
            prompt_en: q.promptEn,
            contextPassage: null,
            audioStoragePath: null,
            difficultyWeight: q.difficultyWeight || 2,
            weaknessTag: q.weaknessTag || 'grammar_rules',
            grammarTopicId: topic.id,
            options: (q.options || []).map((opt) => ({
              id: `${q.id}_${opt.key}`,
              key: opt.key,
              text: opt.text,
            })),
          }));
        }
      }
    }

    const offset = (query.page - 1) * query.limit;
    const paginated = localPool.slice(offset, offset + query.limit);

    return {
      questions: paginated,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: localPool.length,
        total_pages: Math.ceil(localPool.length / query.limit) || 1,
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'questions_get',
      maxRequests: 120,
      windowMs: 60_000,
    },
  }
);
