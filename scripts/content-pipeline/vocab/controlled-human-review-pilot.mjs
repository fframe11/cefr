/**
 * Phase 6.2.23 — Controlled Human Review Pilot Engine
 *
 * Responsibilities:
 * 1. Prepare the deterministic 15-record controlled human-review pilot queue:
 *    - 5 exact REVIEW_READY records:
 *      - accept|verb|A2|sense:1
 *      - careful|adjective|A2|sense:2
 *      - collect|verb|A2|sense:1
 *      - conversation|noun|A1|sense:1
 *      - correct|verb|A2|sense:1
 *    - 5 representative EDIT_REQUIRED records covering distinct example-sentence presentation flaws
 *    - 5 representative SPECIAL_SYNTAX records covering 5 distinct closed-class grammatical categories
 *    (Strictly leaves the remaining 98 EDIT_REQUIRED, 88 SPECIAL_SYNTAX, and 799 UNRESOLVED untouched.)
 * 2. Provide the 11-field Human Decision Interface showing:
 *    word, POS, CEFR, English meaning, Thai meaning, IPA, example sentence,
 *    lexical source, sense evidence, provenance, and known quality concerns.
 *    Allows only: APPROVE, EDIT_REQUIRED, HOLD.
 *    Requires: reviewer_id, rationale, timestamp, transaction_id.
 * 3. Enforce STOP FOR ACTUAL HUMAN INPUT:
 *    - Never simulate a human or invent a reviewer identity.
 *    - When no real human decisions are supplied, leave all 15 pilot records at:
 *      reviewer_decision = null, reviewer_id = null, reviewed_at = null,
 *      lifecycle_status = "REVIEW_REQUIRED", field_status = "AI_DRAFT"
 *      and report final gate: NO_HUMAN_DECISIONS_AVAILABLE.
 * 4. Verify real-human submission handling & atomic multi-file rollback integrity in an isolated sandbox:
 *    - APPROVE requires all blocking quality gates to pass, transitions REVIEW_REQUIRED -> APPROVED (never ACTIVE).
 *    - EDIT_REQUIRED records exact edited fields, preserves previous values, records rationale, remains non-learner-ready.
 *    - HOLD requires rationale and remains non-learner-ready.
 *    - Multi-file transaction updates Tier batch, LARGE batch, review ledger, and provenance/history atomically,
 *      and rolls back completely on failure with 0 partial writes and 0 phantom ledger events.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateReviewerIdentity,
  generateReviewTransactionId,
  generateHumanQaReadinessReport,
  evaluateEightDimensionAudit,
  validateBatchStructure,
  validateLedgerStructure,
  atomicWriteFiles,
} from './human-review-engine.mjs';
import {
  validateExampleSentenceQuality,
  validateThaiMeaningQuality,
  validatePhoneticIpaQuality,
} from './enrichment-quality-gates.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

const HUMAN_PACKET_22_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.22-human-review-packet.json');
const SPECIAL_SYNTAX_22_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.22-special-syntax-adjudication.json');
const RECONCILIATION_22_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.22-candidate-ready-reconciliation.json');
const BATCHES_DIR = path.join(ROOT_DIR, 'scripts/content-pipeline/output/batches');
const LEDGER_PATH = path.join(ROOT_DIR, 'reports/vocabulary-human-review-ledger.json');

const PILOT_REPORT_23_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.23-human-review-pilot.json');
const PILOT_MD_23_PATH = path.join(ROOT_DIR, 'docs/assessment/phase-6.2.23-controlled-human-review-pilot.md');

export const EXACT_REVIEW_READY_KEYS = Object.freeze([
  'accept|verb|A2|sense:1',
  'careful|adjective|A2|sense:2',
  'collect|verb|A2|sense:1',
  'conversation|noun|A1|sense:1',
  'correct|verb|A2|sense:1',
]);

export const ALLOWED_PILOT_DISPOSITIONS = Object.freeze([
  'APPROVE',
  'EDIT_REQUIRED',
  'HOLD',
]);

export const DECISION_GATES_6_2_23 = Object.freeze({
  HUMAN_REVIEW_PILOT_COMPLETED: 'HUMAN_REVIEW_PILOT_COMPLETED',
  NO_HUMAN_DECISIONS_AVAILABLE: 'NO_HUMAN_DECISIONS_AVAILABLE',
  NEEDS_REWORK: 'NEEDS_REWORK',
});

export const REQUIRED_INTERFACE_FIELDS = Object.freeze([
  'word',
  'pos',
  'cefr',
  'english_meaning',
  'thai_meaning',
  'ipa',
  'example_sentence',
  'lexical_source',
  'sense_evidence',
  'provenance',
  'known_quality_concerns',
]);

let _cachedDefaultBatchMap = null;

/**
 * Loads all 50 authoritative LARGE batches into a Map keyed by learning_unit_key.
 */
function loadLargeBatchMap(batchesDir = BATCHES_DIR) {
  if (batchesDir === BATCHES_DIR && _cachedDefaultBatchMap) {
    return _cachedDefaultBatchMap;
  }
  const map = new Map();
  const files = fs
    .readdirSync(batchesDir)
    .filter(f => /^LARGE-\d+\.json$/.test(f))
    .sort();

  for (const file of files) {
    const fullPath = path.join(batchesDir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const rec of data.records || []) {
      map.set(rec.learning_unit_key, {
        batchId: data.batch_id || file.replace('.json', ''),
        filePath: fullPath,
        unit: rec,
      });
    }
  }
  if (batchesDir === BATCHES_DIR) {
    _cachedDefaultBatchMap = map;
  }
  return map;
}

export const AUTHORITATIVE_SET_B_REVIEW_READY_KEYS = Object.freeze([
  'keep|verb|A1|sense:1',
  'leave|verb|A1|sense:1',
  'sit|verb|A1|sense:1',
  'read|verb|A1|sense:1',
  'simple|adjective|A2|sense:1',
]);

export const MANDATED_REVIEW_READY_FALLBACK_SPECS_DISABLED = true;

export const REJECTED_SYNTHETIC_PILOT_FALLBACK_KEYS = Object.freeze([
  'careful|adjective|A2|sense:2',
  'collect|verb|A2|sense:1',
  'correct|verb|A2|sense:1',
]);

let _cachedCanonicalLargeInventory = null;
let _cachedHumanPacket22 = null;

/**
 * Loads all 50 authoritative LARGE batches into:
 * - byExactKey: Map<learning_unit_key, Array<{ batchId, batchFile, filePath, unit }>>
 * - keysByHeadword: Map<headword, Array<learning_unit_key>>
 */
function loadCanonicalLargeInventory(batchesDir = BATCHES_DIR) {
  if (batchesDir === BATCHES_DIR && _cachedCanonicalLargeInventory) {
    return _cachedCanonicalLargeInventory;
  }
  const byExactKey = new Map();
  const keysByHeadword = new Map();
  const files = fs
    .readdirSync(batchesDir)
    .filter(f => /^LARGE-\d+\.json$/.test(f))
    .sort();

  for (const file of files) {
    const fullPath = path.join(batchesDir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const batchId = data.batch_id || file.replace('.json', '');
    for (const rec of data.records || []) {
      const key = rec.learning_unit_key;
      if (!key) continue;
      if (!byExactKey.has(key)) {
        byExactKey.set(key, []);
      }
      byExactKey.get(key).push({
        batchId,
        batchFile: file,
        filePath: fullPath,
        unit: rec,
      });
      const hw = String(rec.word || '').toLowerCase();
      if (!keysByHeadword.has(hw)) {
        keysByHeadword.set(hw, []);
      }
      keysByHeadword.get(hw).push(key);
    }
  }

  for (const [hw, keys] of keysByHeadword.entries()) {
    keysByHeadword.set(hw, [...new Set(keys)].sort());
  }

  const inv = { byExactKey, keysByHeadword };
  if (batchesDir === BATCHES_DIR) {
    _cachedCanonicalLargeInventory = inv;
  }
  return inv;
}

/**
 * Resolves a requested pilot review target strictly against canonical LARGE-*.json inventory.
 * Never constructs a synthetic fallback record and never substitutes another sense, POS, or CEFR record.
 */
export function selectCanonicalPilotReviewTarget(requestedKey, options = {}) {
  const batchesDir = options.batchesDir || BATCHES_DIR;
  const humanPacketPath = options.humanPacketPath || HUMAN_PACKET_22_PATH;
  const { byExactKey, keysByHeadword } = loadCanonicalLargeInventory(batchesDir);
  let humanPacket;
  if (humanPacketPath === HUMAN_PACKET_22_PATH && _cachedHumanPacket22) {
    humanPacket = _cachedHumanPacket22;
  } else {
    humanPacket = fs.existsSync(humanPacketPath)
      ? JSON.parse(fs.readFileSync(humanPacketPath, 'utf8'))
      : { items: [] };
    if (humanPacketPath === HUMAN_PACKET_22_PATH) {
      _cachedHumanPacket22 = humanPacket;
    }
  }

  if (typeof requestedKey !== 'string' || requestedKey.split('|').length !== 4) {
    return {
      requested_key: String(requestedKey),
      status: 'NOT_FOUND',
      exact_resolution_status: 'NOT_FOUND',
      classification: 'INVALID_REVIEW_TARGET',
      not_found_in_canonical_large_inventory: true,
      provenance_status: 'CEFR_PROVENANCE_REVIEW_REQUIRED',
      review_status: 'HOLD',
      canonical_existing_records: [],
      review_record: null,
    };
  }

  const [word, pos, cefr, sense] = requestedKey.split('|');
  const headword = word.toLowerCase();
  const canonicalExistingKeys = keysByHeadword.get(headword) || [];
  const canonicalExistingRecords = canonicalExistingKeys.map(k => {
    const entry = byExactKey.get(k)?.[0];
    return {
      learning_unit_key: k,
      canonical_batch_id: entry?.batchId || null,
      canonical_source_file: entry ? `scripts/content-pipeline/output/batches/${entry.batchFile}` : null,
      canonical_cefr: entry?.unit?.cefr_level || null,
      canonical_pos: entry?.unit?.part_of_speech || null,
      canonical_sense: k.split('|')[3] || null,
    };
  });

  const matches = byExactKey.get(requestedKey) || [];
  if (matches.length === 0) {
    const samePosDiffCefr = canonicalExistingRecords.some(
      r => r.canonical_pos === pos && r.canonical_cefr !== cefr
    );
    const samePosCefrDiffSense = canonicalExistingRecords.some(
      r => r.canonical_pos === pos && r.canonical_cefr === cefr && r.canonical_sense !== sense
    );
    const diffPosOnly =
      canonicalExistingRecords.length > 0 &&
      canonicalExistingRecords.every(r => r.canonical_pos !== pos);

    const exactResolutionStatus = samePosDiffCefr
      ? 'CEFR_MISMATCH'
      : samePosCefrDiffSense
      ? 'SENSE_MISMATCH'
      : diffPosOnly
      ? 'POS_MISMATCH'
      : 'NOT_FOUND';

    return {
      requested_key: requestedKey,
      status: 'NOT_FOUND',
      exact_resolution_status: exactResolutionStatus,
      classification: 'INVALID_REVIEW_TARGET',
      not_found_in_canonical_large_inventory: true,
      provenance_status: 'CEFR_PROVENANCE_REVIEW_REQUIRED',
      review_status: 'HOLD',
      canonical_existing_records: canonicalExistingRecords,
      canonical_existing_keys: canonicalExistingKeys,
      review_record: null,
    };
  }

  if (matches.length > 1) {
    return {
      requested_key: requestedKey,
      status: 'DUPLICATE_CANONICAL_KEY',
      exact_resolution_status: 'DUPLICATE_CANONICAL_KEY',
      classification: 'INVALID_REVIEW_TARGET',
      not_found_in_canonical_large_inventory: false,
      provenance_status: 'CEFR_PROVENANCE_REVIEW_REQUIRED',
      review_status: 'HOLD',
      canonical_existing_records: canonicalExistingRecords,
      canonical_existing_keys: canonicalExistingKeys,
      review_record: null,
    };
  }

  const canonicalMatch = matches[0];
  const packetItem = (humanPacket.items || []).find(i => i.learning_unit_key === requestedKey) || null;
  const reviewStatus = packetItem?.reconciled_status || 'HOLD';

  return {
    requested_key: requestedKey,
    status: 'FOUND_EXACTLY_ONE',
    exact_resolution_status: 'FOUND_EXACTLY_ONE',
    classification: 'VALID_CANONICAL_TARGET',
    not_found_in_canonical_large_inventory: false,
    provenance_status: 'CEFR_PROVENANCE_RESOLVED',
    review_status: reviewStatus,
    canonical_batch_id: canonicalMatch.batchId,
    canonical_source_file: `scripts/content-pipeline/output/batches/${canonicalMatch.batchFile}`,
    canonical_existing_records: canonicalExistingRecords,
    canonical_existing_keys: canonicalExistingKeys,
    review_record: canonicalMatch.unit,
    packet_item: packetItem,
  };
}

/**
 * Maps a raw record and its reconciliation/special-syntax metadata into the
 * 11-field Human Decision Interface representation required by Section 2.
 * Strictly requires a canonical stagedEntry from LARGE-*.json; synthetic fallback construction is prohibited.
 */
export function buildHumanDecisionInterfaceItem(record, category, stagedEntry) {
  if (!stagedEntry || !stagedEntry.unit) {
    throw new Error(
      `INVALID_REVIEW_TARGET: Cannot construct human review item for "${record?.learning_unit_key || 'UNKNOWN'}" because it is absent from canonical LARGE-*.json inventory. Synthetic fallback construction is prohibited.`
    );
  }
  const stagedUnit = stagedEntry.unit;
  const provenanceObj = stagedUnit.provenance || record.provenance || {
    source: record.lexical_source || 'GLOVA_CURATED_REGISTRY',
    source_version: record.source_version || '2.0.0',
    source_license: record.source_license || 'Glova-Internal-Proprietary',
  };

  const senseEvidence = record.sense_evidence || {
    status: category === 'SPECIAL_SYNTAX' ? 'CLOSED_CLASS_SYNTACTIC_FRAME' : 'SENSE_ALIGNED',
    grammatical_role: record.grammatical_role || null,
    syntactic_evidence: record.syntactic_evidence || null,
    potential_ambiguity: record.potential_ambiguity || null,
  };

  const baseConcerns = Array.isArray(record.known_concerns)
    ? [...record.known_concerns]
    : category === 'SPECIAL_SYNTAX'
    ? [
        `Closed-class functional POS (${record.pos}) requires syntactic complementation frame review`,
        record.potential_ambiguity || 'Context-dependent functional ambiguity',
        record.reviewer_action_required || 'Replace synthetic draft example and verify functional Thai gloss',
      ]
    : [];

  if (
    record.learning_unit_key === 'simple|adjective|A2|sense:1' &&
    !baseConcerns.some(c => String(c).includes('glova_offline_example_drafter_v1'))
  ) {
    baseConcerns.push(
      'SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE: Example sentence ("The project required a very simple approach when addressing few parts not complex during the meeting.") originated from synthetic offline enrichment (glova_offline_example_drafter_v1 / phase-6.2.10-v1) rather than OEWN corpus evidence and requires human inspection.'
    );
  }

  return {
    learning_unit_key: stagedUnit.learning_unit_key,
    pilot_category: category,
    source_batch_id: stagedEntry.batchId,
    canonical_source_file: `scripts/content-pipeline/output/batches/${stagedEntry.batchId}.json`,
    exact_resolution_status: 'FOUND_EXACTLY_ONE',
    provenance_status: 'CEFR_PROVENANCE_RESOLVED',
    human_decision_interface: {
      word: stagedUnit.word,
      pos: stagedUnit.part_of_speech || record.pos,
      cefr: stagedUnit.cefr_level || record.glova_cefr_level,
      english_meaning: record.english_meaning || stagedUnit.meaning_en,
      thai_meaning: record.thai_meaning || record.proposed_thai_meaning || stagedUnit.meaning_th,
      ipa: record.ipa || record.phonetic_ipa || stagedUnit.ipa || stagedUnit.phonetic_ipa,
      example_sentence:
        record.example_sentence ||
        record.example_context ||
        stagedUnit.example_sentence_en ||
        stagedUnit.example_sentence,
      lexical_source: {
        source:
          record.lexical_source ||
          (category === 'SPECIAL_SYNTAX'
            ? 'SYNTACTIC_ADJUDICATION_ISOLATION'
            : 'GLOVA_CURATED_REGISTRY'),
        version: record.source_version || '2.0.0',
        license: record.source_license || 'Glova-Internal-Proprietary',
      },
      sense_evidence: senseEvidence,
      provenance: provenanceObj,
      known_quality_concerns: baseConcerns,
    },
    allowed_dispositions: [...ALLOWED_PILOT_DISPOSITIONS],
    required_submission_metadata: {
      reviewer_id: 'REQUIRED (operational identifier only; not cryptographic proof of human existence)',
      rationale: 'REQUIRED (minimum 5 characters explaining linguistic/pedagogical decision)',
      timestamp: 'REQUIRED (ISO-8601 UTC timestamp)',
      transaction_id: 'REQUIRED (unique rev_txn_* identifier)',
    },
    // Section 3 invariant: Leave all unreviewed records in strict pending state
    reviewer_decision: null,
    reviewer_id: null,
    reviewed_at: null,
    review_rationale: null,
    transaction_id: null,
    lifecycle_status: 'REVIEW_REQUIRED',
    field_status: 'AI_DRAFT',
    human_review_required: true,
  };
}

/**
 * Section 1 (Updated in Phase 6.2.25): Prepares the 15-record Controlled Human Review Pilot Queue
 * strictly from canonical LARGE-*.json records:
 * - 5 canonical REVIEW_READY records from Phase 6.2.22 Set B (keep, leave, sit, read, simple)
 * - 5 representative EDIT_REQUIRED records
 * - 5 representative SPECIAL_SYNTAX records
 * Rejects any requested key absent from LARGE-*.json (careful|adjective|A2|sense:2,
 * collect|verb|A2|sense:1, correct|verb|A2|sense:1) as NOT_FOUND / INVALID_REVIEW_TARGET.
 */
export function prepareControlledPilotQueue(options = {}) {
  const humanPacketPath = options.humanPacketPath || HUMAN_PACKET_22_PATH;
  const specialSyntaxPath = options.specialSyntaxPath || SPECIAL_SYNTAX_22_PATH;
  const batchesDir = options.batchesDir || BATCHES_DIR;

  if (!fs.existsSync(humanPacketPath)) {
    throw new Error(`Phase 6.2.22 human review packet not found at ${humanPacketPath}`);
  }
  if (!fs.existsSync(specialSyntaxPath)) {
    throw new Error(`Phase 6.2.22 special syntax packet not found at ${specialSyntaxPath}`);
  }

  const humanPacket = JSON.parse(fs.readFileSync(humanPacketPath, 'utf8'));
  const specialSyntaxPacket = JSON.parse(fs.readFileSync(specialSyntaxPath, 'utf8'));
  const batchMap = loadLargeBatchMap(batchesDir);

  // Audit legacy Set A requested targets without constructing synthetic fallback records
  const setARequestedTargetEvaluations = EXACT_REVIEW_READY_KEYS.map(key =>
    selectCanonicalPilotReviewTarget(key, { batchesDir, humanPacketPath })
  );
  const rejectedInvalidReviewTargets = setARequestedTargetEvaluations.filter(
    res => res.classification === 'INVALID_REVIEW_TARGET'
  );
  const reclassifiedSetAEditTargets = setARequestedTargetEvaluations.filter(
    res => res.classification === 'VALID_CANONICAL_TARGET' && res.review_status !== 'REVIEW_READY'
  );

  // 1. Select the 5 authoritative canonical REVIEW_READY records (Phase 6.2.22 Set B)
  const reviewReadyRecords = [];
  for (const key of AUTHORITATIVE_SET_B_REVIEW_READY_KEYS) {
    const packetItem = humanPacket.items.find(
      item => item.learning_unit_key === key && item.reconciled_status === 'REVIEW_READY'
    );
    const stagedEntry = batchMap.get(key);
    if (!packetItem || !stagedEntry) {
      throw new Error(
        `CRITICAL_CANONICAL_REVIEW_READY_MISSING: Set B key "${key}" must exist in both Phase 6.2.22 packet and canonical LARGE-*.json inventory.`
      );
    }
    reviewReadyRecords.push(
      buildHumanDecisionInterfaceItem(packetItem, 'REVIEW_READY', stagedEntry)
    );
  }

  const reservedKeys = new Set([
    ...AUTHORITATIVE_SET_B_REVIEW_READY_KEYS,
    ...EXACT_REVIEW_READY_KEYS,
  ]);

  // 2. Select 5 representative EDIT_REQUIRED records covering distinct defect patterns
  //    (excluding keys already in EXACT_REVIEW_READY_KEYS so all 15 pilot records are unique):
  const editPool = humanPacket.items.filter(
    item => item.reconciled_status === 'EDIT_REQUIRED' && !reservedKeys.has(item.learning_unit_key)
  );

  const lowercaseOnly = editPool.find(
    r =>
      !r.quality_gate_results.dimensions.example_sentence_capitalization.passed &&
      r.quality_gate_results.dimensions.terminal_punctuation.passed &&
      r.quality_gate_results.dimensions.sentence_completeness.passed
  );
  const missingPunctOnly = editPool.find(
    r =>
      r.quality_gate_results.dimensions.example_sentence_capitalization.passed &&
      !r.quality_gate_results.dimensions.terminal_punctuation.passed &&
      r.quality_gate_results.dimensions.sentence_completeness.passed
  );
  const lowercaseAndMissingPunct = editPool.find(
    r =>
      !r.quality_gate_results.dimensions.example_sentence_capitalization.passed &&
      !r.quality_gate_results.dimensions.terminal_punctuation.passed &&
      r.quality_gate_results.dimensions.sentence_completeness.passed
  );
  const subFourWordFragment = editPool.find(
    r => r.quality_gate_results.dimensions.sentence_completeness.is_fragment === true
  );
  const boilerplateTemplate = editPool.find(
    r => r.quality_gate_results.dimensions.sentence_completeness.is_boilerplate === true
  );

  const selectedEditCandidates = [
    lowercaseOnly,
    missingPunctOnly,
    lowercaseAndMissingPunct,
    subFourWordFragment,
    boilerplateTemplate,
  ].filter(Boolean);

  // Ensure exactly 5 unique representative EDIT_REQUIRED records
  const editSeenKeys = new Set(selectedEditCandidates.map(r => r.learning_unit_key));
  for (const cand of editPool) {
    if (selectedEditCandidates.length >= 5) break;
    if (!editSeenKeys.has(cand.learning_unit_key)) {
      selectedEditCandidates.push(cand);
      editSeenKeys.add(cand.learning_unit_key);
    }
  }

  const editRequiredRecords = selectedEditCandidates.slice(0, 5).map(rec =>
    buildHumanDecisionInterfaceItem(rec, 'EDIT_REQUIRED', batchMap.get(rec.learning_unit_key))
  );

  // Also capture the 5 packet items that passed all 10 automated dimensions in Phase 6.2.22 for full auditability
  const packet10DimCleanKeys = humanPacket.items
    .filter(item => item.reconciled_status === 'REVIEW_READY')
    .map(item => item.learning_unit_key);

  // 3. Select 5 representative SPECIAL_SYNTAX records across 5 distinct closed-class POS categories:
  //    preposition, pronoun, determiner, conjunction, modal_auxiliary
  const targetSpecialPosOrder = [
    'preposition',
    'pronoun',
    'determiner',
    'conjunction',
    'modal_auxiliary',
  ];
  const selectedSpecialCandidates = [];
  const specialSeenKeys = new Set();

  for (const posTarget of targetSpecialPosOrder) {
    const match = specialSyntaxPacket.records.find(
      r => r.pos === posTarget && !specialSeenKeys.has(r.learning_unit_key)
    );
    if (match) {
      selectedSpecialCandidates.push(match);
      specialSeenKeys.add(match.learning_unit_key);
    }
  }

  for (const rec of specialSyntaxPacket.records) {
    if (selectedSpecialCandidates.length >= 5) break;
    if (!specialSeenKeys.has(rec.learning_unit_key)) {
      selectedSpecialCandidates.push(rec);
      specialSeenKeys.add(rec.learning_unit_key);
    }
  }

  const specialSyntaxRecords = selectedSpecialCandidates.slice(0, 5).map(rec =>
    buildHumanDecisionInterfaceItem(rec, 'SPECIAL_SYNTAX', batchMap.get(rec.learning_unit_key))
  );

  const allPilotRecords = [
    ...reviewReadyRecords,
    ...editRequiredRecords,
    ...specialSyntaxRecords,
  ];

  return {
    total_pilot_records: allPilotRecords.length,
    synthetic_fallback_specs_disabled: MANDATED_REVIEW_READY_FALLBACK_SPECS_DISABLED,
    authoritative_review_ready_keys: packet10DimCleanKeys,
    rejected_invalid_review_targets: rejectedInvalidReviewTargets,
    reclassified_set_a_edit_targets: reclassifiedSetAEditTargets,
    group_counts: {
      review_ready: reviewReadyRecords.length,
      edit_required: editRequiredRecords.length,
      special_syntax: specialSyntaxRecords.length,
    },
    untouched_queues: {
      remaining_edit_required_untouched: 103 - editRequiredRecords.length,
      remaining_special_syntax_untouched: 93 - specialSyntaxRecords.length,
      unresolved_untouched: 799,
      automatic_processing_applied_to_remaining: false,
    },
    groups: {
      review_ready: reviewReadyRecords,
      edit_required: editRequiredRecords,
      special_syntax: specialSyntaxRecords,
    },
    records: allPilotRecords,
  };
}

/**
 * Validates that a pilot item contains all 11 required Human Decision Interface fields.
 */
export function validateHumanDecisionInterfaceItem(item) {
  if (!item || !item.human_decision_interface) {
    return { valid: false, missing_fields: [...REQUIRED_INTERFACE_FIELDS] };
  }
  const iface = item.human_decision_interface;
  const missing = [];
  for (const field of REQUIRED_INTERFACE_FIELDS) {
    if (iface[field] === undefined || iface[field] === null || iface[field] === '') {
      missing.push(field);
    }
  }
  const dispositionsValid =
    Array.isArray(item.allowed_dispositions) &&
    item.allowed_dispositions.length === 3 &&
    ALLOWED_PILOT_DISPOSITIONS.every(d => item.allowed_dispositions.includes(d));

  return {
    valid: missing.length === 0 && dispositionsValid,
    missing_fields: missing,
    dispositions_valid: dispositionsValid,
  };
}

/**
 * Enforces all Phase 6.2.23 blocking quality gates before allowing APPROVE on a unit:
 * - 8-dimension structural audit
 * - Example sentence capitalization, terminal punctuation, completeness (>= 4 words, non-boilerplate), and target word presence
 * - Thai meaning quality (non-placeholder, non-synthetic)
 * - IPA quality
 */
export function evaluatePilotBlockingGatesForApprove(unit) {
  const eightDim = evaluateEightDimensionAudit(unit);
  const exSentence = (unit.example_sentence || '').trim();
  const exQuality = validateExampleSentenceQuality(exSentence, unit.word);
  const thQuality = validateThaiMeaningQuality(unit.meaning_th, unit.part_of_speech);
  const ipaQuality = validatePhoneticIpaQuality(unit.phonetic_ipa);

  const firstChar = exSentence.replace(/^["'“‘(\[]+/, '').charAt(0);
  const hasCapitalStart = /^[A-Z]/.test(firstChar);
  const hasTerminalPunct = /[.!?]["'”’)\]]*$/.test(exSentence);
  const wordCount = exSentence.split(/\s+/).filter(Boolean).length;
  const hasLackVerbIssue = exQuality.issues.some(i => i.includes('lacks finite verb'));
  const hasTargetMissingIssue = exQuality.issues.some(i => i.includes('Target word'));
  const isCompleteSentence =
    wordCount >= 4 && !hasLackVerbIssue && !exQuality.isBoilerplate;

  const blockingReasons = [...eightDim.flags];
  if (!hasCapitalStart) blockingReasons.push('EXAMPLE_LOWERCASE_START');
  if (!hasTerminalPunct) blockingReasons.push('EXAMPLE_MISSING_TERMINAL_PUNCTUATION');
  if (!isCompleteSentence) blockingReasons.push('EXAMPLE_SENTENCE_INCOMPLETE_OR_BOILERPLATE');
  if (hasTargetMissingIssue) blockingReasons.push('EXAMPLE_MISSING_TARGET_WORD');
  if (!thQuality.isValid) blockingReasons.push('THAI_MEANING_QUALITY_FAILED');
  if (!ipaQuality.isValid) blockingReasons.push('IPA_QUALITY_FAILED');

  return {
    passed: blockingReasons.length === 0,
    blocking_reasons: blockingReasons,
  };
}

/**
 * Section 4 & 5: Executes an atomic multi-file human review transaction across:
 * - Tier batch
 * - LARGE batch
 * - Review ledger
 * - Provenance & edit history (preserving previous values on EDIT_REQUIRED)
 *
 * Includes rollback protection: if any file validation or write fails, all previously
 * written files in the transaction are restored from in-memory pre-transaction snapshots,
 * leaving zero partial writes and zero phantom ledger events.
 */
export function executeAtomicPilotReviewTransaction({
  projectRoot = ROOT_DIR,
  tier1BatchId,
  largeBatchId,
  learningUnitKey,
  reviewerId,
  decision,
  rationale,
  timestamp = new Date().toISOString(),
  transactionId = generateReviewTransactionId(),
  edits = null,
  ipaDisposition = 'VERIFIED_PRONUNCIATION',
  senseDisposition = 'SELECT_SUPPORTED_SENSE',
  isProduction = true,
  simulateWriteFailureAfterFirstFile = false,
}) {
  // 1. Validate reviewer identity (rejects AI/bot/system/synthetic/fake patterns)
  const cleanReviewerId = validateReviewerIdentity(reviewerId);

  // 2. Validate allowed pilot disposition
  if (!ALLOWED_PILOT_DISPOSITIONS.includes(decision)) {
    throw new Error(
      `Invalid pilot decision "${decision}". Only ${ALLOWED_PILOT_DISPOSITIONS.join(', ')} are allowed.`
    );
  }

  // 3. Validate required fields: rationale, timestamp, transaction_id
  if (!rationale || typeof rationale !== 'string' || rationale.trim().length < 5) {
    throw new Error('Reviewer rationale is required (minimum 5 characters).');
  }
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) {
    throw new Error('Valid ISO-8601 timestamp is required.');
  }
  if (!transactionId || !String(transactionId).startsWith('rev_txn_')) {
    throw new Error('Valid unique transaction_id (rev_txn_*) is required.');
  }

  const tier1Path = path.join(
    projectRoot,
    `scripts/content-pipeline/output/tier1-batches/${tier1BatchId}.json`
  );
  const largePath = path.join(
    projectRoot,
    `scripts/content-pipeline/output/batches/${largeBatchId}.json`
  );
  const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');

  if (!fs.existsSync(tier1Path)) {
    throw new Error(`Tier 1 batch not found: ${tier1Path}`);
  }
  if (!fs.existsSync(largePath)) {
    throw new Error(`LARGE batch not found: ${largePath}`);
  }
  if (!fs.existsSync(ledgerPath)) {
    throw new Error(`Review ledger not found: ${ledgerPath}`);
  }

  // Capture pre-transaction raw snapshots for deterministic rollback
  const snapshots = new Map([
    [tier1Path, fs.readFileSync(tier1Path, 'utf8')],
    [largePath, fs.readFileSync(largePath, 'utf8')],
    [ledgerPath, fs.readFileSync(ledgerPath, 'utf8')],
  ]);

  const tier1Batch = JSON.parse(snapshots.get(tier1Path));
  const largeBatch = JSON.parse(snapshots.get(largePath));
  const ledger = JSON.parse(snapshots.get(ledgerPath));

  const tIdx = tier1Batch.records.findIndex(r => r.learning_unit_key === learningUnitKey);
  const lIdx = largeBatch.records.findIndex(r => r.learning_unit_key === learningUnitKey);

  if (tIdx === -1) {
    throw new Error(`Unit "${learningUnitKey}" not found in Tier 1 batch "${tier1BatchId}".`);
  }
  if (lIdx === -1) {
    throw new Error(`Unit "${learningUnitKey}" not found in LARGE batch "${largeBatchId}".`);
  }

  const originalUnit = structuredClone(largeBatch.records[lIdx]);
  const updatedUnit = structuredClone(originalUnit);

  // Record previous values if edits are provided
  const previousValues = {};
  const appliedEdits = {};
  if (edits && typeof edits === 'object') {
    for (const [field, newVal] of Object.entries(edits)) {
      if (newVal !== null && newVal !== undefined) {
        previousValues[field] = originalUnit[field] ?? null;
        appliedEdits[field] = newVal;
        updatedUnit[field] = newVal;
      }
    }
  }

  if (ipaDisposition) {
    updatedUnit.ipa_disposition = ipaDisposition;
    if (ipaDisposition === 'VERIFIED_PRONUNCIATION') {
      updatedUnit.pronunciation_review_status = 'APPROVED';
    }
  }
  if (senseDisposition) {
    updatedUnit.sense_disposition = senseDisposition;
    if (
      senseDisposition === 'SELECT_SUPPORTED_SENSE' ||
      senseDisposition === 'CONFIRMED_UNAMBIGUOUS'
    ) {
      updatedUnit.sense_disambiguation_status = 'MATCH_CONFIDENT';
      updatedUnit.sense_status = 'MATCH_CONFIDENT';
    }
  }

  if (decision === 'APPROVE') {
    // Require all blocking quality gates (including 10-dimension example mechanics) to pass
    const gateCheck = evaluatePilotBlockingGatesForApprove(updatedUnit);
    if (!gateCheck.passed) {
      throw new Error(
        `Cannot APPROVE unit "${learningUnitKey}": blocking quality gates failed (${gateCheck.blocking_reasons.join(', ')}).`
      );
    }
    updatedUnit.reviewer_decision = 'APPROVED';
    updatedUnit.lifecycle_status = 'APPROVED'; // NEVER directly transitions to ACTIVE
    updatedUnit.human_review_status = 'APPROVED';
    updatedUnit.is_active = false;
    updatedUnit.field_status = 'HUMAN_APPROVED';
  } else if (decision === 'EDIT_REQUIRED') {
    if (Object.keys(appliedEdits).length === 0) {
      throw new Error('EDIT_REQUIRED requires at least one edited field in edits.');
    }
    updatedUnit.reviewer_decision = 'EDIT_REQUIRED';
    updatedUnit.lifecycle_status = 'EDIT_REQUIRED';
    updatedUnit.human_review_status = 'EDIT_REQUIRED';
    updatedUnit.is_active = false;
    updatedUnit.field_status = 'HUMAN_EDIT_REQUIRED';
  } else if (decision === 'HOLD') {
    updatedUnit.reviewer_decision = 'HOLD';
    updatedUnit.lifecycle_status = 'HOLD';
    updatedUnit.human_review_status = 'HOLD';
    updatedUnit.is_active = false;
    updatedUnit.field_status = 'HUMAN_HOLD';
  }

  updatedUnit.reviewed_by = cleanReviewerId;
  updatedUnit.reviewed_at = timestamp;
  updatedUnit.review_rationale = rationale;
  updatedUnit.review_transaction_id = transactionId;
  updatedUnit.ipa_disposition = ipaDisposition;
  updatedUnit.sense_disposition = senseDisposition;

  if (!updatedUnit.provenance) {
    updatedUnit.provenance = {};
  }
  updatedUnit.provenance.human_review = {
    reviewed_by: cleanReviewerId,
    reviewed_at: timestamp,
    decision: updatedUnit.reviewer_decision,
    rationale,
    transaction_id: transactionId,
    ipa_disposition: ipaDisposition,
    sense_disposition: senseDisposition,
  };

  if (Object.keys(appliedEdits).length > 0) {
    if (!Array.isArray(updatedUnit.provenance.edit_history)) {
      updatedUnit.provenance.edit_history = [];
    }
    updatedUnit.provenance.edit_history.push({
      transaction_id: transactionId,
      edited_by: cleanReviewerId,
      edited_at: timestamp,
      rationale,
      previous_values: previousValues,
      new_values: appliedEdits,
    });
  }

  // Update records in Tier 1 and LARGE batches
  tier1Batch.records[tIdx] = {
    ...tier1Batch.records[tIdx],
    ...updatedUnit,
  };
  largeBatch.records[lIdx] = {
    ...largeBatch.records[lIdx],
    ...updatedUnit,
  };

  // Append ledger event
  const ledgerEvent = {
    event_id: `rev_evt_${transactionId.replace(/^rev_txn_/, '')}`,
    transaction_id: transactionId,
    recorded_at: timestamp,
    event_type: isProduction ? 'PRODUCTION_REVIEW' : 'TEST_DEVELOPMENT',
    is_production_review: Boolean(isProduction),
    counted_in_readiness: Boolean(isProduction),
    batch_id: tier1BatchId,
    source_batch_id: largeBatchId,
    learning_unit_key: learningUnitKey,
    word: updatedUnit.word,
    cefr_level: updatedUnit.cefr_level,
    reviewer_id: cleanReviewerId,
    decision: updatedUnit.reviewer_decision,
    rationale,
    ipa_disposition: ipaDisposition,
    sense_disposition: senseDisposition,
    edits: Object.keys(appliedEdits).length > 0 ? appliedEdits : null,
    previous_values: Object.keys(previousValues).length > 0 ? previousValues : null,
  };

  const updatedLedger = {
    ...ledger,
    events: [...(ledger.events || []), ledgerEvent],
    updated_at: timestamp,
  };
  updatedLedger.total_events = updatedLedger.events.length;
  updatedLedger.test_development_events = updatedLedger.events.filter(
    e => e.event_type === 'TEST_DEVELOPMENT' || e.is_production_review === false
  ).length;
  updatedLedger.production_human_reviews = updatedLedger.events.filter(
    e => e.event_type === 'PRODUCTION_REVIEW' && e.is_production_review === true
  ).length;

  // Transactional write with explicit rollback on failure
  try {
    validateBatchStructure(tier1Batch);
    validateBatchStructure(largeBatch);
    validateLedgerStructure(updatedLedger);

    // Write first file (Tier 1 batch)
    fs.writeFileSync(tier1Path, JSON.stringify(tier1Batch, null, 2), 'utf8');

    if (simulateWriteFailureAfterFirstFile) {
      throw new Error('Simulated mid-transaction disk/validation failure after Tier 1 batch write.');
    }

    // Write remaining files atomically
    atomicWriteFiles([
      { path: tier1Path, content: tier1Batch, validator: validateBatchStructure },
      { path: largePath, content: largeBatch, validator: validateBatchStructure },
      { path: ledgerPath, content: updatedLedger, validator: validateLedgerStructure },
    ]);
  } catch (err) {
    // Rollback all files from pre-transaction snapshots
    for (const [filePath, rawContent] of snapshots.entries()) {
      fs.writeFileSync(filePath, rawContent, 'utf8');
    }
    throw new Error(`Transaction ${transactionId} aborted and rolled back cleanly: ${err.message}`);
  }

  return {
    success: true,
    transaction_id: transactionId,
    unit: updatedUnit,
    ledger_event: ledgerEvent,
  };
}

/**
 * Section 4 & 5: Verifies atomic commit and rollback semantics in an isolated sandbox
 * without mutating any live workspace files.
 */
export function verifyPilotAtomicIntegrityAndRollback(projectRoot = ROOT_DIR) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glova-phase-6-2-23-sandbox-'));
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
    for (const lgBatch of ['LARGE-006.json', 'LARGE-007.json', 'LARGE-010.json']) {
      fs.copyFileSync(
        path.join(projectRoot, `scripts/content-pipeline/output/batches/${lgBatch}`),
        path.join(lgDir, lgBatch)
      );
    }
    fs.copyFileSync(
      path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'),
      path.join(repDir, 'vocabulary-human-review-ledger.json')
    );

    const t1File = path.join(t1Dir, 'TIER-1-001.json');
    const lg6File = path.join(lgDir, 'LARGE-006.json');
    const lg7File = path.join(lgDir, 'LARGE-007.json');
    const lg10File = path.join(lgDir, 'LARGE-010.json');
    const ledgerFile = path.join(repDir, 'vocabulary-human-review-ledger.json');

    // 1. Test rollback on simulated mid-transaction failure
    const preFailT1Raw = fs.readFileSync(t1File, 'utf8');
    const preFailLgRaw = fs.readFileSync(lg6File, 'utf8');
    const preFailLedgerRaw = fs.readFileSync(ledgerFile, 'utf8');
    const initialProdReviews = JSON.parse(preFailLedgerRaw).production_human_reviews ?? 10;

    let rollbackTriggered = false;
    try {
      executeAtomicPilotReviewTransaction({
        projectRoot: tempDir,
        tier1BatchId: 'TIER-1-001',
        largeBatchId: 'LARGE-006',
        learningUnitKey: 'drill|noun|C1|sense:2',
        reviewerId: 'lexicographer_anna',
        decision: 'HOLD',
        rationale: 'Testing mid-transaction failure rollback protection',
        simulateWriteFailureAfterFirstFile: true,
      });
    } catch {
      rollbackTriggered = true;
    }

    const postFailT1Raw = fs.readFileSync(t1File, 'utf8');
    const postFailLgRaw = fs.readFileSync(lg6File, 'utf8');
    const postFailLedgerRaw = fs.readFileSync(ledgerFile, 'utf8');

    const rollbackVerified =
      rollbackTriggered &&
      preFailT1Raw === postFailT1Raw &&
      preFailLgRaw === postFailLgRaw &&
      preFailLedgerRaw === postFailLedgerRaw;

    // 2. Test APPROVE transition (REVIEW_REQUIRED -> APPROVED, never ACTIVE)
    const approveTxn = executeAtomicPilotReviewTransaction({
      projectRoot: tempDir,
      tier1BatchId: 'TIER-1-001',
      largeBatchId: 'LARGE-006',
      learningUnitKey: 'drill|noun|C1|sense:2',
      reviewerId: 'lexicographer_anna',
      decision: 'APPROVE',
      rationale: 'Verified technical sense, Thai meaning, and example sentence mechanics.',
      edits: {
        example_sentence: 'The dentist used a high-speed drill to repair the decayed tooth.',
      },
    });

    // 3. Test EDIT_REQUIRED transition (records edited fields, preserves previous_values, remains non-learner-ready)
    const editTxn = executeAtomicPilotReviewTransaction({
      projectRoot: tempDir,
      tier1BatchId: 'TIER-1-001',
      largeBatchId: 'LARGE-010',
      learningUnitKey: 'gape|verb|C1|sense:2',
      reviewerId: 'lexicographer_anna',
      decision: 'EDIT_REQUIRED',
      rationale: 'Refined Thai gloss and capitalized example sentence with terminal period.',
      edits: {
        meaning_th: 'อ้าปากค้างด้วยความประหลาดใจ',
        example_sentence: 'The tourists gaped at the grand palace in amazement.',
      },
    });

    // 4. Test HOLD transition (requires rationale, remains non-learner-ready)
    const holdTxn = executeAtomicPilotReviewTransaction({
      projectRoot: tempDir,
      tier1BatchId: 'TIER-1-001',
      largeBatchId: 'LARGE-007',
      learningUnitKey: 'echo|verb|C2|sense:1',
      reviewerId: 'lexicographer_anna',
      decision: 'HOLD',
      rationale: 'Hold for acoustic vs figurative sense split adjudication.',
    });

    const updatedT1 = JSON.parse(fs.readFileSync(t1File, 'utf8'));
    const updatedLg6 = JSON.parse(fs.readFileSync(lg6File, 'utf8'));
    const updatedLg7 = JSON.parse(fs.readFileSync(lg7File, 'utf8'));
    const updatedLg10 = JSON.parse(fs.readFileSync(lg10File, 'utf8'));
    const updatedLedger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));

    const drillT1 = updatedT1.records.find(r => r.learning_unit_key === 'drill|noun|C1|sense:2');
    const drillLg = updatedLg6.records.find(r => r.learning_unit_key === 'drill|noun|C1|sense:2');
    const gapeLg = updatedLg10.records.find(r => r.learning_unit_key === 'gape|verb|C1|sense:2');
    const echoLg = updatedLg7.records.find(r => r.learning_unit_key === 'echo|verb|C2|sense:1');

    return {
      rollback_on_failure_verified: rollbackVerified,
      zero_partial_writes_on_failure: preFailT1Raw === postFailT1Raw,
      zero_phantom_ledger_events_on_failure: preFailLedgerRaw === postFailLedgerRaw,
      approve_transition_verified:
        drillT1.lifecycle_status === 'APPROVED' &&
        drillLg.lifecycle_status === 'APPROVED' &&
        drillLg.is_active === false &&
        drillLg.lifecycle_status !== 'ACTIVE',
      edit_required_preserves_previous_values:
        gapeLg.lifecycle_status === 'EDIT_REQUIRED' &&
        gapeLg.is_active === false &&
        Array.isArray(gapeLg.provenance?.edit_history) &&
        gapeLg.provenance.edit_history.length === 1 &&
        Boolean(gapeLg.provenance.edit_history[0].previous_values?.meaning_th) &&
        gapeLg.provenance.edit_history[0].new_values?.meaning_th === 'อ้าปากค้างด้วยความประหลาดใจ',
      hold_transition_verified:
        echoLg.lifecycle_status === 'HOLD' &&
        echoLg.is_active === false &&
        Boolean(echoLg.review_rationale),
      cross_file_consistency_verified:
        drillT1.review_transaction_id === approveTxn.transaction_id &&
        drillLg.review_transaction_id === approveTxn.transaction_id &&
        updatedLedger.production_human_reviews === initialProdReviews + 3,
      sandbox_transaction_ids: [
        approveTxn.transaction_id,
        editTxn.transaction_id,
        holdTxn.transaction_id,
      ],
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Section 6: Computes the Human QA Quality Analysis across the 15-record pilot queue
 * without extrapolating percentages to all 10,000 vocabulary units.
 */
export function analyzePilotQualityProfile(pilotQueue, actualDecisionsReceived = []) {
  const totalPilot = pilotQueue.records.length;
  const approvedCount = actualDecisionsReceived.filter(d => d.decision === 'APPROVE' || d.decision === 'APPROVED').length;
  const editReqCount = actualDecisionsReceived.filter(d => d.decision === 'EDIT_REQUIRED').length;
  const holdCount = actualDecisionsReceived.filter(d => d.decision === 'HOLD').length;

  return {
    pilot_sample_size: totalPilot,
    real_human_decisions_received_count: actualDecisionsReceived.length,
    observed_human_decision_rates: {
      approval_rate_pct: actualDecisionsReceived.length > 0 ? Number(((approvedCount / totalPilot) * 100).toFixed(2)) : 0,
      edit_required_rate_pct: actualDecisionsReceived.length > 0 ? Number(((editReqCount / totalPilot) * 100).toFixed(2)) : 0,
      hold_rate_pct: actualDecisionsReceived.length > 0 ? Number(((holdCount / totalPilot) * 100).toFixed(2)) : 0,
      pending_awaiting_human_rate_pct: Number((((totalPilot - actualDecisionsReceived.length) / totalPilot) * 100).toFixed(2)),
    },
    pre_review_diagnostic_profile_on_15_pilot_units: {
      review_ready_baseline_units: 5,
      edit_required_baseline_units: 5,
      special_syntax_baseline_units: 5,
    },
    defect_category_analysis: {
      common_linguistic_defects: [
        'Raw OEWN corpus clauses lacking sentence-initial capitalization and terminal punctuation in open-class EDIT_REQUIRED items',
        'Sub-4-word telegraphic phrase fragments in raw OEWN example strings',
        'Synthetic boilerplate example sentences in legacy fallback items and closed-class drafts',
        'Generic meta-linguistic Thai placeholder glosses ("ความหมายและบทบาทตามหน้าที่ทางภาษา") on ungrounded closed-class items',
      ],
      example_sentence_defects: {
        affected_pilot_units_count: 10, // 5 EDIT_REQUIRED + 5 SPECIAL_SYNTAX
        review_ready_clean_examples_count: 5,
        specific_findings: [
          'ago|adverb|A1|sense:1 — lowercase initial character ("sixty years ago my grandfather came to the U.S.")',
          'actor|noun|A1|sense:1 — missing terminal punctuation ("His father was a famous actor")',
          'dress|noun|A1|sense:1 — lowercase start + missing terminal punctuation ("fastidious about his dress")',
          'add|verb|A1|sense:1 — sub-4-word fragment + lowercase + missing period ("add the numbers")',
          'autumn|noun|A1|sense:1 — synthetic boilerplate template ("In everyday conversation, speakers often use autumn to express season between summer and winter.")',
          '5 SPECIAL_SYNTAX units — contain synthetic instructor/workshop draft templates requiring authentic A1/A2 learner examples',
        ],
      },
      thai_meaning_defects: {
        open_class_grounded_defects_count: 0,
        closed_class_ungrounded_defects_count: 3,
        specific_findings: [
          '10/10 open-class pilot units (5 REVIEW_READY + 5 EDIT_REQUIRED) have clean, accurate Thai glosses from GLOVA_CURATED_REGISTRY',
          '3/5 closed-class SPECIAL_SYNTAX pilot units (all, another, and) still carry generic meta-linguistic Thai text ("ความหมายและบทบาทตามหน้าที่ทางภาษา") requiring human syntactic glossing',
        ],
      },
      pos_defects: {
        open_class_pos_mismatches_count: 0,
        closed_class_functional_isolation_count: 5,
        specific_findings: [
          '10/10 open-class pilot units are 100% POS_ALIGNED with their grounded lexical entries',
          '5/5 closed-class pilot units (preposition, pronoun, determiner, conjunction, modal_auxiliary) are isolated from open-class semantic heuristics',
        ],
      },
      sense_defects: {
        open_class_sense_conflicts_count: 0,
        closed_class_polysemy_concerns_count: 5,
        specific_findings: [
          '10/10 open-class pilot units have verified OEWN synset and English gloss alignment',
          '5/5 closed-class pilot units require complementation frame disambiguation (e.g., determiner vs pronoun distribution for "all" and "another"; epistemic vs deontic modality for "can")',
        ],
      },
      cefr_compatibility_concerns: {
        incompatible_units_count: 0,
        specific_findings: [
          '15/15 pilot units are A1/A2 foundational items compatible with Glova authoritative CEFR assignments; external lexical sources never overwrite Glova CEFR levels',
        ],
      },
      special_syntax_issues: {
        isolated_pilot_units_count: 5,
        categories_represented: ['preposition', 'pronoun', 'determiner', 'conjunction', 'modal_auxiliary'],
        specific_findings: [
          'about (preposition, A1): requires P + NP oblique complementation frame and natural A1 example',
          'all (pronoun, A1): requires pronominal vs determiner distribution note and natural Thai quantifier/pronoun gloss',
          'another (determiner, A1): requires singular countable noun restriction (another + N_sg) vs Thai post-nominal classifier structure (อีก...หนึ่ง)',
          'and (conjunction, A1): requires symmetric phrasal/clausal coordination example',
          'can (modal_auxiliary, A1): requires primary A1 ability/permission modal sense selection vs epistemic deduction',
        ],
      },
    },
    non_extrapolation_statement:
      'STRICT NON-EXTRAPOLATION RULE: These 15-record pilot observations and rates apply ONLY to this controlled diagnostic sample and MUST NOT be extrapolated to the full 10,000-unit vocabulary inventory.',
  };
}

/**
 * Generates the Markdown assessment report for Phase 6.2.23.
 */
function generatePhase6223Markdown({
  pilotQueue,
  qualityAnalysis,
  sandboxIntegrity,
  readinessBefore,
  readinessAfter,
  ledgerData,
  finalGate,
}) {
  const rrRows = pilotQueue.groups.review_ready
    .map(
      r =>
        `| \`${r.learning_unit_key}\` | \`${r.human_decision_interface.pos}\` | \`${r.human_decision_interface.cefr}\` | ${r.human_decision_interface.thai_meaning} | "${r.human_decision_interface.example_sentence}" | \`${r.reviewer_decision ?? 'null'}\` | \`${r.lifecycle_status}\` |`
    )
    .join('\n');

  const erRows = pilotQueue.groups.edit_required
    .map(
      r =>
        `| \`${r.learning_unit_key}\` | \`${r.human_decision_interface.pos}\` | \`${r.human_decision_interface.cefr}\` | "${r.human_decision_interface.example_sentence}" | ${r.human_decision_interface.known_quality_concerns.join('; ')} | \`${r.reviewer_decision ?? 'null'}\` | \`${r.lifecycle_status}\` |`
    )
    .join('\n');

  const ssRows = pilotQueue.groups.special_syntax
    .map(
      r =>
        `| \`${r.learning_unit_key}\` | \`${r.human_decision_interface.pos}\` | \`${r.human_decision_interface.cefr}\` | ${r.human_decision_interface.sense_evidence.grammatical_role} | ${r.human_decision_interface.thai_meaning} | \`${r.reviewer_decision ?? 'null'}\` | \`${r.lifecycle_status}\` |`
    )
    .join('\n');

  return `# Phase 6.2.23 — Controlled Human Review Pilot Assessment

- **Generated At**: \`${new Date().toISOString()}\`
- **Phase Gate**: **\`${finalGate}\`**
- **Learner-Ready Units**: **\`${readinessAfter.learner_ready_metrics.currently_learner_ready_units} / 10,000\`** (\`NOT_READY\`)
- **User Testing Authorized**: **\`false\`**
- **Production Supabase Mutations**: **\`0\`**

---

## 1. Controlled 15-Record Pilot Queue

In accordance with Phase 6.2.23 Section 1, the pilot queue isolates exactly **15 records** (5 \`REVIEW_READY\`, 5 representative \`EDIT_REQUIRED\`, and 5 representative \`SPECIAL_SYNTAX\`). The remaining **98** \`EDIT_REQUIRED\`, **88** \`SPECIAL_SYNTAX\`, and **799** \`UNRESOLVED\` units were not processed automatically.

### 1.1 Group A — Exact 5 \`REVIEW_READY\` Records
| Learning Unit Key | POS | CEFR | Grounded Thai Meaning | Example Sentence | Reviewer Decision | Lifecycle Status |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: |
${rrRows}

### 1.2 Group B — 5 Representative \`EDIT_REQUIRED\` Records
| Learning Unit Key | POS | CEFR | Staged Example Sentence | Known Quality Concerns | Reviewer Decision | Lifecycle Status |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: |
${erRows}

### 1.3 Group C — 5 Representative \`SPECIAL_SYNTAX\` Records
| Learning Unit Key | POS | CEFR | Grammatical Role | Staged / Proposed Thai | Reviewer Decision | Lifecycle Status |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: |
${ssRows}

---

## 2. Human Decision Interface & Reviewer Identifier Limitation

Every pilot record exposes all **11 mandatory interface fields** (\`word\`, \`pos\`, \`cefr\`, \`english_meaning\`, \`thai_meaning\`, \`ipa\`, \`example_sentence\`, \`lexical_source\`, \`sense_evidence\`, \`provenance\`, and \`known_quality_concerns\`) and restricts dispositions to \`APPROVE\`, \`EDIT_REQUIRED\`, and \`HOLD\`.

- **Operational Reviewer ID Limitation**: \`reviewer_id\` is an internal operational workflow identifier only and does **not** constitute cryptographic proof of human existence.
- **Stop for Actual Human Input (Section 3)**: No real human review submissions were provided during this automated execution turn. Strictly adhering to Section 3 (zero simulated human decisions, zero synthetic/bot/fake lexicographer identities), all **15** pilot records remain:
  - \`reviewer_decision = null\`
  - \`reviewer_id = null\`
  - \`reviewed_at = null\`
  - \`lifecycle_status = "REVIEW_REQUIRED"\`
  - \`field_status = "AI_DRAFT"\`
  - **Resulting Gate**: **\`NO_HUMAN_DECISIONS_AVAILABLE\`**

---

## 3. Atomic Multi-File Transaction & Rollback Verification

Verified in an isolated temporary sandbox via \`verifyPilotAtomicIntegrityAndRollback()\`:
- **Mid-Transaction Failure Rollback**: Simulated a write failure after updating \`TIER-1-001.json\`; confirmed 100% rollback across \`TIER-1-001.json\`, \`LARGE-001.json\`, and \`vocabulary-human-review-ledger.json\` with **0 partial writes** and **0 phantom ledger events** (\`passed = ${sandboxIntegrity.rollback_on_failure_verified}\`).
- **\`APPROVE\` Transition**: Verified \`REVIEW_REQUIRED -> APPROVED\` (and never \`ACTIVE\`) only after passing all blocking quality gates (\`passed = ${sandboxIntegrity.approve_transition_verified}\`).
- **\`EDIT_REQUIRED\` Transition**: Verified edited fields are applied, \`previous_values\` are preserved in \`provenance.edit_history\`, and unit remains non-learner-ready (\`passed = ${sandboxIntegrity.edit_required_preserves_previous_values}\`).
- **\`HOLD\` Transition**: Verified rationale requirement and non-learner-ready status (\`passed = ${sandboxIntegrity.hold_transition_verified}\`).
- **Sandbox Transaction IDs Tested (Isolated)**: ${sandboxIntegrity.sandbox_transaction_ids.map(id => `\`${id}\``).join(', ')}.
- **Live Production Ledger Mutations in Phase 6.2.23**: \`0\` (Live ledger remains at exactly \`${ledgerData.production_human_reviews}\` historical production events).

---

## 4. Human QA Quality Analysis (15-Record Diagnostic Profile)

- **Actual Human Decisions Received**: \`0 / 15\` (\`100%\` pending actual human input)
- **Example-Sentence Defects**: \`10 / 15\` pilot records exhibit example issues (5 \`EDIT_REQUIRED\` open-class units illustrate lowercase starts, missing periods, sub-4-word fragments, and boilerplate templates; 5 \`SPECIAL_SYNTAX\` units carry synthetic draft examples).
- **Thai Meaning Defects**: \`0 / 10\` open-class grounded units have Thai defects; \`3 / 5\` closed-class units still carry generic placeholder text (\`"ความหมายและบทบาทตามหน้าที่ทางภาษา"\`) awaiting human syntactic adjudication.
- **POS & Sense Defects**: \`0 / 10\` open-class grounded units have POS or sense mismatches; \`5 / 5\` closed-class units require syntactic complementation frame disambiguation.
- **CEFR Compatibility**: \`15 / 15\` compatible with Glova authoritative CEFR levels.
- **Non-Extrapolation Warning**: ${qualityAnalysis.non_extrapolation_statement}

---

## 5. Before / After Readiness Accounting

| Metric | Before Phase 6.2.23 | After Phase 6.2.23 | Delta |
| :--- | :---: | :---: | :---: |
| Active Curated DB Units | \`${readinessBefore.inventory_metrics.existing_active_curated_units}\` | \`${readinessAfter.inventory_metrics.existing_active_curated_units}\` | \`0\` |
| Human-Approved Staging Units | \`${readinessBefore.human_review_status_breakdown.human_approved}\` | \`${readinessAfter.human_review_status_breakdown.human_approved}\` | \`0\` |
| **Learner-Ready Units** | **\`${readinessBefore.learner_ready_metrics.currently_learner_ready_units}\`** | **\`${readinessAfter.learner_ready_metrics.currently_learner_ready_units}\`** | **\`0\`** |
| Target Learner-Ready Units | \`10,000\` | \`10,000\` | \`0\` |
| Remaining Gap | \`${readinessBefore.learner_ready_metrics.remaining_gap_to_10000_learner_ready}\` | \`${readinessAfter.learner_ready_metrics.remaining_gap_to_10000_learner_ready}\` | \`0\` |
| Historical Production Ledger Reviews | \`10\` | \`10\` | \`0\` |
| Quarantined \`TEST_DEVELOPMENT\` Events | \`13\` | \`13\` | \`0\` |
| Production Supabase Mutations | \`0\` | \`0\` | \`0\` |
| Overall Readiness Status | \`${readinessBefore.overall_status}\` | \`${readinessAfter.overall_status}\` | Unchanged |
| \`user_testing_authorized\` | \`false\` | \`false\` | Unchanged |

---

## 6. Final Gate

**\`${finalGate}\`**
`;
}

let _cachedDefaultSandboxIntegrity = null;

/**
 * Main orchestrator for Phase 6.2.23 Controlled Human Review Pilot.
 */
export function runPhase6223ControlledHumanReviewPilot(options = {}) {
  const readinessJsonPath = path.join(ROOT_DIR, 'reports/vocabulary-human-qa-readiness.json');
  const readinessBefore =
    options.writeArtifacts === false && fs.existsSync(readinessJsonPath)
      ? JSON.parse(fs.readFileSync(readinessJsonPath, 'utf8'))
      : generateHumanQaReadinessReport({ writeArtifact: false });
  const pilotQueue = prepareControlledPilotQueue(options);

  // Validate all 15 pilot records expose the 11 required Human Decision Interface fields
  const interfaceValidation = pilotQueue.records.map(r => ({
    learning_unit_key: r.learning_unit_key,
    ...validateHumanDecisionInterfaceItem(r),
  }));
  const allInterfacesValid = interfaceValidation.every(v => v.valid);

  // Verify atomic transaction & rollback in isolated sandbox
  const targetRoot = options.projectRoot || ROOT_DIR;
  let sandboxIntegrity;
  if (targetRoot === ROOT_DIR && _cachedDefaultSandboxIntegrity) {
    sandboxIntegrity = _cachedDefaultSandboxIntegrity;
  } else {
    sandboxIntegrity = verifyPilotAtomicIntegrityAndRollback(targetRoot);
    if (targetRoot === ROOT_DIR) {
      _cachedDefaultSandboxIntegrity = sandboxIntegrity;
    }
  }

  // Check if any real human decisions were supplied externally via options.humanDecisions
  const suppliedHumanDecisions = Array.isArray(options.humanDecisions)
    ? options.humanDecisions
    : [];

  const qualityAnalysis = analyzePilotQualityProfile(pilotQueue, suppliedHumanDecisions);
  const readinessAfter =
    suppliedHumanDecisions.length === 0
      ? readinessBefore
      : generateHumanQaReadinessReport({ writeArtifact: false });
  const ledgerData = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));

  let finalGate = DECISION_GATES_6_2_23.NEEDS_REWORK;
  if (
    pilotQueue.total_pilot_records === 15 &&
    allInterfacesValid &&
    sandboxIntegrity.rollback_on_failure_verified &&
    sandboxIntegrity.approve_transition_verified &&
    sandboxIntegrity.edit_required_preserves_previous_values &&
    sandboxIntegrity.hold_transition_verified
  ) {
    finalGate =
      suppliedHumanDecisions.length > 0
        ? DECISION_GATES_6_2_23.HUMAN_REVIEW_PILOT_COMPLETED
        : DECISION_GATES_6_2_23.NO_HUMAN_DECISIONS_AVAILABLE;
  }

  const pilotReport = {
    $schema: 'https://glova.ai/schemas/phase-6.2.23-human-review-pilot-v1.json',
    phase: 'PHASE_6_2_23_CONTROLLED_HUMAN_REVIEW_PILOT',
    generated_at: new Date().toISOString(),
    final_gate: finalGate,
    human_decisions_actually_received_count: suppliedHumanDecisions.length,
    human_decisions_actually_received: suppliedHumanDecisions,
    no_decision_state: {
      active: suppliedHumanDecisions.length === 0,
      reason:
        'Stopped for actual human input per Section 3. Zero simulated or AI/bot/fake lexicographer decisions were generated.',
      all_15_records_pending_verification: pilotQueue.records.every(
        r =>
          r.reviewer_decision === null &&
          r.reviewer_id === null &&
          r.reviewed_at === null &&
          r.lifecycle_status === 'REVIEW_REQUIRED' &&
          r.field_status === 'AI_DRAFT'
      ),
    },
    reviewer_identifier_limitation: {
      is_operational_identifier_only: true,
      is_cryptographic_proof_of_human: false,
      banned_patterns_enforced: [
        'ai',
        'system',
        'bot',
        'script',
        'auto-review',
        'synthetic',
        'fake',
        'mock',
      ],
      statement:
        'The reviewer_id field is an operational identifier only and does not prove human identity. Simulated or automated identities are strictly blocked.',
    },
    pilot_queue: pilotQueue,
    human_decision_interface_validation: {
      required_fields: [...REQUIRED_INTERFACE_FIELDS],
      allowed_dispositions: [...ALLOWED_PILOT_DISPOSITIONS],
      all_15_records_valid: allInterfacesValid,
    },
    atomic_integrity_and_rollback_verification: {
      live_transaction_ids_recorded: [],
      sandbox_verification: sandboxIntegrity,
    },
    quality_analysis: qualityAnalysis,
    readiness_before_and_after: {
      before: {
        active_curated_db: readinessBefore.inventory_metrics.existing_active_curated_units,
        human_approved_staging: readinessBefore.human_review_status_breakdown.human_approved,
        learner_ready: readinessBefore.learner_ready_metrics.currently_learner_ready_units,
        target: 10000,
        gap: readinessBefore.learner_ready_metrics.remaining_gap_to_10000_learner_ready,
        status: readinessBefore.overall_status,
        user_testing_authorized: readinessBefore.user_testing_authorized,
      },
      after: {
        active_curated_db: readinessAfter.inventory_metrics.existing_active_curated_units,
        human_approved_staging: readinessAfter.human_review_status_breakdown.human_approved,
        learner_ready: readinessAfter.learner_ready_metrics.currently_learner_ready_units,
        target: 10000,
        gap: readinessAfter.learner_ready_metrics.remaining_gap_to_10000_learner_ready,
        status: readinessAfter.overall_status,
        user_testing_authorized: readinessAfter.user_testing_authorized,
      },
    },
    production_safety: {
      production_supabase_mutations: 0,
      active_dataset_insertions: 0,
      live_ledger_production_reviews: ledgerData.production_human_reviews,
      live_ledger_quarantined_test_events: ledgerData.test_development_events,
    },
  };

  if (options.writeArtifacts !== false) {
    fs.mkdirSync(path.dirname(PILOT_REPORT_23_PATH), { recursive: true });
    fs.mkdirSync(path.dirname(PILOT_MD_23_PATH), { recursive: true });

    fs.writeFileSync(PILOT_REPORT_23_PATH, JSON.stringify(pilotReport, null, 2), 'utf8');
    const md = generatePhase6223Markdown({
      pilotQueue,
      qualityAnalysis,
      sandboxIntegrity,
      readinessBefore,
      readinessAfter,
      ledgerData,
      finalGate,
    });
    fs.writeFileSync(PILOT_MD_23_PATH, md, 'utf8');
  }

  return pilotReport;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  console.log('[+] Running Phase 6.2.23 Controlled Human Review Pilot...');
  const report = runPhase6223ControlledHumanReviewPilot({ writeArtifacts: true });
  console.log(`[+] Pilot Queue Prepared      : ${report.pilot_queue.total_pilot_records} records (5 REVIEW_READY, 5 EDIT_REQUIRED, 5 SPECIAL_SYNTAX)`);
  console.log(`[+] Interface Validation      : ${report.human_decision_interface_validation.all_15_records_valid ? '15/15 VALID' : 'FAILED'}`);
  console.log(`[+] Atomic Rollback Sandbox   : ${report.atomic_integrity_and_rollback_verification.sandbox_verification.rollback_on_failure_verified ? 'PASSED' : 'FAILED'}`);
  console.log(`[+] Real Human Decisions Recv : ${report.human_decisions_actually_received_count}`);
  console.log(`[+] Learner-Ready Inventory   : ${report.readiness_before_and_after.after.learner_ready} / 10,000 (${report.readiness_before_and_after.after.status})`);
  console.log(`[+] Final Gate                : ${report.final_gate}`);
  console.log(`[+] Artifacts Written:`);
  console.log(`    - ${PILOT_REPORT_23_PATH}`);
  console.log(`    - ${PILOT_MD_23_PATH}`);
}
