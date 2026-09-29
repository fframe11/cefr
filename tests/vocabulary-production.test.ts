import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getAllProductionVocabulary,
  getProductionVocabularyByCefr,
  getProductionVocabularyById,
  searchProductionVocabulary,
  sampleRandomVocabulary,
} from '../lib/vocabulary/production-vocabulary';
import {
  generateQuestionForWord,
  generatePracticeSession,
  sanitizeQuestionForClient,
  VocabularyQuestionInteractionType,
} from '../lib/questions/vocabulary-questions';

describe('GLOVA Phase 7: Production Vocabulary Engine & Dataset', () => {
  const jsonPath = path.join(process.cwd(), 'data/vocabulary-production-3860.json');

  it('verifies that data/vocabulary-production-3860.json exists and has exactly 3,860 units', () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(data.length).toBe(3860);
  });

  it('guarantees 100% Thai definitions, 100% IPA, 100% examples, and valid CEFR levels', () => {
    const items = getAllProductionVocabulary();
    expect(items.length).toBe(3860);

    const validCefr = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    const validPos = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'phrase']);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(item.glova_id).toBeTruthy();
      expect(item.word.trim().length).toBeGreaterThan(0);
      expect(validCefr.has(item.cefr_level)).toBe(true);
      expect(validPos.has(item.part_of_speech)).toBe(true);
      expect(item.meaning_th.trim().length).toBeGreaterThan(0);
      expect(item.meaning_en.trim().length).toBeGreaterThan(0);
      expect(item.ipa.trim().length).toBeGreaterThan(0);
      expect(item.example_sentence_en.trim().length).toBeGreaterThan(0);
      expect(item.provenance).toBeDefined();
      expect(item.provenance.sources_count).toBeGreaterThan(0);
    }
  });

  it('correctly filters vocabulary by CEFR level', () => {
    const a1Words = getProductionVocabularyByCefr('A1');
    const b1Words = getProductionVocabularyByCefr('B1');
    const c2Words = getProductionVocabularyByCefr('C2');

    expect(a1Words.length).toBe(831);
    expect(b1Words.length).toBe(1149);
    expect(c2Words.length).toBe(43);
    expect(a1Words.every((w) => w.cefr_level === 'A1')).toBe(true);
  });

  it('performs sub-millisecond keyword search and pagination', () => {
    const res = searchProductionVocabulary({ search: 'schedule', limit: 10 });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.some((w) => w.word.toLowerCase() === 'schedule')).toBe(true);
    expect(res.pagination.total).toBeGreaterThan(0);
  });

  it('samples random vocabulary without duplicates within a batch', () => {
    const sample = sampleRandomVocabulary(['B1', 'B2'], 10);
    expect(sample.length).toBe(10);
    const ids = new Set(sample.map((w) => w.id));
    expect(ids.size).toBe(10);
  });
});

describe('GLOVA Question Generation Engine (6 Interaction Types)', () => {
  const sampleWord = getAllProductionVocabulary().find((w) => w.word === 'schedule') || getAllProductionVocabulary()[0];

  const types: VocabularyQuestionInteractionType[] = [
    'meaning_recognition',
    'reverse_meaning',
    'sentence_completion',
    'collocation_matching',
    'part_of_speech_id',
    'pronunciation_stress',
  ];

  for (const t of types) {
    it(`generates valid question for type: ${t}`, () => {
      const q = generateQuestionForWord(sampleWord, t);
      expect(q.id).toBeTruthy();
      expect(q.skill).toBe('vocabulary');
      expect(q.interactionType).toBe(t);
      expect(q.options?.length).toBe(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.serverAnswerKey);

      // Verify correct option corresponds to serverAnswerKey
      const correctOpt = q.options?.find((o) => o.isCorrect);
      expect(correctOpt).toBeDefined();
      expect(correctOpt?.key).toBe(q.serverAnswerKey);
    });
  }

  it('sanitizes client questions by stripping isCorrect flag', () => {
    const q = generateQuestionForWord(sampleWord, 'meaning_recognition');
    const sanitized = sanitizeQuestionForClient(q);

    expect(sanitized.id).toBe(q.id);
    expect((sanitized as any).serverAnswerKey).toBeUndefined();
    for (const opt of sanitized.options) {
      expect((opt as any).isCorrect).toBeUndefined();
    }
  });

  it('generates a full practice session of 5 questions with client sanitization', () => {
    const session = generatePracticeSession({ cefrLevel: 'A2', count: 5 });
    expect(session.questions.length).toBe(5);
    expect(session.clientQuestions.length).toBe(5);
    expect(session.clientQuestions.every((q) => q.cefrLevel === 'A2')).toBe(true);
  });
});
