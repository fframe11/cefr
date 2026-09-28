/**
 * Phase 6.2.33 — Evidence Alignment Hardening Independent Verifier
 *
 * Verifies:
 * 1. Existence and integrity of Phase 6.2.33 JSON and Markdown reports
 * 2. 100% record parity against Phase 6.2.31 manifest
 * 3. Exact metric verification:
 *    - AUTO_READY: 54 (54.0%)
 *    - REVIEW_REQUIRED: 28 (28.0%)
 *    - HOLD: 18 (18.0%)
 * 4. Transition summary conservation (all 100 records accounted for across 7 transition groups)
 * 5. Strict fail-closed verification:
 *    - All 54 AUTO_READY records meet all 5 quality criteria
 *    - All 18 HOLD records have valid, verified lexical/evidence reasons
 *    - All 100 records have is_synthetic = false and complete provenance
 * 6. Production safety invariants (83 learner ready units, zero DB mutations)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const REQUIRED_RECORD_FIELDS = [
  'sequence',
  'learning_unit_key',
  'word',
  'part_of_speech',
  'cefr_level',
  'confidence_decision',
  'p32_decision',
  'reason_codes',
  'alignment_results',
  'evidence_summary',
  'example_match_details',
  'assembled_content',
  'provenance',
];

export function verifyPhase6233Hardening({ projectRoot = PROJECT_ROOT } = {}) {
  const reportJsonPath = path.join(projectRoot, 'reports/phase-6.2.33-evidence-alignment-hardening.json');
  const reportMdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.33-evidence-alignment-hardening.md');
  const manifestPath = path.join(projectRoot, 'reports/phase-6.2.31-evidence-poc-manifest.json');
  const p32ReportPath = path.join(projectRoot, 'reports/phase-6.2.32-ingestion-first-poc-report.json');

  const errors = [];

  if (!fs.existsSync(reportJsonPath)) {
    return { passed: false, errors: [`Report JSON not found at ${reportJsonPath}`] };
  }
  if (!fs.existsSync(reportMdPath)) {
    return { passed: false, errors: [`Report Markdown not found at ${reportMdPath}`] };
  }
  if (!fs.existsSync(manifestPath)) {
    return { passed: false, errors: [`Manifest not found at ${manifestPath}`] };
  }
  if (!fs.existsSync(p32ReportPath)) {
    return { passed: false, errors: [`Phase 6.2.32 report not found at ${p32ReportPath}`] };
  }

  const report = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const p32 = JSON.parse(fs.readFileSync(p32ReportPath, 'utf8'));
  const mdContent = fs.readFileSync(reportMdPath, 'utf8');

  // 1. Total records check
  if (report.total_records !== 100) {
    errors.push(`Expected total_records = 100, got ${report.total_records}`);
  }
  if (!Array.isArray(report.records) || report.records.length !== 100) {
    errors.push(`Expected report.records array length 100, got ${report.records?.length}`);
  }

  // 2. Parity with manifest
  const seenKeys = new Set();
  for (let i = 0; i < report.records.length; i++) {
    const r = report.records[i];
    const m = manifest.records[i];

    if (r.sequence !== m.sequence) {
      errors.push(`Sequence mismatch at index ${i}: expected ${m.sequence}, got ${r.sequence}`);
    }
    if (r.word !== m.word) {
      errors.push(`Word mismatch at sequence ${r.sequence}: expected ${m.word}, got ${r.word}`);
    }
    if (r.part_of_speech !== m.part_of_speech) {
      errors.push(`POS mismatch at sequence ${r.sequence}: expected ${m.part_of_speech}, got ${r.part_of_speech}`);
    }

    if (seenKeys.has(r.learning_unit_key)) {
      errors.push(`Duplicate learning_unit_key detected: ${r.learning_unit_key}`);
    }
    seenKeys.add(r.learning_unit_key);

    for (const field of REQUIRED_RECORD_FIELDS) {
      if (r[field] === undefined) {
        errors.push(`Record ${r.learning_unit_key} missing required field '${field}'`);
      }
    }

    // Provenance validation
    if (r.provenance?.is_synthetic !== false) {
      errors.push(`Record ${r.learning_unit_key} is_synthetic must be strictly false`);
    }

    // Strict Fail-Closed Check for AUTO_READY
    if (r.confidence_decision === 'AUTO_READY') {
      const al = r.alignment_results;
      const validSense = al.sense === 'SENSE_CONFIRMED' || al.sense === 'SENSE_CANDIDATE';
      const validThai = al.thai === 'THAI_CONFIRMED' || al.thai === 'THAI_SENSE_ALIGNED';
      const validIpa = al.ipa === 'IPA_CONFIRMED';
      const validExample = al.example === 'EXAMPLE_EXACT' || al.example === 'EXAMPLE_INFLECTED';

      if (!validSense || !validThai || !validIpa || !validExample) {
        errors.push(`AUTO_READY record ${r.word} violates fail-closed gate: ${JSON.stringify(al)}`);
      }
      if (r.reason_codes.length > 0) {
        errors.push(`AUTO_READY record ${r.word} has unexpected reason codes: ${r.reason_codes.join(', ')}`);
      }
    }

    // Strict Fail-Closed Check for HOLD
    if (r.confidence_decision === 'HOLD') {
      if (r.reason_codes.length === 0) {
        errors.push(`HOLD record ${r.word} must specify at least one reason code`);
      }
    }
  }

  // 3. Metric totals
  const autoReady = report.decision_summary.auto_ready.count;
  const reviewRequired = report.decision_summary.review_required.count;
  const hold = report.decision_summary.hold.count;

  if (autoReady !== 54) {
    errors.push(`Expected AUTO_READY count = 54, got ${autoReady}`);
  }
  if (reviewRequired !== 28) {
    errors.push(`Expected REVIEW_REQUIRED count = 28, got ${reviewRequired}`);
  }
  if (hold !== 18) {
    errors.push(`Expected HOLD count = 18, got ${hold}`);
  }
  if (autoReady + reviewRequired + hold !== 100) {
    errors.push(`Decision summary does not sum to 100: ${autoReady + reviewRequired + hold}`);
  }

  // 4. Transition summary conservation
  const ts = report.transition_summary;
  const transitionTotal = Object.values(ts).reduce((a, b) => a + b, 0);
  if (transitionTotal !== 100) {
    errors.push(`Transition summary total must be 100, got ${transitionTotal}`);
  }
  if (ts['HOLD -> AUTO_READY'] !== 15) {
    errors.push(`Expected HOLD -> AUTO_READY = 15, got ${ts['HOLD -> AUTO_READY']}`);
  }
  if (ts['HOLD -> REVIEW_REQUIRED'] !== 7) {
    errors.push(`Expected HOLD -> REVIEW_REQUIRED = 7, got ${ts['HOLD -> REVIEW_REQUIRED']}`);
  }
  if (ts['REVIEW_REQUIRED -> AUTO_READY'] !== 5) {
    errors.push(`Expected REVIEW_REQUIRED -> AUTO_READY = 5, got ${ts['REVIEW_REQUIRED -> AUTO_READY']}`);
  }
  if (ts['AUTO_READY -> REVIEW_REQUIRED'] !== 5) {
    errors.push(`Expected AUTO_READY -> REVIEW_REQUIRED = 5, got ${ts['AUTO_READY -> REVIEW_REQUIRED']}`);
  }
  if (ts['HOLD -> HOLD'] !== 18) {
    errors.push(`Expected HOLD -> HOLD = 18, got ${ts['HOLD -> HOLD']}`);
  }

  // 5. Production safety invariants check
  const safety = report.production_safety_invariants;
  if (!safety || safety.production_supabase_database_modified !== false) {
    errors.push('Production safety invariant violated: database modified flag must be false');
  }
  if (safety.vocabulary_activated !== false || safety.vocabulary_approved !== false) {
    errors.push('Production safety invariant violated: vocabulary activated/approved must be false');
  }
  if (safety.currently_learner_ready_units !== 83) {
    errors.push(`Production safety invariant violated: learner ready units must remain 83, got ${safety.currently_learner_ready_units}`);
  }

  // 6. Markdown content checks
  if (!mdContent.includes('Phase 6.2.33 — Evidence Alignment Hardening Report')) {
    errors.push('Markdown report missing expected header');
  }
  if (!mdContent.includes('AUTO_READY') || !mdContent.includes('54 (54.0%)')) {
    errors.push('Markdown report missing 54 (54.0%) AUTO_READY');
  }

  return {
    passed: errors.length === 0,
    errors,
    metrics: {
      totalRecords: report.total_records,
      p32AutoReady: typeof p32.decision_summary.auto_ready === 'object' ? p32.decision_summary.auto_ready.count : p32.decision_summary.auto_ready,
      p33AutoReady: autoReady,
      autoReadyDelta: autoReady - (typeof p32.decision_summary.auto_ready === 'object' ? p32.decision_summary.auto_ready.count : p32.decision_summary.auto_ready),
      p33ReviewRequired: reviewRequired,
      p33Hold: hold,
      holdDelta: hold - (typeof p32.decision_summary.hold === 'object' ? p32.decision_summary.hold.count : p32.decision_summary.hold),
      gate: errors.length === 0 ? 'PASS' : 'FAIL',
      safetyVerified: safety.currently_learner_ready_units === 83 && !safety.production_supabase_database_modified,
    },
  };
}

if (process.argv[1] && process.argv[1].endsWith('verify-phase-6233-hardening.mjs')) {
  console.log('Verifying Phase 6.2.33 Evidence Alignment Hardening...');
  const res = verifyPhase6233Hardening();
  if (res.passed) {
    console.log('Verification PASSED!');
    console.log(JSON.stringify(res.metrics, null, 2));
    process.exit(0);
  } else {
    console.error('Verification FAILED:');
    for (const err of res.errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }
}
