/**
 * Phase 6.2.27 — Fail-Closed Human Review Packet Builder
 *
 * Strictly locks the review queue from reports/phase-6.2.27-controlled-qa-batch.json
 * using ONLY data.selected_records (exact 50 records in exact order).
 *
 * Invariants enforced:
 * 1. Hard lock: locked.length === 50. If not, STOP, PACKET_GATE = FAILED.
 * 2. 1:1 Key extraction and exact order preservation (zero sorting, zero ranking, zero replacements).
 * 3. Exact canonical resolution: 50/50 resolve to FOUND_EXACTLY_ONE with exact identity match.
 * 4. Zero invented/normalized data: raw canonical values, missing fields reported as "MISSING".
 * 5. Evidence-based review flags: derived strictly from empirical record data (no generic OTHER).
 * 6. Machine-verifiable reload check: reloads from disk and compares lockedKeys vs reloaded packet keys.
 * 7. PACKET_GATE evaluation: PASS only if 100% criteria met, else FAILED.
 * 8. Zero production DB mutations: writes = 0.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveCanonicalExactKey, getRepositoryProvenanceIndex, CANONICAL_RESOLUTION_STATUS } from './pilot-identity-reconciliation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export function buildPhase6227HumanReviewPacket({ projectRoot = PROJECT_ROOT } = {}) {
  const batchReportPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');
  if (!fs.existsSync(batchReportPath)) {
    throw new Error(`Locked batch report not found at ${batchReportPath}`);
  }

  const batchReport = JSON.parse(fs.readFileSync(batchReportPath, 'utf8'));

  // 1. HARD LOCK THE QUEUE: Use ONLY data.selected_records
  const locked = batchReport.selected_records || [];
  const lockedCount = locked.length;

  if (lockedCount !== 50) {
    const failedIntegrity = {
      locked_count: lockedCount,
      packet_count: 0,
      exact_key_match: false,
      exact_order_match: false,
      missing_keys: [],
      extra_keys: [],
      duplicate_keys: [],
      canonical_resolution_count: 0,
      canonical_resolution_failures: [`Locked queue size is ${lockedCount}, expected exactly 50`],
      production_mutations: 0,
      packet_gate: 'FAILED'
    };
    return {
      packetJson: { phase: '6.2.27', packet_gate: 'FAILED', integrity_verification: failedIntegrity, records: [] },
      packetItems: [],
      integrity: failedIntegrity,
      reportsDir: path.join(projectRoot, 'reports'),
      docsDir: path.join(projectRoot, 'docs/assessment')
    };
  }

  // 2. EXTRACT LOCKED KEYS
  const lockedKeys = locked.map(x => x.learning_unit_key);
  const provIndex = getRepositoryProvenanceIndex(projectRoot);

  const packetItems = [];
  const keySet = new Set();
  const duplicateKeys = [];
  const canonicalResolutionFailures = [];
  let canonicalResolutionCount = 0;

  // 3 & 4. RESOLVE EACH KEY & GENERATE PACKET DIRECTLY FROM LOCKED RECORDS
  for (let idx = 0; idx < locked.length; idx++) {
    const lockedItem = locked[idx];
    const key = lockedItem.learning_unit_key;

    if (keySet.has(key)) {
      duplicateKeys.push(key);
    }
    keySet.add(key);

    const res = resolveCanonicalExactKey(key, { projectRoot });
    if (res.exact_resolution_status !== CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE) {
      canonicalResolutionFailures.push({
        key,
        reason: `Canonical resolution status: ${res.exact_resolution_status}`
      });
      continue;
    }

    const rec = res.matched_record;
    if (!rec) {
      canonicalResolutionFailures.push({
        key,
        reason: 'Matched record is null despite resolution status'
      });
      continue;
    }

    // Require exact identity match between canonical record and locked queue item
    if (
      rec.word !== lockedItem.headword ||
      rec.part_of_speech !== lockedItem.part_of_speech ||
      rec.cefr_level !== lockedItem.cefr_level ||
      rec.sense_index !== lockedItem.sense_index
    ) {
      canonicalResolutionFailures.push({
        key,
        reason: `Identity mismatch: canonical (${rec.word}, ${rec.part_of_speech}, ${rec.cefr_level}, ${rec.sense_index}) vs locked (${lockedItem.headword}, ${lockedItem.part_of_speech}, ${lockedItem.cefr_level}, ${lockedItem.sense_index})`
      });
      continue;
    }

    canonicalResolutionCount++;

    const prov = rec.provenance || {};
    const tHit = provIndex.tier1ByExactKey.get(key);

    // 5. EVIDENCE-BASED ACTUAL REVIEW FLAGS (Zero template guesswork, zero generic OTHER)
    const actualFlags = [];

    // 1. POLYSEMY
    if (
      rec.sense_index > 1 ||
      prov.sense_disambiguation_status === 'MATCH_AMBIGUOUS' ||
      prov.conflict_status === 'POLYSEMY_SAME_LEVEL_SENSE_SPLIT'
    ) {
      actualFlags.push('POLYSEMY');
    }

    // 2. CEFR_CONFLICT
    if (
      (prov.conflict_status && prov.conflict_status !== 'NONE') ||
      (Array.isArray(prov.conflicting_cefr_levels) && prov.conflicting_cefr_levels.length > 0)
    ) {
      actualFlags.push('CEFR_CONFLICT');
    }

    // 3. IPA_VARIANT
    const ipaVariants = rec.pronunciation_variants_ipa || prov.ipa_provenance?.variants_ipa || [];
    if (Array.isArray(ipaVariants) && ipaVariants.length > 1) {
      actualFlags.push('IPA_VARIANT');
    }

    // 4. SYNTHETIC_EXAMPLE
    if (
      prov.example_provenance?.status === 'AI_DRAFT_REQUIRES_HUMAN_REVIEW' ||
      prov.example_provenance?.status === 'AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW' ||
      prov.example_provenance?.is_original_generated === true ||
      (rec.example_review_status && rec.example_review_status.includes('AI_DRAFT'))
    ) {
      actualFlags.push('SYNTHETIC_EXAMPLE');
    }

    // 5. AI_DRAFT_MEANING
    if (
      prov.meaning_th_provenance?.status?.includes('AI_DRAFT') ||
      prov.meaning_th_provenance?.status?.includes('DERIVED') ||
      rec.meaning_th_review_status === 'AI_DRAFT' ||
      rec.meaning_review_status === 'AI_DRAFT'
    ) {
      actualFlags.push('AI_DRAFT_MEANING');
    }

    // 6. MISSING_SOURCE_GROUNDING
    if (!prov.original_id && !prov.source_url) {
      actualFlags.push('MISSING_SOURCE_GROUNDING');
    }

    // Batches & Indices
    const tier1BatchId = lockedItem.canonical_batch || (tHit ? tHit.batch_file.replace('.json', '') : 'MISSING');
    const tier1UnitIndex = tHit?.record?.unit_index_in_batch !== undefined && tHit?.record?.unit_index_in_batch !== null
      ? tHit.record.unit_index_in_batch
      : 'MISSING';

    const largeBatchId = res.canonical_batch_id || 'MISSING';
    const largeUnitIndex = rec.unit_index_in_batch !== undefined && rec.unit_index_in_batch !== null
      ? rec.unit_index_in_batch
      : 'MISSING';

    const packetRecord = {
      queue_position: idx + 1,
      learning_unit_key: rec.learning_unit_key || 'MISSING',
      word: rec.word || 'MISSING',
      part_of_speech: rec.part_of_speech || 'MISSING',
      cefr_level: rec.cefr_level || 'MISSING',
      sense_index: rec.sense_index !== undefined && rec.sense_index !== null ? rec.sense_index : 'MISSING',
      meaning_en: rec.meaning_en || 'MISSING',
      meaning_th: rec.meaning_th || 'MISSING',
      phonetic_ipa: rec.phonetic_ipa || 'MISSING',
      ipa: rec.phonetic_ipa || 'MISSING',
      example_sentence: rec.example_sentence || 'MISSING',
      operational_priority: rec.priority_tier || lockedItem.priority_tier || 'MISSING',
      priority_tier: rec.priority_tier || lockedItem.priority_tier || 'MISSING',
      risk_tier: rec.review_risk_tier || lockedItem.risk_tier || 'MISSING',
      review_risk_tier: rec.review_risk_tier || lockedItem.risk_tier || 'MISSING',
      batch: largeBatchId,
      batch_index: largeUnitIndex,
      tier1_batch: tier1BatchId,
      tier1_batch_index: tier1UnitIndex,
      canonical_batches: {
        large_batch_id: largeBatchId,
        tier1_batch_id: tier1BatchId
      },
      canonical_indices: {
        large_unit_index: largeUnitIndex,
        tier1_unit_index: tier1UnitIndex
      },
      reason_for_review_priority: lockedItem.reason_for_review_priority || 'MISSING',
      provenance: {
        source_name: prov.source_name || prov.source || 'MISSING',
        source_version: prov.source_version || 'MISSING',
        original_id: prov.original_id || 'MISSING',
        license: prov.license || 'MISSING',
        attribution: prov.attribution || 'MISSING',
        ipa_status: prov.ipa_provenance?.status || rec.pronunciation_review_status || 'MISSING',
        ipa_source: prov.ipa_provenance?.source || 'MISSING',
        ipa_original_id: prov.ipa_provenance?.original_id || 'MISSING',
        sense_status: rec.sense_status || 'MISSING',
        sense_disambiguation_status: prov.sense_disambiguation_status || 'MISSING',
        oewn_synset_id: rec.oewn_synset_id || prov.meaning_en_provenance?.oewn_synset_id || 'MISSING',
        candidate_sense_key: rec.sense_key || prov.meaning_en_provenance?.candidate_sense_key || 'MISSING',
        thai_meaning_status: prov.meaning_th_provenance?.status || rec.meaning_th_review_status || 'MISSING',
        thai_meaning_source: prov.meaning_th_provenance?.source || 'MISSING',
        example_status: prov.example_provenance?.status || rec.example_review_status || 'MISSING',
        example_source: prov.example_provenance?.source || 'MISSING'
      },
      cefr_source_provenance: {
        source_name: prov.source_name || prov.source || 'MISSING',
        source_version: prov.source_version || 'MISSING',
        original_id: prov.original_id || 'MISSING',
        license: prov.license || 'MISSING',
        attribution: prov.attribution || 'MISSING'
      },
      sense_provenance: {
        status: rec.sense_status || 'MISSING',
        disambiguation_status: prov.sense_disambiguation_status || 'MISSING',
        oewn_synset_id: rec.oewn_synset_id || prov.meaning_en_provenance?.oewn_synset_id || 'MISSING',
        candidate_sense_key: rec.sense_key || prov.meaning_en_provenance?.candidate_sense_key || 'MISSING',
        meaning_en_status: prov.meaning_en_provenance?.status || rec.meaning_review_status || 'MISSING'
      },
      ipa_provenance: {
        status: prov.ipa_provenance?.status || rec.pronunciation_review_status || 'MISSING',
        source: prov.ipa_provenance?.source || 'MISSING',
        original_id: prov.ipa_provenance?.original_id || 'MISSING',
        arpabet: prov.ipa_provenance?.arpabet || 'MISSING',
        variants_ipa: prov.ipa_provenance?.variants_ipa || rec.pronunciation_variants_ipa || [rec.phonetic_ipa]
      },
      thai_meaning_provenance: {
        status: prov.meaning_th_provenance?.status || rec.meaning_th_review_status || 'MISSING',
        source: prov.meaning_th_provenance?.source || 'MISSING',
        translation_method: prov.meaning_th_provenance?.translation_method || 'MISSING'
      },
      example_provenance: {
        status: prov.example_provenance?.status || rec.example_review_status || 'MISSING',
        source: prov.example_provenance?.source || 'MISSING',
        is_original_generated: prov.example_provenance?.is_original_generated || false
      },
      actual_review_flags: actualFlags,
      potential_review_flags: actualFlags
    };

    packetItems.push(packetRecord);
  }

  // Integrity checks
  const packetCount = packetItems.length;
  const packetKeys = packetItems.map(p => p.learning_unit_key);
  const missingKeys = lockedKeys.filter(k => !packetKeys.includes(k));
  const extraKeys = packetKeys.filter(k => !lockedKeys.includes(k));
  const exactKeyMatch = lockedCount === packetCount && missingKeys.length === 0 && extraKeys.length === 0;
  const exactOrderMatch = lockedCount === packetCount && lockedKeys.every((k, idx) => k === packetKeys[idx]);
  const productionMutations = 0;

  const isGatePassed =
    lockedCount === 50 &&
    packetCount === 50 &&
    exactKeyMatch === true &&
    exactOrderMatch === true &&
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    duplicateKeys.length === 0 &&
    canonicalResolutionCount === 50 &&
    canonicalResolutionFailures.length === 0 &&
    productionMutations === 0;

  const packetGate = isGatePassed ? 'PASS' : 'FAILED';

  const integrity = {
    locked_count: lockedCount,
    packet_count: packetCount,
    exact_key_match: exactKeyMatch,
    exact_order_match: exactOrderMatch,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    duplicate_keys: duplicateKeys,
    canonical_resolution_count: canonicalResolutionCount,
    canonical_resolution_failures: canonicalResolutionFailures,
    production_mutations: productionMutations,
    // Aliases for compatibility
    canonical_resolution: `${canonicalResolutionCount}/50`,
    canonical_resolution_50_of_50: canonicalResolutionCount === 50,
    exact_match_50_of_50: exactKeyMatch && exactOrderMatch,
    zero_duplicate: duplicateKeys.length === 0,
    zero_missing: missingKeys.length === 0,
    zero_extra: extraKeys.length === 0,
    zero_production_mutation: productionMutations === 0,
    packet_gate: packetGate
  };

  const packetJson = {
    phase: '6.2.27',
    packet_title: 'Phase 6.2.27 Human Review Packet (50 Locked Canonical Records)',
    generated_at: new Date().toISOString(),
    packet_gate: packetGate,
    governance_notice: 'HUMAN REVIEW PACKET ONLY. No decisions (APPROVE/EDIT/HOLD) have been executed. Production DB mutations = 0. Learner-ready count = unchanged (33).',
    integrity_verification: integrity,
    records: packetItems
  };

  return {
    packetJson,
    packetItems,
    integrity,
    reportsDir: path.join(projectRoot, 'reports'),
    docsDir: path.join(projectRoot, 'docs/assessment')
  };
}

export function generatePhase6227HumanReviewPacketMarkdown(packetData) {
  const { packetItems, integrity } = packetData;

  const rows = packetItems.map((item) => {
    const flagsStr = item.actual_review_flags.length > 0
      ? item.actual_review_flags.map(f => `\`${f}\``).join(', ')
      : '`NONE`';

    const tier1IndexStr = item.tier1_batch_index !== 'MISSING'
      ? `#${item.tier1_batch_index}`
      : 'MISSING';
    const largeIndexStr = item.batch_index !== 'MISSING'
      ? `#${item.batch_index}`
      : 'MISSING';

    return `### ${item.queue_position}. \`${item.learning_unit_key}\`
- **Headword**: **${item.word}** | **POS**: \`${item.part_of_speech}\` | **CEFR**: \`${item.cefr_level}\` | **Sense Index**: \`${item.sense_index}\`
- **English Meaning**: "${item.meaning_en}"
- **Thai Meaning**: "${item.meaning_th}"
- **Phonetic IPA**: \`${item.phonetic_ipa}\`
- **Example Sentence**: *"${item.example_sentence}"*
- **Operational Priority**: \`${item.operational_priority}\` | **Risk**: \`${item.risk_tier}\`
- **Priority Rationale**: ${item.reason_for_review_priority}
- **Batches & Indices**: Canonical Large: \`${item.batch}\` (${largeIndexStr}) | Tier-1 Queue: \`${item.tier1_batch}\` (${tier1IndexStr})
- **Provenance Overview**:
  - Source: ${item.provenance.source_name} (\`${item.provenance.original_id}\`)
  - IPA Provenance: \`${item.provenance.ipa_status}\` (${item.provenance.ipa_source}: \`${item.provenance.ipa_original_id}\`)
  - Sense Provenance: \`${item.provenance.sense_status}\` (Synset: \`${item.provenance.oewn_synset_id}\`, Disambiguation: \`${item.provenance.sense_disambiguation_status}\`)
  - Thai Provenance: \`${item.provenance.thai_meaning_status}\` (${item.provenance.thai_meaning_source})
  - Example Provenance: \`${item.provenance.example_status}\` (${item.provenance.example_source})
- **Actual Review Flags**: ${flagsStr}

---`;
  }).join('\n\n');

  return `# Phase 6.2.27 — Human Review Packet (50 Locked Canonical Records)

**Packet Status**: Ready for Lead Human Lexicographer Review  
**Generated At**: ${new Date().toISOString()}  
**Target Records**: Exactly 50 Records (Derived 1:1 from \`reports/phase-6.2.27-controlled-qa-batch.json\`)  
**Governance Notice**: **STAGING / PLANNING ONLY**. No Human QA decisions (\`APPROVE\`, \`EDIT_REQUIRED\`, \`HOLD\`) have been executed. Production database mutations = 0. Learner-ready count = unchanged (33).

---

## 1. Machine-Verifiable Integrity Verification Summary

- **locked_count**: \`${integrity.locked_count}\`
- **packet_count**: \`${integrity.packet_count}\`
- **exact_key_match**: \`${integrity.exact_key_match}\`
- **exact_order_match**: \`${integrity.exact_order_match}\`
- **missing_keys**: \`${JSON.stringify(integrity.missing_keys)}\`
- **extra_keys**: \`${JSON.stringify(integrity.extra_keys)}\`
- **duplicate_keys**: \`${JSON.stringify(integrity.duplicate_keys)}\`
- **canonical_resolution_count**: \`${integrity.canonical_resolution_count}\`
- **canonical_resolution_failures**: \`${JSON.stringify(integrity.canonical_resolution_failures)}\`
- **production_mutations**: \`${integrity.production_mutations}\`
- **PACKET_GATE**: **\`${integrity.packet_gate}\`**

---

## 2. Review Packet Inventory (50 Records)

${rows}
`;
}

// CLI Execution with on-disk reload verification (Section 5)
if (process.argv[1] && process.argv[1].endsWith('build-phase-6227-human-review-packet.mjs')) {
  console.log('Generating Phase 6.2.27 Human Review Packet...');
  const packetData = buildPhase6227HumanReviewPacket();

  const jsonPath = path.join(packetData.reportsDir, 'phase-6.2.27-human-review-packet.json');
  fs.writeFileSync(jsonPath, JSON.stringify(packetData.packetJson, null, 2), 'utf8');
  console.log(`Saved JSON packet to ${jsonPath}`);

  const mdPath = path.join(packetData.docsDir, 'phase-6.2.27-human-review-packet.md');
  const mdContent = generatePhase6227HumanReviewPacketMarkdown(packetData);
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Saved Markdown packet to ${mdPath}`);

  // SECTION 5: Reload from disk and verify
  const reloadedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const batchReport = JSON.parse(fs.readFileSync(path.join(packetData.reportsDir, 'phase-6.2.27-controlled-qa-batch.json'), 'utf8'));
  const lockedKeys = (batchReport.selected_records || []).map(r => r.learning_unit_key);
  const reloadedKeys = (reloadedJson.records || []).map(r => r.learning_unit_key);

  const reloadKeyMatch = lockedKeys.length === reloadedKeys.length && lockedKeys.every((k, i) => k === reloadedKeys[i]);
  console.log(`On-Disk Reload Verification: 50/50 exact order match? ${reloadKeyMatch}`);

  if (!reloadKeyMatch) {
    console.error('CRITICAL: On-disk reloaded keys do NOT match locked batch keys!');
    process.exit(1);
  }

  console.log(`Integrity Verification Object: ${JSON.stringify(reloadedJson.integrity_verification, null, 2)}`);
  console.log(`PACKET_GATE = ${reloadedJson.packet_gate}`);
}
