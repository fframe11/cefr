/**
 * Phase 6.2.40 — Example Evidence Recovery Audit & Controlled Expansion POC Tests
 *
 * Enforces the 15 mandatory regression criteria:
 * 1. no production DB mutation
 * 2. no lifecycle promotion
 * 3. AI examples cannot satisfy evidence
 * 4. unverified sources cannot satisfy production evidence
 * 5. exact examples are accepted only when alignment passes
 * 6. inflected examples require morphology alignment
 * 7. sense mismatch is rejected
 * 8. POS mismatch is rejected where applicable
 * 9. quality-failed examples remain rejected
 * 10. all 365 units are accounted for
 * 11. no duplicate recovery evidence
 * 12. source provenance is preserved
 * 13. routing policy remains unchanged
 * 14. Phase 6.2.39 baseline counts remain unchanged
 * 15. deterministic rerun produces identical results
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  runPhase6240ExampleRecoveryAudit,
  RECOVERY_CATEGORIES,
  FINAL_CONCLUSION,
} from '../scripts/content-pipeline/vocab/run-phase-6240-example-recovery-audit.mjs';
import { ExampleEvidenceWarehouse, EXAMPLE_QUALITY_STATUS } from '../scripts/content-pipeline/vocab/example-warehouse.mjs';
import { matchLemmaInExample } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.40-example-recovery-audit.json');

describe('Phase 6.2.40 — Example Evidence Recovery Audit & Controlled Expansion POC', () => {
  let report: any;

  beforeAll(() => {
    if (!fs.existsSync(REPORT_PATH)) {
      report = runPhase6240ExampleRecoveryAudit({ projectRoot: PROJECT_ROOT });
    } else {
      report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    }
  });

  it('01. No production DB mutation during audit or POC', () => {
    expect(report.governance.production_db_mutations).toBe(0);
    expect(report.governance.schema_changes).toBe(0);
  });

  it('02. No lifecycle promotions during audit or POC', () => {
    expect(report.governance.lifecycle_promotions).toBe(0);
    expect(report.governance.learner_ready_count).toBe(83);
    expect(report.governance.readiness_gap).toBe(9917);
    expect(report.governance.production_status).toBe('NOT_READY');
    expect(report.governance.user_testing_authorized).toBe(false);
  });

  it('03. AI examples cannot satisfy evidence (strictly quarantined)', () => {
    expect(report.ai_isolation_check.ai_synthetic_cannot_satisfy_evidence).toBe(true);
    expect(report.ai_isolation_check.ai_draft_only_enforced).toBe(true);
    expect(report.ai_isolation_check.ai_isolation_passed).toBe(true);

    const warehouse = new ExampleEvidenceWarehouse(PROJECT_ROOT);
    const aiDraft = warehouse.requestAiExampleDraft ? warehouse.requestAiExampleDraft({ word: 'sample', pos: 'noun' }) : null;
    if (aiDraft) {
      expect(aiDraft.classification || aiDraft.status).toBe('AI_DRAFT_ONLY');
      expect(aiDraft.is_synthetic).toBe(true);
      expect(aiDraft.source_grounded).toBe(false);
    }
  });

  it('04. Unverified sources cannot satisfy production evidence', () => {
    const openEdu = report.source_audit.open_education_corpus;
    expect(openEdu.license_status).toBe('LICENSE_UNVERIFIED');
    expect(openEdu.license_verified).toBe(false);
    expect(openEdu.is_source_grounded).toBe(false);
    expect(openEdu.usable_sentences).toBe(0);

    // Ensure zero per-unit evidence was credited to unverified sources
    const unverifiedHits = report.per_unit_evidence.filter((e: any) => e.source_id === 'open_education_corpus');
    expect(unverifiedHits.length).toBe(0);
  });

  it('05. Exact examples are accepted only when alignment passes', () => {
    const exactUnits = report.per_unit_evidence.filter((e: any) => e.category === RECOVERY_CATEGORIES.SOURCE_EXACT);
    expect(exactUnits.length).toBe(7);

    for (const u of exactUnits) {
      expect(u.match_type).toBe('EXACT_LEMMA');
      expect(u.sentence).toBeTruthy();
      expect(typeof u.sentence).toBe('string');
      // Confirm terminal punctuation
      expect(/[.?!]["']?$/.test(u.sentence.trim())).toBe(true);
      // Confirm length 4-35 words
      const words = u.sentence.trim().split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(4);
      expect(words.length).toBeLessThanOrEqual(35);
    }
  });

  it('06. Inflected examples require morphology alignment', () => {
    const inflectedUnits = report.per_unit_evidence.filter((e: any) => e.category === RECOVERY_CATEGORIES.SOURCE_INFLECTED);
    expect(inflectedUnits.length).toBe(3);

    for (const u of inflectedUnits) {
      expect(['ATTESTED_INFLECTION', 'INFLECTED_FORM']).toContain(u.match_type);
      const m = matchLemmaInExample({ lemma: u.word, pos: u.pos, example: u.sentence });
      expect(m.matched).toBe(true);
      expect(['ATTESTED_INFLECTION', 'INFLECTED_FORM']).toContain(m.match_type);
    }
  });

  it('07. Sense mismatch is rejected and isolated into SOURCE_MATCH_BUT_SENSE_MISMATCH', () => {
    const senseMismatches = report.per_unit_evidence.filter((e: any) => e.category === RECOVERY_CATEGORIES.SOURCE_MATCH_BUT_SENSE_MISMATCH);
    expect(senseMismatches.length).toBe(93);

    for (const u of senseMismatches) {
      expect(u.reason).toContain('secondary synset');
      expect(u.source_id).toBe('oewn_2024');
    }
  });

  it('08. POS mismatch is rejected where applicable (e.g. squash, deep, adult, shop)', () => {
    const posMismatches = report.per_unit_evidence.filter((e: any) => e.category === RECOVERY_CATEGORIES.SOURCE_MATCH_BUT_POS_MISMATCH);
    expect(posMismatches.length).toBe(31);

    const flaggedWords = ['squash', 'deep', 'adult', 'shop'];
    for (const w of flaggedWords) {
      const entry = posMismatches.find((e: any) => e.word === w);
      expect(entry).toBeDefined();
      expect(entry.category).toBe(RECOVERY_CATEGORIES.SOURCE_MATCH_BUT_POS_MISMATCH);
    }
  });

  it('09. Quality-failed examples remain rejected', () => {
    const qualityFails = report.per_unit_evidence.filter((e: any) => e.category === RECOVERY_CATEGORIES.SOURCE_MATCH_BUT_QUALITY_FAIL);
    expect(qualityFails.length).toBe(46);

    for (const u of qualityFails) {
      expect(u.reason).toContain('failed quality');
    }
  });

  it('10. All 365 sole-example-blocker units are completely accounted for', () => {
    expect(report.recovery_simulation_results.total_sole_example_blockers).toBe(365);
    const sum = Object.values(report.recovery_simulation_results.category_breakdown).reduce((a: any, b: any) => a + b, 0);
    expect(sum).toBe(365);
    expect(report.per_unit_evidence.length).toBe(365);
  });

  it('11. No duplicate recovery evidence across the 365 units', () => {
    const ids = report.per_unit_evidence.map((e: any) => e.canonical_id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(365);
  });

  it('12. Source provenance is preserved for all recovered examples', () => {
    const recovered = report.per_unit_evidence.filter((e: any) => e.category === RECOVERY_CATEGORIES.SOURCE_EXACT || e.category === RECOVERY_CATEGORIES.SOURCE_INFLECTED);
    for (const r of recovered) {
      expect(['tatoeba', 'oewn_2024']).toContain(r.source_id);
      expect(r.license).toBeTruthy();
    }
  });

  it('13. Routing policy remains unchanged (immutable fail-closed rules)', () => {
    expect(report.governance.routing_policy_modified).toBe(false);
    expect(report.governance.phase_6_2_39_baseline_preserved).toBe(true);
  });

  it('14. Phase 6.2.39 baseline counts remain unchanged', () => {
    const report39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
    expect(report39.routing_summary.AUTO_CANDIDATE.count).toBe(342);
    expect(report39.routing_summary.REVIEW_REQUIRED.count).toBe(1196);
    expect(report39.routing_summary.HOLD.count).toBe(8483);
    expect(report39.governance.total_universe_denominator).toBe(10021);
    expect(report39.governance.learner_ready_units_locked).toBe(83);
  });

  it('15. Deterministic rerun produces identical results', () => {
    const rerun = runPhase6240ExampleRecoveryAudit({ projectRoot: PROJECT_ROOT });
    expect(rerun.recovery_simulation_results.recoverable_units).toBe(report.recovery_simulation_results.recoverable_units);
    expect(rerun.recovery_simulation_results.actual_recovery_rate).toBe(report.recovery_simulation_results.actual_recovery_rate);
    expect(rerun.recovery_simulation_results.category_breakdown).toEqual(report.recovery_simulation_results.category_breakdown);
    expect(rerun.final_verdict).toBe(report.final_verdict);
  });
});
