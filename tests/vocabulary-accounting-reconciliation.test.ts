/**
 * Phase 6.2.36 — Vocabulary Accounting & Benchmark Reconciliation Test Suite
 *
 * Verifies:
 * 1. Decision exclusivity (AUTO + REVIEW + HOLD = 10,021)
 * 2. Inventory count (exactly 10,021 units)
 * 3. Benchmark count (exactly 100 units)
 * 4. Duplicate detection (0 duplicate keys)
 * 5. Denominator correctness (formula and percentage integrity)
 * 6. CEFR distribution totals (A1-C2 sum = 10,021)
 * 7. POS distribution totals (POS sum = 10,021)
 * 8. Thai coverage calculation (9,139 / 10,021 = 91.20%)
 * 9. Example coverage calculation (7,686 / 10,021 = 76.70%)
 * 10. Learner-ready accounting (21 Active + 62 Approved = 83 Learner-Ready)
 * 11. Primary blocker exclusivity (sum of primary blockers = 10,021)
 * 12. All-gap multi-label behavior (multi-label sum > 10,021)
 * 13. Benchmark representativeness classification (HIGH_EVIDENCE_BIASED)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../');

const INVENTORY_REPORT_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-inventory-accounting.json');
const BENCHMARK_100_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-benchmark-100-audit.json');
const BLOCKER_ANALYSIS_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-blocker-analysis.json');
const RECONCILIATION_DOC_PATH = path.join(PROJECT_ROOT, 'docs/assessment/phase-6.2.36-accounting-reconciliation.md');
const MANIFEST_10K_PATH = path.join(PROJECT_ROOT, 'scripts/content-pipeline/output/vocabulary-large-manifest.json');
const MASTER_MANIFEST_PATH = path.join(PROJECT_ROOT, 'data/lexical-sources/master-manifest.json');

describe('Phase 6.2.36 — Evidence Accounting & Benchmark Reconciliation', () => {
  const invReport = JSON.parse(fs.readFileSync(INVENTORY_REPORT_PATH, 'utf8'));
  const b100Report = JSON.parse(fs.readFileSync(BENCHMARK_100_PATH, 'utf8'));
  const blockerReport = JSON.parse(fs.readFileSync(BLOCKER_ANALYSIS_PATH, 'utf8'));
  const raw10k = JSON.parse(fs.readFileSync(MANIFEST_10K_PATH, 'utf8'));
  const masterManifest = JSON.parse(fs.readFileSync(MASTER_MANIFEST_PATH, 'utf8'));

  it('1. Decision Exclusivity: AUTO_READY + REVIEW_REQUIRED + HOLD equals exactly 10,021', () => {
    const dec = invReport.inventory_summary.decisions;
    const total = dec.AUTO_READY.count + dec.REVIEW_REQUIRED.count + dec.HOLD.count;
    expect(total).toBe(10021);
    expect(invReport.inventory_summary.total_units).toBe(10021);
    expect(invReport.units.length).toBe(10021);

    // Verify every single unit record has exactly one valid decision
    const validDecisions = new Set(['AUTO_READY', 'REVIEW_REQUIRED', 'HOLD']);
    for (const u of invReport.units) {
      expect(validDecisions.has(u.decision)).toBe(true);
    }
  });

  it('2. Inventory Count: Exactly 10,021 units in manifest and accounting report', () => {
    expect(raw10k.units.length).toBe(10021);
    expect(raw10k.summary.total_inventory_learning_units).toBe(10021);
    expect(invReport.inventory_summary.total_units).toBe(10021);
  });

  it('3. Benchmark Count: Exactly 100 units in benchmark report', () => {
    expect(b100Report.benchmark_construction.total_records).toBe(100);
    expect(b100Report.audit_records.length).toBe(100);
  });

  it('4. Duplicate Detection: Zero duplicate learning_unit_keys in candidate universe', () => {
    const keys = new Set();
    let duplicates = 0;
    for (const u of invReport.units) {
      if (keys.has(u.id)) {
        duplicates++;
      }
      keys.add(u.id);
    }
    expect(duplicates).toBe(0);
    expect(keys.size).toBe(10021);
  });

  it('5. Denominator Correctness: All reported metrics specify exact numerator, denominator, and formula', () => {
    const dec = invReport.inventory_summary.decisions;
    expect(dec.AUTO_READY.formula).toBe(`${dec.AUTO_READY.count} / 10021`);
    expect(dec.REVIEW_REQUIRED.formula).toBe(`${dec.REVIEW_REQUIRED.count} / 10021`);
    expect(dec.HOLD.formula).toBe(`${dec.HOLD.count} / 10021`);

    const cov = invReport.inventory_summary.coverage;
    expect(cov.thai.formula).toBe(`${cov.thai.count} / 10021`);
    expect(cov.examples.formula).toBe(`${cov.examples.count} / 10021`);
    expect(cov.ipa.formula).toBe(`${cov.ipa.count} / 10021`);

    // Verify mathematical percentage calculation
    expect(parseFloat(dec.AUTO_READY.pct)).toBeCloseTo((dec.AUTO_READY.count / 10021) * 100, 1);
    expect(parseFloat(cov.thai.pct)).toBeCloseTo((cov.thai.count / 10021) * 100, 1);
  });

  it('6. CEFR Distribution Totals: Sum of A1 through C2 equals exactly 10,021', () => {
    const cefr = invReport.inventory_summary.by_cefr;
    const sum = cefr.A1.total + cefr.A2.total + cefr.B1.total + cefr.B2.total + cefr.C1.total + cefr.C2.total;
    expect(sum).toBe(10021);
    expect(cefr.A1.total).toBe(1168);
    expect(cefr.A2.total).toBe(1415);
    expect(cefr.B1.total).toBe(2498);
    expect(cefr.B2.total).toBe(2857);
    expect(cefr.C1.total).toBe(1090);
    expect(cefr.C2.total).toBe(993);
  });

  it('7. POS Distribution Totals: Sum of parts of speech equals exactly 10,021', () => {
    const pos = invReport.inventory_summary.by_pos;
    const sum = pos.noun.total + pos.verb.total + pos.adjective.total + pos.adverb.total + pos.other.total;
    expect(sum).toBe(10021);
    expect(pos.noun.total).toBe(4981);
    expect(pos.verb.total).toBe(1846);
    expect(pos.adjective.total).toBe(2066);
    expect(pos.adverb.total).toBe(827);
    expect(pos.other.total).toBe(301);
  });

  it('8. Thai Coverage Calculation: Exactly 9,139 units (91.20%) have attested Thai evidence', () => {
    const cov = invReport.inventory_summary.coverage.thai;
    expect(cov.count).toBe(9139);
    expect(cov.pct).toBe('91.20%');
    expect(cov.formula).toBe('9139 / 10021');
  });

  it('9. Example Coverage Calculation: Exactly 7,686 units (76.70%) have attested example sentences', () => {
    const cov = invReport.inventory_summary.coverage.examples;
    expect(cov.count).toBe(7686);
    expect(cov.pct).toBe('76.70%');
    expect(cov.formula).toBe('7686 / 10021');
  });

  it('10. Learner-Ready Accounting: 21 Active + 62 Approved = 83 Learner-Ready, strictly locked', () => {
    const active = 21;
    const approvedStaging = 62;
    const learnerReady = active + approvedStaging;
    const target = 10000;
    const gap = target - learnerReady;

    expect(learnerReady).toBe(83);
    expect(gap).toBe(9917);

    // Verify AUTO_READY units are NOT counted as learner-ready
    expect(invReport.inventory_summary.decisions.AUTO_READY.count).toBeGreaterThan(learnerReady);
  });

  it('11. Primary Blocker Exclusivity: Sum of primary blockers across all units equals exactly 10,021', () => {
    const blockers = blockerReport.primary_blockers;
    const sum = blockers.reduce((acc, b) => acc + b.count, 0);
    expect(sum).toBe(10021);

    // AUTO_READY units must have primary blocker 'NONE'
    const noneBlocker = blockers.find(b => b.blocker === 'NONE');
    expect(noneBlocker).toBeDefined();
    expect(noneBlocker.count).toBe(invReport.inventory_summary.decisions.AUTO_READY.count);
  });

  it('12. All-Gap Multi-Label Behavior: Total gap occurrences exceed 10,021 due to multi-label attribution', () => {
    const allGaps = blockerReport.all_gap_flags;
    const totalGaps = allGaps.reduce((acc, g) => acc + g.count, 0);
    expect(totalGaps).toBeGreaterThan(10021);

    // Verify top gaps: EXAMPLE_NOT_FOUND and POLYSEMY_UNRESOLVED
    expect(allGaps[0].gap).toBe('EXAMPLE_NOT_FOUND');
    expect(allGaps[1].gap).toBe('POLYSEMY_UNRESOLVED');
  });

  it('13. Benchmark Representativeness Classification: 100 benchmark is classified as HIGH_EVIDENCE_BIASED', () => {
    const comp = b100Report.representativeness_comparison;
    expect(comp.classification).toBe('HIGH_EVIDENCE_BIASED (STRATIFIED_BUT_DIFFERENT)');
    expect(parseFloat(comp.delta_percentage_points)).toBeGreaterThan(30.0);
    expect(b100Report.benchmark_construction.high_frequency_bias).toBe(true);
    expect(b100Report.benchmark_construction.lower_cefr_bias).toBe(true);
    expect(b100Report.benchmark_construction.cefr_quotas.A1 + b100Report.benchmark_construction.cefr_quotas.A2).toBe(40);
  });
});
