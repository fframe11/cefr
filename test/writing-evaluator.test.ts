import { describe, it, expect } from 'vitest';
import { evaluateWritingSubmission, scoreToCefrBand } from '../lib/writing/aes-engine';
import {
  extractWords,
  extractSentences,
  profileVocabulary,
  detectDiscourseMarkers,
  isComplexSentence,
} from '../lib/writing/vocabulary-profiler';

describe('AES Vocabulary Profiler & Syntactic Analyzer', () => {
  it('tokenizes words and sentences cleanly', () => {
    const sample = 'Hello world! This is an essay. It contains three sentences.';
    const words = extractWords(sample);
    const sentences = extractSentences(sample);

    expect(words).toHaveLength(10);
    expect(sentences).toHaveLength(3);
  });

  it('detects Academic Word List (AWL) items and computes TTR', () => {
    const text = 'The economic analysis indicated significant financial benefits for the community and environment.';
    const words = extractWords(text);
    const profile = profileVocabulary(words);

    expect(profile.awlCount).toBeGreaterThanOrEqual(4);
    expect(profile.awlWordsUsed).toContain('economic');
    expect(profile.awlWordsUsed).toContain('analysis');
    expect(profile.typeTokenRatio).toBeGreaterThan(0.7);
  });

  it('detects discourse markers and linking words', () => {
    const text = 'Firstly, education is vital. Furthermore, technology provides opportunities. On the other hand, privacy is critical. Consequently, policies must adapt.';
    const discourse = detectDiscourseMarkers(text);

    expect(discourse.markersUsed).toContain('firstly');
    expect(discourse.markersUsed).toContain('furthermore');
    expect(discourse.markersUsed).toContain('on the other hand');
    expect(discourse.markersUsed).toContain('consequently');
    expect(discourse.markerCount).toBeGreaterThanOrEqual(4);
  });

  it('identifies complex sentence structures accurately', () => {
    expect(isComplexSentence('Although the project was challenging, we finished on time.')).toBe(true);
    expect(isComplexSentence('Technology transforms our lives because it accelerates communication.')).toBe(true);
    expect(isComplexSentence('I wake up early in the morning.')).toBe(false);
  });
});

describe('Automated Essay Scoring (AES) Engine', () => {
  it('correctly maps scores to CEFR bands', () => {
    expect(scoreToCefrBand(15)).toBe('A1');
    expect(scoreToCefrBand(35)).toBe('A2');
    expect(scoreToCefrBand(55)).toBe('B1');
    expect(scoreToCefrBand(72)).toBe('B2');
    expect(scoreToCefrBand(88)).toBe('C1');
    expect(scoreToCefrBand(98)).toBe('C2');
  });

  it('evaluates underlength essay and penalizes Task Achievement appropriately', () => {
    const shortText = 'I like cats. Cats are cute animals.';
    const result = evaluateWritingSubmission(shortText, { minWords: 100 });

    expect(result.wordCountCompliance).toBe(undefined);
    expect(result.taskAchievement.wordCountCompliance).toBe('underlength');
    expect(result.taskAchievement.score).toBeLessThan(50);
    expect(result.overallScore).toBeLessThan(50);
    expect(result.suggestions.some((s) => s.dimension === 'task')).toBe(true);
  });

  it('evaluates B2 level essay with high score and positive B2 gap analysis', () => {
    const b2Essay = `
In modern society, learning a foreign language has become essential for career development and international communication.

Firstly, multilingual employees have a distinct competitive advantage in the global economy. Furthermore, international companies require staff who can communicate effectively with overseas clients and partners. For instance, negotiations and professional presentations depend heavily on accurate language skills.

On the other hand, mastering another language enhances cognitive flexibility and cultural empathy. Although it requires considerable discipline and daily practice, the long-term benefits are undeniable. Therefore, educational institutions should prioritize comprehensive language training programs.

In conclusion, acquiring foreign language proficiency is crucial for personal and professional growth. Consequently, students who invest time in developing their skills will secure superior career opportunities.
    `.trim();

    const result = evaluateWritingSubmission(b2Essay, {
      minWords: 100,
      maxWords: 250,
      targetCefr: 'B2',
      topic: 'education language communication',
    });

    expect(result.wordCount).toBeGreaterThan(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(65);
    expect(['B2', 'C1', 'C2']).toContain(result.cefrBand);
    expect(result.b2GapAnalysis.isB2Ready).toBe(true);
    expect(result.coherenceCohesion.transitionCount).toBeGreaterThanOrEqual(4);
    expect(result.lexicalResource.awlCount).toBeGreaterThanOrEqual(4);
  });

  it('detects Subject-Verb Agreement error heuristics', () => {
    const flawedEssay = `
He have a great opportunity to study abroad. Everyone are excited about the new policy.
They goes to the university every single day to conduct research.
    `.trim();

    const result = evaluateWritingSubmission(flawedEssay, { minWords: 20 });
    expect(result.grammaticalRange.detectedIssues.length).toBeGreaterThanOrEqual(1);
    expect(result.grammaticalRange.detectedIssues.some((i) => i.issueType === 'subject_verb')).toBe(true);
  });
});
