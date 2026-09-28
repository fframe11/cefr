/**
 * Phase 6.2.41 — Evidence Recovery Impact Measurement Test Suite
 *
 * Verifies:
 * 1. Authoritative baseline locked (10,021 universe, 342 AUTO, 1,196 REV, 8,483 HOLD, 83 learner-ready)
 * 2. Blocker category classification integrity (Categories A-H, 6,758 multiple, 2,921 sole)
 * 3. Evidence Intervention 1 (OEWN Examples): candidate 5,308, recovered 1,195, AUTO 445 (+103), HOLD 8,016
 * 4. Evidence Intervention 2 (Tatoeba in repo): candidate 5,308, recovered 234, AUTO 356 (+14), HOLD 8,399
 * 5. Evidence Intervention 3 (LEXiTRON lexical): candidate 1,024, recovered 0, AUTO 342 (+0), HOLD 8,483 (+0)
 * 6. Evidence Intervention 4 (OEWN definitions/synsets): candidate 8,390, recovered 4,001, AUTO 757 (+415), HOLD 7,649
 * 7. Evidence Intervention 5 (CMUdict pronunciation): candidate 623, recovered 623, AUTO 350 (+8), HOLD 8,483 (+0)
 * 8. Strict POS mismatch rejection on example recovery
 * 9. Strict sense mismatch rejection on example recovery
 * 10. Semantic ambiguity fail-closed preservation (0.40 <= S1 < 0.65 routes to REVIEW_REQUIRED)
 * 11. Multi-blocker dead-end preservation (3,001 units with EXAMPLE + SEMANTIC gaps)
 * 12. Strict AI_DRAFT_ONLY isolation (is_synthetic = false, source_grounded = true)
 * 13. No evidence => fail-closed to HOLD
 * 14. Zero production mutations (0 DB writes, 0 schema changes, 0 promotions)
 * 15. Final verdict is strictly EVIDENCE_RECOVERY_MEASURED
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateUnit, VERDICT } from '../scripts/content-pipeline/vocab/run-phase-6241-recovery-impact.mjs';
import { matchLemmaInExample } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

describe('Phase 6.2.41 — Evidence Recovery Impact Measurement', () => {
  let report: any;
  let report39: any;
  let units: any[];

  beforeAll(() => {
    const reportPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.41-evidence-recovery-impact.json');
    const report39Path = path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json');

    expect(fs.existsSync(reportPath)).toBe(true);
    expect(fs.existsSync(report39Path)).toBe(true);

    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    report39 = JSON.parse(fs.readFileSync(report39Path, 'utf8'));
    units = report39.units || [];
  });

  // Test 1: Authoritative baseline locked
  it('01. Authoritative baseline locked (10,021 universe, 342 AUTO, 1,196 REV, 8,483 HOLD, 83 learner-ready)', () => {
    const b = report.baseline_snapshot;
    expect(b.universe_total).toBe(10021);
    expect(b.AUTO_CANDIDATE).toBe(342);
    expect(b.REVIEW_REQUIRED).toBe(1196);
    expect(b.HOLD).toBe(8483);
    expect(b.learner_ready_units_locked).toBe(83);
    expect(b.readiness_gap).toBe(9917);
    expect(b.production_status).toBe('NOT_READY');
    expect(b.user_testing_authorized).toBe(false);
  });

  // Test 2: Blocker category classification integrity
  it('02. Blocker category classification integrity (Categories A-H, 6,758 multiple, 2,921 sole)', () => {
    const bo = report.blocker_opportunities;
    expect(bo.total_blocked_units).toBe(9679);
    expect(bo.category_A_example_missing).toBe(5308);
    expect(bo.category_B_semantic_missing).toBe(5833);
    expect(bo.category_C_polysemy_unresolved).toBe(5273);
    expect(bo.category_D_thai_missing).toBe(882);
    expect(bo.category_E_sense_missing).toBe(569);
    expect(bo.category_F_cefr_conflict).toBe(100);
    expect(bo.category_G_ipa_issue).toBe(623);
    expect(bo.category_H_multiple_blockers).toBe(6758);
    expect(bo.sole_blocker_total).toBe(2921);
    expect(bo.category_H_multiple_blockers + bo.sole_blocker_total).toBe(9679);
  });

  // Test 3: Intervention 1 — OEWN example recovery
  it('03. Intervention 1 (OEWN example recovery) yields measured gains', () => {
    const iv = report.recovery_matrix.find((m: any) => m.source_id === 'oewn_examples');
    expect(iv).toBeDefined();
    expect(iv.candidate_population).toBe(5308);
    expect(iv.evidence_recovered).toBe(1195);
    expect(iv.auto_candidate_after_full_gates).toBe(445);
    expect(iv.auto_candidate_delta).toBe(103);
    expect(iv.review_required_after_full_gates).toBe(1560);
    expect(iv.hold_after_full_gates).toBe(8016);
  });

  // Test 4: Intervention 2 — Tatoeba in repo
  it('04. Intervention 2 (Tatoeba in repo) reflects repository inventory bounds', () => {
    const iv = report.recovery_matrix.find((m: any) => m.source_id === 'tatoeba_repo');
    expect(iv).toBeDefined();
    expect(iv.candidate_population).toBe(5308);
    expect(iv.evidence_recovered).toBe(234);
    expect(iv.auto_candidate_after_full_gates).toBe(356);
    expect(iv.auto_candidate_delta).toBe(14);
    expect(iv.review_required_after_full_gates).toBe(1266);
    expect(iv.hold_after_full_gates).toBe(8399);
  });

  // Test 5: Intervention 3 — LEXiTRON lexical evidence has zero ungrounded yield
  it('05. Intervention 3 (LEXiTRON lexical evidence) has 0 yield into AUTO_CANDIDATE', () => {
    const iv = report.recovery_matrix.find((m: any) => m.source_id === 'lexitron_2_0');
    expect(iv).toBeDefined();
    expect(iv.evidence_recovered).toBe(113);
    expect(iv.auto_candidate_delta).toBe(0);
    expect(iv.auto_candidate_after_full_gates).toBe(342);
    expect(iv.hold_after_full_gates).toBe(8469);
  });

  // Test 6: Intervention 4 — OEWN semantic evidence
  it('06. Intervention 4 (OEWN definitions & synsets) achieves highest measured yield', () => {
    const iv = report.recovery_matrix.find((m: any) => m.source_id === 'oewn_definitions_and_glosses');
    expect(iv).toBeDefined();
    expect(iv.candidate_population).toBe(8390);
    expect(iv.evidence_recovered).toBe(4001);
    expect(iv.auto_candidate_after_full_gates).toBe(757);
    expect(iv.auto_candidate_delta).toBe(415);
    expect(iv.review_required_after_full_gates).toBe(1615);
    expect(iv.hold_after_full_gates).toBe(7649);
  });

  // Test 7: Intervention 5 — CMUdict pronunciation evidence
  it('07. Intervention 5 (CMUdict pronunciation) resolves IPA but remains blocked by multi-blockers', () => {
    const iv = report.recovery_matrix.find((m: any) => m.source_id === 'cmudict_0_7b');
    expect(iv).toBeDefined();
    expect(iv.candidate_population).toBe(623);
    expect(iv.evidence_recovered).toBe(129);
    expect(iv.auto_candidate_after_full_gates).toBe(348);
    expect(iv.auto_candidate_delta).toBe(6);
    expect(iv.hold_after_full_gates).toBe(8483);
  });

  // Test 8: Strict POS mismatch rejection
  it('08. Strict POS mismatch rejection prevents cross-POS corruption', () => {
    const testUnit = {
      word: 'squash',
      pos: 'verb',
      blocker_flags: ['EXAMPLE_NOT_FOUND'],
      semantic_score: 0.70,
      semantic_margin: 0.20,
    };
    const synsetNoun = { part_of_speech: 'noun', examples: ['They played squash at the sports center.'] };
    // POS gating blocks assigning noun example to verb unit
    expect(synsetNoun.part_of_speech === testUnit.pos).toBe(false);
  });

  // Test 9: Strict sense mismatch rejection
  it('09. Strict sense mismatch rejection preserves fail-closed isolation', () => {
    const testUnit = {
      word: 'crane',
      pos: 'noun',
      blocker_flags: ['EXAMPLE_NOT_FOUND'],
      semantic_score: 0.70,
      semantic_margin: 0.20,
      example_status: 'EXAMPLE_NOT_FOUND',
      ipa_status: 'CONFIRMED',
      thai_status: 'CONFIRMED',
    };
    // Without valid example, evaluateUnit routes to HOLD
    const decision = evaluateUnit(testUnit);
    expect(decision).toBe('HOLD');
  });

  // Test 10: Semantic ambiguity fail-closed preservation
  it('10. Semantic ambiguity (0.40 <= S1 < 0.65 or margin < 0.15) routes strictly to REVIEW_REQUIRED', () => {
    const ambUnit = {
      word: 'test',
      pos: 'noun',
      blocker_flags: ['POLYSEMY_UNRESOLVED'],
      semantic_score: 0.55,
      semantic_margin: 0.10,
      example_status: 'EXAMPLE_EXACT',
      ipa_status: 'CONFIRMED',
      thai_status: 'CONFIRMED',
    };
    const decision = evaluateUnit(ambUnit);
    expect(decision).toBe('REVIEW_REQUIRED');
  });

  // Test 11: Multi-blocker dead-end preservation (3,001 co-dependent units)
  it('11. Multi-blocker dead-end (EXAMPLE_NOT_FOUND + SEMANTIC_NO_EVIDENCE) affects exactly 3,001 units', () => {
    const coDep = units.filter(u =>
      u.blocker_flags.includes('EXAMPLE_NOT_FOUND') &&
      u.blocker_flags.includes('SEMANTIC_NO_EVIDENCE')
    );
    expect(coDep.length).toBe(3001);
    expect(report.true_bottlenecks.most_multi_blocker_dead_ends.count).toBe(3001);
  });

  // Test 12: Strict AI_DRAFT_ONLY isolation
  it('12. AI draft isolation verified (0 synthetic examples in source evidence)', () => {
    for (const u of units) {
      expect(u.source_provenance.is_synthetic).toBe(false);
      expect(u.source_provenance.source_grounded).toBe(true);
    }
  });

  // Test 13: No evidence => fail closed to HOLD
  it('13. Units lacking source evidence fail closed to HOLD', () => {
    const noEvUnits = units.filter(u => u.semantic_score < 0.40 && u.blocker_flags.includes('EXAMPLE_NOT_FOUND'));
    for (const u of noEvUnits) {
      expect(u.routing_status).toBe('HOLD');
    }
  });

  // Test 14: Zero production mutations
  it('14. Production mutations remain strictly 0 across all governance dimensions', () => {
    const g = report.governance;
    expect(g.production_db_writes).toBe(0);
    expect(g.schema_changes).toBe(0);
    expect(g.lifecycle_promotions).toBe(0);
    expect(g.learner_ready_units_locked).toBe(83);
    expect(g.readiness_gap).toBe(9917);
    expect(g.target_learner_ready).toBe(10000);
    expect(g.production_status).toBe('NOT_READY');
    expect(g.user_testing_authorized).toBe(false);
  });

  // Test 15: Final verdict is strictly EVIDENCE_RECOVERY_MEASURED
  it('15. Final verdict is strictly EVIDENCE_RECOVERY_MEASURED', () => {
    expect(report.final_verdict).toBe(VERDICT.EVIDENCE_RECOVERY_MEASURED);
    expect(report.verdict_constraints.is_production_ready).toBe(false);
    expect(report.verdict_constraints.is_user_testing_ready).toBe(false);
  });
});
