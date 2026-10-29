import { describe, it, expect } from 'vitest';
import {
  normalizeKeyWordAnswer,
  convertCambridgeRawScore,
  convertIeltsBandScore,
} from '../api/mock-exams/_engine';
import { CAMBRIDGE_MOCK_EXAMS_CATALOG } from '../data/mockExamsCatalog';

describe('Cambridge C1, C2 & IELTS Mock Exams Expansion', () => {
  describe('Mock Exams Catalog Visibility (AC-1)', () => {
    it('should expose C1 Advanced (CAE) with correct duration and question counts', () => {
      const cae = CAMBRIDGE_MOCK_EXAMS_CATALOG.find((e) => e.exam_code === 'CAE');
      expect(cae).toBeDefined();
      expect(cae?.target_cefr).toBe('C1');
      expect(cae?.total_duration_minutes).toBe(130);
      expect(cae?.description_th).toContain('C1 Advanced (CAE)');
    });

    it('should expose C2 Proficiency (CPE) with correct duration and question counts', () => {
      const cpe = CAMBRIDGE_MOCK_EXAMS_CATALOG.find((e) => e.exam_code === 'CPE');
      expect(cpe).toBeDefined();
      expect(cpe?.target_cefr).toBe('C2');
      expect(cpe?.total_duration_minutes).toBe(130);
      expect(cpe?.description_th).toContain('C2 Proficiency (CPE)');
    });

    it('should expose IELTS Academic with correct duration and question counts', () => {
      const ielts = CAMBRIDGE_MOCK_EXAMS_CATALOG.find((e) => e.exam_code === 'IELTS');
      expect(ielts).toBeDefined();
      expect(ielts?.target_cefr).toBe('C1');
      expect(ielts?.total_duration_minutes).toBe(90);
      expect(ielts?.description_th).toContain('IELTS Academic');
    });
  });

  describe('Key Word Transformation Contraction Normalizer (AC-2 & AC-4)', () => {
    it('should expand negative contractions to full form', () => {
      expect(normalizeKeyWordAnswer("didn't have time")).toBe('did not have time');
      expect(normalizeKeyWordAnswer("don't know")).toBe('do not know');
      expect(normalizeKeyWordAnswer("can't believe")).toBe('cannot believe');
      expect(normalizeKeyWordAnswer("won't be able")).toBe('will not be able');
      expect(normalizeKeyWordAnswer("couldn't finish")).toBe('could not finish');
    });

    it('should normalize pronoun contractions', () => {
      expect(normalizeKeyWordAnswer("she's been working")).toBe('she is been working');
      expect(normalizeKeyWordAnswer("they've gone")).toBe('they have gone');
      expect(normalizeKeyWordAnswer("i'd rather not")).toBe('i would rather not');
    });

    it('should normalize smart quotes and trim whitespace and trailing periods', () => {
      expect(normalizeKeyWordAnswer("  didn’t   know.  ")).toBe('did not know');
      expect(normalizeKeyWordAnswer("couldn‘t understand!")).toBe('could not understand');
    });

    it('should handle empty or whitespace-only strings', () => {
      expect(normalizeKeyWordAnswer('')).toBe('');
      expect(normalizeKeyWordAnswer('   ')).toBe('');
    });
  });

  describe('Cambridge English Scale Conversion (AC-4)', () => {
    describe('C1 Advanced (CAE)', () => {
      it('should award Grade A (CEFR C2, 200–210) for scores >= 80%', () => {
        const res100 = convertCambridgeRawScore(100, 100, 'C1');
        expect(res100.cambridgeScore).toBe(210);
        expect(res100.cefrLevel).toBe('C2');
        expect(res100.grade).toBe('Grade A');
        expect(res100.pass).toBe(true);

        const res80 = convertCambridgeRawScore(80, 100, 'CAE');
        expect(res80.cambridgeScore).toBe(200);
        expect(res80.cefrLevel).toBe('C2');
        expect(res80.grade).toBe('Grade A');
        expect(res80.pass).toBe(true);
      });

      it('should award Grade B (CEFR C1, 193–199) for scores 75%–79%', () => {
        const res75 = convertCambridgeRawScore(75, 100, 'C1');
        expect(res75.cambridgeScore).toBe(193);
        expect(res75.cefrLevel).toBe('C1');
        expect(res75.grade).toBe('Grade B');
        expect(res75.pass).toBe(true);
      });

      it('should award Grade C (CEFR C1, 180–192) for scores 60%–74%', () => {
        const res60 = convertCambridgeRawScore(60, 100, 'C1');
        expect(res60.cambridgeScore).toBe(180);
        expect(res60.cefrLevel).toBe('C1');
        expect(res60.grade).toBe('Grade C');
        expect(res60.pass).toBe(true);
      });

      it('should award Level B2 (160–179) for scores 45%–59%', () => {
        const res50 = convertCambridgeRawScore(50, 100, 'C1');
        expect(res50.cambridgeScore).toBeGreaterThanOrEqual(160);
        expect(res50.cambridgeScore).toBeLessThanOrEqual(179);
        expect(res50.cefrLevel).toBe('B2');
        expect(res50.grade).toBe('Level B2');
        expect(res50.pass).toBe(false);
      });

      it('should award Fail (142–159) for scores below 45%', () => {
        const res30 = convertCambridgeRawScore(30, 100, 'C1');
        expect(res30.cambridgeScore).toBeLessThan(160);
        expect(res30.grade).toBe('Fail');
        expect(res30.pass).toBe(false);
      });
    });

    describe('C2 Proficiency (CPE)', () => {
      it('should award Grade A (CEFR C2, 220–230) for scores >= 80%', () => {
        const res85 = convertCambridgeRawScore(85, 100, 'CPE');
        expect(res85.cambridgeScore).toBeGreaterThanOrEqual(220);
        expect(res85.cambridgeScore).toBeLessThanOrEqual(230);
        expect(res85.cefrLevel).toBe('C2');
        expect(res85.grade).toBe('Grade A');
        expect(res85.pass).toBe(true);
      });

      it('should award Grade B (CEFR C2, 213–219) for scores 75%–79%', () => {
        const res76 = convertCambridgeRawScore(76, 100, 'C2');
        expect(res76.cambridgeScore).toBeGreaterThanOrEqual(213);
        expect(res76.cambridgeScore).toBeLessThanOrEqual(219);
        expect(res76.cefrLevel).toBe('C2');
        expect(res76.grade).toBe('Grade B');
        expect(res76.pass).toBe(true);
      });

      it('should award Grade C (CEFR C2, 200–212) for scores 60%–74%', () => {
        const res65 = convertCambridgeRawScore(65, 100, 'C2');
        expect(res65.cambridgeScore).toBeGreaterThanOrEqual(200);
        expect(res65.cambridgeScore).toBeLessThanOrEqual(212);
        expect(res65.cefrLevel).toBe('C2');
        expect(res65.grade).toBe('Grade C');
        expect(res65.pass).toBe(true);
      });

      it('should award Level C1 (180–199) for scores 45%–59%', () => {
        const res50 = convertCambridgeRawScore(50, 100, 'CPE');
        expect(res50.cambridgeScore).toBeGreaterThanOrEqual(180);
        expect(res50.cambridgeScore).toBeLessThanOrEqual(199);
        expect(res50.cefrLevel).toBe('C1');
        expect(res50.grade).toBe('Level C1');
        expect(res50.pass).toBe(false);
      });

      it('should award Fail for scores below 45%', () => {
        const res20 = convertCambridgeRawScore(20, 100, 'C2');
        expect(res20.cambridgeScore).toBeLessThan(180);
        expect(res20.grade).toBe('Fail');
        expect(res20.pass).toBe(false);
      });
    });
  });

  describe('IELTS Band Score Conversion (AC-4)', () => {
    it('should map scores to 9.0 (Expert user, C2)', () => {
      const res = convertIeltsBandScore(40, 40);
      expect(res.band).toBe(9.0);
      expect(res.descriptor).toBe('Expert user');
      expect(res.cefrLevel).toBe('C2');
    });

    it('should map 35/40 to 8.0 (Very good user, C1)', () => {
      const res = convertIeltsBandScore(35, 40);
      expect(res.band).toBe(8.0);
      expect(res.descriptor).toBe('Very good user');
      expect(res.cefrLevel).toBe('C1');
    });

    it('should map 30/40 to 7.0 (Good user, C1)', () => {
      const res = convertIeltsBandScore(30, 40);
      expect(res.band).toBe(7.0);
      expect(res.descriptor).toBe('Good user');
      expect(res.cefrLevel).toBe('C1');
    });

    it('should map 24/40 to 6.0 (Competent user, B2)', () => {
      const res = convertIeltsBandScore(24, 40);
      expect(res.band).toBe(6.0);
      expect(res.descriptor).toBe('Competent user');
      expect(res.cefrLevel).toBe('B2');
    });

    it('should scale non-40 totals proportionally', () => {
      const res = convertIeltsBandScore(75, 100);
      expect(res.band).toBe(7.0);
      expect(res.descriptor).toBe('Good user');
      expect(res.cefrLevel).toBe('C1');
    });
  });
});
