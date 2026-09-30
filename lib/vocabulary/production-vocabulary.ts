/**
 * ==============================================================================
 * GLOVA Production Vocabulary Engine
 * ==============================================================================
 *
 * High-performance, in-memory indexed repository for the 3,860 verified
 * production vocabulary items. Provides sub-millisecond retrieval, filtering,
 * random sampling for question generation, and fallback resilience.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { CEFRLevel, VocabularyWord } from '../../types';

export interface ProductionVocabularyRecord {
  id: string;
  glova_id: string;
  word: string;
  lemma: string;
  part_of_speech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'phrase';
  cefr_level: CEFRLevel;
  meaning_th: string;
  meaning_en: string;
  ipa: string;
  example_sentence_en: string;
  example_sentence_th: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  topic: string;
  is_active: boolean;
  lifecycle_status: string;
  provenance: {
    sources_count: number;
    source_matches: Array<{
      source_id: string;
      source_name: string;
      reported_pos: string;
      reported_cefr: string;
      confidence: string;
    }>;
    cefr_evidence: Array<{
      source: string;
      reported_level: string;
      concordance: string;
    }>;
    raw_part_of_speech?: string;
    pipeline_version: string;
    enriched_at: string;
  };
}

let cachedProductionList: ProductionVocabularyRecord[] | null = null;
let byIdMap: Map<string, ProductionVocabularyRecord> | null = null;
let byGlovaIdMap: Map<string, ProductionVocabularyRecord> | null = null;
let byWordMap: Map<string, ProductionVocabularyRecord> | null = null;
let byCefrMap: Map<CEFRLevel, ProductionVocabularyRecord[]> | null = null;
let byPosMap: Map<string, ProductionVocabularyRecord[]> | null = null;

function loadData(): ProductionVocabularyRecord[] {
  if (cachedProductionList) return cachedProductionList;

  try {
    const candidatePaths = [
      path.join(process.cwd(), 'data/vocabulary-production-3860.json'),
      path.join(process.cwd(), '..', 'data/vocabulary-production-3860.json'),
      path.resolve(__dirname, '../../../data/vocabulary-production-3860.json'),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      const content = fs.readFileSync(foundPath, 'utf8');
      cachedProductionList = JSON.parse(content);
    } else {
      console.warn('[ProductionVocabulary] data/vocabulary-production-3860.json not found on disk, using empty cache');
      cachedProductionList = [];
    }
  } catch (err) {
    console.error('[ProductionVocabulary] Failed to load production vocabulary JSON:', err);
    cachedProductionList = [];
  }

  // Build indexes
  byIdMap = new Map();
  byGlovaIdMap = new Map();
  byWordMap = new Map();
  byCefrMap = new Map();
  byPosMap = new Map();

  for (const item of cachedProductionList || []) {
    byIdMap.set(item.id, item);
    byGlovaIdMap.set(item.glova_id, item);
    if (item.word) {
      byWordMap.set(item.word.toLowerCase().trim(), item);
    }

    if (!byCefrMap.has(item.cefr_level)) {
      byCefrMap.set(item.cefr_level, []);
    }
    byCefrMap.get(item.cefr_level)!.push(item);

    const pos = item.part_of_speech;
    if (!byPosMap.has(pos)) {
      byPosMap.set(pos, []);
    }
    byPosMap.get(pos)!.push(item);
  }

  return cachedProductionList || [];
}

/**
 * Returns all verified production vocabulary records.
 */
export function getAllProductionVocabulary(): ProductionVocabularyRecord[] {
  return loadData();
}

/**
 * Get total count of production vocabulary items.
 */
export function getProductionVocabularyCount(): number {
  return loadData().length;
}

/**
 * Find record by UUID, glova_id, or word text (case-insensitive).
 */
export function getProductionVocabularyById(idOrGlovaIdOrWord: string): ProductionVocabularyRecord | undefined {
  loadData();
  if (!idOrGlovaIdOrWord) return undefined;
  const normalized = idOrGlovaIdOrWord.toLowerCase().trim();
  return (
    byIdMap?.get(idOrGlovaIdOrWord) ||
    byGlovaIdMap?.get(idOrGlovaIdOrWord) ||
    byWordMap?.get(normalized)
  );
}

/**
 * Get items by CEFR level.
 */
export function getProductionVocabularyByCefr(level: CEFRLevel): ProductionVocabularyRecord[] {
  loadData();
  return byCefrMap?.get(level) || [];
}

/**
 * Get items by Part of Speech.
 */
export function getProductionVocabularyByPos(pos: string): ProductionVocabularyRecord[] {
  loadData();
  return byPosMap?.get(pos) || [];
}

/**
 * Filtered search with pagination.
 */
export function searchProductionVocabulary(params: {
  cefr_level?: CEFRLevel;
  part_of_speech?: string;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}): {
  items: ProductionVocabularyRecord[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
} {
  const all = loadData();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const query = (params.search || '').trim().toLowerCase();

  const filtered = all.filter((item) => {
    if (params.cefr_level && item.cefr_level !== params.cefr_level) return false;
    if (params.part_of_speech && item.part_of_speech !== params.part_of_speech) return false;
    if (params.topic && item.topic.toLowerCase() !== params.topic.toLowerCase()) return false;
    if (query) {
      const matchWord = item.word.toLowerCase().includes(query);
      const matchLemma = item.lemma.toLowerCase().includes(query);
      const matchTh = item.meaning_th.toLowerCase().includes(query);
      const matchEn = item.meaning_en.toLowerCase().includes(query);
      const matchTopic = item.topic.toLowerCase().includes(query);
      if (!matchWord && !matchLemma && !matchTh && !matchEn && !matchTopic) return false;
    }
    return true;
  });

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Sample N random words for a given CEFR level or array of levels.
 */
export function sampleRandomVocabulary(levels: CEFRLevel | CEFRLevel[], count: number): ProductionVocabularyRecord[] {
  loadData();
  const targetLevels = Array.isArray(levels) ? levels : [levels];
  const pool: ProductionVocabularyRecord[] = [];

  for (const lvl of targetLevels) {
    const list = byCefrMap?.get(lvl) || [];
    pool.push(...list);
  }

  if (pool.length === 0) return [];

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}

/**
 * Converts a ProductionVocabularyRecord into frontend VocabularyWord model.
 */
export function recordToVocabularyWord(rec: ProductionVocabularyRecord, isMastered = false): VocabularyWord {
  return {
    id: rec.id,
    word: rec.word,
    lemma: rec.lemma,
    cefrLevel: rec.cefr_level,
    partOfSpeech: rec.part_of_speech,
    ipa: rec.ipa,
    meaningTh: rec.meaning_th,
    meaningEn: rec.meaning_en,
    exampleSentenceEn: rec.example_sentence_en,
    exampleSentenceTh: rec.example_sentence_th,
    topic: rec.topic,
    collocations: rec.collocations,
    synonyms: rec.synonyms,
    antonyms: rec.antonyms,
    masteryPercentage: isMastered ? 100 : 0,
    reviewCount: 0,
  };
}
