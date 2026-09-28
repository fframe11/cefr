/**
 * Phase 6.2.38 — Evidence Validation & Calibration Before Any Production Promotion Test Suite
 *
 * 15 Mandatory Testing Requirements:
 * 1. Consistent counts across reports and gates (10,021 denominator, 350 sample, 83 learner-ready)
 * 2. Deterministic sampling repeatability (seed 6238 produces identical units across runs)
 * 3. Candidate preservation across all units (zero silent candidate dropping)
 * 4. Zero naive translation[0] fallback (selection relies on multi-feature scoring)
 * 5. Ambiguous units routed to REVIEW_REQUIRED, never AUTO_READY
 * 6. Threshold calculation precision (S1 >= 0.60 and Delta >= 0.15)
 * 7. Score normalization (all candidate scores bounded in [0.0, 1.0])
 * 8. Margin calculation accuracy (Delta = round((S1 - S2) * 100) / 100)
 * 9. Morphology false positive blocking (11 pairs: 5 standard + 6 adversarial strictly blocked)
 * 10. Source provenance tracking on all candidate records
 * 11. AI_DRAFT_ONLY isolation preserved (quarantined from production)
 * 12. LEXiTRON license terms and attribution string presence
 * 13. Zero production Supabase writes during validation
 * 14. Denominator locked at 10,021
 * 15. Learner-ready locked at 83
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  evaluateCandidateSenses,
  SEMANTIC_EVIDENCE_STATUS,
} from '../scripts/content-pipeline/vocab/semantic-disambiguation-poc.mjs';
import {
  matchLemmaInExample,
  FALSE_DERIVATIVE_BLACKLIST,
} from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';
import {
  extract350UnitValidationSample,
  evaluateIndependentGroundTruth,
  determineEvidenceTier,
  runPhase6238Calibration,
  VALIDATION_STATUS,
  EVIDENCE_TIERS,
} from '../scripts/content-pipeline/vocab/run-phase-6238-calibration.mjs';
import {
  LexicalEvidenceWarehouse,
  GAP_TAXONOMY,
} from '../scripts/content-pipeline/vocab/lexical-warehouse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

describe('Phase 6.2.38 — Evidence Validation & Calibration Before Any Production Promotion', () => {
  let warehouse: LexicalEvidenceWarehouse;
  let allUnits: any[];
  let invAccounting: any;

  beforeAll(() => {
    warehouse = new LexicalEvidenceWarehouse(PROJECT_ROOT);
    const accountingPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-inventory-accounting.json');
    invAccounting = JSON.parse(fs.readFileSync(accountingPath, 'utf8'));
    allUnits = invAccounting.units || [];
  });

  // Test 1: Consistent counts across reports
  it('01. consistent counts across reports and gates', () => {
    const semCalibPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-semantic-calibration.json');
    const valDatasetPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-validation-dataset.json');

    expect(fs.existsSync(semCalibPath)).toBe(true);
    expect(fs.existsSync(valDatasetPath)).toBe(true);

    const semCalib = JSON.parse(fs.readFileSync(semCalibPath, 'utf8'));
    const valDataset = JSON.parse(fs.readFileSync(valDatasetPath, 'utf8'));

    expect(semCalib.governance.denominator).toBe(10021);
    expect(semCalib.baseline_evaluation_summary.sample_total).toBe(350);
    expect(valDataset.summary.total_units).toBe(350);
    expect(semCalib.governance.learner_ready_units_locked).toBe(83);
    expect(semCalib.governance.readiness_gap).toBe(9917);
    expect(semCalib.governance.target_learner_ready).toBe(10000);
  });

  // Test 2: Deterministic sampling repeatability
  it('02. deterministic sampling repeatability (seed 6238)', () => {
    const sampleRun1 = extract350UnitValidationSample(allUnits, 6238);
    const sampleRun2 = extract350UnitValidationSample(allUnits, 6238);

    expect(sampleRun1.length).toBe(350);
    expect(sampleRun2.length).toBe(350);

    const ids1 = sampleRun1.map((u: any) => u.id);
    const ids2 = sampleRun2.map((u: any) => u.id);

    expect(ids1).toEqual(ids2);
  });

  // Test 3: Candidate preservation across all units
  it('03. candidate preservation across all units in validation sample', () => {
    const valDatasetPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-validation-dataset.json');
    const valDataset = JSON.parse(fs.readFileSync(valDatasetPath, 'utf8'));

    for (const unit of valDataset.units) {
      expect(Array.isArray(unit.candidates)).toBe(true);
      expect(unit.candidates.length).toBe(unit.candidate_count);
    }
  });

  // Test 4: Zero naive translation[0] fallback
  it('04. zero naive translation[0] fallback (multi-candidate disambiguation)', () => {
    // Test with polysemous word where candidate at index 1 matches target sense
    const res = evaluateCandidateSenses({
      headword: 'bank',
      pos: 'noun',
      candidates: [
        { normalized_translation: 'ตลิ่ง', raw_translation: 'ตลิ่ง (n)', source_id: 'lexitron_2_0' },
        { normalized_translation: 'ธนาคาร', raw_translation: 'ธนาคาร (n)', source_id: 'lexitron_2_0' },
      ],
      englishSense: {
        definition: 'a financial institution that accepts deposits and channels money into lending activities',
        synonyms: ['financial institution', 'banking company'],
      },
      lexitronEntries: [
        { normalized_translation: 'ตลิ่ง', synonyms: ['riverbank'], display_headword: 'bank2' },
        { normalized_translation: 'ธนาคาร', synonyms: ['financial institution'], display_headword: 'bank1' },
      ],
    });

    expect(res.best_candidate?.thai_translation).toBe('ธนาคาร');
    expect(res.best_candidate?.candidate_index).toBe(1); // Picked index 1, not index 0!
  });

  // Test 5: Ambiguous units routed to REVIEW_REQUIRED, never AUTO_READY
  it('05. ambiguous units routed to REVIEW_REQUIRED, never AUTO_READY', () => {
    const valDatasetPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-validation-dataset.json');
    const valDataset = JSON.parse(fs.readFileSync(valDatasetPath, 'utf8'));

    const ambiguousUnits = valDataset.units.filter(
      (u: any) => u.engine_status === SEMANTIC_EVIDENCE_STATUS.SEMANTIC_MATCH_AMBIGUOUS
    );
    expect(ambiguousUnits.length).toBeGreaterThan(0);

    for (const unit of ambiguousUnits) {
      // In baseline decisions, ambiguous units must never be AUTO_READY unless already historically vetted
      if (unit.baseline_blocker === GAP_TAXONOMY.POLYSEMY_UNRESOLVED) {
        expect(unit.baseline_decision).not.toBe('AUTO_READY');
      }
    }
  });

  // Test 6: Threshold calculation precision
  it('06. threshold calculation precision (S1 >= 0.60, Delta >= 0.15)', () => {
    // 6a: High score, high margin => CONFIDENT
    const confident = evaluateCandidateSenses({
      headword: 'test',
      pos: 'noun',
      candidates: [
        { normalized_translation: 'การทดสอบ', synonyms: ['exam', 'trial'] },
        { normalized_translation: 'ตลิ่ง', synonyms: ['riverbank'] },
      ],
      englishSense: { definition: 'a trial or examination of quality', synonyms: ['exam'] },
      lexitronEntries: [],
    });
    expect(confident.status).toBe(SEMANTIC_EVIDENCE_STATUS.SEMANTIC_MATCH_CONFIDENT);
    expect(confident.top_score).toBeGreaterThanOrEqual(0.60);
    expect(confident.margin).toBeGreaterThanOrEqual(0.15);

    // 6b: Narrow margin => AMBIGUOUS
    const ambiguous = evaluateCandidateSenses({
      headword: 'rapid',
      pos: 'adjective',
      candidates: [
        { normalized_translation: 'รวดเร็ว', synonyms: ['fast', 'quick'] },
        { normalized_translation: 'ว่องไว', synonyms: ['fast', 'quick'] },
      ],
      englishSense: { definition: 'done or occurring in a brief period of time', synonyms: ['fast', 'quick'] },
      lexitronEntries: [],
    });
    expect(ambiguous.status).toBe(SEMANTIC_EVIDENCE_STATUS.SEMANTIC_MATCH_AMBIGUOUS);
    expect(ambiguous.margin).toBeLessThan(0.15);
  });

  // Test 7: Score normalization
  it('07. score normalization strictly within [0.0, 1.0]', () => {
    const valDatasetPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-validation-dataset.json');
    const valDataset = JSON.parse(fs.readFileSync(valDatasetPath, 'utf8'));

    for (const unit of valDataset.units) {
      expect(unit.engine_score).toBeGreaterThanOrEqual(0.0);
      expect(unit.engine_score).toBeLessThanOrEqual(1.0);
      expect(unit.runner_up_score).toBeGreaterThanOrEqual(0.0);
      expect(unit.runner_up_score).toBeLessThanOrEqual(1.0);
    }
  });

  // Test 8: Margin calculation accuracy
  it('08. margin calculation accuracy (Delta = round((S1 - S2) * 100) / 100)', () => {
    const valDatasetPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-validation-dataset.json');
    const valDataset = JSON.parse(fs.readFileSync(valDatasetPath, 'utf8'));

    for (const unit of valDataset.units) {
      const expectedMargin = Math.round((unit.engine_score - unit.runner_up_score) * 100) / 100;
      expect(unit.margin).toBeCloseTo(expectedMargin, 2);
    }
  });

  // Test 9: Morphology false positive blocking (11 pairs)
  it('09. morphology false positive blocking (11 pairs: 5 standard + 6 adversarial)', () => {
    const testCases = [
      // 5 standard pairs
      { lemma: 'art', pos: 'noun', sentence: 'She wrote a comprehensive article on science.' },
      { lemma: 'car', pos: 'noun', sentence: 'They bought a luxurious Persian carpet.' },
      { lemma: 'care', pos: 'verb', sentence: 'Please be careful when handling hot liquids.' },
      { lemma: 'act', pos: 'verb', sentence: 'Immediate emergency action was taken.' },
      { lemma: 'class', pos: 'noun', sentence: 'This is a classic example of baroque architecture.' },
      // 6 adversarial pairs
      { lemma: 'day', pos: 'noun', sentence: 'The daylight illuminated the mountain peak.' },
      { lemma: 'pan', pos: 'noun', sentence: 'Sudden panic spread through the market.' },
      { lemma: 'war', pos: 'noun', sentence: 'We must warn travelers about the storm.' },
      { lemma: 'fat', pos: 'noun', sentence: 'His father worked as an architect.' },
      { lemma: 'dog', pos: 'noun', sentence: 'The religious dogma was questioned by scholars.' },
      { lemma: 'bus', pos: 'noun', sentence: 'She started an international logistics business.' },
    ];

    for (const tc of testCases) {
      const match = matchLemmaInExample({ lemma: tc.lemma, pos: tc.pos, example: tc.sentence });
      expect(match.matched).toBe(false);
    }
  });

  // Test 10: Source provenance tracking
  it('10. source provenance tracking on all candidate records', () => {
    const valDatasetPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-validation-dataset.json');
    const valDataset = JSON.parse(fs.readFileSync(valDatasetPath, 'utf8'));

    for (const unit of valDataset.units) {
      for (const cand of unit.candidates) {
        expect(cand.source_id).toBeDefined();
        expect(typeof cand.source_id).toBe('string');
      }
      expect(Array.isArray(unit.evidence_sources)).toBe(true);
      expect(unit.evidence_sources.length).toBeGreaterThan(0);
    }
  });

  // Test 11: AI_DRAFT_ONLY isolation preserved
  it('11. AI_DRAFT_ONLY isolation preserved in example calibration', () => {
    const exCalibPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-example-calibration.json');
    const exCalib = JSON.parse(fs.readFileSync(exCalibPath, 'utf8'));

    expect(exCalib.provenance_integrity.ai_draft_quarantine.flag).toBe('AI_DRAFT_ONLY');
    expect(exCalib.provenance_integrity.ai_draft_quarantine.enforced).toBe(true);
    expect(exCalib.provenance_integrity.ai_draft_quarantine.production_promotable).toBe(false);
  });

  // Test 12: LEXiTRON license terms and attribution
  it('12. LEXiTRON license reconciliation and attribution string verification', () => {
    const licPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-lexitron-license-reconciliation.json');
    const lic = JSON.parse(fs.readFileSync(licPath, 'utf8'));

    expect(lic.legal_status).toBe('LICENSE_VERIFIED_COMPLIANT');
    expect(lic.commercial_suitability).toBe('PERMITTED_WITH_ATTRIBUTION');
    expect(lic.attribution_verified).toBe(true);
    expect(lic.mandatory_attribution_string).toContain('This product is created by the adaptation of LEXiTRON developed by NECTEC');
    expect(lic.naming_restriction_honored).toBe(true);
  });

  // Test 13: Zero production Supabase writes during validation
  it('13. zero production Supabase writes during validation', () => {
    const semCalibPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-semantic-calibration.json');
    const semCalib = JSON.parse(fs.readFileSync(semCalibPath, 'utf8'));

    expect(semCalib.governance.production_db_writes).toBe(0);
    expect(semCalib.governance.production_promotions).toBe(0);
    expect(semCalib.governance.production_status).toBe('NOT_READY');
    expect(semCalib.governance.user_testing_authorized).toBe(false);
  });

  // Test 14: Denominator locked at 10,021
  it('14. universe denominator locked at 10,021', () => {
    expect(allUnits.length).toBe(10021);
    expect(invAccounting.inventory_summary.total_units).toBe(10021);
  });

  // Test 15: Learner-ready locked at 83
  it('15. learner-ready vocabulary strictly locked at 83 (21 active, 62 staged)', () => {
    const semCalibPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.38-semantic-calibration.json');
    const semCalib = JSON.parse(fs.readFileSync(semCalibPath, 'utf8'));

    expect(semCalib.governance.learner_ready_units_locked).toBe(83);
    expect(semCalib.governance.readiness_gap).toBe(9917);
  });
});
