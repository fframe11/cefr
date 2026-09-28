import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const tier1Path = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
const batchData = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Filter unreviewed records
const unreviewed = batchData.records.filter((r) => r.lifecycle_status === 'REVIEW_REQUIRED');
const sample = unreviewed.slice(0, 25);

console.log(`Selecting pilot sample of ${sample.length} unreviewed records from ${batchData.batch_id}...`);

// Generate 14-dimension package
const packageRecords = sample.map((unit, index) => {
  const p = unit.provenance || {};
  const reasons = unit.tier1_reasons || [];
  const flags = unit.qa_flags || [];

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
    provenance: {
      source: p.source,
      source_name: p.source_name,
      license: p.license,
      conflicting_cefr_levels: p.conflicting_cefr_levels || [],
    },
    candidate_senses: unit.candidate_senses_preview || [],
    allowed_decisions: ['APPROVED', 'EDIT_REQUIRED', 'HOLD', 'REJECTED'],
    edit_template: {
      corrected_cefr: null,
      corrected_definition_th: null,
      corrected_example_en: null,
      corrected_example_th: null,
      corrected_ipa: null,
      reviewer_notes: null,
    },
    review_submission: {
      reviewer_decision: null,
      review_rationale: null,
      ipa_disposition: null,
      sense_disposition: null,
      edits: {
        meaning_en: null,
        meaning_th: null,
        phonetic_ipa: null,
        example_sentence: null,
        cefr_level: null,
        topic: null,
      },
    },
  };
});

const reviewPackage = {
  $schema: 'https://glova.ai/schemas/vocabulary-human-review-pilot-v1.json',
  package_type: 'PHASE_6_2_14_PILOT_SAMPLE',
  batch_id: batchData.batch_id,
  exported_at: new Date().toISOString(),
  sample_size: packageRecords.length,
  total_unreviewed_in_batch: unreviewed.length,
  total_records_in_batch: batchData.records.length,
  instructions: {
    rule: 'Strict Human Gate: only authentic human reviewer decisions may be recorded.',
    decisions: {
      APPROVED: 'All 14 dimensions accurate, pedagogically sound, and learner-ready.',
      EDIT_REQUIRED: 'Defect detected. Provide corrected field(s) in review_submission.edits and rationale.',
      HOLD: 'Needs further disambiguation or senior lexicographical consultation. Provide rationale >= 10 chars.',
      REJECTED: 'Uncurable or inappropriate item. Provide rationale >= 10 chars.',
    },
    ipa_dispositions: [
      'VERIFIED_PRONUNCIATION',
      'EDITED_PRONUNCIATION',
      'MULTI_ACCENT_PRONUNCIATION',
      'EXEMPT_NON_PHONETIC',
    ],
    sense_dispositions: [
      'SELECT_SUPPORTED_SENSE',
      'CONFIRM_MONOSEMOUS',
      'SPLIT_NEW_LEARNING_UNIT',
      'EDIT_MEANING',
      'CHANGE_CEFR_WITH_EVIDENCE',
      'HOLD_FOR_CURATION',
    ],
  },
  records: packageRecords,
};

const packagePath = path.join(projectRoot, 'reports/tier1-batch-001-pilot-sample.json');
fs.writeFileSync(packagePath, JSON.stringify(reviewPackage, null, 2), 'utf8');
console.log(`Saved review package to ${packagePath}`);

// Generate dry-run test file (Task 5 schema validation)
const dryRunRecords = packageRecords.map((r) => ({
  learning_unit_key: r.learning_unit_key,
  review_submission: {
    reviewer_decision: 'HOLD',
    review_rationale: 'Dry-run validation of schema and reviewer authentication.',
    ipa_disposition: null,
    sense_disposition: null,
    edits: null,
  },
}));

const dryRunPackage = {
  $schema: 'https://glova.ai/schemas/vocabulary-human-review-v1.json',
  batch_id: batchData.batch_id,
  dry_run_template: true,
  records: dryRunRecords,
};

const dryRunPath = path.join(projectRoot, 'reports/tier1-batch-001-pilot-sample-dryrun.json');
fs.writeFileSync(dryRunPath, JSON.stringify(dryRunPackage, null, 2), 'utf8');
console.log(`Saved dry-run validation template to ${dryRunPath}`);
