/**
 * ==============================================================================
 * GLOVA Exam-Focused Vocabulary Universe Engine (10,021 Core Exam Words)
 * ==============================================================================
 *
 * Curated, attested vocabulary specifically designed for:
 * - CEFR: A1 to C2 (Cambridge A2 Key, B1 Preliminary, B2 First, C1, C2)
 * - IELTS: Academic & General Training (Band 3.0 to 9.0, NAWL Academic Words)
 * - TOEIC: Business, Corporate, Finance, Office, Meetings, Workplace
 * - TOEFL / EOELT: Academic Lectures, Science, Humanities, Psychology
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { CEFRLevel } from '../../types';

export interface ExamVocabularyWord {
  id: string;
  word: string;
  lemma: string;
  part_of_speech: string;
  cefr_level: CEFRLevel;
  meaning_th: string;
  meaning_en: string;
  ipa: string;
  example_sentence_en: string;
  example_sentence_th: string;
  collocations: string[];
  topic: string;
  synonyms?: string[];
  antonyms?: string[];
  target_exams: string[]; // ['CEFR', 'IELTS', 'TOEIC', 'TOEFL']
  ielts_band: string;     // 'Band 6.0 - 7.0 (Academic / Competent User)'
  is_exam_core: boolean;
  is_nawl_academic: boolean;
  is_daily_life?: boolean;
}

export interface ExamUniverseQueryResult {
  items: ExamVocabularyWord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: {
    totalExamWords: number;
    cefrCount: number;
    ieltsCount: number;
    toeicCount: number;
    toeflCount: number;
    dailyLifeCount: number;
  };
}

export interface ExamUniverseQueryOptions {
  q?: string;
  exam?: 'CEFR' | 'IELTS' | 'TOEIC' | 'TOEFL' | 'DAILY' | 'DAILY_LIFE' | string;
  cefr?: CEFRLevel | string;
  ielts_band?: string;
  topic?: string;
  pos?: string;
  daily_only?: boolean;
  page?: number;
  pageSize?: number;
}

let examCache: ExamVocabularyWord[] | null = null;
let examStats = {
  totalExamWords: 10021,
  cefrCount: 10021,
  ieltsCount: 7510,
  toeicCount: 6994,
  toeflCount: 5678,
  dailyLifeCount: 3154,
};

function loadExamUniverse(): ExamVocabularyWord[] {
  if (examCache) return examCache;

  try {
    const dataPath = path.join(process.cwd(), 'data/vocabulary-exam-10k.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8');
      examCache = JSON.parse(raw) as ExamVocabularyWord[];
    } else {
      const fallbackPath = path.join(process.cwd(), 'data/vocabulary-universe-10k.json');
      const raw = fs.readFileSync(fallbackPath, 'utf8');
      examCache = JSON.parse(raw) as ExamVocabularyWord[];
    }
  } catch (err) {
    console.warn('[ExamUniverse] Failed to load exam vocabulary, returning empty:', err);
    examCache = [];
  }

  // Calculate live stats
  let cefrC = 0;
  let ieltsC = 0;
  let toeicC = 0;
  let toeflC = 0;
  let dailyC = 0;

  for (const item of examCache) {
    const exams = item.target_exams || [];
    if (exams.includes('CEFR')) cefrC++;
    if (exams.includes('IELTS')) ieltsC++;
    if (exams.includes('TOEIC')) toeicC++;
    if (exams.includes('TOEFL')) toeflC++;
    if (item.is_daily_life) dailyC++;
  }

  examStats = {
    totalExamWords: examCache.length,
    cefrCount: cefrC || examCache.length,
    ieltsCount: ieltsC,
    toeicCount: toeicC,
    toeflCount: toeflC,
    dailyLifeCount: dailyC,
  };

  return examCache;
}

export function primeExamCache(items: ExamVocabularyWord[]): void {
  examCache = items;
  let cefrC = 0;
  let ieltsC = 0;
  let toeicC = 0;
  let toeflC = 0;
  let dailyC = 0;

  for (const item of examCache) {
    const exams = item.target_exams || [];
    if (exams.includes('CEFR')) cefrC++;
    if (exams.includes('IELTS')) ieltsC++;
    if (exams.includes('TOEIC')) toeicC++;
    if (exams.includes('TOEFL')) toeflC++;
    if (item.is_daily_life) dailyC++;
  }

  examStats = {
    totalExamWords: examCache.length,
    cefrCount: cefrC || examCache.length,
    ieltsCount: ieltsC,
    toeicCount: toeicC,
    toeflCount: toeflC,
    dailyLifeCount: dailyC,
  };
}

/**
 * High-performance query engine for the 10,021 Exam Vocabulary Database
 */
export function queryExamUniverse(options: ExamUniverseQueryOptions = {}): ExamUniverseQueryResult {
  const allItems = loadExamUniverse();
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 25));

  const queryClean = (options.q || '').trim().toLowerCase();
  const examFilter = options.exam?.toUpperCase();
  const cefrFilter = options.cefr?.toUpperCase();
  const posFilter = options.pos?.toLowerCase();
  const topicFilter = options.topic?.toLowerCase();

  const matches: ExamVocabularyWord[] = [];

  for (const item of allItems) {
    if (examFilter === 'DAILY' || examFilter === 'DAILY_LIFE' || options.daily_only) {
      if (!item.is_daily_life) continue;
    } else if (examFilter && examFilter !== 'ALL' && !item.target_exams?.includes(examFilter)) {
      continue;
    }
    if (cefrFilter && item.cefr_level !== cefrFilter) continue;
    if (posFilter && item.part_of_speech.toLowerCase() !== posFilter) continue;
    if (topicFilter && item.topic.toLowerCase() !== topicFilter) continue;

    if (queryClean) {
      const matchWord = item.word.toLowerCase().includes(queryClean);
      const matchLemma = item.lemma.toLowerCase().includes(queryClean);
      const matchTh = item.meaning_th.includes(queryClean);
      const matchEn = item.meaning_en.toLowerCase().includes(queryClean);
      if (!matchWord && !matchLemma && !matchTh && !matchEn) continue;
    }

    matches.push(item);
  }

  const total = matches.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const pageItems = matches.slice(offset, offset + pageSize);

  return {
    items: pageItems,
    total,
    page,
    pageSize,
    totalPages,
    stats: examStats,
  };
}
