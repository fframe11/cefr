import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runPhase6244Acquisition } from '../scripts/content-pipeline/vocab/run-phase-6244-acquisition.mjs';
import { ADVERSARIAL_MORPHOLOGY_PAIRS } from '../scripts/content-pipeline/vocab/run-phase-6239-routing.mjs';
import { matchLemmaInExample, FALSE_DERIVATIVE_BLACKLIST } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';

const PROJECT_ROOT = path.resolve(__dirname, '../');

describe('Phase 6.2.44 — Full External Corpus Acquisition Audit & Routing', () => {
  const reportPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.44-full-corpus-acquisition.json');
  const tatoebaVerificationPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.44-tatoeba-source-verification.json');
  const kaikkiVerificationPath = path.join(PROJECT_ROOT, 'reports/phase-6.2.44-kaikki-source-verification.json');
  const docAssessmentPath = path.join(PROJECT_ROOT, 'docs/assessment/phase-6.2.44-full-corpus-acquisition.md');
  const docCoveragePath = path.join(PROJECT_ROOT, 'docs/assessment/external-corpus-coverage-after-acquisition.md');

  let report: any;
  if (fs.existsSync(reportPath)) {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } else {
    report = runPhase6244Acquisition({ projectRoot: PROJECT_ROOT });
  }

  it('1. Universe invariant: exactly 10,021 vocabulary learning units evaluated with zero sampling', () => {
    expect(report.production_safety_invariants.total_universe).toBe(10021);
    expect(report.four_way_comparison.new_6_2_44.AUTO_CANDIDATE +
      report.four_way_comparison.new_6_2_44.REVIEW_REQUIRED +
      report.four_way_comparison.new_6_2_44.HOLD).toBe(10021);
  });

  it('2. Learner-ready invariant: locked strictly at 83 units (21 active, 62 staging)', () => {
    expect(report.production_safety_invariants.learner_ready_count).toBe(83);
    expect(report.production_safety_invariants.user_testing_authorized).toBe(false);
  });

  it('3. Production safety: 0 DB mutations, 0 schema changes, 0 promotions', () => {
    expect(report.production_safety_invariants.production_db_writes).toBe(0);
    expect(report.production_safety_invariants.schema_changes).toBe(0);
    expect(report.production_safety_invariants.lifecycle_promotions).toBe(0);
  });

  it('4. Tatoeba full corpus ingestion: 2,037,522 sentences, SHA-256 verified, CC-BY-2.0-FR license', () => {
    expect(fs.existsSync(tatoebaVerificationPath)).toBe(true);
    const tatoebaVer = JSON.parse(fs.readFileSync(tatoebaVerificationPath, 'utf8'));
    expect(tatoebaVer.verification_verdict).toBe('VERIFIED_DOWNLOADABLE');
    expect(tatoebaVer.legal_and_licensing.license_spdx).toBe('CC-BY-2.0-FR');
    expect(tatoebaVer.authoritative_endpoints.english_corpus_bz2.status).toBe('VERIFIED_DOWNLOADABLE');
    expect(report.source_manifest_updates.tatoeba.total_raw_sentences).toBe(2037522);
    expect(report.source_manifest_updates.tatoeba.universe_candidates_indexed).toBe(24522);
    expect(report.source_manifest_updates.tatoeba.universe_lemmas_covered).toBe(8309);
    expect(report.source_manifest_updates.tatoeba.archive_sha256).toBe('f0568ae34496f8a03758ce6821b68da04b1fe67a9300de8d26d50494ae5aceab');
  });

  it('5. Kaikki English-Thai dump ingestion: 21,020 entries, SHA-256 verified, CC-BY-SA-3.0 license', () => {
    expect(fs.existsSync(kaikkiVerificationPath)).toBe(true);
    const kaikkiVer = JSON.parse(fs.readFileSync(kaikkiVerificationPath, 'utf8'));
    expect(kaikkiVer.verification_verdict).toBe('VERIFIED_DOWNLOADABLE');
    expect(kaikkiVer.legal_and_licensing.license_spdx).toBe('CC-BY-SA-3.0');
    expect(kaikkiVer.authoritative_endpoints.thai_wiktionary_dump_jsonl.sha256).toBe('202acdc93b99bfeb240d48ee48a9f520160a85aa951ecb653eeb3d93b0b6fb57');
    expect(report.source_manifest_updates.kaikki.total_raw_entries).toBe(21020);
    expect(report.source_manifest_updates.kaikki.universe_records_indexed).toBe(17371);
    expect(report.source_manifest_updates.kaikki.universe_lemmas_covered).toBe(4909);
    expect(report.source_manifest_updates.kaikki.archive_sha256).toBe('202acdc93b99bfeb240d48ee48a9f520160a85aa951ecb653eeb3d93b0b6fb57');
  });

  it('6. Example coverage audit: expands from 4,713 (snapshot) to 9,620 (full Tatoeba)', () => {
    const ex = report.example_coverage_audit;
    expect(ex.universe_total).toBe(10021);
    expect(ex.old_snapshot_examples_found).toBe(4713);
    expect(ex.full_tatoeba_examples_found).toBe(9620);
    expect(ex.delta_examples_found).toBe(4907);
    expect(ex.new_example_not_found).toBe(401);
  });

  it('7. Thai cross-source coverage: audits LEXiTRON and Kaikki overlap', () => {
    const th = report.thai_coverage_cross_sources;
    expect(th.lexitron_only + th.kaikki_only + th.both_lexitron_and_kaikki + th.neither).toBe(10021);
    expect(th.lexitron_only).toBe(3778);
    expect(th.kaikki_only).toBe(142);
    expect(th.both_lexitron_and_kaikki).toBe(4857);
    expect(th.neither).toBe(1244);
  });

  it('8. 4-way comparison table: confirms AUTO expansion to 641 and Addressable to 2,893 (28.87%)', () => {
    const c = report.four_way_comparison;
    expect(c.baseline_6_2_39.AUTO_CANDIDATE).toBe(342);
    expect(c.simulation_6_2_42.AUTO_CANDIDATE).toBe(4892);
    expect(c.actual_6_2_43.AUTO_CANDIDATE).toBe(299);
    expect(c.new_6_2_44.AUTO_CANDIDATE).toBe(641);
    expect(c.new_6_2_44.REVIEW_REQUIRED).toBe(2252);
    expect(c.new_6_2_44.HOLD).toBe(7128);
    expect(c.new_6_2_44.addressable).toBe(2893);
    expect(c.new_6_2_44.addressable_rate_pct).toBe(28.87);
    expect(c.new_6_2_44.EXAMPLE_NOT_FOUND).toBe(172);
  });

  it('9. Step 11: Individual audit of all 4,326 example blockers', () => {
    const audit = report.step_11_example_blockers_4326_audit;
    expect(audit.total_4326_tested).toBe(4326);
    expect(audit.recovered).toBe(4168);
    expect(audit.pos_mismatch).toBe(0);
    expect(audit.quality_fail).toBe(0);
    expect(audit.true_source_gap).toBe(158);
    expect(audit.recovered + audit.true_source_gap).toBe(4326);
  });

  it('10. Step 12: Individual audit of all 1,379 Thai gaps', () => {
    const audit = report.step_12_thai_gaps_1379_audit;
    expect(audit.total_1379_tested).toBe(1379);
    expect(audit.recovered).toBe(0);
    expect(audit.ambiguous).toBe(0);
    expect(audit.wrong_sense).toBe(141);
    expect(audit.true_source_gap).toBe(1238);
    expect(audit.wrong_sense + audit.true_source_gap).toBe(1379);
  });

  it('11. Adversarial morphology: 11/11 false-derivative pairs remain 100% blocked', () => {
    let failures = 0;
    for (const pair of ADVERSARIAL_MORPHOLOGY_PAIRS) {
      const match = matchLemmaInExample(pair.lemma, pair.sentence);
      const isBlacklisted = FALSE_DERIVATIVE_BLACKLIST.has(`${pair.lemma}:${pair.target_derivative}`);
      const passed = !match.matched && isBlacklisted;
      if (!passed) failures++;
    }
    expect(failures).toBe(0);
    expect(report.adversarial_morphology_audit.status).toBe('PASSED_100_PERCENT');
  });

  it('12. AI Quarantine invariant: zero synthetic AI evidence accepted into evidence warehouse', () => {
    expect(report.production_safety_invariants.ai_evidence_accepted).toBe(0);
    expect(report.production_safety_invariants.ai_isolation).toBe('AI_ANALYSIS_ONLY');
  });

  it('13. Verdict invariant: strictly FULL_CORPUS_ACQUISITION_SUCCESS', () => {
    expect(report.verdict).toBe('FULL_CORPUS_ACQUISITION_SUCCESS');
    expect(report.verdict_justification.length).toBeGreaterThanOrEqual(5);
  });

  it('14. Provenance tracking: indexes retain sentence ID, license, and checksum', () => {
    const indexTatoebaPath = path.join(PROJECT_ROOT, 'data/external-cache/tatoeba/tatoeba-universe-index.json');
    const indexKaikkiPath = path.join(PROJECT_ROOT, 'data/external-cache/kaikki/kaikki-universe-index.json');
    expect(fs.existsSync(indexTatoebaPath)).toBe(true);
    expect(fs.existsSync(indexKaikkiPath)).toBe(true);

    const tatoebaSample = JSON.parse(fs.readFileSync(indexTatoebaPath, 'utf8'));
    const firstLemma = Object.keys(tatoebaSample)[0];
    const firstSentence = tatoebaSample[firstLemma][0];
    expect(firstSentence.source_sentence_id).toBeDefined();
    expect(firstSentence.license).toBe('CC-BY-2.0-FR');
    expect(firstSentence.source_checksum).toBeDefined();

    const kaikkiSample = JSON.parse(fs.readFileSync(indexKaikkiPath, 'utf8'));
    const firstThaiLemma = Object.keys(kaikkiSample)[0];
    const firstRecord = kaikkiSample[firstThaiLemma][0];
    expect(firstRecord.source_entry_id).toBeDefined();
    expect(firstRecord.license).toBe('CC-BY-SA-3.0');
    expect(firstRecord.source_checksum).toBeDefined();
  });

  it('15. Verification artifacts exist and are non-empty', () => {
    expect(fs.existsSync(reportPath)).toBe(true);
    expect(fs.existsSync(docAssessmentPath)).toBe(true);
    expect(fs.existsSync(docCoveragePath)).toBe(true);
    expect(fs.statSync(reportPath).size).toBeGreaterThan(1000);
    expect(fs.statSync(docAssessmentPath).size).toBeGreaterThan(500);
    expect(fs.statSync(docCoveragePath).size).toBeGreaterThan(500);
  });
});
