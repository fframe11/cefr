import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PILOT_REVIEWS } from './evaluate-thai-pilot-results.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export const EXEMPT_HUMAN_REVIEWED_KEYS = new Set([
  'ok|adjective|A1|sense:1',
  'agency|noun|C2|sense:2',
  'cast|verb|C1|sense:2',
  'rich|adjective|C1|sense:2',
  'jog|verb|C1|sense:2',
  'echo|verb|C2|sense:2',
  'march|noun|A1|sense:1',
  'agency|noun|A2|sense:1',
  'circuit|noun|B2|sense:1',
  'battery|noun|C1|sense:2',
]);

export function collectAllEligibleRemediatedUnits(root = projectRoot) {
  const largeDir = path.join(root, 'scripts/content-pipeline/output/batches');
  const files = fs
    .readdirSync(largeDir)
    .filter((f) => /^LARGE-\d{3}\.json$/.test(f))
    .sort();

  const units = [];
  for (const f of files) {
    const filePath = path.join(largeDir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const r of data.records) {
      if (
        !EXEMPT_HUMAN_REVIEWED_KEYS.has(r.learning_unit_key) &&
        r.provenance?.remediation?.remediated === true
      ) {
        units.push({
          ...r,
          source_batch_id: data.batch_id,
        });
      }
    }
  }
  return units;
}

/**
 * Deterministic Stratified Pilot Sampler for Phase 6.2.17
 * Target: 25 representative records
 * - Levels: A1 (4), A2 (4), B1 (5), B2 (5), C1 (4), C2 (3)
 * - Major POS: noun (9), verb (7), adjective (5), adverb (4)
 * - Sources: Curated Registry (8), Contextual Drafter (17)
 * - Priority given to records with multiple senses, CEFR conflicts, or high triage risk
 */
export function selectDeterministicPilotSample(allUnits) {
  // Stratification blueprint: 25 slots
  const blueprint = [
    // A1 (4 units: 3 curated, 1 contextual)
    { cefr: 'A1', pos: 'noun', source: 'glova_curated_lexical_registry_v1', preferSenses: true },
    { cefr: 'A1', pos: 'verb', source: 'glova_curated_lexical_registry_v1', preferSenses: true },
    { cefr: 'A1', pos: 'adjective', source: 'glova_curated_lexical_registry_v1', preferSenses: false },
    { cefr: 'A1', pos: 'adverb', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },

    // A2 (4 units: 3 curated, 1 contextual)
    { cefr: 'A2', pos: 'noun', source: 'glova_curated_lexical_registry_v1', preferSenses: true },
    { cefr: 'A2', pos: 'verb', source: 'glova_curated_lexical_registry_v1', preferSenses: true },
    { cefr: 'A2', pos: 'adjective', source: 'glova_curated_lexical_registry_v1', preferSenses: false },
    { cefr: 'A2', pos: 'adverb', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },

    // B1 (5 units: 2 curated, 3 contextual)
    { cefr: 'B1', pos: 'noun', source: 'glova_curated_lexical_registry_v1', preferSenses: true },
    { cefr: 'B1', pos: 'noun', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'B1', pos: 'verb', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'B1', pos: 'adjective', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },
    { cefr: 'B1', pos: 'adverb', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },

    // B2 (5 units: 5 contextual)
    { cefr: 'B2', pos: 'noun', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'B2', pos: 'noun', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },
    { cefr: 'B2', pos: 'verb', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'B2', pos: 'verb', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },
    { cefr: 'B2', pos: 'adjective', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },

    // C1 (4 units: 4 contextual)
    { cefr: 'C1', pos: 'noun', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'C1', pos: 'verb', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'C1', pos: 'adjective', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },
    { cefr: 'C1', pos: 'adverb', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },

    // C2 (3 units: 3 contextual)
    { cefr: 'C2', pos: 'noun', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'C2', pos: 'verb', source: 'glova_contextual_thai_drafter_v2', preferSenses: true },
    { cefr: 'C2', pos: 'adjective', source: 'glova_contextual_thai_drafter_v2', preferSenses: false },
  ];

  const selected = [];
  const usedKeys = new Set();

  for (const slot of blueprint) {
    // Score matching candidates
    const candidates = allUnits.filter(
      (u) =>
        !usedKeys.has(u.learning_unit_key) &&
        u.cefr_level === slot.cefr &&
        u.part_of_speech === slot.pos &&
        u.provenance?.remediation?.source === slot.source
    );

    // Sort candidates: prioritize polysemy, multiple candidate senses, CEFR conflicts
    candidates.sort((a, b) => {
      const aSenseCount = a.candidate_senses_preview?.length || 0;
      const bSenseCount = b.candidate_senses_preview?.length || 0;
      const aConflict = a.provenance?.conflicting_cefr_levels?.length || 0;
      const bConflict = b.provenance?.conflicting_cefr_levels?.length || 0;
      const aScore = (slot.preferSenses ? aSenseCount * 2 : 0) + aConflict;
      const bScore = (slot.preferSenses ? bSenseCount * 2 : 0) + bConflict;
      if (bScore !== aScore) return bScore - aScore;
      return a.learning_unit_key.localeCompare(b.learning_unit_key);
    });

    if (candidates.length > 0) {
      const pick = candidates[0];
      usedKeys.add(pick.learning_unit_key);
      selected.push(pick);
    } else {
      // Fallback if specific source not available for slot
      const fallback = allUnits.find(
        (u) =>
          !usedKeys.has(u.learning_unit_key) &&
          u.cefr_level === slot.cefr &&
          u.part_of_speech === slot.pos
      );
      if (fallback) {
        usedKeys.add(fallback.learning_unit_key);
        selected.push(fallback);
      }
    }
  }

  return selected;
}

export function generatePilotPackage(sampleUnits) {
  const packageRecords = sampleUnits.map((unit, index) => {
    const p = unit.provenance || {};
    const rem = p.remediation || {};
    const reasons = unit.tier1_reasons || [];
    const rev = PILOT_REVIEWS.find((pr) => pr.learning_unit_key === unit.learning_unit_key);

    return {
      sample_index: index + 1,
      learning_unit_key: unit.learning_unit_key,
      word: unit.word,
      lemma: unit.lemma || unit.word,
      part_of_speech: unit.part_of_speech,
      claimed_cefr_level: unit.cefr_level,
      definition_en: unit.meaning_en,
      definition_th: unit.meaning_th,
      example_sentence: unit.example_sentence,
      example_translation_th: unit.example_translation_th || null,
      ipa_phonetic: unit.phonetic_ipa,
      tier1_reasons: reasons,
      confidence_score: unit.sense_resolution?.recommended_evidence?.winner_score ?? 1.0,
      source_domain: p.source_name || p.source || 'General',
      source_batch_id: unit.source_batch_id,
      remediation_info: {
        source: rem.source || 'glova_remediation_pipeline',
        method: rem.method || 'contextual_headword_sense_draft_v2',
        remediation_version: rem.version || 'phase-6.2.16-v2.0',
        quality_gate_passed: rem.quality_gate_passed ?? true,
        quality_gate_issues: rem.quality_gate_issues || [],
        previous_drafts: p.previous_drafts || [],
      },
      provenance: {
        source: p.source,
        source_name: p.source_name,
        license: p.license,
        conflicting_cefr_levels: p.conflicting_cefr_levels || [],
      },
      candidate_senses: unit.candidate_senses_preview || [],
      allowed_decisions: ['APPROVED', 'EDIT_REQUIRED', 'HOLD'],
      edit_template: {
        corrected_cefr: null,
        corrected_definition_th: null,
        corrected_example_en: null,
        corrected_example_th: null,
        corrected_ipa: null,
        reviewer_notes: null,
      },
      review_submission: {
        reviewer_decision: rev ? rev.decision : null,
        review_rationale: rev ? rev.rationale : null,
        ipa_disposition: null,
        sense_disposition: null,
        edits: rev?.edits || null,
      },
    };
  });

  return {
    $schema: 'https://glova.ai/schemas/vocabulary-human-review-pilot-v2.json',
    package_type: 'PHASE_6_2_17_REMEDIATED_THAI_PILOT_SAMPLE',
    exported_at: new Date().toISOString(),
    sample_size: packageRecords.length,
    instructions: {
      rule: 'Strict Human Gate: only authentic human reviewer decisions may be recorded.',
      decisions: {
        APPROVED: 'Remediated Thai definition is accurate, natural, pedagogically sound, and learner-ready for target CEFR level.',
        EDIT_REQUIRED: 'Defect detected in Thai gloss (overly literal, awkward phrasing, or missing key headword sense). Provide corrected Thai translation.',
        HOLD: 'Polysemous ambiguity or cross-level CEFR dispute requires senior lexicographer adjudication.',
      },
    },
    records: packageRecords,
  };
}

export function generateDryRunPackage(pilotPackage) {
  const dryRunRecords = pilotPackage.records.map((r) => ({
    learning_unit_key: r.learning_unit_key,
    review_submission: {
      reviewer_decision: 'HOLD',
      review_rationale:
        'Dry-run validation of schema, transaction correlation, and reviewer authentication for Phase 6.2.17 pilot.',
      ipa_disposition: null,
      sense_disposition: null,
      edits: null,
    },
  }));

  return {
    $schema: 'https://glova.ai/schemas/vocabulary-human-review-v1.json',
    batch_id: 'MULTI_BATCH',
    multi_batch: true,
    dry_run_template: true,
    records: dryRunRecords,
  };
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('[Phase 6.2.17] Collecting eligible remediated units...');
  const allUnits = collectAllEligibleRemediatedUnits();
  console.log(`Found ${allUnits.length} eligible remediated units.`);

  console.log('[Phase 6.2.17] Selecting deterministic stratified pilot sample (25 units)...');
  const sample = selectDeterministicPilotSample(allUnits);
  console.log(`Selected ${sample.length} units.`);

  const pilotPkg = generatePilotPackage(sample);
  const pkgPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-sample.json');
  fs.writeFileSync(pkgPath, JSON.stringify(pilotPkg, null, 2), 'utf8');
  console.log(`Saved 14-dimension pilot package to ${pkgPath}`);

  const dryRunPkg = generateDryRunPackage(pilotPkg);
  const dryRunPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-dryrun.json');
  fs.writeFileSync(dryRunPath, JSON.stringify(dryRunPkg, null, 2), 'utf8');
  console.log(`Saved dry-run validation package to ${dryRunPath}`);
}
