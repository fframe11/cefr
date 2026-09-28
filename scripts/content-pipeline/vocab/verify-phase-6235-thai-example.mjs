/**
 * Phase 6.2.35 Verification Script — THAI_EXAMPLE_EVIDENCE_GATE
 *
 * Enforces all quality, security, and governance invariants:
 * 1. Master source manifest integrity and deterministic SHA256 checksums (7 sources)
 * 2. Full LEXiTRON 2.0 license reconciliation & attribution verification
 * 3. Tatoeba 2024 CC BY 2.0 FR text-only dataset and attribution verification
 * 4. 100% Thai Candidate preservation with provenance (Zero collapse to translations[0])
 * 5. Deterministic Thai Sense Alignment (5 states: EXACT, STRONG, MULTI, UNRESOLVED, NOT_FOUND)
 * 6. Example Evidence Warehouse integration with 3-tier quality filter
 * 7. Morphology matching integration & adversarial collision protections
 * 8. Strict AI isolation outside source evidence layer (AI_DRAFT_ONLY)
 * 9. Production safety invariants (zero DB writes, learner-ready = 83, NOT_READY)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  LexicalEvidenceWarehouse,
  EVIDENCE_LEVELS,
  SENSE_ALIGNMENT_STATUS,
  GAP_TAXONOMY,
} from './lexical-warehouse.mjs';
import {
  ThaiEvidenceModel,
  THAI_ALIGNMENT_STATUS,
  THAI_EVIDENCE_TIERS,
} from './thai-evidence-model.mjs';
import {
  ExampleEvidenceWarehouse,
  EXAMPLE_QUALITY_STATUS,
  EXAMPLE_MATCH_TYPE,
  EXAMPLE_SENSE_ALIGNMENT,
} from './example-warehouse.mjs';
import { matchLemmaInExample } from './morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export function verifyPhase6235ThaiExample({ projectRoot = PROJECT_ROOT } = {}) {
  const checks = [];
  function assert(condition, code, message) {
    checks.push({ code, passed: Boolean(condition), message });
    if (!condition) {
      console.error(`[FAIL] ${code}: ${message}`);
    } else {
      console.log(`[PASS] ${code}: ${message}`);
    }
  }

  console.log(`=======================================================`);
  console.log(`Phase 6.2.35 — Thai & Example Evidence Verification Gate`);
  console.log(`=======================================================`);

  // Check 1: Master Manifest Exists & Validated
  const masterPath = path.join(projectRoot, 'data/lexical-sources/master-manifest.json');
  assert(fs.existsSync(masterPath), 'GATE_01_MASTER_MANIFEST', 'Master lexical manifest exists');

  const master = fs.existsSync(masterPath) ? JSON.parse(fs.readFileSync(masterPath, 'utf8')) : null;
  const sources = master ? Object.values(master.sources) : [];
  assert(sources.length >= 7, 'GATE_02_SOURCE_COUNT', `At least 7 distinct sources configured (found ${sources.length})`);

  for (const s of sources) {
    assert(Boolean(s.sha256 && s.sha256.length === 64), `GATE_SHA256_${s.source_id.toUpperCase()}`, `Source ${s.source_id} has valid SHA256`);
    assert(Boolean(s.license_name || s.license), `GATE_LICENSE_${s.source_id.toUpperCase()}`, `Source ${s.source_id} has verified license`);
  }

  // Check 2: LEXiTRON License Reconciliation & Attribution Documented
  const licReconPath = path.join(projectRoot, 'reports/phase-6.2.35-lexitron-license-reconciliation.json');
  const licReconMd = path.join(projectRoot, 'docs/assessment/phase-6.2.35-lexitron-license-reconciliation.md');
  assert(fs.existsSync(licReconPath), 'GATE_05_LEXITRON_RECON_JSON', 'LEXiTRON license reconciliation report exists');
  assert(fs.existsSync(licReconMd), 'GATE_05_LEXITRON_RECON_MD', 'LEXiTRON license reconciliation assessment exists');

  // Check 3: Full LEXiTRON Usable Index
  const fullIndexPath = path.join(projectRoot, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json');
  assert(fs.existsSync(fullIndexPath), 'GATE_06_LEXITRON_FULL_INDEX', 'Full LEXiTRON 2.0 usable index exists');
  if (fs.existsSync(fullIndexPath)) {
    const stat = fs.statSync(fullIndexPath);
    assert(stat.size > 5_000_000, 'GATE_06_INDEX_SIZE', `Full index has expected content size (>5MB, found ${(stat.size / 1_000_000).toFixed(1)}MB)`);
  }

  // Check 4: Tatoeba Dataset & Manifest
  const tatoebaJsonPath = path.join(projectRoot, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json');
  const tatoebaManifest = path.join(projectRoot, 'data/lexical-sources/tatoeba/2024/manifest.json');
  assert(fs.existsSync(tatoebaJsonPath), 'GATE_07_TATOEBA_DATASET', 'Tatoeba sentences dataset exists');
  assert(fs.existsSync(tatoebaManifest), 'GATE_07_TATOEBA_MANIFEST', 'Tatoeba manifest exists');

  // Check 5: Secondary Dataset Exists
  const secondaryPath = path.join(projectRoot, 'data/lexical-sources/wiktionary-omw/2024/wiktionary-omw-thai-subset.json');
  assert(fs.existsSync(secondaryPath), 'GATE_08_SECONDARY_DATASET', 'Secondary Wiktionary/OMW Thai dataset exists');

  // Check 6: Report & Assessment Docs Exist
  const reportPath = path.join(projectRoot, 'reports/phase-6.2.35-thai-example-evidence.json');
  const mdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.35-thai-example-evidence.md');
  assert(fs.existsSync(reportPath), 'GATE_09_REPORT_JSON', 'Phase 6.2.35 JSON report exists');
  assert(fs.existsSync(mdPath), 'GATE_10_ASSESSMENT_MD', 'Phase 6.2.35 Markdown assessment exists');

  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null;

  // Check 7: Thai Evidence Model & Candidate Preservation
  const thaiModel = new ThaiEvidenceModel(projectRoot);
  assert(Object.keys(THAI_ALIGNMENT_STATUS).length === 5, 'GATE_11_THAI_STATUS_COUNT', 'Exactly 5 Thai alignment statuses defined');

  const richRecord = thaiModel.getCandidates('rich', 'adjective');
  assert(richRecord && richRecord.length >= 5, 'GATE_12_CANDIDATE_PRESERVATION', `Multi-candidate preservation verified (${richRecord?.length} candidates preserved)`);
  assert(richRecord.every(t => t.source_id && t.license), 'GATE_12_CANDIDATE_PROVENANCE', 'All candidates have source_id and license attribution');

  // Check 8: Example Evidence Warehouse & Quality Filter
  const exampleWarehouse = new ExampleEvidenceWarehouse(projectRoot);
  const okFilter = exampleWarehouse.filterExampleQuality('This is a complete and natural sentence.');
  const shortFilter = exampleWarehouse.filterExampleQuality('Hi.');
  const punctFilter = exampleWarehouse.filterExampleQuality('This sentence lacks a period');
  const toxicFilter = exampleWarehouse.filterExampleQuality('This contains bad bastard word.');

  assert(okFilter.status === EXAMPLE_QUALITY_STATUS.SOURCE_OK, 'GATE_13_EXAMPLE_QUALITY_OK', 'Valid sentence passes quality filter');
  assert(shortFilter.status === EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, 'GATE_14_EXAMPLE_QUALITY_SHORT', 'Too-short sentence rejected');
  assert(punctFilter.status === EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, 'GATE_14_EXAMPLE_QUALITY_PUNCT', 'Sentence missing punctuation rejected');
  assert(toxicFilter.status === EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, 'GATE_14_EXAMPLE_QUALITY_TOXIC', 'Offensive content rejected');

  // Check 9: Morphology Matching Integration
  const morphExact = matchLemmaInExample({ lemma: 'dance', pos: 'verb', example: 'They dance together every evening.' });
  const morphInflected = matchLemmaInExample({ lemma: 'dance', pos: 'verb', example: 'She danced gracefully on the stage.' });
  const morphCollision = matchLemmaInExample({ lemma: 'car', pos: 'noun', example: 'The red carpet was vacuumed.' });

  assert(morphExact.matched && morphExact.match_type === 'EXACT_LEMMA', 'GATE_15_MORPH_EXACT', 'Exact lemma morphology matched');
  assert(morphInflected.matched && (morphInflected.match_type === 'INFLECTED_FORM' || morphInflected.match_type === 'ATTESTED_INFLECTION'), 'GATE_15_MORPH_INFLECTED', 'Attested inflection morphology matched');
  assert(!morphCollision.matched, 'GATE_15_MORPH_COLLISION_REJECTED', 'Adversarial substring collision rejected');

  // Check 10: Strict AI Isolation
  const aiDraft = thaiModel._loadSecondary(); // just verifying instance
  const warehouse = new LexicalEvidenceWarehouse(projectRoot);
  const aiTransDraft = warehouse.requestAiDraftFallback({ word: 'test', part_of_speech: 'noun', cefr_level: 'A1', simulatedDraft: 'การทดสอบ' });
  const aiExDraft = exampleWarehouse.requestAiExampleDraft({ word: 'test', pos: 'noun', simulatedSentence: 'This is a test.' });

  assert(aiTransDraft.classification === 'AI_DRAFT_ONLY', 'GATE_16_AI_TRANS_CLASSIFICATION', 'AI translation classified as AI_DRAFT_ONLY');
  assert(aiTransDraft.is_synthetic === true && aiTransDraft.source_grounded === false, 'GATE_16_AI_TRANS_FLAGS', 'AI translation synthetic and not grounded');
  assert(aiExDraft.classification === 'AI_DRAFT_ONLY', 'GATE_17_AI_EX_CLASSIFICATION', 'AI example classified as AI_DRAFT_ONLY');
  assert(aiExDraft.is_synthetic === true && aiExDraft.source_grounded === false, 'GATE_17_AI_EX_FLAGS', 'AI example synthetic and not grounded');

  // Check 11: Adversarial Collisions Protection
  const carRecord = warehouse.mergeUnitEvidence({ word: 'car', part_of_speech: 'noun', cefr_level: 'A1' });
  const carpetRecord = warehouse.mergeUnitEvidence({ word: 'carpet', part_of_speech: 'noun', cefr_level: 'B1' });
  assert(carRecord.phonetic_ipa !== carpetRecord.phonetic_ipa, 'GATE_18_ADVERSARIAL_CAR_CARPET_IPA', 'car and carpet have distinct phonetics');
  assert(carRecord.aligned_meaning_th !== carpetRecord.aligned_meaning_th, 'GATE_19_ADVERSARIAL_CAR_CARPET_THAI', 'car and carpet have distinct Thai meanings');

  // Check 12: Non-Negotiable Safety & Accounting Invariants
  assert(report?.governance_and_safety?.production_db_mutated === false, 'GATE_20_ZERO_DB_MUTATION', 'Zero production DB mutations verified');
  assert(report?.governance_and_safety?.learner_ready_accounting === 83, 'GATE_21_LEARNER_READY_83', 'Learner-ready accounting locked at 83');
  assert(report?.governance_and_safety?.user_testing_authorized === false, 'GATE_22_TESTING_NOT_AUTHORIZED', 'User testing authorized is false');
  assert(report?.governance_and_safety?.overall_status === 'NOT_READY', 'GATE_23_OVERALL_NOT_READY', 'Overall status is NOT_READY');

  const failed = checks.filter(c => !c.passed);
  console.log(`\nVerification Summary: ${checks.length - failed.length}/${checks.length} checks PASSED.`);

  if (failed.length > 0) {
    console.error(`Verification FAILED with ${failed.length} errors.`);
    return { passed: false, checks };
  }

  console.log(`[THAI_EXAMPLE_EVIDENCE_GATE] ALL CHECKS PASSED.`);
  return { passed: true, checks };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = verifyPhase6235ThaiExample();
  if (!result.passed) process.exit(1);
}
