/**
 * Phase 6.2.32 — Ingestion-First Candidate Assembly & Provenance Test Suite
 *
 * Dedicated Vitest suite verifying:
 * 1. Multi-source evidence ingestion & candidate assembly
 * 2. Thai translation extraction and cleaning from LEXiTRON
 * 3. Definition and attested example extraction from OEWN
 * 4. IPA pronunciation and heteronym detection from CMUdict
 * 5. CEFR level and frequency list integration
 * 6. Strict separation of evidence and content (is_synthetic = false)
 * 7. Fail-Closed alignment gate evaluation
 * 8. A/B benchmark parity vs Phase 6.2.31 baseline (3% -> 39% AUTO_READY)
 * 9. Production safety invariants (0 DB writes, 83 learner-ready units)
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CandidateAssemblyEngine } from '../scripts/content-pipeline/vocab/candidate-assembly-engine.mjs';
import { evaluateUnitEvidence, DECISION_GATES } from '../scripts/content-pipeline/vocab/evidence-pipeline-poc.mjs';
import { verifyPhase6232IngestionFirstPoc } from '../scripts/content-pipeline/vocab/verify-phase-6232-ingestion-first-poc.mjs';
import { generateHumanQaReadinessReport } from '../scripts/content-pipeline/vocab/human-review-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.32 — Ingestion-First Candidate Assembly & Provenance', () => {
  const engine = new CandidateAssemblyEngine();

  it('1. assembles complete canonical candidate from all 5 evidence sources', () => {
    const candidate = engine.assembleCandidate({
      word: 'car',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(candidate.word).toBe('car');
    expect(candidate.part_of_speech).toBe('noun');
    expect(candidate.cefr_level).toBe('A1');
    expect(candidate.meaning_th).toBe('รถยนต์');
    expect(candidate.definition_en).toContain('motor vehicle');
    expect(candidate.phonetic_ipa).toBe('/kɑːɹ/');
    expect(candidate.example_sentence).toContain('car');
    expect(candidate.evidence_summary.sources_matched).toBe(5);
    expect(candidate.provenance.is_synthetic).toBe(false);
    expect(candidate.provenance.assembly_method).toBe('deterministic_ingestion_first');
  });

  it('2. cleans parenthetical context markers from LEXiTRON primary gloss', () => {
    // Test cleaning logic on entries with parentheticals
    const candidate = engine.assembleCandidate({
      word: 'water',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(candidate.meaning_th).toBeTruthy();
    expect(candidate.meaning_th).not.toMatch(/\(.*?\)/);
    expect(candidate.thai_candidates.length).toBeGreaterThanOrEqual(1);
  });

  it('3. preserves all alternative candidate glosses in thai_candidates without data loss', () => {
    const candidate = engine.assembleCandidate({
      word: 'father',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(candidate.thai_candidates).toContain('บิดา');
    expect(candidate.thai_candidates.length).toBeGreaterThan(1);
    expect(candidate.provenance.sources.lexitron.total_translations).toBe(candidate.thai_candidates.length);
  });

  it('4. extracts primary definition and synset metadata from OEWN 2024', () => {
    const candidate = engine.assembleCandidate({
      word: 'happy',
      part_of_speech: 'adjective',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(candidate.definition_en).toBeTruthy();
    expect(candidate.provenance.sources.oewn.synset_id).toBeTruthy();
    expect(candidate.provenance.sources.oewn.license).toBe('CC-BY-4.0');
  });

  it('5. prioritizes exact headword match in OEWN attested examples', () => {
    const candidate = engine.assembleCandidate({
      word: 'house',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(candidate.example_sentence).toMatch(/\bhouse\b/i);
    expect(candidate.provenance.example_provenance.type).toBe('OEWN_ATTESTED_HEADWORD');
  });

  it('6. detects inflected stem matches and records exact example provenance type', () => {
    const candidate = engine.assembleCandidate({
      word: 'dance',
      part_of_speech: 'verb',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(candidate.example_sentence).toBeTruthy();
    expect(['OEWN_ATTESTED_HEADWORD', 'OEWN_ATTESTED_INFLECTION']).toContain(
      candidate.provenance.example_provenance.type
    );
  });

  it('7. heteronym detection: correctly flags heteronym lemmas with is_heteronym = true', () => {
    const readCandidate = engine.assembleCandidate({
      word: 'read',
      part_of_speech: 'verb',
      cefr_level: 'A1',
      sense_index: 1,
    });

    expect(readCandidate.is_heteronym).toBe(true);
    expect(readCandidate.provenance.sources.cmudict.is_heteronym).toBe(true);

    const carCandidate = engine.assembleCandidate({
      word: 'car',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
    });
    expect(carCandidate.is_heteronym).toBe(false);
  });

  it('8. strict separation: ensures is_synthetic = false and provenance contains zero hallucinated data', () => {
    const candidate = engine.assembleCandidate({
      word: 'accept',
      part_of_speech: 'verb',
      cefr_level: 'A2',
      sense_index: 1,
    });

    expect(candidate.provenance.is_synthetic).toBe(false);
    expect(candidate.provenance.sources.cefr_j).toBeDefined();
    expect(candidate.provenance.sources.oewn).toBeDefined();
    expect(candidate.provenance.sources.lexitron).toBeDefined();
    expect(candidate.provenance.sources.cmudict).toBeDefined();
    expect(candidate.provenance.sources.frequency).toBeDefined();
  });

  it('9. missing source handling: gracefully leaves missing fields null without crashing or guessing', () => {
    const candidate = engine.assembleCandidate({
      word: 'consultancy',
      part_of_speech: 'noun',
      cefr_level: 'C1',
      sense_index: 1,
    });

    // Consultancy is not in LEXiTRON 2.0
    expect(candidate.meaning_th).toBeNull();
    expect(candidate.thai_candidates).toEqual([]);
    expect(candidate.provenance.sources.lexitron).toBeNull();

    // When evaluated, fail-closed gate must mark it as HOLD, not AUTO_READY
    const evaluated = evaluateUnitEvidence(
      { word: 'consultancy', part_of_speech: 'noun', cefr_level: 'C1', sense_index: 1 },
      candidate,
      engine.adapters
    );
    expect(evaluated.confidence_decision).toBe(DECISION_GATES.HOLD);
  });

  it('10. fail-closed gate evaluation: car evaluates to AUTO_READY cleanly', () => {
    const candidate = engine.assembleCandidate({
      word: 'car',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
    });
    const evaluated = evaluateUnitEvidence(
      { word: 'car', part_of_speech: 'noun', cefr_level: 'A1', sense_index: 1 },
      candidate,
      engine.adapters
    );

    expect(evaluated.confidence_decision).toBe(DECISION_GATES.AUTO_READY);
    expect(evaluated.alignment_results.sense).toBe('SENSE_ALIGNED');
    expect(evaluated.alignment_results.thai).toBe('THAI_GROUNDED');
    expect(evaluated.alignment_results.ipa).toBe('IPA_CONFIRMED');
    expect(evaluated.alignment_results.example).toBe('EXAMPLE_ALIGNED');
    expect(evaluated.reason_codes).toHaveLength(0);
  });

  it('11. verifies full 100-record benchmark parity and A/B delta measurements', () => {
    const result = verifyPhase6232IngestionFirstPoc({ projectRoot });

    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.metrics.totalRecords).toBe(100);
    expect(result.metrics.baselineAutoReady).toBe(3);
    expect(result.metrics.assembledAutoReady).toBe(39);
    expect(result.metrics.autoReadyDelta).toBe(36);
    expect(result.metrics.assembledReviewRequired).toBe(21);
    expect(result.metrics.assembledHold).toBe(40);
    expect(result.metrics.gate).toBe('PASS');
    expect(result.metrics.safetyVerified).toBe(true);
  });

  it('12. verifies production safety invariants: zero DB writes, zero promotions, learner-ready = 83', () => {
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
