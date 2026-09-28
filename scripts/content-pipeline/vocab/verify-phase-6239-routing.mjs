/**
 * Phase 6.2.39 — Evidence Routing & Readiness Accounting Verification Gate
 *
 * Implements: EVIDENCE_ROUTING_FULL_UNIVERSE_GATE
 * 13 Rigorous Structural & Accounting Checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ADVERSARIAL_MORPHOLOGY_PAIRS, ROUTING_STATUS } from './run-phase-6239-routing.mjs';
import { matchLemmaInExample } from './morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

const REPORT_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json');
const BASELINE_ACCOUNTING_PATH = path.join(PROJECT_ROOT, 'reports/phase-6.2.36-inventory-accounting.json');
const DOC_ASSESSMENT_PATH = path.join(PROJECT_ROOT, 'docs/assessment/phase-6.2.39-full-universe-routing.md');

export function verifyPhase6239Routing({ projectRoot = PROJECT_ROOT } = {}) {
  console.log('[Phase 6.2.39 Gate] Evaluating EVIDENCE_ROUTING_FULL_UNIVERSE_GATE...');

  const reportFile = path.join(projectRoot, 'reports/phase-6.2.39-full-universe-routing.json');
  const baselineFile = path.join(projectRoot, 'reports/phase-6.2.36-inventory-accounting.json');
  const docFile = path.join(projectRoot, 'docs/assessment/phase-6.2.39-full-universe-routing.md');

  if (!fs.existsSync(reportFile)) {
    throw new Error(`Report not found at ${reportFile}`);
  }
  if (!fs.existsSync(baselineFile)) {
    throw new Error(`Baseline accounting not found at ${baselineFile}`);
  }
  if (!fs.existsSync(docFile)) {
    throw new Error(`Assessment doc not found at ${docFile}`);
  }

  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

  const units = report.units || [];
  const baselineUnits = baseline.units || [];

  const checks = [];

  // Check 1: UNIVERSE_DENOMINATOR_EXACT
  const pass1 = units.length === 10021 && report.governance.total_universe_denominator === 10021;
  checks.push({
    code: 'UNIVERSE_DENOMINATOR_EXACT',
    passed: pass1,
    expected: 10021,
    actual: units.length,
    description: 'Universe denominator is exactly 10,021 learning units.',
  });

  // Check 2: ZERO_DUPLICATE_IDS
  const idSet = new Set();
  let duplicateCount = 0;
  for (const u of units) {
    if (idSet.has(u.canonical_id)) duplicateCount++;
    idSet.add(u.canonical_id);
  }
  const pass2 = duplicateCount === 0 && idSet.size === 10021;
  checks.push({
    code: 'ZERO_DUPLICATE_IDS',
    passed: pass2,
    expected: 0,
    actual: duplicateCount,
    description: 'Zero duplicate canonical IDs across full universe.',
  });

  // Check 3: ZERO_MISSING_UNITS
  const baselineIdSet = new Set(baselineUnits.map(u => u.id));
  let missingCount = 0;
  for (const bid of baselineIdSet) {
    if (!idSet.has(bid)) missingCount++;
  }
  const pass3 = missingCount === 0 && baselineUnits.length === 10021;
  checks.push({
    code: 'ZERO_MISSING_UNITS',
    passed: pass3,
    expected: 0,
    actual: missingCount,
    description: 'Zero missing units compared to authoritative Phase 6.2.36 baseline.',
  });

  // Check 4: STATUS_MUTUAL_EXCLUSIVITY
  let nonExclusiveCount = 0;
  for (const u of units) {
    const valid = [ROUTING_STATUS.AUTO_CANDIDATE, ROUTING_STATUS.REVIEW_REQUIRED, ROUTING_STATUS.HOLD].includes(u.routing_status);
    if (!valid) nonExclusiveCount++;
  }
  const pass4 = nonExclusiveCount === 0;
  checks.push({
    code: 'STATUS_MUTUAL_EXCLUSIVITY',
    passed: pass4,
    expected: 0,
    actual: nonExclusiveCount,
    description: 'Every unit is assigned exactly one valid routing status.',
  });

  // Check 5: EXACT_SUM_MATCH
  const autoCount = report.routing_summary.AUTO_CANDIDATE.count;
  const reviewCount = report.routing_summary.REVIEW_REQUIRED.count;
  const holdCount = report.routing_summary.HOLD.count;
  const pass5 = autoCount === 342 && reviewCount === 1196 && holdCount === 8483 && (autoCount + reviewCount + holdCount === 10021);
  checks.push({
    code: 'EXACT_SUM_MATCH',
    passed: pass5,
    expected: '342 + 1196 + 8483 = 10021',
    actual: `${autoCount} + ${reviewCount} + ${holdCount} = ${autoCount + reviewCount + holdCount}`,
    description: 'Routing totals match exact full-universe counts (342 AUTO, 1196 REVIEW, 8483 HOLD).',
  });

  // Check 6: CALIBRATED_THRESHOLD_ENFORCED
  let thresholdViolations = 0;
  for (const u of units) {
    if (u.semantic_status === 'SEMANTIC_MATCH_CONFIDENT') {
      if (u.semantic_score < 0.65 || u.semantic_margin < 0.15) {
        thresholdViolations++;
      }
    }
  }
  const pass6 = thresholdViolations === 0 && report.semantic_disambiguation_distribution.calibrated_thresholds.min_top_score_S1 === 0.65;
  checks.push({
    code: 'CALIBRATED_THRESHOLD_ENFORCED',
    passed: pass6,
    expected: 0,
    actual: thresholdViolations,
    description: 'Candidate staging threshold S1 >= 0.65 and margin >= 0.15 strictly enforced.',
  });

  // Check 7: AMBIGUOUS_NEVER_AUTO
  let ambiguousInAutoCount = 0;
  for (const u of units) {
    if (u.routing_status === ROUTING_STATUS.AUTO_CANDIDATE) {
      if (u.semantic_status !== 'SEMANTIC_MATCH_CONFIDENT') {
        ambiguousInAutoCount++;
      }
    }
  }
  const pass7 = ambiguousInAutoCount === 0;
  checks.push({
    code: 'AMBIGUOUS_NEVER_AUTO',
    passed: pass7,
    expected: 0,
    actual: ambiguousInAutoCount,
    description: 'No ambiguous or no-evidence semantic units are routed to AUTO_CANDIDATE.',
  });

  // Check 8: MORPHOLOGY_SAFETY_VERIFIED
  let unblockedMorphology = 0;
  for (const pair of ADVERSARIAL_MORPHOLOGY_PAIRS) {
    const res = matchLemmaInExample({ lemma: pair.lemma, pos: pair.pos, example: pair.sentence });
    if (res.matched) unblockedMorphology++;
  }
  const pass8 = unblockedMorphology === 0 && report.morphology_safety.all_blocked === true;
  checks.push({
    code: 'MORPHOLOGY_SAFETY_VERIFIED',
    passed: pass8,
    expected: 0,
    actual: unblockedMorphology,
    description: 'All 11 adversarial morphology false-derivative pairs strictly blocked.',
  });

  // Check 9: AI_DRAFT_ISOLATION_CONFIRMED
  const pass9 = report.ai_draft_quarantine.isolation_verified === true &&
    report.ai_draft_quarantine.synthetic_examples_accepted_as_attested === 0;
  checks.push({
    code: 'AI_DRAFT_ISOLATION_CONFIRMED',
    passed: pass9,
    expected: 'quarantined and 0 accepted as attested',
    actual: `synthetic_accepted: ${report.ai_draft_quarantine.synthetic_examples_accepted_as_attested}`,
    description: 'AI drafts quarantined with is_synthetic: true and source_grounded: false.',
  });

  // Check 10: SOURCE_PROVENANCE_ATTACHED
  let missingProvenanceCount = 0;
  for (const u of units) {
    if (!u.source_provenance || !u.source_provenance.dictionary_sources) {
      missingProvenanceCount++;
    }
  }
  const pass10 = missingProvenanceCount === 0;
  checks.push({
    code: 'SOURCE_PROVENANCE_ATTACHED',
    passed: pass10,
    expected: 0,
    actual: missingProvenanceCount,
    description: '100% of universe units retain complete dictionary source provenance.',
  });

  // Check 11: ZERO_PRODUCTION_MUTATIONS
  const g = report.governance;
  const pass11 = g.production_db_writes === 0 && g.schema_changes === 0 && g.lifecycle_promotions === 0;
  checks.push({
    code: 'ZERO_PRODUCTION_MUTATIONS',
    passed: pass11,
    expected: 'writes: 0, schema: 0, promotions: 0',
    actual: `writes: ${g.production_db_writes}, schema: ${g.schema_changes}, promotions: ${g.lifecycle_promotions}`,
    description: 'Zero production Supabase writes, zero DDL schema alterations, zero lifecycle promotions.',
  });

  // Check 12: LEARNER_READY_LOCKED
  const pass12 = g.learner_ready_units_locked === 83 &&
    g.learner_ready_breakdown.active_production === 21 &&
    g.learner_ready_breakdown.approved_staging === 62 &&
    g.readiness_gap === 9917 &&
    g.production_status === 'NOT_READY' &&
    g.user_testing_authorized === false;
  checks.push({
    code: 'LEARNER_READY_LOCKED',
    passed: pass12,
    expected: '83 (21 active + 62 staging), gap 9917, NOT_READY',
    actual: `${g.learner_ready_units_locked} (${g.learner_ready_breakdown.active_production} active + ${g.learner_ready_breakdown.approved_staging} staging), gap ${g.readiness_gap}, status ${g.production_status}`,
    description: 'Learner-ready vocabulary locked at 83, gap 9,917, user testing unauthorized.',
  });

  // Check 13: BOTTLENECK_HIERARCHY_EMPIRICALLY_IDENTIFIED
  const b1 = report.bottleneck_hierarchy[0];
  const pass13 = b1 && b1.blocker === 'EXAMPLE_NOT_FOUND' && b1.primary_count === 4463;
  checks.push({
    code: 'BOTTLENECK_HIERARCHY_EMPIRICALLY_IDENTIFIED',
    passed: pass13,
    expected: 'Rank 1 = EXAMPLE_NOT_FOUND (4,463 units)',
    actual: `Rank 1 = ${b1?.blocker} (${b1?.primary_count} units)`,
    description: 'Primary bottleneck empirically identified from real full-universe data.',
  });

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;
  const allPassed = passedCount === totalCount;

  console.log(`[Phase 6.2.39 Gate] EVIDENCE_ROUTING_FULL_UNIVERSE_GATE: ${passedCount}/${totalCount} checks passed (${allPassed ? 'PASSED' : 'FAILED'})`);

  return {
    gate_name: 'EVIDENCE_ROUTING_FULL_UNIVERSE_GATE',
    passed: allPassed,
    passed_count: passedCount,
    total_count: totalCount,
    checks,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = verifyPhase6239Routing();
  if (!result.passed) {
    console.error('GATE FAILED:');
    console.error(result.checks.filter(c => !c.passed));
    process.exit(1);
  }
}
