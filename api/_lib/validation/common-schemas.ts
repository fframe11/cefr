import { z } from 'zod';

export const uuidSchema = z
  .string()
  .uuid({ message: 'Must be a valid UUID' });

export const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], {
  message: 'CEFR level must be one of A1, A2, B1, B2, C1, C2',
});
export type CEFRLevel = z.infer<typeof cefrLevelSchema>;

export const skillTypeSchema = z.enum(
  ['vocabulary', 'grammar', 'reading', 'listening', 'writing', 'speaking'],
  {
    message: 'Skill must be vocabulary, grammar, reading, listening, writing, or speaking',
  }
);
export type SkillType = z.infer<typeof skillTypeSchema>;

export const cambridgeExamCodeSchema = z.enum(['KET', 'PET', 'FCE', 'CAE'], {
  message: 'Target exam must be KET, PET, FCE, or CAE',
});
export type CambridgeExamCode = z.infer<typeof cambridgeExamCodeSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const questionTypeSchema = z.enum([
  'multiple_choice',
  'fill_blank',
  'true_false',
  'matching',
  'ordering',
  'sentence_transformation',
]);

export const attemptContextSchema = z.object({
  context_type: z.enum(['practice', 'mock_exam', 'placement']),
  context_attempt_id: z.string().uuid().nullable().optional(),
}).refine(
  (data) => {
    if (data.context_type === 'mock_exam') {
      return Boolean(data.context_attempt_id);
    }
    return !data.context_attempt_id;
  },
  {
    message: "context_attempt_id is required when context_type is 'mock_exam', and must be omitted for practice/placement",
    path: ['context_attempt_id'],
  }
);
