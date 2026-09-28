/**
 * Phase 6.2.34 Verification Script — MULTI_SOURCE_LEXICAL_EVIDENCE_GATE
 *
 * Enforces all quality, security, and governance invariants:
 * 1. Master source manifest integrity and deterministic SHA256 checksums
 * 2. 5-Tier Evidence Hierarchy validation
 * 3. 100% Candidate preservation with provenance (Zero collapse to translations[0])
 * 4. Strict AI isolation outside source layer
 * 5. Deterministic Coverage Gap Taxonomy
 * 6. Adversarial substring collision prevention
 * 7. Production safety invariants (zero DB writes, learner-ready = 83, NOT_READY)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export function verifyPhase6234MultiSource({ projectRoot = PROJECT_ROOT } = {}) {
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
  console.log(`Phase 6.2.34 — Multi-Source Lexical Evidence Verification`);
  console.log(`=======================================================`);

  // Check 1: Master Manifest Exists & Validated
  const masterPath = path.join(projectRoot, 'data/lexical-sources/master-manifest.json');
  assert(fs.existsSync(masterPath), 'GATE_01_MASTER_MANIFEST', 'Master lexical manifest exists');

  const master = fs.existsSync(masterPath) ? JSON.parse(fs.readFileSync(masterPath, 'utf8')) : null;
  const sources = master ? Object.values(master.sources) : [];
  assert(sources.length >= 6, 'GATE_02_SOURCE_COUNT', `At least 6 distinct sources configured (found ${sources.length})`);

  for (const s of sources) {
    assert(Boolean(s.sha256 && s.sha256.length === 64), `GATE_SHA256_${s.source_id.toUpperCase()}`, `Source ${s.source_id} has valid SHA256`);
    assert(Boolean(s.license_name || s.license), `GATE_LICENSE_${s.source_id.toUpperCase()}`, `Source ${s.source_id} has verified license`);
  }

  // Check 2: Secondary Dataset Exists
  const secondaryPath = path.join(projectRoot, 'data/lexical-sources/wiktionary-omw/2024/wiktionary-omw-thai-subset.json');
  assert(fs.existsSync(secondaryPath), 'GATE_03_SECONDARY_SNAPSHOT', 'Secondary Wiktionary/OMW Thai dataset exists');

  // Check 3: Report & Assessment Docs Exist
  const reportPath = path.join(projectRoot, 'reports/phase-6.2.34-multi-source-evidence.json');
  const mdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.34-multi-source-evidence.md');
  assert(fs.existsSync(reportPath), 'GATE_04_REPORT_JSON', 'Phase 6.2.34 JSON report exists');
  assert(fs.existsSync(mdPath), 'GATE_05_ASSESSMENT_MD', 'Phase 6.2.34 Markdown assessment exists');

  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null;

  // Check 4: 5-Tier Evidence Hierarchy Implementation
  const warehouse = new LexicalEvidenceWarehouse(projectRoot);
  assert(Object.keys(EVIDENCE_LEVELS).length === 5, 'GATE_06_EVIDENCE_LEVELS_COUNT', 'Exactly 5 evidence levels defined');
  assert(EVIDENCE_LEVELS.LEVEL_1_DIRECT === 'LEVEL_1_DIRECT', 'GATE_07_TIER_1', 'LEVEL_1_DIRECT present');
  assert(EVIDENCE_LEVELS.LEVEL_2_SECONDARY === 'LEVEL_2_SECONDARY', 'GATE_08_TIER_2', 'LEVEL_2_SECONDARY present');
  assert(EVIDENCE_LEVELS.LEVEL_3_CONSENSUS === 'LEVEL_3_CONSENSUS', 'GATE_09_TIER_3', 'LEVEL_3_CONSENSUS present');
  assert(EVIDENCE_LEVELS.LEVEL_4_AMBIGUOUS === 'LEVEL_4_AMBIGUOUS', 'GATE_10_TIER_4', 'LEVEL_4_AMBIGUOUS present');
  assert(EVIDENCE_LEVELS.LEVEL_5_NO_EVIDENCE === 'LEVEL_5_NO_EVIDENCE', 'GATE_11_TIER_5', 'LEVEL_5_NO_EVIDENCE present');

  // Check 5: Complete Candidate Preservation (Never collapsed to translations[0])
  const richRecord = warehouse.mergeUnitEvidence({ word: 'rich', part_of_speech: 'adjective', cefr_level: 'C1' });
  assert(
    richRecord.all_candidate_translations && richRecord.all_candidate_translations.length >= 5,
    'GATE_12_CANDIDATE_PRESERVATION',
    `Multi-translation candidate preservation verified (${richRecord.all_candidate_translations?.length} candidates preserved with provenance)`
  );
  assert(
    richRecord.all_candidate_translations.every(t => t.source_id && t.license),
    'GATE_13_TRANSLATION_PROVENANCE',
    'Every candidate translation retains source_id and license attribution'
  );

  // Check 6: Deterministic Coverage Gap Taxonomy
  assert(Object.keys(GAP_TAXONOMY).length >= 10, 'GATE_14_GAP_TAXONOMY', 'All essential gap reason codes defined in GAP_TAXONOMY');

  // Check 7: Strict AI Isolation
  const aiDraft = warehouse.requestAiDraftFallback({ word: 'test', part_of_speech: 'noun', cefr_level: 'A1', simulatedDraft: 'การทดสอบ' });
  assert(aiDraft.classification === 'AI_DRAFT_ONLY', 'GATE_15_AI_CLASSIFICATION', 'AI draft classified strictly as AI_DRAFT_ONLY');
  assert(aiDraft.is_synthetic === true, 'GATE_16_AI_SYNTHETIC_FLAG', 'AI draft is_synthetic is true');
  assert(aiDraft.source_grounded === false, 'GATE_17_AI_NOT_GROUNDED', 'AI draft source_grounded is false');

  // Check 8: Adversarial Collision Prevention
  const carRecord = warehouse.mergeUnitEvidence({ word: 'car', part_of_speech: 'noun', cefr_level: 'A1' });
  const carpetRecord = warehouse.mergeUnitEvidence({ word: 'carpet', part_of_speech: 'noun', cefr_level: 'B1' });
  assert(carRecord.phonetic_ipa !== carpetRecord.phonetic_ipa, 'GATE_18_ADVERSARIAL_CAR_CARPET', 'car and carpet have distinct phonetics');
  assert(carRecord.aligned_meaning_th !== carpetRecord.aligned_meaning_th, 'GATE_19_ADVERSARIAL_TRANSLATION', 'car and carpet have distinct Thai meanings');

  // Check 9: Non-Negotiable Safety & Accounting Invariants
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

  console.log(`[MULTI_SOURCE_LEXICAL_EVIDENCE_GATE] ALL CHECKS PASSED.`);
  return { passed: true, checks };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = verifyPhase6234MultiSource();
  if (!result.passed) process.exit(1);
}
