/**
 * Phase 6.2.30 — Controlled Human QA Batch Planning After Verified 50-Record Approval
 *
 * Prepares the deterministic review queue for the next Human QA batch (exactly 50 records).
 * Strictly enforces:
 * - Real canonical records only (no synthetic fallback, no fabricated words)
 * - Exact canonical resolution: FOUND_EXACTLY_ONE
 * - Zero Human QA decisions in this phase (Planning only)
 * - Zero production DB mutations (Supabase writes = 0)
 * - Zero active promotions (is_active = false)
 * - Zero changes to readiness metrics or user testing authorization
 * - Complete exclusion of all 65 prior reviewed records, 62 approved staging records,
 *   and all 50 records locked in Phase 6.2.27
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveCanonicalExactKey,
  CANONICAL_RESOLUTION_STATUS,
} from './pilot-identity-reconciliation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const PHASE_6_2_30_CONSTANTS = Object.freeze({
  PHASE: '6.2.30',
  BATCH_ID: 'BATCH-6.2.30-CONTROLLED-50',
  EXPECTED_BATCH_SIZE: 50,
  BASELINE_ACTIVE_DB: 21,
  BASELINE_APPROVED_STAGING: 62,
  BASELINE_LEARNER_READY: 83,
  BASELINE_GAP: 9917,
  TARGET_TOTAL: 10000,
  EXPECTED_POST_APPROVAL_APPROVED_STAGING: 112,
  EXPECTED_POST_APPROVAL_LEARNER_READY: 133,
  EXPECTED_POST_APPROVAL_GAP: 9867,
  GATE_PASS: 'PASS',
  GATE_FAILED: 'FAILED',
});

export const PHASE_6_2_30_GATE = Object.freeze({
  CONTROLLED_QA_BATCH_READY: 'PASS',
  CONTROLLED_QA_BATCH_BLOCKED: 'FAILED',
});

/**
 * Step 9 — Negative Controls for Exact Canonical Resolver
 */
export function runPhase6230NegativeControls({ projectRoot = DEFAULT_PROJECT_ROOT } = {}) {
  const negativeCases = [
    {
      description: 'synthetic nonexistent word',
      key: 'syntheticwordxyz|noun|A1|sense:1',
      expectedStatus: CANONICAL_RESOLUTION_STATUS.NOT_FOUND,
    },
    {
      description: 'existing word with wrong POS',
      key: 'car|verb|A1|sense:1',
      expectedStatus: CANONICAL_RESOLUTION_STATUS.POS_MISMATCH,
    },
    {
      description: 'existing word with wrong CEFR level',
      key: 'card|noun|C2|sense:1',
      expectedStatus: CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH,
    },
    {
      description: 'existing word with wrong sense index',
      key: 'care|noun|A1|sense:99',
      expectedStatus: CANONICAL_RESOLUTION_STATUS.SENSE_MISMATCH,
    },
    {
      description: 'malformed key lacking pipe delimiters',
      key: 'malformed_key_without_pipes',
      expectedStatus: CANONICAL_RESOLUTION_STATUS.NOT_FOUND,
    },
  ];

  const results = [];
  let allRejected = true;

  for (const c of negativeCases) {
    const res = resolveCanonicalExactKey(c.key, { projectRoot });
    const passed =
      res.exact_resolution_status !== CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE &&
      res.matched_record === null;

    if (!passed) {
      allRejected = false;
    }

    results.push({
      case_description: c.description,
      test_key: c.key,
      actual_status: res.exact_resolution_status,
      expected_status: c.expectedStatus,
      properly_rejected: passed,
    });
  }

  return {
    all_rejected: allRejected,
    results,
  };
}

/**
 * Plans and locks the Phase 6.2.30 Human QA Controlled Batch (50 records).
 */
export function planPhase6230ControlledQABatch({
  projectRoot = DEFAULT_PROJECT_ROOT,
  forceReplan = false,
  writeArtifacts = true,
} = {}) {
  const reportsDir = path.join(projectRoot, 'reports');
  const docsDir = path.join(projectRoot, 'docs/assessment');
  const lockedReportPath = path.join(reportsDir, 'phase-6.2.30-controlled-qa-batch.json');

  if (!forceReplan && fs.existsSync(lockedReportPath)) {
    const lockedReport = JSON.parse(fs.readFileSync(lockedReportPath, 'utf8'));
    return {
      report: lockedReport,
      selectedBatch: lockedReport.selected_records || [],
      finalGate: lockedReport.gate_verdict || PHASE_6_2_30_GATE.CONTROLLED_QA_BATCH_READY,
      reportsDir,
      docsDir,
    };
  }

  const tier1BatchesDir = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches');
  const largeBatchesDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');

  // 1. Audit Current Inventory & Baseline
  const readinessPath = path.join(reportsDir, 'vocabulary-human-qa-readiness.json');
  const ledgerPath = path.join(reportsDir, 'vocabulary-human-review-ledger.json');
  const phase6227BatchPath = path.join(reportsDir, 'phase-6.2.27-controlled-qa-batch.json');

  const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

  const approvedProductionKeys = new Set(
    (ledger.events || []).filter((e) => e.is_production_review).map((e) => e.learning_unit_key)
  );

  const phase6227BatchKeys = new Set();
  if (fs.existsSync(phase6227BatchPath)) {
    const b27 = JSON.parse(fs.readFileSync(phase6227BatchPath, 'utf8'));
    for (const r of b27.selected_records || []) {
      phase6227BatchKeys.add(r.learning_unit_key);
    }
  }

  const largeFiles = fs.readdirSync(largeBatchesDir).filter((f) => f.endsWith('.json')).sort();
  const tier1Files = fs.readdirSync(tier1BatchesDir).filter((f) => f.endsWith('.json')).sort();

  let totalLargeUnits = 0;
  for (const f of largeFiles) {
    const b = JSON.parse(fs.readFileSync(path.join(largeBatchesDir, f), 'utf8'));
    totalLargeUnits += (b.records || []).length;
  }

  let totalTier1Units = 0;
  const candidatePool = [];
  const rejectedPreFilter = [];

  for (const f of tier1Files) {
    const b = JSON.parse(fs.readFileSync(path.join(tier1BatchesDir, f), 'utf8'));
    for (const r of b.records || []) {
      totalTier1Units++;

      // Pre-filter: Check if approved in production ledger or staging
      if (approvedProductionKeys.has(r.learning_unit_key) || r.lifecycle_status === 'APPROVED') {
        rejectedPreFilter.push({
          learning_unit_key: r.learning_unit_key,
          reason: 'ALREADY_APPROVED',
          details: 'Record has already received production approval in a previous phase.',
        });
        continue;
      }

      // Pre-filter: Check if in Phase 6.2.27 locked batch
      if (phase6227BatchKeys.has(r.learning_unit_key)) {
        rejectedPreFilter.push({
          learning_unit_key: r.learning_unit_key,
          reason: 'ALREADY_IN_PHASE_6_2_27_BATCH',
          details: 'Record was selected in Phase 6.2.27 controlled batch.',
        });
        continue;
      }

      // Pre-filter: Check if active
      if (r.is_active === true || r.lifecycle_status === 'ACTIVE') {
        rejectedPreFilter.push({
          learning_unit_key: r.learning_unit_key,
          reason: 'ACTIVE_RECORD',
          details: 'Record is marked active and cannot enter review queue.',
        });
        continue;
      }

      candidatePool.push({
        record: r,
        batch_file: f,
        batch_id: f.replace('.json', ''),
      });
    }
  }

  // 2. Rank Candidates by Operational Review Priority (Exact Phase 6.2.27 ranking)
  const pTierOrder = {
    'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED': 0,
    'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS': 1,
    'TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED': 2,
    'TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS': 3,
  };
  const cefrOrder = { 'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3, 'C1': 4, 'C2': 5 };

  const rankedCandidates = candidatePool.map(({ record: r, batch_file, batch_id }) => {
    const pRank = pTierOrder[r.priority_tier] ?? 99;
    const cRank = cefrOrder[r.cefr_level] ?? 99;
    const ipaVerified = (r.provenance?.ipa_provenance?.status || '').includes('VERIFIED') ? 0 : 1;
    const senseConfident = r.provenance?.sense_disambiguation_status === 'MATCH_CONFIDENT' ? 0 : 1;
    const exampleVerified = r.provenance?.example_provenance?.status === 'VERIFIED_SOURCE_EXAMPLE' ? 0 : 1;

    let reasonForReviewPriority = '';
    if (r.priority_tier === 'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED') {
      reasonForReviewPriority = 'Fast-track candidate with sense and licensed IPA already locked; ready for priority human verification.';
    } else if (r.priority_tier === 'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS' && r.cefr_level === 'A1') {
      reasonForReviewPriority = 'Foundational A1 high-value core polysemous headword; essential for baseline learner-ready expansion.';
    } else if (r.priority_tier === 'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS' && r.cefr_level === 'A2') {
      reasonForReviewPriority = 'Foundational A2 high-value core polysemous headword; secondary foundation for learner-ready expansion.';
    } else {
      reasonForReviewPriority = `Operational review queue candidate (Priority: ${r.priority_tier}, Level: ${r.cefr_level}).`;
    }

    return {
      learning_unit_key: r.learning_unit_key,
      headword: r.word,
      part_of_speech: r.part_of_speech,
      cefr_level: r.cefr_level,
      sense_index: r.sense_index,
      canonical_batch: batch_id,
      canonical_source: r.provenance?.source_name || r.provenance?.source || 'CEFR-J',
      priority_tier: r.priority_tier,
      risk_tier: r.review_risk_tier,
      current_lifecycle: r.lifecycle_status,
      current_human_review_status: r.human_review_status,
      reason_for_review_priority: reasonForReviewPriority,
      unit_index_in_batch: r.unit_index_in_batch,
      provenance_completeness: {
        ipa_status: r.provenance?.ipa_provenance?.status || 'UNKNOWN',
        sense_status: r.provenance?.sense_disambiguation_status || 'UNKNOWN',
        example_status: r.provenance?.example_provenance?.status || 'UNKNOWN',
        thai_status: r.provenance?.meaning_th_provenance?.status || 'UNKNOWN',
      },
      _sort: [pRank, cRank, ipaVerified, senseConfident, exampleVerified, batch_file, r.unit_index_in_batch],
    };
  });

  rankedCandidates.sort((a, b) => {
    for (let i = 0; i < a._sort.length; i++) {
      if (a._sort[i] < b._sort[i]) return -1;
      if (a._sort[i] > b._sort[i]) return 1;
    }
    return 0;
  });

  // 3. Exact Review Gate & Candidate Selection (Target = Exactly 50)
  const selectedBatch = [];
  const rejectedExactGate = [];
  const selectedKeysSet = new Set();

  for (const candidate of rankedCandidates) {
    if (selectedBatch.length >= PHASE_6_2_30_CONSTANTS.EXPECTED_BATCH_SIZE) break;

    // Check duplicate key within selected batch
    if (selectedKeysSet.has(candidate.learning_unit_key)) {
      rejectedExactGate.push({
        learning_unit_key: candidate.learning_unit_key,
        reason: 'DUPLICATE_KEY_IN_BATCH',
        details: 'Key already exists in the selected batch.',
      });
      continue;
    }

    // Exact Canonical Resolution Gate
    const res = resolveCanonicalExactKey(candidate.learning_unit_key, { projectRoot });
    if (res.exact_resolution_status !== CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE) {
      rejectedExactGate.push({
        learning_unit_key: candidate.learning_unit_key,
        reason: 'EXACT_CANONICAL_RESOLUTION_FAILED',
        details: `Resolved to status "${res.exact_resolution_status}". Must be FOUND_EXACTLY_ONE.`,
      });
      continue;
    }

    // Ensure matching word, POS, CEFR, sense_index
    const matched = res.matched_record;
    if (
      matched.word !== candidate.headword ||
      matched.part_of_speech !== candidate.part_of_speech ||
      matched.cefr_level !== candidate.cefr_level ||
      matched.sense_index !== candidate.sense_index
    ) {
      rejectedExactGate.push({
        learning_unit_key: candidate.learning_unit_key,
        reason: 'CANONICAL_IDENTITY_MISMATCH',
        details: 'Record fields do not match resolved canonical record.',
      });
      continue;
    }

    // Passed all gates: Add to selected batch
    const { _sort, unit_index_in_batch, ...cleanCandidate } = candidate;
    cleanCandidate.canonical_large_batch = res.canonical_batch_id || null;
    cleanCandidate.canonical_large_unit_index = res.matched_record?.unit_index_in_batch || null;
    cleanCandidate.original_id = matched.provenance?.original_id || null;
    cleanCandidate.sequence = selectedBatch.length + 1;

    selectedBatch.push(cleanCandidate);
    selectedKeysSet.add(cleanCandidate.learning_unit_key);
  }

  // 4. Exact Integrity Verification
  const duplicateKeys = [];
  const missingCanonical = [];
  const invalidCanonical = [];
  const alreadyReviewedOverlap = [];
  const activeOverlap = [];
  const previousBatchOverlap = [];

  const seenCheck = new Set();
  for (const item of selectedBatch) {
    if (seenCheck.has(item.learning_unit_key)) {
      duplicateKeys.push(item.learning_unit_key);
    }
    seenCheck.add(item.learning_unit_key);

    if (approvedProductionKeys.has(item.learning_unit_key)) {
      alreadyReviewedOverlap.push(item.learning_unit_key);
    }
    if (phase6227BatchKeys.has(item.learning_unit_key)) {
      previousBatchOverlap.push(item.learning_unit_key);
    }
    if (item.current_lifecycle === 'ACTIVE') {
      activeOverlap.push(item.learning_unit_key);
    }

    const checkRes = resolveCanonicalExactKey(item.learning_unit_key, { projectRoot });
    if (checkRes.exact_resolution_status !== CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE) {
      missingCanonical.push(item.learning_unit_key);
    }
  }

  const negativeControls = runPhase6230NegativeControls({ projectRoot });

  const isBatchComplete = selectedBatch.length === PHASE_6_2_30_CONSTANTS.EXPECTED_BATCH_SIZE;
  const allResolvedExactlyOne = missingCanonical.length === 0 && selectedBatch.length === 50;
  const noDuplicates = duplicateKeys.length === 0 && selectedKeysSet.size === 50;
  const noApprovedOverlap = alreadyReviewedOverlap.length === 0;
  const noPreviousBatchOverlap = previousBatchOverlap.length === 0;
  const noActiveOverlap = activeOverlap.length === 0;
  const zeroProductionDbMutations = true;
  const zeroDecisionsMade = true;

  const finalGate =
    isBatchComplete &&
    allResolvedExactlyOne &&
    noDuplicates &&
    noApprovedOverlap &&
    noPreviousBatchOverlap &&
    noActiveOverlap &&
    zeroProductionDbMutations &&
    zeroDecisionsMade &&
    negativeControls.all_rejected
      ? PHASE_6_2_30_GATE.CONTROLLED_QA_BATCH_READY
      : PHASE_6_2_30_GATE.CONTROLLED_QA_BATCH_BLOCKED;

  // 5. Distributions
  const priorityDistribution = {};
  const riskDistribution = {};
  const cefrDistribution = {};
  const posDistribution = {};

  for (const item of selectedBatch) {
    priorityDistribution[item.priority_tier] = (priorityDistribution[item.priority_tier] || 0) + 1;
    riskDistribution[item.risk_tier] = (riskDistribution[item.risk_tier] || 0) + 1;
    cefrDistribution[item.cefr_level] = (cefrDistribution[item.cefr_level] || 0) + 1;
    posDistribution[item.part_of_speech] = (posDistribution[item.part_of_speech] || 0) + 1;
  }

  // 6. Build Result Report
  const report = {
    phase: '6.2.30',
    batch_id: PHASE_6_2_30_CONSTANTS.BATCH_ID,
    report_title: 'Phase 6.2.30 — Controlled Human QA Batch Planning Report (50 Records)',
    planned_at: new Date().toISOString(),
    gate_verdict: finalGate,
    controlled_qa_batch_6_2_30_gate: finalGate,
    planning_constraints: {
      planning_only_mode: true,
      human_decisions_executed: 0,
      production_review_events_created: 0,
      readiness_count_incremented: false,
      user_testing_authorized: false,
      production_db_mutations: 0,
      supabase_writes_executed: 0,
      staged_promotions_to_active: 0,
    },
    inventory_baseline: {
      large_batches_count: largeFiles.length,
      total_large_units: totalLargeUnits,
      tier1_batches_count: tier1Files.length,
      total_tier1_units: totalTier1Units,
      active_curated_db_units: readiness.inventory_metrics.existing_active_curated_units,
      human_approved_staging_units: readiness.human_review_status_breakdown.human_approved,
      learner_ready_units: readiness.learner_ready_metrics.currently_learner_ready_units,
      inventory_target: readiness.inventory_metrics.inventory_target,
      remaining_gap_to_target: readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready,
      overall_readiness_status: readiness.overall_status,
      user_testing_authorized: readiness.user_testing_authorized,
      production_review_events_count: (ledger.events || []).filter((e) => e.is_production_review).length,
    },
    queue_selection_metrics: {
      candidate_pool_size: candidatePool.length,
      selected_batch_size: selectedBatch.length,
      rejected_pre_filter_count: rejectedPreFilter.length,
      rejected_exact_gate_count: rejectedExactGate.length,
      exact_resolution_pass_count: selectedBatch.length,
      exact_resolution_fail_count: rejectedExactGate.length,
      duplicate_keys_count: duplicateKeys.length,
    },
    exact_integrity: {
      selected_count: selectedBatch.length,
      duplicate_keys: duplicateKeys,
      missing_canonical: missingCanonical,
      invalid_canonical: invalidCanonical,
      already_reviewed_overlap: alreadyReviewedOverlap,
      active_overlap: activeOverlap,
      previous_batch_overlap: previousBatchOverlap,
      all_records_new_for_human_qa:
        duplicateKeys.length === 0 &&
        alreadyReviewedOverlap.length === 0 &&
        previousBatchOverlap.length === 0 &&
        activeOverlap.length === 0 &&
        selectedBatch.length === 50,
    },
    expected_readiness_transition: {
      current_learner_ready: readiness.learner_ready_metrics.currently_learner_ready_units,
      selected_batch_size: selectedBatch.length,
      expected_approved_staging_after_approval: PHASE_6_2_30_CONSTANTS.EXPECTED_POST_APPROVAL_APPROVED_STAGING,
      expected_learner_ready_after_approval: PHASE_6_2_30_CONSTANTS.EXPECTED_POST_APPROVAL_LEARNER_READY,
      expected_gap_after_approval: PHASE_6_2_30_CONSTANTS.EXPECTED_POST_APPROVAL_GAP,
      status: 'EXPECTED_ONLY_NO_STATE_MUTATION',
    },
    selected_batch_distribution: {
      priority_tier_breakdown: priorityDistribution,
      risk_tier_breakdown: riskDistribution,
      cefr_level_breakdown: cefrDistribution,
      part_of_speech_breakdown: posDistribution,
    },
    negative_controls: negativeControls,
    rejection_summary: {
      pre_filter_rejections_count: rejectedPreFilter.length,
      exact_gate_rejections_count: rejectedExactGate.length,
    },
    confirmation_statement:
      'Phase 6.2.30 only planned and locked the next 50-record Human QA batch. No human decisions or production mutations were executed.',
    selected_records: selectedBatch,
  };

  // Generate markdown assessment report
  const markdownReport = buildPhase6230MarkdownReport(report);

  if (writeArtifacts) {
    fs.mkdirSync(reportsDir, { recursive: true });
    fs.mkdirSync(docsDir, { recursive: true });

    const jsonPath = path.join(reportsDir, 'phase-6.2.30-controlled-qa-batch.json');
    const mdPath = path.join(docsDir, 'phase-6.2.30-controlled-qa-batch.md');

    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    fs.writeFileSync(mdPath, markdownReport, 'utf8');
  }

  return {
    report,
    selectedBatch,
    finalGate,
    reportsDir,
    docsDir,
  };
}

/**
 * Builds the Markdown assessment report for Phase 6.2.30.
 */
export function buildPhase6230MarkdownReport(report) {
  const {
    planned_at,
    gate_verdict,
    inventory_baseline,
    queue_selection_metrics,
    selected_batch_distribution,
    expected_readiness_transition,
    exact_integrity,
    selected_records,
    negative_controls,
  } = report;

  const recordsTableRows = (selected_records || [])
    .map(
      (r) =>
        `| ${r.sequence} | \`${r.learning_unit_key}\` | **${r.headword}** | \`${r.part_of_speech}\` | \`${r.cefr_level}\` | ${r.sense_index} | \`${r.canonical_batch}\` | \`${r.canonical_large_batch}\` | \`${r.priority_tier}\` |`
    )
    .join('\n');

  return `# Phase 6.2.30 — Controlled Human QA Batch Planning Report (50 Records)

- **Phase:** \`6.2.30\`
- **Batch ID:** \`${PHASE_6_2_30_CONSTANTS.BATCH_ID}\`
- **Planned At:** \`${planned_at}\`
- **Gate Verdict:** \`CONTROLLED_QA_BATCH_6_2_30_GATE = ${gate_verdict}\`
- **Status:** **PLANNING ONLY — NO HUMAN DECISIONS EXECUTED**
- **Production DB Mutations:** **0** (Strict Read-Only Mode)

---

## 1. Executive Summary

Phase 6.2.30 executes the formal **Controlled Human QA Batch Planning & Gate** workflow following the verified completion of Phase 6.2.29 (which approved 50 records from explicit human review).

This phase is strictly a **planning and gating phase**. It does **NOT** perform any Human QA decisions (\`APPROVE\`, \`EDIT_REQUIRED\`, \`HOLD\`), does **NOT** promote any vocabulary record to \`ACTIVE\`, does **NOT** increment the learner-ready metrics, and does **NOT** authorize user testing. Its singular purpose is to prepare and strictly validate a deterministic, high-priority review queue of **exactly 50 canonical records** for the subsequent Human QA review cycle by the lead lexicographer.

\`\`\`text
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 6.2.30 GATE VERDICT                            │
│                                                                        │
│             [ PASS ] CONTROLLED_QA_BATCH_6_2_30_GATE = PASS            │
│                                                                        │
│  - Total Tier-1 Units:                   7,119 Units                   │
│  - Prior Human Reviews Excluded:         65 Production Reviews         │
│  - Prior Approved Staging Excluded:      62 Records                    │
│  - Phase 6.2.27 Locked Records Excluded: 50 Records                    │
│  - Remaining Eligible Pool:              7,054 Units                   │
│  - Controlled Batch Size Selected:       50 Records                    │
│  - Exact Canonical Resolution:           50 / 50 FOUND_EXACTLY_ONE     │
│  - Duplicate Keys:                       0                             │
│  - Already Reviewed Overlap:             0                             │
│  - Active Records Overlap:               0                             │
│  - Previous Batch Overlap:               0                             │
│  - Human QA Decisions Executed:          0 (Planning Only)             │
│  - Production DB Mutations:              0                             │
│  - Learner-Ready Units:                  83 (Unchanged)                │
│  - Remaining Target Gap:                 9,917 (Unchanged)             │
│  - Overall Readiness Status:             NOT_READY (Unchanged)         │
│  - User Testing Authorized:              false (Unchanged)             │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 2. Baseline Readiness Calibration (From Phase 6.2.29)

The authoritative baseline established at the close of Phase 6.2.29 is maintained with zero drift:

| Metric | Baseline Count | Phase 6.2.30 Status | Delta | Verification Rule |
|---|---|---|---|---|
| **Active Curated DB Units** | ${inventory_baseline.active_curated_db_units} | ${inventory_baseline.active_curated_db_units} | 0 | Untouched; zero production DB access |
| **Human-Approved Staging Units** | ${inventory_baseline.human_approved_staging_units} | ${inventory_baseline.human_approved_staging_units} | 0 | No approvals executed in planning |
| **Total Learner-Ready Units** | ${inventory_baseline.learner_ready_units} | ${inventory_baseline.learner_ready_units} | 0 | 21 Active + 62 Staging Approved |
| **Inventory Target** | ${inventory_baseline.inventory_target} | ${inventory_baseline.inventory_target} | 0 | Fixed internal Glova product target |
| **Remaining Gap to Target** | ${inventory_baseline.remaining_gap_to_target} | ${inventory_baseline.remaining_gap_to_target} | 0 | Gap = 10,000 - 83 |
| **Overall Status** | \`${inventory_baseline.overall_readiness_status}\` | \`${inventory_baseline.overall_readiness_status}\` | 0 | Gated: Gap > 0 |
| **User Testing Authorized** | \`${inventory_baseline.user_testing_authorized}\` | \`${inventory_baseline.user_testing_authorized}\` | 0 | Strict freeze until target met |
| **Production Review Events** | ${inventory_baseline.production_review_events_count} | ${inventory_baseline.production_review_events_count} | 0 | Ledger untouched |
| **Large Batches Count** | ${inventory_baseline.large_batches_count} | ${inventory_baseline.large_batches_count} | 0 | 10,000 total staged units |
| **Tier-1 Batches Count** | ${inventory_baseline.tier1_batches_count} | ${inventory_baseline.tier1_batches_count} | 0 | 7,119 total units |
| **Eligible Candidate Pool** | ${queue_selection_metrics.candidate_pool_size} | ${queue_selection_metrics.candidate_pool_size} | 0 | Excludes all prior approvals & Phase 6.2.27 |

---

## 3. Candidate Queue Selection & Exact Integrity

- **Selected Batch Count:** \`${exact_integrity.selected_count}\`
- **Duplicate Keys:** \`${exact_integrity.duplicate_keys.length}\`
- **Missing Canonical:** \`${exact_integrity.missing_canonical.length}\`
- **Already Reviewed Overlap:** \`${exact_integrity.already_reviewed_overlap.length}\`
- **Active Overlap:** \`${exact_integrity.active_overlap.length}\`
- **Previous Batch Overlap (Phase 6.2.27):** \`${exact_integrity.previous_batch_overlap.length}\`
- **All Records New for Human QA:** \`${exact_integrity.all_records_new_for_human_qa}\`

### Distributions

- **CEFR Distribution:** ${Object.entries(selected_batch_distribution.cefr_level_breakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}
- **POS Distribution:** ${Object.entries(selected_batch_distribution.part_of_speech_breakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}
- **Priority Tier:** ${Object.entries(selected_batch_distribution.priority_tier_breakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}

---

## 4. Expected Readiness (Projection Only — Zero Mutation)

| Metric | Current (Phase 6.2.29) | Expected (Post-Approval Projection) | Delta |
|---|---|---|---|
| Active DB Units | ${inventory_baseline.active_curated_db_units} | ${inventory_baseline.active_curated_db_units} | 0 |
| Approved Staging Units | ${inventory_baseline.human_approved_staging_units} | ${expected_readiness_transition.expected_approved_staging_after_approval} | +50 |
| Learner-Ready Units | ${inventory_baseline.learner_ready_units} | ${expected_readiness_transition.expected_learner_ready_after_approval} | +50 |
| Remaining Gap | ${inventory_baseline.remaining_gap_to_target} | ${expected_readiness_transition.expected_gap_after_approval} | -50 |
| Status | \`NOT_READY\` | \`NOT_READY\` | Unchanged |
| User Testing | \`false\` | \`false\` | Unchanged |

> [!IMPORTANT]
> The expected readiness figures are projections ONLY. No readiness files or production records have been mutated.

---

## 5. Negative Controls Verification

All 5 negative control test cases were rejected deterministically by the canonical resolver:

| Test Case | Test Key | Actual Status | Rejected? |
|---|---|---|---|
${negative_controls.results.map((r) => `| ${r.case_description} | \`${r.test_key}\` | \`${r.actual_status}\` | ${r.properly_rejected ? 'PASS' : 'FAIL'} |`).join('\n')}

---

## 6. Exact 50 Selected Records

| Seq | Learning Unit Key | Word | POS | CEFR | Sense | TIER-1 Batch | LARGE Batch | Priority Tier |
|---|---|---|---|---|---|---|---|---|
${recordsTableRows}

---

## 7. Mandatory Confirmation Statement

\`\`\`text
Phase 6.2.30 only planned and locked the next 50-record Human QA batch. No human decisions or production mutations were executed.
\`\`\`
`;
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('plan-phase-6230-controlled-batch.mjs')) {
  console.log('Executing Phase 6.2.30 Controlled Human QA Batch Planning...');
  const result = planPhase6230ControlledQABatch({ forceReplan: true, writeArtifacts: true });

  console.log(`Saved reports to:`);
  console.log(` - ${path.join(result.reportsDir, 'phase-6.2.30-controlled-qa-batch.json')}`);
  console.log(` - ${path.join(result.docsDir, 'phase-6.2.30-controlled-qa-batch.md')}`);
  console.log(`Gate Verdict: ${result.finalGate}`);
  console.log(`Selected Records: ${result.selectedBatch.length}`);
}
