import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import {
  cefrLevelSchema,
  skillTypeSchema,
  questionTypeSchema,
  uuidSchema,
} from '../_lib/validation/common-schemas';
import { NotFoundError } from '../_lib/errors/api-error';

const questionsQuerySchema = z.object({
  id: uuidSchema.optional(),
  skill: skillTypeSchema.optional(),
  cefr: cefrLevelSchema.optional(),
  question_type: questionTypeSchema.optional(),
  weakness_tag: z.string().max(50).optional(),
  grammar_topic_id: uuidSchema.optional(),
  reading_passage_id: uuidSchema.optional(),
  listening_exercise_id: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export interface SanitizedOptionDTO {
  id: string;
  key: string;
  text: string;
}

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

/**
 * GET /api/questions
 * GET /api/questions?id=:id
 * 
 * CRITICAL SECURITY INVARIANT:
 * Strips all sensitive grading keys and answer disclosures before client transmission:
 * - questions.correct_answer_text (STRIPPED)
 * - questions.explanation_th (STRIPPED)
 * - questions.explanation_en (STRIPPED)
 * - question_options.is_correct (STRIPPED)
 * - question_options.feedback_th (STRIPPED)
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(questionsQuerySchema, req.query);
    const supabase = createPublicServerClient();

    // 1. Single Question Retrieval
    if (query.id) {
      const { data: q, error: qError } = await supabase
        .from('questions')
        .select(
          'id, skill, cefr_level, type, prompt_th, prompt_en, context_passage, audio_storage_path, weakness_tag, difficulty_weight, grammar_topic_id, reading_passage_id, listening_exercise_id, is_active'
        )
        .eq('id', query.id)
        .eq('is_active', true)
        .single();

      if (qError || !q) {
        throw new NotFoundError('Question not found or inactive.');
      }

      // Fetch options with ONLY non-sensitive columns (id, key, text)
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

      return {
        question: sanitizedQuestion,
      };
    }

    // 2. Question Bank Query with Safe Filtering
    let dbQuery = supabase
      .from('questions')
      .select(
        'id, skill, cefr_level, type, prompt_th, prompt_en, context_passage, audio_storage_path, weakness_tag, difficulty_weight, grammar_topic_id, reading_passage_id, listening_exercise_id, question_options(id, key, text)',
        { count: 'exact' }
      )
      .eq('is_active', true);

    if (query.skill) {
      dbQuery = dbQuery.eq('skill', query.skill);
    }
    if (query.cefr) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr);
    }
    if (query.question_type) {
      dbQuery = dbQuery.eq('type', query.question_type);
    }
    if (query.weakness_tag) {
      dbQuery = dbQuery.eq('weakness_tag', query.weakness_tag);
    }
    if (query.grammar_topic_id) {
      dbQuery = dbQuery.eq('grammar_topic_id', query.grammar_topic_id);
    }
    if (query.reading_passage_id) {
      dbQuery = dbQuery.eq('reading_passage_id', query.reading_passage_id);
    }
    if (query.listening_exercise_id) {
      dbQuery = dbQuery.eq('listening_exercise_id', query.listening_exercise_id);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + query.limit - 1);

    const { data: rawQuestions, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    const sanitizedQuestions: SanitizedQuestionDTO[] = (rawQuestions || []).map((q: any) => ({
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
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'questions_get',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
