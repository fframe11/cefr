import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';
import readingData from '../../data/reading-passages.json';

const readingQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  target_exam: cambridgeExamCodeSchema.optional(),
  topic: z.string().max(100).optional(),
});

interface LocalReadingPassage {
  id: string;
  cefr_level: string;
  title_en: string;
  title_th: string;
  topic: string;
  word_count: number;
  passage_en: string;
  questions: any[];
}

/**
 * GET /api/content/reading
 * Public endpoint to fetch reading comprehension passages.
 * Employs local calibrated passage bank fallback when database table is unpopulated.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(readingQuerySchema, req.query);
    const supabase = createPublicServerClient();

    if (supabase) {
      try {
        let dbQuery = supabase
          .from('reading_passages')
          .select('id, title, cefr_level, target_exam, topic, content, word_count, vocabulary_glossary', {
            count: 'exact',
          })
          .eq('is_active', true);

        if (query.cefr_level) {
          dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
        }
        if (query.target_exam) {
          dbQuery = dbQuery.eq('target_exam', query.target_exam);
        }
        if (query.topic) {
          dbQuery = dbQuery.eq('topic', query.topic);
        }

        const offset = (query.page - 1) * query.limit;
        dbQuery = dbQuery
          .order('title', { ascending: true })
          .range(offset, offset + query.limit - 1);

        const { data: passages, count, error } = await dbQuery;

        if (!error && passages && passages.length > 0) {
          return {
            passages,
            pagination: {
              page: query.page,
              limit: query.limit,
              total: count || passages.length,
              total_pages: Math.ceil((count || passages.length) / query.limit),
            },
          };
        }
      } catch {
        // Fallback seamlessly to local bank below
      }
    }

    // Local calibrated reading passage fallback
    const rawPassages = readingData as LocalReadingPassage[];
    let filtered = rawPassages;

    if (query.cefr_level) {
      filtered = filtered.filter((p) => p.cefr_level === query.cefr_level);
    }
    if (query.topic) {
      filtered = filtered.filter((p) => p.topic.toLowerCase().includes(query.topic!.toLowerCase()));
    }

    const formattedPassages = filtered.map((p) => ({
      id: p.id,
      title: p.title_en,
      title_th: p.title_th,
      cefr_level: p.cefr_level,
      target_exam: p.cefr_level === 'A2' ? 'KET' : p.cefr_level === 'B1' ? 'PET' : p.cefr_level === 'B2' ? 'FCE' : 'CAE',
      topic: p.topic,
      content: p.passage_en,
      word_count: p.word_count,
      vocabulary_glossary: {},
      questions_count: p.questions.length,
    }));

    const offset = (query.page - 1) * query.limit;
    const paginated = formattedPassages.slice(offset, offset + query.limit);

    return {
      passages: paginated,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: formattedPassages.length,
        total_pages: Math.ceil(formattedPassages.length / query.limit),
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'content_reading',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
