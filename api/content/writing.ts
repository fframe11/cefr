import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';
import promptsData from '../../data/writing-prompts.json';

const writingQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  target_exam: cambridgeExamCodeSchema.optional(),
  task_type: z.enum(['Email', 'Essay', 'Article', 'Story', 'Review', 'description', 'message', 'report', 'proposal', 'argumentative_essay', 'critical_review', 'philosophical_essay']).optional(),
});

interface LocalWritingPrompt {
  id: string;
  cefr_level: string;
  task_type: string;
  title_en: string;
  title_th: string;
  instruction_en: string;
  instruction_th: string;
  min_words: number;
  max_words: number;
  scoring_rubric: any;
  cefr_descriptors: string[];
}

/**
 * GET /api/content/writing
 * Public endpoint to fetch writing practice prompts.
 * Employs local calibrated prompt bank fallback when database table is unpopulated.
 * 
 * SECURITY INVARIANT:
 * Strictly hides sample_answer_en prior to student submission.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(writingQuerySchema, req.query);
    const supabase = createPublicServerClient();

    try {
      let dbQuery = supabase
        .from('writing_prompts')
        .select('id, title, cefr_level, target_exam, task_type, prompt_th, prompt_en, min_words, max_words, guidelines_th, useful_phrases, rubrics', {
          count: 'exact',
        })
        .eq('is_active', true);

      if (query.cefr_level) {
        dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
      }
      if (query.target_exam) {
        dbQuery = dbQuery.eq('target_exam', query.target_exam);
      }
      if (query.task_type) {
        dbQuery = dbQuery.eq('task_type', query.task_type);
      }

      const offset = (query.page - 1) * query.limit;
      dbQuery = dbQuery
        .order('title', { ascending: true })
        .range(offset, offset + query.limit - 1);

      const { data: prompts, count, error } = await dbQuery;

      if (!error && prompts && prompts.length > 0) {
        return {
          prompts,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || prompts.length,
            total_pages: Math.ceil((count || prompts.length) / query.limit),
          },
        };
      }
    } catch {
      // Fallback seamlessly to local bank below
    }

    // Local curated writing prompts fallback
    const rawPrompts = promptsData as LocalWritingPrompt[];
    let filtered = rawPrompts;

    if (query.cefr_level) {
      filtered = filtered.filter((p) => p.cefr_level === query.cefr_level);
    }
    if (query.task_type) {
      filtered = filtered.filter((p) => p.task_type.toLowerCase() === query.task_type!.toLowerCase());
    }

    const formattedPrompts = filtered.map((p) => ({
      id: p.id,
      title: p.title_en,
      title_th: p.title_th,
      cefr_level: p.cefr_level,
      target_exam: p.cefr_level === 'A2' ? 'KET' : p.cefr_level === 'B1' ? 'PET' : p.cefr_level === 'B2' ? 'FCE' : 'CAE',
      task_type: p.task_type,
      prompt_th: p.instruction_th,
      prompt_en: p.instruction_en,
      min_words: p.min_words,
      max_words: p.max_words,
      guidelines_th: p.instruction_th,
      useful_phrases: [],
      rubrics: p.scoring_rubric,
    }));

    const offset = (query.page - 1) * query.limit;
    const paginated = formattedPrompts.slice(offset, offset + query.limit);

    return {
      prompts: paginated,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: formattedPrompts.length,
        total_pages: Math.ceil(formattedPrompts.length / query.limit),
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'content_writing',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
