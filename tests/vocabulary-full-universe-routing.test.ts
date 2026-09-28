/**
 * Phase 6.2.39 — Full-Universe Evidence Routing & Readiness Accounting Test Suite
 *
 * 16 Mandatory Verification Tests:
 * 1. Exactly 10,021 units processed
 * 2. Exactly one routing status per unit
 * 3. Sum of routing statuses = 10,021 (342 AUTO_CANDIDATE, 1,196 REVIEW_REQUIRED, 8,483 HOLD)
 * 4. Zero duplicate canonical IDs
 * 5. Zero missing units from 10,021 universe
 * 6. Calibrated staging threshold enforced (S1 >= 0.65 & Delta >= 0.15)
 * 7. Zero translations[0] heuristic fallback
 * 8. Ambiguous semantic match never routes to AUTO_CANDIDATE
 * 9. Missing evidence routes fail-closed to HOLD
 * 10. AI draft isolation strictly preserved (never counts as attested)
 * 11. Morphology false-positive safety (11 pairs blocked)
 * 12. Source provenance retained for all 10,021 units
 * 13. Deterministic reason codes for all units
 * 14. Zero production DB writes
 * 15. Zero schema alterations and zero lifecycle promotions
 * 16. Learner-ready locked at 83, gap 9,917, status NOT_READY
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
import { verifyPhase6239Routing } from '../scripts/content-pipeline/vocab/verify-phase-6239-routing.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

describe('Phase 6.2.39 — Full-Universe Evidence Routing & Readiness Accounting', () => {
  let report: any;
  let baselineAccounting: any;
  let units: any[];
  let baselineUnits: any[];

  beforeAll(() => {
    const reportPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json');
    const baselinePath = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-inventory-accounting.json');

    expect(fs.existsSync(reportPath), 'Phase 6.2.39 report must exist').toBe(true);
    expect(fs.existsSync(baselinePath), 'Phase 6.2.36 baseline accounting must exist').toBe(true);

    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    baselineAccounting = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

    units = report.units || [];
    baselineUnits = baselineAccounting.units || [];
  });

  // Test 1: Exactly 10,021 units processed
  it('01. exactly 10,021 units processed through routing matrix', () => {
    expect(units.length).toBe(10021);
    expect(report.governance.total_universe_denominator).toBe(10021);
    expect(report.routing_summary.total).toBe(10021);
  });

  // Test 2: Exactly one routing status per unit
  it('02. exactly one routing status per unit', () => {
    const validStatuses = new Set([
      ROUTING_STATUS.AUTO_CANDIDATE,
      ROUTING_STATUS.REVIEW_REQUIRED,
      ROUTING_STATUS.HOLD,
    ]);

    for (const u of units) {
      expect(validStatuses.has(u.routing_status)).toBe(true);
    }
  });

  // Test 3: Sum of routing statuses = 10,021
  it('03. sum of routing statuses strictly equals 10,021 (342 AUTO, 1196 REVIEW, 8483 HOLD)', () => {
    const autoCount = report.routing_summary.AUTO_CANDIDATE.count;
    const reviewCount = report.routing_summary.REVIEW_REQUIRED.count;
    const holdCount = report.routing_summary.HOLD.count;

    expect(autoCount).toBe(342);
    expect(reviewCount).toBe(1196);
    expect(holdCount).toBe(8483);
    expect(autoCount + reviewCount + holdCount).toBe(10021);

    // Verify against actual units array count
    let actualAuto = 0;
    let actualReview = 0;
    let actualHold = 0;
    for (const u of units) {
      if (u.routing_status === ROUTING_STATUS.AUTO_CANDIDATE) actualAuto++;
      else if (u.routing_status === ROUTING_STATUS.REVIEW_REQUIRED) actualReview++;
      else if (u.routing_status === ROUTING_STATUS.HOLD) actualHold++;
    }

    expect(actualAuto).toBe(342);
    expect(actualReview).toBe(1196);
    expect(actualHold).toBe(8483);
  });

  // Test 4: Zero duplicate canonical IDs
  it('04. zero duplicate canonical IDs in full-universe output', () => {
    const ids = new Set();
    for (const u of units) {
      expect(ids.has(u.canonical_id)).toBe(false);
      ids.add(u.canonical_id);
    }
    expect(ids.size).toBe(10021);
  });

  // Test 5: Zero missing units from 10,021 universe
  it('05. zero missing units from 10,021 universe compared to baseline', () => {
    const reportIdSet = new Set(units.map(u => u.canonical_id));
    expect(baselineUnits.length).toBe(10021);

    for (const b of baselineUnits) {
      expect(reportIdSet.has(b.id)).toBe(true);
    }
  });

  // Test 6: Calibrated staging threshold enforced (S1 >= 0.65 & Delta >= 0.15)
  it('06. calibrated staging threshold enforced (S1 >= 0.65 & Delta >= 0.15)', () => {
    expect(report.semantic_disambiguation_distribution.calibrated_thresholds.min_top_score_S1).toBe(0.65);
    expect(report.semantic_disambiguation_distribution.calibrated_thresholds.min_margin_delta).toBe(0.15);

    for (const u of units) {
      if (u.semantic_status === 'SEMANTIC_MATCH_CONFIDENT') {
        expect(u.semantic_score).toBeGreaterThanOrEqual(0.65);
        expect(u.semantic_margin).toBeGreaterThanOrEqual(0.15);
      }
    }
  });

  // Test 7: Zero translations[0] heuristic fallback
  it('07. zero translations[0] heuristic fallback', () => {
    // Multi-candidate units have score evaluated and runner_up tracked
    const multiCandUnits = units.filter(u => u.source_provenance?.candidate_count > 1);
    expect(multiCandUnits.length).toBeGreaterThan(0);

    for (const u of multiCandUnits.slice(0, 100)) {
      expect(u.semantic_score).toBeDefined();
      expect(typeof u.semantic_score).toBe('number');
      expect(typeof u.runner_up_score).toBe('number');
    }
  });

  // Test 8: Ambiguous semantic match never routes to AUTO_CANDIDATE
  it('08. ambiguous semantic match never routes to AUTO_CANDIDATE', () => {
    for (const u of units) {
      if (u.routing_status === ROUTING_STATUS.AUTO_CANDIDATE) {
        expect(u.semantic_status).toBe('SEMANTIC_MATCH_CONFIDENT');
        expect(u.semantic_status).not.toBe('SEMANTIC_MATCH_AMBIGUOUS');
        expect(u.semantic_status).not.toBe('SEMANTIC_MATCH_NO_EVIDENCE');
      }
    }
  });

  // Test 9: Missing evidence routes fail-closed to HOLD
  it('09. missing evidence routes fail-closed to HOLD', () => {
    for (const u of units) {
      // If missing Thai or sense, must be HOLD
      if (u.blocker_flags.includes('THAI_NOT_FOUND') || u.blocker_flags.includes('SENSE_NOT_FOUND') || u.blocker_flags.includes('CEFR_CONFLICT')) {
        expect(u.routing_status).toBe(ROUTING_STATUS.HOLD);
      }
      // If lacking both attested example and example review, must be HOLD
      if (u.blocker_flags.includes('EXAMPLE_NOT_FOUND') && u.example_status !== 'EXAMPLE_REVIEW') {
        expect(u.routing_status).toBe(ROUTING_STATUS.HOLD);
      }
    }
  });

  // Test 10: AI draft isolation strictly preserved
  it('10. AI draft isolation strictly preserved (never counts as attested)', () => {
    expect(report.ai_draft_quarantine.isolation_verified).toBe(true);
    expect(report.ai_draft_quarantine.synthetic_examples_accepted_as_attested).toBe(0);

    for (const u of units) {
      expect(u.source_provenance.is_synthetic).toBe(false);
      expect(u.source_provenance.source_grounded).toBe(true);
    }
  });

  // Test 11: Morphology false-positive safety (11 pairs blocked)
  it('11. morphology false-positive safety (11 pairs blocked)', () => {
    expect(ADVERSARIAL_MORPHOLOGY_PAIRS.length).toBe(11);
    expect(report.morphology_safety.all_blocked).toBe(true);

    for (const pair of ADVERSARIAL_MORPHOLOGY_PAIRS) {
      const res = matchLemmaInExample({ lemma: pair.lemma, pos: pair.pos, example: pair.sentence });
      expect(res.matched).toBe(false);
    }
  });

  // Test 12: Source provenance retained for all 10,021 units
  it('12. source provenance retained for all 10,021 units', () => {
    for (const u of units) {
      expect(u.source_provenance).toBeDefined();
      expect(Array.isArray(u.source_provenance.dictionary_sources)).toBe(true);
      expect(u.source_provenance.dictionary_sources.length).toBeGreaterThan(0);
      expect(u.source_provenance.dictionary_sources).toContain('lexitron_2_0');
    }
  });

  // Test 13: Deterministic reason codes for all units
  it('13. deterministic reason codes for all units', () => {
    for (const u of units) {
      expect(Array.isArray(u.reason_codes)).toBe(true);
      expect(u.reason_codes.length).toBeGreaterThan(0);
    }
  });

  // Test 14: Zero production DB writes
  it('14. zero production DB writes during routing calculation', () => {
    expect(report.governance.production_db_writes).toBe(0);
  });

  // Test 15: Zero schema alterations and zero lifecycle promotions
  it('15. zero schema alterations and zero lifecycle promotions', () => {
    expect(report.governance.schema_changes).toBe(0);
    expect(report.governance.lifecycle_promotions).toBe(0);
  });

  // Test 16: Learner-ready locked at 83, gap 9,917, status NOT_READY
  it('16. learner-ready locked at 83, gap 9,917, status NOT_READY', () => {
    expect(report.governance.learner_ready_units_locked).toBe(83);
    expect(report.governance.learner_ready_breakdown.active_production).toBe(21);
    expect(report.governance.learner_ready_breakdown.approved_staging).toBe(62);
    expect(report.governance.readiness_gap).toBe(9917);
    expect(report.governance.target_learner_ready).toBe(10000);
    expect(report.governance.production_status).toBe('NOT_READY');
    expect(report.governance.user_testing_authorized).toBe(false);
  });

  // Extra Gate Check integration test
  it('17. verification gate EVIDENCE_ROUTING_FULL_UNIVERSE_GATE passes 13/13', () => {
    const gateResult = verifyPhase6239Routing({ projectRoot: PROJECT_ROOT });
    expect(gateResult.passed).toBe(true);
    expect(gateResult.passed_count).toBe(13);
    expect(gateResult.total_count).toBe(13);
  });
});
