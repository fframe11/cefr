/**
 * Phase 6.2.28 — Human QA Execution Preparation Builder
 *
 * Prepares the execution manifest and human review workbench document
 * for the 50 locked records from Phase 6.2.27 without executing any human decisions,
 * mutating the production database, or changing readiness states.
 *
 * STRICT INVARIANTS:
 * 1. Derives 1:1 from reports/phase-6.2.27-human-review-packet.json (PACKET_GATE === 'PASS')
 * 2. Matches reports/phase-6.2.27-controlled-qa-batch.json 50/50 in exact locked sequence
 * 3. All decision slots (human_decision, human_edited_*, reviewer_id, review_transaction_id) MUST BE STRICTLY NULL
 * 4. Zero DB mutations (writes = 0)
 * 5. Review guidance checklist is strictly passive / non-decision
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const PHASE_6_2_28_CONSTANTS = {
  PHASE: '6.2.28',
  MANIFEST_VERSION: '1.0.0',
  EXECUTION_MODE: 'PREPARATION_ONLY',
  TOTAL_EXECUTION_UNITS: 50,
  CURRENT_LIFECYCLE_STATUS: 'REVIEW_REQUIRED',
  CURRENT_HUMAN_REVIEW_STATUS: 'REVIEW_REQUIRED',
  GATE_PASS: 'PASS',
  GATE_FAILED: 'FAILED',
};

export const REVIEW_GUIDANCE_TAXONOMY = {
  POLYSEMOUS_CORE: {
    category: 'POLYSEMOUS_CORE',
    risk_level: 'HIGH',
    title: 'High-Risk Polysemous Core Record',
    checklist: [
      'Verify meaning_en matches the specific sense_index indicated in the key',
      'Verify meaning_th matches that specific sub-sense, not a broad or generic definition',
      'Verify example sentence uses the word strictly in this target sense'
    ]
  },
  C1_OBSCURE: {
    category: 'C1_OBSCURE',
    risk_level: 'HIGH',
    title: 'High-Risk C1 Advanced Record',
    checklist: [
      'Verify meaning_en is sufficiently nuanced for C1 advanced competence',
      'Verify Thai translation accurately captures advanced register without distortion',
      'Verify example sentence demonstrates appropriate syntactic and semantic complexity',
      'Verify licensed IPA notation accuracy for advanced phonetic patterns'
    ]
  },
  C2_LITERARY: {
    category: 'C2_LITERARY',
    risk_level: 'HIGH',
    title: 'High-Risk C2 Mastery/Literary Record',
    checklist: [
      'Verify meaning_en captures the exact literary/figurative nuance expected at C2 level',
      'Verify Thai translation accurately captures literary register without oversimplification',
      'Verify example sentence demonstrates authentic native C2 syntactic complexity',
      'Verify licensed IPA notation accuracy for C2 phonetic distinctions'
    ]
  },
  HOMONYM_AMBIGUITY: {
    category: 'HOMONYM_AMBIGUITY',
    risk_level: 'MEDIUM',
    title: 'Medium-Risk Homonym/Part-of-Speech Ambiguity',
    checklist: [
      'Verify part of speech strictly matches the intended syntactic category',
      'Verify meaning_en and Thai meaning correspond to this syntactic class, not an alternate homograph',
      'Verify example sentence uses the word strictly in this grammatical function'
    ]
  },
  MONOSEMOUS_FOUNDATIONAL: {
    category: 'MONOSEMOUS_FOUNDATIONAL',
    risk_level: 'LOW',
    title: 'Low-Risk Monosemous Foundational Record',
    checklist: [
      'Verify Thai translation accuracy against canonical English gloss',
      'Verify IPA notation accuracy and standard phonetics',
      'Verify example sentence naturalness, grammatical correctness, and learner clarity'
    ]
  }
};

/**
 * Determine passive guidance checklist for a given record based on empirical traits.
 */
export function determineRecordReviewGuidance(record, allRecords = []) {
  if (record.cefr_level === 'C2') {
    return REVIEW_GUIDANCE_TAXONOMY.C2_LITERARY;
  }
  if (record.cefr_level === 'C1') {
    return REVIEW_GUIDANCE_TAXONOMY.C1_OBSCURE;
  }

  // Check homonym ambiguity (same word, different POS in current batch or general lexicon)
  const sameWordOtherPos = allRecords.filter(
    r => r.word === record.word && r.part_of_speech !== record.part_of_speech
  );
  if (sameWordOtherPos.length > 0) {
    const posList = [...new Set(allRecords.filter(r => r.word === record.word).map(r => r.part_of_speech))].join(' vs ');
    return {
      category: 'HOMONYM_AMBIGUITY',
      risk_level: 'MEDIUM',
      title: `Medium-Risk Homonym/Part-of-Speech Ambiguity (${posList})`,
      checklist: [
        `Verify part of speech strictly matches '${record.part_of_speech}' (distinct from ${posList})`,
        'Verify meaning_en and Thai meaning correspond strictly to this syntactic category',
        'Verify example sentence uses the word strictly in this grammatical function'
      ]
    };
  }

  // Check polysemy
  const isPolysemous =
    record.sense_index > 1 ||
    allRecords.filter(r => r.word === record.word).length > 1 ||
    (Array.isArray(record.actual_review_flags) && record.actual_review_flags.includes('POLYSEMY')) ||
    (Array.isArray(record.potential_review_flags) && record.potential_review_flags.includes('POLYSEMY')) ||
    (record.operational_priority && record.operational_priority.includes('POLYSEMOUS'));

  if (isPolysemous) {
    return REVIEW_GUIDANCE_TAXONOMY.POLYSEMOUS_CORE;
  }

  return REVIEW_GUIDANCE_TAXONOMY.MONOSEMOUS_FOUNDATIONAL;
}

/**
 * Validates baseline Phase 6.2.27 packet and batch before manifest creation.
 */
export function verifyPhase6228Baseline({ projectRoot = PROJECT_ROOT } = {}) {
  const packetPath = path.join(projectRoot, 'reports/phase-6.2.27-human-review-packet.json');
  const batchPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');

  if (!fs.existsSync(packetPath)) {
    throw new Error(`Baseline packet file not found at ${packetPath}`);
  }
  if (!fs.existsSync(batchPath)) {
    throw new Error(`Baseline batch file not found at ${batchPath}`);
  }

  const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

  const errors = [];

  if (packet.packet_gate !== 'PASS') {
    errors.push(`packet.packet_gate is '${packet.packet_gate}', expected 'PASS'`);
  }
  if (!packet.records || packet.records.length !== 50) {
    errors.push(`packet.records count is ${packet.records ? packet.records.length : 0}, expected exactly 50`);
  }
  if (!batch.selected_records || batch.selected_records.length !== 50) {
    errors.push(`batch.selected_records count is ${batch.selected_records ? batch.selected_records.length : 0}, expected exactly 50`);
  }

  const packetKeys = (packet.records || []).map(r => r.learning_unit_key);
  const batchKeys = (batch.selected_records || []).map(r => r.learning_unit_key);

  if (packetKeys.length === 50 && batchKeys.length === 50) {
    for (let i = 0; i < 50; i++) {
      if (packetKeys[i] !== batchKeys[i]) {
        errors.push(`Key mismatch at index ${i} (sequence ${i + 1}): packet has '${packetKeys[i]}' but batch has '${batchKeys[i]}'`);
      }
    }
  }

  const duplicateKeys = packetKeys.filter((k, idx) => packetKeys.indexOf(k) !== idx);
  if (duplicateKeys.length > 0) {
    errors.push(`Duplicate keys found in baseline packet: ${duplicateKeys.join(', ')}`);
  }

  const canonicalResCount = packet.integrity_verification?.canonical_resolution_count;
  if (canonicalResCount !== 50) {
    errors.push(`canonical_resolution_count is ${canonicalResCount}, expected 50`);
  }

  const canonicalFailures = packet.integrity_verification?.canonical_resolution_failures || [];
  if (canonicalFailures.length > 0) {
    errors.push(`canonical_resolution_failures count is ${canonicalFailures.length}, expected 0`);
  }

  const prodMutations = packet.integrity_verification?.production_mutations ?? 0;
  if (prodMutations !== 0) {
    errors.push(`production_mutations is ${prodMutations}, expected 0`);
  }

  return {
    valid: errors.length === 0,
    errors,
    packet,
    batch,
    packetKeys,
    batchKeys
  };
}

/**
 * Validates Phase 6.2.28 Execution Manifest against fail-closed rules.
 */
export function validatePhase6228ExecutionManifest(manifest, packetData = null, batchData = null) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be a non-null object'] };
  }

  const meta = manifest.metadata || {};
  if (meta.phase !== PHASE_6_2_28_CONSTANTS.PHASE) {
    errors.push(`metadata.phase is '${meta.phase}', expected '${PHASE_6_2_28_CONSTANTS.PHASE}'`);
  }
  if (meta.manifest_version !== PHASE_6_2_28_CONSTANTS.MANIFEST_VERSION) {
    errors.push(`metadata.manifest_version is '${meta.manifest_version}', expected '${PHASE_6_2_28_CONSTANTS.MANIFEST_VERSION}'`);
  }
  if (meta.execution_mode !== PHASE_6_2_28_CONSTANTS.EXECUTION_MODE) {
    errors.push(`metadata.execution_mode is '${meta.execution_mode}', expected '${PHASE_6_2_28_CONSTANTS.EXECUTION_MODE}'`);
  }
  if (meta.total_execution_units !== PHASE_6_2_28_CONSTANTS.TOTAL_EXECUTION_UNITS) {
    errors.push(`metadata.total_execution_units is ${meta.total_execution_units}, expected 50`);
  }
  if (meta.human_decisions_executed !== 0) {
    errors.push(`metadata.human_decisions_executed is ${meta.human_decisions_executed}, expected 0`);
  }
  if (meta.db_mutations_permitted !== false) {
    errors.push(`metadata.db_mutations_permitted is ${meta.db_mutations_permitted}, expected false`);
  }

  const records = manifest.records;
  if (!Array.isArray(records) || records.length !== 50) {
    errors.push(`records must be an array of exactly 50 items (got ${Array.isArray(records) ? records.length : 'non-array'})`);
    return { valid: false, errors };
  }

  const manifestKeys = [];
  const seenKeys = new Set();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const seq = i + 1;

    if (r.sequence !== seq) {
      errors.push(`Record at index ${i} has sequence ${r.sequence}, expected ${seq}`);
    }

    if (!r.learning_unit_key) {
      errors.push(`Record ${seq} missing learning_unit_key`);
    } else {
      if (seenKeys.has(r.learning_unit_key)) {
        errors.push(`Duplicate learning_unit_key detected: '${r.learning_unit_key}' at sequence ${seq}`);
      }
      seenKeys.add(r.learning_unit_key);
      manifestKeys.push(r.learning_unit_key);
    }

    // Required fields check
    if (!r.word) errors.push(`Record ${seq} missing word`);
    if (!r.part_of_speech) errors.push(`Record ${seq} missing part_of_speech`);
    if (!r.cefr_level) errors.push(`Record ${seq} missing cefr_level`);
    if (typeof r.sense_index !== 'number') errors.push(`Record ${seq} missing or non-number sense_index`);
    if (!r.meaning_en || r.meaning_en.trim() === '') errors.push(`Record ${seq} missing meaning_en`);
    if (!r.meaning_th || r.meaning_th.trim() === '') errors.push(`Record ${seq} missing meaning_th`);
    if (!r.ipa || r.ipa.trim() === '') errors.push(`Record ${seq} missing ipa`);
    if (!r.example_sentence || r.example_sentence.trim() === '') errors.push(`Record ${seq} missing example_sentence`);
    if (!r.operational_priority) errors.push(`Record ${seq} missing operational_priority`);
    if (!r.risk) errors.push(`Record ${seq} missing risk`);

    // Provenance check (5 dimensions)
    if (!r.provenance || typeof r.provenance !== 'object') {
      errors.push(`Record ${seq} missing provenance object`);
    } else {
      if (!r.provenance.cefr_source) errors.push(`Record ${seq} missing provenance.cefr_source`);
      if (!r.provenance.sense_status) errors.push(`Record ${seq} missing provenance.sense_status`);
      if (!r.provenance.ipa_status) errors.push(`Record ${seq} missing provenance.ipa_status`);
      if (!r.provenance.thai_status) errors.push(`Record ${seq} missing provenance.thai_status`);
      if (!r.provenance.example_status) errors.push(`Record ${seq} missing provenance.example_status`);
    }

    // Review flags check
    if (!Array.isArray(r.review_flags)) {
      errors.push(`Record ${seq} review_flags must be an array`);
    }

    // Lifecycle and human status
    if (r.current_lifecycle_status !== PHASE_6_2_28_CONSTANTS.CURRENT_LIFECYCLE_STATUS) {
      errors.push(`Record ${seq} current_lifecycle_status is '${r.current_lifecycle_status}', expected '${PHASE_6_2_28_CONSTANTS.CURRENT_LIFECYCLE_STATUS}'`);
    }
    if (r.current_human_review_status !== PHASE_6_2_28_CONSTANTS.CURRENT_HUMAN_REVIEW_STATUS) {
      errors.push(`Record ${seq} current_human_review_status is '${r.current_human_review_status}', expected '${PHASE_6_2_28_CONSTANTS.CURRENT_HUMAN_REVIEW_STATUS}'`);
    }
    if (r.current_reviewer_decision !== null) {
      errors.push(`Record ${seq} current_reviewer_decision is not null`);
    }

    // Preparation purity: all human_* fields MUST be null
    if (r.human_decision !== null) {
      errors.push(`Record ${seq} has pre-filled human_decision: '${r.human_decision}' (MUST BE NULL in preparation phase)`);
    }
    if (r.human_edited_meaning_en !== null) {
      errors.push(`Record ${seq} has non-null human_edited_meaning_en`);
    }
    if (r.human_edited_meaning_th !== null) {
      errors.push(`Record ${seq} has non-null human_edited_meaning_th`);
    }
    if (r.human_edited_ipa !== null) {
      errors.push(`Record ${seq} has non-null human_edited_ipa`);
    }
    if (r.human_edited_example_sentence !== null) {
      errors.push(`Record ${seq} has non-null human_edited_example_sentence`);
    }
    if (r.human_rationale !== null) {
      errors.push(`Record ${seq} has non-null human_rationale`);
    }
    if (r.reviewer_id !== null) {
      errors.push(`Record ${seq} has pre-filled reviewer_id: '${r.reviewer_id}' (MUST BE NULL)`);
    }
    if (r.review_transaction_id !== null) {
      errors.push(`Record ${seq} has pre-filled review_transaction_id: '${r.review_transaction_id}' (MUST BE NULL)`);
    }

    // Review guidance check
    if (!r.guidance || typeof r.guidance !== 'object' || !Array.isArray(r.guidance.checklist)) {
      errors.push(`Record ${seq} missing guidance checklist`);
    }
  }

  // Exact match against packet if provided
  if (packetData && packetData.records) {
    const packetKeys = packetData.records.map(x => x.learning_unit_key);
    if (packetKeys.length !== manifestKeys.length) {
      errors.push(`Manifest length (${manifestKeys.length}) does not match packet length (${packetKeys.length})`);
    } else {
      for (let i = 0; i < packetKeys.length; i++) {
        if (manifestKeys[i] !== packetKeys[i]) {
          errors.push(`Key order mismatch with packet at index ${i}: manifest has '${manifestKeys[i]}', packet has '${packetKeys[i]}'`);
        }
      }
    }
  }

  // Exact match against batch if provided
  if (batchData && batchData.selected_records) {
    const batchKeys = batchData.selected_records.map(x => x.learning_unit_key);
    if (batchKeys.length !== manifestKeys.length) {
      errors.push(`Manifest length (${manifestKeys.length}) does not match batch length (${batchKeys.length})`);
    } else {
      for (let i = 0; i < batchKeys.length; i++) {
        if (manifestKeys[i] !== batchKeys[i]) {
          errors.push(`Key order mismatch with batch at index ${i}: manifest has '${manifestKeys[i]}', batch has '${batchKeys[i]}'`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates the human-readable markdown workbench document for Phase 6.2.28.
 */
export function generateReadableWorkbenchMarkdown(manifest) {
  const { metadata, records } = manifest;

  let md = `# Phase 6.2.28 — Human QA Execution Manifest & Workbench

> **STATUS: PREPARATION ONLY — NOT FOR FINAL SYSTEM SIGN-OFF**  
> **Human Decisions Executed:** 0 / 50  
> **Database Mutations:** 0 (Strict Read-Only Mode)  
> **Source Packet:** \`${metadata.source_packet}\` (Gate: PASS)  
> **Source Controlled Batch:** \`${metadata.source_controlled_batch}\` (Ready: 50 Records)  
> **Generated At:** ${metadata.generated_at}

---

## 1. Executive Summary & Inventory Table

The following 50 learning units have been locked and derived 1:1 from the canonical dataset. Each record is presented with its verified unadulterated content, provenance markers, and empirical risk indicators.

| Seq | Word | POS | CEFR | Sense | Risk Classification | Operational Priority | Flags |
|---|---|---|---|---|---|---|---|
`;

  for (const r of records) {
    const flagsStr = r.review_flags.length > 0 ? r.review_flags.join(', ') : 'NONE';
    md += `| ${r.sequence} | **${r.word}** | \`${r.part_of_speech}\` | **${r.cefr_level}** | ${r.sense_index} | \`${r.guidance.category}\` | ${r.operational_priority} | \`${flagsStr}\` |\n`;
  }

  md += `
---

## 2. Review Guidance Categories & Methodological Invariants

| Category | Primary Focus & Verification Objectives |
|---|---|
| **POLYSEMOUS_CORE** | Verify \`meaning_en\` matches the designated \`sense_index\`; ensure Thai translation captures this exact sub-sense rather than broad generic gloss; verify example sentence embodies this exact sense. |
| **C1_OBSCURE** | Verify nuanced definitions matching C1 CEFR descriptor; ensure Thai register is formal and unsimplified; confirm example sentence structural complexity. |
| **C2_LITERARY** | Verify mastery/literary nuances; confirm Thai translation precision; ensure example sentence exhibits native-level sophistication. |
| **HOMONYM_AMBIGUITY** | Verify strict part-of-speech boundary (e.g. noun vs adjective); ensure definitions and example sentences do not bleed into alternate homographs. |
| **MONOSEMOUS_FOUNDATIONAL** | Verify Thai accuracy against canonical English meaning; verify standard IPA transcription; confirm naturalness of example sentence. |

---

## 3. Individual Review Workbench Cards (50 Records)

Each card below provides full empirical context and an empty decision template for the Human Reviewer in Phase 6.2.29.

`;

  for (const r of records) {
    const flagsStr = r.review_flags.length > 0 ? r.review_flags.map(f => `\`${f}\``).join(' ') : '`NONE`';
    const checklistItems = r.guidance.checklist.map(c => `- [ ] ${c}`).join('\n');

    md += `### [#${r.sequence}] ${r.word} (${r.part_of_speech}) — ${r.cefr_level} | Sense ${r.sense_index}

- **Learning Unit Key:** \`${r.learning_unit_key}\`
- **Batch Origin:** \`${r.batch}\` (Index: ${r.batch_index})
- **Operational Priority:** \`${r.operational_priority}\`
- **Risk Category:** \`${r.guidance.category}\` (${r.guidance.risk_level})
- **Review Flags:** ${flagsStr}

#### Current Canonical Content
- **English Meaning:** ${r.meaning_en}
- **Thai Meaning:** ${r.meaning_th}
- **IPA Pronunciation:** \`${r.ipa}\`
- **Example Sentence:** *"${r.example_sentence}"*

#### Provenance Verification
- **CEFR Profile Source:** ${r.provenance.cefr_source}
- **Sense Disambiguation Status:** \`${r.provenance.sense_status}\`
- **IPA Transcription Status:** \`${r.provenance.ipa_status}\`
- **Thai Meaning Status:** \`${r.provenance.thai_status}\`
- **Example Sentence Status:** \`${r.provenance.example_status}\`

#### Reviewer Guidance Checklist
${checklistItems}

#### Human Decision Slot (Phase 6.2.29 Reviewer Input)
\`\`\`text
DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD
EDITED_MEANING_EN: null
EDITED_MEANING_TH: null
EDITED_IPA: null
EDITED_EXAMPLE_SENTENCE: null
REVIEWER_RATIONALE: null
REVIEWER_ID: null
REVIEW_TRANSACTION_ID: null
\`\`\`

---
`;
  }

  md += `
## 4. Governance & Purity Attestation

- **Pre-filled Decisions:** Strictly 0 (All records initialized with \`human_decision: null\`)
- **Reviewer Identifiers:** Strictly 0 (All records initialized with \`reviewer_id: null\`)
- **Database Safety:** Zero SQL writes executed, zero Supabase client mutation calls.
- **Next Phase Authorization:** Phase 6.2.29 may proceed only when the Human Reviewer explicitly inputs decision values.
`;

  return md;
}

/**
 * Main execution function for Phase 6.2.28 manifest generation.
 */
export function buildPhase6228ExecutionManifest({ projectRoot = PROJECT_ROOT } = {}) {
  const reportsDir = path.join(projectRoot, 'reports');
  const docsDir = path.join(projectRoot, 'docs/assessment');

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  // 1. Verify baseline packet & batch
  const baseline = verifyPhase6228Baseline({ projectRoot });
  if (!baseline.valid) {
    throw new Error(`Baseline verification failed:\n${baseline.errors.join('\n')}`);
  }

  const { packet, batch } = baseline;
  const packetRecords = packet.records;

  // 2. Build records with guidance and null decision slots
  const manifestRecords = packetRecords.map((r, idx) => {
    const seq = idx + 1;
    const guidance = determineRecordReviewGuidance(r, packetRecords);

    return {
      sequence: seq,
      learning_unit_key: r.learning_unit_key,
      word: r.word,
      part_of_speech: r.part_of_speech,
      cefr_level: r.cefr_level,
      sense_index: r.sense_index,
      meaning_en: r.meaning_en,
      meaning_th: r.meaning_th,
      ipa: r.phonetic_ipa || r.ipa,
      example_sentence: r.example_sentence,
      operational_priority: r.operational_priority || r.priority_tier || 'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED',
      risk: r.review_risk_tier || r.risk_tier || 'TIER_1_CRITICAL_RISK',
      batch: r.batch || r.canonical_batches?.large_batch_id || 'UNKNOWN',
      batch_index: r.batch_index !== undefined ? r.batch_index : (r.canonical_indices?.large_unit_index ?? 0),
      provenance: {
        cefr_source: r.provenance?.source_name || r.cefr_source_provenance?.source_name || 'UNKNOWN',
        sense_status: r.provenance?.sense_status || r.sense_provenance?.status || 'UNKNOWN',
        ipa_status: r.provenance?.ipa_status || r.ipa_provenance?.status || 'UNKNOWN',
        thai_status: r.provenance?.thai_meaning_status || r.thai_meaning_provenance?.status || 'UNKNOWN',
        example_status: r.provenance?.example_status || r.example_provenance?.status || 'UNKNOWN'
      },
      review_flags: Array.isArray(r.actual_review_flags)
        ? r.actual_review_flags
        : (Array.isArray(r.potential_review_flags) ? r.potential_review_flags : []),
      current_lifecycle_status: PHASE_6_2_28_CONSTANTS.CURRENT_LIFECYCLE_STATUS,
      current_human_review_status: PHASE_6_2_28_CONSTANTS.CURRENT_HUMAN_REVIEW_STATUS,
      current_reviewer_decision: null,
      human_decision: null,
      human_edited_meaning_en: null,
      human_edited_meaning_th: null,
      human_edited_ipa: null,
      human_edited_example_sentence: null,
      human_rationale: null,
      reviewer_id: null,
      review_transaction_id: null,
      guidance: {
        category: guidance.category,
        risk_level: guidance.risk_level,
        title: guidance.title,
        checklist: guidance.checklist
      }
    };
  });

  const manifest = {
    metadata: {
      phase: PHASE_6_2_28_CONSTANTS.PHASE,
      manifest_version: PHASE_6_2_28_CONSTANTS.MANIFEST_VERSION,
      generated_at: new Date().toISOString(),
      source_packet: 'reports/phase-6.2.27-human-review-packet.json',
      source_controlled_batch: 'reports/phase-6.2.27-controlled-qa-batch.json',
      total_execution_units: PHASE_6_2_28_CONSTANTS.TOTAL_EXECUTION_UNITS,
      execution_mode: PHASE_6_2_28_CONSTANTS.EXECUTION_MODE,
      human_decisions_executed: 0,
      db_mutations_permitted: false,
      readiness_gate: 'CONTROLLED_QA_PREPARATION_VERIFIED',
      preparation_gate: PHASE_6_2_28_CONSTANTS.GATE_PASS,
      review_guidance_categories: {
        POLYSEMOUS_CORE: 'Verify meaning_en matches sense_index; verify meaning_th matches sub-sense, not broad definition; verify example sentence uses word in that sense.',
        C1_OBSCURE_OR_C2_LITERARY: 'Verify meaning is sufficiently nuanced for C1/C2; verify example sentence has appropriate complexity.',
        HOMONYM_AMBIGUITY: 'Check part of speech matches the sense (e.g. black noun vs black adjective).',
        MONOSEMOUS_FOUNDATIONAL: 'Verify Thai translation accuracy; verify IPA notation accuracy.'
      }
    },
    records: manifestRecords
  };

  // 3. Write manifest JSON
  const manifestPath = path.join(reportsDir, 'phase-6.2.28-human-qa-execution-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  // 4. Generate & write readable markdown workbench
  const mdContent = generateReadableWorkbenchMarkdown(manifest);
  const docPath = path.join(docsDir, 'phase-6.2.28-human-qa-execution-manifest.md');
  fs.writeFileSync(docPath, mdContent, 'utf8');

  // 5. Reload from disk and perform fail-closed verification
  const reloadedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const validation = validatePhase6228ExecutionManifest(reloadedManifest, packet, batch);

  if (!validation.valid) {
    throw new Error(`Generated manifest failed fail-closed validation:\n${validation.errors.join('\n')}`);
  }

  return {
    manifest,
    manifestPath,
    docPath,
    validation,
    gate: PHASE_6_2_28_CONSTANTS.GATE_PASS
  };
}

// Direct CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log('--- Phase 6.2.28: Building Human QA Execution Manifest ---');
    const result = buildPhase6228ExecutionManifest();
    console.log(`Manifest written to: ${result.manifestPath}`);
    console.log(`Workbench written to: ${result.docPath}`);
    console.log(`Validation: PASS (50/50 records verified with zero pre-filled decisions)`);
    console.log(`HUMAN_QA_PREPARATION_GATE = ${result.gate}`);
    process.exit(0);
  } catch (err) {
    console.error(`FATAL ERROR: ${err.message}`);
    process.exit(1);
  }
}
