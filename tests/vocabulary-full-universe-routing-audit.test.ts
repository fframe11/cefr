/**
 * Phase 6.2.39-R1 — Full-Universe Routing Logic Audit Test Suite
 *
 * 14 Mandatory Verification Tests:
 * 1. AUTO_CANDIDATE has zero hard blockers (0 hidden blockers across all 342 units)
 * 2. REVIEW_REQUIRED has sufficient evidence for human decision
 * 3. HOLD has insufficient evidence or hard blocker
 * 4. AI examples never satisfy attested evidence
 * 5. Semantic threshold exact (S1 >= 0.65 & Delta >= 0.15)
 * 6. No translations[0] heuristic fallback
 * 7. Morphology false-positive suite 11/11 blocked
 * 8. Blocker flags remain multidimensional
 * 9. Primary blocker remains deterministic (mutually exclusive sum = 10,021)
 * 10. All 10,021 units remain accounted for
 * 11. No duplicate canonical IDs
 * 12. No missing canonical IDs
 * 13. Production mutations = 0 (DB writes = 0, schema changes = 0, promotions = 0)
 * 14. Learner-ready locked at 83, gap 9,917, status NOT_READY
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ROUTING_STATUS,
  PRIMARY_BLOCKER,
  ADVERSARIAL_MORPHOLOGY_PAIRS,
} from '../scripts/content-pipeline/vocab/run-phase-6239-routing.mjs';
import { matchLemmaInExample } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';
import { runPhase6239R1Audit } from '../scripts/content-pipeline/vocab/run-phase-6239-r1-audit.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

describe('Phase 6.2.39-R1 — Full-Universe Routing Logic Audit', () => {
  let report: any;
  let baseline: any;
  let auditReport: any;
  let units: any[];
  let baselineUnits: any[];

  beforeAll(() => {
    const reportPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json');
    const baselinePath = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-inventory-accounting.json');
    const auditPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.39-r1-routing-audit.json');

    expect(fs.existsSync(reportPath)).toBe(true);
    expect(fs.existsSync(baselinePath)).toBe(true);
    expect(fs.existsSync(auditPath)).toBe(true);

    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    auditReport = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

    units = report.units || [];
    baselineUnits = baseline.units || [];
  });

  // Test 1: AUTO_CANDIDATE has zero hard blockers
  it('01. AUTO_CANDIDATE has zero hard blockers (0 hidden blockers across all 342 units)', () => {
    const autoUnits = units.filter(u => u.routing_status === ROUTING_STATUS.AUTO_CANDIDATE);
    expect(autoUnits.length).toBe(342);

    for (const u of autoUnits) {
      expect(u.semantic_score).toBeGreaterThanOrEqual(0.65);
      expect(u.semantic_margin).toBeGreaterThanOrEqual(0.15);
      expect(u.semantic_status).toBe('SEMANTIC_MATCH_CONFIDENT');
      expect(['EXAMPLE_EXACT', 'EXAMPLE_INFLECTED']).toContain(u.example_status);
      expect(u.blocker_flags.length).toBe(0);
      expect(u.primary_blocker).toBe(PRIMARY_BLOCKER.NONE);
      expect(u.source_provenance?.dictionary_sources?.length).toBeGreaterThan(0);
      expect(u.source_provenance?.is_synthetic).toBe(false);
      expect(u.source_provenance?.source_grounded).toBe(true);
    }

    expect(auditReport.auto_candidate_audit.hidden_blocker_count).toBe(0);
    expect(auditReport.auto_candidate_audit.every_gate_passed_count).toBe(342);
  });

  // Test 2: REVIEW_REQUIRED has sufficient evidence for human decision
  it('02. REVIEW_REQUIRED has sufficient evidence for human decision', () => {
    const reviewUnits = units.filter(u => u.routing_status === ROUTING_STATUS.REVIEW_REQUIRED);
    expect(reviewUnits.length).toBe(1196);

    for (const u of reviewUnits) {
      // Must not have CEFR conflict or source conflict
      expect(u.blocker_flags).not.toContain('CEFR_CONFLICT');
      expect(u.blocker_flags).not.toContain('SOURCE_CONFLICT');
      expect(u.blocker_flags).not.toContain('THAI_NOT_FOUND');
      expect(u.blocker_flags).not.toContain('SENSE_NOT_FOUND');
      expect(u.blocker_flags).not.toContain('LEXICON_NOT_FOUND');

      // Must have semantic match (confident or ambiguous, not no_evidence)
      expect(['SEMANTIC_MATCH_CONFIDENT', 'SEMANTIC_MATCH_AMBIGUOUS']).toContain(u.semantic_status);

      // Must have attested example or review example
      expect(['EXAMPLE_EXACT', 'EXAMPLE_INFLECTED', 'EXAMPLE_REVIEW']).toContain(u.example_status);
    }
  });

  // Test 3: HOLD has insufficient evidence or hard blocker
  it('03. HOLD has insufficient evidence or hard blocker', () => {
    const holdUnits = units.filter(u => u.routing_status === ROUTING_STATUS.HOLD);
    expect(holdUnits.length).toBe(8483);

    for (const u of holdUnits) {
      const hasDeficit = (
        u.blocker_flags.includes('EXAMPLE_NOT_FOUND') ||
        u.blocker_flags.includes('SEMANTIC_NO_EVIDENCE') ||
        u.blocker_flags.includes('THAI_NOT_FOUND') ||
        u.blocker_flags.includes('SENSE_NOT_FOUND') ||
        u.blocker_flags.includes('CEFR_CONFLICT') ||
        u.blocker_flags.includes('SOURCE_CONFLICT') ||
        u.blocker_flags.includes('LEXICON_NOT_FOUND') ||
        u.blocker_flags.includes('IPA_NOT_FOUND') ||
        u.semantic_status === 'SEMANTIC_MATCH_NO_EVIDENCE'
      );
      expect(hasDeficit).toBe(true);
    }
  });

  // Test 4: AI examples never satisfy attested evidence
  it('04. AI examples never satisfy attested evidence', () => {
    expect(report.ai_draft_quarantine.isolation_verified).toBe(true);
    expect(report.ai_draft_quarantine.synthetic_examples_accepted_as_attested).toBe(0);

    for (const u of units) {
      expect(u.source_provenance.is_synthetic).toBe(false);
      expect(u.source_provenance.source_grounded).toBe(true);
    }
  });

  // Test 5: Semantic threshold exact (S1 >= 0.65 & Delta >= 0.15)
  it('05. semantic threshold exact (S1 >= 0.65 & Delta >= 0.15)', () => {
    const thresholds = report.semantic_disambiguation_distribution.calibrated_thresholds;
    expect(thresholds.min_top_score_S1).toBe(0.65);
    expect(thresholds.min_margin_delta).toBe(0.15);
    expect(thresholds.ambiguous_score_floor).toBe(0.40);

    for (const u of units) {
      if (u.semantic_status === 'SEMANTIC_MATCH_CONFIDENT') {
        expect(u.semantic_score).toBeGreaterThanOrEqual(0.65);
        expect(u.semantic_margin).toBeGreaterThanOrEqual(0.15);
      } else if (u.semantic_status === 'SEMANTIC_MATCH_AMBIGUOUS') {
        expect(u.semantic_score).toBeGreaterThanOrEqual(0.40);
        const failsConfident = u.semantic_score < 0.65 || u.semantic_margin < 0.15;
        expect(failsConfident).toBe(true);
      } else if (u.semantic_status === 'SEMANTIC_MATCH_NO_EVIDENCE') {
        expect(u.semantic_score).toBeLessThan(0.40);
      }
    }
  });

  // Test 6: No translations[0] heuristic fallback
  it('06. no translations[0] heuristic fallback', () => {
    const multiCandUnits = units.filter(u => u.source_provenance?.candidate_count > 1);
    expect(multiCandUnits.length).toBeGreaterThan(0);

    for (const u of multiCandUnits.slice(0, 100)) {
      expect(typeof u.semantic_score).toBe('number');
      expect(typeof u.runner_up_score).toBe('number');
      expect(typeof u.semantic_margin).toBe('number');
      expect(u.semantic_margin).toBeCloseTo(u.semantic_score - u.runner_up_score, 2);
    }
  });

  // Test 7: Morphology false-positive suite 11/11 blocked
  it('07. morphology false-positive suite 11/11 blocked', () => {
    expect(ADVERSARIAL_MORPHOLOGY_PAIRS.length).toBe(11);
    expect(report.morphology_safety.all_blocked).toBe(true);
    expect(auditReport.morphology_adversarial_suite.all_blocked).toBe(true);

    for (const pair of ADVERSARIAL_MORPHOLOGY_PAIRS) {
      const res = matchLemmaInExample({ lemma: pair.lemma, pos: pair.pos, example: pair.sentence });
      expect(res.matched).toBe(false);
    }
  });

  // Test 8: Blocker flags remain multidimensional
  it('08. blocker flags remain multidimensional', () => {
    const overlapDist = report.blocker_accounting.blocker_overlap_distribution;
    expect(overlapDist['0_blockers']).toBe(342);
    expect(overlapDist['1_blocker']).toBe(2921);
    expect(overlapDist['2_blockers']).toBe(4703);
    expect(overlapDist['3_or_more_blockers']).toBe(2055);
    expect(overlapDist['0_blockers'] + overlapDist['1_blocker'] + overlapDist['2_blockers'] + overlapDist['3_or_more_blockers']).toBe(10021);

    // Multi-blocker units retain array of multiple flags
    const twoBlockerUnits = units.filter(u => u.blocker_flags.length === 2);
    expect(twoBlockerUnits.length).toBe(4703);
    for (const u of twoBlockerUnits.slice(0, 50)) {
      expect(u.blocker_flags.length).toBe(2);
      expect(u.blocker_flags[0]).not.toEqual(u.blocker_flags[1]);
    }
  });

  // Test 9: Primary blocker remains deterministic (mutually exclusive sum = 10,021)
  it('09. primary blocker remains deterministic (mutually exclusive sum = 10,021)', () => {
    const primaryCounts = report.blocker_accounting.primary_blockers;
    const sum = Object.values(primaryCounts).reduce((a: any, b: any) => a + b, 0);
    expect(sum).toBe(10021);

    expect(primaryCounts.NONE).toBe(342);
    expect(primaryCounts.EXAMPLE_NOT_FOUND).toBe(4463);
    expect(primaryCounts.SEMANTIC_NO_EVIDENCE).toBe(2624);
    expect(primaryCounts.POLYSEMY_UNRESOLVED).toBe(1200);
    expect(primaryCounts.THAI_NOT_FOUND).toBe(879);
    expect(primaryCounts.SENSE_NOT_FOUND).toBe(405);
    expect(primaryCounts.CEFR_CONFLICT).toBe(100);
    expect(primaryCounts.IPA_MULTI_VARIANT).toBe(6);
    expect(primaryCounts.IPA_NOT_FOUND).toBe(2);
  });

  // Test 10: All 10,021 units remain accounted for
  it('10. all 10,021 units remain accounted for across transition matrix', () => {
    expect(units.length).toBe(10021);
    expect(baselineUnits.length).toBe(10021);

    const tm = auditReport.review_required_vs_hold_audit.transition_matrix_9_cells;
    const tmSum = Object.values(tm).reduce((a: any, b: any) => a + b, 0);
    expect(tmSum).toBe(10021);

    expect(tm['AUTO_READY -> AUTO_CANDIDATE']).toBe(209);
    expect(tm['AUTO_READY -> REVIEW_REQUIRED']).toBe(585);
    expect(tm['AUTO_READY -> HOLD']).toBe(1035);
    expect(tm['REVIEW_REQUIRED -> AUTO_CANDIDATE']).toBe(133);
    expect(tm['REVIEW_REQUIRED -> REVIEW_REQUIRED']).toBe(606);
    expect(tm['REVIEW_REQUIRED -> HOLD']).toBe(3712);
    expect(tm['HOLD -> AUTO_CANDIDATE']).toBe(0);
    expect(tm['HOLD -> REVIEW_REQUIRED']).toBe(5);
    expect(tm['HOLD -> HOLD']).toBe(3736);
  });

  // Test 11: No duplicate canonical IDs
  it('11. no duplicate canonical IDs', () => {
    const ids = new Set();
    for (const u of units) {
      expect(ids.has(u.canonical_id)).toBe(false);
      ids.add(u.canonical_id);
    }
    expect(ids.size).toBe(10021);
  });

  // Test 12: No missing canonical IDs
  it('12. no missing canonical IDs compared to baseline', () => {
    const reportIds = new Set(units.map(u => u.canonical_id));
    for (const b of baselineUnits) {
      expect(reportIds.has(b.id)).toBe(true);
    }
  });

  // Test 13: Production mutations = 0
  it('13. production mutations = 0 (DB writes = 0, schema changes = 0, promotions = 0)', () => {
    const g = report.governance;
    expect(g.production_db_writes).toBe(0);
    expect(g.schema_changes).toBe(0);
    expect(g.lifecycle_promotions).toBe(0);
  });

  // Test 14: Learner-ready = 83, gap 9,917, status NOT_READY
  it('14. learner-ready locked at 83, gap 9,917, status NOT_READY', () => {
    const g = report.governance;
    expect(g.learner_ready_units_locked).toBe(83);
    expect(g.learner_ready_breakdown.active_production).toBe(21);
    expect(g.learner_ready_breakdown.approved_staging).toBe(62);
    expect(g.readiness_gap).toBe(9917);
    expect(g.target_learner_ready).toBe(10000);
    expect(g.production_status).toBe('NOT_READY');
    expect(g.user_testing_authorized).toBe(false);
  });

  // Test 15: Final Audit Verdict is ROUTING_LOGIC_CONFIRMED
  it('15. final audit verdict is strictly ROUTING_LOGIC_CONFIRMED', () => {
    expect(auditReport.final_verdict).toBe('ROUTING_LOGIC_CONFIRMED');
    expect(auditReport.verdict_constraints.is_production_ready).toBe(false);
    expect(auditReport.verdict_constraints.is_user_testing_ready).toBe(false);
  });
});
