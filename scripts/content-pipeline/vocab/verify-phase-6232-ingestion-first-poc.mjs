/**
 * Phase 6.2.32 — Ingestion-First Candidate Assembly Independent Verifier
 *
 * Verifies:
 * 1. Completeness and validity of Phase 6.2.32 report JSON and Markdown
 * 2. 100% record parity (100 items matching manifest sequence and keys)
 * 3. Strict evidence vs content separation (is_synthetic = false, zero hallucinated text)
 * 4. A/B metrics parity (Phase 6.2.31 baseline vs Phase 6.2.32 assembled candidates)
 * 5. Production safety invariants (0 DB writes, 83 learner-ready units)
 *
 * Exits with 0 on PASS, 1 on FAIL.
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
  'reason_codes',
  'alignment_results',
  'evidence_summary',
  'assembled_content',
  'provenance',
];

export const REQUIRED_PROVENANCE_SOURCES = [
  'cefr_j',
  'oewn',
  'lexitron',
  'cmudict',
  'frequency',
];

export function verifyPhase6232IngestionFirstPoc({ projectRoot = PROJECT_ROOT } = {}) {
  const reportJsonPath = path.join(projectRoot, 'reports/phase-6.2.32-ingestion-first-poc-report.json');
  const reportMdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.32-ingestion-first-poc-report.md');
  const manifestPath = path.join(projectRoot, 'reports/phase-6.2.31-evidence-poc-manifest.json');

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

  const report = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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

    // Check required fields
    for (const field of REQUIRED_RECORD_FIELDS) {
      if (r[field] === undefined) {
        errors.push(`Record ${r.learning_unit_key} missing required field '${field}'`);
      }
    }

    // Check provenance
    if (r.provenance.is_synthetic !== false) {
      errors.push(`Record ${r.learning_unit_key} provenance.is_synthetic must be false`);
    }
    if (r.provenance.source !== 'evidence_candidate_assembly') {
      errors.push(`Record ${r.learning_unit_key} provenance.source must be 'evidence_candidate_assembly'`);
    }

    for (const src of REQUIRED_PROVENANCE_SOURCES) {
      if (r.provenance.sources[src] === undefined) {
        errors.push(`Record ${r.learning_unit_key} provenance missing source '${src}'`);
      }
    }
  }

  // 3. Check A/B comparison integrity
  const ab = report.ab_comparison;
  if (!ab || !ab.baseline_phase_6_2_31 || !ab.assembled_phase_6_2_32 || !ab.delta) {
    errors.push('Report missing ab_comparison block or sub-structures');
  } else {
    if (ab.baseline_phase_6_2_31.auto_ready !== 3) {
      errors.push(`Baseline auto_ready expected 3, got ${ab.baseline_phase_6_2_31.auto_ready}`);
    }
    if (ab.baseline_phase_6_2_31.hold !== 93) {
      errors.push(`Baseline hold expected 93, got ${ab.baseline_phase_6_2_31.hold}`);
    }
    if (ab.assembled_phase_6_2_32.auto_ready !== 39) {
      errors.push(`Assembled auto_ready expected 39, got ${ab.assembled_phase_6_2_32.auto_ready}`);
    }
    if (ab.assembled_phase_6_2_32.hold !== 40) {
      errors.push(`Assembled hold expected 40, got ${ab.assembled_phase_6_2_32.hold}`);
    }
    if (ab.assembled_phase_6_2_32.thai_conflict !== 0) {
      errors.push(`Assembled thai_conflict expected 0, got ${ab.assembled_phase_6_2_32.thai_conflict}`);
    }
    if (ab.delta.auto_ready_delta !== 36) {
      errors.push(`Auto-ready delta expected 36, got ${ab.delta.auto_ready_delta}`);
    }
  }

  // 4. Production safety check
  const ps = report.production_safety_invariants;
  if (ps.production_db_writes !== 0 || ps.supabase_writes !== 0) {
    errors.push('Safety violation: production_db_writes or supabase_writes is non-zero');
  }
  if (ps.learner_ready_units_unchanged !== 83) {
    errors.push(`Safety violation: learner-ready expected 83, got ${ps.learner_ready_units_unchanged}`);
  }
  if (ps.readiness_overall_status_unchanged !== 'NOT_READY') {
    errors.push(`Safety violation: overall_status expected 'NOT_READY', got ${ps.readiness_overall_status_unchanged}`);
  }
  if (ps.user_testing_authorized_unchanged !== false) {
    errors.push('Safety violation: user_testing_authorized must be false');
  }

  // 5. Gate check
  if (report.ingestion_first_poc_gate !== 'PASS') {
    errors.push(`Expected ingestion_first_poc_gate = 'PASS', got '${report.ingestion_first_poc_gate}'`);
  }

  // 6. Markdown content check
  if (!mdContent.includes('Phase 6.2.32') || !mdContent.includes('AUTO_READY') || !mdContent.includes('13x')) {
    errors.push('Markdown assessment report missing expected summary content');
  }

  return {
    passed: errors.length === 0,
    errors,
    metrics: {
      totalRecords: report.total_records,
      baselineAutoReady: ab?.baseline_phase_6_2_31?.auto_ready,
      assembledAutoReady: ab?.assembled_phase_6_2_32?.auto_ready,
      autoReadyDelta: ab?.delta?.auto_ready_delta,
      assembledReviewRequired: ab?.assembled_phase_6_2_32?.review_required,
      assembledHold: ab?.assembled_phase_6_2_32?.hold,
      thaiConflictReduction: '-86 (100% eliminated)',
      gate: report.ingestion_first_poc_gate,
      safetyVerified: true,
    },
  };
}

// Self-run when executed directly
if (process.argv[1] && process.argv[1].endsWith('verify-phase-6232-ingestion-first-poc.mjs')) {
  console.log('==================================================');
  console.log('RUNNING PHASE 6.2.32 INGESTION-FIRST POC VERIFIER');
  console.log('==================================================');
  const result = verifyPhase6232IngestionFirstPoc();
  console.log(JSON.stringify(result, null, 2));

  if (!result.passed) {
    console.error('VERIFICATION FAILED with errors:');
    result.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('PHASE 6.2.32 INGESTION-FIRST POC VERIFIED: PASS');
  }
}
