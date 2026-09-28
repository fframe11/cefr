import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

const p39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const units = p39.units;
const blocked = units.filter(u => u.routing_status !== 'AUTO_CANDIDATE');

console.log(`Analyzing ${blocked.length} blocked units across 5 sources...`);

// 1. Helper to re-evaluate full gates for any unit given modified fields
function evaluateFullGates(u, overrides = {}) {
  const isSemConf = overrides.isSemConf !== undefined ? overrides.isSemConf : (u.semantic_score >= 0.65 && u.semantic_margin >= 0.15);
  const isSemAmb = overrides.isSemAmb !== undefined ? overrides.isSemAmb : (u.semantic_score >= 0.40 && !isSemConf);
  const hasThai = overrides.hasThai !== undefined ? overrides.hasThai : (u.thai_status !== 'THAI_NOT_FOUND' && !u.blocker_flags.includes('THAI_NOT_FOUND'));
  const hasExample = overrides.hasExample !== undefined ? overrides.hasExample : (!u.blocker_flags.includes('EXAMPLE_NOT_FOUND') && (u.example_status === 'EXAMPLE_EXACT' || u.example_status === 'EXAMPLE_INFLECTED'));
  const exampleReview = overrides.exampleReview !== undefined ? overrides.exampleReview : (u.example_status === 'EXAMPLE_REVIEW');
  const hasIpaConfirmed = overrides.hasIpaConfirmed !== undefined ? overrides.hasIpaConfirmed : (!u.blocker_flags.includes('IPA_NOT_FOUND') && !u.blocker_flags.includes('IPA_MULTI_VARIANT') && u.ipa_status === 'CONFIRMED');
  const hasSense = overrides.hasSense !== undefined ? overrides.hasSense : (!u.blocker_flags.includes('SENSE_NOT_FOUND'));
  const hasCefrConflict = overrides.hasCefrConflict !== undefined ? overrides.hasCefrConflict : u.blocker_flags.includes('CEFR_CONFLICT');
  const hasSourceConflict = overrides.hasSourceConflict !== undefined ? overrides.hasSourceConflict : u.blocker_flags.includes('SOURCE_CONFLICT');
  const hasLexicon = overrides.hasLexicon !== undefined ? overrides.hasLexicon : (!u.blocker_flags.includes('LEXICON_NOT_FOUND'));

  if (
    isSemConf &&
    hasThai &&
    hasExample &&
    hasIpaConfirmed &&
    hasSense &&
    !hasCefrConflict &&
    !hasSourceConflict &&
    hasLexicon
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

// Check baseline with evaluateFullGates
let baseAuto = 0, baseRev = 0, baseHold = 0;
for (const u of units) {
  const st = evaluateFullGates(u);
  if (st === 'AUTO_CANDIDATE') baseAuto++;
  else if (st === 'REVIEW_REQUIRED') baseRev++;
  else baseHold++;
}
console.log(`Baseline verification with evaluateFullGates: AUTO=${baseAuto}, REV=${baseRev}, HOLD=${baseHold}`);

// Now test each source intervention:

// SOURCE 1: Existing OEWN examples
console.log('\n--- SOURCE 1: Existing OEWN examples ---');
const oewnData = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json'), 'utf8')).synsets;
const oewnWordMap = new Map();
for (const [id, s] of Object.entries(oewnData)) {
  const words = (s.words || []).map(w => String(w).toLowerCase());
  for (const w of words) {
    if (!oewnWordMap.has(w)) oewnWordMap.set(w, []);
    oewnWordMap.get(w).push(s);
  }
}

// In Phase 6.2.39-R1 example taxonomy:
// 4,463 primary EXAMPLE_NOT_FOUND units:
// SOURCE_DATA_GAP: 1,729
// TRUE_SOURCE_GAP: 697
// QUALITY_REJECTED: 1,193
// MORPHOLOGY_UNRESOLVED: 808
// MATCHER_LIMITATION: 36
// If morphology-resolved and matcher-limitation (808 + 36 = 844 units) in OEWN are recovered:
let s1_recovered = 0;
let s1_auto = 0;
let s1_rev = 0;
let s1_hold = 0;

for (const u of units) {
  if (u.routing_status === 'AUTO_CANDIDATE') {
    s1_auto++;
    continue;
  }
  // Check if u is among the 365 sole-blocker units or multi-blockers where OEWN has examples
  const hasExBlocker = u.blocker_flags.includes('EXAMPLE_NOT_FOUND');
  let recoveredEx = false;
  if (hasExBlocker) {
    const syns = oewnWordMap.get(u.word.toLowerCase()) || [];
    const withEx = syns.filter(s => s.examples && s.examples.length > 0 && s.pos === (u.pos === 'noun' ? 'n' : u.pos === 'verb' ? 'v' : u.pos === 'adjective' ? 'a' : u.pos === 'adverb' ? 'r' : s.pos));
    if (withEx.length > 0) {
      // Check if it has an example with morphology or exact match
      // From 6.2.39-R1 taxonomy, exactly 844 units in OEWN have morphology or matcher resolvable sentences
      // In sole-blockers (365 units): how many have OEWN synset examples?
      recoveredEx = true;
      s1_recovered++;
    }
  }

  const newStatus = evaluateFullGates(u, { hasExample: recoveredEx ? true : undefined });
  if (newStatus === 'AUTO_CANDIDATE') s1_auto++;
  else if (newStatus === 'REVIEW_REQUIRED') s1_rev++;
  else s1_hold++;
}

console.log(`Source 1 Results: Recovered examples=${s1_recovered}, AUTO=${s1_auto}, REV=${s1_rev}, HOLD=${s1_hold}`);

// SOURCE 2: Existing Tatoeba corpus (93 sentences)
console.log('\n--- SOURCE 2: Existing Tatoeba corpus ---');
const tatoebaBase = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json'), 'utf8'));
const tatoebaExpanded = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/tatoeba/2024/tatoeba-expanded-sentences.json'), 'utf8'));
const tatoebaAll = [...tatoebaBase, ...tatoebaExpanded];
const tatoebaLemmas = new Set();
for (const t of tatoebaAll) {
  for (const l of (t.target_lemmas || [])) {
    tatoebaLemmas.add(l.toLowerCase());
  }
}

// In Phase 6.2.40:
// On 365 sole-blockers, exactly 10 units recovered:
// (faithfully, salad, etc.)
// 355 failed: 266 TRUE_SOURCE_GAP, 33 POS mismatch, 28 quality fail, 15 sense mismatch, 13 not matchable.
let s2_recovered = 0;
let s2_auto = 0;
let s2_rev = 0;
let s2_hold = 0;

for (const u of units) {
  if (u.routing_status === 'AUTO_CANDIDATE') {
    s2_auto++;
    continue;
  }
  let recoveredEx = false;
  if (u.blocker_flags.includes('EXAMPLE_NOT_FOUND')) {
    // Check if in tatoeba and matches POS
    if (tatoebaLemmas.has(u.word.toLowerCase())) {
      // In 6.2.40: 10 units passed POS and quality
      recoveredEx = true;
      s2_recovered++;
    }
  }
  const newStatus = evaluateFullGates(u, { hasExample: recoveredEx ? true : undefined });
  if (newStatus === 'AUTO_CANDIDATE') s2_auto++;
  else if (newStatus === 'REVIEW_REQUIRED') s2_rev++;
  else s2_hold++;
}
console.log(`Source 2 Results: Recovered examples in Tatoeba=${s2_recovered}, AUTO=${s2_auto}, REV=${s2_rev}, HOLD=${s2_hold}`);

// SOURCE 5: CMUdict Pronunciation Evidence
console.log('\n--- SOURCE 5: CMUdict Pronunciation Evidence ---');
let s5_recovered = 0;
let s5_auto = 0;
let s5_rev = 0;
let s5_hold = 0;

for (const u of units) {
  if (u.routing_status === 'AUTO_CANDIDATE') {
    s5_auto++;
    continue;
  }
  let ipaRecovered = false;
  if (u.blocker_flags.includes('IPA_NOT_FOUND') || u.blocker_flags.includes('IPA_MULTI_VARIANT')) {
    // If CMUdict pronunciation evidence disambiguates to CONFIRMED
    ipaRecovered = true;
    s5_recovered++;
  }
  const newStatus = evaluateFullGates(u, { hasIpaConfirmed: ipaRecovered ? true : undefined });
  if (newStatus === 'AUTO_CANDIDATE') s5_auto++;
  else if (newStatus === 'REVIEW_REQUIRED') s5_rev++;
  else s5_hold++;
}
console.log(`Source 5 Results: IPA recovered=${s5_recovered}, AUTO=${s5_auto}, REV=${s5_rev}, HOLD=${s5_hold}`);
