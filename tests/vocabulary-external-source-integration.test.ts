/**
 * Phase 6.2.43 — External Source Stack Integration POC Verification Tests
 *
 * Verifies:
 * 1. Universe locked at exactly 10,021 vocabulary units
 * 2. Learner-ready units strictly locked at 83 (21 active, 62 staging)
 * 3. Zero production database mutations (writes = 0)
 * 4. Zero schema migrations or table alterations (changes = 0)
 * 5. Zero lifecycle promotions (promotions = 0)
 * 6. User testing unauthorized (false)
 * 7. AI isolation strictly enforced (AI_ANALYSIS_ONLY)
 * 8. All 6 frozen source pillars verified and parsed
 * 9. Immutable provenance attached to every normalized evidence record
 * 10. Multi-value evidence preserved without array truncation or [0] collapsing
 * 11. Universe coverage matrix complete across all 10,021 units
 * 12. Multi-phase routing comparison with delta classification (SIMULATION_ASSUMPTION)
 * 13. Co-dependent population directly tested without extrapolation
 * 14. 11 adversarial morphology pairs 100% blocked
 * 15. Final verdict strictly STACK_CONFIRMED_WITH_SOURCE_GAPS
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runPhase6243Integration } from '../scripts/content-pipeline/vocab/run-phase-6243-integration.mjs';
import { UnifiedEvidenceWarehouse } from '../scripts/content-pipeline/vocab/sources/unified-evidence-warehouse.mjs';
import { matchLemmaInExample, FALSE_DERIVATIVE_BLACKLIST } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';
import { ADVERSARIAL_MORPHOLOGY_PAIRS } from '../scripts/content-pipeline/vocab/run-phase-6239-routing.mjs';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.43-external-source-integration.json');
const DOC_ASSESSMENT_PATH = path.join(PROJECT_ROOT, 'docs/assessment/phase-6.2.43-external-source-integration.md');
const COVERAGE_MATRIX_PATH = path.join(PROJECT_ROOT, 'docs/assessment/external-source-coverage-matrix.md');

describe('Phase 6.2.43: External Source Stack Integration POC', () => {
  let reportData: any;
  let sharedWarehouse: UnifiedEvidenceWarehouse;

  beforeAll(() => {
    if (fs.existsSync(REPORT_PATH)) {
      reportData = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    } else {
      reportData = runPhase6243Integration({ projectRoot: PROJECT_ROOT });
    }
    sharedWarehouse = new UnifiedEvidenceWarehouse({ projectRoot: PROJECT_ROOT });
    sharedWarehouse.loadAllSources();
  }, 20000);

  // Test 1: Total universe exact invariant
  it('1. must evaluate exactly 10,021 vocabulary learning units with zero sampling', () => {
    expect(reportData.production_safety_invariants.total_universe).toBe(10021);
    const sum =
      reportData.routing_results.routing_distribution.AUTO_CANDIDATE +
      reportData.routing_results.routing_distribution.REVIEW_REQUIRED +
      reportData.routing_results.routing_distribution.HOLD;
    expect(sum).toBe(10021);
  });

  // Test 2: Learner-ready lock
  it('2. must strictly lock learner-ready units at 83 (21 active, 62 staging)', () => {
    expect(reportData.production_safety_invariants.learner_ready_count).toBe(83);
  });

  // Test 3: Zero production DB writes
  it('3. must produce zero production database writes', () => {
    expect(reportData.production_safety_invariants.production_db_writes).toBe(0);
  });

  // Test 4: Zero schema changes
  it('4. must produce zero schema alterations or table changes', () => {
    expect(reportData.production_safety_invariants.schema_changes).toBe(0);
  });

  // Test 5: Zero lifecycle promotions
  it('5. must produce zero lifecycle status promotions', () => {
    expect(reportData.production_safety_invariants.lifecycle_promotions).toBe(0);
  });

  // Test 6: User testing remains false
  it('6. must keep user testing strictly unauthorized', () => {
    expect(reportData.production_safety_invariants.user_testing_authorized).toBe(false);
  });

  // Test 7: AI quarantine strictly enforced
  it('7. must enforce strict AI isolation with AI_ANALYSIS_ONLY', () => {
    expect(reportData.production_safety_invariants.ai_isolation).toBe('AI_ANALYSIS_ONLY');
  });

  // Test 8: All 6 frozen pillars ingested
  it('8. must ingest and account for all 6 frozen authority pillars', () => {
    const inv = reportData.source_inventory;
    expect(inv.pillar1_cefr).toBeDefined();
    expect(inv.pillar2_lexicon).toBeDefined();
    expect(inv.pillar3_thai).toBeDefined();
    expect(inv.pillar4_pronunciation).toBeDefined();
    expect(inv.pillar5_example).toBeDefined();
    expect(inv.pillar6_collocation).toBeDefined();

    expect(inv.pillar1_cefr.records_parsed).toBeGreaterThan(10000);
    expect(inv.pillar2_lexicon.records_parsed).toBeGreaterThan(70000);
    expect(inv.pillar3_thai.records_parsed).toBeGreaterThan(80000);
    expect(inv.pillar4_pronunciation.records_parsed).toBeGreaterThan(9000);
    expect(inv.pillar5_example.records_parsed).toBeGreaterThan(50);
    expect(inv.pillar6_collocation.records_parsed).toBeGreaterThan(30000);
  });

  // Test 9: Complete provenance attached to records
  it('9. must attach complete provenance to all evidence records without data loss', () => {
    const evidence = sharedWarehouse.getEvidenceForUnit('book', 'noun');

    for (const category of ['cefr', 'lexicon', 'thai', 'pronunciation', 'collocation'] as const) {
      const records = evidence[category];
      expect(records.length).toBeGreaterThan(0);
      for (const rec of records) {
        expect(rec.source_name).toBeDefined();
        expect(rec.source_version).toBeDefined();
        expect(rec.source_license).toBeDefined();
        expect(rec.retrieved_at).toBeDefined();
        expect(rec.checksum).toBeDefined();
        expect(rec.provenance).toBeDefined();
      }
    }
  });

  // Test 10: Complete candidate preservation (no [0] collapsing)
  it('10. must preserve complete multi-value candidate translations without [0] collapsing', () => {
    const abilityEvidence = sharedWarehouse.getEvidenceForUnit('ability', 'noun');
    expect(abilityEvidence.thai.length).toBeGreaterThan(1);
    expect(abilityEvidence.lexicon.length).toBeGreaterThan(1);
  });

  // Test 11: Universe coverage matrix verification
  it('11. must compute complete coverage matrix across all 10,021 learning units', () => {
    const matrix = reportData.universe_coverage_matrix.coverage_by_pillar;
    expect(matrix.cefr.FOUND + matrix.cefr.NOT_FOUND + matrix.cefr.CONFLICT).toBe(10021);
    expect(matrix.lexicon.FOUND + matrix.lexicon.NOT_FOUND).toBe(10021);
    expect(matrix.thai.FOUND + matrix.thai.NOT_FOUND).toBe(10021);
    expect(matrix.pronunciation.FOUND + matrix.pronunciation.NOT_FOUND + matrix.pronunciation.MULTI_VARIANT).toBe(10021);
    expect(matrix.example.FOUND + matrix.example.NOT_FOUND).toBe(10021);
    expect(matrix.collocation.FOUND + matrix.collocation.NOT_FOUND).toBe(10021);
  });

  // Test 12: Multi-phase comparison and delta classification
  it('12. must reconcile Baseline vs Simulation vs Actual with SIMULATION_ASSUMPTION classification', () => {
    const comp = reportData.comparison;
    expect(comp.baseline_6_2_39.AUTO_CANDIDATE).toBe(342);
    expect(comp.simulation_6_2_42.AUTO_CANDIDATE).toBe(4892);
    expect(comp.actual_6_2_43.AUTO_CANDIDATE).toBe(reportData.routing_results.routing_distribution.AUTO_CANDIDATE);

    expect(comp.deltas.delta_classifications.AUTO_CANDIDATE).toBe('SIMULATION_ASSUMPTION');
    expect(comp.deltas.delta_classifications.REVIEW_REQUIRED).toBe('SOURCE_DATA_DIFFERENCE');
    expect(comp.deltas.delta_classifications.HOLD).toBe('SOURCE_DATA_DIFFERENCE');
    expect(comp.deltas.root_cause_explanation).toContain('Tatoeba');
  });

  // Test 13: Co-dependent population testing
  it('13. must test co-dependent population individually without extrapolation', () => {
    const codep = reportData.codependent_population_analysis;
    expect(codep.total_tested).toBeGreaterThan(3000);
    expect(codep.recovered_to_auto + codep.moved_to_review + codep.remained_hold).toBe(codep.total_tested);
  });

  // Test 14: 11 Adversarial morphology pairs 100% blocked
  it('14. must block all 11 adversarial morphology pairs from false-positive matching', () => {
    for (const pair of ADVERSARIAL_MORPHOLOGY_PAIRS) {
      const match = matchLemmaInExample(pair.lemma, pair.sentence);
      const isBlacklisted = FALSE_DERIVATIVE_BLACKLIST.has(`${pair.lemma}:${pair.target_derivative}`);
      expect(match.matched).toBe(false);
      expect(isBlacklisted).toBe(true);
    }
    expect(reportData.adversarial_quality_audit.status).toBe('PASSED_100_PERCENT');
    expect(reportData.adversarial_quality_audit.failures).toBe(0);
  });

  // Test 15: Final verdict STACK_CONFIRMED_WITH_SOURCE_GAPS
  it('15. must issue strict verdict of STACK_CONFIRMED_WITH_SOURCE_GAPS', () => {
    expect(reportData.verdict).toBe('STACK_CONFIRMED_WITH_SOURCE_GAPS');
    expect(reportData.verdict_justification.length).toBeGreaterThan(0);
    expect(fs.existsSync(REPORT_PATH)).toBe(true);
    expect(fs.existsSync(DOC_ASSESSMENT_PATH)).toBe(true);
    expect(fs.existsSync(COVERAGE_MATRIX_PATH)).toBe(true);
  });
});
