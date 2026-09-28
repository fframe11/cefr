import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IPA_DISPOSITIONS,
  REVIEW_DECISIONS,
  REVIEW_RISK_TIERS,
  SENSE_DISPOSITIONS,
  applyReviewDecisionToUnit,
  computeReviewRiskTier,
  evaluateEightDimensionAudit,
  exportAllFiftyBatches,
  generateHumanQaReadinessReport,
  getBatchProgress,
  loadBatch,
  promoteUnitToActive,
  recordReviewEventToLedger,
  validateUnitReviewDecision,
} from '../scripts/content-pipeline/vocab/human-review-engine.mjs';
import { loadExistingActiveCuratedVocabulary } from '../scripts/content-pipeline/vocab/large-production-pipeline.mjs';

const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.11 — Large Vocabulary Human QA & Approval Framework', () => {
  const sampleStagedUnit = {
    learning_unit_key: 'abandon|verb|B2|sense:1',
    word: 'abandon',
    lemma: 'abandon',
    part_of_speech: 'verb',
    cefr_level: 'B2',
    priority_tier: 'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED',
    sense_status: 'MATCH_CONFIDENT',
    sense_index: 1,
    sense_key: 'abandon%2:31:00::',
    oewn_synset_id: '00611234-v',
    meaning_en: 'forsake, leave behind or surrender completely',
    meaning_source: 'OEWN-2024',
    meaning_review_status: 'SOURCE_VERIFIED',
    meaning_th: 'ละทิ้ง ปล่อยทิ้ง หรือสละสิทธิ์อย่างสิ้นเชิง',
    meaning_th_review_status: 'AI_DRAFT',
    phonetic_ipa: '/əˈbændən/',
    pronunciation_source: 'cmudict',
    pronunciation_review_status: 'SOURCE_VERIFIED',
    pronunciation_variants_ipa: ['/əˈbændən/'],
    example_sentence: 'They had to abandon the sinking ship before sunset.',
    example_review_status: 'SOURCE_VERIFIED',
    topic: 'General',
    provenance: {
      source: 'cefr_j',
      source_name: 'CEFR-J Vocabulary Profile',
      source_version: '1.5',
      original_id: 'cefr_j:v1.5:line:542',
      transformation_method: 'unicode_nfc+trim+cmudict+oewn_match',
      license: 'TUFS-CEFR-J-Permissive',
    },
    lifecycle_status: 'REVIEW_REQUIRED',
    human_review_status: 'Human review pending',
    qa_status: 'REVIEW_REQUIRED',
  };

  // 1. Lifecycle transition rules
  describe('1. Lifecycle State Machine Transitions', () => {
    it('transitions from REVIEW_REQUIRED -> APPROVED with valid human review sign-off', () => {
      const approved = applyReviewDecisionToUnit({
        unit: sampleStagedUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_sarah',
        rationale: 'Verified Thai definition accurately captures the CEFR B2 nuance.',
        timestamp: '2026-09-26T12:00:00Z',
      });

      expect(approved.lifecycle_status).toBe('APPROVED');
      expect(approved.human_review_status).toBe('APPROVED');
      expect(approved.is_active).toBe(false);
      expect(approved.reviewed_by).toBe('lexicographer_sarah');
      expect(approved.provenance.human_review.decision).toBe('APPROVED');
    });

    it('transitions from APPROVED -> ACTIVE when promoted with zero blocking issues', () => {
      const approved = applyReviewDecisionToUnit({
        unit: sampleStagedUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_sarah',
        rationale: 'Complete verification of all 8 dimensions.',
      });

      const active = promoteUnitToActive(approved);
      expect(active.lifecycle_status).toBe('ACTIVE');
      expect(active.is_active).toBe(true);
    });

    it('transitions from REVIEW_REQUIRED -> EDIT_REQUIRED when edits are requested', () => {
      const editReq = applyReviewDecisionToUnit({
        unit: sampleStagedUnit,
        decision: 'EDIT_REQUIRED',
        reviewerId: 'lexicographer_lead',
        rationale: 'Thai definition is overly formal; simplify for B2 secondary school learners.',
      });

      expect(editReq.lifecycle_status).toBe('EDIT_REQUIRED');
      expect(editReq.human_review_status).toBe('EDIT_REQUIRED');
      expect(editReq.is_active).toBe(false);
    });

    it('transitions from EDIT_REQUIRED -> APPROVED after edits are applied', () => {
      const editReq = applyReviewDecisionToUnit({
        unit: sampleStagedUnit,
        decision: 'EDIT_REQUIRED',
        reviewerId: 'lexicographer_lead',
        rationale: 'Thai definition needs simplification.',
      });

      const reReviewed = applyReviewDecisionToUnit({
        unit: editReq,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_lead',
        rationale: 'Simplified Thai translation verified and accepted.',
        edits: { meaning_th: 'ละทิ้งหรือทอดทิ้ง' },
      });

      expect(reReviewed.lifecycle_status).toBe('APPROVED');
      expect(reReviewed.meaning_th).toBe('ละทิ้งหรือทอดทิ้ง');
    });

    it('transitions from REVIEW_REQUIRED -> HOLD or REJECTED', () => {
      const held = applyReviewDecisionToUnit({
        unit: sampleStagedUnit,
        decision: 'HOLD',
        reviewerId: 'curriculum_lead',
        rationale: 'Awaiting regional curriculum committee review on B2 level placement.',
      });
      expect(held.lifecycle_status).toBe('HOLD');

      const rejected = applyReviewDecisionToUnit({
        unit: sampleStagedUnit,
        decision: 'REJECT',
        reviewerId: 'curriculum_lead',
        rationale: 'Archaic orthographic variation unsuited for standard learner corpus.',
      });
      expect(rejected.lifecycle_status).toBe('REJECTED');
    });
  });

  // 2, 3, 4, 5. Illegal Direct Promotions Blocked
  describe('2-5. Promotion Refusal & Security Invariants', () => {
    it('refuses to promote REVIEW_REQUIRED directly to ACTIVE', () => {
      expect(() => promoteUnitToActive(sampleStagedUnit)).toThrow(
        /Illegal direct promotion: unit .* has lifecycle_status "REVIEW_REQUIRED"/
      );
    });

    it('refuses to promote EDIT_REQUIRED directly to ACTIVE', () => {
      const editReq = { ...sampleStagedUnit, lifecycle_status: 'EDIT_REQUIRED' };
      expect(() => promoteUnitToActive(editReq)).toThrow(/Illegal direct promotion/);
    });

    it('refuses to promote HOLD directly to ACTIVE', () => {
      const held = { ...sampleStagedUnit, lifecycle_status: 'HOLD' };
      expect(() => promoteUnitToActive(held)).toThrow(/Illegal direct promotion/);
    });

    it('refuses to promote REJECTED directly to ACTIVE', () => {
      const rej = { ...sampleStagedUnit, lifecycle_status: 'REJECTED' };
      expect(() => promoteUnitToActive(rej)).toThrow(/Illegal direct promotion/);
    });

    it('refuses approval without authenticated reviewerId or rationale', () => {
      expect(() =>
        validateUnitReviewDecision({
          unit: sampleStagedUnit,
          decision: 'APPROVE',
          reviewerId: '',
          rationale: 'Valid rationale',
        })
      ).toThrow(/Valid reviewerId .* is required/);

      expect(() =>
        validateUnitReviewDecision({
          unit: sampleStagedUnit,
          decision: 'APPROVE',
          reviewerId: 'reviewer_1',
          rationale: '',
        })
      ).toThrow(/Review rationale must be provided/);
    });
  });

  // 6. Missing required learner fields block activation
  describe('6. Mandatory Learner Field Integrity', () => {
    it('blocks approval and activation if English meaning is missing or circular', () => {
      const missingEn = { ...sampleStagedUnit, meaning_en: '' };
      expect(() =>
        applyReviewDecisionToUnit({
          unit: missingEn,
          decision: 'APPROVE',
          reviewerId: 'rev_1',
          rationale: 'Trying to approve without English meaning',
        })
      ).toThrow(/MEANING_EN_INVALID_OR_MISSING/);

      const circularEn = { ...sampleStagedUnit, meaning_en: 'abandon' };
      expect(() =>
        applyReviewDecisionToUnit({
          unit: circularEn,
          decision: 'APPROVE',
          reviewerId: 'rev_1',
          rationale: 'Trying to approve circular definition',
        })
      ).toThrow(/MEANING_EN_INVALID_OR_MISSING/);
    });

    it('blocks approval if Thai meaning is corrupted with dual-language parenthetical labels', () => {
      const corruptedTh = {
        ...sampleStagedUnit,
        meaning_th: 'ละทิ้ง (abandon) อย่างสิ้นเชิง',
      };
      expect(() =>
        applyReviewDecisionToUnit({
          unit: corruptedTh,
          decision: 'APPROVE',
          reviewerId: 'rev_1',
          rationale: 'Trying to approve dual-language contamination',
        })
      ).toThrow(/MEANING_TH_INVALID_OR_CORRUPTED/);
    });

    it('blocks approval if example sentence does not contain target word or inflection', () => {
      const invalidEx = {
        ...sampleStagedUnit,
        example_sentence: 'The quick brown fox jumps over the lazy dog.',
      };
      expect(() =>
        applyReviewDecisionToUnit({
          unit: invalidEx,
          decision: 'APPROVE',
          reviewerId: 'rev_1',
          rationale: 'Trying to approve example without target word',
        })
      ).toThrow(/EXAMPLE_INVALID_OR_MISSING_TARGET/);
    });
  });

  // 7. Unresolved blocking IPA (316 items)
  describe('7. Unresolved IPA Disposition Handling', () => {
    const missingIpaUnit = {
      ...sampleStagedUnit,
      learning_unit_key: 're-evaluate|verb|C1|sense:1',
      word: 're-evaluate',
      lemma: 're-evaluate',
      part_of_speech: 'verb',
      cefr_level: 'C1',
      example_sentence: 'We must re-evaluate our test strategy for this release.',
      phonetic_ipa: null,
      pronunciation_review_status: 'UNRESOLVED',
    };

    it('refuses to approve missing IPA item without terminal disposition', () => {
      expect(() =>
        applyReviewDecisionToUnit({
          unit: missingIpaUnit,
          decision: 'APPROVE',
          reviewerId: 'phonetician_dan',
          rationale: 'Approving without IPA disposition',
        })
      ).toThrow(/Cannot APPROVE unit .* with missing phonetic IPA without a terminal disposition/);
    });

    it('approves missing IPA item when valid VERIFIED_PRONUNCIATION disposition and edits are provided', () => {
      const approved = applyReviewDecisionToUnit({
        unit: missingIpaUnit,
        decision: 'APPROVE',
        reviewerId: 'phonetician_dan',
        rationale: 'Transcribed standard British and American English phonetic IPA.',
        edits: { phonetic_ipa: '/ˌriːɪˈvæljueɪt/' },
        ipaDisposition: 'VERIFIED_PRONUNCIATION',
      });

      expect(approved.lifecycle_status).toBe('APPROVED');
      expect(approved.ipa_disposition).toBe('VERIFIED_PRONUNCIATION');
      expect(approved.phonetic_ipa).toBe('/ˌriːɪˈvæljueɪt/');
    });

    it('approves legitimate non-phonetic symbol with NOT_APPLICABLE_NO_PHONETIC_FORM disposition', () => {
      const symbolUnit = {
        ...sampleStagedUnit,
        learning_unit_key: '%|noun|A2|sense:1',
        word: '%',
        lemma: '%',
        part_of_speech: 'noun',
        cefr_level: 'A2',
        phonetic_ipa: null,
        example_sentence: 'Ten % of the learners passed the examination.',
      };

      const approved = applyReviewDecisionToUnit({
        unit: symbolUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_dan',
        rationale: 'Mathematical percentage symbol; spoken form is represented under "percent".',
        ipaDisposition: 'NOT_APPLICABLE_NO_PHONETIC_FORM',
      });

      expect(approved.lifecycle_status).toBe('APPROVED');
      expect(approved.ipa_disposition).toBe('NOT_APPLICABLE_NO_PHONETIC_FORM');
      expect(approved.pronunciation_review_status).toBe('NOT_APPLICABLE');
    });
  });

  // 8. Ambiguous / Conflicting Senses require explicit disposition
  describe('8. Sense Disambiguation & Adjudication Rules', () => {
    const ambiguousSenseUnit = {
      ...sampleStagedUnit,
      learning_unit_key: 'bank|noun|A1|sense:1',
      word: 'bank',
      lemma: 'bank',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_status: 'MATCH_AMBIGUOUS',
      sense_disambiguation_status: 'MATCH_AMBIGUOUS',
      example_sentence: 'I will go to the bank to deposit my money today.',
      candidate_senses_preview: [
        { synset_id: '08432543-n', definition: 'a financial institution' },
        { synset_id: '09213565-n', definition: 'sloping land beside a body of water' },
      ],
    };

    it('refuses to approve ambiguous sense without explicit sense disposition', () => {
      expect(() =>
        applyReviewDecisionToUnit({
          unit: ambiguousSenseUnit,
          decision: 'APPROVE',
          reviewerId: 'lexicographer_mark',
          rationale: 'Trying to approve ambiguous polysemous word',
        })
      ).toThrow(/Cannot APPROVE unit .* with unresolved sense/);
    });

    it('approves ambiguous sense when SELECT_SUPPORTED_SENSE disposition is recorded', () => {
      const approved = applyReviewDecisionToUnit({
        unit: ambiguousSenseUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_mark',
        rationale: 'Selected primary financial institution synset for A1 core inventory.',
        senseDisposition: 'SELECT_SUPPORTED_SENSE',
        edits: {
          oewn_synset_id: '08432543-n',
          sense_key: 'bank%1:14:00::',
        },
      });

      expect(approved.lifecycle_status).toBe('APPROVED');
      expect(approved.sense_disposition).toBe('SELECT_SUPPORTED_SENSE');
      expect(approved.sense_status).toBe('MATCH_CONFIDENT');
    });
  });

  // 9. Provenance Required
  describe('9. Provenance Integrity Check', () => {
    it('flags units with missing provenance fields in 8-dimension audit', () => {
      const missingProv = {
        ...sampleStagedUnit,
        provenance: { source: 'cefr_j' }, // missing source_version, original_id, transformation_method
      };

      const audit = evaluateEightDimensionAudit(missingProv);
      expect(audit.audit_status).toBe('FLAGGED');
      expect(audit.flags).toContain('PROVENANCE_INCOMPLETE');
      expect(audit.dimensions.provenance_and_licensing.status).toBe('FAIL');
    });
  });

  // 10. Duplicate learning_unit_key rejected
  describe('10. Uniqueness & Anti-Collision Invariant', () => {
    it('verifies 0 duplicate learning_unit_keys across the exported batches', () => {
      const batchFiles = fs
        .readdirSync(path.join(projectRoot, 'scripts/content-pipeline/output/batches'))
        .filter((f) => /^LARGE-\d{3}\.json$/.test(f));

      const seenKeys = new Set();
      let duplicatesFound = 0;

      for (const bf of batchFiles.slice(0, 10)) {
        const batch = JSON.parse(
          fs.readFileSync(path.join(projectRoot, 'scripts/content-pipeline/output/batches', bf), 'utf8')
        );
        for (const r of batch.records) {
          if (seenKeys.has(r.learning_unit_key)) {
            duplicatesFound += 1;
          }
          seenKeys.add(r.learning_unit_key);
        }
      }

      expect(duplicatesFound).toBe(0);
    });
  });

  // 11. Reviewer decision persistence in ledger
  describe('11. Review Ledger Persistence', () => {
    it('records review events to reports/vocabulary-human-review-ledger.json with audit trail', () => {
      const tempTestDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-test-'));
      try {
        const event = recordReviewEventToLedger(
          {
            learning_unit_key: sampleStagedUnit.learning_unit_key,
            batch_id: 'LARGE-001',
            reviewer_id: 'qa_reviewer_test',
            previous_status: 'REVIEW_REQUIRED',
            new_status: 'APPROVED',
            decision: 'APPROVE',
            rationale: 'Automated test of audit ledger logging.',
          },
          tempTestDir
        );

        expect(event.event_id).toMatch(/^rev_evt_/);
        expect(event.recorded_at).toBeDefined();

        const ledgerPath = path.join(tempTestDir, 'reports/vocabulary-human-review-ledger.json');
        expect(fs.existsSync(ledgerPath)).toBe(true);
        const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        expect(ledger.events.some((e: any) => e.event_id === event.event_id)).toBe(true);
      } finally {
        fs.rmSync(tempTestDir, { recursive: true, force: true });
      }
    });
  });

  // 12. Batch progress calculation and retrieval
  describe('12. Batch Progress & Navigation', () => {
    it('loads batch LARGE-001 and computes correct progress metrics', () => {
      const batch = loadBatch('LARGE-001', projectRoot);
      expect(batch.batch_id).toBe('LARGE-001');
      expect(batch.records.length).toBe(200);

      const progress = getBatchProgress('LARGE-050', projectRoot);
      expect(progress.batch_id).toBe('LARGE-050');
      expect(progress.total_items).toBe(200);
      expect(progress.pending).toBe(200);
      expect(progress.approved).toBe(0);
      expect(progress.progress_percent).toBe(0);
    });
  });

  // 13. Readiness counts distinction (10,021 inventory vs 21 active, NOT_READY)
  describe('13. Production Readiness Gate Calculations', () => {
    it('reports overall_status = NOT_READY and user_testing_authorized = false', () => {
      const readiness = generateHumanQaReadinessReport({ projectRoot, writeArtifact: false });

      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.verdict_display).toBe('NOT READY');
      expect(readiness.user_testing_authorized).toBe(false);

      expect(readiness.inventory_metrics.total_inventory_unique_learning_units).toBe(10021);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.inventory_metrics.staged_review_required_units).toBe(10000);

      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.learner_ready_metrics.learner_ready_percentage).toBe(0.83);
    }, 15000);
  });

  // 14. Existing 21 ACTIVE records remain valid and untouched
  describe('14. Existing Active Curated Records Safeguard', () => {
    it('preserves all 21 active curated records with APPROVED statuses and non-null fields', () => {
      const activeRecords = loadExistingActiveCuratedVocabulary(projectRoot);
      expect(activeRecords.length).toBe(21);

      for (const rec of activeRecords) {
        expect(rec.lifecycle_status).toBe('ACTIVE');
        expect(rec.is_active).toBe(true);
        expect(rec.meaning_en).toBeTruthy();
        expect(rec.meaning_th).toBeTruthy();
        expect(rec.phonetic_ipa).toBeTruthy();
        expect(rec.example_sentence).toBeTruthy();
        expect(rec.topic).toBeTruthy();

        const audit = evaluateEightDimensionAudit(rec);
        expect(audit.audit_status).toBe('PASS');
      }
    });
  });

  // 15. Production safety checks
  describe('15. Production Database Safety Invariants', () => {
    it('verifies that no production migrations or seeds activated unreviewed content', () => {
      const migrationFiles = fs
        .readdirSync(path.join(projectRoot, 'supabase/migrations'))
        .filter((f) => f.endsWith('.sql'));

      // Check migration 7 has strict active/approved check constraint
      const mig7Content = fs.readFileSync(
        path.join(projectRoot, 'supabase/migrations/20260926000007_add_vocabulary_provenance_and_lifecycle.sql'),
        'utf8'
      );
      expect(mig7Content).toContain('chk_vocabularies_active_approved_enrichment');
      expect(mig7Content).toContain('is_active = FALSE AND lifecycle_status NOT IN (\'APPROVED\', \'ACTIVE\')');

      // Ensure no new migration activated the 10,000 items in bulk
      for (const mf of migrationFiles) {
        const sql = fs.readFileSync(path.join(projectRoot, 'supabase/migrations', mf), 'utf8');
        expect(sql).not.toContain("UPDATE public.vocabularies SET is_active = true WHERE lifecycle_status = 'REVIEW_REQUIRED'");
      }
    });
  });
});
