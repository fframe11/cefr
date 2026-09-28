/**
 * Phase 6.2.27 — Mandatory Independent Packet Integrity Checker
 *
 * Requirements:
 * 1. Reads reports/phase-6.2.27-controlled-qa-batch.json
 * 2. Reads reports/phase-6.2.27-human-review-packet.json
 * 3. Extracts selected_records learning_unit_key
 * 4. Extracts packet records learning_unit_key
 * 5. Compares the two arrays directly
 * 6. Prints the FIRST mismatch, if any
 * 7. Prints all missing/extra keys
 * 8. Exits with non-zero status if anything differs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export function verifyPhase6227PacketIntegrity({ projectRoot = PROJECT_ROOT } = {}) {
  const batchPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');
  const packetPath = path.join(projectRoot, 'reports/phase-6.2.27-human-review-packet.json');

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

  console.log(`[INDEPENDENT PACKET INTEGRITY CHECK]`);
  console.log(`Locked Records Count: ${lockedKeys.length}`);
  console.log(`Packet Records Count: ${packetKeys.length}`);

  let firstMismatch = null;
  const maxLen = Math.max(lockedKeys.length, packetKeys.length);

  for (let i = 0; i < maxLen; i++) {
    const lk = lockedKeys[i];
    const pk = packetKeys[i];
    if (lk !== pk) {
      firstMismatch = {
        index: i,
        position: i + 1,
        expected_locked_key: lk ?? 'NONE (out of bounds)',
        actual_packet_key: pk ?? 'NONE (out of bounds)'
      };
      break;
    }
  }

  const missingKeys = lockedKeys.filter(k => !packetKeys.includes(k));
  const extraKeys = packetKeys.filter(k => !lockedKeys.includes(k));

  if (firstMismatch) {
    console.error(`FAILED: First mismatch at index ${firstMismatch.index} (position ${firstMismatch.position}):`);
    console.error(`  Expected: ${firstMismatch.expected_locked_key}`);
    console.error(`  Actual:   ${firstMismatch.actual_packet_key}`);
  }

  if (missingKeys.length > 0) {
    console.error(`FAILED: Missing keys in packet (${missingKeys.length}):`, missingKeys);
  }

  if (extraKeys.length > 0) {
    console.error(`FAILED: Extra keys in packet (${extraKeys.length}):`, extraKeys);
  }

  // Exact 50 count check
  if (lockedKeys.length !== 50 || packetKeys.length !== 50) {
    console.error(`FAILED: Count mismatch. Expected exactly 50 records in both.`);
  }

  const passed =
    lockedKeys.length === 50 &&
    packetKeys.length === 50 &&
    !firstMismatch &&
    missingKeys.length === 0 &&
    extraKeys.length === 0;

  if (passed) {
    console.log(`SUCCESS: 50/50 exact keys match in exact order with zero mismatches, zero missing, zero extra.`);
    console.log(`PACKET_GATE = PASS`);
  } else {
    console.error(`PACKET_GATE = FAILED`);
  }

  return {
    passed,
    locked_count: lockedKeys.length,
    packet_count: packetKeys.length,
    first_mismatch: firstMismatch,
    missing_keys: missingKeys,
    extra_keys: extraKeys
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('verify-phase-6227-packet-integrity.mjs')) {
  const result = verifyPhase6227PacketIntegrity();
  if (!result.passed) {
    process.exit(1);
  }
}
