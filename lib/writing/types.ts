export type CEFRBand = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CambridgeRubricScores {
  content: number;                   // 0.0 - 5.0
  communicative_achievement: number; // 0.0 - 5.0
  organisation: number;              // 0.0 - 5.0
  language: number;                  // 0.0 - 5.0
}

export interface LexicalDistribution {
  a1_a2_percent: number;
  b1_b2_percent: number;
  c1_c2_percent: number;
  advanced_words_found?: string[];
  suggested_upgrades?: Array<{
    original: string;
    suggestions: string[];
    cefr: 'B2' | 'C1' | 'C2';
  }>;
}

export interface GrammarIssue {
  offset: number;
  length: number;
  original_text: string;
  replacement: string;
  rule_id: string;
  explanation_th: string;
}

export interface WritingEvaluationData {
  submission_id: string;
  word_count: number;
  character_count?: number;
  overall_score: number;             // 0 - 100
  cefr_band: CEFRBand;
  rubric_scores: CambridgeRubricScores;
  lexical_distribution: LexicalDistribution;
  grammar_issues: GrammarIssue[];
  strengths_th: string[];
  improvements_th: string[];
  evaluated_at?: string;
}

export interface WritingEvaluationRequest {
  prompt_id: string;
  essay_type?: 'essay' | 'letter' | 'report' | 'article' | 'review';
  target_cefr: CEFRBand;
  submission_text: string;
  min_words?: number;
  max_words?: number;
}

export interface WritingEvaluationResponse {
  success: boolean;
  data?: WritingEvaluationData;
  error?: string;
  message?: string;
}

export interface WritingPromptItem {
  id: string;
  title: string;
  taskType: 'essay' | 'letter' | 'report' | 'article' | 'review';
  cefrLevel: CEFRBand;
  topic: string;
  prompt: string;
  bulletPoints?: string[];
  minWords: number;
  maxWords: number;
  suggestedTimeMinutes: number;
  targetKeywords?: string[];
}
