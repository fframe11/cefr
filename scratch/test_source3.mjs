import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

const p39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const units = p39.units;

const lexitronIndex = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json'), 'utf8'));
console.log('LEXiTRON entries loaded:', Object.keys(lexitronIndex).length);

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

console.log('Testing Source 3: LEXiTRON Lexical Evidence on units with THAI_NOT_FOUND / LEXICON_NOT_FOUND...');
const thaiUnits = units.filter(u => u.blocker_flags.includes('THAI_NOT_FOUND') || u.blocker_flags.includes('LEXICON_NOT_FOUND'));

let s3_recovered = 0;
let s3_no_entry = 0;
let s3_no_translation = 0;
const s3_recovered_units = new Set();

for (const u of thaiUnits) {
  const w = u.word.toLowerCase();
  const entry = lexitronIndex[w];
  if (!entry) {
    s3_no_entry++;
    continue;
  }

  // Check if entry has translations matching pos
  const posEntries = Array.isArray(entry) ? entry : [entry];
  const matching = posEntries.filter(e => {
    if (!e.tentry && !e.translation && !e.th) return false;
    return true;
  });

  if (matching.length > 0) {
    s3_recovered++;
    s3_recovered_units.add(u.canonical_id);
  } else {
    s3_no_translation++;
  }
}

console.log({
  s3_total_candidates: thaiUnits.length,
  s3_recovered,
  s3_no_entry,
  s3_no_translation,
});

let s3_auto = 0, s3_rev = 0, s3_hold = 0;
for (const u of units) {
  const resolved = new Set();
  if (s3_recovered_units.has(u.canonical_id)) {
    resolved.add('THAI_NOT_FOUND');
    resolved.add('LEXICON_NOT_FOUND');
  }
  const st = evaluateUnit(u, resolved);
  if (st === 'AUTO_CANDIDATE') s3_auto++;
  else if (st === 'REVIEW_REQUIRED') s3_rev++;
  else s3_hold++;
}
console.log(`Source 3 (LEXiTRON Lexical) After Full Gates: AUTO=${s3_auto} (+${s3_auto - 342}), REV=${s3_rev} (${s3_rev - 1196}), HOLD=${s3_hold} (${s3_hold - 8483})`);
