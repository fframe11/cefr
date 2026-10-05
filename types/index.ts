export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export type CambridgeExamCode = 'KET' | 'PET' | 'FCE' | 'CAE';

export interface CEFRLevelInfo {
  level: CEFRLevel;
  nameEn: string;
  nameTh: string;
  cambridgeEquivalent: string;
  cambridgeScaleRange: [number, number];
  descriptionTh: string;
  descriptionEn: string;
  canDoDescriptorsTh: string[];
}

export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'true_false'
  | 'matching'
  | 'ordering'
  | 'sentence_transformation';

export interface QuestionOption {
  key: string;
  text: string;
  isCorrect: boolean;
  feedbackTh: string;
}

export interface Question {
  id: string;
  skill: SkillType;
  cefrLevel: CEFRLevel;
  type: QuestionType;
  promptTh: string;
  promptEn: string;
  contextPassage?: string;
  audioScript?: string;
  audioUrl?: string;
  options?: QuestionOption[];
  correctAnswer?: string; // For fill_blank or sentence transformation
  matchingPairs?: { left: string; right: string }[];
  orderingItems?: string[];
  explanationTh: string;
  explanationEn: string;
  weaknessTag: string; // e.g., 'present_perfect', 'preposition_of_place', 'phrasal_verbs'
  difficultyWeight: number; // 1-5
}

export interface VocabularyWord {
  id: string;
  word: string;
  lemma: string;
  cefrLevel: CEFRLevel;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'phrase';
  ipa: string;
  meaningTh: string;
  meaningEn: string;
  exampleSentenceEn: string;
  exampleSentenceTh: string;
  topic: string;
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  masteryPercentage: number; // 0-100
  reviewCount: number;
  lastReviewed?: string;
  targetExams?: string[];
  ieltsBand?: string;
  isDailyLife?: boolean;
}

export interface GrammarRule {
  formula: string;
  explanationTh: string;
  explanationEn?: string;
  exampleEn: string;
  exampleTh: string;
}

export interface GrammarMistake {
  incorrect: string;
  correct: string;
  reasonTh: string;
  reasonEn?: string;
}

export interface GrammarTopic {
  id: string;
  titleEn: string;
  titleTh: string;
  cefrLevel: CEFRLevel;
  summaryTh: string;
  conceptTh: string;
  conceptEn: string;
  rules: GrammarRule[];
  commonMistakes: GrammarMistake[];
  practiceQuestions: Question[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  targetExam: CambridgeExamCode;
  topic: string;
  content: string;
  wordCount: number;
  vocabularyGlossary: { word: string; meaningTh: string }[];
  questions: Question[];
}

export interface ListeningExercise {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  targetExam: CambridgeExamCode;
  speakerAccents: string;
  audioScript: string;
  audioSpeedOptions: number[];
  audioUrl?: string;
  questions: Question[];
}

export interface WritingPrompt {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  targetExam: CambridgeExamCode;
  taskType: 'Email' | 'Essay' | 'Article' | 'Story' | 'Review';
  promptTh: string;
  promptEn: string;
  minWords: number;
  maxWords: number;
  guidelinesTh: string[];
  usefulPhrases: { phrase: string; meaningTh: string }[];
  sampleModelAnswer: string;
  rubrics: { criterion: string; descriptionTh: string; maxScore: number }[];
}

export interface SpeakingPrompt {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  targetExam: CambridgeExamCode;
  part: number; // Part 1 (Interview), Part 2 (Long turn / Photo), Part 3 (Collaborative), Part 4 (Discussion)
  promptTh: string;
  promptEn: string;
  guidingQuestionsTh: string[];
  targetPhrases: string[];
  modelAnswer: string;
}

export interface MockExamSection {
  id: string;
  name: string;
  skill: SkillType;
  durationMinutes: number;
  questionCount: number;
  questions: Question[];
}

export interface MockExam {
  id: string;
  examCode: CambridgeExamCode;
  name: string;
  targetCefr: CEFRLevel;
  descriptionTh: string;
  totalDurationMinutes: number;
  passingScore: number;
  sections: MockExamSection[];
}

export interface UserSkillStats {
  vocabulary: number; // 0-100
  grammar: number;
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
}

export interface UserProgressState {
  currentLevel: CEFRLevel;
  estimatedCambridgeScore: number;
  streakDays: number;
  dailyGoalMinutes: number;
  minutesStudiedToday: number;
  skillStats: UserSkillStats;
  completedQuestionIds: string[];
  masteredWordIds: string[];
  weakTopics: { tag: string; labelTh: string; errorCount: number; lastFailedAt: string }[];
  assessmentCompleted: boolean;
  targetExam: CambridgeExamCode;
  englishSnapshot?: {
    overallLevel: CEFRLevel;
    estimatedCambridgeScore: number;
    strongSkill: string;
    growthArea: string;
    nextStepRecommendation: string;
    completedAt: string;
  };
  lastActivity?: {
    type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking' | 'mockExam' | 'assessment';
    title: string;
    detail: string;
    timestamp: string;
  };
  quickWinCompleted?: boolean;
}

export * from './campaign';
