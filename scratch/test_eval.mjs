import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

const p39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const units = p39.units;

// Reconstruct exact unit evaluation function
function evaluateUnit(u, resolvedBlockers = new Set(), semanticOverride = null) {
  // Check active blockers after removing resolved ones
  const remainingBlockers = u.blocker_flags.filter(b => !resolvedBlockers.has(b));

  // Determine semantic status
  let isSemConf = (u.semantic_score >= 0.65 && u.semantic_margin >= 0.15);
  let isSemAmb = (u.semantic_score >= 0.40 && !isSemConf);
  if (semanticOverride) {
    isSemConf = semanticOverride.isSemConf;
    isSemAmb = semanticOverride.isSemAmb;
  }

  // Gates
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

// Baseline check
let bAuto = 0, bRev = 0, bHold = 0;
for (const u of units) {
  const st = evaluateUnit(u);
  if (st === 'AUTO_CANDIDATE') bAuto++;
  else if (st === 'REVIEW_REQUIRED') bRev++;
  else bHold++;
}
console.log(`Baseline Re-evaluation: AUTO=${bAuto}, REV=${bRev}, HOLD=${bHold}`);
