/**
 * Phase 6.2.31 — Deterministic Manifest Generator (100 Records POC)
 *
 * Selection rules:
 * - Total records: exactly 100
 * - Balanced CEFR: A1 (20), A2 (20), B1 (20), B2 (20), C1 (10), C2 (10)
 * - Multi-POS: noun, verb, adjective, adverb
 * - Polysemy & risk distribution:
 *   - A1: Includes 20 canonical records from Phase 6.2.30A (mix of clean approved + severe hold + edit required)
 *   - A2: 20 records (mix of high-frequency polysemous and monosemous)
 *   - B1: 20 records (intermediate vocabulary with multi-sense and idioms)
 *   - B2: 20 records (upper-intermediate with abstract and academic nouns/verbs)
 *   - C1: 10 records (advanced Octanove vocabulary)
 *   - C2: 10 records (mastery Octanove vocabulary)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const PHASE_6231_CEFR_TARGETS = {
  A1: 20,
  A2: 20,
  B1: 20,
  B2: 20,
  C1: 10,
  C2: 10
};

export function selectDeterministicPocRecords(projectRoot = PROJECT_ROOT) {
  const batchesDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');
  const allRecords = [];

  for (let i = 1; i <= 50; i++) {
    const batchId = `LARGE-${String(i).padStart(3, '0')}`;
    const p = path.join(batchesDir, `${batchId}.json`);
    if (!fs.existsSync(p)) continue;
    const batchData = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const r of batchData.records) {
      allRecords.push({ ...r, source_batch: batchId });
    }
  }

  // Load Phase 6.2.30A packet for authoritative A1 selection
  const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');
  let a1PacketKeys = [];
  if (fs.existsSync(packetPath)) {
    const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
    // Select 20 representative keys: 4 APPROVE, 11 EDIT_REQUIRED, 5 HOLD
    a1PacketKeys = [
      'car|noun|A1|sense:1',       // APPROVE clean automotive
      'clean|adjective|A1|sense:1', // APPROVE clean adjective
      'door|noun|A1|sense:1',      // APPROVE clean architectural
      'drink|verb|A1|sense:1',     // APPROVE clean ingestion
      'eat|verb|A1|sense:1',       // APPROVE clean ingestion
      'call|noun|A1|sense:1',      // HOLD theological divine call
      'catch|verb|A1|sense:1',     // HOLD accidental vs arrest
      'church|noun|A1|sense:1',    // HOLD denomination vs building
      'day|noun|A1|sense:1',       // HOLD Clarence Day biographical
      'father|noun|A1|sense:1',    // HOLD Catholic priest title
      'feel|verb|A1|sense:1',      // EDIT_REQUIRED public policy template
      'card|noun|A1|sense:1',      // EDIT_REQUIRED credit vs playing card
      'check|noun|A1|sense:1',     // EDIT_REQUIRED examination vs bank check
      'cut|verb|A1|sense:1',       // EDIT_REQUIRED empty template
      'dance|verb|A1|sense:1',     // EDIT_REQUIRED empty template
      'dog|noun|A1|sense:1',       // EDIT_REQUIRED template
      'down|adverb|A1|sense:1',    // APPROVE directional adverb
      'early|adverb|A1|sense:1',   // EDIT_REQUIRED time adverb
      'fast|adverb|A1|sense:1',    // APPROVE speed adverb
      'face|noun|A1|sense:1'       // APPROVE anatomical noun
    ];
  }

  const selected = [];
  const selectedKeys = new Set();

  // 1. Pick A1 records
  const a1RecordsMap = new Map();
  for (const r of allRecords) {
    if (r.cefr_level === 'A1') {
      a1RecordsMap.set(r.learning_unit_key, r);
    }
  }

  for (const key of a1PacketKeys) {
    const rec = a1RecordsMap.get(key);
    if (rec && !selectedKeys.has(key)) {
      selected.push({
        learning_unit_key: rec.learning_unit_key,
        word: rec.word,
        part_of_speech: rec.part_of_speech,
        cefr_level: rec.cefr_level,
        sense_index: rec.sense_index,
        source_batch: rec.source_batch,
        selection_rationale: 'A1 benchmark from Phase 6.2.30A packet with established empirical human audit baseline'
      });
      selectedKeys.add(key);
    }
  }

  // If any A1 missing, fill from allRecords
  for (const r of allRecords) {
    if (selected.filter(x => x.cefr_level === 'A1').length >= PHASE_6231_CEFR_TARGETS.A1) break;
    if (r.cefr_level === 'A1' && !selectedKeys.has(r.learning_unit_key)) {
      selected.push({
        learning_unit_key: r.learning_unit_key,
        word: r.word,
        part_of_speech: r.part_of_speech,
        cefr_level: r.cefr_level,
        sense_index: r.sense_index,
        source_batch: r.source_batch,
        selection_rationale: 'Deterministic A1 foundational sample across POS'
      });
      selectedKeys.add(r.learning_unit_key);
    }
  }

  // 2. Pick other levels deterministically
  const targetLevels = ['A2', 'B1', 'B2', 'C1', 'C2'];
  const posOrder = ['noun', 'verb', 'adjective', 'adverb'];

  for (const level of targetLevels) {
    const targetCount = PHASE_6231_CEFR_TARGETS[level];
    let levelPicked = 0;

    // Cycle through POS to ensure POS diversity
    let posIdx = 0;
    while (levelPicked < targetCount) {
      const targetPos = posOrder[posIdx % posOrder.length];
      const candidate = allRecords.find(r =>
        r.cefr_level === level &&
        r.part_of_speech === targetPos &&
        !selectedKeys.has(r.learning_unit_key)
      );

      if (candidate) {
        let rationale = `Deterministic ${level} ${targetPos}`;
        if (candidate.candidate_senses_preview?.length > 1) {
          rationale += ' (polysemous candidate)';
        } else {
          rationale += ' (monosemous candidate)';
        }
        if (candidate.pronunciation_variants_ipa?.length > 1) {
          rationale += ' [IPA variants]';
        }

        selected.push({
          learning_unit_key: candidate.learning_unit_key,
          word: candidate.word,
          part_of_speech: candidate.part_of_speech,
          cefr_level: candidate.cefr_level,
          sense_index: candidate.sense_index,
          source_batch: candidate.source_batch,
          selection_rationale: rationale
        });
        selectedKeys.add(candidate.learning_unit_key);
        levelPicked++;
      }
      posIdx++;
      // Guard against infinite loop if specific POS exhausted
      if (posIdx > 1000) break;
    }

    // If still short, pick any from this level
    for (const r of allRecords) {
      if (selected.filter(x => x.cefr_level === level).length >= targetCount) break;
      if (r.cefr_level === level && !selectedKeys.has(r.learning_unit_key)) {
        selected.push({
          learning_unit_key: r.learning_unit_key,
          word: r.word,
          part_of_speech: r.part_of_speech,
          cefr_level: r.cefr_level,
          sense_index: r.sense_index,
          source_batch: r.source_batch,
          selection_rationale: `Deterministic ${level} supplemental sample`
        });
        selectedKeys.add(r.learning_unit_key);
      }
    }
  }

  // Assign 1-indexed sequences
  return selected.slice(0, 100).map((r, i) => ({
    sequence: i + 1,
    ...r
  }));
}

export function generatePocManifest(projectRoot = PROJECT_ROOT) {
  const records = selectDeterministicPocRecords(projectRoot);
  const manifestPath = path.join(projectRoot, 'reports/phase-6.2.31-evidence-poc-manifest.json');

  const manifest = {
    phase: '6.2.31',
    title: 'Phase 6.2.31 Evidence-First Vocabulary POC Manifest (100 Records)',
    generated_at: new Date().toISOString(),
    total_records: records.length,
    cefr_distribution: {
      A1: records.filter(r => r.cefr_level === 'A1').length,
      A2: records.filter(r => r.cefr_level === 'A2').length,
      B1: records.filter(r => r.cefr_level === 'B1').length,
      B2: records.filter(r => r.cefr_level === 'B2').length,
      C1: records.filter(r => r.cefr_level === 'C1').length,
      C2: records.filter(r => r.cefr_level === 'C2').length
    },
    pos_distribution: {
      noun: records.filter(r => r.part_of_speech === 'noun').length,
      verb: records.filter(r => r.part_of_speech === 'verb').length,
      adjective: records.filter(r => r.part_of_speech === 'adjective').length,
      adverb: records.filter(r => r.part_of_speech === 'adverb').length
    },
    records
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Saved POC manifest to ${manifestPath} (${manifest.total_records} records)`);
  return manifest;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generatePocManifest();
}
