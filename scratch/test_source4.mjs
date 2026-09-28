import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractDefinitionKeywords, evaluateCandidateSenses } from '../scripts/content-pipeline/vocab/semantic-disambiguation-poc.mjs';
import { LexicalEvidenceWarehouse } from '../scripts/content-pipeline/vocab/lexical-warehouse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

const p39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const units = p39.units;
const warehouse = new LexicalEvidenceWarehouse(PROJECT_ROOT);
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

console.log('Testing Source 4: OEWN Definitions, Synset Members, Relations and Glosses...');
const targetUnits = units.filter(u => u.blocker_flags.includes('SEMANTIC_NO_EVIDENCE') || u.blocker_flags.includes('POLYSEMY_UNRESOLVED'));
console.log('Candidate population for Source 4:', targetUnits.length);

// For each unit, simulate enriched semantic evaluation using all synsets, members, and glosses
let s4_confident = 0;
let s4_ambiguous = 0;
let s4_no_evidence = 0;
const s4_override_map = new Map();

for (const u of targetUnits) {
  const trans = warehouse.getTranslations(u.word, u.pos);
  const syns = oewnWordMap.get(u.word.toLowerCase()) || [];
  const matchingSyns = syns.filter(s => s.part_of_speech === u.pos);

  if (matchingSyns.length === 0 || trans.length === 0) {
    s4_no_evidence++;
    continue;
  }

  // Aggregate definition keywords and synset members from all matching synsets
  const allDefWords = new Set();
  const allSynWords = new Set();
  for (const s of matchingSyns) {
    for (const kw of extractDefinitionKeywords(s.definition)) allDefWords.add(kw);
    for (const w of (s.words || [])) allSynWords.add(String(w).toLowerCase());
  }

  // Create an aggregated sense representation
  const enrichedSense = {
    synset_id: matchingSyns[0].synset_id,
    definition: Array.from(allDefWords).join(' '),
    synonyms: Array.from(allSynWords),
  };

  const semRes = evaluateCandidateSenses({
    headword: u.word,
    pos: u.pos,
    candidates: trans,
    englishSense: enrichedSense,
    lexitronEntries: trans,
  });

  const isConf = semRes.top_score >= 0.65 && semRes.margin >= 0.15;
  const isAmb = semRes.top_score >= 0.40 && !isConf;

  if (isConf) {
    s4_confident++;
    s4_override_map.set(u.canonical_id, { isSemConf: true, isSemAmb: false });
  } else if (isAmb) {
    s4_ambiguous++;
    s4_override_map.set(u.canonical_id, { isSemConf: false, isSemAmb: true });
  } else {
    s4_no_evidence++;
  }
}

console.log({
  s4_candidates: targetUnits.length,
  s4_confident,
  s4_ambiguous,
  s4_no_evidence,
});

let s4_auto = 0, s4_rev = 0, s4_hold = 0;
for (const u of units) {
  const override = s4_override_map.get(u.canonical_id) || null;
  const resolved = new Set();
  if (override) {
    if (override.isSemConf) {
      resolved.add('SEMANTIC_NO_EVIDENCE');
      resolved.add('POLYSEMY_UNRESOLVED');
    } else if (override.isSemAmb) {
      resolved.add('SEMANTIC_NO_EVIDENCE');
    }
  }
  const st = evaluateUnit(u, resolved, override);
  if (st === 'AUTO_CANDIDATE') s4_auto++;
  else if (st === 'REVIEW_REQUIRED') s4_rev++;
  else s4_hold++;
}

console.log(`Source 4 (OEWN Definitions & Synsets) After Full Gates: AUTO=${s4_auto} (+${s4_auto - 342}), REV=${s4_rev} (${s4_rev - 1196}), HOLD=${s4_hold} (${s4_hold - 8483})`);
