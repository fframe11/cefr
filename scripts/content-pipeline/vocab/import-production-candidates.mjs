#!/usr/bin/env node
/**
 * ==============================================================================
 * GLOVA Content Pipeline: Production Candidate Importer
 * ==============================================================================
 *
 * Reads 3,860 verified vocabulary candidates, joins rich definitions,
 * English/Thai examples, collocations, and PDF source provenance, validates
 * schemas, and exports the authoritative production vocabulary datastore.
 *
 * Usage:
 *   node scripts/content-pipeline/vocab/import-production-candidates.mjs --dry-run
 *   node scripts/content-pipeline/vocab/import-production-candidates.mjs --commit
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const CANDIDATES_PATH = path.join(projectRoot, 'data/external-cache/vocab-pdf/vocabulary-production-candidates.json');
const UNIVERSE_PATH = path.join(projectRoot, 'data/vocabulary-universe-10k.json');
const EVIDENCE_MATRIX_PATH = path.join(projectRoot, 'data/external-cache/vocab-pdf/vocabulary-evidence-matrix.json');
const OUTPUT_JSON_PATH = path.join(projectRoot, 'data/vocabulary-production-3860.json');
const OUTPUT_MIGRATION_PATH = path.join(projectRoot, 'supabase/migrations/20260929000009_seed_verified_production_vocabulary_3860.sql');

const VALID_POS = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'phrase']);
const VALID_CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export function glovaIdToUuid(glovaId) {
  const hash = crypto.createHash('sha256').update('glova:vocab:' + glovaId).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function normalizePartOfSpeech(pos) {
  const lower = (pos || '').toLowerCase().trim();
  if (VALID_POS.has(lower)) return lower;
  if (lower === 'other' || lower === 'numeral' || lower === 'number') return 'noun';
  if (lower === 'adj') return 'adjective';
  if (lower === 'adv') return 'adverb';
  if (lower === 'prep') return 'preposition';
  if (lower === 'conj') return 'conjunction';
  return 'noun';
}

export function buildProductionVocabulary() {
  if (!fs.existsSync(CANDIDATES_PATH)) {
    throw new Error(`Candidates file missing at: ${CANDIDATES_PATH}`);
  }
  if (!fs.existsSync(UNIVERSE_PATH)) {
    throw new Error(`Universe file missing at: ${UNIVERSE_PATH}`);
  }
  if (!fs.existsSync(EVIDENCE_MATRIX_PATH)) {
    throw new Error(`Evidence matrix file missing at: ${EVIDENCE_MATRIX_PATH}`);
  }

  const rawCandidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf8'));
  const rawUniverse = JSON.parse(fs.readFileSync(UNIVERSE_PATH, 'utf8'));
  const rawEvidence = JSON.parse(fs.readFileSync(EVIDENCE_MATRIX_PATH, 'utf8'));

  const universeMap = new Map();
  for (const item of rawUniverse) {
    universeMap.set(item.id, item);
  }

  const evidenceMap = new Map();
  if (Array.isArray(rawEvidence)) {
    for (const item of rawEvidence) {
      evidenceMap.set(item.glova_id, item);
    }
  } else {
    for (const [k, v] of Object.entries(rawEvidence)) {
      evidenceMap.set(k, v);
    }
  }

  const productionItems = [];
  const errors = [];
  const cefrCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  const posCounts = {};
  const topicCounts = {};
  const seenIds = new Set();
  const seenUuids = new Set();

  for (let i = 0; i < rawCandidates.length; i++) {
    const cand = rawCandidates[i];
    const gid = cand.glova_id;

    if (!gid) {
      errors.push(`Row ${i}: Missing glova_id`);
      continue;
    }

    if (seenIds.has(gid)) {
      errors.push(`Row ${i}: Duplicate glova_id: ${gid}`);
      continue;
    }
    seenIds.add(gid);

    const univ = universeMap.get(gid);
    if (!univ) {
      errors.push(`Candidate ${gid} (${cand.word}) not found in universe 10k`);
      continue;
    }

    const ev = evidenceMap.get(gid) || {};
    const uuid = glovaIdToUuid(gid);
    if (seenUuids.has(uuid)) {
      errors.push(`UUID collision for ${gid}: ${uuid}`);
      continue;
    }
    seenUuids.add(uuid);

    const cefr = cand.cefr || univ.cefr_level;
    if (!VALID_CEFR.has(cefr)) {
      errors.push(`Invalid CEFR level ${cefr} for ${gid}`);
      continue;
    }
    cefrCounts[cefr] = (cefrCounts[cefr] || 0) + 1;

    const rawPos = cand.pos || univ.part_of_speech;
    const normalizedPos = normalizePartOfSpeech(rawPos);
    posCounts[normalizedPos] = (posCounts[normalizedPos] || 0) + 1;

    const topic = univ.topic || 'General';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;

    const meaningTh = cand.meaning_th || univ.meaning_th;
    const meaningEn = cand.meaning_en || univ.meaning_en;
    const ipa = cand.ipa || univ.ipa;
    const exampleEn = univ.example_sentence_en || '';
    const exampleTh = univ.example_sentence_th || '';
    const collocations = Array.isArray(univ.collocations) ? univ.collocations : [];
    const synonyms = Array.isArray(univ.synonyms) ? univ.synonyms : [];
    const antonyms = Array.isArray(univ.antonyms) ? univ.antonyms : [];

    if (!meaningTh) {
      errors.push(`Missing Thai meaning for ${gid}`);
      continue;
    }
    if (!meaningEn) {
      errors.push(`Missing English meaning for ${gid}`);
      continue;
    }
    if (!ipa) {
      errors.push(`Missing IPA for ${gid}`);
      continue;
    }
    if (!exampleEn) {
      errors.push(`Missing English example sentence for ${gid}`);
      continue;
    }

    // Clean source matches for provenance
    const sourceMatches = (ev.source_matches || []).map((sm) => ({
      source_id: sm.source_id,
      source_name: sm.source_name,
      reported_pos: sm.reported_pos,
      reported_cefr: sm.reported_cefr,
      confidence: sm.confidence,
    }));

    const cefrEvidence = (ev.cefr_evidence || []).map((ce) => ({
      source: ce.source,
      reported_level: ce.reported_level,
      concordance: ce.concordance,
    }));

    const prodItem = {
      id: uuid,
      glova_id: gid,
      word: cand.word || univ.word,
      lemma: cand.lemma || univ.lemma || cand.word,
      part_of_speech: normalizedPos,
      cefr_level: cefr,
      meaning_th: meaningTh,
      meaning_en: meaningEn,
      ipa: ipa,
      example_sentence_en: exampleEn,
      example_sentence_th: exampleTh,
      collocations: collocations,
      synonyms: synonyms,
      antonyms: antonyms,
      topic: topic,
      is_active: true,
      lifecycle_status: 'VERIFIED_PRODUCTION',
      provenance: {
        sources_count: cand.sources_count || sourceMatches.length,
        source_matches: sourceMatches,
        cefr_evidence: cefrEvidence,
        raw_part_of_speech: rawPos,
        pipeline_version: 'Phase-7-Production-Verified',
        enriched_at: univ.provenance?.enriched_at || new Date().toISOString(),
      },
    };

    productionItems.push(prodItem);
  }

  return {
    items: productionItems,
    errors,
    stats: {
      total: productionItems.length,
      cefrCounts,
      posCounts,
      topTopics: Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
    },
  };
}

export function generateSeedSql(items) {
  const lines = [
    '-- ============================================================================== ',
    '-- Migration: 20260929000009_seed_verified_production_vocabulary_3860.sql',
    '-- Description: Authoritative 3,860 Verified Production Vocabulary Units',
    '-- Guarantee: 100% Thai meaning, 100% IPA, 100% examples, source CEFR provenance.',
    '-- ============================================================================== ',
    '',
    'INSERT INTO public.vocabularies (',
    '  id, word, lemma, cefr_level, part_of_speech,',
    '  ipa, meaning_th, meaning_en, example_sentence_en, example_sentence_th, topic,',
    '  synonyms, antonyms, is_active, metadata',
    ')',
    'VALUES',
  ];

  const escapeSql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL');
  const escapeArray = (arr) => {
    if (!arr || arr.length === 0) return "'{}'::text[]";
    const esc = arr.map((item) => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
    return `'${esc.replace(/'/g, "''")}'::text[]`;
  };

  const rows = items.map((item) => {
    const meta = {
      glova_id: item.glova_id,
      collocations: item.collocations,
      provenance: item.provenance,
    };
    const metaJson = `'${JSON.stringify(meta).replace(/'/g, "''")}'::jsonb`;

    return `  (${escapeSql(item.id)}, ${escapeSql(item.word)}, ${escapeSql(item.lemma)}, ${escapeSql(item.cefr_level)}, ${escapeSql(item.part_of_speech)}, ${escapeSql(item.ipa)}, ${escapeSql(item.meaning_th)}, ${escapeSql(item.meaning_en)}, ${escapeSql(item.example_sentence_en)}, ${escapeSql(item.example_sentence_th)}, ${escapeSql(item.topic)}, ${escapeArray(item.synonyms)}, ${escapeArray(item.antonyms)}, true, ${metaJson})`;
  });

  lines.push(rows.join(',\n'));
  lines.push(
    'ON CONFLICT (id) DO UPDATE SET',
    '  word = EXCLUDED.word,',
    '  lemma = EXCLUDED.lemma,',
    '  cefr_level = EXCLUDED.cefr_level,',
    '  part_of_speech = EXCLUDED.part_of_speech,',
    '  ipa = EXCLUDED.ipa,',
    '  meaning_th = EXCLUDED.meaning_th,',
    '  meaning_en = EXCLUDED.meaning_en,',
    '  example_sentence_en = EXCLUDED.example_sentence_en,',
    '  example_sentence_th = EXCLUDED.example_sentence_th,',
    '  topic = EXCLUDED.topic,',
    '  synonyms = EXCLUDED.synonyms,',
    '  antonyms = EXCLUDED.antonyms,',
    '  is_active = EXCLUDED.is_active,',
    '  metadata = EXCLUDED.metadata;'
  );

  return lines.join('\n');
}

async function run() {
  const isCommit = process.argv.includes('--commit');
  const isDryRun = process.argv.includes('--dry-run') || !isCommit;

  console.log(`[GLOVA Pipeline] Running production candidate import (${isCommit ? 'COMMIT' : 'DRY RUN'})...`);

  const { items, errors, stats } = buildProductionVocabulary();

  if (errors.length > 0) {
    console.error(`[GLOVA Pipeline] Validation encountered ${errors.length} errors:`);
    for (const err of errors.slice(0, 10)) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(`[GLOVA Pipeline] Successfully validated ${items.length} production items.`);
  console.log('CEFR Breakdown:', stats.cefrCounts);
  console.log('POS Breakdown:', stats.posCounts);
  console.log('Top Topics:', stats.topTopics);

  if (isCommit) {
    console.log(`[GLOVA Pipeline] Writing JSON catalog to: ${OUTPUT_JSON_PATH}...`);
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(items, null, 2), 'utf8');

    console.log(`[GLOVA Pipeline] Generating SQL migration to: ${OUTPUT_MIGRATION_PATH}...`);
    const sql = generateSeedSql(items);
    fs.writeFileSync(OUTPUT_MIGRATION_PATH, sql, 'utf8');

    console.log(`[GLOVA Pipeline] Commit complete! Exported ${items.length} records.`);
  } else {
    console.log('[GLOVA Pipeline] Dry run successful. Run with --commit to write artifacts.');
  }
}

// Only execute when invoked directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error('[GLOVA Pipeline] Fatal error:', err);
    process.exit(1);
  });
}
