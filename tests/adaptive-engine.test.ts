import { describe, it, expect } from 'vitest';
import {
  getAllGrammarItems,
  getGrammarItemsByCefr,
  formatGeneratedGrammarQuestion,
  sanitizeGrammarQuestionForClient,
} from '../lib/questions/grammar-questions';
import {
  getAllReadingPassages,
  getReadingPassageById,
  getAllReadingQuestions,
  formatGeneratedReadingQuestion,
  sanitizeReadingQuestionForClient,
} from '../lib/questions/reading-questions';
import {
  getAllWritingPrompts,
  getWritingPromptById,
  sanitizeWritingPromptForClient,
} from '../lib/questions/writing-prompts';
import {
  calculateProbability3PL,
  calculateItemInformation,
  initializeIRTState,
  updateIRTAbilityEAP,
  selectNextOptimalItem,
  shouldTerminateAdaptiveTest,
} from '../lib/assessment/irt-engine';
import {
  thetaToCEFR,
  thetaToScore,
  calculateAssessmentReport,
} from '../lib/assessment/cefr-mapper';
import {
  startAdaptiveExamSession,
  submitAdaptiveExamAnswer,
  getAdaptiveExamSession,
} from '../lib/assessment/adaptive-exam-engine';

describe('Adaptive CEFR Engine & Question Banks', () => {
  describe('Grammar Question Bank', () => {
    it('should load 160 calibrated grammar questions across all CEFR levels', () => {
      const all = getAllGrammarItems();
      expect(all.length).toBe(160);

      const a1 = getGrammarItemsByCefr('A1');
      const a2 = getGrammarItemsByCefr('A2');
      const b1 = getGrammarItemsByCefr('B1');
      const b2 = getGrammarItemsByCefr('B2');
      const c1 = getGrammarItemsByCefr('C1');
      const c2 = getGrammarItemsByCefr('C2');

      expect(a1.length).toBe(30);
      expect(a2.length).toBe(30);
      expect(b1.length).toBe(30);
      expect(b2.length).toBe(30);
      expect(c1.length).toBe(20);
      expect(c2.length).toBe(20);
    });

    it('should sanitize grammar questions for client to prevent answer leakage', () => {
      const raw = getAllGrammarItems()[0];
      const generated = formatGeneratedGrammarQuestion(raw);
      const clientQ = sanitizeGrammarQuestionForClient(generated);

      expect(clientQ.id).toBe(generated.id);
      expect(clientQ.promptEn).toBe(generated.promptEn);
      expect(clientQ.options.length).toBe(4);
      // Ensure sensitive keys are stripped
      expect((clientQ as any).serverAnswerKey).toBeUndefined();
      expect((clientQ as any).explanationEn).toBeUndefined();
      expect((clientQ as any).explanationTh).toBeUndefined();
      expect((clientQ as any).difficulty_b).toBeUndefined();
      clientQ.options.forEach((opt) => {
        expect((opt as any).isCorrect).toBeUndefined();
      });
    });
  });

  describe('Reading Passages Bank', () => {
    it('should load 16 reading passages with 74 comprehension items', () => {
      const passages = getAllReadingPassages();
      expect(passages.length).toBe(16);

      const allItems = getAllReadingQuestions();
      expect(allItems.length).toBe(74);

      const first = getReadingPassageById(passages[0].id);
      expect(first).toBeDefined();
      expect(first?.passage_en.length).toBeGreaterThan(50);
    });

    it('should sanitize reading questions for client and omit answers', () => {
      const allItems = getAllReadingQuestions();
      const first = allItems[0];
      const generated = formatGeneratedReadingQuestion(first.passage, first.question);
      const clientQ = sanitizeReadingQuestionForClient(generated);

      expect(clientQ.id).toBe(generated.id);
      expect((clientQ as any).serverAnswerKey).toBeUndefined();
      expect((clientQ as any).explanationEn).toBeUndefined();
      clientQ.options.forEach((opt) => {
        expect((opt as any).isCorrect).toBeUndefined();
      });
    });
  });

  describe('Writing Prompts Bank', () => {
    it('should load 12 writing prompts spanning A1 to C2 with rubrics', () => {
      const prompts = getAllWritingPrompts();
      expect(prompts.length).toBe(12);

      const pA1 = getWritingPromptById('wp_a1_001');
      expect(pA1).toBeDefined();
      expect(pA1?.scoring_rubric.task_achievement.length).toBeGreaterThan(10);
      expect(pA1?.sample_answer_en.length).toBeGreaterThan(20);
    });

    it('should sanitize writing prompts for client by withholding sample answers', () => {
      const p = getAllWritingPrompts()[0];
      const clientP = sanitizeWritingPromptForClient(p);

      expect(clientP.id).toBe(p.id);
      expect((clientP as any).sample_answer_en).toBeUndefined();
    });
  });

  describe('IRT 3PL & Fisher Information Engine', () => {
    it('should compute probability3PL matching theoretical expectations', () => {
      // theta = b, a = 1.0, c = 0.25 -> P = (1 + 0.25) / 2 = 0.625
      const item = { id: 'test_1', skill: 'grammar' as const, a: 1.0, b: 0.0, c: 0.25 };
      const pInflexion = calculateProbability3PL(0.0, item);
      expect(pInflexion).toBeCloseTo(0.625, 4);

      // Higher ability yields higher probability
      const pHigh = calculateProbability3PL(2.0, item);
      const pLow = calculateProbability3PL(-2.0, item);
      expect(pHigh).toBeGreaterThan(pInflexion);
      expect(pLow).toBeLessThan(pInflexion);
      expect(pLow).toBeGreaterThanOrEqual(0.25);
    });

    it('should compute positive Fisher information', () => {
      const item = { id: 'test_1', skill: 'grammar' as const, a: 1.2, b: 0.0, c: 0.25 };
      const info = calculateItemInformation(0.0, item);
      expect(info).toBeGreaterThan(0);
    });

    it('should estimate theta using EAP Bayesian updating', () => {
      let state = initializeIRTState();
      expect(state.theta).toBe(0.0);
      expect(state.se).toBe(1.0);

      const item1 = { id: '1', skill: 'grammar' as const, a: 1.2, b: -1.0, c: 0.25 };
      const item2 = { id: '2', skill: 'grammar' as const, a: 1.1, b: 0.0, c: 0.25 };
      const item3 = { id: '3', skill: 'grammar' as const, a: 1.3, b: 1.0, c: 0.25 };

      state = updateIRTAbilityEAP(state, { item: item1, isCorrect: true });
      state = updateIRTAbilityEAP(state, { item: item2, isCorrect: true });
      state = updateIRTAbilityEAP(state, { item: item3, isCorrect: true });

      expect(state.theta).toBeGreaterThan(0.5);
      expect(state.se).toBeLessThan(1.0);
      expect(state.itemsAnswered).toBe(3);
    });

    it('should select next item with maximum information', () => {
      const candidateItems = [
        { id: 'item_far', skill: 'grammar' as const, a: 1.0, b: 3.0, c: 0.25 },
        { id: 'item_close', skill: 'grammar' as const, a: 1.5, b: 0.1, c: 0.25 },
      ];
      const state = initializeIRTState();

      const selected = selectNextOptimalItem(candidateItems, state, new Set());
      expect(selected?.id).toBe('item_close');
    });

    it('should check convergence stopping criteria', () => {
      const convergedState = {
        theta: 0.5,
        se: 0.20,
        responses: new Array(20).fill({} as any),
        itemsAnswered: 20,
      };
      expect(shouldTerminateAdaptiveTest(convergedState, 45, 10)).toBe(true);

      const unconvergedState = {
        theta: 0.5,
        se: 0.40,
        responses: new Array(20).fill({} as any),
        itemsAnswered: 20,
      };
      expect(shouldTerminateAdaptiveTest(unconvergedState, 45, 10)).toBe(false);

      const maxReachedState = {
        theta: 0.5,
        se: 0.35,
        responses: new Array(45).fill({} as any),
        itemsAnswered: 45,
      };
      expect(shouldTerminateAdaptiveTest(maxReachedState, 45, 10)).toBe(true);
    });
  });

  describe('CEFR Mapping & Diagnostics', () => {
    it('should map theta to exact CEFR levels', () => {
      expect(thetaToCEFR(-2.2)).toBe('A1');
      expect(thetaToCEFR(-1.0)).toBe('A2');
      expect(thetaToCEFR(-0.1)).toBe('B1');
      expect(thetaToCEFR(0.8)).toBe('B2');
      expect(thetaToCEFR(1.8)).toBe('C1');
      expect(thetaToCEFR(2.6)).toBe('C2');
    });

    it('should map theta to 0-100 continuous scaled scores', () => {
      expect(thetaToScore(-3.0)).toBe(0);
      expect(thetaToScore(0.0)).toBe(50);
      expect(thetaToScore(3.0)).toBe(100);
    });

    it('should generate complete diagnostic report with can-do descriptors and recommendations', () => {
      const state = {
        theta: 0.8,
        se: 0.22,
        responses: [
          {
            item: { id: 'g1', skill: 'grammar' as const, a: 1.2, b: 0.5, c: 0.25 },
            isCorrect: true,
          },
          {
            item: { id: 'r1', skill: 'reading' as const, a: 1.1, b: 0.6, c: 0.25 },
            isCorrect: true,
          },
          {
            item: { id: 'v1', skill: 'vocabulary' as const, a: 1.3, b: 0.7, c: 0.25 },
            isCorrect: false,
          },
        ],
        itemsAnswered: 3,
      };

      const report = calculateAssessmentReport(state);

      expect(report.overallLevel).toBe('B2');
      expect(report.overallScore).toBe(63);
      expect(report.descriptor.canDoStatementsEn.length).toBeGreaterThan(0);
      expect(report.descriptor.canDoStatementsTh.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Adaptive Exam Flow', () => {
    it('should initialize session, accept answers, and update ability score', () => {
      const session = startAdaptiveExamSession('test-student-1');
      expect(session.sessionId).toBeDefined();
      expect(session.firstQuestion).toBeDefined();
      expect((session.firstQuestion as any).serverAnswerKey).toBeUndefined();

      // Submit an answer for the first question
      const q1 = session.firstQuestion;
      const selectedOptionKey = q1.options[0].key;

      const step1 = submitAdaptiveExamAnswer({
        sessionId: session.sessionId,
        questionId: q1.id,
        selectedOptionKey,
        timeSpentSeconds: 15,
      });

      expect(step1.isComplete).toBe(false);
      expect(step1.nextQuestion).toBeDefined();
      expect((step1.nextQuestion as any).serverAnswerKey).toBeUndefined();

      const retrieved = getAdaptiveExamSession(session.sessionId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.irtState.itemsAnswered).toBe(1);
    });
  });
});
