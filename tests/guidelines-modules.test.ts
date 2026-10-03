import { describe, it, expect } from 'vitest';
import { GRAMMAR_BANK } from '../data/grammarBank';
import {
  IN_ON_AT_CHEAT_SHEET,
  SPORTS_VERBS_CHEAT_SHEET,
  DO_MAKE_CHEAT_SHEET,
  OOPT_ARCHITECTURE_GUIDE,
} from '../data/cheatSheets';
import {
  getAllPart2MeaningQuestions,
  sanitizePart2ForClient,
  evaluatePart2Answer,
  getAllPart3ClozePassages,
  sanitizePart3ForClient,
  evaluatePart3Answers,
} from '../lib/questions/oopt-modules';
import {
  getAllListeningExercises,
  getAllListeningQuestions,
  sanitizeListeningQuestionForClient,
  evaluateListeningAnswer,
} from '../lib/questions/listening-questions';

describe('Synthesized Guidelines & Curriculum Suite', () => {
  describe('Expanded Grammar Bank (14 CEFR Topics)', () => {
    it('should contain 14 comprehensive CEFR grammar topics derived from guideline materials', () => {
      expect(GRAMMAR_BANK.length).toBe(14);
      
      const ids = GRAMMAR_BANK.map((t) => t.id);
      expect(ids).toContain('grammar-a1-present-tenses');
      expect(ids).toContain('grammar-a1-prepositions-time-place');
      expect(ids).toContain('grammar-a2-past-vs-perfect');
      expect(ids).toContain('grammar-a2-sports-play-do-go');
      expect(ids).toContain('grammar-a2-action-do-make');
      expect(ids).toContain('grammar-a2-nouns-quantifiers');
      expect(ids).toContain('grammar-a2-pronouns-reflexive');
      expect(ids).toContain('grammar-b1-causative-permission');
      expect(ids).toContain('grammar-b1-collocations-phrasal-verbs');
      expect(ids).toContain('grammar-b1-conditionals');
      expect(ids).toContain('grammar-b1-conversational-meaning');
      expect(ids).toContain('grammar-b2-passive-relative');
      expect(ids).toContain('grammar-b2-gerund-infinitive-shift');
      expect(ids).toContain('grammar-c1-inversion-mixed');
    });

    it('each topic must have complete rules, common mistakes, and practice questions', () => {
      for (const topic of GRAMMAR_BANK) {
        expect(topic.titleEn.length).toBeGreaterThan(0);
        expect(topic.titleTh.length).toBeGreaterThan(0);
        expect(topic.rules.length).toBeGreaterThanOrEqual(2);
        expect(topic.commonMistakes.length).toBeGreaterThanOrEqual(1);
        expect(topic.practiceQuestions.length).toBeGreaterThanOrEqual(1);
        
        for (const q of topic.practiceQuestions) {
          expect(q.options?.length).toBe(4);
          const correctOpt = q.options?.filter((o) => o.isCorrect);
          expect(correctOpt?.length).toBe(1);
        }
      }
    });
  });

  describe('High-Yield Cheat Sheets', () => {
    it('In-On-At cheat sheet must have 6 categories and interactive quiz', () => {
      expect(IN_ON_AT_CHEAT_SHEET.entries.length).toBe(6);
      expect(IN_ON_AT_CHEAT_SHEET.quiz.length).toBe(4);
      for (const q of IN_ON_AT_CHEAT_SHEET.quiz) {
        expect(q.options).toContain(q.correctAnswer);
      }
    });

    it('Play-Do-Go sports matrix must have 3 clear groups and quiz', () => {
      expect(SPORTS_VERBS_CHEAT_SHEET.entries.length).toBe(3);
      expect(SPORTS_VERBS_CHEAT_SHEET.quiz.length).toBe(2);
    });

    it('Do vs Make matrix must have 2 functional categories and quiz', () => {
      expect(DO_MAKE_CHEAT_SHEET.entries.length).toBe(2);
      expect(DO_MAKE_CHEAT_SHEET.quiz.length).toBe(2);
    });

    it('OOPT architecture guide must detail 0-120 score scale and 2 main parts', () => {
      expect(OOPT_ARCHITECTURE_GUIDE.scoreScale.length).toBe(7);
      expect(OOPT_ARCHITECTURE_GUIDE.sections.length).toBe(2);
      expect(OOPT_ARCHITECTURE_GUIDE.sections[0].subparts.length).toBe(3);
    });
  });

  describe('OOPT Part 2: Focus on Meaning in Conversation', () => {
    it('should load 20 original dialogue items with 3 options each', () => {
      const items = getAllPart2MeaningQuestions();
      expect(items.length).toBe(20);
      
      for (const it of items) {
        expect(it.options.length).toBe(3);
        expect(['A', 'B', 'C']).toContain(it.correct_answer);
        expect(it.explanation_th.length).toBeGreaterThan(10);
      }
    });

    it('should sanitize Part 2 items by omitting correct answer and explanations', () => {
      const item = getAllPart2MeaningQuestions()[0];
      const client = sanitizePart2ForClient(item);
      
      expect(client.id).toBe(item.id);
      expect((client as any).correct_answer).toBeUndefined();
      expect((client as any).explanation_th).toBeUndefined();
      expect((client as any).explanation_en).toBeUndefined();
    });

    it('should evaluate user answers server-side with rich feedback', () => {
      const item = getAllPart2MeaningQuestions()[0];
      const correctEval = evaluatePart2Answer(item.id, item.correct_answer);
      expect(correctEval.isCorrect).toBe(true);
      expect(correctEval.explanationTh).toBe(item.explanation_th);

      const wrongEval = evaluatePart2Answer(item.id, item.correct_answer === 'A' ? 'B' : 'A');
      expect(wrongEval.isCorrect).toBe(false);
    });
  });

  describe('OOPT Part 3: Open Cloze Connected Texts', () => {
    it('should load 6 authentic passages with 7 gaps each (42 gaps total)', () => {
      const passages = getAllPart3ClozePassages();
      expect(passages.length).toBe(6);
      
      const totalGaps = passages.reduce((acc, p) => acc + p.gaps.length, 0);
      expect(totalGaps).toBe(42);
    });

    it('should sanitize Part 3 passages for client by withholding target words', () => {
      const p = getAllPart3ClozePassages()[0];
      const client = sanitizePart3ForClient(p);
      
      expect(client.id).toBe(p.id);
      expect(client.gaps.length).toBe(7);
      for (const g of client.gaps) {
        expect((g as any).target_word).toBeUndefined();
        expect((g as any).acceptable_answers).toBeUndefined();
      }
    });

    it('should evaluate open cloze answers case-insensitively', () => {
      const p = getAllPart3ClozePassages()[0];
      const answers: Record<number, string> = {};
      p.gaps.forEach((g) => {
        answers[g.gap_number] = g.target_word.toUpperCase(); // test case-insensitivity
      });

      const res = evaluatePart3Answers(p.id, answers);
      expect(res.score).toBe(7);
      expect(res.totalGaps).toBe(7);
      expect(res.results.every((r) => r.is_correct)).toBe(true);
    });
  });

  describe('Comprehensive Listening Bank & Engine (10 Exercises)', () => {
    it('should contain 10 authentic listening tasks across A1 to C1', () => {
      const exercises = getAllListeningExercises();
      expect(exercises.length).toBe(10);

      const levels = exercises.map((e) => e.cefrLevel);
      expect(levels).toContain('A1');
      expect(levels).toContain('A2');
      expect(levels).toContain('B1');
      expect(levels).toContain('B2');
      expect(levels).toContain('C1');
    });

    it('all exercises must have audio scripts, speed options, and valid 4-choice questions', () => {
      const exercises = getAllListeningExercises();
      for (const ex of exercises) {
        expect(ex.title.length).toBeGreaterThan(0);
        expect(ex.audioScript.length).toBeGreaterThan(50);
        expect(ex.audioSpeedOptions.length).toBeGreaterThanOrEqual(3);
        expect(ex.questions.length).toBeGreaterThanOrEqual(1);

        for (const q of ex.questions) {
          expect(q.options.length).toBe(4);
          const correctOpts = q.options.filter((o) => o.isCorrect);
          expect(correctOpts.length).toBe(1);
          expect(q.explanationTh.length).toBeGreaterThan(10);
        }
      }
    });

    it('should sanitize listening questions for client by omitting isCorrect flags', () => {
      const allQ = getAllListeningQuestions();
      expect(allQ.length).toBeGreaterThanOrEqual(15);

      const first = allQ[0];
      const sanitized = sanitizeListeningQuestionForClient(first, first.exerciseId);

      expect(sanitized.id).toBe(first.id);
      expect(sanitized.exerciseId).toBe(first.exerciseId);
      for (const opt of sanitized.options) {
        expect((opt as any).isCorrect).toBeUndefined();
        expect((opt as any).feedbackTh).toBeUndefined();
      }
    });

    it('should evaluate listening answers server-side correctly', () => {
      const allQ = getAllListeningQuestions();
      const first = allQ[0];
      const correctOpt = first.options.find((o) => o.isCorrect)!;

      const evalCorrect = evaluateListeningAnswer(first.id, correctOpt.key);
      expect(evalCorrect).not.toBeNull();
      expect(evalCorrect!.isCorrect).toBe(true);
      expect(evalCorrect!.correctAnswerKey).toBe(correctOpt.key);

      const wrongKey = correctOpt.key === 'A' ? 'B' : 'A';
      const evalWrong = evaluateListeningAnswer(first.id, wrongKey);
      expect(evalWrong!.isCorrect).toBe(false);
    });
  });

  describe('Personal Health Invariant Audit', () => {
    it('must have ZERO mentions of shrimp, crab, or shellfish across all synthesized materials', () => {
      const banned = ['shrimp', 'crab', 'prawn', 'lobster', 'crayfish', 'shellfish', 'กุ้ง', 'ปู'];
      
      const grammarStr = JSON.stringify(GRAMMAR_BANK).toLowerCase();
      const p2Str = JSON.stringify(getAllPart2MeaningQuestions()).toLowerCase();
      const p3Str = JSON.stringify(getAllPart3ClozePassages()).toLowerCase();
      const cheatStr = JSON.stringify([IN_ON_AT_CHEAT_SHEET, SPORTS_VERBS_CHEAT_SHEET, DO_MAKE_CHEAT_SHEET]).toLowerCase();
      const listenStr = JSON.stringify(getAllListeningExercises()).toLowerCase();

      for (const word of banned) {
        expect(grammarStr.includes(word)).toBe(false);
        expect(p2Str.includes(word)).toBe(false);
        expect(p3Str.includes(word)).toBe(false);
        expect(cheatStr.includes(word)).toBe(false);
        expect(listenStr.includes(word)).toBe(false);
      }
    });
  });
});
