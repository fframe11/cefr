import { describe, it, expect } from 'vitest';
import { queryExamUniverse } from '@/lib/vocabulary/exam-universe';

describe('10,021 Exam-Focused Vocabulary Universe (CEFR, IELTS, TOEIC, TOEFL)', () => {
  it('loads the full 10,021 exam vocabulary dataset', () => {
    const res = queryExamUniverse({ page: 1, pageSize: 10 });
    expect(res.stats.totalExamWords).toBe(10021);
    expect(res.stats.cefrCount).toBe(10021);
    expect(res.stats.ieltsCount).toBeGreaterThanOrEqual(7500);
    expect(res.stats.toeicCount).toBeGreaterThanOrEqual(6900);
    expect(res.stats.toeflCount).toBeGreaterThanOrEqual(5600);
  });

  it('filters specifically for IELTS exam words', () => {
    const res = queryExamUniverse({ exam: 'IELTS', page: 1, pageSize: 50 });
    expect(res.total).toBe(7510);
    expect(res.items.length).toBe(50);
    res.items.forEach(item => {
      expect(item.target_exams).toContain('IELTS');
      expect(item.ielts_band).toBeDefined();
    });
  });

  it('filters specifically for TOEIC exam words', () => {
    const res = queryExamUniverse({ exam: 'TOEIC', page: 1, pageSize: 50 });
    expect(res.total).toBe(6994);
    expect(res.items.length).toBe(50);
    res.items.forEach(item => {
      expect(item.target_exams).toContain('TOEIC');
    });
  });

  it('filters specifically for TOEFL exam words', () => {
    const res = queryExamUniverse({ exam: 'TOEFL', page: 1, pageSize: 50 });
    expect(res.total).toBe(5678);
    expect(res.items.length).toBe(50);
    res.items.forEach(item => {
      expect(item.target_exams).toContain('TOEFL');
    });
  });

  it('returns clean pedagogical translations for core exam vocabulary', () => {
    const contractRes = queryExamUniverse({ q: 'contract', pos: 'noun' });
    const contract = contractRes.items.find(i => i.word.toLowerCase() === 'contract');
    expect(contract).toBeDefined();
    expect(contract?.meaning_th).toContain('สัญญา');
    expect(contract?.meaning_th).not.toContain('ฆาตกรรม');

    const scheduleRes = queryExamUniverse({ q: 'schedule' });
    const schedule = scheduleRes.items.find(i => i.word.toLowerCase() === 'schedule');
    expect(schedule).toBeDefined();
    expect(schedule?.meaning_th).toContain('กำหนดการ');
    expect(schedule?.target_exams).toContain('TOEIC');

    const stimulateRes = queryExamUniverse({ q: 'stimulate' });
    const stimulate = stimulateRes.items.find(i => i.word.toLowerCase() === 'stimulate');
    expect(stimulate).toBeDefined();
    expect(stimulate?.meaning_th).toContain('กระตุ้น');
    expect(stimulate?.target_exams).toContain('IELTS');
    expect(stimulate?.target_exams).toContain('TOEFL');

    const procastRes = queryExamUniverse({ q: 'procrastination' });
    const procast = procastRes.items.find(i => i.word.toLowerCase() === 'procrastination');
    expect(procast).toBeDefined();
    expect(procast?.meaning_th).toContain('ผลัดวันประกันพรุ่ง');
  });

  it('ensures every single returned exam word has complete metadata', () => {
    const res = queryExamUniverse({ page: 1, pageSize: 100 });
    res.items.forEach(item => {
      expect(item.word).toBeTruthy();
      expect(item.cefr_level).toBeTruthy();
      expect(item.meaning_th).toBeTruthy();
      expect(item.meaning_en).toBeTruthy();
      expect(item.ipa).toBeTruthy();
      expect(item.example_sentence_en).toBeTruthy();
      expect(item.example_sentence_th).toBeTruthy();
      expect(item.topic).toBeTruthy();
      expect(item.target_exams.length).toBeGreaterThan(0);
    });
  });
});
