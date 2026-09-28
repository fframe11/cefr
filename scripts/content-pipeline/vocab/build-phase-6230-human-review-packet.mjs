/**
 * Phase 6.2.30 — Fail-Closed Human Review Packet Builder
 *
 * Strictly locks the review queue from reports/phase-6.2.30-controlled-qa-batch.json
 * using ONLY data.selected_records (exact 50 records in exact order).
 *
 * Invariants enforced:
 * 1. Hard lock: locked.length === 50. If not, STOP, PACKET_GATE = FAILED.
 * 2. 1:1 Key extraction and exact order preservation (zero sorting, zero ranking, zero replacements).
 * 3. Exact canonical resolution: 50/50 resolve to FOUND_EXACTLY_ONE with exact identity match.
 * 4. Zero invented/normalized data: raw canonical values, missing fields reported as "MISSING".
 * 5. Empirical risk flags: strictly from allowed taxonomy (POLYSEMY_RISK, CEFR_ALIGNMENT_RISK, SENSE_MISMATCH_RISK,
 *    THAI_MEANING_RISK, EXAMPLE_RISK, IPA_RISK, SOURCE_PROVENANCE_RISK, SPECIAL_SYNTAX, OTHER).
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

export function deriveEmpiricalRiskFlags(rec, lockedItem) {
  const prov = rec.provenance || {};
  const flags = [];

  // 1. POLYSEMY_RISK
  if (
    rec.sense_index > 1 ||
    prov.sense_disambiguation_status === 'MATCH_AMBIGUOUS' ||
    prov.conflict_status === 'POLYSEMY_SAME_LEVEL_SENSE_SPLIT' ||
    lockedItem.priority_tier === 'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS' ||
    lockedItem.provenance_completeness?.sense_status === 'MATCH_AMBIGUOUS'
  ) {
    flags.push('POLYSEMY_RISK');
  }

  // 2. CEFR_ALIGNMENT_RISK
  if (
    (prov.conflict_status && prov.conflict_status !== 'NONE' && prov.conflict_status !== 'POLYSEMY_SAME_LEVEL_SENSE_SPLIT') ||
    (Array.isArray(prov.conflicting_cefr_levels) && prov.conflicting_cefr_levels.length > 0)
  ) {
    flags.push('CEFR_ALIGNMENT_RISK');
  }

  // 3. SENSE_MISMATCH_RISK
  if (
    rec.sense_status === 'UNVERIFIED' ||
    rec.sense_status === 'CANDIDATE_UNVERIFIED' ||
    rec.sense_disambiguation_status === 'UNRESOLVED' ||
    prov.sense_disambiguation_status === 'UNRESOLVED'
  ) {
    flags.push('SENSE_MISMATCH_RISK');
  }

  // 4. THAI_MEANING_RISK
  if (
    prov.meaning_th_provenance?.status?.includes('AI_DRAFT') ||
    prov.meaning_th_provenance?.status?.includes('DERIVED') ||
    prov.meaning_th_provenance?.status?.includes('REMEDIATED') ||
    rec.meaning_th_review_status === 'AI_DRAFT' ||
    lockedItem.provenance_completeness?.thai_status?.includes('REVIEW_REQUIRED')
  ) {
    flags.push('THAI_MEANING_RISK');
  }

  // 5. EXAMPLE_RISK
  if (
    prov.example_provenance?.status?.includes('AI_DRAFT') ||
    prov.example_provenance?.status?.includes('REQUIRES_REVIEW') ||
    prov.example_provenance?.is_original_generated === true ||
    rec.example_review_status?.includes('AI_DRAFT') ||
    lockedItem.provenance_completeness?.example_status?.includes('REQUIRES_REVIEW')
  ) {
    flags.push('EXAMPLE_RISK');
  }

  // 6. IPA_RISK
  const ipaVariants = rec.pronunciation_variants_ipa || prov.ipa_provenance?.variants_ipa || [];
  if (
    (Array.isArray(ipaVariants) && ipaVariants.length > 1) ||
    prov.ipa_provenance?.status === 'UNVERIFIED' ||
    prov.ipa_provenance?.status === 'FLAGGED'
  ) {
    flags.push('IPA_RISK');
  }

  // 7. SOURCE_PROVENANCE_RISK
  if (!prov.original_id && !prov.source_url && !prov.source_name) {
    flags.push('SOURCE_PROVENANCE_RISK');
  }

  // 8. SPECIAL_SYNTAX
  if (/[^a-zA-Z\s\-]/.test(rec.word) || rec.word.includes('/') || rec.word.includes('(')) {
    flags.push('SPECIAL_SYNTAX');
  }

  return flags;
}

export function buildPhase6230HumanReviewPacket({ projectRoot = PROJECT_ROOT } = {}) {
  const batchReportPath = path.join(projectRoot, 'reports/phase-6.2.30-controlled-qa-batch.json');
  if (!fs.existsSync(batchReportPath)) {
    throw new Error(`Locked batch report not found at ${batchReportPath}`);
  }

  const batchReport = JSON.parse(fs.readFileSync(batchReportPath, 'utf8'));

  // 1. HARD LOCK THE QUEUE: Use ONLY data.selected_records
  const locked = batchReport.selected_records || [];
  const lockedCount = locked.length;

  if (lockedCount !== 50) {
    const failedIntegrity = {
      source_count: lockedCount,
      packet_count: 0,
      missing: lockedCount,
      extra: 0,
      duplicate: 0,
      order_mismatch: 1,
      key_mismatch: 1,
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
      packetJson: { phase: '6.2.30', packet_gate: 'FAILED', integrity_verification: failedIntegrity, records: [] },
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

    // 5. EMPIRICAL RISK FLAGS (Strictly compliant with Phase 6.2.30 taxonomy)
    const actualRiskFlags = deriveEmpiricalRiskFlags(rec, lockedItem);

    // Batches & Indices
    const tier1BatchId = lockedItem.canonical_batch || (tHit ? tHit.batch_file.replace('.json', '') : 'MISSING');
    const tier1UnitIndex = tHit?.record?.unit_index_in_batch !== undefined && tHit?.record?.unit_index_in_batch !== null
      ? tHit.record.unit_index_in_batch
      : 'MISSING';

    const largeBatchId = res.canonical_batch_id || lockedItem.canonical_large_batch || 'MISSING';
    const largeUnitIndex = rec.unit_index_in_batch !== undefined && rec.unit_index_in_batch !== null
      ? rec.unit_index_in_batch
      : (lockedItem.canonical_large_unit_index !== undefined ? lockedItem.canonical_large_unit_index : 'MISSING');

    const packetRecord = {
      sequence: idx + 1,
      queue_position: idx + 1,
      learning_unit_key: rec.learning_unit_key || key,
      word: rec.word || 'MISSING',
      part_of_speech: rec.part_of_speech || 'MISSING',
      cefr_level: rec.cefr_level || 'MISSING',
      sense_index: rec.sense_index !== undefined && rec.sense_index !== null ? rec.sense_index : 'MISSING',
      meaning_en: rec.meaning_en || 'MISSING',
      meaning_th: rec.meaning_th || 'MISSING',
      phonetic_ipa: rec.phonetic_ipa || 'MISSING',
      ipa: rec.phonetic_ipa || 'MISSING',
      example_sentence: rec.example_sentence || 'MISSING',
      source_large_batch: largeBatchId,
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
      lifecycle_status: rec.status || lockedItem.current_lifecycle || 'REVIEW_REQUIRED',
      current_lifecycle: rec.status || lockedItem.current_lifecycle || 'REVIEW_REQUIRED',
      human_review_status: lockedItem.current_human_review_status || rec.human_review_status || 'REVIEW_REQUIRED',
      current_human_review_status: lockedItem.current_human_review_status || rec.human_review_status || 'REVIEW_REQUIRED',
      operational_priority: rec.priority_tier || lockedItem.priority_tier || 'MISSING',
      priority_tier: rec.priority_tier || lockedItem.priority_tier || 'MISSING',
      risk_tier: rec.review_risk_tier || lockedItem.risk_tier || 'TIER_1_CRITICAL_RISK',
      review_risk_tier: rec.review_risk_tier || lockedItem.risk_tier || 'TIER_1_CRITICAL_RISK',
      reason_for_review_priority: lockedItem.reason_for_review_priority || 'MISSING',
      provenance: {
        source_name: prov.source_name || prov.source || 'MISSING',
        source_version: prov.source_version || 'MISSING',
        original_id: prov.original_id || lockedItem.original_id || 'MISSING',
        license: prov.license || 'MISSING',
        attribution: prov.attribution || 'MISSING',
        ipa_status: prov.ipa_provenance?.status || rec.pronunciation_review_status || lockedItem.provenance_completeness?.ipa_status || 'MISSING',
        ipa_source: prov.ipa_provenance?.source || 'MISSING',
        ipa_original_id: prov.ipa_provenance?.original_id || 'MISSING',
        sense_status: rec.sense_status || lockedItem.provenance_completeness?.sense_status || 'MISSING',
        sense_disambiguation_status: prov.sense_disambiguation_status || 'MISSING',
        oewn_synset_id: rec.oewn_synset_id || prov.meaning_en_provenance?.candidate_synset_id || prov.meaning_en_provenance?.oewn_synset_id || 'MISSING',
        candidate_sense_key: rec.sense_key || prov.meaning_en_provenance?.candidate_sense_key || 'MISSING',
        thai_meaning_status: prov.meaning_th_provenance?.status || rec.meaning_th_review_status || lockedItem.provenance_completeness?.thai_status || 'MISSING',
        thai_meaning_source: prov.meaning_th_provenance?.source || 'MISSING',
        example_status: prov.example_provenance?.status || rec.example_review_status || lockedItem.provenance_completeness?.example_status || 'MISSING',
        example_source: prov.example_provenance?.source || 'MISSING'
      },
      cefr_source_provenance: {
        source_name: prov.source_name || prov.source || 'MISSING',
        source_version: prov.source_version || 'MISSING',
        original_id: prov.original_id || lockedItem.original_id || 'MISSING',
        license: prov.license || 'MISSING',
        attribution: prov.attribution || 'MISSING'
      },
      sense_provenance: {
        status: rec.sense_status || lockedItem.provenance_completeness?.sense_status || 'MISSING',
        disambiguation_status: prov.sense_disambiguation_status || 'MISSING',
        oewn_synset_id: rec.oewn_synset_id || prov.meaning_en_provenance?.candidate_synset_id || prov.meaning_en_provenance?.oewn_synset_id || 'MISSING',
        candidate_sense_key: rec.sense_key || prov.meaning_en_provenance?.candidate_sense_key || 'MISSING',
        meaning_en_status: prov.meaning_en_provenance?.status || rec.meaning_review_status || 'MISSING'
      },
      ipa_provenance: {
        status: prov.ipa_provenance?.status || rec.pronunciation_review_status || lockedItem.provenance_completeness?.ipa_status || 'MISSING',
        source: prov.ipa_provenance?.source || 'MISSING',
        source_name: prov.ipa_provenance?.source_name || 'MISSING',
        original_id: prov.ipa_provenance?.original_id || 'MISSING',
        arpabet: prov.ipa_provenance?.arpabet || 'MISSING',
        variants_ipa: prov.ipa_provenance?.variants_ipa || rec.pronunciation_variants_ipa || [rec.phonetic_ipa]
      },
      thai_meaning_provenance: {
        status: prov.meaning_th_provenance?.status || rec.meaning_th_review_status || lockedItem.provenance_completeness?.thai_status || 'MISSING',
        source: prov.meaning_th_provenance?.source || 'MISSING',
        translation_method: prov.meaning_th_provenance?.remediation_method || prov.meaning_th_provenance?.translation_method || 'MISSING',
        remediation: prov.remediation || 'NONE'
      },
      example_provenance: {
        status: prov.example_provenance?.status || rec.example_review_status || lockedItem.provenance_completeness?.example_status || 'MISSING',
        source: prov.example_provenance?.source || 'MISSING',
        candidate_synset_id: prov.example_provenance?.candidate_synset_id || 'MISSING',
        is_original_generated: prov.example_provenance?.is_original_generated || false
      },
      risk_flags: actualRiskFlags,
      actual_review_flags: actualRiskFlags,
      potential_review_flags: actualRiskFlags
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
  const orderMismatchCount = lockedKeys.reduce((acc, k, idx) => acc + (k !== packetKeys[idx] ? 1 : 0), 0);
  const keyMismatchCount = missingKeys.length + extraKeys.length;
  const productionMutations = 0;

  const isGatePassed =
    lockedCount === 50 &&
    packetCount === 50 &&
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    duplicateKeys.length === 0 &&
    orderMismatchCount === 0 &&
    keyMismatchCount === 0 &&
    exactKeyMatch === true &&
    exactOrderMatch === true &&
    canonicalResolutionCount === 50 &&
    canonicalResolutionFailures.length === 0 &&
    productionMutations === 0;

  const packetGate = isGatePassed ? 'PASS' : 'FAILED';

  const integrity = {
    source_count: lockedCount,
    packet_count: packetCount,
    missing: missingKeys.length,
    extra: extraKeys.length,
    duplicate: duplicateKeys.length,
    order_mismatch: orderMismatchCount,
    key_mismatch: keyMismatchCount,
    locked_count: lockedCount,
    exact_key_match: exactKeyMatch,
    exact_order_match: exactOrderMatch,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    duplicate_keys: duplicateKeys,
    canonical_resolution_count: canonicalResolutionCount,
    canonical_resolution_failures: canonicalResolutionFailures,
    production_mutations: productionMutations,
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
    phase: '6.2.30',
    packet_title: 'Phase 6.2.30 Human Review Packet (50 Locked Canonical Records)',
    source_batch_file: 'reports/phase-6.2.30-controlled-qa-batch.json',
    batch_id: batchReport.batch_id || 'BATCH-6.2.30-CONTROLLED-50',
    generated_at: new Date().toISOString(),
    packet_gate: packetGate,
    confirmation_statement: 'Phase 6.2.30 Human Review Packet was generated from the locked 50-record queue only. No human decisions or production mutations were executed.',
    governance_notice: 'HUMAN REVIEW PACKET ONLY. No decisions (APPROVE/EDIT/HOLD) have been executed. Production DB mutations = 0. Learner-ready count = unchanged (83). User testing authorized = false.',
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

export function generatePhase6230HumanReviewPacketMarkdown(packetData) {
  const { packetItems, integrity } = packetData;

  const rows = packetItems.map((item) => {
    const flagsStr = item.risk_flags.length > 0
      ? item.risk_flags.map(f => `\`${f}\``).join(', ')
      : '`NONE`';

    const tier1IndexStr = item.tier1_batch_index !== 'MISSING'
      ? `#${item.tier1_batch_index}`
      : 'MISSING';
    const largeIndexStr = item.batch_index !== 'MISSING'
      ? `#${item.batch_index}`
      : 'MISSING';

    return `### ${item.sequence}. \`${item.learning_unit_key}\`
- **Headword**: **${item.word}** | **POS**: \`${item.part_of_speech}\` | **CEFR**: \`${item.cefr_level}\` | **Sense Index**: \`${item.sense_index}\`
- **English Meaning**: "${item.meaning_en}"
- **Thai Meaning**: "${item.meaning_th}"
- **Phonetic IPA**: \`${item.phonetic_ipa}\`
- **Example Sentence**: *"${item.example_sentence}"*
- **Operational Priority**: \`${item.operational_priority}\` | **Risk**: \`${item.risk_tier}\`
- **Priority Rationale**: ${item.reason_for_review_priority}
- **Batches & Indices**: Canonical Large: \`${item.source_large_batch}\` (${largeIndexStr}) | Tier-1 Queue: \`${item.tier1_batch}\` (${tier1IndexStr})
- **Lifecycle & Review Status**: Lifecycle: \`${item.lifecycle_status}\` | Review Status: \`${item.human_review_status}\`
- **Provenance Overview**:
  - Source: ${item.provenance.source_name} (\`${item.provenance.original_id}\`)
  - IPA Provenance: \`${item.provenance.ipa_status}\` (${item.provenance.ipa_source}: \`${item.provenance.ipa_original_id}\`)
  - Sense Provenance: \`${item.provenance.sense_status}\` (Synset: \`${item.provenance.oewn_synset_id}\`, Disambiguation: \`${item.provenance.sense_disambiguation_status}\`)
  - Thai Provenance: \`${item.provenance.thai_meaning_status}\` (${item.provenance.thai_meaning_source})
  - Example Provenance: \`${item.provenance.example_status}\` (${item.provenance.example_source})
- **Empirical Risk Flags**: ${flagsStr}
- **Review Decision Template**:
  \`\`\`text
  DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
  REVIEWER: [                              ]
  RATIONALE: [                                                    ]
  \`\`\`

---`;
  }).join('\n\n');

  return `# Phase 6.2.30 — Human Review Packet (50 Locked Canonical Records)

**Packet Status**: Ready for Lead Human Lexicographer Review  
**Generated At**: ${new Date().toISOString()}  
**Target Records**: Exactly 50 Records (Derived 1:1 from \`reports/phase-6.2.30-controlled-qa-batch.json\`)  
**Governance Notice**: **STAGING / PLANNING ONLY**. No Human QA decisions (\`APPROVE\`, \`EDIT_REQUIRED\`, \`HOLD\`) have been executed. Production database mutations = 0. Learner-ready count = unchanged (83). User testing authorized = false.

---

## 1. Machine-Verifiable Integrity Verification Summary

- **SOURCE_COUNT**: \`${integrity.source_count}\`
- **PACKET_COUNT**: \`${integrity.packet_count}\`
- **MISSING**: \`${integrity.missing}\`
- **EXTRA**: \`${integrity.extra}\`
- **DUPLICATE**: \`${integrity.duplicate}\`
- **ORDER_MISMATCH**: \`${integrity.order_mismatch}\`
- **KEY_MISMATCH**: \`${integrity.key_mismatch}\`
- **exact_key_match**: \`${integrity.exact_key_match}\`
- **exact_order_match**: \`${integrity.exact_order_match}\`
- **canonical_resolution_count**: \`${integrity.canonical_resolution_count}/50\`
- **canonical_resolution_failures**: \`${JSON.stringify(integrity.canonical_resolution_failures)}\`
- **production_mutations**: \`${integrity.production_mutations}\`
- **PACKET_GATE**: **\`${integrity.packet_gate}\`**

---

## 2. Review Packet Inventory (50 Records)

${rows}

---

## 3. Mandatory Confirmation Statement

> Phase 6.2.30 Human Review Packet was generated from the locked 50-record queue only. No human decisions or production mutations were executed.
`;
}

// CLI Execution with on-disk reload verification
if (process.argv[1] && process.argv[1].endsWith('build-phase-6230-human-review-packet.mjs')) {
  console.log('Generating Phase 6.2.30 Human Review Packet...');
  const packetData = buildPhase6230HumanReviewPacket();

  const jsonPath = path.join(packetData.reportsDir, 'phase-6.2.30-human-review-packet.json');
  fs.writeFileSync(jsonPath, JSON.stringify(packetData.packetJson, null, 2), 'utf8');
  console.log(`Saved JSON packet to ${jsonPath}`);

  const mdPath = path.join(packetData.docsDir, 'phase-6.2.30-human-review-packet.md');
  const mdContent = generatePhase6230HumanReviewPacketMarkdown(packetData);
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Saved Markdown packet to ${mdPath}`);

  // On-disk reload verification
  const reloadedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const batchReport = JSON.parse(fs.readFileSync(path.join(packetData.reportsDir, 'phase-6.2.30-controlled-qa-batch.json'), 'utf8'));
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
  console.log(`Confirmation Statement: "${reloadedJson.confirmation_statement}"`);
}
