import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, paginationSchema } from '../_lib/validation/common-schemas';
import grammarData from '../../data/grammar-question-bank.json';

const grammarQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  slug: z.string().max(100).optional(),
});

interface LocalGrammarItem {
  id: string;
  cefr_level: string;
  grammar_topic: string;
  stem_en: string;
  correct_answer: string;
  explanation_en: string;
  explanation_th: string;
  weakness_tag: string;
}

/**
 * GET /api/content/grammar
 * Public endpoint to fetch grammar lessons and concept rules.
 * Employs local pedagogical question bank fallback when database table is unpopulated.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(grammarQuerySchema, req.query);
    const supabase = createPublicServerClient();

    try {
      let dbQuery = supabase
        .from('grammar_topics')
        .select(
          'id, slug, title_en, title_th, cefr_level, summary_th, concept_th, concept_en, rules, common_mistakes',
          { count: 'exact' }
        )
        .eq('is_active', true);

      if (query.cefr_level) {
        dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
      }
      if (query.slug) {
        dbQuery = dbQuery.eq('slug', query.slug);
      }

      const offset = (query.page - 1) * query.limit;
      dbQuery = dbQuery
        .order('slug', { ascending: true })
        .range(offset, offset + query.limit - 1);

      const { data: topics, count, error } = await dbQuery;

      if (!error && topics && topics.length > 0) {
        return {
          topics,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || topics.length,
            total_pages: Math.ceil((count || topics.length) / query.limit),
          },
        };
      }
    } catch {
      // Fallback seamlessly to local bank below
    }

    // Local curated pedagogical fallback
    const rawItems = grammarData as LocalGrammarItem[];
    let filtered = rawItems;
    if (query.cefr_level) {
      filtered = filtered.filter((it) => it.cefr_level === query.cefr_level);
    }
    if (query.slug) {
      filtered = filtered.filter((it) => it.grammar_topic.toLowerCase().includes(query.slug!.toLowerCase()));
    }

    // Group items into distinct topic summaries
    const topicMap = new Map<string, any>();
    for (const item of filtered) {
      if (!topicMap.has(item.grammar_topic)) {
        topicMap.set(item.grammar_topic, {
          id: item.id,
          slug: item.grammar_topic,
          title_en: item.grammar_topic.replace(/_/g, ' ').toUpperCase(),
          title_th: item.explanation_th.slice(0, 60),
          cefr_level: item.cefr_level,
          summary_th: item.explanation_th,
          concept_th: item.explanation_th,
          concept_en: item.explanation_en,
          rules: [
            {
              rule_number: 1,
              explanation_th: item.explanation_th,
              explanation_en: item.explanation_en,
              example_sentences: [item.stem_en.replace('_____', item.correct_answer)],
            },
          ],
          common_mistakes: [],
        });
      }
    }

    const allTopics = Array.from(topicMap.values());
    const offset = (query.page - 1) * query.limit;
    const paginatedTopics = allTopics.slice(offset, offset + query.limit);

    return {
      topics: paginatedTopics,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: allTopics.length,
        total_pages: Math.ceil(allTopics.length / query.limit),
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'content_grammar',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
