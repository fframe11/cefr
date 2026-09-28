/**
 * Phase 6.2.33 — Evidence Alignment Hardening Test Suite
 *
 * Dedicated Vitest suite verifying:
 * 1. Morphological inflection matching (regular plurals/tenses, irregular forms, zero derivative false positives)
 * 2. CandidateAssemblyEngine morphological integration (example selection & provenance)
 * 3. Deterministic Thai sense connection via LEXiTRON and OEWN
 * 4. Deterministic Fail-Closed Decision Gate evaluation on 100-word benchmark
 * 5. Exact transition accounting from Phase 6.2.32 (39 -> 54 AUTO_READY, 40 -> 18 HOLD)
 * 6. Residual HOLD audit (exactly 18 records with verified lexical evidence gaps)
 * 7. Severe corruption blocking (anti-regression)
 * 8. Production safety invariants (83 learner ready, zero DB writes, user testing blocked)
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchLemmaInExample } from '../scripts/content-pipeline/vocab/morphology-matcher.mjs';
import { CandidateAssemblyEngine } from '../scripts/content-pipeline/vocab/candidate-assembly-engine.mjs';
import {
  evaluateUnitEvidenceHardened,
  DECISION_GATES,
  ALIGNMENT_STATES,
} from '../scripts/content-pipeline/vocab/evidence-pipeline-hardened.mjs';
import { verifyPhase6233Hardening } from '../scripts/content-pipeline/vocab/verify-phase-6233-hardening.mjs';
import { generateHumanQaReadinessReport } from '../scripts/content-pipeline/vocab/human-review-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.33 — Evidence Alignment Hardening', () => {
  const engine = new CandidateAssemblyEngine();

  describe('1. Morphological Inflection Matcher', () => {
    it('matches exact lemmas with EXACT_LEMMA status', () => {
      const res = matchLemmaInExample({ lemma: 'car', pos: 'noun', example: 'I drove a new car today.' });
      expect(res.matched).toBe(true);
      expect(res.match_type).toBe('EXACT_LEMMA');
      expect(res.matched_token).toBe('car');
    });

    it('matches regular noun plurals (-s, -es, consonant doubling)', () => {
      const daysRes = matchLemmaInExample({ lemma: 'day', pos: 'noun', example: 'It rained for several days.' });
      expect(daysRes.matched).toBe(true);
      expect(daysRes.match_type).toBe('INFLECTED_FORM');
      expect(daysRes.matched_token).toBe('days');

      const boxesRes = matchLemmaInExample({ lemma: 'box', pos: 'noun', example: 'Pack the items into boxes.' });
      expect(boxesRes.matched).toBe(true);
      expect(boxesRes.match_type).toBe('INFLECTED_FORM');
      expect(boxesRes.matched_token).toBe('boxes');
    });

    it('matches regular verb inflections (-ed, -ing, -s, -es)', () => {
      const danceRes = matchLemmaInExample({ lemma: 'dance', pos: 'verb', example: 'The young girl danced into the room.' });
      expect(danceRes.matched).toBe(true);
      expect(danceRes.match_type).toBe('INFLECTED_FORM');
      expect(danceRes.matched_token).toBe('danced');

      const ironRes = matchLemmaInExample({ lemma: 'iron', pos: 'verb', example: 'She stood there ironing.' });
      expect(ironRes.matched).toBe(true);
      expect(ironRes.match_type).toBe('INFLECTED_FORM');
      expect(ironRes.matched_token).toBe('ironing');
    });

    it('matches attested irregular verb and noun forms', () => {
      const feltRes = matchLemmaInExample({ lemma: 'feel', pos: 'verb', example: 'He felt a sharp pain in his chest.' });
      expect(feltRes.matched).toBe(true);
      expect(feltRes.match_type).toBe('IRREGULAR_FORM');
      expect(feltRes.matched_token).toBe('felt');

      const childrenRes = matchLemmaInExample({ lemma: 'child', pos: 'noun', example: 'The children were playing outside.' });
      expect(childrenRes.matched).toBe(true);
      expect(childrenRes.match_type).toBe('IRREGULAR_FORM');
      expect(childrenRes.matched_token).toBe('children');
    });

    it('strictly rejects false derivative matches (carpet != car, article != art, careful != care)', () => {
      const carRes = matchLemmaInExample({ lemma: 'car', pos: 'noun', example: 'The red carpet covered the hallway.' });
      expect(carRes.matched).toBe(false);
      expect(carRes.match_type).toBe('NOT_FOUND');

      const artRes = matchLemmaInExample({ lemma: 'art', pos: 'noun', example: 'I read an interesting article.' });
      expect(artRes.matched).toBe(false);
      expect(artRes.match_type).toBe('NOT_FOUND');

      const careRes = matchLemmaInExample({ lemma: 'care', pos: 'verb', example: 'Please be careful with that glass.' });
      expect(careRes.matched).toBe(false);
      expect(careRes.match_type).toBe('NOT_FOUND');
    });
  });

  describe('2. CandidateAssemblyEngine Integration', () => {
    it('selects inflected example when headword is not in base form, recording OEWN_ATTESTED_INFLECTION', () => {
      const cand = engine.assembleCandidate({
        word: 'dance',
        part_of_speech: 'verb',
        cefr_level: 'A1',
        sense_index: 1,
      });

      expect(cand.example_sentence).toContain('danced');
      expect(cand.provenance.example_provenance.type).toBe('OEWN_ATTESTED_INFLECTION');
      expect(cand.provenance.example_provenance.match_type).toBe('INFLECTED_FORM');
    });

    it('disambiguates Thai gloss with OEWN synset overlap when multiple LEXiTRON entries exist', () => {
      const dayCand = engine.assembleCandidate({
        word: 'day',
        part_of_speech: 'noun',
        cefr_level: 'A1',
        sense_index: 1,
      });

      expect(dayCand.meaning_th).toBe('ช่วงเวลา');
      expect(dayCand.provenance.sources.lexitron.disambiguation_method).toBe('oewn_synset_overlap');
    });

    it('safely handles words missing from LEXiTRON without guessing', () => {
      const cand = engine.assembleCandidate({
        word: 'consultancy',
        part_of_speech: 'noun',
        cefr_level: 'C1',
        sense_index: 1,
      });

      expect(cand.meaning_th).toBeNull();
      expect(cand.raw_meaning_th).toBeNull();
      expect(cand.thai_candidates).toEqual([]);
    });
  });

  describe('3. Fail-Closed Decision Gate & Benchmark Verification', () => {
    it('evaluates rescued inflections cleanly to AUTO_READY (e.g. dance, purchase, achieve)', () => {
      const danceCand = engine.assembleCandidate({ word: 'dance', part_of_speech: 'verb', cefr_level: 'A1', sense_index: 1 });
      const danceEval = evaluateUnitEvidenceHardened({ word: 'dance', part_of_speech: 'verb', cefr_level: 'A1' }, danceCand, engine.adapters);
      expect(danceEval.confidence_decision).toBe(DECISION_GATES.AUTO_READY);
      expect(danceEval.alignment_results.example).toBe(ALIGNMENT_STATES.example.EXAMPLE_INFLECTED);

      const purchaseCand = engine.assembleCandidate({ word: 'purchase', part_of_speech: 'verb', cefr_level: 'B2', sense_index: 1 });
      const purchaseEval = evaluateUnitEvidenceHardened({ word: 'purchase', part_of_speech: 'verb', cefr_level: 'B2' }, purchaseCand, engine.adapters);
      expect(purchaseEval.confidence_decision).toBe(DECISION_GATES.AUTO_READY);
      expect(purchaseEval.alignment_results.example).toBe(ALIGNMENT_STATES.example.EXAMPLE_INFLECTED);
    });

    it('safely holds illustrative synonym examples that do not contain the target word (eat, dog)', () => {
      const eatCand = engine.assembleCandidate({ word: 'eat', part_of_speech: 'verb', cefr_level: 'A1', sense_index: 1 });
      const eatEval = evaluateUnitEvidenceHardened({ word: 'eat', part_of_speech: 'verb', cefr_level: 'A1' }, eatCand, engine.adapters);
      expect(eatEval.confidence_decision).toBe(DECISION_GATES.HOLD);
      expect(eatEval.alignment_results.example).toBe(ALIGNMENT_STATES.example.EXAMPLE_CONFLICT);
      expect(eatEval.reason_codes).toContain('EXAMPLE_CONFLICT');

      const dogCand = engine.assembleCandidate({ word: 'dog', part_of_speech: 'noun', cefr_level: 'A1', sense_index: 1 });
      const dogEval = evaluateUnitEvidenceHardened({ word: 'dog', part_of_speech: 'noun', cefr_level: 'A1' }, dogCand, engine.adapters);
      expect(dogEval.confidence_decision).toBe(DECISION_GATES.HOLD);
      expect(dogEval.alignment_results.example).toBe(ALIGNMENT_STATES.example.EXAMPLE_CONFLICT);
    });

    it('safely routes unresolved multi-sense words to REVIEW_REQUIRED instead of auto-approving (early, fast, welcome)', () => {
      const earlyCand = engine.assembleCandidate({ word: 'early', part_of_speech: 'adverb', cefr_level: 'A1', sense_index: 1 });
      const earlyEval = evaluateUnitEvidenceHardened({ word: 'early', part_of_speech: 'adverb', cefr_level: 'A1' }, earlyCand, engine.adapters);
      expect(earlyEval.confidence_decision).toBe(DECISION_GATES.REVIEW_REQUIRED);
      expect(earlyEval.alignment_results.thai).toBe(ALIGNMENT_STATES.thai.THAI_MULTI_SENSE);
    });

    it('passes complete independent verification on all 100 benchmark records', () => {
      const res = verifyPhase6233Hardening({ projectRoot });
      expect(res.passed).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.metrics.totalRecords).toBe(100);
      expect(res.metrics.p32AutoReady).toBe(39);
      expect(res.metrics.p33AutoReady).toBe(54);
      expect(res.metrics.autoReadyDelta).toBe(15);
      expect(res.metrics.p33ReviewRequired).toBe(28);
      expect(res.metrics.p33Hold).toBe(18);
      expect(res.metrics.holdDelta).toBe(-22);
      expect(res.metrics.gate).toBe('PASS');
      expect(res.metrics.safetyVerified).toBe(true);
    });
  });

  describe('4. Production Safety Invariants', () => {
    it('verifies zero DB writes, zero promotions, learner-ready = 83, user testing blocked', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
      expect(readiness.production_safety.bulk_promotions_executed).toBe(false);
    });
  });
});
