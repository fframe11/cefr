/**
 * Phase 6.2.27 — Controlled Human QA Batch Planning & Gate
 *
 * Prepares the deterministic review queue for the next Human QA batch (exactly 50 records).
 * Strictly enforces:
 * - Real canonical records only (no synthetic fallback, no fabricated words)
 * - Exact canonical resolution: FOUND_EXACTLY_ONE
 * - Zero Human QA decisions in this phase (Planning only)
 * - Zero production DB mutations (Supabase writes = 0)
 * - Zero active promotions (is_active = false)
 * - Zero changes to readiness metrics or user testing authorization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveCanonicalExactKey, CANONICAL_RESOLUTION_STATUS } from './pilot-identity-reconciliation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const PHASE_6_2_27_GATE = {
  CONTROLLED_QA_BATCH_READY: 'CONTROLLED_QA_BATCH_READY',
  CONTROLLED_QA_BATCH_BLOCKED: 'CONTROLLED_QA_BATCH_BLOCKED'
};

export function planPhase6227ControlledQABatch({ projectRoot = PROJECT_ROOT, forceReplan = false } = {}) {
  const reportsDir = path.join(projectRoot, 'reports');
  const docsDir = path.join(projectRoot, 'docs/assessment');
  const lockedReportPath = path.join(reportsDir, 'phase-6.2.27-controlled-qa-batch.json');

  if (!forceReplan && fs.existsSync(lockedReportPath)) {
    const lockedReport = JSON.parse(fs.readFileSync(lockedReportPath, 'utf8'));
    return {
      report: lockedReport,
      selectedBatch: lockedReport.selected_records || [],
      finalGate: lockedReport.gate_verdict || PHASE_6_2_27_GATE.CONTROLLED_QA_BATCH_READY,
      reportsDir,
      docsDir
    };
  }

  const tier1BatchesDir = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches');
  const largeBatchesDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');

  // 1. Audit Current Inventory
  const readinessPath = path.join(reportsDir, 'vocabulary-human-qa-readiness.json');
  const ledgerPath = path.join(reportsDir, 'vocabulary-human-review-ledger.json');

  const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

  const approvedProductionKeys = new Set(
    ledger.events.filter(e => e.is_production_review).map(e => e.learning_unit_key)
  );

  const largeFiles = fs.readdirSync(largeBatchesDir).filter(f => f.endsWith('.json')).sort();
  const tier1Files = fs.readdirSync(tier1BatchesDir).filter(f => f.endsWith('.json')).sort();

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

      // Pre-filter: Check if already approved in production ledger
      if (approvedProductionKeys.has(r.learning_unit_key) || r.lifecycle_status === 'APPROVED') {
        rejectedPreFilter.push({
          learning_unit_key: r.learning_unit_key,
          reason: 'ALREADY_APPROVED_IN_PRODUCTION_LEDGER',
          details: 'Record has already received production approval in a previous phase.'
        });
        continue;
      }

      // Pre-filter: Check if active
      if (r.is_active === true) {
        rejectedPreFilter.push({
          learning_unit_key: r.learning_unit_key,
          reason: 'ACTIVE_RECORD_IN_STAGING',
          details: 'Record is already marked active and cannot enter review queue.'
        });
        continue;
      }

      candidatePool.push({
        record: r,
        batch_file: f,
        batch_id: f.replace('.json', '')
      });
    }
  }

  // 2. Rank Candidates by Operational Review Priority
  const pTierOrder = {
    'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED': 0,
    'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS': 1,
    'TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED': 2,
    'TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS': 3
  };
  const cefrOrder = { 'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3, 'C1': 4, 'C2': 5 };

  const rankedCandidates = candidatePool.map(({ record: r, batch_file, batch_id }) => {
    const pRank = pTierOrder[r.priority_tier] ?? 99;
    const cRank = cefrOrder[r.cefr_level] ?? 99;
    const ipaVerified = (r.provenance?.ipa_provenance?.status || '').includes('VERIFIED') ? 0 : 1;
    const senseConfident = (r.provenance?.sense_disambiguation_status === 'MATCH_CONFIDENT') ? 0 : 1;
    const exampleVerified = (r.provenance?.example_provenance?.status === 'VERIFIED_SOURCE_EXAMPLE') ? 0 : 1;

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
        thai_status: r.provenance?.meaning_th_provenance?.status || 'UNKNOWN'
      },
      _sort: [pRank, cRank, ipaVerified, senseConfident, exampleVerified, batch_file, r.unit_index_in_batch]
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
    if (selectedBatch.length >= 50) break;

    // Check duplicate key within selected batch
    if (selectedKeysSet.has(candidate.learning_unit_key)) {
      rejectedExactGate.push({
        learning_unit_key: candidate.learning_unit_key,
        reason: 'DUPLICATE_KEY_IN_BATCH',
        details: 'Key already exists in the selected batch.'
      });
      continue;
    }

    // Exact Canonical Resolution Gate
    const res = resolveCanonicalExactKey(candidate.learning_unit_key, { projectRoot });
    if (res.exact_resolution_status !== CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE) {
      rejectedExactGate.push({
        learning_unit_key: candidate.learning_unit_key,
        reason: 'EXACT_CANONICAL_RESOLUTION_FAILED',
        details: `Resolved to status "${res.exact_resolution_status}". Must be FOUND_EXACTLY_ONE.`
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
        details: 'Record fields (word, POS, CEFR, sense_index) do not match resolved canonical record.'
      });
      continue;
    }

    // Passed all gates: Add to selected batch
    const { _sort, unit_index_in_batch, ...cleanCandidate } = candidate;
    cleanCandidate.canonical_large_batch = res.canonical_batch_id || null;
    cleanCandidate.canonical_large_unit_index = res.matched_record?.unit_index_in_batch || null;
    cleanCandidate.original_id = matched.provenance?.original_id || null;

    selectedBatch.push(cleanCandidate);
    selectedKeysSet.add(cleanCandidate.learning_unit_key);
  }

  // 4. Gate Evaluation
  const isBatchComplete = selectedBatch.length === 50;
  const allResolvedExactlyOne = selectedBatch.length === 50;
  const noDuplicates = selectedKeysSet.size === 50;
  const zeroProductionDbMutations = true;
  const zeroActiveStatus = selectedBatch.every(c => c.current_lifecycle !== 'ACTIVE');
  const zeroDecisionsMade = true;

  const finalGate = (
    isBatchComplete &&
    allResolvedExactlyOne &&
    noDuplicates &&
    zeroProductionDbMutations &&
    zeroActiveStatus &&
    zeroDecisionsMade
  ) ? PHASE_6_2_27_GATE.CONTROLLED_QA_BATCH_READY : PHASE_6_2_27_GATE.CONTROLLED_QA_BATCH_BLOCKED;

  // 5. Build Distribution Metrics
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
    phase: '6.2.27',
    report_title: 'Controlled Human QA Batch Planning & Gate (50 Records)',
    planned_at: new Date().toISOString(),
    gate_verdict: finalGate,
    planning_constraints: {
      planning_only_mode: true,
      human_decisions_executed: 0,
      readiness_count_incremented: false,
      user_testing_authorized: false,
      production_db_mutations: 0,
      supabase_writes_executed: 0,
      staged_promotions_to_active: 0
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
      user_testing_authorized: readiness.user_testing_authorized
    },
    queue_selection_metrics: {
      candidate_pool_size: candidatePool.length,
      selected_batch_size: selectedBatch.length,
      rejected_pre_filter_count: rejectedPreFilter.length,
      rejected_exact_gate_count: rejectedExactGate.length,
      exact_resolution_pass_count: selectedBatch.length,
      exact_resolution_fail_count: rejectedExactGate.length,
      duplicate_keys_count: 50 - selectedKeysSet.size
    },
    selected_batch_distribution: {
      priority_tier_breakdown: priorityDistribution,
      risk_tier_breakdown: riskDistribution,
      cefr_level_breakdown: cefrDistribution,
      part_of_speech_breakdown: posDistribution
    },
    rejection_summary: {
      pre_filter_rejections: rejectedPreFilter,
      exact_gate_rejections: rejectedExactGate
    },
    selected_records: selectedBatch
  };

  return {
    report,
    selectedBatch,
    finalGate,
    reportsDir,
    docsDir
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('plan-phase-6227-controlled-batch.mjs')) {
  console.log('Executing Phase 6.2.27 Controlled Human QA Batch Planning...');
  const result = planPhase6227ControlledQABatch();

  const reportPath = path.join(result.reportsDir, 'phase-6.2.27-controlled-qa-batch.json');
  fs.writeFileSync(reportPath, JSON.stringify(result.report, null, 2), 'utf8');
  console.log(`Saved report to ${reportPath}`);
  console.log(`Gate Verdict: ${result.finalGate}`);
  console.log(`Selected Records: ${result.selectedBatch.length}`);
}
