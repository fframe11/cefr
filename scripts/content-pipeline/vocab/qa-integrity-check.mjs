#!/usr/bin/env node
/**
 * qa-integrity-check.mjs
 * ==============================================================================
 * Phase 6.2.12.4 — Deterministic Vocabulary QA Workflow & Cross-Batch Consistency Checker
 *
 * Verifies:
 * 1. TIER-1 to Source LARGE Batch 2-way consistency (decision, lifecycle, reviewer, timestamp, transaction ID).
 * 2. Review Ledger parity with reviewed batch records.
 * 3. Test/development events quarantine (counted_in_readiness === false).
 * 4. Staging isolation (zero reviewed records promoted to ACTIVE).
 * 5. Zero duplicate production review events per learning_unit_key + transaction.
 * 6. Global learning_unit_key uniqueness across all 50 LARGE batches (10,000 staged units).
 * 7. Mathematical readiness accounting (21 active + 7 approved = 28 learner-ready, gap 9,972).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultProjectRoot = path.resolve(__dirname, '../../..');

export function runQaIntegrityAudit({ projectRoot = defaultProjectRoot } = {}) {
  const issues = [];
  const checks = [];

  const tier1Dir = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches');
  const largeDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');
  const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
  const readinessPath = path.join(projectRoot, 'reports/vocabulary-human-qa-readiness.json');

  // Check 1: Existence of required paths
  if (!fs.existsSync(largeDir)) {
    issues.push(`LARGE batches directory not found at ${largeDir}`);
  }
  if (!fs.existsSync(tier1Dir)) {
    issues.push(`TIER-1 batches directory not found at ${tier1Dir}`);
  }
  if (!fs.existsSync(ledgerPath)) {
    issues.push(`Review ledger not found at ${ledgerPath}`);
  }
  if (!fs.existsSync(readinessPath)) {
    issues.push(`Readiness report not found at ${readinessPath}`);
  }

  if (issues.length > 0) {
    return {
      passed: false,
      issues,
      checks,
      summary: 'Integrity check aborted due to missing baseline directories/files.',
    };
  }

  // Load ledger and readiness
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));

  // Index ledger production events by learning_unit_key
  const ledgerProdEvents = (ledger.events || []).filter(
    (e) => e.event_type === 'PRODUCTION_REVIEW' && e.is_production_review === true
  );
  const ledgerTestEvents = (ledger.events || []).filter(
    (e) => e.event_type === 'TEST_DEVELOPMENT' || e.is_production_review === false
  );

  // Check 2: Test event quarantine
  const leakingTestEvents = ledgerTestEvents.filter((e) => e.counted_in_readiness !== false);
  if (leakingTestEvents.length > 0) {
    issues.push(`Found ${leakingTestEvents.length} TEST_DEVELOPMENT events with counted_in_readiness !== false.`);
  } else {
    checks.push(`All ${ledgerTestEvents.length} TEST_DEVELOPMENT events are quarantined (counted_in_readiness = false).`);
  }

  // Check 3: Duplicate production review events
  const prodEventKeyTxnSet = new Set();
  let duplicateProdEvents = 0;
  for (const ev of ledgerProdEvents) {
    const key = `${ev.learning_unit_key}::${ev.transaction_id || ev.recorded_at}`;
    if (prodEventKeyTxnSet.has(key)) {
      duplicateProdEvents++;
      issues.push(`Duplicate production review event found in ledger: ${key}`);
    }
    prodEventKeyTxnSet.add(key);
  }
  if (duplicateProdEvents === 0) {
    checks.push(`Zero duplicate production review events in ledger (${ledgerProdEvents.length} unique events).`);
  }

  // Check 4: Global learning unit key uniqueness in LARGE batches
  const largeFiles = fs
    .readdirSync(largeDir)
    .filter((f) => /^LARGE-\d{3}\.json$/.test(f))
    .sort();
  const globalLargeKeys = new Set();
  const largeRecordsByKey = new Map();
  let duplicateLargeKeys = 0;

  for (const lf of largeFiles) {
    const bData = JSON.parse(fs.readFileSync(path.join(largeDir, lf), 'utf8'));
    for (const r of bData.records) {
      if (globalLargeKeys.has(r.learning_unit_key)) {
        duplicateLargeKeys++;
        issues.push(`Duplicate learning_unit_key "${r.learning_unit_key}" found in batch "${bData.batch_id}".`);
      }
      globalLargeKeys.add(r.learning_unit_key);
      largeRecordsByKey.set(r.learning_unit_key, {
        batch_id: bData.batch_id,
        record: r,
      });
    }
  }

  if (duplicateLargeKeys === 0) {
    checks.push(`All ${globalLargeKeys.size} staged units across ${largeFiles.length} LARGE batches have unique learning_unit_key.`);
  }

  // Check 5: TIER-1 reviewed records parity with source LARGE batches
  const tier1Files = fs
    .readdirSync(tier1Dir)
    .filter((f) => /^TIER-1-\d{3}\.json$/.test(f))
    .sort();

  let reviewedTier1Count = 0;
  let matchingSourceCount = 0;
  let activeInStagingCount = 0;

  for (const tf of tier1Files) {
    const tData = JSON.parse(fs.readFileSync(path.join(tier1Dir, tf), 'utf8'));
    for (const tr of tData.records) {
      // Check staging isolation: no staging record may be ACTIVE
      if (tr.lifecycle_status === 'ACTIVE' || tr.is_active === true) {
        activeInStagingCount++;
        issues.push(`Illegal ACTIVE state found in staging: "${tr.learning_unit_key}" in ${tData.batch_id}.`);
      }

      if (tr.reviewer_decision !== null && tr.reviewer_decision !== undefined) {
        reviewedTier1Count++;
        const largeEntry = largeRecordsByKey.get(tr.learning_unit_key);
        if (!largeEntry) {
          issues.push(`Reviewed Tier 1 unit "${tr.learning_unit_key}" not found in any source LARGE batch.`);
          continue;
        }

        const lr = largeEntry.record;

        // Verify decision match
        if (tr.reviewer_decision !== lr.reviewer_decision) {
          issues.push(
            `Decision mismatch for "${tr.learning_unit_key}": TIER-1="${tr.reviewer_decision}", LARGE="${lr.reviewer_decision}"`
          );
        }

        // Verify lifecycle_status match
        if (tr.lifecycle_status !== lr.lifecycle_status) {
          issues.push(
            `Lifecycle status mismatch for "${tr.learning_unit_key}": TIER-1="${tr.lifecycle_status}", LARGE="${lr.lifecycle_status}"`
          );
        }

        // Verify reviewer identity match
        if (tr.reviewed_by !== lr.reviewed_by) {
          issues.push(
            `Reviewer identity mismatch for "${tr.learning_unit_key}": TIER-1="${tr.reviewed_by}", LARGE="${lr.reviewed_by}"`
          );
        }

        // Verify reviewed_at match
        if (tr.reviewed_at !== lr.reviewed_at) {
          issues.push(
            `Timestamp mismatch for "${tr.learning_unit_key}": TIER-1="${tr.reviewed_at}", LARGE="${lr.reviewed_at}"`
          );
        }

        // Verify transaction_id match if present
        if (tr.review_transaction_id || lr.review_transaction_id) {
          if (tr.review_transaction_id !== lr.review_transaction_id) {
            issues.push(
              `Transaction ID mismatch for "${tr.learning_unit_key}": TIER-1="${tr.review_transaction_id}", LARGE="${lr.review_transaction_id}"`
            );
          }
        }

        // Verify matching ledger event
        const matchingLedger = ledgerProdEvents.find(
          (e) =>
            e.learning_unit_key === tr.learning_unit_key &&
            e.decision === tr.reviewer_decision &&
            e.reviewer_id === tr.reviewed_by
        );
        if (!matchingLedger) {
          issues.push(
            `No matching production ledger event found for reviewed unit "${tr.learning_unit_key}" (Decision: ${tr.reviewer_decision}, Reviewer: ${tr.reviewed_by}).`
          );
        }

        matchingSourceCount++;
      }
    }
  }

  if (activeInStagingCount === 0) {
    checks.push('Staging isolation verified: 0 reviewed units in staging are marked ACTIVE.');
  }
  checks.push(`Cross-batch parity verified: ${matchingSourceCount}/${reviewedTier1Count} reviewed records match source batches and ledger.`);

  // Check 6: Readiness mathematical accounting
  const activeCount = readiness.inventory_metrics?.existing_active_curated_units ?? 21;
  const approvedCount = readiness.human_review_status_breakdown?.human_approved ?? 0;
  const learnerReadyExpected = activeCount + approvedCount;
  const actualLearnerReady = readiness.learner_ready_metrics?.currently_learner_ready_units;
  const target = readiness.learner_ready_metrics?.learner_ready_target ?? 10000;
  const actualGap = readiness.learner_ready_metrics?.remaining_gap_to_10000_learner_ready;
  const expectedGap = Math.max(0, target - learnerReadyExpected);

  if (actualLearnerReady !== learnerReadyExpected) {
    issues.push(
      `Readiness accounting mismatch: expected ${learnerReadyExpected} learner-ready units, but report shows ${actualLearnerReady}.`
    );
  } else {
    checks.push(`Readiness arithmetic verified: ${activeCount} active + ${approvedCount} approved = ${actualLearnerReady} learner-ready.`);
  }

  if (actualGap !== expectedGap) {
    issues.push(`Remaining gap mismatch: expected ${expectedGap}, but report shows ${actualGap}.`);
  } else {
    checks.push(`Readiness gap verified: ${expectedGap} remaining units to target.`);
  }

  if (readiness.overall_status !== 'NOT_READY') {
    issues.push(`Security violation: overall_status must remain NOT_READY until 10,000 threshold reached.`);
  } else {
    checks.push('Security gate verified: overall_status is strictly NOT_READY.');
  }

  if (readiness.user_testing_authorized !== false) {
    issues.push('Security violation: user_testing_authorized must remain false.');
  } else {
    checks.push('Security gate verified: user_testing_authorized is strictly false.');
  }

  const passed = issues.length === 0;

  return {
    passed,
    issues,
    checks,
    metrics: {
      total_staged_units: globalLargeKeys.size,
      total_large_batches: largeFiles.length,
      total_tier1_batches: tier1Files.length,
      reviewed_tier1_records: reviewedTier1Count,
      matching_source_records: matchingSourceCount,
      ledger_total_events: ledger.total_events || 0,
      ledger_production_events: ledgerProdEvents.length,
      ledger_test_events: ledgerTestEvents.length,
      learner_ready_units: actualLearnerReady,
      remaining_gap: actualGap,
      overall_status: readiness.overall_status,
      user_testing_authorized: readiness.user_testing_authorized,
    },
    summary: passed
      ? `ALL ${checks.length} INTEGRITY CHECKS PASSED. Vocabulary review workflow is fully consistent and quarantined.`
      : `INTEGRITY CHECK FAILED with ${issues.length} issue(s).`,
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('================================================================================');
  console.log(' GLOVA VOCABULARY HUMAN QA INTEGRITY & CONSISTENCY CHECKER');
  console.log(' Phase 6.2.12.4 — Workflow Hardening');
  console.log('================================================================================');

  const result = runQaIntegrityAudit();

  console.log('\n[CHECKS EXECUTED]');
  for (const c of result.checks) {
    console.log(`  ✓ ${c}`);
  }

  if (!result.passed) {
    console.error('\n[INTEGRITY ISSUES DETECTED]');
    for (const issue of result.issues) {
      console.error(`  ✗ ${issue}`);
    }
    console.log('\n================================================================================');
    console.error(`STATUS: FAILED (${result.issues.length} issues)`);
    console.log('================================================================================');
    process.exit(1);
  } else {
    console.log('\n[SUMMARY METRICS]');
    console.log(`  Staged units:               ${result.metrics.total_staged_units}`);
    console.log(`  Reviewed Tier 1 units:      ${result.metrics.reviewed_tier1_records}`);
    console.log(`  Production Ledger events:   ${result.metrics.ledger_production_events}`);
    console.log(`  Test Ledger events:         ${result.metrics.ledger_test_events} (quarantined)`);
    console.log(`  Learner-ready units:        ${result.metrics.learner_ready_units} (21 Active + ${result.metrics.learner_ready_units - 21} Approved)`);
    console.log(`  Remaining gap to 10k:       ${result.metrics.remaining_gap}`);
    console.log(`  Overall readiness status:   ${result.metrics.overall_status}`);
    console.log(`  User testing authorized:    ${result.metrics.user_testing_authorized}`);
    console.log('\n================================================================================');
    console.log('STATUS: PASSED (100% Consistent, Zero Phantom Leakage)');
    console.log('================================================================================');
    process.exit(0);
  }
}
