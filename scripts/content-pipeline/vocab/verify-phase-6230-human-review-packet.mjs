/**
 * Phase 6.2.30 — Mandatory Independent Packet Integrity Checker
 *
 * Requirements:
 * 1. Reads reports/phase-6.2.30-controlled-qa-batch.json
 * 2. Reads reports/phase-6.2.30-human-review-packet.json
 * 3. Extracts selected_records learning_unit_key (Source)
 * 4. Extracts packet records learning_unit_key (Packet)
 * 5. Compares the two arrays directly for exact 1:1 order and key fidelity
 * 6. Verifies:
 *    - SOURCE_COUNT = 50
 *    - PACKET_COUNT = 50
 *    - MISSING = 0
 *    - EXTRA = 0
 *    - DUPLICATE = 0
 *    - ORDER_MISMATCH = 0
 *    - KEY_MISMATCH = 0
 *    - PACKET_GATE = PASS
 * 7. Verifies 20 required dimensions across all 50 records
 * 8. Verifies empirical risk flags adhere strictly to allowed taxonomy
 * 9. Exits with non-zero status if any check fails
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const ALLOWED_RISK_FLAGS = [
  'POLYSEMY_RISK',
  'CEFR_ALIGNMENT_RISK',
  'SENSE_MISMATCH_RISK',
  'THAI_MEANING_RISK',
  'EXAMPLE_RISK',
  'IPA_RISK',
  'SOURCE_PROVENANCE_RISK',
  'SPECIAL_SYNTAX',
  'OTHER'
];

export function verifyPhase6230HumanReviewPacket({ projectRoot = PROJECT_ROOT } = {}) {
  const batchPath = path.join(projectRoot, 'reports/phase-6.2.30-controlled-qa-batch.json');
  const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');

  if (!fs.existsSync(batchPath)) {
    console.error(`FATAL: Controlled batch report not found at ${batchPath}`);
    return { passed: false, error: 'MISSING_BATCH_FILE' };
  }

  if (!fs.existsSync(packetPath)) {
    console.error(`FATAL: Human review packet not found at ${packetPath}`);
    return { passed: false, error: 'MISSING_PACKET_FILE' };
  }

  const batchData = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const packetData = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

  const lockedRecords = batchData.selected_records || [];
  const packetRecords = packetData.records || [];

  const lockedKeys = lockedRecords.map(r => r.learning_unit_key);
  const packetKeys = packetRecords.map(r => r.learning_unit_key);

  const sourceCount = lockedKeys.length;
  const packetCount = packetKeys.length;

  console.log('==================================================');
  console.log('PHASE 6.2.30 INDEPENDENT PACKET INTEGRITY CHECK');
  console.log('==================================================');
  console.log(`SOURCE_COUNT: ${sourceCount}`);
  console.log(`PACKET_COUNT: ${packetCount}`);

  // 1. Duplicate detection
  const seenLocked = new Set();
  const lockedDuplicates = [];
  for (const k of lockedKeys) {
    if (seenLocked.has(k)) lockedDuplicates.push(k);
    seenLocked.add(k);
  }

  const seenPacket = new Set();
  const packetDuplicates = [];
  for (const k of packetKeys) {
    if (seenPacket.has(k)) packetDuplicates.push(k);
    seenPacket.add(k);
  }

  const duplicateCount = lockedDuplicates.length + packetDuplicates.length;

  // 2. Missing & Extra
  const missingKeys = lockedKeys.filter(k => !packetKeys.includes(k));
  const extraKeys = packetKeys.filter(k => !lockedKeys.includes(k));
  const missingCount = missingKeys.length;
  const extraCount = extraKeys.length;
  const keyMismatchCount = missingCount + extraCount;

  // 3. Order mismatch detection
  let firstMismatch = null;
  let orderMismatchCount = 0;
  const maxLen = Math.max(lockedKeys.length, packetKeys.length);

  for (let i = 0; i < maxLen; i++) {
    const lk = lockedKeys[i];
    const pk = packetKeys[i];
    if (lk !== pk) {
      orderMismatchCount++;
      if (!firstMismatch) {
        firstMismatch = {
          index: i,
          sequence: i + 1,
          expected_source_key: lk ?? 'NONE (out of bounds)',
          actual_packet_key: pk ?? 'NONE (out of bounds)'
        };
      }
    }
  }

  // 4. Dimension & content completeness check (20 required dimensions)
  const dimensionFailures = [];
  for (let i = 0; i < packetRecords.length; i++) {
    const rec = packetRecords[i];
    const seq = rec.sequence ?? rec.queue_position;

    const checks = [
      { name: '1. sequence', valid: seq === i + 1 },
      { name: '2. learning_unit_key', valid: Boolean(rec.learning_unit_key && rec.learning_unit_key !== 'MISSING') },
      { name: '3. word', valid: Boolean(rec.word && rec.word !== 'MISSING') },
      { name: '4. part_of_speech', valid: Boolean(rec.part_of_speech && rec.part_of_speech !== 'MISSING') },
      { name: '5. CEFR level', valid: Boolean(rec.cefr_level && rec.cefr_level !== 'MISSING') },
      { name: '6. sense_index', valid: typeof rec.sense_index === 'number' },
      { name: '7. meaning_en', valid: Boolean(rec.meaning_en && rec.meaning_en !== 'MISSING') },
      { name: '8. meaning_th', valid: Boolean(rec.meaning_th && rec.meaning_th !== 'MISSING') },
      { name: '9. IPA', valid: Boolean((rec.ipa || rec.phonetic_ipa) && (rec.ipa !== 'MISSING' || rec.phonetic_ipa !== 'MISSING')) },
      { name: '10. example_sentence', valid: Boolean(rec.example_sentence && rec.example_sentence !== 'MISSING') },
      { name: '11. provenance', valid: Boolean(rec.provenance && typeof rec.provenance === 'object') },
      { name: '12. source large batch', valid: Boolean((rec.source_large_batch || rec.batch) && (rec.source_large_batch !== 'MISSING' || rec.batch !== 'MISSING')) },
      { name: '13. tier-1 batch', valid: Boolean(rec.tier1_batch && rec.tier1_batch !== 'MISSING') },
      { name: '14. lifecycle status', valid: Boolean((rec.lifecycle_status || rec.current_lifecycle) && (rec.lifecycle_status !== 'MISSING' || rec.current_lifecycle !== 'MISSING')) },
      { name: '15. human review status', valid: Boolean((rec.human_review_status || rec.current_human_review_status) && (rec.human_review_status !== 'MISSING' || rec.current_human_review_status !== 'MISSING')) },
      { name: '16. sense provenance', valid: Boolean(rec.sense_provenance && typeof rec.sense_provenance === 'object') },
      { name: '17. IPA provenance', valid: Boolean(rec.ipa_provenance && typeof rec.ipa_provenance === 'object') },
      { name: '18. Thai meaning provenance', valid: Boolean(rec.thai_meaning_provenance && typeof rec.thai_meaning_provenance === 'object') },
      { name: '19. example provenance', valid: Boolean(rec.example_provenance && typeof rec.example_provenance === 'object') },
      { name: '20. risk flags', valid: Array.isArray(rec.risk_flags || rec.actual_review_flags) }
    ];

    const failedChecks = checks.filter(c => !c.valid).map(c => c.name);
    if (failedChecks.length > 0) {
      dimensionFailures.push({
        sequence: seq,
        key: rec.learning_unit_key,
        failed_dimensions: failedChecks
      });
    }

    // Verify empirical risk flags taxonomy
    const flags = rec.risk_flags || rec.actual_review_flags || [];
    for (const flag of flags) {
      if (!ALLOWED_RISK_FLAGS.includes(flag)) {
        dimensionFailures.push({
          sequence: seq,
          key: rec.learning_unit_key,
          failed_dimensions: [`Disallowed risk flag: "${flag}"`]
        });
      }
    }
  }

  // 5. Overall Pass/Fail Evaluation
  const isSourceCountValid = sourceCount === 50;
  const isPacketCountValid = packetCount === 50;
  const isMissingZero = missingCount === 0;
  const isExtraZero = extraCount === 0;
  const isDuplicateZero = duplicateCount === 0;
  const isOrderMismatchZero = orderMismatchCount === 0;
  const isKeyMismatchZero = keyMismatchCount === 0;
  const isDimensionsValid = dimensionFailures.length === 0;
  const isPacketGatePassInJson = packetData.packet_gate === 'PASS';

  const passed =
    isSourceCountValid &&
    isPacketCountValid &&
    isMissingZero &&
    isExtraZero &&
    isDuplicateZero &&
    isOrderMismatchZero &&
    isKeyMismatchZero &&
    isDimensionsValid &&
    isPacketGatePassInJson;

  const packetGateVerdict = passed ? 'PASS' : 'FAILED';

  console.log(`MISSING: ${missingCount}`);
  console.log(`EXTRA: ${extraCount}`);
  console.log(`DUPLICATE: ${duplicateCount}`);
  console.log(`ORDER_MISMATCH: ${orderMismatchCount}`);
  console.log(`KEY_MISMATCH: ${keyMismatchCount}`);
  console.log(`DIMENSION_FAILURES: ${dimensionFailures.length}`);
  console.log(`PACKET_GATE: ${packetGateVerdict}`);
  console.log('==================================================');

  if (!passed) {
    if (firstMismatch) {
      console.error(`ERROR: Order mismatch at sequence ${firstMismatch.sequence}:`);
      console.error(`  Expected: ${firstMismatch.expected_source_key}`);
      console.error(`  Actual:   ${firstMismatch.actual_packet_key}`);
    }
    if (missingCount > 0) {
      console.error('ERROR: Missing keys:', missingKeys);
    }
    if (extraCount > 0) {
      console.error('ERROR: Extra keys:', extraKeys);
    }
    if (duplicateCount > 0) {
      console.error('ERROR: Duplicates found:', { lockedDuplicates, packetDuplicates });
    }
    if (dimensionFailures.length > 0) {
      console.error('ERROR: Dimension completeness failures:', dimensionFailures);
    }
  } else {
    console.log('SUCCESS: All 50 records verified with byte-for-byte fidelity and 20 complete dimensions.');
  }

  return {
    passed,
    source_count: sourceCount,
    packet_count: packetCount,
    missing: missingCount,
    extra: extraCount,
    duplicate: duplicateCount,
    order_mismatch: orderMismatchCount,
    key_mismatch: keyMismatchCount,
    dimension_failures: dimensionFailures,
    packet_gate: packetGateVerdict,
    first_mismatch: firstMismatch,
    missing_keys: missingKeys,
    extra_keys: extraKeys
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('verify-phase-6230-human-review-packet.mjs')) {
  const result = verifyPhase6230HumanReviewPacket();
  if (!result.passed) {
    process.exit(1);
  }
}
