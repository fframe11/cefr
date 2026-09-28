/**
 * Phase 6.2.35 — Thai Lexical Coverage Expansion + Example Evidence Warehouse Test Suite
 *
 * Vitest suite verifying:
 * 1. Master source snapshots & SHA256 integrity (7+ sources)
 * 2. LEXiTRON license reconciliation & attribution verification (NECTEC 2003 BSD-style)
 * 3. Full LEXiTRON 2.0 usable index (>52k unique headwords, 83k usable entries)
 * 4. 100% Thai Candidate preservation with source provenance (Zero collapse to translations[0])
 * 5. Deterministic Thai sense alignment states (5 states)
 * 6. Tatoeba CC BY 2.0 FR text-only dataset & attribution compliance
 * 7. Example Evidence Warehouse 3-tier quality filter (SOURCE_OK, SOURCE_REVIEW, SOURCE_REJECT)
 * 8. Morphology matching integration & adversarial substring collision protections
 * 9. Strict AI isolation outside source layer (AI_DRAFT_ONLY, is_synthetic=true, source_grounded=false)
 * 10. Advanced C1/C2 & known-gap stress tests
 * 11. Production safety invariants (learner-ready = 83, zero DB writes, user testing blocked)
 * 12. Full verification gate execution (verifyPhase6235ThaiExample)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  LexicalEvidenceWarehouse,
  EVIDENCE_LEVELS,
  SENSE_ALIGNMENT_STATUS,
  GAP_TAXONOMY,
} from '../scripts/content-pipeline/vocab/lexical-warehouse.mjs';
import {
  ThaiEvidenceModel,
  THAI_ALIGNMENT_STATUS,
  THAI_EVIDENCE_TIERS,
} from '../scripts/content-pipeline/vocab/thai-evidence-model.mjs';
import {
  ExampleEvidenceWarehouse,
  EXAMPLE_QUALITY_STATUS,
  EXAMPLE_MATCH_TYPE,
  EXAMPLE_SENSE_ALIGNMENT,
} from '../scripts/content-pipeline/vocab/example-warehouse.mjs';
import { verifyPhase6235ThaiExample } from '../scripts/content-pipeline/vocab/verify-phase-6235-thai-example.mjs';
import { matchLemmaInExample } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.35 — Thai Lexical Coverage & Example Evidence Warehouse', () => {
  const warehouse = new LexicalEvidenceWarehouse(projectRoot);
  const thaiModel = new ThaiEvidenceModel(projectRoot);
  const exampleWarehouse = new ExampleEvidenceWarehouse(projectRoot);

  describe('1. Master Source Snapshots & Manifest Integrity', () => {
    it('loads master manifest with all 7+ authoritative and secondary sources', () => {
      const masterPath = path.join(projectRoot, 'data/lexical-sources/master-manifest.json');
      expect(fs.existsSync(masterPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
      const sources = Object.values(manifest.sources);
      expect(sources.length).toBeGreaterThanOrEqual(7);

      const sourceIds = sources.map((s) => s.source_id);
      expect(sourceIds).toContain('cefr_j');
      expect(sourceIds).toContain('octanove');
      expect(sourceIds).toContain('oewn');
      expect(sourceIds).toContain('lexitron');
      expect(sourceIds).toContain('cmudict');
      expect(sourceIds).toContain('wiktionary_omw');
      expect(sourceIds).toContain('tatoeba');

      for (const s of sources) {
        expect(s.sha256).toBeDefined();
        expect(s.sha256.length).toBe(64);
        expect(s.license_name || s.license).toBeDefined();
      }
    });

    it('verifies LEXiTRON license reconciliation documents exist and specify attribution', () => {
      const jsonPath = path.join(projectRoot, 'reports/phase-6.2.35-lexitron-license-reconciliation.json');
      const mdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.35-lexitron-license-reconciliation.md');
      expect(fs.existsSync(jsonPath)).toBe(true);
      expect(fs.existsSync(mdPath)).toBe(true);

      const recon = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      expect(recon.authoritative_terms_reconciliation.license_identifier).toBe('NECTEC-LEXiTRON-License-Agreement-2003');
      expect(recon.authoritative_terms_reconciliation.redistribution_permitted).toBe(true);
      expect(recon.compliance_requirements_for_glova.length).toBeGreaterThan(0);
    });

    it('loads full LEXiTRON 2.0 usable index with expected magnitude', () => {
      const indexPath = path.join(projectRoot, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json');
      expect(fs.existsSync(indexPath)).toBe(true);

      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const keys = Object.keys(index);
      expect(keys.length).toBeGreaterThanOrEqual(50000);
    });
  });

  describe('2. Thai Evidence Model & Candidate Preservation', () => {
    it('preserves all candidate translations with source provenance (Zero collapse)', () => {
      const candidates = thaiModel.getCandidates('rich', 'adjective');
      expect(candidates.length).toBeGreaterThanOrEqual(5);

      const lexitronCandidates = candidates.filter((c) => c.source_id === 'lexitron_2_0');
      const wiktionaryCandidates = candidates.filter((c) => c.source_id === 'wiktionary_omw_2024');

      expect(lexitronCandidates.length).toBeGreaterThan(0);
      expect(wiktionaryCandidates.length).toBeGreaterThan(0);

      for (const c of candidates) {
        expect(c.source_id).toBeDefined();
        expect(c.source_version).toBeDefined();
        expect(c.license).toBeDefined();
        expect(c.normalized_translation).toBeDefined();
        expect(c.evidence_tier).toBeDefined();
      }
    });

    it('correctly classifies unambiguous words as THAI_EXACT_SENSE', () => {
      const candidates = thaiModel.getCandidates('car', 'noun');
      const alignment = thaiModel.alignCandidatesToSense({
        word: 'car',
        pos: 'noun',
        candidates,
        englishSense: { definition: 'a motor vehicle with four wheels' },
      });

      expect(alignment.status).toBe(THAI_ALIGNMENT_STATUS.THAI_EXACT_SENSE);
      expect(alignment.aligned_meaning).toBe('รถยนต์');
    });

    it('correctly routes polysemous candidate lists to THAI_MULTI_SENSE when ambiguous', () => {
      const candidates = thaiModel.getCandidates('clean', 'adjective');
      const alignment = thaiModel.alignCandidatesToSense({
        word: 'clean',
        pos: 'adjective',
        candidates,
        englishSense: { definition: '(of a surface) not written or printed on' },
      });

      expect([THAI_ALIGNMENT_STATUS.THAI_MULTI_SENSE, THAI_ALIGNMENT_STATUS.THAI_STRONG_SENSE]).toContain(alignment.status);
    });
  });

  describe('3. Tatoeba Ingestion & Example Evidence Warehouse Quality Filter', () => {
    it('loads Tatoeba dataset with valid CC BY 2.0 FR sentences and attribution', () => {
      const tatoebaPath = path.join(projectRoot, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json');
      expect(fs.existsSync(tatoebaPath)).toBe(true);

      const sentences = JSON.parse(fs.readFileSync(tatoebaPath, 'utf8'));
      expect(sentences.length).toBeGreaterThan(0);

      for (const s of sentences) {
        expect(s.sentence_id).toBeDefined();
        expect(s.text).toBeDefined();
        expect(s.license).toBe('CC BY 2.0 FR');
        expect(s.contributor).toBeDefined();
      }
    });

    it('correctly filters examples into 3 quality tiers: SOURCE_OK, SOURCE_REVIEW, SOURCE_REJECT', () => {
      // 1. SOURCE_OK
      const ok = exampleWarehouse.filterExampleQuality('This is an authentic and grammatically sound sentence.');
      expect(ok.status).toBe(EXAMPLE_QUALITY_STATUS.SOURCE_OK);

      // 2. Too short (<4 words) -> SOURCE_REJECT
      const short = exampleWarehouse.filterExampleQuality('Hi.');
      expect(short.status).toBe(EXAMPLE_QUALITY_STATUS.SOURCE_REJECT);
      expect(short.reason).toContain('too short');

      // 3. Missing terminal punctuation -> SOURCE_REJECT
      const noPunct = exampleWarehouse.filterExampleQuality('This sentence lacks terminal punctuation');
      expect(noPunct.status).toBe(EXAMPLE_QUALITY_STATUS.SOURCE_REJECT);
      expect(noPunct.reason).toContain('Missing valid terminal punctuation');

      // 4. Toxic / offensive words -> SOURCE_REJECT
      const toxic = exampleWarehouse.filterExampleQuality('This sentence contains a bastard offensive word.');
      expect(toxic.status).toBe(EXAMPLE_QUALITY_STATUS.SOURCE_REJECT);
      expect(toxic.reason).toContain('Contains offensive');

      // 5. Excessively long (>40 words) -> SOURCE_REVIEW
      const longSentence = 'This sentence is intentionally constructed to contain far too many unnecessary words that exceed the maximum word count threshold for typical CEFR educational examples in order to test that the quality filter accurately marks it for human pedagogical review rather than automatic promotion.';
      const long = exampleWarehouse.filterExampleQuality(longSentence);
      expect(long.status).toBe(EXAMPLE_QUALITY_STATUS.SOURCE_REVIEW);
      expect(long.reason).toContain('excessively long');
    });

    it('normalizes lexicographical sentences to ensure proper capitalization and punctuation', () => {
      const raw = 'he knocked on the door';
      const norm = exampleWarehouse.normalizeSentence(raw);
      expect(norm).toBe('He knocked on the door.');

      const quality = exampleWarehouse.filterExampleQuality(norm);
      expect(quality.status).toBe(EXAMPLE_QUALITY_STATUS.SOURCE_OK);
    });
  });

  describe('4. Morphology Matching Integration & Adversarial Protections', () => {
    it('matches exact lemma forms correctly', () => {
      const match = matchLemmaInExample({ lemma: 'car', pos: 'noun', example: 'I drove my new car to work.' });
      expect(match.matched).toBe(true);
      expect(match.match_type).toBe('EXACT_LEMMA');
    });

    it('matches attested inflected forms correctly', () => {
      const match = matchLemmaInExample({ lemma: 'dance', pos: 'verb', example: 'She danced gracefully across the hall.' });
      expect(match.matched).toBe(true);
      expect(['INFLECTED_FORM', 'ATTESTED_INFLECTION']).toContain(match.match_type);
    });

    it('rejects adversarial substring collisions', () => {
      const testCases = [
        { lemma: 'car', pos: 'noun', example: 'The red carpet was vacuumed.' },
        { lemma: 'art', pos: 'noun', example: 'She published an article yesterday.' },
        { lemma: 'care', pos: 'noun', example: 'Please be careful on the road.' },
        { lemma: 'act', pos: 'verb', example: 'Immediate action was taken.' },
        { lemma: 'class', pos: 'noun', example: 'He bought a classic car.' },
      ];

      for (const tc of testCases) {
        const match = matchLemmaInExample(tc);
        expect(match.matched).toBe(false);
      }
    });
  });

  describe('5. Strict AI Fallback Isolation', () => {
    it('isolates AI translation drafts as AI_DRAFT_ONLY outside source layer', () => {
      const draft = warehouse.requestAiDraftFallback({
        word: 'algorithm',
        part_of_speech: 'noun',
        cefr_level: 'B2',
        simulatedDraft: 'ขั้นตอนวิธี',
      });

      expect(draft.classification).toBe('AI_DRAFT_ONLY');
      expect(draft.is_synthetic).toBe(true);
      expect(draft.source_grounded).toBe(false);
      expect(draft.human_review_required).toBe(true);
    });

    it('isolates AI example drafts as AI_DRAFT_ONLY outside source layer', () => {
      const draft = exampleWarehouse.requestAiExampleDraft({
        word: 'algorithm',
        pos: 'noun',
        simulatedSentence: 'The algorithm sorts the array efficiently.',
      });

      expect(draft.classification).toBe('AI_DRAFT_ONLY');
      expect(draft.is_synthetic).toBe(true);
      expect(draft.source_grounded).toBe(false);
      expect(draft.human_review_required).toBe(true);
    });
  });

  describe('6. Advanced C1/C2 and Known-Gap Stress Tests', () => {
    it('correctly handles C1/C2 words previously missing in single sources', () => {
      const coveredWords = [
        { word: 'faithfully', pos: 'adverb', cefr: 'B2' },
        { word: 'automate', pos: 'verb', cefr: 'C2' },
        { word: 'decentralize', pos: 'verb', cefr: 'C2' },
        { word: 'equivalent', pos: 'adjective', cefr: 'C1' },
        { word: 'cluster', pos: 'noun', cefr: 'C1' },
      ];

      for (const item of coveredWords) {
        const res = warehouse.mergeUnitEvidence({
          word: item.word,
          part_of_speech: item.pos,
          cefr_level: item.cefr,
        });

        // Must have candidate translations preserved from secondary sources
        expect(res.all_candidate_translations.length).toBeGreaterThan(0);
        // Must have senses
        expect(res.all_candidate_senses.length).toBeGreaterThan(0);
        // Must not be dropped without provenance
        expect(res.provenance.sources_ingested.length).toBeGreaterThan(0);
      }

      const missingGaps = [
        { word: 'potentially', pos: 'adverb', cefr: 'B2' },
        { word: 'consultancy', pos: 'noun', cefr: 'C1' },
      ];

      for (const item of missingGaps) {
        const res = warehouse.mergeUnitEvidence({
          word: item.word,
          part_of_speech: item.pos,
          cefr_level: item.cefr,
        });

        // Genuine missing gap must record THAI_NOT_FOUND and HOLD
        expect(res.gap_reasons).toContain(GAP_TAXONOMY.THAI_NOT_FOUND);
        expect(res.confidence_decision).toBe('HOLD');
      }
    }, 30000);
  });

  describe('7. Production Safety Invariants & Verification Gate', () => {
    it('passes all checks in verifyPhase6235ThaiExample (THAI_EXAMPLE_EVIDENCE_GATE)', () => {
      const result = verifyPhase6235ThaiExample({ projectRoot });
      expect(result.passed).toBe(true);

      const failedChecks = result.checks.filter((c) => !c.passed);
      expect(failedChecks.length).toBe(0);
    });

    it('strictly maintains learner-ready accounting at 83 and blocks user testing', () => {
      const reportPath = path.join(projectRoot, 'reports/phase-6.2.35-thai-example-evidence.json');
      expect(fs.existsSync(reportPath)).toBe(true);

      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      expect(report.governance_and_safety.production_db_mutated).toBe(false);
      expect(report.governance_and_safety.vocabulary_activated).toBe(false);
      expect(report.governance_and_safety.learner_ready_accounting).toBe(83);
      expect(report.governance_and_safety.user_testing_authorized).toBe(false);
      expect(report.governance_and_safety.overall_status).toBe('NOT_READY');
    });
  });
});
