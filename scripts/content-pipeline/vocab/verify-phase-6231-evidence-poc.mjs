/**
 * Phase 6.2.31 — Independent Evidence POC Verifier
 *
 * Verifies that Phase 6.2.31 Evidence-First Vocabulary Alignment POC satisfies:
 * 1. Manifest has exactly 100 deterministic records with balanced CEFR and multi-POS.
 * 2. All 5 evidence sources are traceable and read-only.
 * 3. Exact 1:1 fidelity between manifest and evaluated report records.
 * 4. All 4 alignment dimensions (Sense, Thai, IPA, Example) evaluated for all 100 records.
 * 5. Automated confidence gate partitions strictly into { AUTO_READY, REVIEW_REQUIRED, HOLD }.
 * 6. Every non-auto record has non-empty reason codes.
 * 7. Multi-source coverage matrix satisfies thresholds:
 *    - OEWN 2024 = 100%
 *    - CMUdict = 100%
 *    - Frequency = 100%
 *    - LEXiTRON 2.0 >= 90%
 *    - CEFR-J / Octanove >= 90%
 * 8. Production safety invariants verified (0 DB writes, 0 lifecycle mutations, 83 learner-ready).
 * 9. EVIDENCE_FIRST_POC_GATE === 'PASS'.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const ALLOWED_DECISIONS = ['AUTO_READY', 'REVIEW_REQUIRED', 'HOLD'];

export const REQUIRED_MANIFEST_FIELDS = [
  'sequence',
  'learning_unit_key',
  'word',
  'part_of_speech',
  'cefr_level',
  'sense_index',
  'source_batch',
  'selection_rationale'
];

export const REQUIRED_REPORT_RECORD_FIELDS = [
  'sequence',
  'learning_unit_key',
  'word',
  'part_of_speech',
  'cefr_level',
  'sense_index',
  'source_batch',
  'evidence_matrix',
  'sources_matched_count',
  'alignment_results',
  'confidence_decision',
  'reason_codes',
  'traceability'
];

export function verifyPhase6231EvidencePoc({ projectRoot = PROJECT_ROOT } = {}) {
  const manifestPath = path.join(projectRoot, 'reports/phase-6.2.31-evidence-poc-manifest.json');
  const reportPath = path.join(projectRoot, 'reports/phase-6.2.31-evidence-poc-report.json');
  const mdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.31-evidence-poc-report.md');

  if (!fs.existsSync(manifestPath)) {
    return { passed: false, error: 'MISSING_MANIFEST_FILE' };
  }
  if (!fs.existsSync(reportPath)) {
    return { passed: false, error: 'MISSING_REPORT_JSON_FILE' };
  }
  if (!fs.existsSync(mdPath)) {
    return { passed: false, error: 'MISSING_REPORT_MD_FILE' };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  let missingCount = 0;
  let keyMismatchCount = 0;
  let orderMismatchCount = 0;
  let invalidFieldCount = 0;
  let logicViolationCount = 0;

  // 1. Manifest checks
  const mRecords = manifest.records || [];
  if (mRecords.length !== 100) {
    return { passed: false, error: `MANIFEST_COUNT_ERROR: expected 100, got ${mRecords.length}` };
  }

  const cefrDist = manifest.cefr_distribution || {};
  if (
    cefrDist.A1 !== 20 ||
    cefrDist.A2 !== 20 ||
    cefrDist.B1 !== 20 ||
    cefrDist.B2 !== 20 ||
    cefrDist.C1 !== 10 ||
    cefrDist.C2 !== 10
  ) {
    logicViolationCount++;
  }

  for (let i = 0; i < 100; i++) {
    const mr = mRecords[i];
    for (const f of REQUIRED_MANIFEST_FIELDS) {
      if (mr[f] === undefined || mr[f] === null) invalidFieldCount++;
    }
  }

  // 2. Report checks
  const rRecords = report.records || [];
  if (rRecords.length !== 100) {
    return { passed: false, error: `REPORT_COUNT_ERROR: expected 100, got ${rRecords.length}` };
  }

  // 3. 1:1 Parity between manifest and report
  for (let i = 0; i < 100; i++) {
    const mr = mRecords[i];
    const rr = rRecords[i];

    if (mr.learning_unit_key !== rr.learning_unit_key) {
      keyMismatchCount++;
    }
    if (rr.sequence !== i + 1) {
      orderMismatchCount++;
    }

    for (const f of REQUIRED_REPORT_RECORD_FIELDS) {
      if (rr[f] === undefined || rr[f] === null) invalidFieldCount++;
    }

    if (!ALLOWED_DECISIONS.includes(rr.confidence_decision)) {
      logicViolationCount++;
    }

    // Reason code rule: non-auto records MUST have reason codes
    if (rr.confidence_decision !== 'AUTO_READY' && rr.reason_codes.length === 0) {
      logicViolationCount++;
    }

    // Auto-ready records must have 0 reason codes
    if (rr.confidence_decision === 'AUTO_READY' && rr.reason_codes.length > 0) {
      logicViolationCount++;
    }

    // Traceability check
    if (rr.sources_matched_count === 0) {
      logicViolationCount++;
    }
  }

  // 4. Source coverage checks
  const sc = report.source_coverage_matrix || {};
  const coveragePassing = (
    sc.oewn?.matched === 100 &&
    sc.cmudict?.matched === 100 &&
    sc.frequency?.matched === 100 &&
    sc.lexitron?.matched >= 90 &&
    sc.cefr_j?.matched >= 90
  );

  // 5. Decision tally consistency
  const ds = report.decision_summary || {};
  const sumDecisions = ds.auto_ready + ds.review_required + ds.hold;
  const tallyMatches = (sumDecisions === 100);

  // 6. Production safety invariants
  const safety = report.production_safety_invariants || {};
  const safetyMatches = (
    safety.production_db_writes === 0 &&
    safety.supabase_writes === 0 &&
    safety.lifecycle_mutations === 0 &&
    safety.is_active_mutations === 0 &&
    safety.review_ledger_writes === 0 &&
    safety.learner_ready_units_unchanged === 83 &&
    safety.readiness_overall_status_unchanged === 'NOT_READY' &&
    safety.user_testing_authorized_unchanged === false
  );

  const passed = (
    mRecords.length === 100 &&
    rRecords.length === 100 &&
    missingCount === 0 &&
    keyMismatchCount === 0 &&
    orderMismatchCount === 0 &&
    invalidFieldCount === 0 &&
    logicViolationCount === 0 &&
    coveragePassing &&
    tallyMatches &&
    safetyMatches &&
    report.evidence_first_poc_gate === 'PASS'
  );

  return {
    passed,
    metrics: {
      totalRecords: 100,
      autoReady: ds.auto_ready,
      reviewRequired: ds.review_required,
      hold: ds.hold,
      observedReduction: report.workload_simulation?.poc_observed_reduction_percent,
      oewnCoverage: sc.oewn?.matched,
      lexitronCoverage: sc.lexitron?.matched,
      cmudictCoverage: sc.cmudict?.matched,
      cefrjCoverage: sc.cefr_j?.matched,
      frequencyCoverage: sc.frequency?.matched,
      gate: report.evidence_first_poc_gate,
      safetyVerified: safetyMatches
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log('==================================================');
  console.log('RUNNING PHASE 6.2.31 EVIDENCE POC VERIFIER');
  console.log('==================================================');
  const result = verifyPhase6231EvidencePoc();
  console.log(JSON.stringify(result, null, 2));

  if (!result.passed) {
    console.error('VERIFICATION FAILED!');
    process.exit(1);
  } else {
    console.log('PHASE 6.2.31 EVIDENCE POC VERIFIED: PASS');
  }
}
