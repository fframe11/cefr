/**
 * Phase 6.2.35 — Full LEXiTRON Coverage Audit & Normalization Ingestion
 *
 * Audits all 83,232 English->Thai records from NECTEC LEXiTRON 2.0 (etlex):
 * 1. Measures raw records, malformed records, empty translations
 * 2. Normalizes headwords and POS categories
 * 3. Identifies multi-translation rates, multi-POS rates, exact duplicate rates
 * 4. Produces LEXITRON_RAW, LEXITRON_NORMALIZED, and LEXITRON_USABLE indices
 * 5. Generates reports/phase-6.2.35-lexitron-full-audit.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

const RAW_LEXITRON_PATH = path.join(PROJECT_ROOT, 'data/lexical-sources/lexitron/2.0/lexitron-etlex.json');
const OUTPUT_AUDIT_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.35-lexitron-full-audit.json');
const OUTPUT_USABLE_PATH = path.join(PROJECT_ROOT, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json');

export const POS_NORMALIZATION_MAP = {
  N: 'noun',
  'ีีN': 'noun',
  'ืN': 'noun',
  V: 'verb',
  VI: 'verb',
  VT: 'verb',
  'VI, VT': 'verb',
  'VT, VI': 'verb',
  PHRV: 'verb',
  PHRV0: 'verb',
  ADJ: 'adjective',
  adj: 'adjective',
  ADV: 'adverb',
  PRON: 'pronoun',
  PREP: 'preposition',
  CONJ: 'conjunction',
  INTERJ: 'interjection',
  INT: 'interjection',
  DET: 'determiner',
  IDM: 'idiom',
  SL: 'slang',
  ABBR: 'abbreviation',
  PRF: 'prefix',
  SUF: 'suffix',
};

export function auditFullLexitron({ projectRoot = PROJECT_ROOT } = {}) {
  const lexitronPath = path.join(projectRoot, 'data/lexical-sources/lexitron/2.0/lexitron-etlex.json');
  if (!fs.existsSync(lexitronPath)) {
    throw new Error(`LEXiTRON dataset not found at ${lexitronPath}`);
  }

  const rawRecords = JSON.parse(fs.readFileSync(lexitronPath, 'utf8'));
  const rawCount = rawRecords.length;

  let malformedCount = 0;
  let emptyTranslationsCount = 0;
  let withSynonymsCount = 0;
  let withAntonymsCount = 0;
  let withThaiTransliterationCount = 0;

  const rawHeadwords = new Set();
  const normalizedHeadwords = new Set();
  const posCounts = {};
  const normalizedPosCounts = {};
  const normalizedIndex = new Map(); // key: word|normalizedPos -> Array of entries
  const usableRecords = [];

  for (let i = 0; i < rawCount; i++) {
    const r = rawRecords[i];
    if (!r || typeof r !== 'object') {
      malformedCount++;
      continue;
    }

    const rawHeadword = (r.eentry || '').trim();
    const rawSearch = (r.esearch || '').trim();
    const rawTranslation = (r.tentry || '').trim();
    const rawCat = (r.ecat || 'UNKNOWN').trim();

    if (!rawTranslation) {
      emptyTranslationsCount++;
      continue; // exclude from usable
    }

    if (rawHeadword) rawHeadwords.add(rawHeadword);
    const normWord = (rawSearch || rawHeadword).toLowerCase().normalize('NFC').trim();
    if (!normWord) {
      malformedCount++;
      continue;
    }
    normalizedHeadwords.add(normWord);

    if (r.esyn && r.esyn.trim()) withSynonymsCount++;
    if (r.eant && r.eant.trim()) withAntonymsCount++;
    if (r.ethai && r.ethai.trim()) withThaiTransliterationCount++;

    posCounts[rawCat] = (posCounts[rawCat] || 0) + 1;
    const normPos = POS_NORMALIZATION_MAP[rawCat] || 'other';
    normalizedPosCounts[normPos] = (normalizedPosCounts[normPos] || 0) + 1;

    // Clean gloss by stripping parenthetical notes
    const cleanGloss = rawTranslation.replace(/\s*\(.*?\)\s*/g, '').trim();

    const usableEntry = {
      id: r.id || String(i),
      headword: normWord,
      display_headword: rawHeadword || normWord,
      raw_translation: rawTranslation,
      normalized_translation: cleanGloss || rawTranslation,
      raw_pos: rawCat,
      normalized_pos: normPos,
      synonyms: r.esyn ? r.esyn.split(';').map(s => s.trim()).filter(Boolean) : [],
      antonyms: r.eant ? r.eant.split(';').map(s => s.trim()).filter(Boolean) : [],
      thai_transliteration: r.ethai ? r.ethai.trim() : null,
      source_id: 'lexitron_2_0',
      source_version: '2.0',
      source_record_id: `lexitron:etlex:${r.id || i}`,
      license: 'NECTEC-LEXiTRON-License-Agreement-2003',
    };

    usableRecords.push(usableEntry);

    const indexKey = `${normWord}|${normPos}`;
    if (!normalizedIndex.has(indexKey)) {
      normalizedIndex.set(indexKey, []);
    }
    normalizedIndex.get(indexKey).push(usableEntry);
  }

  // Calculate multi-translation and multi-POS metrics
  let multiTranslationWordsCount = 0;
  let multiPosWordsCount = 0;
  let duplicateExactPairs = 0;
  const wordToAllEntries = new Map();

  for (const entry of usableRecords) {
    if (!wordToAllEntries.has(entry.headword)) {
      wordToAllEntries.set(entry.headword, []);
    }
    wordToAllEntries.get(entry.headword).push(entry);
  }

  const seenExactTriples = new Set();
  for (const [w, entries] of wordToAllEntries.entries()) {
    const distinctGlosses = new Set(entries.map(e => e.normalized_translation));
    if (distinctGlosses.size > 1) multiTranslationWordsCount++;

    const distinctPos = new Set(entries.map(e => e.normalized_pos));
    if (distinctPos.size > 1) multiPosWordsCount++;

    for (const e of entries) {
      const triple = `${w}|${e.raw_pos}|${e.raw_translation}`;
      if (seenExactTriples.has(triple)) {
        duplicateExactPairs++;
      } else {
        seenExactTriples.add(triple);
      }
    }
  }

  // Construct Usable Index (Map serialized as Object for fast lookups)
  const usableIndexObject = {};
  for (const [k, list] of normalizedIndex.entries()) {
    usableIndexObject[k] = list;
  }

  fs.writeFileSync(path.join(projectRoot, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json'), JSON.stringify(usableIndexObject), 'utf8');

  const auditReport = {
    phase: '6.2.35',
    dataset: 'NECTEC LEXiTRON 2.0 (English-Thai etlex)',
    generated_at: new Date().toISOString(),
    inventory_summary: {
      raw_records: rawCount,
      usable_records: usableRecords.length,
      malformed_records: malformedCount,
      empty_translations: emptyTranslationsCount,
      unique_raw_headwords: rawHeadwords.size,
      unique_normalized_headwords: normalizedHeadwords.size,
      with_synonyms_count: withSynonymsCount,
      with_synonyms_percentage: ((withSynonymsCount / rawCount) * 100).toFixed(2) + '%',
      with_antonyms_count: withAntonymsCount,
      with_antonyms_percentage: ((withAntonymsCount / rawCount) * 100).toFixed(2) + '%',
      with_thai_phonetics_count: withThaiTransliterationCount,
      with_thai_phonetics_percentage: ((withThaiTransliterationCount / rawCount) * 100).toFixed(2) + '%',
    },
    polysemy_and_ambiguity_metrics: {
      multi_translation_words_count: multiTranslationWordsCount,
      multi_translation_rate: ((multiTranslationWordsCount / normalizedHeadwords.size) * 100).toFixed(2) + '%',
      multi_pos_words_count: multiPosWordsCount,
      multi_pos_rate: ((multiPosWordsCount / normalizedHeadwords.size) * 100).toFixed(2) + '%',
      duplicate_exact_entries_count: duplicateExactPairs,
      duplicate_rate: ((duplicateExactPairs / rawCount) * 100).toFixed(2) + '%',
    },
    pos_distribution: {
      raw_categories: posCounts,
      normalized_categories: normalizedPosCounts,
    },
    artifacts_created: {
      usable_index_file: 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json',
      total_indexed_keys: Object.keys(usableIndexObject).length,
    },
  };

  fs.writeFileSync(path.join(projectRoot, 'reports/phase-6.2.35-lexitron-full-audit.json'), JSON.stringify(auditReport, null, 2), 'utf8');
  console.log(`[LEXiTRON Audit] Successfully audited ${rawCount} records. Usable: ${usableRecords.length}.`);

  return auditReport;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  auditFullLexitron();
}
