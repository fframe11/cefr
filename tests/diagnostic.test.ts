import { describe, it, expect } from 'vitest';
import { evaluateDiagnosticAssessment, DIAGNOSTIC_QUESTIONS } from '../src/data/diagnosticAssessment';

describe('CEFR Diagnostic Assessment Engine', () => {
  it('should have 18 questions across A1 to C2', () => {
    expect(DIAGNOSTIC_QUESTIONS.length).toBe(18);

    const levels = new Set(DIAGNOSTIC_QUESTIONS.map((q) => q.cefrLevel));
    expect(levels.has('A1')).toBe(true);
    expect(levels.has('A2')).toBe(true);
    expect(levels.has('B1')).toBe(true);
    expect(levels.has('B2')).toBe(true);
    expect(levels.has('C1')).toBe(true);
    expect(levels.has('C2')).toBe(true);
  });

  it('should estimate Level A1 for beginner responses', () => {
    // Only 2 correct answers
    const answers: Record<string, string> = {
      'diag-a1-1': 'A', // correct
      'diag-a1-2': 'B', // correct
      'diag-a1-3': 'A', // wrong (correct is 'C')
    };

    const res = evaluateDiagnosticAssessment(answers);
    expect(res.estimatedLevel).toBe('A1');
    expect(res.targetExam).toBe('KET');
    expect(res.cambridgeScore).toBeLessThanOrEqual(120);
    expect(res.learningPathRecommendations.length).toBeGreaterThan(0);
  });

  it('should estimate Level B1 for intermediate score', () => {
    // 8 correct answers
    const answers: Record<string, string> = {
      'diag-a1-1': 'A', // correct
      'diag-a1-2': 'B', // correct
      'diag-a1-3': 'C', // correct
      'diag-a2-1': 'D', // correct
      'diag-a2-2': 'A', // correct
      'diag-a2-3': 'B', // correct
      'diag-b1-1': 'C', // correct
      'diag-b1-2': 'D', // correct
    };

    const res = evaluateDiagnosticAssessment(answers);
    expect(res.estimatedLevel).toBe('B1');
    expect(res.targetExam).toBe('PET');
    expect(res.cambridgeScore).toBeGreaterThanOrEqual(140);
    expect(res.cambridgeScore).toBeLessThan(160);
  });

  it('should estimate Level B2 or C1 for advanced scores', () => {
    const answers: Record<string, string> = {
      'diag-a1-1': 'A',
      'diag-a1-2': 'B',
      'diag-a1-3': 'C',
      'diag-a2-1': 'D',
      'diag-a2-2': 'A',
      'diag-a2-3': 'B',
      'diag-b1-1': 'C',
      'diag-b1-2': 'D',
      'diag-b1-3': 'A',
      'diag-b2-1': 'B',
      'diag-b2-2': 'C',
      'diag-b2-3': 'D',
    };

    const res = evaluateDiagnosticAssessment(answers);
    expect(['B2', 'C1']).toContain(res.estimatedLevel);
    expect(res.cambridgeScore).toBeGreaterThanOrEqual(160);
  });

  it('should track and isolate weakness tags for incorrect answers', () => {
    const answers: Record<string, string> = {
      'diag-a1-1': 'B', // wrong (correct is 'A')
    };

    const res = evaluateDiagnosticAssessment(answers);
    const hasSubjectVerbWeakness = res.identifiedWeaknesses.some(
      (w) => w.tag === 'present_simple_subject_verb_agreement'
    );
    expect(hasSubjectVerbWeakness).toBe(true);
  });
});
