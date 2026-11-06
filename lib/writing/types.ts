import { CEFRLevel } from '@/types';

export type CEFRBand = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface WritingPrompt {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  targetExam?: string;
  taskType: 'Essay' | 'Email' | 'Article' | 'Report' | 'Review' | 'ShortPrompt';
  promptTh: string;
  promptEn: string;
  minWords: number;
  maxWords: number;
  topic?: string;
  guidelinesTh?: string[];
  usefulPhrases?: Array<{ phrase: string; meaningTh: string }>;
  sampleModelAnswer?: string;
  rubrics?: Array<{ criterion: string; descriptionTh: string; maxScore: number }>;
}

export interface RubricDimensionScore {
  score: number; // 0 - 100
  cefrBand: CEFRLevel;
  feedbackTh: string;
  feedbackEn: string;
}

export interface TaskAchievementScore extends RubricDimensionScore {
  wordCount: number;
  targetMinWords: number;
  targetMaxWords: number;
  wordCountCompliance: 'underlength' | 'optimal' | 'overlength';
  topicRelevanceScore: number; // 0 - 100
}

export interface CoherenceCohesionScore extends RubricDimensionScore {
  transitionCount: number;
  transitionDensity: number; // transitions per 100 words
  paragraphCount: number;
  discourseMarkersUsed: string[];
}

export interface LexicalResourceScore extends RubricDimensionScore {
  typeTokenRatio: number; // unique words / total words
  lexicalDensity: number; // content words ratio
  awlCount: number;
  awlWordsUsed: string[];
  cefrDistribution: {
    a1_a2: number; // percentage
    b1_b2: number;
    c1_c2: number;
    academic: number;
  };
}

export interface GrammaticalRangeScore extends RubricDimensionScore {
  averageSentenceLength: number;
  complexSentenceRatio: number; // percentage of complex/compound sentences
  errorDensity: number; // errors per 100 words
  detectedIssues: GrammarIssue[];
}

export interface GrammarIssue {
  id?: string;
  sentenceIndex?: number;
  sentenceText?: string;
  issueType?: 'subject_verb' | 'repetition' | 'length' | 'punctuation' | 'capitalization' | 'spelling_heuristic';
  severity?: 'warning' | 'suggestion';
  messageTh?: string;
  messageEn?: string;
  suggestion?: string;
  offset?: number;
  length?: number;
  original_text?: string;
  replacement?: string;
  rule_id?: string;
  explanation_th?: string;
}

export interface SentenceAnalysisItem {
  index: number;
  text: string;
  wordCount: number;
  isComplex: boolean;
  transitionsFound: string[];
  cefrEstimate: CEFRLevel;
  hasIssue: boolean;
  issueDetail?: string;
}

export interface ActionableSuggestion {
  priority: 'high' | 'medium' | 'low';
  dimension: 'task' | 'coherence' | 'lexical' | 'grammar';
  titleTh: string;
  titleEn: string;
  detailTh: string;
  detailEn: string;
}

export interface WritingEvaluationResult {
  submissionId: string;
  promptId: string;
  targetCefr: CEFRLevel;
  overallScore: number; // 0 - 100
  cefrBand: CEFRLevel;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  
  // 4-Axis Rubric Breakdown
  taskAchievement: TaskAchievementScore;
  coherenceCohesion: CoherenceCohesionScore;
  lexicalResource: LexicalResourceScore;
  grammaticalRange: GrammaticalRangeScore;
  
  // Granular Feedback
  sentences: SentenceAnalysisItem[];
  suggestions: ActionableSuggestion[];
  
  // B2 Readiness Audit
  b2GapAnalysis: {
    isB2Ready: boolean;
    distanceToB2: number; // Positive = exceeded, Negative = gap
    summaryTh: string;
    summaryEn: string;
  };
  
  evaluatedAt: string;
}

// Cambridge Rubric and Evaluation Data (TASK-02 Legacy & Notion spec parity)
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
