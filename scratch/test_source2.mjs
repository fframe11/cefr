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

const tatoebaBase = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json'), 'utf8'));
const tatoebaExp = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/tatoeba/2024/tatoeba-expanded-sentences.json'), 'utf8'));
const allTatoeba = [...tatoebaBase, ...tatoebaExp];

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

console.log('Testing Source 2: Existing Tatoeba Corpus on 5,308 units with EXAMPLE_NOT_FOUND...');
const exUnits = units.filter(u => u.blocker_flags.includes('EXAMPLE_NOT_FOUND'));

// We test exact lemma match, strict POS compatibility (Phase 6.2.40 rule), quality heuristics, and sense match
// In Phase 6.2.40:
// squash verb, deep adverb, adult adjective, shop verb were rejected by POS filter.
const POS_MAP = {
  faithfully: 'adverb',
  salad: 'noun',
  poverty: 'noun',
  consequence: 'noun',
  differ: 'verb',
  disability: 'noun',
  discrimination: 'noun',
  distinction: 'noun',
  exposure: 'noun',
  incident: 'noun',
};

let s2_recovered = 0;
let s2_pos_fail = 0;
let s2_quality_fail = 0;
let s2_no_match = 0;
const s2_recovered_units = new Set();

for (const u of exUnits) {
  const w = u.word.toLowerCase();
  let found = false;
  let posFail = false;
  let qualFail = false;

  for (const t of allTatoeba) {
    const norm = exWarehouse.normalizeSentence(t.text);
    const m = matchLemmaInExample({ lemma: w, pos: u.pos, example: norm });
    if (m.matched) {
      // Check POS compatibility rule from 6.2.40
      const sentenceLemma = (t.target_lemmas || [])[0]?.toLowerCase();
      if (sentenceLemma && sentenceLemma === w) {
        // Check if sentence target POS matches unit pos
        const knownPos = POS_MAP[w];
        if (knownPos && knownPos !== u.pos) {
          posFail = true;
          continue;
        }
      }
      
      const q = exWarehouse.filterExampleQuality(norm);
      if (q.status === 'SOURCE_REJECT') {
        qualFail = true;
        continue;
      }

      found = true;
      s2_recovered_units.add(u.canonical_id);
      break;
    }
  }

  if (found) {
    s2_recovered++;
  } else if (posFail) {
    s2_pos_fail++;
  } else if (qualFail) {
    s2_quality_fail++;
  } else {
    s2_no_match++;
  }
}

console.log({
  s2_total_candidates: exUnits.length,
  s2_recovered,
  s2_pos_fail,
  s2_quality_fail,
  s2_no_match,
});

let s2_auto = 0, s2_rev = 0, s2_hold = 0;
for (const u of units) {
  const resolved = new Set();
  if (s2_recovered_units.has(u.canonical_id)) {
    resolved.add('EXAMPLE_NOT_FOUND');
  }
  const st = evaluateUnit(u, resolved);
  if (st === 'AUTO_CANDIDATE') s2_auto++;
  else if (st === 'REVIEW_REQUIRED') s2_rev++;
  else s2_hold++;
}
console.log(`Source 2 (Tatoeba Corpus) After Full Gates: AUTO=${s2_auto} (+${s2_auto - 342}), REV=${s2_rev} (${s2_rev - 1196}), HOLD=${s2_hold} (${s2_hold - 8483})`);
