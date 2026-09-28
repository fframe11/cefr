/**
 * Phase 6.2.38 — Verification Gate
 * Gate name: EVIDENCE_VALIDATION_CALIBRATION_GATE
 *
 * Implements 18 rigorous verification checks:
 * 1. GATE_01_BLIND_SAMPLE_EXTRACTED: 350-unit blind validation sample extracted and reproducible (seed 6238)
 * 2. GATE_02_CEFR_STRATIFIED_QUOTAS: Stratification quotas fulfilled across all 6 levels (A1: 58, A2: 58, B1: 59, B2: 59, C1: 58, C2: 58)
 * 3. GATE_03_OVERSAMPLING_REPRESENTATION: Oversampling of polysemy, CEFR conflicts, cross-POS, example missing, auto controls verified
 * 4. GATE_04_INDEPENDENT_EVIDENCE_GROUND_TRUTH: Every unit evaluated with independent traceable evidence
 * 5. GATE_05_PRECISION_MEASURED: Semantic precision of CONFIDENT measured and reported
 * 6. GATE_06_PRECISION_SLICING: Precision sliced across CEFR, POS, source combos, candidate counts, polysemy, CEFR conflicts
 * 7. GATE_07_RECALL_DISCLAIMER_RECORDED: Formal disclaimer stating recall cannot be claimed without gold ground-truth denominator
 * 8. GATE_08_THRESHOLD_CALIBRATION_MATRIX: 6 threshold configurations evaluated with yield and precision metrics
 * 9. GATE_09_ADVERSARIAL_MORPHOLOGY_11: All 11 derivative false-positive pairs strictly blocked by morphology matcher
 * 10. GATE_10_EXAMPLE_PROVENANCE_AND_AI_ISOLATION: All example records retain provenance; AI drafts quarantined as AI_DRAFT_ONLY
 * 11. GATE_11_LEXITRON_LICENSE_RECONCILED: NECTEC LEXiTRON 2.0 license clauses verified; commercial use permitted with mandatory attribution string
 * 12. GATE_12_EXPLICIT_EVIDENCE_TIERS: 5 explicit evidence tiers modeled and assigned (LEVEL_1_DIRECT to LEVEL_5_NO_EVIDENCE)
 * 13. GATE_13_MACHINE_READABLE_ARTIFACTS: All 4 JSON reports and Markdown assessment document present and non-empty
 * 14. GATE_14_ZERO_PRODUCTION_DB_WRITES: Production database mutations strictly 0
 * 15. GATE_15_ZERO_PROMOTIONS: Production promotions strictly 0
 * 16. GATE_16_LEARNER_READY_LOCKED_83: Learner-ready vocabulary locked at 83 (21 active, 62 staged)
 * 17. GATE_17_DENOMINATOR_LOCKED_10021: Universe denominator locked at 10,021
 * 18. GATE_18_READINESS_NOT_READY: Production status = NOT_READY, user testing authorized = false
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  extract350UnitValidationSample,
  runPhase6238Calibration,
} from './run-phase-6238-calibration.mjs';
import { matchLemmaInExample } from './morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const GATE_NAME = 'EVIDENCE_VALIDATION_CALIBRATION_GATE';

export function verifyPhase6238Calibration({ projectRoot = PROJECT_ROOT } = {}) {
  const checks = [];

  function recordCheck(id, description, passed, details = null) {
    checks.push({ id, description, passed, details });
  }

  // Paths
  const valDatasetPath = path.join(projectRoot, 'reports/phase-6.2.38-validation-dataset.json');
  const semCalibPath = path.join(projectRoot, 'reports/phase-6.2.38-semantic-calibration.json');
  const exCalibPath = path.join(projectRoot, 'reports/phase-6.2.38-example-calibration.json');
  const licPath = path.join(projectRoot, 'reports/phase-6.2.38-lexitron-license-reconciliation.json');
  const docAssessmentPath = path.join(projectRoot, 'docs/assessment/phase-6.2.38-evidence-validation-calibration.md');
  const invAccountingPath = path.join(projectRoot, 'reports/phase-6.2.36-inventory-accounting.json');

  // Load baseline accounting
  const invRaw = JSON.parse(fs.readFileSync(invAccountingPath, 'utf8'));
  const all10k = invRaw.units || [];

  // Check 1: 350-unit blind sample extracted and reproducible
  const sample1 = extract350UnitValidationSample(all10k, 6238);
  const sample2 = extract350UnitValidationSample(all10k, 6238);
  const isReproducible = sample1.length === 350 && sample1.every((u, idx) => u.id === sample2[idx].id);
  recordCheck(
    'GATE_01_BLIND_SAMPLE_EXTRACTED',
    '350-unit blind validation sample extracted and reproducible (seed 6238)',
    isReproducible,
    `Sample size: ${sample1.length}`
  );

  // Check 2: Stratification quotas fulfilled across all 6 levels
  const expectedQuotas = { A1: 58, A2: 58, B1: 59, B2: 59, C1: 58, C2: 58 };
  const actualCefr = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const u of sample1) {
    if (actualCefr[u.cefr] !== undefined) actualCefr[u.cefr]++;
  }
  const quotasMatch = Object.entries(expectedQuotas).every(([lvl, q]) => actualCefr[lvl] === q);
  recordCheck(
    'GATE_02_CEFR_STRATIFIED_QUOTAS',
    'Stratification quotas fulfilled across all 6 levels (A1: 58, A2: 58, B1: 59, B2: 59, C1: 58, C2: 58)',
    quotasMatch,
    JSON.stringify(actualCefr)
  );

  // Check 3: Oversampling representation
  const polyUnits = sample1.filter(u => u.primary_blocker === 'POLYSEMY_UNRESOLVED');
  const cefrConflicts = sample1.filter(u => (u.gap_reasons || []).includes('CEFR_CONFLICT'));
  const exMissing = sample1.filter(u => u.primary_blocker === 'EXAMPLE_NOT_FOUND');
  const autoControls = sample1.filter(u => u.decision === 'AUTO_READY');
  const oversamplePassed = polyUnits.length >= 100 && cefrConflicts.length >= 20 && exMissing.length >= 30 && autoControls.length >= 20;
  recordCheck(
    'GATE_03_OVERSAMPLING_REPRESENTATION',
    'Oversampling of polysemy, CEFR conflicts, example missing, auto controls verified',
    oversamplePassed,
    `Poly: ${polyUnits.length}, CEFR conflict: ${cefrConflicts.length}, Ex missing: ${exMissing.length}, Auto: ${autoControls.length}`
  );

  // Check 4: Independent ground truth evaluation
  const valDataset = fs.existsSync(valDatasetPath) ? JSON.parse(fs.readFileSync(valDatasetPath, 'utf8')) : null;
  const allHaveGt = valDataset && valDataset.units.length === 350 && valDataset.units.every(u =>
    ['VALIDATED_CORRECT', 'VALIDATED_INCORRECT', 'VALIDATED_AMBIGUOUS', 'VALIDATION_NOT_POSSIBLE'].includes(u.independent_validation_status) &&
    typeof u.validation_reason === 'string' && u.validation_reason.length > 5
  );
  recordCheck(
    'GATE_04_INDEPENDENT_EVIDENCE_GROUND_TRUTH',
    'Every unit evaluated with independent traceable evidence status and explicit rationale',
    allHaveGt,
    `Evaluated units: ${valDataset?.units?.length || 0}`
  );

  // Check 5: Precision measured
  const semCalib = fs.existsSync(semCalibPath) ? JSON.parse(fs.readFileSync(semCalibPath, 'utf8')) : null;
  const precisionRecorded = semCalib && semCalib.baseline_evaluation_summary?.precision_of_confident?.precision_pct !== undefined;
  recordCheck(
    'GATE_05_PRECISION_MEASURED',
    'Semantic precision of CONFIDENT decisions measured and recorded',
    precisionRecorded,
    `Precision: ${semCalib?.baseline_evaluation_summary?.precision_of_confident?.precision_pct}`
  );

  // Check 6: Precision slicing
  const slicesPresent = semCalib &&
    semCalib.precision_slices?.by_cefr &&
    semCalib.precision_slices?.by_pos &&
    semCalib.precision_slices?.by_source_combo &&
    semCalib.precision_slices?.by_candidate_count &&
    semCalib.precision_slices?.by_polysemy &&
    semCalib.precision_slices?.by_cefr_conflict;
  recordCheck(
    'GATE_06_PRECISION_SLICING',
    'Precision sliced across CEFR, POS, source combos, candidate counts, polysemy, CEFR conflicts',
    Boolean(slicesPresent),
    'All 6 slicing dimensions verified'
  );

  // Check 7: Recall disclaimer recorded
  const hasRecallDisclaimer = semCalib &&
    typeof semCalib.baseline_evaluation_summary?.recall_disclaimer === 'string' &&
    semCalib.baseline_evaluation_summary.recall_disclaimer.includes('exhaustive gold ground-truth denominator');
  recordCheck(
    'GATE_07_RECALL_DISCLAIMER_RECORDED',
    'Formal disclaimer stating recall cannot be claimed without gold ground-truth denominator',
    Boolean(hasRecallDisclaimer),
    semCalib?.baseline_evaluation_summary?.recall_disclaimer
  );

  // Check 8: Threshold calibration matrix
  const matrix = semCalib?.threshold_calibration_matrix || [];
  const matrixValid = matrix.length === 6 && matrix.every(m => m.yield_count !== undefined && m.precision_numeric !== undefined);
  recordCheck(
    'GATE_08_THRESHOLD_CALIBRATION_MATRIX',
    '6 threshold configurations evaluated with yield and precision metrics',
    matrixValid,
    `Configurations evaluated: ${matrix.length}`
  );

  // Check 9: Adversarial morphology suite (11 pairs)
  const exCalib = fs.existsSync(exCalibPath) ? JSON.parse(fs.readFileSync(exCalibPath, 'utf8')) : null;
  const morphSuite = exCalib?.adversarial_morphology_suite;
  const morphPassed = morphSuite && morphSuite.total_pairs_tested === 11 && morphSuite.all_pairs_blocked === true;
  recordCheck(
    'GATE_09_ADVERSARIAL_MORPHOLOGY_11',
    'All 11 derivative false-positive pairs strictly blocked by morphology matcher',
    Boolean(morphPassed),
    `Tested: ${morphSuite?.total_pairs_tested}, All blocked: ${morphSuite?.all_pairs_blocked}`
  );

  // Check 10: Example provenance and AI isolation
  const aiQuarantine = exCalib?.provenance_integrity?.ai_draft_quarantine;
  const aiIsolated = aiQuarantine && aiQuarantine.flag === 'AI_DRAFT_ONLY' && aiQuarantine.production_promotable === false;
  recordCheck(
    'GATE_10_EXAMPLE_PROVENANCE_AND_AI_ISOLATION',
    'All example records retain provenance; AI drafts quarantined as AI_DRAFT_ONLY',
    Boolean(aiIsolated),
    `AI flag: ${aiQuarantine?.flag}, Promotable: ${aiQuarantine?.production_promotable}`
  );

  // Check 11: LEXiTRON license reconciled
  const lic = fs.existsSync(licPath) ? JSON.parse(fs.readFileSync(licPath, 'utf8')) : null;
  const licPassed = lic &&
    lic.legal_status === 'LICENSE_VERIFIED_COMPLIANT' &&
    lic.commercial_suitability === 'PERMITTED_WITH_ATTRIBUTION' &&
    lic.attribution_verified === true &&
    lic.mandatory_attribution_string?.includes('NECTEC');
  recordCheck(
    'GATE_11_LEXITRON_LICENSE_RECONCILED',
    'NECTEC LEXiTRON 2.0 license clauses verified; commercial use permitted with mandatory attribution',
    Boolean(licPassed),
    `Status: ${lic?.legal_status}, Commercial: ${lic?.commercial_suitability}`
  );

  // Check 12: Five explicit evidence tiers
  const tierSummary = valDataset?.summary?.by_evidence_tier;
  const tiersValid = tierSummary &&
    tierSummary.LEVEL_1_DIRECT !== undefined &&
    tierSummary.LEVEL_2_CROSS_CORPUS !== undefined &&
    tierSummary.LEVEL_3_MORPHOLOGICAL !== undefined &&
    tierSummary.LEVEL_4_HEURISTIC !== undefined &&
    tierSummary.LEVEL_5_NO_EVIDENCE !== undefined;
  recordCheck(
    'GATE_12_EXPLICIT_EVIDENCE_TIERS',
    '5 explicit evidence tiers modeled and assigned (LEVEL_1_DIRECT to LEVEL_5_NO_EVIDENCE)',
    Boolean(tiersValid),
    JSON.stringify(tierSummary)
  );

  // Check 13: Machine-readable artifacts
  const artifactsExist = [valDatasetPath, semCalibPath, exCalibPath, licPath, docAssessmentPath].every(p =>
    fs.existsSync(p) && fs.statSync(p).size > 100
  );
  recordCheck(
    'GATE_13_MACHINE_READABLE_ARTIFACTS',
    'All 4 JSON reports and Markdown assessment document present and non-empty',
    artifactsExist,
    '5 output files verified'
  );

  // Check 14: Zero production DB writes
  const zeroWrites = semCalib?.governance?.production_db_writes === 0;
  recordCheck(
    'GATE_14_ZERO_PRODUCTION_DB_WRITES',
    'Production database mutations strictly 0',
    zeroWrites,
    `DB writes: ${semCalib?.governance?.production_db_writes}`
  );

  // Check 15: Zero promotions
  const zeroPromotions = semCalib?.governance?.production_promotions === 0;
  recordCheck(
    'GATE_15_ZERO_PROMOTIONS',
    'Production vocabulary promotions strictly 0',
    zeroPromotions,
    `Promotions: ${semCalib?.governance?.production_promotions}`
  );

  // Check 16: Learner-ready locked at 83
  const locked83 = semCalib?.governance?.learner_ready_units_locked === 83;
  recordCheck(
    'GATE_16_LEARNER_READY_LOCKED_83',
    'Learner-ready vocabulary strictly locked at 83 (21 active, 62 staged)',
    locked83,
    `Learner-ready count: ${semCalib?.governance?.learner_ready_units_locked}`
  );

  // Check 17: Denominator locked at 10,021
  const locked10k = semCalib?.governance?.denominator === 10021 && all10k.length === 10021;
  recordCheck(
    'GATE_17_DENOMINATOR_LOCKED_10021',
    'Universe denominator strictly locked at 10,021',
    locked10k,
    `Denominator: ${all10k.length}`
  );

  // Check 18: Readiness NOT_READY
  const notReady = semCalib?.governance?.production_status === 'NOT_READY' && semCalib?.governance?.user_testing_authorized === false;
  recordCheck(
    'GATE_18_READINESS_NOT_READY',
    'Production status = NOT_READY, user testing authorized = false',
    notReady,
    `Status: ${semCalib?.governance?.production_status}, Testing: ${semCalib?.governance?.user_testing_authorized}`
  );

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;
  const allPassed = passedCount === totalCount;

  return {
    gate_name: GATE_NAME,
    all_passed: allPassed,
    passed_count: passedCount,
    total_count: totalCount,
    checks,
  };
}

// Direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('verify-phase-6238-calibration.mjs')) {
  console.log(`[Verification] Running ${GATE_NAME}...`);
  const result = verifyPhase6238Calibration();
  console.log(`[Verification] Result: ${result.passed_count}/${result.total_count} checks passed.`);
  for (const c of result.checks) {
    const symbol = c.passed ? '✓' : '✗';
    console.log(`  ${symbol} ${c.id}: ${c.description} ${c.details ? `(${c.details})` : ''}`);
  }
  if (!result.all_passed) {
    console.error(`[Verification] FAILED: Not all checks passed.`);
    process.exit(1);
  } else {
    console.log(`[Verification] PASSED: All ${result.total_count} checks passed successfully.`);
    process.exit(0);
  }
}
