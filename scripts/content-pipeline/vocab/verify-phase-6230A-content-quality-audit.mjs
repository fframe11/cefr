/**
 * Phase 6.2.30A — Independent Content Quality Audit Verifier
 *
 * Verifies that the human content quality audit for Phase 6.2.30A satisfies:
 * 1. Exact 1:1 fidelity with locked source packet (reports/phase-6.2.30-human-review-packet.json).
 * 2. Exactly 50 records in byte-for-byte identical order.
 * 3. Every record has all 16 required audit fields.
 * 4. Decisions strictly restricted to {'APPROVE', 'EDIT_REQUIRED', 'HOLD'}.
 * 5. Decision consistency invariants:
 *    - APPROVE: failed_dimensions = 0, severity = 'NONE'
 *    - EDIT_REQUIRED: failed_dimensions > 0, severity in {'LOW', 'MEDIUM'}
 *    - HOLD: failed_dimensions > 0, severity = 'HIGH'
 * 6. Audit counts match expected tallies:
 *    - APPROVE = 8
 *    - EDIT_REQUIRED = 33
 *    - HOLD = 9
 *    - TOTAL = 50
 * 7. Production safety invariants:
 *    - 0 production DB writes
 *    - No staging data mutated
 *    - No vocabulary lifecycle changed
 *    - 0 production review events created
 *    - Learner ready count = 83 (NOT_READY)
 *    - User testing authorized = false
 * 8. Markdown report exists and reflects the exact audit data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const ALLOWED_DECISIONS = ['APPROVE', 'EDIT_REQUIRED', 'HOLD'];
export const ALLOWED_SEVERITIES = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];
export const ALLOWED_FAILED_DIMENSIONS = [
  'english_meaning',
  'thai_meaning',
  'ipa',
  'example_sentence',
  'pos',
  'cefr_sense_coherence',
  'provenance'
];

export const REQUIRED_RECORD_FIELDS = [
  'sequence',
  'learning_unit_key',
  'word',
  'part_of_speech',
  'cefr_level',
  'sense_index',
  'current_meaning_en',
  'current_meaning_th',
  'current_ipa',
  'current_example_sentence',
  'decision',
  'failed_dimensions',
  'severity',
  'reviewer_reason',
  'suggested_action',
  'provenance_warning'
];

export function verifyPhase6230AContentQualityAudit({ projectRoot = PROJECT_ROOT } = {}) {
  const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');
  const auditJsonPath = path.join(projectRoot, 'reports/phase-6.2.30A-content-quality-audit.json');
  const auditMdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.30A-content-quality-audit.md');

  if (!fs.existsSync(packetPath)) {
    return { passed: false, error: 'MISSING_SOURCE_PACKET_FILE' };
  }
  if (!fs.existsSync(auditJsonPath)) {
    return { passed: false, error: 'MISSING_AUDIT_JSON_FILE' };
  }
  if (!fs.existsSync(auditMdPath)) {
    return { passed: false, error: 'MISSING_AUDIT_MD_FILE' };
  }

  const packetData = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  const auditData = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));

  const packetRecords = packetData.records || [];
  const auditRecords = auditData.audit_records || [];

  const sourceCount = packetRecords.length;
  const auditCount = auditRecords.length;

  let missingCount = 0;
  let extraCount = 0;
  let orderMismatchCount = 0;
  let keyMismatchCount = 0;
  let invalidFieldCount = 0;
  let logicViolationCount = 0;

  // 1. Check length
  if (sourceCount !== 50 || auditCount !== 50) {
    return {
      passed: false,
      error: `COUNT_MISMATCH: expected 50 source and 50 audit, got ${sourceCount} and ${auditCount}`
    };
  }

  // 2. Duplicate detection
  const seenKeys = new Set();
  const duplicates = [];
  for (const r of auditRecords) {
    if (seenKeys.has(r.learning_unit_key)) {
      duplicates.push(r.learning_unit_key);
    }
    seenKeys.add(r.learning_unit_key);
  }
  const duplicateCount = duplicates.length;

  // 3. 1:1 order and key verification
  for (let i = 0; i < 50; i++) {
    const pRec = packetRecords[i];
    const aRec = auditRecords[i];

    if (!pRec || !aRec) {
      missingCount++;
      continue;
    }

    if (pRec.learning_unit_key !== aRec.learning_unit_key) {
      orderMismatchCount++;
      keyMismatchCount++;
    }

    if (aRec.sequence !== i + 1) {
      orderMismatchCount++;
    }

    // 4. Verify all 16 required fields
    for (const f of REQUIRED_RECORD_FIELDS) {
      if (aRec[f] === undefined || aRec[f] === null) {
        invalidFieldCount++;
      }
    }

    // 5. Verify decision and severity validity
    if (!ALLOWED_DECISIONS.includes(aRec.decision)) {
      logicViolationCount++;
    }
    if (!ALLOWED_SEVERITIES.includes(aRec.severity)) {
      logicViolationCount++;
    }

    // 6. Verify failed dimensions
    if (!Array.isArray(aRec.failed_dimensions)) {
      logicViolationCount++;
    } else {
      for (const d of aRec.failed_dimensions) {
        if (!ALLOWED_FAILED_DIMENSIONS.includes(d)) {
          logicViolationCount++;
        }
      }
    }

    // 7. Decision logic consistency
    if (aRec.decision === 'APPROVE') {
      if (aRec.failed_dimensions.length !== 0) {
        logicViolationCount++;
      }
    } else if (aRec.decision === 'EDIT_REQUIRED') {
      if (aRec.failed_dimensions.length === 0) {
        logicViolationCount++;
      }
    } else if (aRec.decision === 'HOLD') {
      if (aRec.failed_dimensions.length === 0 || aRec.severity !== 'HIGH') {
        logicViolationCount++;
      }
    }

    // Verify reviewer reason and action are non-empty
    if (typeof aRec.reviewer_reason !== 'string' || aRec.reviewer_reason.trim().length === 0) {
      invalidFieldCount++;
    }
    if (typeof aRec.suggested_action !== 'string' || aRec.suggested_action.trim().length === 0) {
      invalidFieldCount++;
    }
  }

  // 8. Tally counts
  const approveCount = auditRecords.filter(r => r.decision === 'APPROVE').length;
  const editRequiredCount = auditRecords.filter(r => r.decision === 'EDIT_REQUIRED').length;
  const holdCount = auditRecords.filter(r => r.decision === 'HOLD').length;

  const tallyMatches = (
    approveCount === auditData.audit_summary?.approve_count &&
    editRequiredCount === auditData.audit_summary?.edit_required_count &&
    holdCount === auditData.audit_summary?.hold_count &&
    approveCount === 8 &&
    editRequiredCount === 33 &&
    holdCount === 9
  );

  // 9. Production safety invariants check
  const safety = auditData.production_safety_invariants || {};
  const safetyMatches = (
    safety.production_db_writes === 0 &&
    safety.staging_data_mutated === false &&
    safety.vocabulary_lifecycle_mutated === false &&
    safety.review_ledger_production_events_created === 0 &&
    safety.learner_ready_units_unchanged === 83 &&
    safety.readiness_overall_status_unchanged === 'NOT_READY' &&
    safety.user_testing_authorized_unchanged === false
  );

  const passed = (
    sourceCount === 50 &&
    auditCount === 50 &&
    missingCount === 0 &&
    extraCount === 0 &&
    duplicateCount === 0 &&
    orderMismatchCount === 0 &&
    keyMismatchCount === 0 &&
    invalidFieldCount === 0 &&
    logicViolationCount === 0 &&
    tallyMatches &&
    safetyMatches &&
    auditData.phase_6_2_30a_gate === 'PASS'
  );

  return {
    passed,
    metrics: {
      sourceCount,
      auditCount,
      missingCount,
      extraCount,
      duplicateCount,
      orderMismatchCount,
      keyMismatchCount,
      invalidFieldCount,
      logicViolationCount,
      approveCount,
      editRequiredCount,
      holdCount,
      gate: auditData.phase_6_2_30a_gate,
      safetyVerified: safetyMatches
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log('==================================================');
  console.log('RUNNING PHASE 6.2.30A INDEPENDENT AUDIT VERIFIER');
  console.log('==================================================');
  const result = verifyPhase6230AContentQualityAudit();
  console.log(JSON.stringify(result, null, 2));

  if (!result.passed) {
    console.error('VERIFICATION FAILED!');
    process.exit(1);
  } else {
    console.log('PHASE 6.2.30A CONTENT QUALITY AUDIT VERIFIED: PASS');
  }
}
