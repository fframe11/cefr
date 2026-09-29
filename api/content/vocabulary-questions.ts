import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { validateBody, validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema } from '../_lib/validation/common-schemas';
import {
  generatePracticeSession,
  generateQuestionForWord,
  sanitizeQuestionForClient,
  VocabularyQuestionInteractionType,
} from '../../lib/questions/vocabulary-questions';
import { getProductionVocabularyById } from '../../lib/vocabulary/production-vocabulary';
import { BadRequestError } from '../_lib/errors/api-error';

// Session memory cache to securely store server answer keys for active practice sessions
interface ActiveQuestionCacheItem {
  id: string;
  targetWordId: string;
  serverAnswerKey: string;
  explanationTh: string;
  explanationEn: string;
  expiresAt: number;
}

const activeQuestionsCache = new Map<string, ActiveQuestionCacheItem>();

// Periodic cleanup of questions older than 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of activeQuestionsCache.entries()) {
    if (v.expiresAt < now) {
      activeQuestionsCache.delete(k);
    }
  }
}, 5 * 60 * 1000);

const questionsQuerySchema = z.object({
  cefr_level: cefrLevelSchema.optional(),
  count: z.coerce.number().min(1).max(20).default(5),
  word_ids: z.string().optional(), // Comma-separated
  interaction_types: z.string().optional(), // Comma-separated
});

const submitAnswerSchema = z.object({
  question_id: z.string().min(1),
  selected_key: z.enum(['A', 'B', 'C', 'D']),
  target_word_id: z.string().optional(),
});

/**
 * GET /api/content/vocabulary/questions
 * Generates sanitized vocabulary practice questions.
 *
 * POST /api/content/vocabulary/questions
 * Server-authoritatively grades a question submission.
 */
export default createApiHandler(
  async ({ req }) => {
    if (req.method === 'GET') {
      const query = validateQuery(questionsQuerySchema, req.query);
      const wordIds = query.word_ids ? query.word_ids.split(',').map((s) => s.trim()) : undefined;
      const types = query.interaction_types
        ? (query.interaction_types.split(',').map((s) => s.trim()) as VocabularyQuestionInteractionType[])
        : undefined;

      const session = generatePracticeSession({
        cefrLevel: query.cefr_level,
        count: query.count,
        wordIds,
        types,
      });

      // Cache server answer keys for grading
      const now = Date.now();
      const expiresAt = now + 30 * 60 * 1000;
      for (const q of session.questions) {
        activeQuestionsCache.set(q.id, {
          id: q.id,
          targetWordId: q.targetWordId,
          serverAnswerKey: q.serverAnswerKey,
          explanationTh: q.explanationTh,
          explanationEn: q.explanationEn,
          expiresAt,
        });
      }

      return {
        questions: session.clientQuestions,
        total: session.clientQuestions.length,
      };
    }

    if (req.method === 'POST') {
      const body = validateBody(submitAnswerSchema, req.body);
      const cached = activeQuestionsCache.get(body.question_id);

      if (cached) {
        const isCorrect = body.selected_key === cached.serverAnswerKey;
        return {
          question_id: body.question_id,
          target_word_id: cached.targetWordId,
          selected_key: body.selected_key,
          correct_key: cached.serverAnswerKey,
          is_correct: isCorrect,
          explanation_th: cached.explanationTh,
          explanation_en: cached.explanationEn,
        };
      }

      // If question was not in memory cache (e.g. server rebooted or stateless request),
      // grade deterministically if target_word_id was provided
      if (body.target_word_id) {
        const target = getProductionVocabularyById(body.target_word_id);
        if (target) {
          // Re-generate question for word deterministically
          const regenerated = generateQuestionForWord(target, 'meaning_recognition');
          const isCorrect = body.selected_key === regenerated.serverAnswerKey;
          return {
            question_id: body.question_id,
            target_word_id: target.id,
            selected_key: body.selected_key,
            correct_key: regenerated.serverAnswerKey,
            is_correct: isCorrect,
            explanation_th: regenerated.explanationTh,
            explanation_en: regenerated.explanationEn,
          };
        }
      }

      throw new BadRequestError('Question session expired or invalid. Please request a new question.');
    }
  },
  {
    allowedMethods: ['GET', 'POST'],
    requireAuth: false,
    rateLimit: {
      action: 'content_vocabulary_questions',
      maxRequests: 120,
      windowMs: 60_000,
    },
  }
);
