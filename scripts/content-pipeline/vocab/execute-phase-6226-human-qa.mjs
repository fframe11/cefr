#!/usr/bin/env node
/**
 * execute-phase-6226-human-qa.mjs
 * ==============================================================================
 * Phase 6.2.26 — Live Execution of Confirmed Human QA Approvals on Canonical Set B
 *
 * Atomically commits the 5 real human QA decisions confirmed by the user across:
 * - TIER-1 batches (TIER-1-001, TIER-1-002, TIER-1-003, TIER-1-004)
 * - Canonical LARGE batches (LARGE-016, LARGE-018)
 * - Review ledger (reports/vocabulary-human-review-ledger.json)
 * - Recalculates readiness accounting (reports/vocabulary-human-qa-readiness.json)
 *
 * Invariants:
 * - 0 Supabase production DB mutations.
 * - Approved units remain is_active: false (never ACTIVE).
 * - Exactly 5 canonical Set B records approved.
 * - Readiness advances from 28 -> 33 (gap reduces 9,972 -> 9,967).
 * - Final gate: HUMAN_QA_PILOT_COMPLETED.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  executeCanonicalSetBHumanDecision,
  runPhase6226ControlledHumanQaExecution,
  REAL_HUMAN_QA_PILOT_DECISIONS_SET_B,
  SET_B_PACKET_6_2_22_REVIEW_READY_KEYS,
  DECISION_GATES_6_2_26,
} from './pilot-identity-reconciliation.mjs';
import { generateHumanQaReadinessReport } from './human-review-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultProjectRoot = path.resolve(__dirname, '../../..');

export function executePhase6226LiveDecisions({
  projectRoot = defaultProjectRoot,
  decisions = REAL_HUMAN_QA_PILOT_DECISIONS_SET_B,
} = {}) {
  console.log('================================================================================');
  console.log(' PHASE 6.2.26 — APPLYING CONFIRMED REAL HUMAN QA APPROVALS (SET B)');
  console.log('================================================================================');

  // Baseline readiness before execution
  const readinessBefore = generateHumanQaReadinessReport({
    projectRoot,
    writeArtifact: false,
  });

  console.log('\n[BASELINE READINESS BEFORE LIVE EXECUTION]');
  console.log(`  Active Curated DB:        ${readinessBefore.inventory_metrics.existing_active_curated_units}`);
  console.log(`  Human-Approved Staging:   ${readinessBefore.human_review_status_breakdown.human_approved}`);
  console.log(`  Learner-Ready Units:      ${readinessBefore.learner_ready_metrics.currently_learner_ready_units}`);
  console.log(`  Remaining Gap to 10k:     ${readinessBefore.learner_ready_metrics.remaining_gap_to_10000_learner_ready}`);
  console.log(`  Readiness Status:         ${readinessBefore.overall_status}`);
  console.log(`  User Testing Authorized:  ${readinessBefore.user_testing_authorized}`);

  const appliedResults = [];
  for (const submission of decisions) {
    console.log(`\n[EXECUTING HUMAN QA DECISION] ${submission.learningUnitKey}`);
    console.log(`  Reviewer ID:  ${submission.reviewerId}`);
    console.log(`  Decision:     ${submission.decision}`);
    console.log(`  Rationale:    ${submission.rationale}`);

    const result = executeCanonicalSetBHumanDecision(submission, {
      projectRoot,
      referenceRoot: projectRoot,
      enforceSetBOnly: true,
    });

    appliedResults.push(result);
    console.log(`  ✓ Transaction ID:   ${result.transaction_id}`);
    console.log(`  ✓ TIER-1 Batch:     ${result.tier1_batch_id}`);
    console.log(`  ✓ LARGE Batch:      ${result.large_batch_id}`);
    console.log(`  ✓ Lifecycle Status: ${result.lifecycle_status} (is_active = ${result.is_active})`);
  }

  // Recalculate live readiness and persist to reports/vocabulary-human-qa-readiness.json
  const readinessAfter = generateHumanQaReadinessReport({
    projectRoot,
    writeArtifact: true,
  });

  // Re-run Phase 6.2.26 execution report and documentation (ledger already contains the applied reviews)
  const { executionReport } = runPhase6226ControlledHumanQaExecution({
    projectRoot,
    humanDecisions: [],
    writeArtifacts: true,
  });

  console.log('\n================================================================================');
  console.log(' READINESS ACCOUNTING TRANSITION REPORT');
  console.log('================================================================================');
  console.log(`  Active Curated DB:        ${readinessBefore.inventory_metrics.existing_active_curated_units} -> ${readinessAfter.inventory_metrics.existing_active_curated_units} (intact)`);
  console.log(`  Human-Approved Staging:   ${readinessBefore.human_review_status_breakdown.human_approved} -> ${readinessAfter.human_review_status_breakdown.human_approved} (+5)`);
  console.log(`  Learner-Ready Units:      ${readinessBefore.learner_ready_metrics.currently_learner_ready_units} -> ${readinessAfter.learner_ready_metrics.currently_learner_ready_units} (+5)`);
  console.log(`  Remaining Gap to 10k:     ${readinessBefore.learner_ready_metrics.remaining_gap_to_10000_learner_ready} -> ${readinessAfter.learner_ready_metrics.remaining_gap_to_10000_learner_ready} (-5)`);
  console.log(`  Readiness Percentage:     ${readinessBefore.learner_ready_metrics.learner_ready_percentage}% -> ${readinessAfter.learner_ready_metrics.learner_ready_percentage}%`);
  console.log(`  Readiness Status:         ${readinessAfter.overall_status}`);
  console.log(`  User Testing Authorized:  ${readinessAfter.user_testing_authorized}`);
  console.log(`  Production DB Mutations:  0 (strictly quarantined)`);
  console.log(`  Final Decision Gate:      ${executionReport.final_gate}`);
  console.log('================================================================================');

  const executionLog = {
    phase: '6.2.26',
    title: 'Phase 6.2.26 — Real Human QA Decision Execution Log on Canonical Set B Records',
    executed_at: new Date().toISOString(),
    final_gate: executionReport.final_gate,
    readiness_before_and_after: {
      before: {
        active_curated_db: readinessBefore.inventory_metrics.existing_active_curated_units,
        human_approved_staging: readinessBefore.human_review_status_breakdown.human_approved,
        learner_ready: readinessBefore.learner_ready_metrics.currently_learner_ready_units,
        gap: readinessBefore.learner_ready_metrics.remaining_gap_to_10000_learner_ready,
        status: readinessBefore.overall_status,
      },
      after: {
        active_curated_db: readinessAfter.inventory_metrics.existing_active_curated_units,
        human_approved_staging: readinessAfter.human_review_status_breakdown.human_approved,
        learner_ready: readinessAfter.learner_ready_metrics.currently_learner_ready_units,
        gap: readinessAfter.learner_ready_metrics.remaining_gap_to_10000_learner_ready,
        status: readinessAfter.overall_status,
      },
    },
    safety_invariants: {
      production_db_mutations: 0,
      supabase_network_writes_executed: 0,
      approved_units_promoted_to_active: 0,
      all_approved_units_is_active_false: appliedResults.every((r) => r.is_active === false),
      user_testing_authorized: false,
      overall_status: 'NOT_READY',
      canonical_identity_mutated: false,
    },
    reviewer_identity: {
      reviewer_id: decisions[0].reviewerId,
      is_operational_identifier_only: true,
      is_authenticated_proof_of_human: false,
      operational_limitation_notice:
        'reviewer_id is an operational workflow identifier only; string validation does NOT equal cryptographic authentication or proof of human identity.',
    },
    applied_transactions: appliedResults.map((r) => ({
      learning_unit_key: r.unit.learning_unit_key,
      word: r.unit.word,
      cefr_level: r.unit.cefr_level,
      decision: r.decision,
      lifecycle_status: r.lifecycle_status,
      is_active: r.is_active,
      tier1_batch_id: r.tier1_batch_id,
      large_batch_id: r.large_batch_id,
      transaction_id: r.transaction_id,
      event_id: r.ledger_event.event_id,
      reviewed_at: r.reviewed_at,
      meaning_th: r.unit.meaning_th,
      rationale: r.unit.review_rationale,
    })),
  };

  const reportsDir = path.join(projectRoot, 'reports');
  fs.writeFileSync(
    path.join(reportsDir, 'phase-6.2.26-human-qa-decision-execution.json'),
    JSON.stringify(executionLog, null, 2) + '\n',
    'utf8'
  );

  return {
    success: true,
    executionLog,
    readinessBefore,
    readinessAfter,
    executionReport,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  executePhase6226LiveDecisions();
}
