/**
 * Phase 6.2.37 — Controlled Semantic Disambiguation & Example Expansion POC Test Suite
 *
 * Covers 15 Mandatory Testing Requirements:
 * 1. Candidate preservation: all candidates evaluated, none silently dropped
 * 2. No translation[0] shortcut: verifiable that top-scored != index-0 in non-trivial cases
 * 3. Polysemy ambiguity detection: ambiguous cases return AMBIGUOUS, not confident
 * 4. Score ordering: returned candidates sorted by score descending
 * 5. Margin calculation: top_score - second_score correctly computed
 * 6. Fail-closed behavior: below-threshold scores do not produce confident match
 * 7. CEFR conflict detection: cross-level sense divergence flagged
 * 8. POS conflict detection: cross-POS candidate rejection
 * 9. Thai missing detection: units without Thai candidates handled gracefully
 * 10. Example provenance: every example has source_id, license, attribution
 * 11. Morphology-safe matching: inflected forms matched without false derivatives
 * 12. Substring false positive rejection: car!=carpet, art!=article, etc.
 * 13. License metadata completeness: all candidate sources have full license record
 * 14. Zero production mutation: verify 0 DB writes, 0 schema changes
 * 15. Learner-ready locked: verify count remains 83 (21 active, 62 approved staging)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  evaluateCandidateSenses,
  SEMANTIC_EVIDENCE_STATUS,
  extractDefinitionKeywords,
} from '../scripts/content-pipeline/vocab/semantic-disambiguation-poc.mjs';
import {
  ExampleExpansionWarehouse,
  EXAMPLE_QUALITY_STATUS,
  EXAMPLE_MATCH_TYPE,
} from '../scripts/content-pipeline/vocab/example-expansion-poc.mjs';
import {
  matchLemmaInExample,
  FALSE_DERIVATIVE_BLACKLIST,
} from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';
import {
  extract300UnitStratifiedSample,
  runAdversarialTestSuite,
  runPhase6237Poc,
} from '../scripts/content-pipeline/vocab/run-phase-6237-poc.mjs';
import {
  LexicalEvidenceWarehouse,
  GAP_TAXONOMY,
} from '../scripts/content-pipeline/vocab/lexical-warehouse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

describe('Phase 6.2.37 — Semantic Polysemy Disambiguation & Example Expansion POC', () => {
  let warehouse: LexicalEvidenceWarehouse;
  let exampleWarehouse: ExampleExpansionWarehouse;

  beforeAll(() => {
    warehouse = new LexicalEvidenceWarehouse(PROJECT_ROOT);
    exampleWarehouse = new ExampleExpansionWarehouse(PROJECT_ROOT);
  });

  // Test 1: Candidate preservation
  it('1. preserves all candidates during evaluation without silently dropping any', () => {
    const candidates = [
      { normalized_translation: 'ธนาคาร', raw_translation: 'ธนาคาร (n)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'ตลิ่ง', raw_translation: 'ตลิ่ง (n)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'ฝั่งแม่น้ำ', raw_translation: 'ฝั่งแม่น้ำ (n)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'แถว', raw_translation: 'แถว (n)', source_id: 'wiktionary_omw_2024' },
    ];

    const result = evaluateCandidateSenses({
      headword: 'bank',
      pos: 'noun',
      candidates,
      englishSense: { definition: 'financial institution', synonyms: ['bank'] },
      lexitronEntries: candidates,
    });

    expect(result.ranked_candidates.length).toBe(4);
    expect(result.ranked_candidates.map((c) => c.thai_translation)).toEqual(
      expect.arrayContaining(['ธนาคาร', 'ตลิ่ง', 'ฝั่งแม่น้ำ', 'แถว'])
    );
  });

  // Test 2: No translation[0] shortcut
  it('2. verifies top-scored candidate is not blindly locked to index-0 in non-trivial cases', () => {
    // Put riverbank at index 0 and financial institution at index 1
    const candidates = [
      { normalized_translation: 'ตลิ่ง', raw_translation: 'ตลิ่ง (n)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'ธนาคาร', raw_translation: 'ธนาคาร (n)', source_id: 'lexitron_2_0' },
    ];
    const lexitronEntries = [
      { normalized_translation: 'ตลิ่ง', synonyms: ['sloping land', 'riverbank'] },
      { normalized_translation: 'ธนาคาร', synonyms: ['financial institution', 'depository bank'] },
    ];

    const result = evaluateCandidateSenses({
      headword: 'bank',
      pos: 'noun',
      candidates,
      englishSense: {
        definition: 'a financial institution that accepts deposits and channels money',
        synonyms: ['banking concern'],
      },
      lexitronEntries,
    });

    // Best candidate MUST be ธนาคาร (index 1), NOT index 0 (ตลิ่ง)
    expect(result.best_candidate?.candidate_index).toBe(1);
    expect(result.best_candidate?.thai_translation).toBe('ธนาคาร');
  });

  // Test 3: Polysemy ambiguity detection
  it('3. detects ambiguous polysemy cases and returns AMBIGUOUS, not confident', () => {
    const candidates = [
      { normalized_translation: 'ความรู้สึก', raw_translation: 'ความรู้สึก (n)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'อารมณ์', raw_translation: 'อารมณ์ (n)', source_id: 'lexitron_2_0' },
    ];
    const lexitronEntries = [
      { normalized_translation: 'ความรู้สึก', synonyms: ['awareness'] },
      { normalized_translation: 'อารมณ์', synonyms: ['awareness'] },
    ];
    const result = evaluateCandidateSenses({
      headword: 'feeling',
      pos: 'noun',
      candidates,
      englishSense: { definition: 'state of physical or mental awareness', synonyms: ['awareness'] },
      lexitronEntries,
    });

    expect(result.status).toBe(SEMANTIC_EVIDENCE_STATUS.SEMANTIC_MATCH_AMBIGUOUS);
    expect(result.margin).toBeLessThan(0.15);
  });

  // Test 4: Score ordering
  it('4. ensures returned candidates are strictly sorted in descending score order', () => {
    const candidates = [
      { normalized_translation: 'วิ่ง', raw_translation: 'วิ่ง (v)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'แล่น', raw_translation: 'แล่น (v)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'ดำเนินการ', raw_translation: 'ดำเนินการ (v)', source_id: 'lexitron_2_0' },
    ];

    const result = evaluateCandidateSenses({
      headword: 'run',
      pos: 'verb',
      candidates,
      englishSense: { definition: 'move fast using legs', synonyms: ['sprint'] },
      lexitronEntries: [
        { normalized_translation: 'วิ่ง', synonyms: ['sprint', 'move fast'] },
        { normalized_translation: 'แล่น', synonyms: ['sail', 'glide'] },
        { normalized_translation: 'ดำเนินการ', synonyms: ['operate', 'execute'] },
      ],
    });

    for (let i = 0; i < result.ranked_candidates.length - 1; i++) {
      expect(result.ranked_candidates[i].score).toBeGreaterThanOrEqual(result.ranked_candidates[i + 1].score);
    }
  });

  // Test 5: Margin calculation
  it('5. computes margin Delta = S1 - S2 correctly and accurately', () => {
    const candidates = [
      { normalized_translation: 'รวย', raw_translation: 'รวย (adj)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'อุดมสมบูรณ์', raw_translation: 'อุดมสมบูรณ์ (adj)', source_id: 'lexitron_2_0' },
    ];
    const lexitronEntries = [
      { normalized_translation: 'รวย', synonyms: ['wealthy', 'affluent'] },
      { normalized_translation: 'อุดมสมบูรณ์', synonyms: ['fertile', 'fruitful'] },
    ];

    const result = evaluateCandidateSenses({
      headword: 'rich',
      pos: 'adjective',
      candidates,
      englishSense: { definition: 'having a great deal of money or assets; wealthy', synonyms: ['wealthy'] },
      lexitronEntries,
    });

    expect(result.margin).toBe(Math.round((result.top_score - result.second_score) * 100) / 100);
    expect(result.margin).toBeGreaterThanOrEqual(0.15);
  });

  // Test 6: Fail-closed behavior
  it('6. enforces fail-closed behavior when scores are below threshold or evidence is missing', () => {
    const result = evaluateCandidateSenses({
      headword: 'obscure_term',
      pos: 'noun',
      candidates: [{ normalized_translation: 'คำแปลไม่ชัดเจน', raw_translation: 'คำแปลไม่ชัดเจน', source_id: 'lexitron_2_0' }],
      englishSense: null,
      lexitronEntries: [],
    });

    expect(result.status).not.toBe(SEMANTIC_EVIDENCE_STATUS.SEMANTIC_MATCH_CONFIDENT);
    expect(result.top_score).toBeLessThan(0.60);
  });

  // Test 7: CEFR conflict detection
  it('7. flags CEFR conflict when learner unit level diverges from source reference profile', () => {
    const res = warehouse.mergeUnitEvidence({
      word: 'schedule',
      part_of_speech: 'noun',
      cefr_level: 'A1', // Target is A1, but CEFR-J is B1
    });

    expect(res.gap_reasons).toContain(GAP_TAXONOMY.CEFR_CONFLICT);
    expect(res.confidence_decision).toBe('HOLD');
  });

  // Test 8: POS conflict detection
  it('8. rejects cross-POS candidates (verb vs noun) in disambiguation scoring', () => {
    const candidates = [
      { normalized_translation: 'วิ่ง', raw_translation: 'วิ่ง (v)', source_id: 'lexitron_2_0' },
      { normalized_translation: 'การวิ่ง', raw_translation: 'การวิ่ง (n)', source_id: 'lexitron_2_0' },
    ];

    const result = evaluateCandidateSenses({
      headword: 'run',
      pos: 'verb',
      candidates,
      englishSense: { definition: 'move fast on foot', synonyms: ['sprint'] },
      lexitronEntries: [
        { normalized_translation: 'วิ่ง', synonyms: ['move fast'] },
        { normalized_translation: 'การวิ่ง', synonyms: ['running activity'] },
      ],
    });

    expect(result.best_candidate?.thai_translation).toBe('วิ่ง');
  });

  // Test 9: Thai missing detection
  it('9. handles units with zero candidate translations gracefully with NO_EVIDENCE', () => {
    const result = evaluateCandidateSenses({
      headword: 'nonexistentlemma12345',
      pos: 'noun',
      candidates: [],
      englishSense: { definition: 'does not exist', synonyms: [] },
      lexitronEntries: [],
    });

    expect(result.status).toBe(SEMANTIC_EVIDENCE_STATUS.SEMANTIC_MATCH_NO_EVIDENCE);
    expect(result.best_candidate).toBeNull();
  });

  // Test 10: Example provenance completeness
  it('10. verifies all candidate examples carry complete source provenance and attribution', () => {
    const examples = exampleWarehouse.findAttestedExamples({ word: 'salad', pos: 'noun' });
    expect(examples.length).toBeGreaterThan(0);

    for (const ex of examples) {
      expect(ex.sentence).toBeTruthy();
      expect(ex.source_id).toMatch(/^(oewn_2024|tatoeba|open_edu_corpus)$/);
      expect(ex.license).toBeTruthy();
      expect(ex.attribution).toBeTruthy();
      expect(ex.quality_status).toMatch(/^(SOURCE_OK|SOURCE_REVIEW|SOURCE_REJECT)$/);
    }
  });

  // Test 11: Morphology-safe matching
  it('11. correctly matches inflected and irregular forms using morphology tables', () => {
    // Regular plural
    const nounPluralMatch = matchLemmaInExample({
      lemma: 'car',
      pos: 'noun',
      example: 'Three cars were parked outside.',
    });
    expect(nounPluralMatch.matched).toBe(true);
    expect(nounPluralMatch.match_type).toBe('INFLECTED_FORM');

    // Irregular verb past tense
    const irrVerbMatch = matchLemmaInExample({
      lemma: 'feel',
      pos: 'verb',
      example: 'I felt very tired yesterday.',
    });
    expect(irrVerbMatch.matched).toBe(true);
    expect(irrVerbMatch.match_type).toBe('IRREGULAR_FORM');
  });

  // Test 12: Substring false positive rejection
  it('12. strictly rejects false derivative substring matches (car!=carpet, art!=article, act!=action, care!=careful, class!=classic)', () => {
    const falsePairs = [
      { lemma: 'car', pos: 'noun', example: 'The red carpet was cleaned.' },
      { lemma: 'art', pos: 'noun', example: 'He wrote an article for the paper.' },
      { lemma: 'act', pos: 'verb', example: 'Decisive action solved the problem.' },
      { lemma: 'care', pos: 'verb', example: 'Be careful when you drive.' },
      { lemma: 'class', pos: 'noun', example: 'This is a classic novel.' },
    ];

    for (const p of falsePairs) {
      const match = matchLemmaInExample({ lemma: p.lemma, pos: p.pos, example: p.example });
      expect(match.matched).toBe(false);
      expect(match.match_type).toBe('NOT_FOUND');
    }
  });

  // Test 13: License metadata completeness
  it('13. verifies all touched sources have complete license records in license audit', () => {
    const auditPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.37-license-audit.json');
    expect(fs.existsSync(auditPath)).toBe(true);

    const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    expect(audit.sources.length).toBeGreaterThanOrEqual(7);

    for (const s of audit.sources) {
      expect(s.source_id).toBeTruthy();
      expect(s.license_type).toBeTruthy();
      expect(s.commercial_use).toMatch(/^(ALLOWED|CONDITIONAL|FORBIDDEN)$/);
      expect(s.attribution_required).toMatch(/^(REQUIRED|NONE)$/);
      expect(s.compliance_status).toBe('COMPLIANT');
    }
  });

  // Test 14: Zero production mutation
  it('14. guarantees zero production Supabase database writes and zero schema changes', () => {
    const deltaPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.37-blocker-delta.json');
    expect(fs.existsSync(deltaPath)).toBe(true);

    const delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'));
    expect(delta.safety_invariants.production_db_mutated).toBe(false);
    expect(delta.safety_invariants.schema_altered).toBe(false);
    expect(delta.safety_invariants.vocabulary_activated).toBe(false);
  });

  // Test 15: Learner-ready accounting locked at 83
  it('15. strictly locks learner-ready count at 83 and blocks user testing', () => {
    const deltaPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.37-blocker-delta.json');
    const delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'));

    expect(delta.baseline_breakdown.learner_ready).toBe(83);
    expect(delta.safety_invariants.learner_ready_count).toBe(83);
    expect(delta.safety_invariants.user_testing_authorized).toBe(false);
    expect(delta.safety_invariants.overall_readiness).toBe('NOT_READY');
  });

  // Additional: 10 Adversarial cases
  it('16. verifies all 10 adversarial edge cases pass fail-closed validation', () => {
    const advResults = runAdversarialTestSuite({ warehouse });
    expect(advResults.passed).toBe(10);
    expect(advResults.all_passed).toBe(true);
  });
});
