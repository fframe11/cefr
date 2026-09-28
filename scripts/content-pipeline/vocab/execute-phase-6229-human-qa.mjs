/**
 * Phase 6.2.29 — Execute Verified Human QA Approval for Locked 50 Records
 *
 * Executes the explicit human reviewer decision (APPROVE by human_lexicographer_lead)
 * for the exact 50 locked records in reports/phase-6.2.28-human-qa-execution-manifest.json,
 * cross-checked 1:1 against reports/phase-6.2.27-controlled-qa-batch.json and
 * reports/phase-6.2.27-human-review-packet.json.
 *
 * STRICT INVARIANTS:
 * 1. Exact 50 locked records only (zero queue recreation, reordering, addition, removal, or substitution).
 * 2. Content & provenance immutability: word, part_of_speech, cefr_level, sense_index, meaning_en,
 *    meaning_th, phonetic_ipa, example_sentence, and provenance remain 100% unchanged.
 * 3. Lifecycle transition: REVIEW_REQUIRED -> APPROVED with is_active = false (NEVER ACTIVE).
 * 4. Atomic multi-file commit per record across TIER-1 batch, LARGE batch, and review ledger
 *    with byte-for-byte rollback on any error.
 * 5. Production review ledger events: 50 new PRODUCTION_REVIEW events with unique transaction_id,
 *    is_production_review = true, counted_in_readiness = true.
 * 6. Readiness transition:
 *    - Active Curated DB: 21 -> 21
 *    - Human-Approved Staging: 12 -> 62
 *    - Learner-Ready Total: 33 -> 83
 *    - Remaining Gap: 9,967 -> 9,917
 *    - User Testing Authorized: false
 *    - Overall Status: NOT_READY
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  atomicWriteFiles,
  generateHumanQaReadinessReport,
  validateBatchStructure,
  validateLedgerStructure,
} from './human-review-engine.mjs';
import {
  CANONICAL_RESOLUTION_STATUS,
  getRepositoryProvenanceIndex,
  resolveCanonicalExactKey,
  validatePhase6226ReviewerIdentity,
} from './pilot-identity-reconciliation.mjs';
import { runQaIntegrityAudit } from './qa-integrity-check.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const PHASE_6_2_29_CONSTANTS = Object.freeze({
  PHASE: '6.2.29',
  REVIEWER_ID: 'human_lexicographer_lead',
  DECISION_INPUT: 'APPROVE',
  RECORDED_DECISION: 'APPROVED',
  RATIONALE: 'Human reviewer verified the content and approved it.',
  EXPECTED_RECORD_COUNT: 50,
  BASELINE_ACTIVE_DB: 21,
  BASELINE_APPROVED_STAGING: 12,
  BASELINE_LEARNER_READY: 33,
  BASELINE_GAP: 9967,
  POST_ACTIVE_DB: 21,
  POST_APPROVED_STAGING: 62,
  POST_LEARNER_READY: 83,
  POST_GAP: 9917,
  TARGET_TOTAL: 10000,
  GATE_PASS: 'PASS',
  GATE_FAILED: 'FAILED',
});

const IMMUTABLE_CONTENT_FIELDS = Object.freeze([
  'learning_unit_key',
  'word',
  'part_of_speech',
  'cefr_level',
  'sense_index',
  'meaning_en',
  'meaning_th',
  'phonetic_ipa',
  'example_sentence',
]);

/**
 * Step 1: Pre-Flight Integrity Check (Fail-Closed).
 * Verifies the Phase 6.2.28 manifest against Phase 6.2.27 packet and batch,
 * canonical resolution (50/50 FOUND_EXACTLY_ONE), and null pre-execution slots in the manifest.
 */
export function verifyPhase6229PreFlight({
  projectRoot = DEFAULT_PROJECT_ROOT,
  manifestOverride = null,
  packetOverride = null,
  batchOverride = null,
} = {}) {
  const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
  const packetPath = path.join(projectRoot, 'reports/phase-6.2.27-human-review-packet.json');
  const batchPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');

  const errors = [];

  if (!manifestOverride && !fs.existsSync(manifestPath)) {
    errors.push(`Phase 6.2.28 manifest not found at ${manifestPath}`);
  }
  if (!packetOverride && !fs.existsSync(packetPath)) {
    errors.push(`Phase 6.2.27 review packet not found at ${packetPath}`);
  }
  if (!batchOverride && !fs.existsSync(batchPath)) {
    errors.push(`Phase 6.2.27 controlled batch not found at ${batchPath}`);
  }

  if (errors.length > 0) {
    return {
      passed: false,
      gate: PHASE_6_2_29_CONSTANTS.GATE_FAILED,
      errors,
    };
  }

  const manifest = manifestOverride || JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const packet = packetOverride || JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  const batch = batchOverride || JSON.parse(fs.readFileSync(batchPath, 'utf8'));

  const manifestRecords = Array.isArray(manifest?.records) ? manifest.records : [];
  const packetRecords = Array.isArray(packet?.records) ? packet.records : [];
  const batchRecords = Array.isArray(batch?.selected_records) ? batch.selected_records : [];

  // 1. manifest count === 50
  if (manifestRecords.length !== 50) {
    errors.push(`manifest count is ${manifestRecords.length}, expected 50`);
  }
  // 2. packet count === 50
  if (packetRecords.length !== 50) {
    errors.push(`packet count is ${packetRecords.length}, expected 50`);
  }
  // 3. controlled batch count === 50
  if (batchRecords.length !== 50) {
    errors.push(`controlled batch count is ${batchRecords.length}, expected 50`);
  }

  const manifestKeys = manifestRecords.map((r) => r.learning_unit_key);
  const packetKeys = packetRecords.map((r) => r.learning_unit_key);
  const batchKeys = batchRecords.map((r) => r.learning_unit_key);

  const manifestKeySet = new Set(manifestKeys);
  const batchKeySet = new Set(batchKeys);

  // 6. duplicate keys === 0
  const duplicateKeys = manifestKeys.filter((k, idx) => manifestKeys.indexOf(k) !== idx);
  if (duplicateKeys.length > 0) {
    errors.push(`duplicate keys detected in manifest: ${duplicateKeys.join(', ')}`);
  }

  // 7. missing keys === 0
  const missingKeys = batchKeys.filter((k) => !manifestKeySet.has(k));
  if (missingKeys.length > 0) {
    errors.push(`missing keys from locked batch: ${missingKeys.join(', ')}`);
  }

  // 8. extra keys === 0
  const extraKeys = manifestKeys.filter((k) => !batchKeySet.has(k));
  if (extraKeys.length > 0) {
    errors.push(`extra keys not in locked batch: ${extraKeys.join(', ')}`);
  }

  // 4 & 5. exact key match & exact order match === true
  let exactKeyMatch =
    manifestKeys.length === 50 &&
    packetKeys.length === 50 &&
    batchKeys.length === 50 &&
    duplicateKeys.length === 0 &&
    missingKeys.length === 0 &&
    extraKeys.length === 0;
  let exactOrderMatch = exactKeyMatch;

  if (manifestKeys.length === 50 && packetKeys.length === 50 && batchKeys.length === 50) {
    for (let i = 0; i < 50; i++) {
      if (manifestKeys[i] !== packetKeys[i] || manifestKeys[i] !== batchKeys[i]) {
        exactKeyMatch = false;
        exactOrderMatch = false;
        errors.push(
          `Order/key mismatch at index ${i}: manifest="${manifestKeys[i]}", packet="${packetKeys[i]}", batch="${batchKeys[i]}"`
        );
      }
      if (manifestRecords[i].sequence !== i + 1) {
        exactOrderMatch = false;
        errors.push(`Manifest sequence mismatch at index ${i}: got ${manifestRecords[i].sequence}, expected ${i + 1}`);
      }
    }
  }

  // 9, 10, 11, 12. Canonical resolution === 50/50 & pre-execution null slots in manifest
  let canonicalResolvedCount = 0;
  let nullHumanDecisionCount = 0;
  let nullReviewerIdCount = 0;
  let nullTransactionIdCount = 0;

  for (let i = 0; i < manifestRecords.length; i++) {
    const r = manifestRecords[i];
    const seq = i + 1;

    if (r.human_decision === null) {
      nullHumanDecisionCount++;
    } else {
      errors.push(`Manifest record #${seq} (${r.learning_unit_key}) has pre-filled human_decision="${r.human_decision}"`);
    }

    if (r.reviewer_id === null) {
      nullReviewerIdCount++;
    } else {
      errors.push(`Manifest record #${seq} (${r.learning_unit_key}) has pre-filled reviewer_id="${r.reviewer_id}"`);
    }

    if (r.review_transaction_id === null) {
      nullTransactionIdCount++;
    } else {
      errors.push(
        `Manifest record #${seq} (${r.learning_unit_key}) has pre-filled review_transaction_id="${r.review_transaction_id}"`
      );
    }

    const res = resolveCanonicalExactKey(r.learning_unit_key, { projectRoot });
    if (res.exact_resolution_status === CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE && res.matched_record) {
      const m = res.matched_record;
      if (
        m.word === r.word &&
        m.part_of_speech === r.part_of_speech &&
        m.cefr_level === r.cefr_level &&
        m.sense_index === r.sense_index
      ) {
        canonicalResolvedCount++;
      } else {
        errors.push(`Canonical field mismatch for #${seq} (${r.learning_unit_key})`);
      }
    } else {
      errors.push(
        `Canonical resolution failed for #${seq} (${r.learning_unit_key}): ${res.exact_resolution_status}`
      );
    }
  }

  const passed =
    errors.length === 0 &&
    manifestRecords.length === 50 &&
    packetRecords.length === 50 &&
    batchRecords.length === 50 &&
    exactKeyMatch &&
    exactOrderMatch &&
    duplicateKeys.length === 0 &&
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    canonicalResolvedCount === 50 &&
    nullHumanDecisionCount === 50 &&
    nullReviewerIdCount === 50 &&
    nullTransactionIdCount === 50;

  return {
    passed,
    gate: passed ? PHASE_6_2_29_CONSTANTS.GATE_PASS : PHASE_6_2_29_CONSTANTS.GATE_FAILED,
    errors,
    metrics: {
      manifest_count: manifestRecords.length,
      packet_count: packetRecords.length,
      controlled_batch_count: batchRecords.length,
      exact_key_match: exactKeyMatch,
      exact_order_match: exactOrderMatch,
      duplicate_keys: duplicateKeys.length,
      missing_keys: missingKeys.length,
      extra_keys: extraKeys.length,
      canonical_resolution: `${canonicalResolvedCount}/50`,
      canonical_resolution_count: canonicalResolvedCount,
      null_human_decision_count: nullHumanDecisionCount,
      null_reviewer_id_count: nullReviewerIdCount,
      null_review_transaction_id_count: nullTransactionIdCount,
    },
    manifest,
    packet,
    batch,
    lockedKeys: manifestKeys,
  };
}

/**
 * Executes a single atomic Human QA approval for one locked record across:
 * 1. Canonical TIER-1 batch
 * 2. Canonical LARGE batch
 * 3. reports/vocabulary-human-review-ledger.json
 *
 * Preserves content and provenance fields 100% unchanged and rolls back byte-for-byte on any failure.
 */
export function executeSinglePhase6229Approval({
  projectRoot = DEFAULT_PROJECT_ROOT,
  referenceRoot = DEFAULT_PROJECT_ROOT,
  learningUnitKey,
  sequence,
  reviewerId = PHASE_6_2_29_CONSTANTS.REVIEWER_ID,
  rationale = PHASE_6_2_29_CONSTANTS.RATIONALE,
  transactionId = null,
  timestamp = new Date().toISOString(),
  simulateFailureAfterTier1 = false,
  simulateFailureAfterLarge = false,
  simulateFailureBeforeLedger = false,
} = {}) {
  const reviewerValidation = validatePhase6226ReviewerIdentity(reviewerId);
  const cleanReviewerId = reviewerValidation.reviewer_id;
  if (cleanReviewerId !== PHASE_6_2_29_CONSTANTS.REVIEWER_ID) {
    throw new Error(
      `UNAUTHORIZED_REVIEWER_ID: Expected "${PHASE_6_2_29_CONSTANTS.REVIEWER_ID}", got "${cleanReviewerId}".`
    );
  }

  const cleanRationale = String(rationale || '').trim();
  if (cleanRationale.length < 10) {
    throw new Error('RATIONALE_REQUIRED: Review rationale must be at least 10 characters.');
  }

  const activeTxnId =
    transactionId ||
    `rev_txn_6229_${String(sequence).padStart(2, '0')}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  const provIndex = getRepositoryProvenanceIndex(referenceRoot);
  const tierHit = provIndex.tier1ByExactKey.get(learningUnitKey);
  const largeHit = provIndex.largeByExactKey.get(learningUnitKey);

  if (!tierHit || !largeHit) {
    throw new Error(
      `CANONICAL_BATCH_LOCATE_FAILED: Could not uniquely locate "${learningUnitKey}" in TIER-1 and LARGE batches.`
    );
  }

  const tier1BatchId = tierHit.batch_id || tierHit.batch_file.replace('.json', '');
  const largeBatchId = largeHit.batch_id || largeHit.batch_file.replace('.json', '');

  const tier1Path = path.join(projectRoot, `scripts/content-pipeline/output/tier1-batches/${tier1BatchId}.json`);
  const largePath = path.join(projectRoot, `scripts/content-pipeline/output/batches/${largeBatchId}.json`);
  const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');

  // Capture raw byte-for-byte snapshots for atomic rollback
  const snapshots = new Map([
    [tier1Path, fs.readFileSync(tier1Path, 'utf8')],
    [largePath, fs.readFileSync(largePath, 'utf8')],
    [ledgerPath, fs.readFileSync(ledgerPath, 'utf8')],
  ]);

  const tier1Batch = JSON.parse(snapshots.get(tier1Path));
  const largeBatch = JSON.parse(snapshots.get(largePath));
  const ledger = JSON.parse(snapshots.get(ledgerPath));

  if (Array.isArray(ledger.events) && ledger.events.some((e) => e.transaction_id === activeTxnId)) {
    throw new Error(`DUPLICATE_TRANSACTION_ID: "${activeTxnId}" already exists in ledger.`);
  }

  const tIdx = tier1Batch.records.findIndex((r) => r.learning_unit_key === learningUnitKey);
  const lIdx = largeBatch.records.findIndex((r) => r.learning_unit_key === learningUnitKey);
  if (tIdx === -1 || lIdx === -1) {
    throw new Error(`RECORD_NOT_FOUND_IN_BATCH: "${learningUnitKey}" missing from ${tier1BatchId} or ${largeBatchId}.`);
  }

  const beforeTier1 = structuredClone(tier1Batch.records[tIdx]);
  const beforeLarge = structuredClone(largeBatch.records[lIdx]);

  // Apply ONLY human review decision & lifecycle fields; keep all content and provenance fields untouched
  const applyApprovalFields = (rec) => {
    const updated = structuredClone(rec);
    updated.human_review_status = 'APPROVED';
    updated.reviewer_decision = 'APPROVED';
    updated.reviewed_by = cleanReviewerId;
    updated.reviewed_at = timestamp;
    updated.review_rationale = cleanRationale;
    updated.review_transaction_id = activeTxnId;
    updated.lifecycle_status = 'APPROVED';
    updated.is_active = false;
    updated.field_status = 'HUMAN_APPROVED';
    return updated;
  };

  const updatedTier1Record = applyApprovalFields(beforeTier1);
  const updatedLargeRecord = applyApprovalFields(beforeLarge);

  // Verify content & provenance immutability before writing
  for (const field of IMMUTABLE_CONTENT_FIELDS) {
    if (updatedTier1Record[field] !== beforeTier1[field] || updatedLargeRecord[field] !== beforeLarge[field]) {
      throw new Error(`CONTENT_MUTATION_FORBIDDEN: Field "${field}" mutated on "${learningUnitKey}".`);
    }
  }
  if (
    JSON.stringify(updatedTier1Record.provenance) !== JSON.stringify(beforeTier1.provenance) ||
    JSON.stringify(updatedLargeRecord.provenance) !== JSON.stringify(beforeLarge.provenance)
  ) {
    throw new Error(`PROVENANCE_MUTATION_FORBIDDEN: Provenance mutated on "${learningUnitKey}".`);
  }

  tier1Batch.records[tIdx] = updatedTier1Record;
  largeBatch.records[lIdx] = updatedLargeRecord;

  const ledgerEvent = {
    event_id: `rev_evt_${activeTxnId.replace(/^rev_txn_/, '')}`,
    transaction_id: activeTxnId,
    recorded_at: timestamp,
    event_type: 'PRODUCTION_REVIEW',
    is_production_review: true,
    counted_in_readiness: true,
    batch_id: tier1BatchId,
    source_batch_id: largeBatchId,
    learning_unit_key: learningUnitKey,
    word: updatedLargeRecord.word,
    cefr_level: updatedLargeRecord.cefr_level,
    reviewer_id: cleanReviewerId,
    decision: 'APPROVED',
    rationale: cleanRationale,
    ipa_disposition: 'VERIFIED_PRONUNCIATION',
    sense_disposition: 'CONFIRMED_UNAMBIGUOUS',
    edits: null,
    previous_values: null,
  };

  const updatedLedger = {
    ...ledger,
    events: [...(ledger.events || []), ledgerEvent],
    updated_at: timestamp,
  };
  updatedLedger.total_events = updatedLedger.events.length;
  updatedLedger.test_development_events = updatedLedger.events.filter(
    (e) => e.event_type === 'TEST_DEVELOPMENT' || e.is_production_review === false
  ).length;
  updatedLedger.production_human_reviews = updatedLedger.events.filter(
    (e) => e.event_type === 'PRODUCTION_REVIEW' && e.is_production_review === true
  ).length;

  try {
    validateBatchStructure(tier1Batch);
    validateBatchStructure(largeBatch);
    validateLedgerStructure(updatedLedger);

    fs.writeFileSync(tier1Path, JSON.stringify(tier1Batch, null, 2), 'utf8');
    if (simulateFailureAfterTier1) {
      throw new Error('Simulated mid-transaction failure after TIER-1 batch write.');
    }

    fs.writeFileSync(largePath, JSON.stringify(largeBatch, null, 2), 'utf8');
    if (simulateFailureAfterLarge) {
      throw new Error('Simulated mid-transaction failure after LARGE batch write.');
    }

    if (simulateFailureBeforeLedger) {
      throw new Error('Simulated mid-transaction failure before ledger write.');
    }

    atomicWriteFiles([
      { path: tier1Path, content: tier1Batch, validator: validateBatchStructure },
      { path: largePath, content: largeBatch, validator: validateBatchStructure },
      { path: ledgerPath, content: updatedLedger, validator: validateLedgerStructure },
    ]);
  } catch (err) {
    for (const [filePath, rawContent] of snapshots.entries()) {
      fs.writeFileSync(filePath, rawContent, 'utf8');
    }
    throw new Error(`ATOMIC_ROLLBACK_EXECUTED for "${learningUnitKey}": ${err.message}`);
  }

  return {
    sequence,
    learning_unit_key: learningUnitKey,
    word: updatedLargeRecord.word,
    part_of_speech: updatedLargeRecord.part_of_speech,
    cefr_level: updatedLargeRecord.cefr_level,
    sense_index: updatedLargeRecord.sense_index,
    tier1_batch_id: tier1BatchId,
    large_batch_id: largeBatchId,
    decision: 'APPROVED',
    lifecycle_status: 'APPROVED',
    human_review_status: 'APPROVED',
    is_active: false,
    reviewer_id: cleanReviewerId,
    reviewed_at: timestamp,
    transaction_id: activeTxnId,
    event_id: ledgerEvent.event_id,
  };
}

/**
 * Step 6 & 7: Post-Execution Cross-Layer Consistency & Readiness Verification.
 */
export function verifyPhase6229PostExecution({ projectRoot = DEFAULT_PROJECT_ROOT } = {}) {
  const preFlight = verifyPhase6229PreFlight({ projectRoot });
  const errors = [...preFlight.errors];

  const manifestRecords = preFlight.manifest?.records || [];
  const lockedKeys = preFlight.lockedKeys || [];

  const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
  const readinessPath = path.join(projectRoot, 'reports/vocabulary-human-qa-readiness.json');

  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));

  const provIndex = getRepositoryProvenanceIndex(projectRoot);
  const transactionIds = new Set();
  const verifiedRecords = [];

  let tier1SyncedCount = 0;
  let largeSyncedCount = 0;
  let ledgerSyncedCount = 0;
  let contentUnchangedCount = 0;
  let activePromotionsCount = 0;

  for (let i = 0; i < manifestRecords.length; i++) {
    const mRec = manifestRecords[i];
    const key = mRec.learning_unit_key;
    const seq = i + 1;

    const tHit = provIndex.tier1ByExactKey.get(key);
    const lHit = provIndex.largeByExactKey.get(key);

    if (!tHit || !lHit) {
      errors.push(`Record #${seq} (${key}) missing in TIER-1 or LARGE batch.`);
      continue;
    }

    const tPath = path.join(projectRoot, `scripts/content-pipeline/output/tier1-batches/${tHit.batch_file}`);
    const lPath = path.join(projectRoot, `scripts/content-pipeline/output/batches/${lHit.batch_file}`);

    const tBatch = JSON.parse(fs.readFileSync(tPath, 'utf8'));
    const lBatch = JSON.parse(fs.readFileSync(lPath, 'utf8'));

    const tRec = tBatch.records.find((r) => r.learning_unit_key === key);
    const lRec = lBatch.records.find((r) => r.learning_unit_key === key);

    if (!tRec || !lRec) {
      errors.push(`Record #${seq} (${key}) missing inside loaded batch JSON.`);
      continue;
    }

    // Verify TIER-1 fields
    const tOk =
      tRec.human_review_status === 'APPROVED' &&
      tRec.reviewer_decision === 'APPROVED' &&
      tRec.reviewed_by === PHASE_6_2_29_CONSTANTS.REVIEWER_ID &&
      Boolean(tRec.reviewed_at) &&
      tRec.review_rationale === PHASE_6_2_29_CONSTANTS.RATIONALE &&
      Boolean(tRec.review_transaction_id) &&
      tRec.lifecycle_status === 'APPROVED' &&
      tRec.is_active === false;

    if (tOk) {
      tier1SyncedCount++;
    } else {
      errors.push(`TIER-1 state invalid for #${seq} (${key})`);
    }

    // Verify LARGE fields and 1:1 parity with TIER-1
    const lOk =
      lRec.human_review_status === 'APPROVED' &&
      lRec.reviewer_decision === 'APPROVED' &&
      lRec.reviewed_by === PHASE_6_2_29_CONSTANTS.REVIEWER_ID &&
      lRec.reviewed_at === tRec.reviewed_at &&
      lRec.review_rationale === PHASE_6_2_29_CONSTANTS.RATIONALE &&
      lRec.review_transaction_id === tRec.review_transaction_id &&
      lRec.lifecycle_status === 'APPROVED' &&
      lRec.is_active === false;

    if (lOk) {
      largeSyncedCount++;
    } else {
      errors.push(`LARGE state invalid or out of sync with TIER-1 for #${seq} (${key})`);
    }

    if (tRec.is_active === true || lRec.is_active === true || tRec.lifecycle_status === 'ACTIVE' || lRec.lifecycle_status === 'ACTIVE') {
      activePromotionsCount++;
      errors.push(`Forbidden ACTIVE promotion detected on #${seq} (${key})`);
    }

    // Verify content immutability against Phase 6.2.28 manifest
    const contentSame =
      lRec.word === mRec.word &&
      lRec.part_of_speech === mRec.part_of_speech &&
      lRec.cefr_level === mRec.cefr_level &&
      lRec.sense_index === mRec.sense_index &&
      lRec.meaning_en === mRec.meaning_en &&
      lRec.meaning_th === mRec.meaning_th &&
      lRec.phonetic_ipa === mRec.ipa &&
      lRec.example_sentence === mRec.example_sentence &&
      tRec.word === mRec.word &&
      tRec.part_of_speech === mRec.part_of_speech &&
      tRec.cefr_level === mRec.cefr_level &&
      tRec.sense_index === mRec.sense_index &&
      tRec.meaning_en === mRec.meaning_en &&
      tRec.meaning_th === mRec.meaning_th &&
      tRec.phonetic_ipa === mRec.ipa &&
      tRec.example_sentence === mRec.example_sentence;

    if (contentSame) {
      contentUnchangedCount++;
    } else {
      errors.push(`Content field drift detected against manifest for #${seq} (${key})`);
    }

    // Verify production review ledger event
    const matchingEvents = (ledger.events || []).filter(
      (e) =>
        e.learning_unit_key === key &&
        e.event_type === 'PRODUCTION_REVIEW' &&
        e.is_production_review === true &&
        e.counted_in_readiness === true &&
        e.decision === 'APPROVED' &&
        e.reviewer_id === PHASE_6_2_29_CONSTANTS.REVIEWER_ID &&
        e.transaction_id === lRec.review_transaction_id
    );

    if (matchingEvents.length === 1) {
      ledgerSyncedCount++;
      transactionIds.add(lRec.review_transaction_id);
    } else {
      errors.push(
        `Expected exactly 1 matching PRODUCTION_REVIEW event for #${seq} (${key}), found ${matchingEvents.length}`
      );
    }

    verifiedRecords.push({
      sequence: seq,
      learning_unit_key: key,
      word: lRec.word,
      part_of_speech: lRec.part_of_speech,
      cefr_level: lRec.cefr_level,
      sense_index: lRec.sense_index,
      tier1_batch_id: tHit.batch_file.replace('.json', ''),
      large_batch_id: lHit.batch_file.replace('.json', ''),
      decision: lRec.reviewer_decision,
      lifecycle_status: lRec.lifecycle_status,
      is_active: lRec.is_active,
      reviewer_id: lRec.reviewed_by,
      reviewed_at: lRec.reviewed_at,
      transaction_id: lRec.review_transaction_id,
    });
  }

  if (transactionIds.size !== 50) {
    errors.push(`Expected 50 unique transaction_ids across the 50 approved records, found ${transactionIds.size}`);
  }

  // Readiness accounting verification
  const activeDb = readiness.inventory_metrics?.existing_active_curated_units;
  const approvedStaging = readiness.human_review_status_breakdown?.human_approved;
  const learnerReady = readiness.learner_ready_metrics?.currently_learner_ready_units;
  const remainingGap = readiness.learner_ready_metrics?.remaining_gap_to_10000_learner_ready;
  const userTestingAuth = readiness.user_testing_authorized;
  const overallStatus = readiness.overall_status;
  const prodDbModified = readiness.production_safety?.production_database_modified;

  if (activeDb !== PHASE_6_2_29_CONSTANTS.POST_ACTIVE_DB) {
    errors.push(`Active Curated DB is ${activeDb}, expected ${PHASE_6_2_29_CONSTANTS.POST_ACTIVE_DB}`);
  }
  if (approvedStaging !== PHASE_6_2_29_CONSTANTS.POST_APPROVED_STAGING) {
    errors.push(`Human-Approved Staging is ${approvedStaging}, expected ${PHASE_6_2_29_CONSTANTS.POST_APPROVED_STAGING}`);
  }
  if (learnerReady !== PHASE_6_2_29_CONSTANTS.POST_LEARNER_READY) {
    errors.push(`Learner-Ready Total is ${learnerReady}, expected ${PHASE_6_2_29_CONSTANTS.POST_LEARNER_READY}`);
  }
  if (remainingGap !== PHASE_6_2_29_CONSTANTS.POST_GAP) {
    errors.push(`Remaining Gap is ${remainingGap}, expected ${PHASE_6_2_29_CONSTANTS.POST_GAP}`);
  }
  if (userTestingAuth !== false) {
    errors.push(`user_testing_authorized is ${userTestingAuth}, expected false`);
  }
  if (overallStatus !== 'NOT_READY') {
    errors.push(`overall_status is "${overallStatus}", expected "NOT_READY"`);
  }
  if (prodDbModified !== false) {
    errors.push(`production_database_modified is ${prodDbModified}, expected false`);
  }

  const integrityAudit = runQaIntegrityAudit({ projectRoot });
  if (!integrityAudit.passed) {
    errors.push(...integrityAudit.issues);
  }

  const passed =
    errors.length === 0 &&
    tier1SyncedCount === 50 &&
    largeSyncedCount === 50 &&
    ledgerSyncedCount === 50 &&
    contentUnchangedCount === 50 &&
    transactionIds.size === 50 &&
    activePromotionsCount === 0;

  return {
    passed,
    gate: passed ? PHASE_6_2_29_CONSTANTS.GATE_PASS : PHASE_6_2_29_CONSTANTS.GATE_FAILED,
    errors,
    counts: {
      tier1_synced_count: tier1SyncedCount,
      large_synced_count: largeSyncedCount,
      ledger_synced_count: ledgerSyncedCount,
      unique_transaction_ids: transactionIds.size,
      content_unchanged_count: contentUnchangedCount,
      active_promotions_count: activePromotionsCount,
      production_db_writes: 0,
    },
    readiness_summary: {
      baseline: {
        active_curated_db: PHASE_6_2_29_CONSTANTS.BASELINE_ACTIVE_DB,
        human_approved_staging: PHASE_6_2_29_CONSTANTS.BASELINE_APPROVED_STAGING,
        learner_ready_total: PHASE_6_2_29_CONSTANTS.BASELINE_LEARNER_READY,
        remaining_gap: PHASE_6_2_29_CONSTANTS.BASELINE_GAP,
      },
      after_phase_6_2_29: {
        active_curated_db: activeDb,
        human_approved_staging: approvedStaging,
        learner_ready_total: learnerReady,
        remaining_gap: remainingGap,
        target_total: PHASE_6_2_29_CONSTANTS.TARGET_TOTAL,
        user_testing_authorized: userTestingAuth,
        overall_status: overallStatus,
      },
    },
    verified_records: verifiedRecords,
    locked_keys: lockedKeys,
  };
}

/**
 * Verifies atomic multi-file rollback in an isolated temporary sandbox so live data is untouched.
 */
export function verifyPhase6229AtomicSandboxRollback({ projectRoot = DEFAULT_PROJECT_ROOT } = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glova-phase-6229-atomic-'));
  try {
    const t1Dir = path.join(tempDir, 'scripts/content-pipeline/output/tier1-batches');
    const lgDir = path.join(tempDir, 'scripts/content-pipeline/output/batches');
    const repDir = path.join(tempDir, 'reports');
    fs.mkdirSync(t1Dir, { recursive: true });
    fs.mkdirSync(lgDir, { recursive: true });
    fs.mkdirSync(repDir, { recursive: true });

    fs.copyFileSync(
      path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json'),
      path.join(t1Dir, 'TIER-1-001.json')
    );
    fs.copyFileSync(
      path.join(projectRoot, 'scripts/content-pipeline/output/batches/LARGE-010.json'),
      path.join(lgDir, 'LARGE-010.json')
    );
    fs.copyFileSync(
      path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'),
      path.join(repDir, 'vocabulary-human-review-ledger.json')
    );

    const t1Path = path.join(t1Dir, 'TIER-1-001.json');
    const lgPath = path.join(lgDir, 'LARGE-010.json');
    const ldPath = path.join(repDir, 'vocabulary-human-review-ledger.json');

    const beforeT1 = fs.readFileSync(t1Path, 'utf8');
    const beforeLg = fs.readFileSync(lgPath, 'utf8');
    const beforeLd = fs.readFileSync(ldPath, 'utf8');

    let tier1RollbackCaught = false;
    try {
      executeSinglePhase6229Approval({
        projectRoot: tempDir,
        learningUnitKey: 'gape|verb|C1|sense:2',
        sequence: 1,
        transactionId: 'rev_txn_6229_sandbox_rollback_1',
        simulateFailureAfterTier1: true,
      });
    } catch (err) {
      tier1RollbackCaught = err.message.includes('ATOMIC_ROLLBACK_EXECUTED');
    }

    let largeRollbackCaught = false;
    try {
      executeSinglePhase6229Approval({
        projectRoot: tempDir,
        learningUnitKey: 'gape|verb|C1|sense:2',
        sequence: 1,
        transactionId: 'rev_txn_6229_sandbox_rollback_2',
        simulateFailureAfterLarge: true,
      });
    } catch (err) {
      largeRollbackCaught = err.message.includes('ATOMIC_ROLLBACK_EXECUTED');
    }

    const afterT1 = fs.readFileSync(t1Path, 'utf8');
    const afterLg = fs.readFileSync(lgPath, 'utf8');
    const afterLd = fs.readFileSync(ldPath, 'utf8');

    return {
      passed:
        tier1RollbackCaught &&
        largeRollbackCaught &&
        beforeT1 === afterT1 &&
        beforeLg === afterLg &&
        beforeLd === afterLd,
      tier1_rollback_caught: tier1RollbackCaught,
      large_rollback_caught: largeRollbackCaught,
      byte_for_byte_restored: beforeT1 === afterT1 && beforeLg === afterLg && beforeLd === afterLd,
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Generates the Markdown assessment report for Phase 6.2.29.
 */
export function buildPhase6229MarkdownReport(reportData) {
  const {
    executed_at,
    gate_verdict,
    pre_flight_verification,
    execution_summary,
    readiness_transition,
    approved_records,
  } = reportData;

  let md = `# Phase 6.2.29 — Human QA Execution Report (Locked 50 Records)

- **Phase:** \`6.2.29\`
- **Executed At:** \`${executed_at}\`
- **Human Reviewer ID:** \`${PHASE_6_2_29_CONSTANTS.REVIEWER_ID}\`
- **Human Decision Input:** \`${PHASE_6_2_29_CONSTANTS.DECISION_INPUT}\` (\`APPROVED\` in staging)
- **Final Gate Verdict:** \`HUMAN_QA_EXECUTION_GATE = ${gate_verdict}\`

---

## 1. Pre-Flight Integrity Verification

| Check | Expected | Actual | Status |
|---|---|---|---|
| Manifest Record Count | \`50\` | \`${pre_flight_verification.manifest_count}\` | PASS |
| Packet Record Count | \`50\` | \`${pre_flight_verification.packet_count}\` | PASS |
| Controlled Batch Record Count | \`50\` | \`${pre_flight_verification.controlled_batch_count}\` | PASS |
| Exact Key Match (1:1) | \`true\` | \`${pre_flight_verification.exact_key_match}\` | PASS |
| Exact Sequence Order Match (1..50) | \`true\` | \`${pre_flight_verification.exact_order_match}\` | PASS |
| Duplicate Keys | \`0\` | \`${pre_flight_verification.duplicate_keys}\` | PASS |
| Missing Keys | \`0\` | \`${pre_flight_verification.missing_keys}\` | PASS |
| Extra Keys | \`0\` | \`${pre_flight_verification.extra_keys}\` | PASS |
| Canonical Resolution (\`FOUND_EXACTLY_ONE\`) | \`50/50\` | \`${pre_flight_verification.canonical_resolution}\` | PASS |
| Pre-Execution Null Decision Slots | \`50/50\` | \`${pre_flight_verification.null_human_decision_count}/50\` | PASS |

---

## 2. Execution & Cross-Batch Synchronization Summary

| Metric | Value |
|---|---|
| Records Approved in Phase 6.2.29 | \`${execution_summary.approved_count} / 50\` |
| TIER-1 Batch Records Synchronized | \`${execution_summary.tier1_synced_count} / 50\` (\`TIER-1-001\`) |
| LARGE Batch Records Synchronized | \`${execution_summary.large_synced_count} / 50\` (\`LARGE-006, 007, 010, 011, 015\`) |
| Production Review Ledger Events Recorded | \`${execution_summary.ledger_synced_count} / 50\` |
| Unique Transaction IDs Generated | \`${execution_summary.unique_transaction_ids} / 50\` |
| Content & Provenance Fields Unchanged | \`${execution_summary.content_unchanged_count} / 50\` |
| Staged Records Promoted to \`ACTIVE\` | \`${execution_summary.active_promotions_count}\` |
| Production Database Writes Executed | \`${execution_summary.production_db_writes}\` |

---

## 3. Readiness Accounting Transition

| Metric | Baseline (Phase 6.2.28) | Post-Execution (Phase 6.2.29) | Delta |
|---|---|---|---|
| Active Curated DB Units | \`${readiness_transition.baseline.active_curated_db}\` | \`${readiness_transition.after_phase_6_2_29.active_curated_db}\` | \`0\` |
| Human-Approved Staging Units | \`${readiness_transition.baseline.human_approved_staging}\` | \`${readiness_transition.after_phase_6_2_29.human_approved_staging}\` | \`+50\` |
| Learner-Ready Total Units | \`${readiness_transition.baseline.learner_ready_total}\` | \`${readiness_transition.after_phase_6_2_29.learner_ready_total}\` | \`+50\` |
| Remaining Gap to 10,000 Target | \`${readiness_transition.baseline.remaining_gap}\` | \`${readiness_transition.after_phase_6_2_29.remaining_gap}\` | \`-50\` |
| User Testing Authorized | \`false\` | \`${readiness_transition.after_phase_6_2_29.user_testing_authorized}\` | Unchanged |
| Overall Readiness Status | \`NOT_READY\` | \`${readiness_transition.after_phase_6_2_29.overall_status}\` | Unchanged |

---

## 4. Exact 50 Approved Records Ledger Manifest

| Seq | Learning Unit Key | Word | POS | CEFR | Sense | TIER-1 Batch | LARGE Batch | Transaction ID |
|---|---|---|---|---|---|---|---|---|
`;

  for (const r of approved_records) {
    md += `| ${r.sequence} | \`${r.learning_unit_key}\` | **${r.word}** | \`${r.part_of_speech}\` | \`${r.cefr_level}\` | ${r.sense_index} | \`${r.tier1_batch_id}\` | \`${r.large_batch_id}\` | \`${r.transaction_id}\` |\n`;
  }

  md += `
---

## 5. Mandatory Confirmation Statement

\`\`\`text
50 records were approved based on explicit human review.
No record was activated.
No unrelated production data was mutated.
\`\`\`
`;

  return md;
}

/**
 * Full Phase 6.2.29 Execution Runner.
 */
export function runPhase6229ControlledHumanQaExecution({
  projectRoot = DEFAULT_PROJECT_ROOT,
  writeArtifacts = true,
} = {}) {
  // Step 1: Pre-flight integrity check
  const preFlight = verifyPhase6229PreFlight({ projectRoot });
  if (!preFlight.passed) {
    throw new Error(
      `HUMAN_QA_EXECUTION_GATE = FAILED (Pre-flight failed):\n  - ${preFlight.errors.join('\n  - ')}`
    );
  }

  // Step 2-5: Execute approval for each of the 50 locked records in sequence (idempotent if already approved)
  const manifestRecords = preFlight.manifest.records;
  const provIndex = getRepositoryProvenanceIndex(projectRoot);
  const executedTransactions = [];

  for (let i = 0; i < manifestRecords.length; i++) {
    const item = manifestRecords[i];
    const seq = i + 1;
    const key = item.learning_unit_key;

    const lHit = provIndex.largeByExactKey.get(key);
    let currentLargeRec = null;
    if (lHit) {
      const liveLargePath = path.join(projectRoot, `scripts/content-pipeline/output/batches/${lHit.batch_file}`);
      const liveLargeBatch = JSON.parse(fs.readFileSync(liveLargePath, 'utf8'));
      currentLargeRec = liveLargeBatch.records.find((r) => r.learning_unit_key === key);
    }

    // Check if already approved by human_lexicographer_lead in a previous run
    if (
      currentLargeRec &&
      currentLargeRec.reviewer_decision === 'APPROVED' &&
      currentLargeRec.lifecycle_status === 'APPROVED' &&
      currentLargeRec.reviewed_by === PHASE_6_2_29_CONSTANTS.REVIEWER_ID &&
      currentLargeRec.review_transaction_id
    ) {
      executedTransactions.push({
        sequence: seq,
        learning_unit_key: key,
        transaction_id: currentLargeRec.review_transaction_id,
        already_committed: true,
      });
      continue;
    }

    const res = executeSinglePhase6229Approval({
      projectRoot,
      learningUnitKey: key,
      sequence: seq,
      reviewerId: PHASE_6_2_29_CONSTANTS.REVIEWER_ID,
      rationale: PHASE_6_2_29_CONSTANTS.RATIONALE,
    });
    executedTransactions.push({
      sequence: seq,
      learning_unit_key: key,
      transaction_id: res.transaction_id,
      already_committed: false,
    });
  }

  // Step 7: Refresh live readiness report
  generateHumanQaReadinessReport({ projectRoot, writeArtifact: true });

  // Step 6 & 7: Verify post-execution consistency across TIER-1, LARGE, Ledger, and Readiness
  const postVerification = verifyPhase6229PostExecution({ projectRoot });
  if (!postVerification.passed) {
    throw new Error(
      `HUMAN_QA_EXECUTION_GATE = FAILED (Post-execution verification failed):\n  - ${postVerification.errors.join('\n  - ')}`
    );
  }

  const atomicRollbackCheck = verifyPhase6229AtomicSandboxRollback({ projectRoot });
  if (!atomicRollbackCheck.passed) {
    throw new Error('HUMAN_QA_EXECUTION_GATE = FAILED (Atomic sandbox rollback verification failed).');
  }

  const reportData = {
    phase: PHASE_6_2_29_CONSTANTS.PHASE,
    report_title: 'Phase 6.2.29 — Verified Human QA Approval Execution Report (50 Locked Records)',
    executed_at: new Date().toISOString(),
    gate_verdict: PHASE_6_2_29_CONSTANTS.GATE_PASS,
    human_qa_execution_gate: PHASE_6_2_29_CONSTANTS.GATE_PASS,
    reviewer_id: PHASE_6_2_29_CONSTANTS.REVIEWER_ID,
    decision_input: PHASE_6_2_29_CONSTANTS.DECISION_INPUT,
    recorded_decision: PHASE_6_2_29_CONSTANTS.RECORDED_DECISION,
    rationale: PHASE_6_2_29_CONSTANTS.RATIONALE,
    source_artifacts: {
      execution_manifest: 'reports/phase-6.2.28-human-qa-execution-manifest.json',
      controlled_batch: 'reports/phase-6.2.27-controlled-qa-batch.json',
      review_packet: 'reports/phase-6.2.27-human-review-packet.json',
    },
    pre_flight_verification: preFlight.metrics,
    execution_summary: {
      approved_count: postVerification.verified_records.length,
      ...postVerification.counts,
      atomic_rollback_verified: atomicRollbackCheck.passed,
    },
    readiness_transition: postVerification.readiness_summary,
    approved_records: postVerification.verified_records,
    confirmation_statement: [
      '50 records were approved based on explicit human review.',
      'No record was activated.',
      'No unrelated production data was mutated.',
    ],
  };

  const reportJsonPath = path.join(projectRoot, 'reports/phase-6.2.29-human-qa-execution-report.json');
  const reportMdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.29-human-qa-execution-report.md');

  if (writeArtifacts) {
    fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
    fs.mkdirSync(path.dirname(reportMdPath), { recursive: true });
    fs.writeFileSync(reportJsonPath, JSON.stringify(reportData, null, 2), 'utf8');
    fs.writeFileSync(reportMdPath, buildPhase6229MarkdownReport(reportData), 'utf8');
  }

  return {
    reportData,
    reportJsonPath,
    reportMdPath,
    gate: PHASE_6_2_29_CONSTANTS.GATE_PASS,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = runPhase6229ControlledHumanQaExecution();
  console.log(`Phase 6.2.29 execution complete. Gate: ${result.gate}`);
  console.log(
    `Readiness: Active=${result.reportData.readiness_transition.after_phase_6_2_29.active_curated_db}, ` +
      `Approved=${result.reportData.readiness_transition.after_phase_6_2_29.human_approved_staging}, ` +
      `Learner-Ready=${result.reportData.readiness_transition.after_phase_6_2_29.learner_ready_total}, ` +
      `Gap=${result.reportData.readiness_transition.after_phase_6_2_29.remaining_gap}`
  );
}
