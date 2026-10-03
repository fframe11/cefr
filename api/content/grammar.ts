import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, paginationSchema } from '../_lib/validation/common-schemas';
import { GRAMMAR_BANK } from '../../data/grammarBank';
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

    // Local curated pedagogical fallback using expanded 14-topic CEFR GRAMMAR_BANK
    let filtered = GRAMMAR_BANK;
    if (query.cefr_level) {
      filtered = filtered.filter((it) => it.cefrLevel === query.cefr_level);
    }
    if (query.slug) {
      filtered = filtered.filter(
        (it) =>
          it.id.toLowerCase().includes(query.slug!.toLowerCase()) ||
          it.titleEn.toLowerCase().includes(query.slug!.toLowerCase())
      );
    }

    const mappedTopics = filtered.map((topic) => ({
      id: topic.id,
      slug: topic.id,
      title_en: topic.titleEn,
      title_th: topic.titleTh,
      cefr_level: topic.cefrLevel,
      summary_th: topic.explanationTh,
      concept_th: topic.explanationTh,
      concept_en: topic.conceptEn,
      rules: topic.rules.map((r) => ({
        rule_number: r.ruleNumber,
        explanation_th: r.explanationTh,
        explanation_en: r.explanationEn,
        example_sentences: r.exampleSentences,
      })),
      common_mistakes: topic.commonMistakes.map((m) => ({
        incorrect: m.incorrect,
        correct: m.correct,
        reason_th: m.reasonTh,
      })),
    }));

    const offset = (query.page - 1) * query.limit;
    const paginatedTopics = mappedTopics.slice(offset, offset + query.limit);

    return {
      topics: paginatedTopics,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: mappedTopics.length,
        total_pages: Math.ceil(mappedTopics.length / query.limit),
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
