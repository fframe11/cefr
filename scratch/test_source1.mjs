import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchLemmaInExample } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';
import { ExampleEvidenceWarehouse } from '../scripts/content-pipeline/vocab/example-warehouse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

const p39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const units = p39.units;

const exWarehouse = new ExampleEvidenceWarehouse(PROJECT_ROOT);
const oewnData = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json'), 'utf8')).synsets;

const oewnWordMap = new Map();
for (const [id, s] of Object.entries(oewnData)) {
  const words = (s.words || []).map(w => String(w).toLowerCase());
  for (const w of words) {
    if (!oewnWordMap.has(w)) oewnWordMap.set(w, []);
    oewnWordMap.get(w).push({ synset_id: id, ...s });
  }
}

function evaluateUnit(u, resolvedBlockers = new Set(), semanticOverride = null) {
  const remainingBlockers = u.blocker_flags.filter(b => !resolvedBlockers.has(b));

  let isSemConf = (u.semantic_score >= 0.65 && u.semantic_margin >= 0.15);
  let isSemAmb = (u.semantic_score >= 0.40 && !isSemConf);
  if (semanticOverride) {
    isSemConf = semanticOverride.isSemConf;
    isSemAmb = semanticOverride.isSemAmb;
  }

  const hasCefrConflict = remainingBlockers.includes('CEFR_CONFLICT');
  const hasSourceConflict = remainingBlockers.includes('SOURCE_CONFLICT');
  const hasThai = !remainingBlockers.includes('THAI_NOT_FOUND');
  const hasSense = !remainingBlockers.includes('SENSE_NOT_FOUND');
  const hasLexicon = !remainingBlockers.includes('LEXICON_NOT_FOUND');
  const hasExample = !remainingBlockers.includes('EXAMPLE_NOT_FOUND');
  const hasIpaConfirmed = !remainingBlockers.includes('IPA_NOT_FOUND') && !remainingBlockers.includes('IPA_MULTI_VARIANT');
  const exampleReview = u.example_status === 'EXAMPLE_REVIEW';

  if (
    isSemConf &&
    hasThai &&
    hasExample &&
    hasIpaConfirmed &&
    hasSense &&
    !hasCefrConflict &&
    !hasSourceConflict &&
    hasLexicon &&
    remainingBlockers.length === 0
  ) {
    return 'AUTO_CANDIDATE';
  }

  if (
    !hasCefrConflict &&
    !hasSourceConflict &&
    hasThai &&
    hasSense &&
    hasLexicon &&
    (isSemConf || isSemAmb) &&
    (hasExample || exampleReview)
  ) {
    return 'REVIEW_REQUIRED';
  }

  return 'HOLD';
}

console.log('Testing Source 1: OEWN Examples on 5,308 units with EXAMPLE_NOT_FOUND...');
const exUnits = units.filter(u => u.blocker_flags.includes('EXAMPLE_NOT_FOUND'));

let s1_recovered = 0;
let s1_pos_fail = 0;
let s1_quality_fail = 0;
let s1_no_match = 0;
let s1_no_ex = 0;
const s1_recovered_units = new Set();

for (const u of exUnits) {
  const w = u.word.toLowerCase();
  const syns = oewnWordMap.get(w) || [];
  
  if (syns.length === 0) {
    s1_no_ex++;
    continue;
  }

  let found = false;
  let posFailed = false;
  let qualityFailed = false;
  let matchedEx = false;

  for (const s of syns) {
    if (!s.examples || s.examples.length === 0) continue;
    
    // Check POS
    const synPos = s.part_of_speech;
    if (synPos !== u.pos) {
      posFailed = true;
      continue;
    }

    for (const rawEx of s.examples) {
      const normEx = exWarehouse.normalizeSentence(rawEx);
      const quality = exWarehouse.filterExampleQuality(normEx);
      if (quality.status === 'SOURCE_REJECT') {
        qualityFailed = true;
        continue;
      }

      const match = matchLemmaInExample({ lemma: w, pos: u.pos, example: normEx });
      if (match.matched) {
        matchedEx = true;
        found = true;
        s1_recovered_units.add(u.canonical_id);
        break;
      }
    }
    if (found) break;
  }

  if (found) {
    s1_recovered++;
  } else if (matchedEx && qualityFailed) {
    s1_quality_fail++;
  } else if (posFailed) {
    s1_pos_fail++;
  } else {
    s1_no_match++;
  }
}

console.log({
  s1_total_candidates: exUnits.length,
  s1_recovered,
  s1_pos_fail,
  s1_quality_fail,
  s1_no_match,
  s1_no_ex,
});

let s1_auto = 0, s1_rev = 0, s1_hold = 0;
for (const u of units) {
  const resolved = new Set();
  if (s1_recovered_units.has(u.canonical_id)) {
    resolved.add('EXAMPLE_NOT_FOUND');
  }
  const st = evaluateUnit(u, resolved);
  if (st === 'AUTO_CANDIDATE') s1_auto++;
  else if (st === 'REVIEW_REQUIRED') s1_rev++;
  else s1_hold++;
}
console.log(`Source 1 (OEWN Examples) After Full Gates: AUTO=${s1_auto} (+${s1_auto - 342}), REV=${s1_rev} (${s1_rev - 1196}), HOLD=${s1_hold} (${s1_hold - 8483})`);
