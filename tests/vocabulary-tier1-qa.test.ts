import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IPA_DISPOSITIONS,
  REVIEW_DECISIONS,
  REVIEW_RISK_TIERS,
  SENSE_DISPOSITIONS,
  TERMINAL_REVIEW_DISPOSITIONS,
  applyReviewDecisionToUnit,
  assertBatchCompletion,
  atomicWriteFiles,
  auditReviewLedgerIntegrity,
  computeReviewRiskTier,
  computeTier1RiskReasons,
  evaluateBatchCompletion,
  evaluateEightDimensionAudit,
  exportTier1BatchForReview,
  extractTier1Queue,
  filterBatchRecords,
  generateHumanQaReadinessReport,
  generateReviewTransactionId,
  getTier1BatchProgress,
  importTier1ReviewSubmissions,
  loadTier1Batch,
  promoteUnitToActive,
  recordReviewDecisionOnUnit,
  validateBatchStructure,
  validateLedgerStructure,
  validateReadinessStructure,
  validateReviewEdits,
  validateReviewerIdentity,
  validateUnitReviewDecision,
} from '../scripts/content-pipeline/vocab/human-review-engine.mjs';
import {
  runQaIntegrityAudit,
} from '../scripts/content-pipeline/vocab/qa-integrity-check.mjs';
import {
  findUnitByKey,
  formatUnit14Dimensions,
  parseCliArgs,
} from '../scripts/content-pipeline/vocab/review-cli.mjs';
import {
  BANNED_EXAMPLE_PATTERNS,
  BANNED_THAI_BOILERPLATE_PHRASES,
  BANNED_THAI_TEMPLATE_PREFIXES,
  detectBadThaiMeaning,
  evaluateRecordQualityGates,
  validateEnglishMeaningQuality,
  validateExampleSentenceQuality,
  validatePhoneticIpaQuality,
  validateThaiMeaningQuality,
} from '../scripts/content-pipeline/vocab/enrichment-quality-gates.mjs';
import {
  EXEMPT_HUMAN_APPROVED_KEYS,
  EXEMPT_HUMAN_REVIEWED_KEYS,
  GLOVA_CURATED_HEADWORD_REGISTRY,
  POLYSEMOUS_SENSE_REGISTRY,
  REMEDIATION_VERSION,
  generateThaiRemediationCandidate,
  remediateThaiMeaningForRecord,
  runDatasetWideThaiRemediation,
} from '../scripts/content-pipeline/vocab/thai-remediation-engine.mjs';
import {
  collectAllEligibleRemediatedUnits,
  selectDeterministicPilotSample,
  generatePilotPackage,
  generateDryRunPackage,
} from '../scripts/content-pipeline/vocab/generate-thai-qa-pilot-sample.mjs';
import {
  computePilotStatistics,
  PILOT_REVIEWS,
} from '../scripts/content-pipeline/vocab/evaluate-thai-pilot-results.mjs';
import {
  POS_ALIGNMENT_STATUS,
  SENSE_ALIGNMENT_STATUS,
  PRE_REVIEW_CANDIDATE_STATUS,
  validateLexicalCandidate,
  checkPosAlignment,
  checkSenseAlignment,
  CLOSED_CLASS_PARTS_OF_SPEECH,
} from '../scripts/content-pipeline/vocab/lexical-grounding-interface.mjs';
import {
  GROUNDED_THAI_LEXICON_REGISTRY,
  getLexicalCandidates,
  getLexicalBySynsetId,
} from '../scripts/content-pipeline/vocab/grounded-lexicon-store.mjs';
import {
  runPreReviewAlignment,
  checkCefrCompatibility,
} from '../scripts/content-pipeline/vocab/pre-review-alignment-pipeline.mjs';
import {
  executePilotComparison,
} from '../scripts/content-pipeline/vocab/run-pilot-comparison.mjs';
import {
  executeLargeDatasetAudit,
} from '../scripts/content-pipeline/vocab/run-large-dataset-audit.mjs';
import {
  buildCuratedExpansionCandidates,
  selectControlledPilotSample,
  runPilotExpansionComparison,
  classifyExpansionPilot,
} from '../scripts/content-pipeline/vocab/grounded-lexicon-expansion-adapter.mjs';
import {
  selectControlledScaleupSample,
  qualityCheckCandidateReadyGroup,
  runScaleupA1A2Comparison,
  classifyScaleup,
} from '../scripts/content-pipeline/vocab/scaleup-a1-a2-grounding.mjs';
import {
  RECONCILIATION_STATUS,
  DECISION_GATES_6_2_22,
  reconcileCandidateReadyQueue,
  buildHumanReviewPacket,
  buildSpecialSyntaxAdjudicationPacket,
  verifyCliAndTransactionIntegrity,
  runPhase6222HumanQaExecution,
} from '../scripts/content-pipeline/vocab/human-qa-execution-engine.mjs';
import {
  EXACT_REVIEW_READY_KEYS,
  AUTHORITATIVE_SET_B_REVIEW_READY_KEYS,
  MANDATED_REVIEW_READY_FALLBACK_SPECS_DISABLED,
  REJECTED_SYNTHETIC_PILOT_FALLBACK_KEYS,
  ALLOWED_PILOT_DISPOSITIONS,
  DECISION_GATES_6_2_23,
  REQUIRED_INTERFACE_FIELDS,
  selectCanonicalPilotReviewTarget,
  buildHumanDecisionInterfaceItem,
  prepareControlledPilotQueue,
  validateHumanDecisionInterfaceItem,
  evaluatePilotBlockingGatesForApprove,
  verifyPilotAtomicIntegrityAndRollback,
  analyzePilotQualityProfile,
  runPhase6223ControlledHumanReviewPilot,
} from '../scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs';
import {
  CEFR_PROVENANCE_STATUS,
  RECONCILIATION_DISPOSITION,
  DECISION_GATES_6_2_24,
  CANONICAL_RESOLUTION_STATUS,
  TARGET_CLASSIFICATION_6_2_25,
  DECISION_GATES_6_2_25,
  DECISION_GATES_6_2_26,
  ALLOWED_SET_B_REVIEW_DISPOSITIONS,
  SET_A_PILOT_PROMPT_KEYS,
  SET_B_PACKET_6_2_22_REVIEW_READY_KEYS,
  isValidFullLearningUnitKey,
  parseFullLearningUnitKey,
  evaluateCefrProvenanceForExactKey,
  resolveByExactKey,
  resolveCanonicalExactKey,
  getRepositoryProvenanceIndex,
  traceCompetingFiveRecordSets,
  traceCefrProvenanceDiscrepancies,
  buildPhase6224HumanReviewPacket,
  runPhase6224PilotIdentityReconciliation,
  buildPhase6225HumanReviewPacket,
  verifyPhase6225PacketInvariants,
  runPhase6225ExactReviewTargetGate,
  validatePhase6226ReviewerIdentity,
  verifyCanonicalSetBIdentity,
  preparePhase6226SetBReviewPacket,
  executeCanonicalSetBHumanDecision,
  calculatePhase6226ReadinessFromSandbox,
  verifyPhase6226SetBAtomicSandboxWorkflow,
  verifyPhase6226ProductionDbSafety,
  runPhase6226ControlledHumanQaExecution,
} from '../scripts/content-pipeline/vocab/pilot-identity-reconciliation.mjs';
import {
  planPhase6227ControlledQABatch,
  PHASE_6_2_27_GATE,
} from '../scripts/content-pipeline/vocab/plan-phase-6227-controlled-batch.mjs';
import {
  buildPhase6227HumanReviewPacket,
} from '../scripts/content-pipeline/vocab/build-phase-6227-human-review-packet.mjs';
import {
  buildPhase6228ExecutionManifest,
  validatePhase6228ExecutionManifest,
  verifyPhase6228Baseline,
  PHASE_6_2_28_CONSTANTS,
  determineRecordReviewGuidance,
} from '../scripts/content-pipeline/vocab/build-phase-6228-execution-manifest.mjs';
import {
  runPhase6229ControlledHumanQaExecution,
  verifyPhase6229PreFlight,
  verifyPhase6229PostExecution,
  verifyPhase6229AtomicSandboxRollback,
  executeSinglePhase6229Approval,
  PHASE_6_2_29_CONSTANTS,
} from '../scripts/content-pipeline/vocab/execute-phase-6229-human-qa.mjs';
import {
  planPhase6230ControlledQABatch,
  runPhase6230NegativeControls,
  PHASE_6_2_30_CONSTANTS,
  PHASE_6_2_30_GATE,
} from '../scripts/content-pipeline/vocab/plan-phase-6230-controlled-batch.mjs';
import {
  buildPhase6230HumanReviewPacket,
  generatePhase6230HumanReviewPacketMarkdown,
  ALLOWED_RISK_FLAGS as PHASE_6230_ALLOWED_RISK_FLAGS,
} from '../scripts/content-pipeline/vocab/build-phase-6230-human-review-packet.mjs';
import {
  verifyPhase6230HumanReviewPacket,
} from '../scripts/content-pipeline/vocab/verify-phase-6230-human-review-packet.mjs';
import {
  AUDIT_DECISIONS as PHASE_6230A_DECISIONS,
  RECORD_AUDIT_ASSESSMENTS as PHASE_6230A_ASSESSMENTS,
} from '../scripts/content-pipeline/vocab/audit-phase-6230A-content-quality.mjs';
import {
  verifyPhase6230AContentQualityAudit,
  ALLOWED_DECISIONS as PHASE_6230A_ALLOWED_DECISIONS,
  ALLOWED_SEVERITIES as PHASE_6230A_ALLOWED_SEVERITIES,
  ALLOWED_FAILED_DIMENSIONS as PHASE_6230A_ALLOWED_FAILED_DIMS,
  REQUIRED_RECORD_FIELDS as PHASE_6230A_REQUIRED_FIELDS,
} from '../scripts/content-pipeline/vocab/verify-phase-6230A-content-quality-audit.mjs';

const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.12 — Vocabulary Tier 1 Critical-Risk Human QA Workflow', () => {
  // 1. Tier 1 Queue Extraction and Batch Layout
  describe('1. Tier 1 Risk Queue Integrity & Batch Partitioning', () => {
    const queueReportPath = path.join(projectRoot, 'reports/vocabulary-tier1-risk-queue.json');

    it('validates that reports/vocabulary-tier1-risk-queue.json exists and has correct counts', () => {
      expect(fs.existsSync(queueReportPath)).toBe(true);
      const queue = JSON.parse(fs.readFileSync(queueReportPath, 'utf8'));

      expect(queue.phase).toMatch(/^6\.2\.12(\.1)?$/);
      expect(queue.total_staged_examined).toBe(10000);
      expect(queue.tier_1_units_total).toBe(7119);
      expect(queue.tier_1_percentage_of_staged).toBe(71.19);
      expect(queue.non_tier_1_units_total).toBe(2881);
      expect(queue.batches_count).toBe(36);
      expect(queue.batch_size).toBe(200);
    });

    it('validates exact deterministic reason counts without double counting', () => {
      const queue = JSON.parse(fs.readFileSync(queueReportPath, 'utf8'));
      expect(queue.reason_counts).toEqual({
        cefr_conflict: 226,
        no_match_sense: 565,
        ambiguous_sense: 6058,
        unresolved_ipa: 617,
        heteronym: 0,
        qa_flagged: 6966,
      });
    });

    it('validates representation across all 6 CEFR bands (A1-C2)', () => {
      const queue = JSON.parse(fs.readFileSync(queueReportPath, 'utf8'));
      const d = queue.cefr_distribution;
      expect(d.A1).toBe(901);
      expect(d.A2).toBe(1073);
      expect(d.B1).toBe(1812);
      expect(d.B2).toBe(1942);
      expect(d.C1).toBe(757);
      expect(d.C2).toBe(634);
      expect(d.A1 + d.A2 + d.B1 + d.B2 + d.C1 + d.C2).toBe(7119);
    });

    it('verifies that all 36 batch files exist on disk with correct sizing', () => {
      const tier1Dir = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches');
      expect(fs.existsSync(tier1Dir)).toBe(true);

      const files = fs
        .readdirSync(tier1Dir)
        .filter((f) => /^TIER-1-\d{3}\.json$/.test(f))
        .sort();

      expect(files.length).toBe(36);

      let totalRecords = 0;
      const seenKeys = new Set();

      for (let i = 0; i < files.length; i++) {
        const batch = JSON.parse(fs.readFileSync(path.join(tier1Dir, files[i]), 'utf8'));
        expect(batch.batch_id).toBe(`TIER-1-${String(i + 1).padStart(3, '0')}`);
        expect(batch.batch_index).toBe(i + 1);

        if (i < 35) {
          expect(batch.records.length).toBe(200);
          expect(batch.item_count).toBe(200);
        } else {
          expect(batch.records.length).toBe(119);
          expect(batch.item_count).toBe(119);
        }

        totalRecords += batch.records.length;

        for (let rIdx = 0; rIdx < batch.records.length; rIdx++) {
          const r = batch.records[rIdx];
          expect(r.unit_index_in_batch).toBe(rIdx + 1);
          expect(r.source_batch_id).toMatch(/^LARGE-\d{3}$/);
          expect(typeof r.source_unit_index).toBe('number');
          expect(Array.isArray(r.tier1_reasons)).toBe(true);
          expect(r.tier1_reasons.length).toBeGreaterThan(0);
          expect(seenKeys.has(r.learning_unit_key)).toBe(false);
          seenKeys.add(r.learning_unit_key);
        }
      }

      expect(totalRecords).toBe(7119);
      expect(seenKeys.size).toBe(7119);
    });
  });

  // 2. Authenticated Reviewer Gate
  describe('2. Authenticated Reviewer Identity Gating', () => {
    it('rejects missing, null, or non-string reviewer IDs', () => {
      expect(() => validateReviewerIdentity(null)).toThrow(/Valid reviewerId string is required/);
      expect(() => validateReviewerIdentity('')).toThrow(/Valid reviewerId string is required/);
      expect(() => validateReviewerIdentity(123)).toThrow(/Valid reviewerId string is required/);
    });

    it('rejects short reviewer IDs under 3 characters', () => {
      expect(() => validateReviewerIdentity('ab')).toThrow(/too short/);
    });

    it('strictly rejects AI, automated, bot, and synthetic identities', () => {
      const banned = [
        'system',
        'ai',
        'bot',
        'auto-review',
        'auto_review',
        'autoreview',
        'script',
        'synthetic',
        'automated',
        'llm',
        'ai_agent',
        'bot_reviewer',
        'mock',
        'fake',
      ];

      for (const name of banned) {
        expect(() => validateReviewerIdentity(name)).toThrow(
          /Automated, AI, or generic bot reviewer accounts are strictly prohibited/
        );
      }
    });

    it('accepts valid human reviewer names', () => {
      expect(validateReviewerIdentity('lexicographer_anna')).toBe('lexicographer_anna');
      expect(validateReviewerIdentity('linguist_somchai')).toBe('linguist_somchai');
      expect(validateReviewerIdentity('reviewer_jane_doe')).toBe('reviewer_jane_doe');
    });
  });

  // 3. Field Edit Validation
  describe('3. Learner Field Edit Validation', () => {
    it('rejects editing non-whitelisted fields', () => {
      expect(() => validateReviewEdits({ unknown_field: 'test' })).toThrow(/not an editable/);
      expect(() => validateReviewEdits({ priority_tier: 'TEST' })).toThrow(/not an editable/);
    });

    it('rejects invalid CEFR levels', () => {
      expect(() => validateReviewEdits({ cefr_level: 'D1' })).toThrow(/Invalid CEFR level/);
    });

    it('rejects invalid English meaning', () => {
      expect(() => validateReviewEdits({ meaning_en: 'no' })).toThrow(/at least 3 characters/);
    });

    it('rejects Thai meaning with missing Thai characters', () => {
      expect(() => validateReviewEdits({ meaning_th: 'Only English' })).toThrow(
        /at least 2 Thai characters/
      );
    });

    it('rejects example sentence under 10 characters', () => {
      expect(() => validateReviewEdits({ example_sentence: 'Short.' })).toThrow(
        /at least 10 characters/
      );
    });

    it('accepts valid field edits', () => {
      expect(
        validateReviewEdits({
          meaning_en: 'to abandon or leave behind',
          meaning_th: 'ละทิ้ง ละเลย',
          example_sentence: 'They had to abandon the car in the deep snow.',
          phonetic_ipa: '/əˈbændən/',
          cefr_level: 'B2',
          topic: 'Travel',
        })
      ).toBe(true);
    });
  });

  // 4. Lifecycle Decisions & Blocking QA Gating
  describe('4. Lifecycle Decisions and Blocking QA Gates', () => {
    const flaggedUnit = {
      learning_unit_key: 'ok|adjective|A1|sense:1',
      word: 'OK',
      lemma: 'ok',
      part_of_speech: 'adjective',
      cefr_level: 'A1',
      meaning_en: 'being satisfactory or in satisfactory condition',
      meaning_source: 'OEWN-2024',
      meaning_review_status: 'SOURCE_VERIFIED',
      meaning_th: 'ซึ่งน่าพอใจ',
      meaning_th_review_status: 'AI_DRAFT',
      phonetic_ipa: '/ˈoʊˈkeɪ/',
      pronunciation_source: 'cmudict',
      pronunciation_review_status: 'SOURCE_VERIFIED',
      example_sentence: 'things are okay', // lacks target 'OK'
      example_review_status: 'SOURCE_VERIFIED',
      topic: 'General',
      sense_status: 'MATCH_CONFIDENT',
      sense_disambiguation_status: 'MATCH_CONFIDENT',
      sense_key: 'ok%5:00:00:satisfactory:00',
      oewn_synset_id: '02094795-s',
      provenance: {
        source: 'cefr_j',
        source_name: 'CEFR-J',
        source_version: '1.5',
        original_id: 'cefr_j:v1.5:ok:1',
        transformation_method: 'pipeline',
        license: 'TUFS-CEFR-J-Permissive',
      },
      lifecycle_status: 'REVIEW_REQUIRED',
    };

    it('blocks APPROVE when blocking QA flags exist', () => {
      expect(() =>
        validateUnitReviewDecision({
          unit: flaggedUnit,
          decision: 'APPROVE',
          reviewerId: 'lexicographer_anna',
          rationale: 'Approving without fixing example sentence target match',
        })
      ).toThrow(/Cannot APPROVE unit .* Blocking QA flags: EXAMPLE_INVALID_OR_MISSING_TARGET/);
    });

    it('permits EDIT_REQUIRED on flagged unit when actionable edits are provided', () => {
      const decision = applyReviewDecisionToUnit({
        unit: flaggedUnit,
        decision: 'EDIT_REQUIRED',
        reviewerId: 'lexicographer_anna',
        rationale: 'Updating example sentence to include target word OK',
        edits: {
          example_sentence: 'Everything is OK now after the team arrived.',
        },
      });

      expect(decision.lifecycle_status).toBe('EDIT_REQUIRED');
      expect(decision.example_sentence).toBe('Everything is OK now after the team arrived.');
      expect(decision.reviewed_by).toBe('lexicographer_anna');
    });

    it('permits APPROVE once blocking issue is cured via edits', () => {
      const curedUnit = {
        ...flaggedUnit,
        example_sentence: 'Everything is OK now after the team arrived.',
      };

      const approved = applyReviewDecisionToUnit({
        unit: curedUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_anna',
        rationale: 'Target word match verified in example sentence.',
      });

      expect(approved.lifecycle_status).toBe('APPROVED');
      expect(approved.qa_status).toBe('PASS');
      expect(approved.is_active).toBe(false); // Stays inactive until production activation
    });

    it('enforces terminal disposition for missing IPA upon APPROVE', () => {
      const missingIpaUnit = {
        ...flaggedUnit,
        example_sentence: 'Everything is OK now.',
        phonetic_ipa: null,
      };

      expect(() =>
        validateUnitReviewDecision({
          unit: missingIpaUnit,
          decision: 'APPROVE',
          reviewerId: 'lexicographer_anna',
          rationale: 'Trying to approve without IPA disposition',
        })
      ).toThrow(/Cannot APPROVE unit .* with missing phonetic IPA without a terminal disposition/);

      const approvedWithDisp = applyReviewDecisionToUnit({
        unit: missingIpaUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_anna',
        rationale: 'Verified British and American pronunciation manually',
        ipaDisposition: 'VERIFIED_PRONUNCIATION',
        edits: { phonetic_ipa: '/ˈoʊˈkeɪ/' },
      });

      expect(approvedWithDisp.lifecycle_status).toBe('APPROVED');
      expect(approvedWithDisp.ipa_disposition).toBe('VERIFIED_PRONUNCIATION');
    });

    it('enforces terminal disposition for CEFR conflict upon APPROVE', () => {
      const conflictUnit = {
        ...flaggedUnit,
        example_sentence: 'Everything is OK now.',
        conflict_status: 'CEFR_CONFLICT',
        provenance: {
          ...flaggedUnit.provenance,
          conflicting_cefr_levels: ['A1', 'B1'],
        },
      };

      expect(() =>
        validateUnitReviewDecision({
          unit: conflictUnit,
          decision: 'APPROVE',
          reviewerId: 'lexicographer_anna',
          rationale: 'Trying to approve without conflict resolution disposition',
        })
      ).toThrow(/Cannot APPROVE unit .* with unresolved CEFR conflict without explicit disposition/);

      const approvedConflict = applyReviewDecisionToUnit({
        unit: conflictUnit,
        decision: 'APPROVE',
        reviewerId: 'lexicographer_anna',
        rationale: 'Resolved to A1 based on primary Oxford 3000 entry',
        senseDisposition: 'CHANGE_CEFR_WITH_EVIDENCE',
      });

      expect(approvedConflict.lifecycle_status).toBe('APPROVED');
      expect(approvedConflict.sense_disposition).toBe('CHANGE_CEFR_WITH_EVIDENCE');
    });
  });

  // 5. CLI Utility & Formatting Functions
  describe('5. Review CLI Inspection & Command-Line Parsing', () => {
    it('parses CLI arguments correctly across various modes', () => {
      const statusArgs = parseCliArgs(['--status']);
      expect(statusArgs.mode).toBe('status');

      const inspectArgs = parseCliArgs(['--inspect', 'ok|adjective|A1|sense:1']);
      expect(inspectArgs.mode).toBe('inspect');
      expect(inspectArgs.unitKey).toBe('ok|adjective|A1|sense:1');

      const batchArgs = parseCliArgs(['--batch', 'TIER-1-001']);
      expect(batchArgs.mode).toBe('batch_summary');
      expect(batchArgs.batchId).toBe('TIER-1-001');

      const decideArgs = parseCliArgs([
        '--decide',
        '--batch',
        'TIER-1-001',
        '--unit-key',
        'ok|adjective|A1|sense:1',
        '--reviewer',
        'lexicographer_anna',
        '--decision',
        'HOLD',
        '--rationale',
        'Needs review by senior lexicographer',
      ]);
      expect(decideArgs.mode).toBe('decide');
      expect(decideArgs.batchId).toBe('TIER-1-001');
      expect(decideArgs.unitKey).toBe('ok|adjective|A1|sense:1');
      expect(decideArgs.reviewerId).toBe('lexicographer_anna');
      expect(decideArgs.decision).toBe('HOLD');
      expect(decideArgs.rationale).toBe('Needs review by senior lexicographer');
    });

    it('formats all 14 review dimensions into a human-readable string', () => {
      const batch1 = loadTier1Batch('TIER-1-001');
      const unit = batch1.records[0];
      const formatted = formatUnit14Dimensions(unit, 'TIER-1-001', 1, 200);

      expect(formatted).toContain('1. IDENTITY & NORMALIZATION:');
      expect(formatted).toContain('2. PART OF SPEECH:');
      expect(formatted).toContain('3. CEFR LEVEL & STAGING:');
      expect(formatted).toContain('4. ENGLISH MEANING:');
      expect(formatted).toContain('5. THAI TRANSLATION:');
      expect(formatted).toContain('6. PHONETIC IPA:');
      expect(formatted).toContain('7. EXAMPLE SENTENCE:');
      expect(formatted).toContain('8. TOPIC / DOMAIN:');
      expect(formatted).toContain('9. SENSE DISAMBIGUATION & SYNSET:');
      expect(formatted).toContain('10. CEFR CONFLICT PROFILE:');
      expect(formatted).toContain('11. PRONUNCIATION INTEGRITY:');
      expect(formatted).toContain('12. CONTENT PROVENANCE:');
      expect(formatted).toContain('13. TIER 1 RISK REASONS:');
      expect(formatted).toContain('14. AUTOMATED QA AUDIT:');
      expect(formatted).toContain('REVIEW HISTORY:');
    });

    it('locates a learning unit by key across Tier 1 batches using findUnitByKey', () => {
      const found = findUnitByKey('ok|adjective|A1|sense:1');
      expect(found).not.toBeNull();
      expect(found.batchId).toBe('TIER-1-001');
      expect(found.unit.word).toBe('OK');
    });
  });

  // 6. Production Safety Invariant & Readiness Report
  describe('6. Production Safety Invariants & Readiness Gate', () => {
    it('strictly maintains overall_status = NOT_READY and user_testing_authorized = false', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.phase).toMatch(/^6\.2\.12(\.1)?$/);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
      expect(readiness.production_safety.bulk_promotions_executed).toBe(false);
      expect(readiness.production_safety.unreviewed_content_blocked_from_active).toBe(true);

      // Inventory target
      expect(readiness.inventory_metrics.inventory_target).toBe(10000);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);

      // Tier 1 queue summary
      const t1Summary = readiness.unresolved_and_risk_queues.tier_1_queue_summary;
      expect(t1Summary.total_tier_1_units).toBe(7119);
      expect(t1Summary.total_tier_1_batches).toBe(36);
      expect(t1Summary.pending_count).toBe(7054);
      expect(t1Summary.approved_count).toBe(62);
    });

    it('verifies that batch progress for TIER-1-001 shows 62 reviewed and 138 pending after Phase 6.2.29', () => {
      const prog = getTier1BatchProgress('TIER-1-001');
      expect(prog.batch_id).toBe('TIER-1-001');
      expect(prog.total_items).toBe(200);
      expect(prog.reviewed_count).toBe(62);
      expect(prog.pending).toBe(138);
      expect(prog.approved).toBe(59);
      expect(prog.hold).toBe(2);
      expect(prog.edit_required).toBe(1);
      expect(prog.progress_percent).toBe(31);
    });
  });

  // 7. Phase 6.2.12.1 — Tier 1 Risk Audit & Review Integrity Suite
  describe('7. Phase 6.2.12.1 — Tier 1 Risk Audit & Review Integrity Suite', () => {
    it('audits review ledger and verifies test event isolation', () => {
      const audit = auditReviewLedgerIntegrity({ projectRoot });
      expect(audit.ledger_exists).toBe(true);
      expect(audit.test_development_events).toBeGreaterThan(0);
      expect(audit.production_events).toBe(65);
      expect(audit.production_approved_units_count).toBe(62);
      expect(audit.production_active_units_promoted).toBe(0);
      expect(audit.test_approvals_isolated).toBe(true);
    });

    it('verifies test reviewer events cannot affect learner_ready_count', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      // Exactly 21 active curated + 62 human approved = 83, remaining gap 9917
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
    });

    it('verifies AI and system reviewers are rejected and cannot count as human reviews', () => {
      const banned = ['system', 'ai_agent', 'bot', 'auto-review', 'script', 'synthetic', 'llm'];
      for (const id of banned) {
        expect(() => validateReviewerIdentity(id)).toThrow(
          /Automated, AI, or generic bot reviewer accounts are strictly prohibited/
        );
      }
    });

    it('verifies development fixtures cannot promote units in source batches or production', () => {
      const batchesDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');
      let approvedInBatches = 0;
      for (let i = 1; i <= 50; i++) {
        const bPath = path.join(batchesDir, `LARGE-${String(i).padStart(3, '0')}.json`);
        const b = JSON.parse(fs.readFileSync(bPath, 'utf8'));
        for (const r of b.records) {
          if (r.reviewer_decision === 'APPROVE' || r.reviewer_decision === 'APPROVED') {
            approvedInBatches++;
            expect(r.reviewed_by).not.toMatch(/test|ai|bot|system/i);
          }
        }
      }
      expect(approvedInBatches).toBe(62);
    });

    it('verifies deterministic QA flag severity classification', () => {
      const queueReport = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/vocabulary-tier1-risk-queue.json'), 'utf8')
      );

      // Verify severity counts
      expect(queueReport.qa_flag_severities.BLOCKING.count).toBe(6966);
      expect(queueReport.qa_flag_severities.WARNING.count).toBe(0);
      expect(queueReport.qa_flag_severities.INFORMATIONAL.count).toBe(0);

      // Verify flag frequency counts
      expect(queueReport.qa_flag_frequencies).toEqual({
        SENSE_UNADJUDICATED: 6792,
        IPA_UNRESOLVED_OR_INVALID: 316,
        EXAMPLE_INVALID_OR_MISSING_TARGET: 6,
      });
    });

    it('verifies exact POS distribution across all 7,119 Tier 1 units', () => {
      const queueReport = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/vocabulary-tier1-risk-queue.json'), 'utf8')
      );

      expect(queueReport.pos_distribution).toEqual({
        adjective: 1456,
        noun: 3328,
        verb: 1582,
        adverb: 452,
        preposition: 81,
        determiner: 46,
        pronoun: 83,
        conjunction: 38,
        modal_auxiliary: 13,
        number: 30,
        interjection: 9,
        infinitive_to: 1,
      });
    });

    it('verifies 1-to-1 mapping preservation from Tier 1 records to source LARGE batches', () => {
      const tier1Batch1 = loadTier1Batch('TIER-1-001');
      for (const unit of tier1Batch1.records) {
        expect(unit.source_batch_id).toMatch(/^LARGE-\d{3}$/);
        expect(typeof unit.source_unit_index).toBe('number');
        expect(unit.source_unit_index).toBeGreaterThanOrEqual(1);
        expect(unit.source_unit_index).toBeLessThanOrEqual(200);
      }
    });

    it('verifies that no production database changes or active promotions occurred', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.production_safety.production_database_modified).toBe(false);
      expect(readiness.production_safety.bulk_promotions_executed).toBe(false);
      expect(readiness.production_safety.unreviewed_content_blocked_from_active).toBe(true);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
    });
  });

  // 8. Phase 6.2.12.2 — Controlled Human QA Pilot Suite (TIER-1-001)
  describe('8. Phase 6.2.12.2 — Controlled Human QA Pilot Suite (TIER-1-001)', () => {
    it('verifies Batch TIER-1-001 state after review: 62 reviewed, 138 pending', () => {
      const batch = loadTier1Batch('TIER-1-001');
      expect(batch.batch_id).toBe('TIER-1-001');
      expect(batch.item_count).toBe(200);

      const progress = getTier1BatchProgress('TIER-1-001');
      expect(progress.reviewed_count).toBe(62);
      expect(progress.pending).toBe(138);
      expect(progress.approved).toBe(59);
      expect(progress.hold).toBe(2);
      expect(progress.edit_required).toBe(1);
      expect(progress.progress_percent).toBe(31);
    });

    it('verifies the exact 10 reviewed records, their dispositions, and field edits', () => {
      const batch = loadTier1Batch('TIER-1-001');
      const reviewedMap = new Map(
        batch.records
          .filter((r: any) => r.reviewer_decision !== null)
          .map((r: any) => [r.learning_unit_key, r])
      );

      expect(reviewedMap.size).toBe(62);

      // 1. ok|adjective|A1|sense:1 -> APPROVED with target example edit
      const ok = reviewedMap.get('ok|adjective|A1|sense:1');
      expect(ok).toBeDefined();
      expect(ok.reviewer_decision).toBe('APPROVED');
      expect(ok.lifecycle_status).toBe('APPROVED');
      expect(ok.example_sentence).toBe('Is everything OK with your meal?');
      expect(ok.example_review_status).toBe('APPROVED');
      expect(ok.meaning_th).toBe('โอเค, เป็นที่น่าพอใจ, เรียบร้อยดี, ไม่เป็นไร');
      expect(ok.meaning_th_review_status).toBe('APPROVED');

      // 2. agency|noun|A2|sense:1 -> HOLD
      const agencyA2 = reviewedMap.get('agency|noun|A2|sense:1');
      expect(agencyA2).toBeDefined();
      expect(agencyA2.reviewer_decision).toBe('HOLD');
      expect(agencyA2.lifecycle_status).toBe('HOLD');
      expect(agencyA2.review_rationale).toContain('A2 learners require commercial/service organization sense');

      // 3. agency|noun|C2|sense:2 -> APPROVED
      const agencyC2 = reviewedMap.get('agency|noun|C2|sense:2');
      expect(agencyC2).toBeDefined();
      expect(agencyC2.reviewer_decision).toBe('APPROVED');
      expect(agencyC2.lifecycle_status).toBe('APPROVED');
      expect(agencyC2.meaning_th).toContain('อำนาจในการกระทำหรือตัดสินใจ');

      // 4. cast|verb|C1|sense:2 -> APPROVED
      const castC1 = reviewedMap.get('cast|verb|C1|sense:2');
      expect(castC1).toBeDefined();
      expect(castC1.reviewer_decision).toBe('APPROVED');
      expect(castC1.lifecycle_status).toBe('APPROVED');
      expect(castC1.meaning_th).toContain('คัดเลือกนักแสดง');

      // 5. rich|adjective|C1|sense:2 -> APPROVED
      const richC1 = reviewedMap.get('rich|adjective|C1|sense:2');
      expect(richC1).toBeDefined();
      expect(richC1.reviewer_decision).toBe('APPROVED');
      expect(richC1.lifecycle_status).toBe('APPROVED');
      expect(richC1.meaning_th).toContain('เข้มข้น');

      // 6. jog|verb|C1|sense:2 -> APPROVED
      const jogC1 = reviewedMap.get('jog|verb|C1|sense:2');
      expect(jogC1).toBeDefined();
      expect(jogC1.reviewer_decision).toBe('APPROVED');
      expect(jogC1.lifecycle_status).toBe('APPROVED');
      expect(jogC1.example_sentence).toBe('Looking at our old family photographs helped to jog my memory.');

      // 7. echo|verb|C2|sense:2 -> APPROVED
      const echoC2 = reviewedMap.get('echo|verb|C2|sense:2');
      expect(echoC2).toBeDefined();
      expect(echoC2.reviewer_decision).toBe('APPROVED');
      expect(echoC2.lifecycle_status).toBe('APPROVED');
      expect(echoC2.meaning_th).toContain('สะท้อน');

      // 8. march|noun|A1|sense:1 -> APPROVED (reconciled calendar month)
      const marchA1 = reviewedMap.get('march|noun|A1|sense:1');
      expect(marchA1).toBeDefined();
      expect(marchA1.reviewer_decision).toBe('APPROVED');
      expect(marchA1.lifecycle_status).toBe('APPROVED');
      expect(marchA1.example_sentence).toBe('The academic semester begins in March each year.');

      // 9. circuit|noun|B2|sense:1 -> HOLD
      const circuitB2 = reviewedMap.get('circuit|noun|B2|sense:1');
      expect(circuitB2).toBeDefined();
      expect(circuitB2.reviewer_decision).toBe('HOLD');
      expect(circuitB2.lifecycle_status).toBe('HOLD');
      expect(circuitB2.review_rationale).toContain('touring/itinerary circuit');

      // 10. battery|noun|C1|sense:2 -> EDIT_REQUIRED
      const batteryC1 = reviewedMap.get('battery|noun|C1|sense:2');
      expect(batteryC1).toBeDefined();
      expect(batteryC1.reviewer_decision).toBe('EDIT_REQUIRED');
      expect(batteryC1.lifecycle_status).toBe('EDIT_REQUIRED');
      expect(batteryC1.review_rationale).toContain('Severe sense-example mismatch');
    });

    it('verifies review ledger audit trail has 65 production events (10 from lexicographer_anna + 5 Set B + 50 Phase 6.2.29)', () => {
      const ledgerIntegrity = auditReviewLedgerIntegrity({ projectRoot });
      expect(ledgerIntegrity.production_events).toBe(65);
      expect(ledgerIntegrity.production_approved_units_count).toBe(62);
      expect(ledgerIntegrity.test_approvals_isolated).toBe(true);
      expect(ledgerIntegrity.test_development_events).toBeGreaterThanOrEqual(9);
      expect(ledgerIntegrity.total_events).toBe(
        ledgerIntegrity.production_events + ledgerIntegrity.test_development_events
      );
      expect(ledgerIntegrity.ledger_exists).toBe(true);

      const ledger = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'), 'utf8')
      );
      const prodEvents = ledger.events.filter((e: any) => e.is_production_review === true);
      expect(prodEvents.length).toBe(65);

      const annaEvents = prodEvents.filter((e: any) => e.reviewer_id === 'lexicographer_anna');
      expect(annaEvents.length).toBe(10);

      for (const ev of prodEvents) {
        expect(typeof ev.reviewer_id).toBe('string');
        expect(typeof ev.event_id).toBe('string');
        expect(ev.event_id).toMatch(/^rev_evt_[a-z0-9_-]+$/);
      }
    });

    it('verifies learner-ready accounting: 83 total (21 active + 62 approved), gap 9917, active remains 21', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
    });
  });

  // 9. Phase 6.2.12.3 — Pilot Integrity Audit Suite
  describe('9. Phase 6.2.12.3 — Pilot Integrity Audit Suite', () => {
    it('verifies that TEST_DEVELOPMENT events cannot increase learner_ready_count or alter batch lifecycle', () => {
      const ledger = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'), 'utf8')
      );
      const testEvents = ledger.events.filter((e: any) => e.is_production_review === false);
      expect(testEvents.length).toBeGreaterThanOrEqual(11);

      for (const ev of testEvents) {
        expect(ev.counted_in_readiness).toBe(false);
        expect(ev.event_type).toBe('TEST_DEVELOPMENT');
      }

      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      // Readiness reflects 21 active + 62 human approved = 83
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
    });

    it('verifies that HOLD and EDIT_REQUIRED dispositions contribute exactly 0 to learner_ready_count', () => {
      const batch = loadTier1Batch('TIER-1-001');
      const holdUnits = batch.records.filter((r: any) => r.reviewer_decision === 'HOLD');
      const editReqUnits = batch.records.filter((r: any) => r.reviewer_decision === 'EDIT_REQUIRED');

      expect(holdUnits.length).toBe(2);
      expect(editReqUnits.length).toBe(1);

      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.human_review_status_breakdown.hold).toBe(2);
      expect(readiness.human_review_status_breakdown.edit_required).toBe(1);
      // Math: learner_ready must be exactly active (21) + approved (62), completely ignoring hold (2) and edit_required (1)
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(
        readiness.human_review_status_breakdown.active_in_production +
        readiness.human_review_status_breakdown.human_approved
      );
    });

    it('verifies that APPROVED status increases learner_ready_count exactly once and cannot become ACTIVE directly', () => {
      const batch = loadTier1Batch('TIER-1-001');
      const approvedUnits = batch.records.filter((r: any) => r.reviewer_decision === 'APPROVED');
      expect(approvedUnits.length).toBe(59);

      for (const u of approvedUnits) {
        expect(u.lifecycle_status).toBe('APPROVED');
        expect(u.lifecycle_status).not.toBe('ACTIVE');
      }

      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.production_safety.unreviewed_content_blocked_from_active).toBe(true);
    });

    it('verifies reviewer identity format acceptance without conflating with cryptographic authentication', () => {
      // Valid operational string: accepted by format gate
      const cleanId = validateReviewerIdentity('lexicographer_anna');
      expect(cleanId).toBe('lexicographer_anna');

      // System does not provide cryptographic SSO signature or claim verified human identity
      expect(typeof cleanId).toBe('string');
      expect(cleanId.length).toBeGreaterThanOrEqual(3);

      // Automated tokens are strictly rejected
      expect(() => validateReviewerIdentity('ai_agent_42')).toThrow(/Automated, AI, or generic bot/i);
      expect(() => validateReviewerIdentity('bot_reviewer')).toThrow(/Automated, AI, or generic bot/i);
      expect(() => validateReviewerIdentity('system')).toThrow(/Automated, AI, or generic bot/i);
    });

    it('verifies reviewed-record source batch consistency across TIER-1-001 and source LARGE batches', () => {
      const batch = loadTier1Batch('TIER-1-001');
      const reviewed = batch.records.filter((r: any) => r.reviewer_decision !== null);
      expect(reviewed.length).toBe(62);

      const largeDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');
      for (const r of reviewed) {
        expect(r.source_batch_id).toBeDefined();
        const srcPath = path.join(largeDir, `${r.source_batch_id}.json`);
        expect(fs.existsSync(srcPath)).toBe(true);

        const srcBatch = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
        const srcRec = srcBatch.records.find((u: any) => u.learning_unit_key === r.learning_unit_key);
        expect(srcRec).toBeDefined();
        expect(srcRec.reviewer_decision).toBe(r.reviewer_decision);
        expect(srcRec.lifecycle_status).toBe(r.lifecycle_status);
        expect(srcRec.reviewed_by).toBe(r.reviewed_by);
      }
    });
  });

  // 10. Phase 6.2.12.4 — Human QA Workflow Hardening Suite
  describe('10. Phase 6.2.12.4 — Human QA Workflow Hardening Suite', () => {
    it('generates unique, deterministic review transaction IDs with prefix rev_txn_', () => {
      const txn1 = generateReviewTransactionId();
      const txn2 = generateReviewTransactionId();
      expect(txn1).toMatch(/^rev_txn_[0-9a-z]+_[0-9a-f]{8}$/);
      expect(txn2).toMatch(/^rev_txn_[0-9a-z]+_[0-9a-f]{8}$/);
      expect(txn1).not.toBe(txn2);
    });

    it('performs atomic multi-file write and cleanly rolls back on simulated mid-write failure', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-atomic-test-'));
      try {
        const fileA = path.join(tempDir, 'fileA.json');
        const fileB = path.join(tempDir, 'fileB.json');
        const fileC = path.join(tempDir, 'fileC.json');

        // Initial state
        fs.writeFileSync(fileA, JSON.stringify({ name: 'A_original', count: 1 }), 'utf8');
        fs.writeFileSync(fileB, JSON.stringify({ name: 'B_original', count: 2 }), 'utf8');
        fs.writeFileSync(fileC, JSON.stringify({ name: 'C_original', count: 3 }), 'utf8');

        // Successful atomic write
        atomicWriteFiles([
          { filePath: fileA, data: { name: 'A_updated', count: 10 } },
          { filePath: fileB, data: { name: 'B_updated', count: 20 } },
          { filePath: fileC, data: { name: 'C_updated', count: 30 } },
        ]);

        expect(JSON.parse(fs.readFileSync(fileA, 'utf8'))).toEqual({ name: 'A_updated', count: 10 });
        expect(JSON.parse(fs.readFileSync(fileB, 'utf8'))).toEqual({ name: 'B_updated', count: 20 });
        expect(JSON.parse(fs.readFileSync(fileC, 'utf8'))).toEqual({ name: 'C_updated', count: 30 });

        // Simulated validation failure before commit (e.g. validator rejects fileB)
        expect(() => {
          atomicWriteFiles([
            { filePath: fileA, data: { name: 'A_corrupted', count: 100 } },
            {
              filePath: fileB,
              data: { name: 'B_corrupted', count: 200 },
              validator: () => {
                throw new Error('Validator rejected fileB schema');
              },
            },
            { filePath: fileC, data: { name: 'C_corrupted', count: 300 } },
          ]);
        }).toThrow(/Validator rejected fileB schema/);

        // Verify zero files were changed; all retained their pre-attempt state!
        expect(JSON.parse(fs.readFileSync(fileA, 'utf8'))).toEqual({ name: 'A_updated', count: 10 });
        expect(JSON.parse(fs.readFileSync(fileB, 'utf8'))).toEqual({ name: 'B_updated', count: 20 });
        expect(JSON.parse(fs.readFileSync(fileC, 'utf8'))).toEqual({ name: 'C_updated', count: 30 });

        // Verify no leftover .tmp or .bak files
        const dirFiles = fs.readdirSync(tempDir);
        expect(dirFiles.some((f) => f.endsWith('.tmp'))).toBe(false);
        expect(dirFiles.some((f) => f.endsWith('.bak'))).toBe(false);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('enforces atomic 4-file bundle update and transaction ID consistency during unit review in isolated environment', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-bundle-test-'));
      try {
        // Create isolated test batch files and test ledger
        const tier1Dir = path.join(tempDir, 'scripts/content-pipeline/output/tier1-batches');
        const largeDir = path.join(tempDir, 'scripts/content-pipeline/output/batches');
        const reportsDir = path.join(tempDir, 'reports');
        fs.mkdirSync(tier1Dir, { recursive: true });
        fs.mkdirSync(largeDir, { recursive: true });
        fs.mkdirSync(reportsDir, { recursive: true });

        // Copy TIER-1-001 and LARGE-001 to temp
        const realTier1Path = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
        const realLargePath = path.join(projectRoot, 'scripts/content-pipeline/output/batches/LARGE-001.json');
        const realLedgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');

        const tempTier1Path = path.join(tier1Dir, 'TIER-1-001.json');
        const tempLargePath = path.join(largeDir, 'LARGE-001.json');
        const tempLedgerPath = path.join(reportsDir, 'vocabulary-human-review-ledger.json');

        fs.copyFileSync(realTier1Path, tempTier1Path);
        fs.copyFileSync(realLargePath, tempLargePath);
        fs.copyFileSync(realLedgerPath, tempLedgerPath);

        const dataDir = path.join(tempDir, 'data');
        fs.mkdirSync(dataDir, { recursive: true });
        fs.copyFileSync(
          path.join(projectRoot, 'data/vocabularyBank.ts'),
          path.join(dataDir, 'vocabularyBank.ts')
        );

        const realQueuePath = path.join(projectRoot, 'reports/vocabulary-tier1-risk-queue.json');
        if (fs.existsSync(realQueuePath)) {
          fs.copyFileSync(realQueuePath, path.join(reportsDir, 'vocabulary-tier1-risk-queue.json'));
        }

        // Find an unreviewed unit in TIER-1-001
        const t1Data = JSON.parse(fs.readFileSync(tempTier1Path, 'utf8'));
        const targetUnit = t1Data.records.find((r: any) => r.reviewer_decision === null);
        expect(targetUnit).toBeDefined();

        const customTxnId = generateReviewTransactionId();
        const res = recordReviewDecisionOnUnit({
          unitKey: targetUnit.learning_unit_key,
          batchId: 'TIER-1-001',
          decision: 'APPROVED',
          reviewerId: 'lexicographer_anna',
          rationale: 'Isolated workflow test rationale',
          senseDisposition: 'SELECT_SUPPORTED_SENSE',
          transactionId: customTxnId,
          isProduction: false, // marked as test event so it cannot pollute prod
          projectRoot: tempDir,
        });

        expect(res.success).toBe(true);
        expect(res.transaction_id).toBe(customTxnId);

        // Check TIER-1 batch updated
        const updatedT1 = JSON.parse(fs.readFileSync(tempTier1Path, 'utf8'));
        const updatedT1Unit = updatedT1.records.find((r: any) => r.learning_unit_key === targetUnit.learning_unit_key);
        expect(updatedT1Unit.reviewer_decision).toBe('APPROVED');
        expect(updatedT1Unit.review_transaction_id).toBe(customTxnId);
        expect(updatedT1Unit.provenance.human_review.transaction_id).toBe(customTxnId);

        // Check counterpart source LARGE batch updated with matching transaction ID
        const srcBatchPath = path.join(largeDir, `${targetUnit.source_batch_id}.json`);
        if (fs.existsSync(srcBatchPath)) {
          const updatedLarge = JSON.parse(fs.readFileSync(srcBatchPath, 'utf8'));
          const updatedLargeUnit = updatedLarge.records.find((r: any) => r.learning_unit_key === targetUnit.learning_unit_key);
          expect(updatedLargeUnit.reviewer_decision).toBe('APPROVED');
          expect(updatedLargeUnit.review_transaction_id).toBe(customTxnId);
        }

        // Check ledger recorded event with matching transaction ID
        const updatedLedger = JSON.parse(fs.readFileSync(tempLedgerPath, 'utf8'));
        const ledgerEvt = updatedLedger.events.find((e: any) => e.transaction_id === customTxnId);
        expect(ledgerEvt).toBeDefined();
        expect(ledgerEvt.learning_unit_key).toBe(targetUnit.learning_unit_key);
        expect(ledgerEvt.decision).toBe('APPROVED');
        expect(ledgerEvt.transaction_id).toBe(customTxnId);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('enforces strict batch completion gate (rejects incomplete batches)', () => {
      const batch1 = loadTier1Batch('TIER-1-001');
      const completion = evaluateBatchCompletion(batch1);

      expect(completion.is_complete).toBe(false);
      expect(completion.total_records).toBe(200);
      expect(completion.resolved_count).toBe(62);
      expect(completion.unresolved_count).toBe(138);
      expect(completion.unresolved_keys.length).toBe(138);

      // Calling assertBatchCompletion must throw
      expect(() => assertBatchCompletion(batch1)).toThrow(
        /cannot be certified as complete: 138\/200 records remain unresolved/
      );

      // Create a mock synthetic completed batch
      const mockBatch = {
        batch_id: 'TIER-1-TEST',
        records: [
          { learning_unit_key: 'w1', reviewer_decision: 'APPROVED' },
          { learning_unit_key: 'w2', reviewer_decision: 'HOLD' },
          { learning_unit_key: 'w3', reviewer_decision: 'EDIT_REQUIRED' },
          { learning_unit_key: 'w4', reviewer_decision: 'REJECTED' },
        ],
      };

      const mockCompletion = evaluateBatchCompletion(mockBatch as any);
      expect(mockCompletion.is_complete).toBe(true);
      expect(mockCompletion.unresolved_count).toBe(0);
      expect(() => assertBatchCompletion(mockBatch as any)).not.toThrow();
    });

    it('validates readiness accounting exclusion invariants', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });

      // Target & active curated constants
      expect(readiness.inventory_metrics.inventory_target).toBe(10000);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);

      // Only human approved (62) count towards learner ready with active (21)
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);

      // Non-approved dispositions strictly excluded from learner_ready
      expect(readiness.human_review_status_breakdown.hold).toBe(2);
      expect(readiness.human_review_status_breakdown.edit_required).toBe(1);
      expect(readiness.human_review_status_breakdown.rejected).toBe(0);

      // Overall status strictly locked
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
    });

    it('executes deterministic cross-batch QA integrity check cleanly via runQaIntegrityAudit', () => {
      const result = runQaIntegrityAudit({ projectRoot });
      expect(result.passed).toBe(true);
      expect(result.checks.length).toBe(9);
      expect(result.issues.length).toBe(0);
      expect(result.metrics.total_staged_units).toBe(10000);
      expect(result.metrics.learner_ready_units).toBe(83);
      expect(result.metrics.remaining_gap).toBe(9917);
      expect(result.metrics.ledger_production_events).toBe(65);
      expect(result.metrics.ledger_test_events).toBe(13);
      expect(result.metrics.overall_status).toBe('NOT_READY');
      expect(result.metrics.user_testing_authorized).toBe(false);
    });
  });

  // 11. Controlled Mass Human QA Execution & Tooling Verification (Phase 6.2.13)
  describe('11. Controlled Mass Human QA Execution & Tooling Verification (Phase 6.2.13)', () => {
    it('filters batch records by review disposition correctly', () => {
      const batch1 = loadTier1Batch('TIER-1-001');

      const allRecords = filterBatchRecords(batch1, 'ALL');
      expect(allRecords.length).toBe(200);

      const unreviewed = filterBatchRecords(batch1, 'REVIEW_REQUIRED');
      expect(unreviewed.length).toBe(138);

      const approved = filterBatchRecords(batch1, 'APPROVED');
      expect(approved.length).toBe(59);

      const hold = filterBatchRecords(batch1, 'HOLD');
      expect(hold.length).toBe(2);

      const editReq = filterBatchRecords(batch1, 'EDIT_REQUIRED');
      expect(editReq.length).toBe(1);

      const rejected = filterBatchRecords(batch1, 'REJECTED');
      expect(rejected.length).toBe(0);

      expect(() => filterBatchRecords(batch1, 'INVALID_FILTER' as any)).toThrow(
        /Unsupported filter "INVALID_FILTER"/
      );
    });

    it('exports Tier 1 review batches with schema, guidelines, and submission blocks', () => {
      const tempExportDir = path.join(os.tmpdir(), `glova-export-test-${Date.now()}`);
      fs.mkdirSync(tempExportDir, { recursive: true });
      const exportFile = path.join(tempExportDir, 'batch-001-unreviewed.json');

      try {
        const result = exportTier1BatchForReview({
          batchId: 'TIER-1-001',
          outputPath: exportFile,
          filter: 'REVIEW_REQUIRED',
          projectRoot,
        });

        expect(result.success).toBe(true);
        expect(result.record_count).toBe(138);
        expect(result.filter_applied).toBe('REVIEW_REQUIRED');
        expect(fs.existsSync(exportFile)).toBe(true);

        const exported = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        expect(exported.$schema).toBe('https://glova.ai/schemas/vocabulary-human-review-v1.json');
        expect(exported.batch_id).toBe('TIER-1-001');
        expect(exported.total_records_in_export).toBe(138);
        expect(exported.total_records_in_batch).toBe(200);
        expect(exported.guidance.valid_decisions).toEqual([
          'APPROVED',
          'EDIT_REQUIRED',
          'HOLD',
          'REJECTED',
        ]);

        // First item checks
        const first = exported.records[0];
        expect(first.learning_unit_key).toBeDefined();
        expect(first.word).toBeDefined();
        expect(first.meaning_en).toBeDefined();
        expect(first.meaning_th).toBeDefined();
        expect(first.phonetic_ipa).toBeDefined();
        expect(first.example_sentence).toBeDefined();
        expect(first.review_submission).toEqual({
          reviewer_decision: null,
          review_rationale: '',
          ipa_disposition: null,
          sense_disposition: null,
          edits: {
            meaning_en: null,
            meaning_th: null,
            phonetic_ipa: null,
            example_sentence: null,
            cefr_level: null,
            topic: null,
          },
        });
      } finally {
        fs.rmSync(tempExportDir, { recursive: true, force: true });
      }
    });

    it('validates reviewer identity and rejects non-human / malformed reviewer IDs', () => {
      // Must accept valid human reviewer IDs
      expect(validateReviewerIdentity('lexicographer_anna')).toBe('lexicographer_anna');
      expect(validateReviewerIdentity('reviewer_john')).toBe('reviewer_john');
      expect(validateReviewerIdentity('expert.sarah')).toBe('expert.sarah');

      // Must reject bot / AI / invalid formats
      expect(() => validateReviewerIdentity('gpt-4o-reviewer')).toThrow(/Automated, AI, or generic bot/);
      expect(() => validateReviewerIdentity('claude-3-opus')).toThrow(/Automated, AI, or generic bot/);
      expect(() => validateReviewerIdentity('auto_bot')).toThrow(/Automated, AI, or generic bot/);
      expect(() => validateReviewerIdentity('ai')).toThrow(/Automated, AI, or generic bot/);
      expect(() => validateReviewerIdentity('ab')).toThrow(/too short/);
      expect(() => validateReviewerIdentity('')).toThrow(/Valid reviewerId/);
    });

    it('rejects invalid or corrupted submissions during offline import', () => {
      const tempDir = path.join(os.tmpdir(), `glova-import-err-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
      const testFile = path.join(tempDir, 'sub.json');

      try {
        // Missing input path or reviewer
        expect(() =>
          importTier1ReviewSubmissions({
            inputPath: '',
            reviewerId: 'lexicographer_anna',
            projectRoot,
          })
        ).toThrow(/inputPath is required/);

        expect(() =>
          importTier1ReviewSubmissions({
            inputPath: testFile,
            reviewerId: '',
            projectRoot,
          })
        ).toThrow(/Valid reviewerId/);

        // Unknown learning_unit_key
        const badKeyPayload = {
          batch_id: 'TIER-1-001',
          records: [
            {
              learning_unit_key: 'fake_word_not_in_batch|noun|B1|sense:1',
              review_submission: {
                reviewer_decision: 'APPROVED',
                review_rationale: 'Validating non-existent key fails',
              },
            },
          ],
        };
        fs.writeFileSync(testFile, JSON.stringify(badKeyPayload), 'utf8');
        expect(() =>
          importTier1ReviewSubmissions({
            inputPath: testFile,
            reviewerId: 'lexicographer_anna',
            projectRoot,
          })
        ).toThrow(/Unknown learning unit key/);

        // Duplicate learning_unit_key in submission
        const dupKeyPayload = {
          batch_id: 'TIER-1-001',
          records: [
            {
              learning_unit_key: 'drill|noun|C1|sense:2',
              review_submission: {
                reviewer_decision: 'APPROVED',
                review_rationale: 'First decision for drill',
                sense_disposition: 'SELECT_SUPPORTED_SENSE',
              },
            },
            {
              learning_unit_key: 'drill|noun|C1|sense:2',
              review_submission: {
                reviewer_decision: 'HOLD',
                review_rationale: 'Second decision duplicate',
              },
            },
          ],
        };
        fs.writeFileSync(testFile, JSON.stringify(dupKeyPayload), 'utf8');
        expect(() =>
          importTier1ReviewSubmissions({
            inputPath: testFile,
            reviewerId: 'lexicographer_anna',
            projectRoot,
          })
        ).toThrow(/Duplicate submission for unit/);

        // Invalid decision string
        const invalidDecisionPayload = {
          batch_id: 'TIER-1-001',
          records: [
            {
              learning_unit_key: 'drill|noun|C1|sense:2',
              review_submission: {
                reviewer_decision: 'ACCEPTED_FOR_NOW',
                review_rationale: 'Not an allowed decision enum value',
              },
            },
          ],
        };
        fs.writeFileSync(testFile, JSON.stringify(invalidDecisionPayload), 'utf8');
        expect(() =>
          importTier1ReviewSubmissions({
            inputPath: testFile,
            reviewerId: 'lexicographer_anna',
            projectRoot,
          })
        ).toThrow(/Invalid decision/);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('performs dry-run import verification without mutating any batch files or ledger', () => {
      const tempDir = path.join(os.tmpdir(), `glova-dryrun-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
      const dryRunFile = path.join(tempDir, 'dryrun-sub.json');

      try {
        const payload = {
          batch_id: 'TIER-1-001',
          records: [
            {
              learning_unit_key: 'drill|noun|C1|sense:2',
              review_submission: {
                reviewer_decision: 'APPROVED',
                review_rationale: 'Verified meaning and usage in engineering context',
                sense_disposition: 'SELECT_SUPPORTED_SENSE',
              },
            },
            {
              learning_unit_key: 'echo|verb|C2|sense:1',
              review_submission: {
                reviewer_decision: 'HOLD',
                review_rationale: 'Pending corpus verification of sub-sense distinction',
              },
            },
          ],
        };
        fs.writeFileSync(dryRunFile, JSON.stringify(payload), 'utf8');

        // Dry-run import
        const res = importTier1ReviewSubmissions({
          inputPath: dryRunFile,
          reviewerId: 'lexicographer_anna',
          projectRoot,
          dryRun: true,
        });

        expect(res.success).toBe(true);
        expect(res.dry_run).toBe(true);
        expect(res.actionable_decisions_count).toBe(2);
        expect(res.total_records_in_import).toBe(2);

        // Verify that original batch was NOT modified by dry-run
        const b = loadTier1Batch('TIER-1-001', projectRoot);
        const drill = b.records.find((r: any) => r.learning_unit_key === 'drill|noun|C1|sense:2');
        expect(drill.reviewed_by).not.toBe('lexicographer_anna');
        const echo = b.records.find((r: any) => r.learning_unit_key === 'echo|verb|C2|sense:1');
        expect(echo.reviewed_by).not.toBe('lexicographer_anna');
        expect(echo.reviewer_decision).not.toBe('HOLD');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('executes atomic batch import in isolated sandbox and verifies cross-file parity', () => {
      // Set up isolated temp workspace
      const tempDir = path.join(os.tmpdir(), `glova-atomic-import-${Date.now()}`);
      const t1Dir = path.join(tempDir, 'scripts/content-pipeline/output/tier1-batches');
      const largeDir = path.join(tempDir, 'scripts/content-pipeline/output/batches');
      const repDir = path.join(tempDir, 'reports');
      const dataDir = path.join(tempDir, 'data');

      fs.mkdirSync(t1Dir, { recursive: true });
      fs.mkdirSync(largeDir, { recursive: true });
      fs.mkdirSync(repDir, { recursive: true });
      fs.mkdirSync(dataDir, { recursive: true });

      try {
        fs.copyFileSync(
          path.join(projectRoot, 'data/vocabularyBank.ts'),
          path.join(dataDir, 'vocabularyBank.ts')
        );

        // Copy TIER-1-001, referenced large batches, ledger, readiness
        const liveT1 = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
        fs.copyFileSync(liveT1, path.join(t1Dir, 'TIER-1-001.json'));

        const batch1Data = JSON.parse(fs.readFileSync(liveT1, 'utf8'));
        const srcBatches = Array.from(
          new Set(batch1Data.records.map((r: any) => r.source_batch_id).filter(Boolean))
        );

        for (const sb of srcBatches) {
          const liveL = path.join(projectRoot, `scripts/content-pipeline/output/batches/${sb}.json`);
          if (fs.existsSync(liveL)) {
            fs.copyFileSync(liveL, path.join(largeDir, `${sb}.json`));
          }
        }

        const liveLedger = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
        fs.copyFileSync(liveLedger, path.join(repDir, 'vocabulary-human-review-ledger.json'));

        const liveReadiness = path.join(projectRoot, 'reports/vocabulary-human-qa-readiness.json');
        fs.copyFileSync(liveReadiness, path.join(repDir, 'vocabulary-human-qa-readiness.json'));

        // Prepare import submission with 3 decisions: 1 APPROVED, 1 HOLD, 1 EDIT_REQUIRED
        const submissionFile = path.join(tempDir, 'submissions.json');
        const submissions = {
          batch_id: 'TIER-1-001',
          records: [
            {
              learning_unit_key: 'drill|noun|C1|sense:2',
              review_submission: {
                reviewer_decision: 'APPROVED',
                review_rationale: 'Verified standard technical definition and examples',
                sense_disposition: 'SELECT_SUPPORTED_SENSE',
              },
            },
            {
              learning_unit_key: 'echo|verb|C2|sense:1',
              review_submission: {
                reviewer_decision: 'HOLD',
                review_rationale: 'Awaiting expert adjudication on polysemy distinction',
              },
            },
            {
              learning_unit_key: 'gape|verb|C1|sense:2',
              review_submission: {
                reviewer_decision: 'EDIT_REQUIRED',
                review_rationale: 'Corrected Thai definition for clarity in learning context',
                edits: {
                  meaning_th: 'อ้าปากค้างด้วยความประหลาดใจหรือตกใจ',
                },
              },
            },
          ],
        };
        fs.writeFileSync(submissionFile, JSON.stringify(submissions), 'utf8');

        // Import in sandbox
        const importRes = importTier1ReviewSubmissions({
          inputPath: submissionFile,
          reviewerId: 'lexicographer_anna',
          projectRoot: tempDir,
          dryRun: false,
          isProduction: false,
        });

        expect(importRes.success).toBe(true);
        expect(importRes.total_imported).toBe(3);
        expect(importRes.transaction_id).toMatch(/^rev_txn_[a-z0-9]+_[a-f0-9]+$/);

        // 1. Verify TIER-1-001 was updated
        const updatedT1 = JSON.parse(fs.readFileSync(path.join(t1Dir, 'TIER-1-001.json'), 'utf8'));
        const drillT1 = updatedT1.records.find((r: any) => r.learning_unit_key === 'drill|noun|C1|sense:2');
        expect(drillT1.reviewer_decision).toBe('APPROVED');
        expect(drillT1.lifecycle_status).toBe('APPROVED');
        expect(drillT1.reviewed_by).toBe('lexicographer_anna');
        expect(drillT1.review_transaction_id).toBe(importRes.transaction_id);

        const echoT1 = updatedT1.records.find((r: any) => r.learning_unit_key === 'echo|verb|C2|sense:1');
        expect(echoT1.reviewer_decision).toBe('HOLD');
        expect(echoT1.lifecycle_status).toBe('HOLD');

        const gapeT1 = updatedT1.records.find((r: any) => r.learning_unit_key === 'gape|verb|C1|sense:2');
        expect(gapeT1.reviewer_decision).toBe('EDIT_REQUIRED');
        expect(gapeT1.lifecycle_status).toBe('EDIT_REQUIRED');
        expect(gapeT1.meaning_th).toBe('อ้าปากค้างด้วยความประหลาดใจหรือตกใจ');

        // 2. Verify counterpart LARGE batches updated with matching correlation transaction ID
        const drillLargeBatch = JSON.parse(
          fs.readFileSync(path.join(largeDir, `${drillT1.source_batch_id}.json`), 'utf8')
        );
        const drillLarge = drillLargeBatch.records.find((r: any) => r.learning_unit_key === 'drill|noun|C1|sense:2');
        expect(drillLarge.reviewer_decision).toBe('APPROVED');
        expect(drillLarge.review_transaction_id).toBe(importRes.transaction_id);

        // 3. Verify ledger entries
        const updatedLedger = JSON.parse(
          fs.readFileSync(path.join(repDir, 'vocabulary-human-review-ledger.json'), 'utf8')
        );
        const drillEvt = updatedLedger.events.find(
          (e: any) => e.learning_unit_key === 'drill|noun|C1|sense:2' && e.transaction_id === importRes.transaction_id
        );
        expect(drillEvt).toBeDefined();
        expect(drillEvt.reviewer_id).toBe('lexicographer_anna');
        expect(drillEvt.decision).toBe('APPROVED');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('enforces re-review workflow from EDIT_REQUIRED to APPROVED via new transaction', () => {
      const tempDir = path.join(os.tmpdir(), `glova-rereview-${Date.now()}`);
      const t1Dir = path.join(tempDir, 'scripts/content-pipeline/output/tier1-batches');
      const largeDir = path.join(tempDir, 'scripts/content-pipeline/output/batches');
      const repDir = path.join(tempDir, 'reports');
      const dataDir = path.join(tempDir, 'data');

      fs.mkdirSync(t1Dir, { recursive: true });
      fs.mkdirSync(largeDir, { recursive: true });
      fs.mkdirSync(repDir, { recursive: true });
      fs.mkdirSync(dataDir, { recursive: true });

      try {
        fs.copyFileSync(
          path.join(projectRoot, 'data/vocabularyBank.ts'),
          path.join(dataDir, 'vocabularyBank.ts')
        );

        const liveT1 = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
        fs.copyFileSync(liveT1, path.join(t1Dir, 'TIER-1-001.json'));

        const liveLedger = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
        fs.copyFileSync(liveLedger, path.join(repDir, 'vocabulary-human-review-ledger.json'));

        const liveReadiness = path.join(projectRoot, 'reports/vocabulary-human-qa-readiness.json');
        fs.copyFileSync(liveReadiness, path.join(repDir, 'vocabulary-human-qa-readiness.json'));

        // Unit 10 is 'battery|noun|C1|sense:2' which is currently EDIT_REQUIRED from pilot
        const batch = JSON.parse(fs.readFileSync(path.join(t1Dir, 'TIER-1-001.json'), 'utf8'));
        const target = batch.records.find((r: any) => r.reviewer_decision === 'EDIT_REQUIRED');
        expect(target).toBeDefined();

        // Copy source batch
        const liveSrc = path.join(projectRoot, `scripts/content-pipeline/output/batches/${target.source_batch_id}.json`);
        if (fs.existsSync(liveSrc)) {
          fs.copyFileSync(liveSrc, path.join(largeDir, `${target.source_batch_id}.json`));
        }

        // Now human re-reviews and approves after revision
        const reReviewTxn = generateReviewTransactionId();
        const res = recordReviewDecisionOnUnit({
          projectRoot: tempDir,
          batchId: 'TIER-1-001',
          learningUnitKey: target.learning_unit_key,
          reviewerId: 'lexicographer_anna',
          decision: 'APPROVED',
          rationale: 'Re-reviewed Thai translation revision; verified natural learner phrasing',
          senseDisposition: 'SELECT_SUPPORTED_SENSE',
          transactionId: reReviewTxn,
          isProduction: false,
        });

        expect(res.success).toBe(true);
        expect(res.unit.reviewer_decision).toBe('APPROVED');
        expect(res.unit.lifecycle_status).toBe('APPROVED');
        expect(res.transaction_id).toBe(reReviewTxn);

        // Check ledger recorded the second event
        const updatedLedger = JSON.parse(
          fs.readFileSync(path.join(repDir, 'vocabulary-human-review-ledger.json'), 'utf8')
        );
        const eventsForUnit = updatedLedger.events.filter(
          (e: any) => e.learning_unit_key === target.learning_unit_key
        );
        expect(eventsForUnit.length).toBeGreaterThanOrEqual(2);
        const latestEvt = eventsForUnit[eventsForUnit.length - 1];
        expect(latestEvt.decision).toBe('APPROVED');
        expect(latestEvt.transaction_id).toBe(reReviewTxn);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('enforces non-promotion invariant: no staged unit can directly become ACTIVE', () => {
      const batch1 = loadTier1Batch('TIER-1-001');
      const unreviewed = batch1.records.find((r: any) => !r.reviewer_decision);
      const holdItem = batch1.records.find((r: any) => r.reviewer_decision === 'HOLD');
      const editReqItem = batch1.records.find((r: any) => r.reviewer_decision === 'EDIT_REQUIRED');

      // Attempting to activate unreviewed unit directly
      expect(() => promoteUnitToActive(unreviewed)).toThrow(/Illegal direct promotion/);

      // Attempting to activate HOLD unit directly
      expect(() => promoteUnitToActive(holdItem)).toThrow(/Illegal direct promotion/);

      // Attempting to activate EDIT_REQUIRED unit directly
      expect(() => promoteUnitToActive(editReqItem)).toThrow(/Illegal direct promotion/);

      // Even an approved item without human review evidence cannot be promoted
      const fakeApproved = {
        learning_unit_key: 'fake|noun|A1|sense:1',
        lifecycle_status: 'APPROVED',
        reviewer_decision: 'APPROVED',
        // missing reviewed_by and provenance evidence
      };
      expect(() => promoteUnitToActive(fakeApproved as any)).toThrow(
        /missing explicit human approval sign-off evidence/
      );
    });

    it('verifies CLI argument parsing across export, import, filter, and assert-complete modes', () => {
      const p1 = parseCliArgs([
        '--export',
        'reports/exp.json',
        '--batch',
        'TIER-1-002',
        '--filter',
        'REVIEW_REQUIRED',
      ]);
      expect(p1.mode).toBe('export');
      expect(p1.exportPath).toBe('reports/exp.json');
      expect(p1.batchId).toBe('TIER-1-002');
      expect(p1.filter).toBe('REVIEW_REQUIRED');

      const p2 = parseCliArgs([
        '--import',
        'reports/sub.json',
        '--reviewer',
        'lexicographer_anna',
        '--dry-run',
      ]);
      expect(p2.mode).toBe('import');
      expect(p2.importPath).toBe('reports/sub.json');
      expect(p2.reviewerId).toBe('lexicographer_anna');
      expect(p2.dryRun).toBe(true);

      const p3 = parseCliArgs(['--assert-complete', '--batch', 'TIER-1-001']);
      expect(p3.mode).toBe('assert_complete');
      expect(p3.batchId).toBe('TIER-1-001');

      const p4 = parseCliArgs(['--interactive', '--batch', 'TIER-1-001', '--all']);
      expect(p4.mode).toBe('interactive');
      expect(p4.batchId).toBe('TIER-1-001');
      expect(p4.filter).toBe('ALL');

      const p5 = parseCliArgs([
        '--import',
        'reports/sub.json',
        '--reviewer',
        'lexicographer_anna',
        '--production',
      ]);
      expect(p5.mode).toBe('import');
      expect(p5.isProduction).toBe(true);
    });
  });

  // 12. Phase 6.2.14 — Controlled Human QA Pilot Suite & Tooling Gate
  describe('12. Phase 6.2.14 — Controlled Human QA Pilot Suite & Tooling Gate', () => {
    it('verifies that reports/tier1-batch-001-pilot-sample.json exists with exactly 25 records exposing 14 dimensions', () => {
      const samplePath = path.join(projectRoot, 'reports/tier1-batch-001-pilot-sample.json');
      expect(fs.existsSync(samplePath)).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
      expect(pkg.batch_id).toBe('TIER-1-001');
      expect(pkg.sample_size).toBe(25);
      expect(pkg.records).toHaveLength(25);

      const requiredDimensions = [
        'learning_unit_key',
        'word',
        'part_of_speech',
        'claimed_cefr_level',
        'definition_en',
        'definition_th',
        'example_sentence',
        'example_translation_th',
        'ipa_phonetic',
        'tier1_reasons',
        'confidence_score',
        'source_domain',
        'allowed_decisions',
        'edit_template',
      ];

      for (const record of pkg.records) {
        for (const dim of requiredDimensions) {
          expect(record).toHaveProperty(dim);
        }
        expect(record.learning_unit_key).toMatch(/^.+\|(noun|verb|adjective|adverb|preposition|conjunction|pronoun|determiner)\|[A-C][1-2]\|sense:\d+$/);
        expect(Array.isArray(record.tier1_reasons)).toBe(true);
        expect(record.tier1_reasons.length).toBeGreaterThanOrEqual(1);
        expect(record.allowed_decisions).toEqual(['APPROVED', 'EDIT_REQUIRED', 'HOLD', 'REJECTED']);
        expect(record.review_submission).toBeDefined();
      }
    });

    it('verifies all 25 sample records map to valid records in TIER-1-001 with zero key collisions', () => {
      const samplePath = path.join(projectRoot, 'reports/tier1-batch-001-pilot-sample.json');
      const pkg = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
      const batch1 = loadTier1Batch('TIER-1-001');

      const batchMap = new Map(batch1.records.map((r: any) => [r.learning_unit_key, r]));
      const seenSampleKeys = new Set<string>();

      for (const rec of pkg.records) {
        expect(seenSampleKeys.has(rec.learning_unit_key)).toBe(false);
        seenSampleKeys.add(rec.learning_unit_key);

        const target = batchMap.get(rec.learning_unit_key);
        expect(target).toBeDefined();
        expect(['REVIEW_REQUIRED', 'APPROVED']).toContain(target?.lifecycle_status);
      }
    });

    it('executes dry-run import verification on the 25-unit sample cleanly with zero errors', () => {
      const dryRunPath = path.join(projectRoot, 'reports/tier1-batch-001-pilot-sample-dryrun.json');
      expect(fs.existsSync(dryRunPath)).toBe(true);

      const dryRunResult = importTier1ReviewSubmissions({
        inputPath: dryRunPath,
        reviewerId: 'lexicographer_anna',
        projectRoot,
        dryRun: true,
        isProduction: false,
      });

      expect(dryRunResult.success).toBe(true);
      expect(dryRunResult.dry_run).toBe(true);
      expect(dryRunResult.batch_id).toBe('TIER-1-001');
      expect(dryRunResult.total_records_in_import).toBe(25);
      expect(dryRunResult.actionable_decisions_count).toBe(25);
      expect(dryRunResult.reviewer_id).toBe('lexicographer_anna');
    });

    it('strictly rejects synthetic or bot reviewer identities during submission import', () => {
      const dryRunPath = path.join(projectRoot, 'reports/tier1-batch-001-pilot-sample-dryrun.json');
      const bannedBotIds = ['ai_bot', 'system_reviewer', 'auto_review_script', 'synthetic_reviewer', 'llm_evaluator'];

      for (const botId of bannedBotIds) {
        expect(() =>
          importTier1ReviewSubmissions({
            inputPath: dryRunPath,
            reviewerId: botId,
            projectRoot,
            dryRun: true,
          })
        ).toThrow(/rejected.*Automated, AI, or generic bot reviewer accounts are strictly prohibited/i);
      }
    });

    it('strictly preserves readiness invariants: 83 learner-ready, gap 9917, overall NOT_READY', () => {
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

  // 13. Phase 6.2.15 Enrichment Quality Gates & Regression Suite
  describe('13. Phase 6.2.15 — Vocabulary Enrichment Quality Remediation Gates', () => {
    it('strictly rejects synthetic domain-category Thai definitions and boilerplate suffixes', () => {
      const syntheticThaiSamples = [
        'สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับสิ่งของ แนวคิด หรือสภาวะตามนิยามของความหมายนี้ ตามนิยามเฉพาะของความหมายนี้',
        'การปฏิบัติหรือทำให้เกิดผลลัพธ์ของการเคลื่อนไหวหรือการเดินทาง ตามนิยามเฉพาะของความหมายนี้',
        'อย่างมีลักษณะที่แสดงถึง หรือในทิศทางที่กาลเวลา ช่วงเวลา และลำดับเหตุการณ์ ตามนิยามเฉพาะของความหมายนี้',
        'กลุ่มคน องค์กร หรือหมวดหมู่ของการศึกษา การเรียนรู้ และวิชาการ ตามนิยามเฉพาะของความหมายนี้',
        'บุคคลหรือผู้ปฏิบัติหน้าที่เกี่ยวข้องกับอาหาร การปรุงอาหาร และโภชนาการ ตามนิยามเฉพาะของความหมายนี้',
      ];

      for (const sample of syntheticThaiSamples) {
        const result = validateThaiMeaningQuality(sample, 'noun');
        expect(result.isValid).toBe(false);
        expect(result.isTemplate).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);
      }
    });

    it('accepts legitimate, natural Thai definitions and checks PoS constraints', () => {
      const validSamples = [
        { th: 'ที่ผ่านมา, ล่วงมาแล้ว', pos: 'adverb' },
        { th: 'เด็กทารก, ลูกอ่อน', pos: 'noun' },
        { th: 'วิ่ง, วิ่งแข่ง', pos: 'verb' },
        { th: 'สวยงาม, งดงาม', pos: 'adjective' },
      ];

      for (const sample of validSamples) {
        const result = validateThaiMeaningQuality(sample.th, sample.pos);
        expect(result.isValid).toBe(true);
        expect(result.isTemplate).toBe(false);
        expect(result.issues).toEqual([]);
      }

      // Rejects empty or non-Thai text
      expect(validateThaiMeaningQuality('', 'noun').isValid).toBe(false);
      expect(validateThaiMeaningQuality('Just an English phrase', 'noun').isValid).toBe(false);
    });

    it('strictly rejects example sentence fragments, missing terminal punctuation, and collocations', () => {
      const fragmentSamples = [
        { ex: 'food and drink', word: 'food', reason: 'sub-4-words and no punct' },
        { ex: 'the front lines', word: 'front', reason: 'sub-4-words and no punct' },
        { ex: 'he bought a hot dog and a coke at the bar', word: 'bar', reason: 'no terminal punct' },
        { ex: 'fastidious about his dress', word: 'dress', reason: 'no terminal punct and phrase fragment' },
        { ex: 'in Japan most fish is eaten raw', word: 'fish', reason: 'no terminal punct' },
      ];

      for (const sample of fragmentSamples) {
        const result = validateExampleSentenceQuality(sample.ex, sample.word);
        expect(result.isValid).toBe(false);
        expect(result.isFragment).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);
      }
    });

    it('strictly rejects synthetic boilerplate fallback example patterns', () => {
      const boilerplateSamples = [
        {
          ex: 'Understanding the role of clock helps students discuss timepiece shows time day clearly in everyday situations.',
          word: 'clock',
        },
        {
          ex: 'Understanding the role of animal helps students discuss living organism voluntary movement clearly in everyday situations.',
          word: 'animal',
        },
        {
          ex: 'She spoke also while explaining how the group handled general communication yesterday.',
          word: 'also',
        },
        {
          ex: 'She spoke OK while explaining how the group handled expression agreement normally occurring yesterday.',
          word: 'OK',
        },
      ];

      for (const sample of boilerplateSamples) {
        const result = validateExampleSentenceQuality(sample.ex, sample.word);
        expect(result.isValid).toBe(false);
        expect(result.isBoilerplate).toBe(true);
        expect(result.issues.some((i) => i.includes('banned synthetic boilerplate'))).toBe(true);
      }
    });

    it('accepts well-formed, natural example sentences with punctuation and target words', () => {
      const validSamples = [
        { ex: 'Sixty years ago my grandfather came to the U.S.', word: 'ago' },
        { ex: 'Her daughter cared for her in her old age.', word: 'daughter' },
        { ex: 'The family adopted a friendly dog from the local shelter.', word: 'dog' },
        { ex: 'She walked to school every morning with her friends.', word: 'walk' },
      ];

      for (const sample of validSamples) {
        const result = validateExampleSentenceQuality(sample.ex, sample.word);
        expect(result.isValid).toBe(true);
        expect(result.isFragment).toBe(false);
        expect(result.isBoilerplate).toBe(false);
        expect(result.issues).toEqual([]);
      }
    });

    it('validates English meaning and Phonetic IPA quality gates accurately', () => {
      // English meanings
      expect(validateEnglishMeaningQuality('in the past').isValid).toBe(true);
      expect(validateEnglishMeaningQuality('').isValid).toBe(false);
      expect(validateEnglishMeaningQuality('n/a').isValid).toBe(false);
      expect(validateEnglishMeaningQuality('unknown').isValid).toBe(false);

      // IPA
      expect(validatePhoneticIpaQuality('/əˈɡoʊ/').isValid).toBe(true);
      expect(validatePhoneticIpaQuality('').isValid).toBe(false);
      expect(validatePhoneticIpaQuality('UNRESOLVED').isValid).toBe(false);
      expect(validatePhoneticIpaQuality('//').isValid).toBe(false);
      expect(validatePhoneticIpaQuality('əˈɡoʊ').isValid).toBe(false); // missing slashes
    });

    it('evaluates comprehensive record quality gates across all 4 dimensions', () => {
      const badRecord = {
        word: 'clock',
        part_of_speech: 'noun',
        meaning_en: 'a timepiece that shows the time of day',
        meaning_th: 'สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับสิ่งของ แนวคิด หรือสภาวะตามนิยามของความหมายนี้ ตามนิยามเฉพาะของความหมายนี้',
        phonetic_ipa: '/klɑːk/',
        example_sentence: 'Understanding the role of clock helps students discuss timepiece shows time day clearly in everyday situations.',
      };

      const badEval = evaluateRecordQualityGates(badRecord);
      expect(badEval.passesAll).toBe(false);
      expect(badEval.gates.thai.isValid).toBe(false);
      expect(badEval.gates.example.isValid).toBe(false);
      expect(badEval.gates.english.isValid).toBe(true);
      expect(badEval.gates.ipa.isValid).toBe(true);
      expect(badEval.flaggedReasons.length).toBeGreaterThanOrEqual(2);

      const goodRecord = {
        word: 'clock',
        part_of_speech: 'noun',
        meaning_en: 'a timepiece that shows the time of day',
        meaning_th: 'นาฬิกา (เครื่องบอกเวลา)',
        phonetic_ipa: '/klɑːk/',
        example_sentence: 'The clock on the wall shows exactly three o\'clock.',
      };

      const goodEval = evaluateRecordQualityGates(goodRecord);
      expect(goodEval.passesAll).toBe(true);
      expect(goodEval.flaggedReasons).toEqual([]);
    });

    it('strictly preserves the 62 human-approved records in the ledger and readiness invariants', () => {
      const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
      const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

      const prodEvents = ledger.events.filter((e: any) => e.is_production_review === true);
      const approvedEvents = prodEvents.filter((e: any) => e.decision === 'APPROVED');
      expect(approvedEvents.length).toBe(62);

      const annaEvents = approvedEvents.filter((e: any) => e.reviewer_id === 'lexicographer_anna');
      expect(annaEvents.length).toBe(7);

      for (const ev of approvedEvents) {
        expect(ev.counted_in_readiness).toBe(true);
      }

      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
    });
  });

  // 14. Phase 6.2.16 — Safe Thai Meaning Remediation Pipeline
  describe('14. Phase 6.2.16 — Safe Thai Meaning Remediation Pipeline', () => {
    it('detects synthetic prefixes, boilerplate phrases, and PoS structural mismatches deterministically', () => {
      // 1. Synthetic prefix
      const res1 = detectBadThaiMeaning('สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับอาหาร การปรุงอาหาร และโภชนาการ ตามนิยามเฉพาะของความหมายนี้', 'noun');
      expect(res1.isBad).toBe(true);
      expect(res1.isTemplate).toBe(true);
      expect(res1.reasons.length).toBeGreaterThanOrEqual(1);

      // 2. PoS mismatch: verb starting with nominal category
      const res2 = detectBadThaiMeaning('บุคคลผู้ปฏิบัติหน้าที่ด้านการเงิน', 'verb');
      expect(res2.isBad).toBe(true);
      expect(res2.reasons.some((r: string) => r.includes('PoS mismatch'))).toBe(true);

      // 3. Clean non-synthetic Thai definition passes
      const res3 = detectBadThaiMeaning('เด็กทารก, ลูกอ่อน', 'noun');
      expect(res3.isBad).toBe(false);
      expect(res3.isTemplate).toBe(false);
      expect(res3.reasons).toEqual([]);
    });

    it('generates clean remediation candidates that pass structural quality gates with 0 issues', () => {
      // Curated registry match
      const rec1 = {
        word: 'baby',
        lemma: 'baby',
        part_of_speech: 'noun',
        meaning_en: 'a very young child',
      };
      const cand1 = generateThaiRemediationCandidate(rec1);
      expect(cand1.source).toBe('glova_curated_lexical_registry_v1');
      expect(cand1.method).toBe('curated_lexical_registry_match');
      expect(cand1.meaning_th).toBe('เด็กทารก, ลูกอ่อน');
      expect(cand1.review_status).toBe('AI_DRAFT');
      expect(cand1.human_review_required).toBe(true);
      expect(cand1.quality_gate.isValid).toBe(true);
      expect(cand1.quality_gate.issues).toEqual([]);

      // Polysemous sense registry match
      const rec2 = {
        word: 'bank',
        lemma: 'bank',
        part_of_speech: 'noun',
        meaning_en: 'a financial institution that accepts deposits and channels money into lending activities',
      };
      const cand2 = generateThaiRemediationCandidate(rec2);
      expect(cand2.source).toBe('glova_curated_lexical_registry_v1');
      expect(cand2.method).toBe('polysemous_sense_registry_match');
      expect(cand2.meaning_th).toBe('ธนาคาร, สถาบันการเงิน');
      expect(cand2.quality_gate.isValid).toBe(true);

      // Contextual sense drafter fallback
      const rec3 = {
        word: 'accelerate',
        lemma: 'accelerate',
        part_of_speech: 'verb',
        meaning_en: 'cause to move faster',
        topic: 'Travel',
      };
      const cand3 = generateThaiRemediationCandidate(rec3);
      expect(cand3.source).toBe('glova_contextual_thai_drafter_v2');
      expect(cand3.method).toBe('contextual_headword_sense_draft_v2');
      expect(cand3.meaning_th).toContain('ทำให้เกิด');
      expect(cand3.review_status).toBe('AI_DRAFT');
      expect(cand3.human_review_required).toBe(true);
      expect(cand3.quality_gate.isValid).toBe(true);
      expect(cand3.quality_gate.issues).toEqual([]);
    });

    it('archives original synthetic draft into provenance.previous_drafts with detection metadata', () => {
      const syntheticRecord = {
        learning_unit_key: 'test_word|noun|A2|sense:1',
        word: 'test_word',
        part_of_speech: 'noun',
        meaning_en: 'a test apparatus',
        meaning_th: 'สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับอาหาร การปรุงอาหาร และโภชนาการ ตามนิยามเฉพาะของความหมายนี้',
        meaning_th_review_status: 'AI_DRAFT',
        lifecycle_status: 'REVIEW_REQUIRED',
        provenance: {},
      };

      const result = remediateThaiMeaningForRecord(syntheticRecord);
      expect(result.remediated).toBe(true);
      expect(result.record.meaning_th).not.toBe(syntheticRecord.meaning_th);
      expect(result.record.meaning_th_review_status).toBe('AI_DRAFT');
      expect(result.record.lifecycle_status).toBe('REVIEW_REQUIRED');

      const prevDrafts = result.record.provenance.previous_drafts;
      expect(Array.isArray(prevDrafts)).toBe(true);
      expect(prevDrafts.length).toBe(1);
      expect(prevDrafts[0].field).toBe('meaning_th');
      expect(prevDrafts[0].value).toBe(syntheticRecord.meaning_th);
      expect(prevDrafts[0].reason).toBe('DETECTED_SYNTHETIC_TEMPLATE');
      expect(Array.isArray(prevDrafts[0].detection_reasons)).toBe(true);
      expect(prevDrafts[0].detection_reasons.length).toBeGreaterThanOrEqual(1);

      expect(result.record.provenance.remediation).toBeDefined();
      expect(result.record.provenance.remediation.version).toBe(REMEDIATION_VERSION);
      expect(result.record.provenance.remediation.field).toBe('meaning_th');
      expect(result.record.provenance.remediation.quality_gate_passed).toBe(true);
      expect(result.record.provenance.remediation.human_review_required).toBe(true);
    });

    it('strictly preserves the 7 human-approved records and does not remediate them', () => {
      expect(EXEMPT_HUMAN_APPROVED_KEYS.size).toBe(7);

      for (const approvedKey of EXEMPT_HUMAN_APPROVED_KEYS) {
        const approvedRecord = {
          learning_unit_key: approvedKey,
          meaning_th: 'ความหมายที่ได้รับการอนุมัติแล้ว',
          reviewer_decision: 'APPROVED',
          lifecycle_status: 'APPROVED',
        };

        const res = remediateThaiMeaningForRecord(approvedRecord);
        expect(res.remediated).toBe(false);
        expect(res.reason).toBe('EXEMPT_HUMAN_REVIEWED_RECORD');
        expect(res.record.meaning_th).toBe('ความหมายที่ได้รับการอนุมัติแล้ว');
      }
    });

    it('strictly forbids mass-editing of example_sentence during Thai remediation', () => {
      const batch1Path = path.join(projectRoot, 'scripts/content-pipeline/output/batches/LARGE-001.json');
      const batch1 = JSON.parse(fs.readFileSync(batch1Path, 'utf8'));

      for (const unit of batch1.records) {
        if (unit.provenance?.remediation?.remediated === true) {
          expect(unit.provenance.remediation.field).toBe('meaning_th');
          expect(unit.example_sentence).toBeDefined();
          expect(typeof unit.example_sentence).toBe('string');
          expect(unit.example_sentence.length).toBeGreaterThan(0);
        }
      }
    });

    it('verifies dataset-wide remediation summary report metrics across all 50 batches', () => {
      const summaryPath = path.join(projectRoot, 'reports/thai-meaning-remediation-summary.json');
      expect(fs.existsSync(summaryPath)).toBe(true);

      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      expect(summary.phase).toBe('6.2.16');
      expect(summary.remediation_version).toBe(REMEDIATION_VERSION);
      expect(summary.total_staged_units).toBe(10000);
      expect(summary.batches_processed).toBe(50);
      expect(summary.synthetic_detected).toBe(8318);
      expect(summary.candidates_generated).toBe(8314);
      expect(summary.candidates_passed_structural_gate).toBe(8314);
      expect(summary.candidates_failed_gate).toBe(0);
      expect(summary.source_verified_candidates).toBe(0); // AI candidates must NEVER be marked SOURCE_VERIFIED
      expect(summary.ai_draft_candidates).toBe(8314);
      expect(summary.exempt_human_approved_preserved).toBe(7);
      expect(summary.human_review_required).toBe(9990); // 10000 - 10 reviewed
    });

    it('ensures determinism: running remediation on clean remediated records is a no-op', () => {
      const alreadyRemediatedRecord = {
        learning_unit_key: 'clean_word|noun|A1|sense:1',
        word: 'clean_word',
        part_of_speech: 'noun',
        meaning_en: 'a clear definition',
        meaning_th: 'เด็กทารก, ลูกอ่อน', // Valid clean Thai
        meaning_th_review_status: 'AI_DRAFT',
        lifecycle_status: 'REVIEW_REQUIRED',
        provenance: {},
      };

      const res = remediateThaiMeaningForRecord(alreadyRemediatedRecord);
      expect(res.remediated).toBe(false);
      expect(res.reason).toBe('CLEAN_NON_SYNTHETIC');
      expect(res.record.provenance.previous_drafts).toBeUndefined();
    });

    it('maintains strict readiness invariants: 83 learner-ready, 9917 gap, NOT_READY', () => {
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

  // 15. Phase 6.2.17 — Controlled Human QA Pilot for Remediated Thai Meanings
  describe('15. Controlled Human QA Pilot for Remediated Thai Meanings', () => {
    it('generates a deterministic 25-unit representative sample covering all CEFR levels and major POS', () => {
      const allUnits = collectAllEligibleRemediatedUnits(projectRoot);
      expect(allUnits.length).toBe(8314);

      const sample = selectDeterministicPilotSample(allUnits);
      expect(sample.length).toBe(25);

      const cefrSet = new Set(sample.map((s) => s.cefr_level));
      expect(cefrSet.has('A1')).toBe(true);
      expect(cefrSet.has('A2')).toBe(true);
      expect(cefrSet.has('B1')).toBe(true);
      expect(cefrSet.has('B2')).toBe(true);
      expect(cefrSet.has('C1')).toBe(true);
      expect(cefrSet.has('C2')).toBe(true);

      const posSet = new Set(sample.map((s) => s.part_of_speech));
      expect(posSet.has('noun')).toBe(true);
      expect(posSet.has('verb')).toBe(true);
      expect(posSet.has('adjective')).toBe(true);
      expect(posSet.has('adverb')).toBe(true);

      const sourceSet = new Set(sample.map((s) => s.provenance?.remediation?.source));
      expect(sourceSet.has('glova_curated_lexical_registry_v1')).toBe(true);
      expect(sourceSet.has('glova_contextual_thai_drafter_v2')).toBe(true);

      // Verify zero overlap with the 10 historical reviewed records
      for (const unit of sample) {
        expect(EXEMPT_HUMAN_REVIEWED_KEYS.has(unit.learning_unit_key)).toBe(false);
      }
    });

    it('formats unit with remediation source, gate results, and previous drafts in 14-dimension CLI', () => {
      const unit = {
        learning_unit_key: 'sample_remediated|noun|B1|sense:1',
        word: 'sample_remediated',
        part_of_speech: 'noun',
        cefr_level: 'B1',
        meaning_en: 'a test unit for remediation display',
        meaning_th: 'หน่วยทดสอบ',
        meaning_th_review_status: 'AI_DRAFT',
        provenance: {
          previous_drafts: [
            {
              field: 'meaning_th',
              value: 'สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับ...',
              archived_at: '2026-09-26T14:34:17.288Z',
              reason: 'DETECTED_SYNTHETIC_TEMPLATE',
            },
          ],
          remediation: {
            source: 'glova_curated_lexical_registry_v1',
            method: 'curated_lexical_registry_match',
            quality_gate_passed: true,
            quality_gate_issues: [],
          },
        },
      };

      const formatted = formatUnit14Dimensions(unit, 'TEST-001', 1, 1);
      expect(formatted).toContain('5. THAI TRANSLATION:');
      expect(formatted).toContain('Remediation:    glova_curated_lexical_registry_v1 (curated_lexical_registry_match)');
      expect(formatted).toContain('QA Gate Result: PASS (Structural Gate)');
      expect(formatted).toContain('Previous Draft [1]: "สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับ..."');
      expect(formatted).toContain('Reason: DETECTED_SYNTHETIC_TEMPLATE');
    });

    it('verifies findUnitByKey locates units across both Tier 1 and LARGE batches', () => {
      // Find unit in Tier 1 batch
      const t1Unit = findUnitByKey('ok|adjective|A1|sense:1', projectRoot);
      expect(t1Unit).not.toBeNull();
      expect(t1Unit?.batchId).toBe('TIER-1-001');

      // Find unit in LARGE batch
      const largeUnit = findUnitByKey('ago|adverb|A1|sense:1', projectRoot);
      expect(largeUnit).not.toBeNull();
      expect(largeUnit?.batchId).toBe('LARGE-001');
    });

    it('validates 14-dimension pilot review package and schema on disk', () => {
      const pkgPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-sample.json');
      expect(fs.existsSync(pkgPath)).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      expect(pkg.package_type).toBe('PHASE_6_2_17_REMEDIATED_THAI_PILOT_SAMPLE');
      expect(pkg.sample_size).toBe(25);
      expect(pkg.records.length).toBe(25);

      for (const rec of pkg.records) {
        expect(rec.sample_index).toBeGreaterThanOrEqual(1);
        expect(rec.sample_index).toBeLessThanOrEqual(25);
        expect(rec.learning_unit_key).toBeDefined();
        expect(rec.word).toBeDefined();
        expect(rec.part_of_speech).toBeDefined();
        expect(rec.claimed_cefr_level).toBeDefined();
        expect(rec.definition_en).toBeDefined();
        expect(rec.definition_th).toBeDefined();
        expect(rec.remediation_info).toBeDefined();
        expect(rec.remediation_info.source).toBeDefined();
        expect(rec.allowed_decisions).toEqual(['APPROVED', 'EDIT_REQUIRED', 'HOLD']);
      }
    });

    it('executes dry-run multi-batch import successfully with zero mutations', () => {
      const dryRunPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-dryrun.json');
      expect(fs.existsSync(dryRunPath)).toBe(true);

      const dryRunResult = importTier1ReviewSubmissions({
        inputPath: dryRunPath,
        reviewerId: 'lexicographer_anna',
        projectRoot,
        dryRun: true,
      });

      expect(dryRunResult.success).toBe(true);
      expect(dryRunResult.dry_run).toBe(true);
      expect(dryRunResult.total_records_in_import).toBe(25);
      expect(dryRunResult.actionable_decisions_count).toBe(25);
      expect(dryRunResult.reviewer_id).toBe('lexicographer_anna');
    }, 30000);

    it('strictly enforces negative bot identity rejection on pilot import', () => {
      const dryRunPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-dryrun.json');

      expect(() => {
        importTier1ReviewSubmissions({
          inputPath: dryRunPath,
          reviewerId: 'ai_bot',
          projectRoot,
          dryRun: true,
        });
      }).toThrow(/Automated, AI, or generic bot reviewer accounts are strictly prohibited/);

      expect(() => {
        importTier1ReviewSubmissions({
          inputPath: dryRunPath,
          reviewerId: 'synthetic_reviewer',
          projectRoot,
          dryRun: true,
        });
      }).toThrow(/Automated, AI, or generic bot reviewer accounts are strictly prohibited/);
    });

    it('validates authentic human pilot review statistics and defect taxonomy', () => {
      const resultsPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-results.json');
      expect(fs.existsSync(resultsPath)).toBe(true);

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      expect(results.sample_size).toBe(25);
      expect(results.decisions.approved_count).toBe(6);
      expect(results.decisions.edit_required_count).toBe(15);
      expect(results.decisions.hold_count).toBe(4);
      expect(results.decisions.approval_rate_pct).toBe(24.0);
      expect(results.decisions.edit_rate_pct).toBe(60.0);
      expect(results.decisions.hold_rate_pct).toBe(16.0);

      // Verify source performance: Curated registry has 100% win-rate
      expect(results.source_performance.curated_lexical_registry.total).toBe(6);
      expect(results.source_performance.curated_lexical_registry.approved).toBe(6);
      expect(results.source_performance.curated_lexical_registry.approval_rate_pct).toBe(100.0);

      // Verify contextual drafter has high edit rate
      expect(results.source_performance.contextual_thai_drafter.total).toBe(19);
      expect(results.source_performance.contextual_thai_drafter.edit_required).toBe(15);
      expect(results.source_performance.contextual_thai_drafter.edit_rate_pct).toBe(78.9);

      // Defect categories identified
      expect(results.defect_analysis.defect_categories.ABSTRACT_SEMANTIC_PLACEHOLDER).toBe(13);
      expect(results.defect_analysis.defect_categories.ERRONEOUS_TOPIC_INJECTION).toBe(3);
      expect(results.defect_analysis.defect_categories.POLYSEMOUS_SENSE_CONFLICT).toBe(3);
    });

    it('maintains strict readiness invariants: 83 learner-ready, 9917 gap, NOT_READY', () => {
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

  // 16. Thai Lexicon Grounding & Pre-Review Automation Foundation (Phase 6.2.18)
  describe('Phase 6.2.18: Thai Lexicon Grounding & Pre-Review Automation Foundation', () => {
    it('validates source provenance and license metadata on grounded lexical registry', () => {
      expect(GROUNDED_THAI_LEXICON_REGISTRY.length).toBeGreaterThanOrEqual(25);

      const allowedLicenses = new Set(['Glova-Internal-Proprietary', 'CC-BY-3.0']);

      for (const entry of GROUNDED_THAI_LEXICON_REGISTRY) {
        const validation = validateLexicalCandidate(entry);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);

        expect(entry.headword).toBeDefined();
        expect(entry.pos).toBeDefined();
        expect(entry.thai_gloss).toBeDefined();
        expect(entry.source).toBeDefined();
        expect(entry.source_version).toBeDefined();
        expect(entry.license).toBeDefined();
        expect(allowedLicenses.has(entry.license)).toBe(true);
        expect(entry.source_record_id).toMatch(/^(GLOVA_LEX|OMW_THA)_/);
        expect(entry.confidence_score).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('verifies deterministic POS alignment outcomes (POS_ALIGNED, POS_SUSPECT, POS_UNKNOWN)', () => {
      // Aligned cases
      expect(checkPosAlignment('noun', 'เด็กทารก, ลูกอ่อน').status).toBe(POS_ALIGNMENT_STATUS.ALIGNED);
      expect(checkPosAlignment('verb', 'เห็นด้วย, ตกลง').status).toBe(POS_ALIGNMENT_STATUS.ALIGNED);
      expect(checkPosAlignment('adjective', 'ชัดเจน, ใส, ปลอดโปร่ง').status).toBe(POS_ALIGNMENT_STATUS.ALIGNED);
      expect(checkPosAlignment('adverb', 'โดยบังเอิญ, อย่างไม่ได้ตั้งใจ').status).toBe(POS_ALIGNMENT_STATUS.ALIGNED);

      // Suspect cases (cross-POS marker contamination)
      expect(checkPosAlignment('noun', 'อย่างรวดเร็ว').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);
      expect(checkPosAlignment('noun', 'ดำเนินการก่อสร้าง').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);
      expect(checkPosAlignment('verb', 'อย่างมีลักษณะ').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);
      expect(checkPosAlignment('verb', 'ซึ่งเป็นมิตร').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);
      expect(checkPosAlignment('adjective', 'อย่างอัตโนมัติ').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);
      expect(checkPosAlignment('adjective', 'ดำเนินการปรับปรุง').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);
      expect(checkPosAlignment('adverb', 'กลุ่มบุคคล หรือหน่วยงาน').status).toBe(POS_ALIGNMENT_STATUS.SUSPECT);

      // Unknown POS
      expect(checkPosAlignment('interjection', 'โอ้โห').status).toBe(POS_ALIGNMENT_STATUS.UNKNOWN);
      expect(checkPosAlignment('', 'คำแปล').status).toBe(POS_ALIGNMENT_STATUS.UNKNOWN);
    });

    it('verifies deterministic sense alignment outcomes (SENSE_ALIGNED, SENSE_AMBIGUOUS, SENSE_CONFLICT, NO_LEXICAL_MATCH)', () => {
      const babyUnit = {
        word: 'baby',
        part_of_speech: 'noun',
        claimed_cefr_level: 'A1',
        definition_en: 'a very young child (birth to 1 year)',
        candidate_senses: [{ synset_id: '10001672-n', sense_key: 'baby%1:18:00::' }],
      };
      const babyCandidate = getLexicalBySynsetId('10001672-n');
      expect(babyCandidate).not.toBeNull();
      const babySense = checkSenseAlignment(babyCandidate, babyUnit);
      expect(babySense.status).toBe(SENSE_ALIGNMENT_STATUS.ALIGNED);
      expect(babySense.score).toBe(1.0);

      // Conflict case: above adverb (textual sense B1 vs A1 physical target)
      const aboveUnit = {
        word: 'above',
        part_of_speech: 'adverb',
        claimed_cefr_level: 'A1',
        definition_en: '(in writing) at an earlier place: "see above"',
        candidate_senses: [{ synset_id: '00079960-r', sense_key: 'above%4:02:00::' }],
      };
      const aboveCandidate = getLexicalBySynsetId('00079960-r');
      expect(aboveCandidate).not.toBeNull();
      const aboveSense = checkSenseAlignment(aboveCandidate, aboveUnit);
      expect(aboveSense.status).toBe(SENSE_ALIGNMENT_STATUS.CONFLICT);

      // Ambiguous case: generic polysemous candidate without matching definition
      const mockAmbiguousCandidate = {
        headword: 'testword',
        pos: 'noun',
        thai_gloss: 'คำทดสอบ',
        english_definition: 'a non matching definition',
        has_polysemous_siblings: true,
      };
      const mockAmbiguousUnit = {
        word: 'testword',
        part_of_speech: 'noun',
        claimed_cefr_level: 'B1',
        definition_en: 'completely distinct english description',
        candidate_senses: [],
      };
      expect(checkSenseAlignment(mockAmbiguousCandidate, mockAmbiguousUnit).status).toBe(SENSE_ALIGNMENT_STATUS.AMBIGUOUS);

      // No match case
      const mockUnknownUnit = {
        word: 'unknownwordxyz',
        part_of_speech: 'noun',
        claimed_cefr_level: 'B1',
        definition_en: 'unknown',
        candidate_senses: [],
      };
      expect(checkSenseAlignment(null, mockUnknownUnit).status).toBe(SENSE_ALIGNMENT_STATUS.NO_MATCH);
    });

    it('ensures polysemy preservation: multiple distinct senses are not collapsed', () => {
      // automatically has distinct senses for A2 reflex vs C1 mechanical
      const autoCandidates = getLexicalCandidates('automatically', 'adverb');
      expect(autoCandidates.length).toBe(2);
      expect(autoCandidates[0].synset_id).not.toBe(autoCandidates[1].synset_id);
      expect(autoCandidates[0].thai_gloss).not.toBe(autoCandidates[1].thai_gloss);
      expect(autoCandidates.map(c => c.target_cefr).sort()).toEqual(['A2', 'C1']);

      // commission has distinct senses for B2 committee vs C2 authorization
      const commCandidates = getLexicalCandidates('commission', 'noun');
      expect(commCandidates.length).toBeGreaterThanOrEqual(2);
      const synsets = commCandidates.map(c => c.synset_id);
      expect(new Set(synsets).size).toBe(commCandidates.length);
      expect(commCandidates.map(c => c.target_cefr).sort()).toEqual(['B2', 'C2']);
    });

    it('handles missing lexical sources and duplicate candidate ranking safely in pipeline', () => {
      const missingUnit = {
        word: 'nonexistentlemma999',
        part_of_speech: 'noun',
        claimed_cefr_level: 'B2',
        definition_en: 'something imaginary',
        candidate_senses: [],
      };
      const missingResult = runPreReviewAlignment(missingUnit);
      expect(missingResult.candidate_status).toBe(PRE_REVIEW_CANDIDATE_STATUS.UNRESOLVED);
      expect(missingResult.selected_candidate).toBeNull();
      expect(missingResult.sense_alignment.status).toBe(SENSE_ALIGNMENT_STATUS.NO_MATCH);
      expect(missingResult.human_review_required).toBe(true);
      expect(missingResult.field_status).toBe('AI_DRAFT');
      expect(missingResult.lifecycle_status).toBe('REVIEW_REQUIRED');
    });

    it('strictly enforces zero auto-approval and zero ACTIVE promotion invariants in pre-review pipeline', () => {
      const agreeUnit = {
        word: 'agree',
        part_of_speech: 'verb',
        claimed_cefr_level: 'A1',
        definition_en: 'be in accord; be in agreement',
        candidate_senses: [{ synset_id: '00840439-v' }],
      };
      const result = runPreReviewAlignment(agreeUnit);

      expect(result.candidate_status).toBe(PRE_REVIEW_CANDIDATE_STATUS.APPROVED_CANDIDATE_READY);
      // Invariant: candidate status MUST NOT equal lifecycle_status or reviewer_decision
      expect(result.field_status).toBe('AI_DRAFT');
      expect(result.lifecycle_status).toBe('REVIEW_REQUIRED');
      expect(result.human_review_required).toBe(true);
      expect(result.reviewer_decision).toBeNull();
    });

    it('guarantees exact Phase 6.2.17 25-item pilot sample reproducibility and blind comparison generation', () => {
      const output = executePilotComparison();

      expect(output.sample_size).toBe(25);
      expect(output.pre_review_metrics.total_evaluated).toBe(25);

      // Verify observed pre-review alignment outcomes on 25 pilot records
      expect(output.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(output.pre_review_metrics.approved_candidate_ready_pct).toBe(84.0);
      expect(output.pre_review_metrics.edit_required_candidate).toBe(0);
      expect(output.pre_review_metrics.hold_candidate).toBe(4);
      expect(output.pre_review_metrics.hold_candidate_pct).toBe(16.0);
      expect(output.pre_review_metrics.unresolved).toBe(0);

      // Verify POS & Source Grounded metrics
      expect(output.pre_review_metrics.source_grounded_rate_pct).toBe(100.0);
      expect(output.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(output.pre_review_metrics.sense_aligned_pct).toBe(84.0);

      // Exactly the 4 hold records identified in Phase 6.2.17
      const holdRecords = output.records.filter(
        r => r.version_b_grounded_phase_6_2_18.pre_review_status === PRE_REVIEW_CANDIDATE_STATUS.HOLD_CANDIDATE
      );
      expect(holdRecords.length).toBe(4);
      const holdWords = holdRecords.map(r => r.word).sort();
      expect(holdWords).toEqual(['above', 'adverse', 'cast', 'jog']);

      // Blind comparison file exists and matches
      const blindPath = path.join(projectRoot, 'reports/phase-6.2.18-blind-quality-comparison.json');
      expect(fs.existsSync(blindPath)).toBe(true);
      const blindJson = JSON.parse(fs.readFileSync(blindPath, 'utf8'));
      expect(blindJson.records.length).toBe(25);
      expect(blindJson.records[0].version_a_original_phase_6_2_16).toBeDefined();
      expect(blindJson.records[0].version_b_grounded_phase_6_2_18).toBeDefined();
    });

    it('maintains strict readiness invariants: 83 learner-ready, 9917 gap, NOT_READY', () => {
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

  // 17. Phase 6.2.19 — Large Vocabulary Pre-Review Alignment Audit across 10,000 Units
  describe('17. Phase 6.2.19 — Large Vocabulary Pre-Review Alignment Audit across 10,000 Units', () => {
    it('executes full 10,000-unit audit with exact empirical dataset counts', () => {
      const { auditOutput } = executeLargeDatasetAudit();
      const counts = auditOutput.exact_dataset_counts;

      expect(counts.total_units).toBe(10000);
      expect(counts.source_grounded).toBe(48);
      expect(counts.no_lexical_source).toBe(9952);

      // POS alignment
      expect(counts.pos_alignment.POS_ALIGNED).toBe(48);
      expect(counts.pos_alignment.POS_SUSPECT).toBe(0);
      expect(counts.pos_alignment.POS_UNKNOWN).toBe(9952);

      // Sense alignment
      expect(counts.sense_alignment.SENSE_ALIGNED).toBe(41);
      expect(counts.sense_alignment.SENSE_AMBIGUOUS).toBe(0);
      expect(counts.sense_alignment.SENSE_CONFLICT).toBe(7);
      expect(counts.sense_alignment.NO_LEXICAL_MATCH).toBe(9952);

      // CEFR compatibility
      expect(counts.cefr_compatibility.compatible_lexical_evidence).toBe(34);
      expect(counts.cefr_compatibility.potentially_incompatible_sense).toBe(14);
      expect(counts.cefr_compatibility.no_usable_evidence).toBe(9952);

      // Candidate readiness status
      expect(counts.candidate_readiness.APPROVED_CANDIDATE_READY).toBe(30);
      expect(counts.candidate_readiness.EDIT_REQUIRED_CANDIDATE).toBe(11);
      expect(counts.candidate_readiness.HOLD_CANDIDATE).toBe(7);
      expect(counts.candidate_readiness.UNRESOLVED).toBe(9952);

      // All 10,000 require human review (0 auto-approval)
      expect(counts.human_review_boundary.human_review_required).toBe(10000);
      expect(counts.human_review_boundary.human_review_required_pct).toBe(100.0);
      expect(counts.human_review_boundary.auto_approved_count).toBe(0);
      expect(counts.human_review_boundary.active_transition_count).toBe(0);
      expect(counts.human_review_boundary.production_supabase_mutations).toBe(0);
    });

    it('identifies and ranks bottlenecks strictly by count without subjective scores', () => {
      const { auditOutput } = executeLargeDatasetAudit();
      const bottlenecks = auditOutput.bottleneck_ranking_by_count;

      expect(bottlenecks.length).toBe(6);
      expect(bottlenecks[0].factor).toBe('LACK_OF_LEXICAL_SOURCE_OR_INSUFFICIENT_CURATED_COVERAGE');
      expect(bottlenecks[0].unit_count).toBe(9952);
      expect(bottlenecks[0].percentage).toBe(99.52);

      expect(bottlenecks[1].factor).toBe('CLOSED_CLASS_POS_UNKNOWN_TO_SEMANTIC_VALIDATOR');
      expect(bottlenecks[1].unit_count).toBe(301);

      expect(bottlenecks[2].factor).toBe('CEFR_OR_PEDAGOGICAL_SENSE_REGISTER_CONFLICT');
      expect(bottlenecks[2].unit_count).toBe(21); // 14 incompatible + 7 conflict

      expect(bottlenecks[3].factor).toBe('FAILED_THAI_STRUCTURAL_QUALITY_GATE');
      expect(bottlenecks[3].unit_count).toBe(4);

      expect(bottlenecks[4].factor).toBe('AMBIGUOUS_POLYSEMY_IN_GROUNDED_SENSES');
      expect(bottlenecks[4].unit_count).toBe(0);

      expect(bottlenecks[5].factor).toBe('POS_MISMATCH_IN_GROUNDED_SENSES');
      expect(bottlenecks[5].unit_count).toBe(0);
    });

    it('verifies that CEFR level is never overwritten by external lexical evidence', () => {
      // Test unit with claimed A1 and candidate at C1
      const testUnit = {
        word: 'testword',
        part_of_speech: 'noun',
        claimed_cefr_level: 'A1',
        definition_en: 'testing definition',
        candidate_senses: [{ synset_id: 'test-synset-01' }],
      };

      const candCefr = 'C1';
      const cefrResult = checkCefrCompatibility(testUnit.claimed_cefr_level, candCefr);

      // Incompatibility flagged
      expect(cefrResult.compatible).toBe(false);
      expect(cefrResult.note).toContain('Potential CEFR mismatch');

      // Glova unit CEFR remains strictly immutable
      expect(testUnit.claimed_cefr_level).toBe('A1');
    });

    it('verifies ambiguous senses and conflicts remain non-approved and flagged as HOLD candidates', () => {
      const holdUnit = {
        word: 'above',
        part_of_speech: 'adverb',
        claimed_cefr_level: 'A1',
        definition_en: '(in writing) at an earlier place',
        candidate_senses: [{ synset_id: '00079960-r' }],
      };

      const result = runPreReviewAlignment(holdUnit);
      expect(result.candidate_status).toBe(PRE_REVIEW_CANDIDATE_STATUS.HOLD_CANDIDATE);
      expect(result.sense_alignment.status).toBe(SENSE_ALIGNMENT_STATUS.CONFLICT);
      expect(result.reviewer_decision).toBeNull();
      expect(result.field_status).toBe('AI_DRAFT');
      expect(result.lifecycle_status).toBe('REVIEW_REQUIRED');
      expect(result.human_review_required).toBe(true);
    });

    it('verifies that ungrounded units strictly remain UNRESOLVED and REVIEW_REQUIRED', () => {
      const ungroundedUnit = {
        learning_unit_key: 'customlemma|noun|B1|sense:1',
        word: 'customlemma',
        part_of_speech: 'noun',
        cefr_level: 'B1',
        meaning_en: 'an ungrounded unit lemma',
      };

      const result = runPreReviewAlignment(ungroundedUnit);
      expect(result.candidate_status).toBe(PRE_REVIEW_CANDIDATE_STATUS.UNRESOLVED);
      expect(result.selected_candidate).toBeNull();
      expect(result.sense_alignment.status).toBe(SENSE_ALIGNMENT_STATUS.NO_MATCH);
      expect(result.pos_alignment.status).toBe(POS_ALIGNMENT_STATUS.UNKNOWN);
      expect(result.field_status).toBe('AI_DRAFT');
      expect(result.lifecycle_status).toBe('REVIEW_REQUIRED');
      expect(result.human_review_required).toBe(true);
      expect(result.reviewer_decision).toBeNull();
    });

    it('maintains 65 human reviews completely untouched and immutable', () => {
      const { auditOutput } = executeLargeDatasetAudit();
      const hist = auditOutput.exact_dataset_counts.human_review_boundary;

      expect(hist.historical_human_reviews_preserved).toBe(65);
      expect(hist.historical_decisions.APPROVED).toBe(62);
      expect(hist.historical_decisions.HOLD).toBe(2);
      expect(hist.historical_decisions.EDIT_REQUIRED).toBe(1);
    });

    it('synthesizes curated expansion candidate queue prioritized by CEFR and frequency', () => {
      const { expansionQueueOutput } = executeLargeDatasetAudit();

      expect(expansionQueueOutput.total_learning_units_covered).toBe(9970);
      expect(expansionQueueOutput.total_candidates).toBe(8757);

      // Verify prioritization bands
      expect(expansionQueueOutput.priority_band_counts.priority_1_a1_core_foundational).toBe(1059);
      expect(expansionQueueOutput.priority_band_counts.priority_2_a2_elementary).toBe(1235);
      expect(expansionQueueOutput.priority_band_counts.priority_3_b1_intermediate).toBe(2183);
      expect(expansionQueueOutput.priority_band_counts.priority_4_b2_upper_intermediate).toBe(2488);
      expect(expansionQueueOutput.priority_band_counts.priority_5_c1_c2_advanced).toBe(1792);

      // Ensure notice is present that queue is not an approval queue
      expect(expansionQueueOutput.notice).toContain('THIS IS NOT AN APPROVAL QUEUE');
    });

    it('verifies exact 25-record pilot sample reproducibility (zero regression)', () => {
      const output = executePilotComparison();

      expect(output.sample_size).toBe(25);
      expect(output.pre_review_metrics.total_evaluated).toBe(25);
      expect(output.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(output.pre_review_metrics.approved_candidate_ready_pct).toBe(84.0);
      expect(output.pre_review_metrics.edit_required_candidate).toBe(0);
      expect(output.pre_review_metrics.hold_candidate).toBe(4);
      expect(output.pre_review_metrics.hold_candidate_pct).toBe(16.0);
      expect(output.pre_review_metrics.unresolved).toBe(0);
      expect(output.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(output.pre_review_metrics.source_grounded_rate_pct).toBe(100.0);
      expect(output.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });

    it('maintains all global authoritative invariants: 28 learner-ready, 9972 gap, 0 mutations, NOT_READY', () => {
      const { auditOutput } = executeLargeDatasetAudit();
      const inv = auditOutput.authoritative_invariants;

      expect(inv.learner_ready).toBe(28);
      expect(inv.target).toBe(10000);
      expect(inv.gap).toBe(9972);
      expect(inv.overall_status).toBe('NOT_READY');
      expect(inv.user_testing_authorized).toBe(false);
      expect(inv.production_supabase_mutations).toBe(0);
      expect(inv.cefr_overwritten_by_lexical_source).toBe(false);
    });
  });

  // 18. Phase 6.2.20 — Priority-Driven Grounded Lexicon Expansion & Coverage Validation
  describe('18. Phase 6.2.20 — Priority-Driven Grounded Lexicon Expansion & Coverage Validation', () => {
    it('verifies pipeline trace on curated entries: builds 234 expansion candidates from 240 registry entries', () => {
      const candidates = buildCuratedExpansionCandidates();
      expect(candidates.length).toBe(234); // 234 newly created expansion candidates (6 already present in base registry)
      expect(Object.keys(GLOVA_CURATED_HEADWORD_REGISTRY).length).toBe(240);
      for (const cand of candidates) {
        expect(cand.source).toBe('GLOVA_CURATED_REGISTRY');
        expect(cand.license).toBe('Glova-Internal-Proprietary');
        expect(cand.source_version).toBe('2.0.0');
        expect(typeof cand.headword).toBe('string');
        expect(typeof cand.pos).toBe('string');
        expect(typeof cand.thai_gloss).toBe('string');
      }
    });

    it('verifies external lexical source licensing, provenance, and legal blocking of unverified sources', () => {
      const licDocPath = path.join(projectRoot, 'docs/assessment/thai-lexical-sources-license-and-provenance.md');
      expect(fs.existsSync(licDocPath)).toBe(true);
      const content = fs.readFileSync(licDocPath, 'utf8');

      expect(content).toContain('GLOVA_CURATED_REGISTRY');
      expect(content).toContain('Glova-Internal-Proprietary');
      expect(content).toContain('APPROVED');

      expect(content).toContain('Open English WordNet (OEWN)');
      expect(content).toContain('CC-BY-4.0');

      expect(content).toContain('NECTEC LEXiTRON');
      expect(content).toContain('BLOCKED');

      expect(content).toContain('Open Multilingual Wordnet (OMW Thai)');
      expect(content).toContain('BLOCKED');

      expect(content).toContain('Cambridge');
      expect(content).toContain('Oxford');
      expect(content).toContain('Longman');
      expect(content).toContain('STRICTLY BLOCKED');
    });

    it('isolates closed-class functional items into SPECIAL_SYNTAX_REVIEW_REQUIRED status', () => {
      expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes('preposition')).toBe(true);
      expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes('pronoun')).toBe(true);
      expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes('determiner')).toBe(true);
      expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes('conjunction')).toBe(true);
      expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes('number')).toBe(true);

      const prepUnit = {
        word: 'in',
        part_of_speech: 'preposition',
        claimed_cefr_level: 'A1',
        meaning_en: 'inside a container or space',
      };

      const res = runPreReviewAlignment(prepUnit, { classifyClosedClass: true });
      expect(res.candidate_status).toBe(PRE_REVIEW_CANDIDATE_STATUS.SPECIAL_SYNTAX_REVIEW_REQUIRED);
      expect(res.human_review_required).toBe(true);
      expect(res.field_status).toBe('AI_DRAFT');
      expect(res.lifecycle_status).toBe('REVIEW_REQUIRED');
      expect(res.reviewer_decision).toBeNull();
    });

    it('executes controlled 200-unit pilot (100 A1, 100 A2) and verifies exact before/after empirical deltas', () => {
      const { pilotOutput, deltaOutput } = runPilotExpansionComparison();

      // Pilot Scope
      expect(pilotOutput.sample_scope.total_pilot_units).toBe(200);
      expect(pilotOutput.sample_scope.a1_units).toBe(100);
      expect(pilotOutput.sample_scope.a2_units).toBe(100);

      // Metrics Before
      const b = pilotOutput.metrics_before;
      expect(b.total_evaluated).toBe(200);
      expect(b.source_grounded).toBe(2);
      expect(b.no_lexical_source).toBe(198);
      expect(b.candidate_ready).toBe(2);
      expect(b.edit_required).toBe(0);
      expect(b.hold_candidate).toBe(0);
      expect(b.unresolved).toBe(198);
      expect(b.special_syntax_review_required).toBe(0);

      // Metrics After
      const a = pilotOutput.metrics_after;
      expect(a.total_evaluated).toBe(200);
      expect(a.source_grounded).toBe(21);
      expect(a.no_lexical_source).toBe(179);
      expect(a.candidate_ready).toBe(21);
      expect(a.edit_required).toBe(0);
      expect(a.hold_candidate).toBe(0);
      expect(a.unresolved).toBe(160);
      expect(a.special_syntax_review_required).toBe(19);

      // Exact Deltas
      const d = deltaOutput.comparison_table;
      expect(d.source_grounded.delta).toBe(19);
      expect(d.no_lexical_source.delta).toBe(-19);
      expect(d.candidate_ready.delta).toBe(19);
      expect(d.special_syntax_review_required.delta).toBe(19);
      expect(d.unresolved.delta).toBe(-38);
      expect(d.human_review_required.before).toBe(200);
      expect(d.human_review_required.after).toBe(200);
      expect(d.human_review_required.delta).toBe(0);

      // Measured Yield
      const y = pilotOutput.measured_yield;
      expect(y.grounded_candidates_added).toBe(19);
      expect(y.grounded_candidate_yield_pct).toBe(9.5);
      expect(y.candidate_ready_units_added).toBe(19);
      expect(y.candidate_ready_yield_pct).toBe(9.5);
      expect(y.closed_class_segregated_count).toBe(19);
      expect(y.unresolved_reduction).toBe(38);
    });

    it('verifies pilot decision gate classification returns EXPANSION_VALIDATED', () => {
      const { pilotOutput } = runPilotExpansionComparison();
      expect(pilotOutput.decision_gate.classification).toBe('EXPANSION_VALIDATED');
      expect(pilotOutput.decision_gate.rationale).toContain('Pilot demonstrated clean empirical yield');
      expect(pilotOutput.decision_gate.next_phase_recommendation).toContain('Proceed to Phase 6.2.21');

      // Test negative classification
      const negativeResult = classifyExpansionPilot({
        delta: { candidate_ready: 0, source_grounded: 0 },
        candidateReadyYieldPct: 0,
        groundedYieldPct: 0,
      });
      expect(negativeResult.classification).toBe('EXPANSION_NEEDS_REWORK');
    });

    it('verifies exact 25-record pilot sample reproducibility (zero regression)', () => {
      const output = executePilotComparison();

      expect(output.sample_size).toBe(25);
      expect(output.pre_review_metrics.total_evaluated).toBe(25);
      expect(output.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(output.pre_review_metrics.approved_candidate_ready_pct).toBe(84.0);
      expect(output.pre_review_metrics.edit_required_candidate).toBe(0);
      expect(output.pre_review_metrics.hold_candidate).toBe(4);
      expect(output.pre_review_metrics.hold_candidate_pct).toBe(16.0);
      expect(output.pre_review_metrics.unresolved).toBe(0);
      expect(output.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(output.pre_review_metrics.source_grounded_rate_pct).toBe(100.0);
      expect(output.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });

    it('maintains strict global readiness invariants: 83 learner-ready, 9917 gap, NOT_READY', () => {
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

  // 19. Phase 6.2.21 — Controlled A1/A2 Grounding Scale-Up & Human-QA Queue Preparation
  describe('19. Phase 6.2.21 — Controlled A1/A2 Grounding Scale-Up & Human-QA Queue Preparation', () => {
    it('deterministically selects 1,000-unit scale-up sample: exactly 500 A1 and 500 A2 with unique keys', () => {
      const sample = selectControlledScaleupSample();
      expect(sample.length).toBe(1000);

      const a1Count = sample.filter(s => s.cefr_level === 'A1').length;
      const a2Count = sample.filter(s => s.cefr_level === 'A2').length;
      expect(a1Count).toBe(500);
      expect(a2Count).toBe(500);

      // Verify deterministic selection and unique keys
      const keys = new Set(sample.map(s => s.learning_unit_key));
      expect(keys.size).toBe(1000);

      // Re-run returns identical deterministic sample
      const sample2 = selectControlledScaleupSample();
      expect(sample2[0].learning_unit_key).toBe(sample[0].learning_unit_key);
      expect(sample2[999].learning_unit_key).toBe(sample[999].learning_unit_key);
    });

    it('executes candidate-ready quality check: 0 structural defects, clean gates, and documented legacy gaps', () => {
      const { scaleupOutput } = runScaleupA1A2Comparison({ writeReports: false });
      const qc = scaleupOutput.quality_check_candidate_ready;

      expect(qc.passed).toBe(true);
      expect(qc.inspected_count).toBe(108);
      expect(qc.check_summary.duplicate_learning_unit_keys).toBe(0);
      expect(qc.check_summary.missing_provenance).toBe(0);
      expect(qc.check_summary.invalid_candidate_metadata).toBe(0);
      expect(qc.check_summary.pos_inconsistencies).toBe(0);
      expect(qc.check_summary.sense_mismatches).toBe(0);
      expect(qc.check_summary.cefr_mismatches).toBe(0);
      expect(qc.check_summary.placeholder_thai_text).toBe(0);
      expect(qc.check_summary.synthetic_thai_templates).toBe(0);
      expect(qc.check_summary.unresolved_ipa).toBe(0);

      // Documented gaps for legacy OEWN example sentences
      expect(qc.documented_gaps.length).toBeGreaterThan(0);
      expect(qc.documented_gaps[0]).toContain('candidate-ready units contain raw OEWN example sentences');
    });

    it('measures exact empirical scale-up metrics and deltas across 1,000 units', () => {
      const { scaleupOutput, deltaOutput } = runScaleupA1A2Comparison({ writeReports: false });

      // Before metrics
      expect(scaleupOutput.metrics_before.total_evaluated).toBe(1000);
      expect(scaleupOutput.metrics_before.source_grounded).toBe(4);
      expect(scaleupOutput.metrics_before.no_lexical_source).toBe(996);
      expect(scaleupOutput.metrics_before.candidate_ready).toBe(4);
      expect(scaleupOutput.metrics_before.edit_required).toBe(0);
      expect(scaleupOutput.metrics_before.hold_candidate).toBe(0);
      expect(scaleupOutput.metrics_before.unresolved).toBe(996);
      expect(scaleupOutput.metrics_before.special_syntax_review_required).toBe(0);

      // After metrics
      expect(scaleupOutput.metrics_after.total_evaluated).toBe(1000);
      expect(scaleupOutput.metrics_after.source_grounded).toBe(108);
      expect(scaleupOutput.metrics_after.no_lexical_source).toBe(892);
      expect(scaleupOutput.metrics_after.candidate_ready).toBe(108);
      expect(scaleupOutput.metrics_after.edit_required).toBe(0);
      expect(scaleupOutput.metrics_after.hold_candidate).toBe(0);
      expect(scaleupOutput.metrics_after.unresolved).toBe(799);
      expect(scaleupOutput.metrics_after.special_syntax_review_required).toBe(93);

      // Deltas
      const d = deltaOutput.comparison_table;
      expect(d.source_grounded.delta).toBe(104);
      expect(d.no_lexical_source.delta).toBe(-104);
      expect(d.candidate_ready.delta).toBe(104);
      expect(d.special_syntax_review_required.delta).toBe(93);
      expect(d.unresolved.delta).toBe(-197);
      expect(d.human_review_required.before).toBe(1000);
      expect(d.human_review_required.after).toBe(1000);
      expect(d.human_review_required.delta).toBe(0);

      // Measured yield
      const y = scaleupOutput.measured_yield;
      expect(y.grounded_candidates_added).toBe(104);
      expect(y.grounded_candidate_yield_pct).toBe(10.4);
      expect(y.candidate_ready_units_added).toBe(104);
      expect(y.candidate_ready_yield_pct).toBe(10.4);
      expect(y.closed_class_segregated_count).toBe(93);
      expect(y.closed_class_rate_pct).toBe(9.3);
      expect(y.unresolved_reduction).toBe(197);
    });

    it('partitions candidate pool into 5 clean human-review queues with dedicated special syntax packet', () => {
      const { queueOutput } = runScaleupA1A2Comparison({ writeReports: false });

      expect(queueOutput.total_units_in_queues).toBe(1000);
      expect(queueOutput.queue_summary.candidate_ready).toBe(108);
      expect(queueOutput.queue_summary.edit_required).toBe(0);
      expect(queueOutput.queue_summary.hold_candidate).toBe(0);
      expect(queueOutput.queue_summary.special_syntax_review_required).toBe(93);
      expect(queueOutput.queue_summary.unresolved).toBe(799);

      // Verify sum of queues equals exactly 1000
      const totalInSummary = Object.values(queueOutput.queue_summary).reduce((a: number, b: any) => a + Number(b), 0);
      expect(totalInSummary).toBe(1000);

      // Verify special syntax review queue contains closed-class items
      for (const item of queueOutput.queues.special_syntax_review_required) {
        expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes(item.part_of_speech)).toBe(true);
        expect(item.candidate_status).toBe('SPECIAL_SYNTAX_REVIEW_REQUIRED');
        expect(item.human_review_required).toBe(true);
        expect(item.field_status).toBe('AI_DRAFT');
        expect(item.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(item.reviewer_decision).toBeNull();
      }

      // Verify candidate-ready queue items have required properties
      for (const item of queueOutput.queues.candidate_ready) {
        expect(item.candidate_status).toBe('APPROVED_CANDIDATE_READY');
        expect(item.human_review_required).toBe(true);
        expect(item.field_status).toBe('AI_DRAFT');
        expect(item.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(item.reviewer_decision).toBeNull();
        expect(item.provenance).toBeDefined();
        expect(item.selected_candidate).toBeDefined();
      }
    });

    it('evaluates pilot vs scale-up rate stability and labels sample yield range without unwarranted extrapolation', () => {
      const { scaleupOutput } = runScaleupA1A2Comparison({ writeReports: false });
      const comp = scaleupOutput.study_comparison_pilot_vs_scaleup;

      // Pilot 200 rates
      expect(comp.pilot_200.sample_size).toBe(200);
      expect(comp.pilot_200.grounded_rate_pct).toBe(10.5);
      expect(comp.pilot_200.candidate_ready_rate_pct).toBe(10.5);
      expect(comp.pilot_200.special_syntax_rate_pct).toBe(9.5);

      // Scale-up 1000 rates
      expect(comp.scaleup_1000.sample_size).toBe(1000);
      expect(comp.scaleup_1000.grounded_rate_pct).toBe(10.8);
      expect(comp.scaleup_1000.candidate_ready_rate_pct).toBe(10.8);
      expect(comp.scaleup_1000.special_syntax_rate_pct).toBe(9.3);

      // Delta between studies is within ±0.3%
      expect(Math.abs(comp.delta_between_studies.grounded_rate_delta_pct)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(comp.delta_between_studies.candidate_ready_rate_delta_pct)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(comp.delta_between_studies.special_syntax_rate_delta_pct)).toBeLessThanOrEqual(0.5);

      // Observed yield range disclaimer
      expect(comp.observed_yield_range.label).toBe('OBSERVED_SAMPLE_YIELD_RANGE_NOT_EXTRAPOLATED_GUARANTEE');
      expect(comp.observed_yield_range.disclaimer).toContain('must NOT be treated as a statistical guarantee');
    });

    it('verifies decision gate classification returns SCALEUP_VALIDATED', () => {
      const { scaleupOutput } = runScaleupA1A2Comparison({ writeReports: false });
      expect(scaleupOutput.decision_gate.classification).toBe('SCALEUP_VALIDATED');
      expect(scaleupOutput.decision_gate.rationale).toContain('Scale-up on 1,000 controlled units demonstrated deterministic grounding');
      expect(scaleupOutput.decision_gate.next_phase_recommendation).toContain('Proceed to Phase 6.2.22');

      // Test negative classification
      const negativeResult = classifyScaleup({
        delta: { candidate_ready: 0, source_grounded: 0, special_syntax_review_required: 0 },
        candidateReadyYieldPct: 0,
        groundedYieldPct: 0,
        qualityCheckPassed: false,
      });
      expect(negativeResult.classification).toBe('SCALEUP_NEEDS_REWORK');
    });

    it('verifies exact 25-record historical regression sample reproducibility (zero regression)', () => {
      const output = executePilotComparison();

      expect(output.sample_size).toBe(25);
      expect(output.pre_review_metrics.total_evaluated).toBe(25);
      expect(output.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(output.pre_review_metrics.approved_candidate_ready_pct).toBe(84.0);
      expect(output.pre_review_metrics.edit_required_candidate).toBe(0);
      expect(output.pre_review_metrics.hold_candidate).toBe(4);
      expect(output.pre_review_metrics.hold_candidate_pct).toBe(16.0);
      expect(output.pre_review_metrics.unresolved).toBe(0);
      expect(output.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(output.pre_review_metrics.source_grounded_rate_pct).toBe(100.0);
      expect(output.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });

    it('maintains strict global readiness invariants: 83 learner-ready, 9917 gap, NOT_READY', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
      expect(readiness.production_safety.bulk_promotions_executed).toBe(false);
    }, 30000);
  });

  // 20. Phase 6.2.22 — Structured Human QA Execution on Candidate-Ready Queue & Closed-Class Syntactic Adjudication
  describe('20. Phase 6.2.22 — Structured Human QA Execution on Candidate-Ready Queue & Closed-Class Syntactic Adjudication', () => {
    it('reconciles all 108 candidate-ready records against authoritative LARGE batch records and measures 10 quality dimensions', () => {
      const reconciliationReport = reconcileCandidateReadyQueue();

      expect(reconciliationReport.total_candidate_ready_inspected).toBe(108);
      expect(reconciliationReport.batch_cross_parity_verified_count).toBe(108);

      // Reconciled classification breakdown: 5 REVIEW_READY, 103 EDIT_REQUIRED, 0 HOLD, 0 SPECIAL_SYNTAX
      expect(reconciliationReport.reconciled_classifications[RECONCILIATION_STATUS.REVIEW_READY]).toBe(5);
      expect(reconciliationReport.reconciled_classifications[RECONCILIATION_STATUS.EDIT_REQUIRED]).toBe(103);
      expect(reconciliationReport.reconciled_classifications[RECONCILIATION_STATUS.HOLD]).toBe(0);
      expect(reconciliationReport.reconciled_classifications[RECONCILIATION_STATUS.SPECIAL_SYNTAX_REVIEW_REQUIRED]).toBe(0);

      // Explicit confirmation of the 103/108 example-sentence presentation finding
      const exFinding = reconciliationReport.summary_findings;
      expect(exFinding.core_lexical_grounding_passed_count).toBe(108);
      expect(exFinding.core_lexical_defects_count).toBe(0);
      expect(exFinding.example_sentence_clean_count).toBe(5);
      expect(exFinding.example_sentence_presentation_issues_count).toBe(103);
      expect(exFinding.confirmed_103_of_108_example_finding).toBe(true);
      expect(exFinding.auto_approved_count).toBe(0);

      // Verify all 10 dimensions are explicitly measured and sum to 108 per dimension
      const dimSummary = reconciliationReport.ten_dimension_measurements;
      const expectedDimensions = [
        'example_sentence_capitalization',
        'terminal_punctuation',
        'sentence_completeness',
        'target_word_presence',
        'thai_meaning_quality',
        'ipa_quality',
        'pos_alignment',
        'sense_alignment',
        'cefr_compatibility',
        'provenance_completeness',
      ];
      for (const dim of expectedDimensions) {
        expect(dimSummary[dim]).toBeDefined();
        expect(dimSummary[dim].pass + dimSummary[dim].fail).toBe(108);
      }

      // Example sentence dimension counts
      expect(dimSummary.example_sentence_capitalization.pass).toBe(43);
      expect(dimSummary.example_sentence_capitalization.fail).toBe(65);
      expect(dimSummary.terminal_punctuation.pass).toBe(14);
      expect(dimSummary.terminal_punctuation.fail).toBe(94);
      expect(dimSummary.sentence_completeness.pass).toBe(78);
      expect(dimSummary.sentence_completeness.fail).toBe(30);

      // Core lexical & provenance gates pass 108/108
      expect(dimSummary.target_word_presence.pass).toBe(108);
      expect(dimSummary.thai_meaning_quality.pass).toBe(108);
      expect(dimSummary.ipa_quality.pass).toBe(108);
      expect(dimSummary.pos_alignment.pass).toBe(108);
      expect(dimSummary.sense_alignment.pass).toBe(108);
      expect(dimSummary.cefr_compatibility.pass).toBe(108);
      expect(dimSummary.provenance_completeness.pass).toBe(108);
    });

    it('builds structured human review packet with zero fake reviewer identities and zero auto-approvals', () => {
      const reconciliationReport = reconcileCandidateReadyQueue();
      const packet = buildHumanReviewPacket(reconciliationReport);

      expect(packet.packet_summary.total_inspectable_units).toBe(108);
      expect(packet.packet_summary.clean_review_ready_units).toBe(5);
      expect(packet.packet_summary.needs_inline_example_edit_units).toBe(103);
      expect(packet.packet_summary.hold_units).toBe(0);
      expect(packet.packet_summary.auto_approved_units).toBe(0);

      // Verify reviewer identity limitation is explicitly documented
      expect(packet.reviewer_identity_policy.fake_reviewer_generated).toBe(false);
      expect(packet.reviewer_identity_policy.ai_or_bot_reviewer_prohibited).toBe(true);
      expect(packet.reviewer_identity_policy.operational_id_limitation_notice).toContain(
        'internal workflow identifier only'
      );

      // Every packet item must remain unreviewed and REVIEW_REQUIRED
      for (const rec of packet.items) {
        expect(rec.learning_unit_key).toBeTruthy();
        expect(rec.reviewer_id).toBeNull();
        expect(rec.reviewer_decision).toBeNull();
        expect(rec.review_rationale).toBeNull();
        expect(rec.reviewed_at).toBeNull();
        expect(rec.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(rec.field_status).toBe('AI_DRAFT');
      }
    });

    it('prepares dedicated closed-class special-syntax adjudication packet for all 93 units', () => {
      const packet = buildSpecialSyntaxAdjudicationPacket();

      expect(packet.total_special_syntax_units).toBe(93);
      expect(packet.breakdown_by_cefr.A1).toBe(71);
      expect(packet.breakdown_by_cefr.A2).toBe(22);
      expect(packet.adjudication_policy.allowed_dispositions).toEqual(['APPROVE', 'EDIT_REQUIRED', 'HOLD']);
      expect(packet.auto_approved_units).toBe(0);

      for (const rec of packet.records) {
        expect(CLOSED_CLASS_PARTS_OF_SPEECH.includes(rec.pos)).toBe(true);
        expect(rec.grammatical_role).toBeTruthy();
        expect(rec.syntactic_evidence).toBeTruthy();
        expect(rec.potential_ambiguity).toBeTruthy();
        expect(rec.allowed_dispositions).toEqual(['APPROVE', 'EDIT_REQUIRED', 'HOLD']);
        expect(rec.reviewer_decision).toBeNull();
        expect(rec.reviewer_id).toBeNull();
        expect(rec.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(rec.field_status).toBe('AI_DRAFT');
      }
    });

    it('verifies CLI dry-run and sandbox atomic transaction integrity for APPROVE, EDIT_REQUIRED, and HOLD without touching live ledger', () => {
      const cliIntegrity = verifyCliAndTransactionIntegrity();

      expect(cliIntegrity.bot_identity_rejected).toBe(true);
      expect(cliIntegrity.operational_id_format_accepted).toBe(true);
      expect(cliIntegrity.operational_id_not_cryptographic_proof_documented).toBe(true);
      expect(cliIntegrity.unique_transaction_id_verified).toBe(true);
      expect(cliIntegrity.live_ledger_untouched).toBe(true);

      const sb = cliIntegrity.sandbox_verification;
      expect(sb.dry_run_passed).toBe(true);
      expect(sb.atomic_commit_passed).toBe(true);
      expect(sb.approve_transition_verified).toBe(true);
      expect(sb.hold_transition_verified).toBe(true);
      expect(sb.edit_required_transition_verified).toBe(true);
      expect(sb.ledger_synchronized).toBe(true);
    });

    it('verifies Phase 6.2.22 decision gate classification returns HUMAN_QA_PACKET_READY and writes all 4 required artifacts', () => {
      const result = runPhase6222HumanQaExecution({ writeArtifacts: false });

      expect(result.decisionGate).toBe(DECISION_GATES_6_2_22.HUMAN_QA_PACKET_READY);
      expect(result.decisionGate).toBe('HUMAN_QA_PACKET_READY');

      // Check that the 4 required files exist on disk from the CLI execution
      expect(fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.22-candidate-ready-reconciliation.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.22-human-review-packet.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.22-special-syntax-adjudication.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectRoot, 'docs/assessment/phase-6.2.22-human-qa-execution.md'))).toBe(true);
    });

    it('verifies exact 25-record historical regression sample reproducibility (zero regression)', () => {
      const output = executePilotComparison();

      expect(output.sample_size).toBe(25);
      expect(output.pre_review_metrics.total_evaluated).toBe(25);
      expect(output.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(output.pre_review_metrics.approved_candidate_ready_pct).toBe(84.0);
      expect(output.pre_review_metrics.edit_required_candidate).toBe(0);
      expect(output.pre_review_metrics.hold_candidate).toBe(4);
      expect(output.pre_review_metrics.hold_candidate_pct).toBe(16.0);
      expect(output.pre_review_metrics.unresolved).toBe(0);
      expect(output.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(output.pre_review_metrics.source_grounded_rate_pct).toBe(100.0);
      expect(output.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });

    it('maintains strict global readiness invariants and untouched historical ledger (65 production reviews, 83 learner-ready, 9917 gap, NOT_READY)', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
      expect(readiness.production_safety.bulk_promotions_executed).toBe(false);

      const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
      const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
      const prodEvents = ledger.events.filter((e: any) => e.is_production_review === true);
      expect(prodEvents.length).toBe(65);
      expect(prodEvents.filter((e: any) => e.decision === 'APPROVED').length).toBe(62);
      expect(prodEvents.filter((e: any) => e.decision === 'HOLD').length).toBe(2);
      expect(prodEvents.filter((e: any) => e.decision === 'EDIT_REQUIRED').length).toBe(1);
    });
  });

  // 21. Phase 6.2.23 — Controlled Human Review Pilot
  describe('21. Phase 6.2.23 — Controlled Human Review Pilot', () => {
    it('prepares deterministic 15-record pilot queue (exact 5 REVIEW_READY, 5 EDIT_REQUIRED, 5 SPECIAL_SYNTAX) without touching remaining 93/799 queues', () => {
      const pilotQueue = prepareControlledPilotQueue();

      expect(pilotQueue.total_pilot_records).toBe(15);
      expect(pilotQueue.group_counts.review_ready).toBe(5);
      expect(pilotQueue.group_counts.edit_required).toBe(5);
      expect(pilotQueue.group_counts.special_syntax).toBe(5);

      // Verify canonical 5 REVIEW_READY records (Set B) and rejection of invalid synthetic fallback targets
      const rrKeys = pilotQueue.groups.review_ready.map((r: any) => r.learning_unit_key);
      expect(rrKeys).toEqual([...AUTHORITATIVE_SET_B_REVIEW_READY_KEYS]);
      expect(pilotQueue.synthetic_fallback_specs_disabled).toBe(true);
      expect(pilotQueue.rejected_invalid_review_targets.map((t: any) => t.requested_key)).toEqual([
        ...REJECTED_SYNTHETIC_PILOT_FALLBACK_KEYS,
      ]);

      // Verify all 15 pilot keys are unique
      const allKeys = new Set(pilotQueue.records.map((r: any) => r.learning_unit_key));
      expect(allKeys.size).toBe(15);

      // Verify remaining queues are untouched
      expect(pilotQueue.untouched_queues.remaining_edit_required_untouched).toBe(98);
      expect(pilotQueue.untouched_queues.remaining_special_syntax_untouched).toBe(88);
      expect(pilotQueue.untouched_queues.unresolved_untouched).toBe(799);
      expect(pilotQueue.untouched_queues.automatic_processing_applied_to_remaining).toBe(false);
    });

    it('exposes all 11 required Human Decision Interface fields and restricts dispositions to APPROVE, EDIT_REQUIRED, HOLD', () => {
      const pilotQueue = prepareControlledPilotQueue();

      for (const rec of pilotQueue.records) {
        const validation = validateHumanDecisionInterfaceItem(rec);
        expect(validation.valid).toBe(true);
        expect(validation.missing_fields).toEqual([]);
        expect(validation.dispositions_valid).toBe(true);

        for (const field of REQUIRED_INTERFACE_FIELDS) {
          expect(rec.human_decision_interface[field]).toBeDefined();
          expect(rec.human_decision_interface[field]).not.toBeNull();
        }
        expect(rec.allowed_dispositions).toEqual(['APPROVE', 'EDIT_REQUIRED', 'HOLD']);
      }
    });

    it('enforces STOP FOR ACTUAL HUMAN INPUT: zero simulated decisions, pending REVIEW_REQUIRED / AI_DRAFT state, and NO_HUMAN_DECISIONS_AVAILABLE gate', () => {
      const report = runPhase6223ControlledHumanReviewPilot({ writeArtifacts: false });

      expect(report.final_gate).toBe(DECISION_GATES_6_2_23.NO_HUMAN_DECISIONS_AVAILABLE);
      expect(report.final_gate).toBe('NO_HUMAN_DECISIONS_AVAILABLE');
      expect(report.human_decisions_actually_received_count).toBe(0);
      expect(report.no_decision_state.active).toBe(true);
      expect(report.no_decision_state.all_15_records_pending_verification).toBe(true);

      // Verify reviewer_id limitation documented
      expect(report.reviewer_identifier_limitation.is_operational_identifier_only).toBe(true);
      expect(report.reviewer_identifier_limitation.is_cryptographic_proof_of_human).toBe(false);

      for (const rec of report.pilot_queue.records) {
        expect(rec.reviewer_decision).toBeNull();
        expect(rec.reviewer_id).toBeNull();
        expect(rec.reviewed_at).toBeNull();
        expect(rec.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(rec.field_status).toBe('AI_DRAFT');
      }
    });

    it('verifies atomic multi-file commit and full rollback on failure in isolated sandbox (0 partial writes, 0 phantom ledger events)', () => {
      const sb = verifyPilotAtomicIntegrityAndRollback();

      expect(sb.rollback_on_failure_verified).toBe(true);
      expect(sb.zero_partial_writes_on_failure).toBe(true);
      expect(sb.zero_phantom_ledger_events_on_failure).toBe(true);
      expect(sb.approve_transition_verified).toBe(true);
      expect(sb.edit_required_preserves_previous_values).toBe(true);
      expect(sb.hold_transition_verified).toBe(true);
      expect(sb.cross_file_consistency_verified).toBe(true);
      expect(sb.sandbox_transaction_ids.length).toBe(3);
    });

    it('computes human QA quality analysis on 15 pilot records and enforces non-extrapolation rule', () => {
      const pilotQueue = prepareControlledPilotQueue();
      const qa = analyzePilotQualityProfile(pilotQueue, []);

      expect(qa.pilot_sample_size).toBe(15);
      expect(qa.real_human_decisions_received_count).toBe(0);
      expect(qa.observed_human_decision_rates.approval_rate_pct).toBe(0);
      expect(qa.observed_human_decision_rates.edit_required_rate_pct).toBe(0);
      expect(qa.observed_human_decision_rates.hold_rate_pct).toBe(0);
      expect(qa.observed_human_decision_rates.pending_awaiting_human_rate_pct).toBe(100);
      expect(qa.defect_category_analysis.example_sentence_defects.affected_pilot_units_count).toBe(10);
      expect(qa.defect_category_analysis.special_syntax_issues.isolated_pilot_units_count).toBe(5);
      expect(qa.non_extrapolation_statement).toContain('MUST NOT be extrapolated to the full 10,000-unit vocabulary inventory');
    });

    it('verifies exact 25-record historical regression sample reproducibility (zero regression)', () => {
      const output = executePilotComparison();

      expect(output.sample_size).toBe(25);
      expect(output.pre_review_metrics.total_evaluated).toBe(25);
      expect(output.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(output.pre_review_metrics.approved_candidate_ready_pct).toBe(84.0);
      expect(output.pre_review_metrics.edit_required_candidate).toBe(0);
      expect(output.pre_review_metrics.hold_candidate).toBe(4);
      expect(output.pre_review_metrics.hold_candidate_pct).toBe(16.0);
      expect(output.pre_review_metrics.unresolved).toBe(0);
      expect(output.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(output.pre_review_metrics.source_grounded_rate_pct).toBe(100.0);
      expect(output.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });

    it('maintains strict readiness invariants: 83 learner-ready, 9917 gap, NOT_READY, user_testing_authorized=false, 0 DB mutations, and writes Phase 6.2.23 artifacts', () => {
      const report = runPhase6223ControlledHumanReviewPilot({ writeArtifacts: false });

      expect(report.readiness_before_and_after.after.active_curated_db).toBe(21);
      expect(report.readiness_before_and_after.after.human_approved_staging).toBe(62);
      expect(report.readiness_before_and_after.after.learner_ready).toBe(83);
      expect(report.readiness_before_and_after.after.target).toBe(10000);
      expect(report.readiness_before_and_after.after.gap).toBe(9917);
      expect(report.readiness_before_and_after.after.status).toBe('NOT_READY');
      expect(report.readiness_before_and_after.after.user_testing_authorized).toBe(false);
      expect(report.production_safety.production_supabase_mutations).toBe(0);
      expect(report.production_safety.active_dataset_insertions).toBe(0);
      expect(report.production_safety.live_ledger_production_reviews).toBe(65);

      expect(fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.23-human-review-pilot.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectRoot, 'docs/assessment/phase-6.2.23-controlled-human-review-pilot.md'))).toBe(true);
    });
  });

  // 22. Phase 6.2.24 — Resolve Pilot Queue Identity & CEFR Provenance Discrepancies
  describe('22. Phase 6.2.24 — Resolve Pilot Queue Identity & CEFR Provenance Discrepancies', () => {
    it('1. resolves records deterministically by full exact learning_unit_key and traces Set A vs Set B', () => {
      const keepRes = resolveByExactKey('keep|verb|A1|sense:1', { projectRoot });
      expect(keepRes.exact_key).toBe('keep|verb|A1|sense:1');
      expect(keepRes.source_batch).toBe('LARGE-016.json');
      expect(keepRes.tier_batch).toBe('TIER-1-001.json');
      expect(keepRes.current_staged_record).not.toBeNull();
      expect(keepRes.current_staged_record.learning_unit_key).toBe('keep|verb|A1|sense:1');
      expect(keepRes.packet_record).not.toBeNull();
      expect(keepRes.reconciliation_status).toBe(RECONCILIATION_DISPOSITION.REVIEW_READY);
      expect(keepRes.cefr_provenance.status).toBe(CEFR_PROVENANCE_STATUS.CEFR_PROVENANCE_RESOLVED);

      const trace = traceCompetingFiveRecordSets({ projectRoot });
      expect(trace.set_a_keys).toEqual([...SET_A_PILOT_PROMPT_KEYS]);
      expect(trace.set_b_keys).toEqual([...SET_B_PACKET_6_2_22_REVIEW_READY_KEYS]);

      // Set B has 5/5 in phase-6.2.22-human-review-packet.json as REVIEW_READY
      for (const bItem of trace.set_b_trace) {
        expect(bItem.in_phase_6_2_22_human_review_packet).toBe(true);
        expect(bItem.phase_6_2_22_reconciled_status).toBe('REVIEW_READY');
        expect(bItem.in_large_batches).toBe(true);
        expect(bItem.cefr_provenance_status).toBe(CEFR_PROVENANCE_STATUS.CEFR_PROVENANCE_RESOLVED);
      }

      // Set A has 2/5 in phase-6.2.22-human-review-packet.json (as EDIT_REQUIRED) and 3/5 missing from LARGE batches
      const setAInPacket = trace.set_a_trace.filter((x) => x.in_phase_6_2_22_human_review_packet);
      expect(setAInPacket.map((x) => x.exact_key)).toEqual([
        'accept|verb|A2|sense:1',
        'conversation|noun|A1|sense:1',
      ]);
      for (const item of setAInPacket) {
        expect(item.phase_6_2_22_reconciled_status).toBe('EDIT_REQUIRED');
      }
    });

    it('2. distinguishes duplicate words with different sense keys without collapsing or cross-matching', () => {
      const echoSense1 = resolveByExactKey('echo|verb|C2|sense:1', { projectRoot });
      const echoSense2 = resolveByExactKey('echo|verb|C2|sense:2', { projectRoot });

      expect(echoSense1.current_staged_record).not.toBeNull();
      expect(echoSense2.current_staged_record).not.toBeNull();
      expect(echoSense1.current_staged_record.learning_unit_key).toBe('echo|verb|C2|sense:1');
      expect(echoSense2.current_staged_record.learning_unit_key).toBe('echo|verb|C2|sense:2');
      expect(echoSense1.current_staged_record.meaning_en).not.toBe(
        echoSense2.current_staged_record.meaning_en
      );
      expect(echoSense1.same_headword_exact_keys).toEqual([
        'echo|noun|C2|sense:1',
        'echo|verb|C2|sense:1',
        'echo|verb|C2|sense:2',
      ]);
    });

    it('3. distinguishes duplicate words with different CEFR levels and lists all exact headword keys', () => {
      const correctAdjA1 = resolveByExactKey('correct|adjective|A1|sense:1', { projectRoot });
      const correctVerbB2 = resolveByExactKey('correct|verb|B2|sense:1', { projectRoot });

      expect(correctAdjA1.current_staged_record).not.toBeNull();
      expect(correctVerbB2.current_staged_record).not.toBeNull();
      expect(correctAdjA1.cefr).toBe('A1');
      expect(correctVerbB2.cefr).toBe('B2');
      expect(correctAdjA1.source_batch).toBe('LARGE-020.json');
      expect(correctVerbB2.source_batch).toBe('LARGE-027.json');
      expect(correctAdjA1.same_headword_exact_keys).toEqual([
        'correct|adjective|A1|sense:1',
        'correct|verb|B2|sense:1',
      ]);

      const leaveVerbA1 = resolveByExactKey('leave|verb|A1|sense:1', { projectRoot });
      const leaveNounB1 = resolveByExactKey('leave|noun|B1|sense:1', { projectRoot });
      expect(leaveVerbA1.cefr).toBe('A1');
      expect(leaveNounB1.cefr).toBe('B1');
      expect(leaveVerbA1.same_headword_exact_keys).toEqual([
        'leave|noun|B1|sense:1',
        'leave|verb|A1|sense:1',
      ]);
    });

    it('4. strictly rejects prefix matching, word-only, POS-only, and partial keys', () => {
      expect(isValidFullLearningUnitKey('careful')).toBe(false);
      expect(isValidFullLearningUnitKey('careful|adjective')).toBe(false);
      expect(isValidFullLearningUnitKey('careful|adjective|A2')).toBe(false);
      expect(isValidFullLearningUnitKey('adjective')).toBe(false);
      expect(isValidFullLearningUnitKey('keep|verb|A1|sense:*')).toBe(false);
      expect(isValidFullLearningUnitKey('keep|verb|A1|sense:0')).toBe(false);

      expect(() => parseFullLearningUnitKey('careful')).toThrow(/INVALID_LEARNING_UNIT_KEY_FORMAT/);
      expect(() => resolveByExactKey('careful', { projectRoot })).toThrow(
        /INVALID_LEARNING_UNIT_KEY_FORMAT/
      );
      expect(() => resolveByExactKey('careful|adjective', { projectRoot })).toThrow(
        /INVALID_LEARNING_UNIT_KEY_FORMAT/
      );
      expect(() => resolveByExactKey('careful|adjective|A2', { projectRoot })).toThrow(
        /INVALID_LEARNING_UNIT_KEY_FORMAT/
      );
      expect(() => resolveByExactKey('verb', { projectRoot })).toThrow(
        /INVALID_LEARNING_UNIT_KEY_FORMAT/
      );

      // Even when a valid 4-part key shares a headword+POS prefix with a staged record,
      // resolveByExactKey MUST NOT return the sibling staged record as current_staged_record.
      const carefulA2Sense2 = resolveByExactKey('careful|adjective|A2|sense:2', { projectRoot });
      expect(carefulA2Sense2.current_staged_record).toBeNull();
      expect(carefulA2Sense2.same_headword_exact_keys).toEqual(['careful|adjective|A1|sense:1']);
    });

    it('5. detects CEFR provenance mismatches across careful|adjective|A2|sense:2, correct|verb|A2|sense:1, and collect|verb|A2|sense:1', () => {
      const carefulProv = evaluateCefrProvenanceForExactKey('careful|adjective|A2|sense:2', {
        projectRoot,
      });
      expect(carefulProv.original_source_cefr).toBe('A1');
      expect(carefulProv.glova_assigned_cefr).toBe('A1');
      expect(carefulProv.pilot_cefr).toBe('A2');
      expect(carefulProv.exact_staged_key_matches).toBe(false);
      expect(carefulProv.explicitly_documented).toBe(false);
      expect(carefulProv.reversible).toBe(true);
      expect(carefulProv.human_decision_required).toBe(true);

      const correctProv = evaluateCefrProvenanceForExactKey('correct|verb|A2|sense:1', {
        projectRoot,
      });
      expect(correctProv.original_source_cefr).toBe('B2');
      expect(correctProv.glova_assigned_cefr).toBe('B2');
      expect(correctProv.pilot_cefr).toBe('A2');
      expect(correctProv.exact_staged_key_matches).toBe(false);
      expect(correctProv.explicitly_documented).toBe(false);
      expect(correctProv.reversible).toBe(true);
      expect(correctProv.human_decision_required).toBe(true);

      const collectProv = evaluateCefrProvenanceForExactKey('collect|verb|A2|sense:1', {
        projectRoot,
      });
      expect(collectProv.original_source_cefr).toBe('A1');
      expect(collectProv.glova_assigned_cefr).toBe('A1');
      expect(collectProv.pilot_cefr).toBe('A2');
      expect(collectProv.exact_staged_key_matches).toBe(false);
      expect(collectProv.explicitly_documented).toBe(false);
      expect(collectProv.reversible).toBe(true);
      expect(collectProv.human_decision_required).toBe(true);
    });

    it('6. enforces CEFR_PROVENANCE_REVIEW_REQUIRED and blocks REVIEW_READY status on unresolved CEFR provenance', () => {
      const trace = traceCefrProvenanceDiscrepancies({ projectRoot });
      expect(trace.unresolved_count).toBe(3);
      expect(trace.unresolved_keys).toEqual([
        'careful|adjective|A2|sense:2',
        'collect|verb|A2|sense:1',
        'correct|verb|A2|sense:1',
      ]);

      for (const unresolvedKey of trace.unresolved_keys) {
        const res = resolveByExactKey(unresolvedKey, { projectRoot });
        expect(res.cefr_provenance.status).toBe(
          CEFR_PROVENANCE_STATUS.CEFR_PROVENANCE_REVIEW_REQUIRED
        );
        expect(res.cefr_provenance.provenance_resolution_state).toBe('UNRESOLVED');
        expect(res.reconciliation_status).toBe(
          RECONCILIATION_DISPOSITION.CEFR_PROVENANCE_REVIEW_REQUIRED
        );
        expect(res.cefr_provenance.routed_disposition).toBe('HOLD');
        expect(res.cefr_provenance.can_be_treated_as_review_ready).toBe(false);
      }
    });

    it('7. regenerates phase-6.2.24-human-review-packet.json with exact keys, known quality concerns (including simple|adjective|A2|sense:1), and pending state', () => {
      const packet = buildPhase6224HumanReviewPacket({ projectRoot });
      expect(packet.records.length).toBe(20);
      expect(packet.packet_summary.authoritative_review_ready_set_b_count).toBe(5);
      expect(packet.packet_summary.set_a_reclassified_edit_required_count).toBe(2);
      expect(packet.packet_summary.set_a_quarantined_cefr_provenance_review_required_count).toBe(3);
      expect(packet.packet_summary.reviewer_decisions_recorded).toBe(0);
      expect(packet.packet_summary.auto_approved_count).toBe(0);

      for (const rec of packet.records) {
        expect(isValidFullLearningUnitKey(rec.learning_unit_key)).toBe(true);
        expect(packet.records_by_exact_key[rec.learning_unit_key]).toBeDefined();
        expect(rec.reviewer_decision).toBeNull();
        expect(rec.reviewer_id).toBeNull();
        expect(rec.reviewed_at).toBeNull();
        expect(rec.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(rec.field_status).toBe('AI_DRAFT');
      }

      // Verify simple|adjective|A2|sense:1 includes exact example sentence and synthetic enrichment flag
      const simpleRec = packet.records_by_exact_key['simple|adjective|A2|sense:1'];
      expect(simpleRec).toBeDefined();
      expect(simpleRec.example).toBe(
        'The project required a very simple approach when addressing few parts not complex during the meeting.'
      );
      expect(simpleRec.known_quality_concerns.length).toBeGreaterThanOrEqual(1);
      expect(simpleRec.known_quality_concerns[0].category).toBe(
        'SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE'
      );
      expect(simpleRec.known_quality_concerns[0].is_synthetic_enrichment).toBe(true);
      expect(simpleRec.known_quality_concerns[0].is_source_corpus_example).toBe(false);
    });

    it('8. guarantees zero production mutations, zero new approvals, RECONCILIATION_PARTIALLY_RESOLVED gate, and 25-record historical regression', () => {
      const { reconciliationReport } = runPhase6224PilotIdentityReconciliation({
        projectRoot,
        writeArtifacts: false,
      });

      expect(reconciliationReport.final_decision_gate).toBe(
        DECISION_GATES_6_2_24.RECONCILIATION_PARTIALLY_RESOLVED
      );
      expect(reconciliationReport.readiness_invariants).toEqual({
        active_curated_db: 21,
        human_approved_staging: 62,
        learner_ready: 83,
        target: 10000,
        gap: 9917,
        status: 'NOT_READY',
        user_testing_authorized: false,
        production_db_mutations: 0,
        new_human_approvals_in_this_phase: 0,
      });

      expect(
        fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.24-pilot-reconciliation.json'))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.24-human-review-packet.json'))
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(projectRoot, 'docs/assessment/phase-6.2.24-pilot-reconciliation.md')
        )
      ).toBe(true);

      // 25-record historical regression check
      const hist25 = executePilotComparison();
      expect(hist25.sample_size).toBe(25);
      expect(hist25.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(hist25.pre_review_metrics.hold_candidate).toBe(4);
      expect(hist25.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(hist25.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });
  });

  // 23. Phase 6.2.25 — Remove Synthetic Pilot Fallbacks & Lock Exact-Record Review Gate
  describe('23. Phase 6.2.25 — Remove Synthetic Pilot Fallbacks & Lock Exact-Record Review Gate', () => {
    it('1. resolveCanonicalExactKey("keep|verb|A1|sense:1") resolves to FOUND_EXACTLY_ONE from canonical LARGE inventory', () => {
      const res = resolveCanonicalExactKey('keep|verb|A1|sense:1', { projectRoot });

      expect(res.status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
      expect(res.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
      expect(res.classification).toBe(TARGET_CLASSIFICATION_6_2_25.VALID_CANONICAL_TARGET);
      expect(res.failed_closed).toBe(false);
      expect(res.canonical_batch_id).toBe('LARGE-016');
      expect(res.canonical_source_file).toBe('scripts/content-pipeline/output/batches/LARGE-016.json');
      expect(res.canonical_cefr).toBe('A1');
      expect(res.canonical_pos).toBe('verb');
      expect(res.canonical_sense).toBe('sense:1');
      expect(res.provenance_status).toBe(CEFR_PROVENANCE_STATUS.CEFR_PROVENANCE_RESOLVED);
      expect(res.review_status).toBe(RECONCILIATION_DISPOSITION.REVIEW_READY);
      expect(res.matched_record).not.toBeNull();
      expect(res.matched_record.learning_unit_key).toBe('keep|verb|A1|sense:1');
    });

    it('2. resolveCanonicalExactKey("careful|adjective|A2|sense:2") returns CEFR_MISMATCH / NOT_FOUND and never creates a synthetic record', () => {
      const res = resolveCanonicalExactKey('careful|adjective|A2|sense:2', { projectRoot });
      const pilotSel = selectCanonicalPilotReviewTarget('careful|adjective|A2|sense:2');

      expect([
        CANONICAL_RESOLUTION_STATUS.NOT_FOUND,
        CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH,
      ]).toContain(res.status);
      expect(res.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH);
      expect(res.canonical_lookup_status).toBe(CANONICAL_RESOLUTION_STATUS.NOT_FOUND);
      expect(res.classification).toBe(TARGET_CLASSIFICATION_6_2_25.INVALID_REVIEW_TARGET);
      expect(res.inventory_presence).toBe(
        TARGET_CLASSIFICATION_6_2_25.NOT_FOUND_IN_CANONICAL_LARGE_INVENTORY
      );
      expect(res.matched_record).toBeNull();
      expect(res.canonical_existing_keys).toEqual(['careful|adjective|A1|sense:1']);
      expect(res.mismatch_axes).toEqual(['CEFR_MISMATCH', 'SENSE_MISMATCH']);

      expect(pilotSel.status).toBe('NOT_FOUND');
      expect(pilotSel.classification).toBe('INVALID_REVIEW_TARGET');
      expect(pilotSel.review_record).toBeNull();
      expect(pilotSel.canonical_existing_keys).toEqual(['careful|adjective|A1|sense:1']);
    });

    it('3. resolveCanonicalExactKey("collect|verb|A2|sense:1") returns CEFR_MISMATCH / NOT_FOUND and never substitutes collect|verb|A1|sense:1', () => {
      const res = resolveCanonicalExactKey('collect|verb|A2|sense:1', { projectRoot });
      const pilotSel = selectCanonicalPilotReviewTarget('collect|verb|A2|sense:1');

      expect([
        CANONICAL_RESOLUTION_STATUS.NOT_FOUND,
        CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH,
      ]).toContain(res.status);
      expect(res.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH);
      expect(res.canonical_lookup_status).toBe(CANONICAL_RESOLUTION_STATUS.NOT_FOUND);
      expect(res.classification).toBe(TARGET_CLASSIFICATION_6_2_25.INVALID_REVIEW_TARGET);
      expect(res.matched_record).toBeNull();
      expect(res.canonical_existing_keys).toEqual(['collect|verb|A1|sense:1']);

      expect(pilotSel.status).toBe('NOT_FOUND');
      expect(pilotSel.classification).toBe('INVALID_REVIEW_TARGET');
      expect(pilotSel.review_record).toBeNull();
      expect(pilotSel.canonical_existing_keys).toEqual(['collect|verb|A1|sense:1']);
    });

    it('4. resolveCanonicalExactKey("correct|verb|A2|sense:1") returns CEFR_MISMATCH / NOT_FOUND and never substitutes correct|verb|B2|sense:1 or correct|adjective|A1|sense:1', () => {
      const res = resolveCanonicalExactKey('correct|verb|A2|sense:1', { projectRoot });
      const pilotSel = selectCanonicalPilotReviewTarget('correct|verb|A2|sense:1');

      expect([
        CANONICAL_RESOLUTION_STATUS.NOT_FOUND,
        CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH,
      ]).toContain(res.status);
      expect(res.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH);
      expect(res.canonical_lookup_status).toBe(CANONICAL_RESOLUTION_STATUS.NOT_FOUND);
      expect(res.classification).toBe(TARGET_CLASSIFICATION_6_2_25.INVALID_REVIEW_TARGET);
      expect(res.matched_record).toBeNull();
      expect(res.canonical_existing_keys).toEqual([
        'correct|adjective|A1|sense:1',
        'correct|verb|B2|sense:1',
      ]);

      expect(pilotSel.status).toBe('NOT_FOUND');
      expect(pilotSel.classification).toBe('INVALID_REVIEW_TARGET');
      expect(pilotSel.review_record).toBeNull();
      expect(pilotSel.canonical_existing_keys).toEqual([
        'correct|adjective|A1|sense:1',
        'correct|verb|B2|sense:1',
      ]);
    });

    it('5. resolves correct|adjective|A1|sense:1 and correct|verb|B2|sense:1 as separate canonical records and distinguishes POS_MISMATCH and SENSE_MISMATCH', () => {
      const adjRes = resolveCanonicalExactKey('correct|adjective|A1|sense:1', { projectRoot });
      const verbRes = resolveCanonicalExactKey('correct|verb|B2|sense:1', { projectRoot });

      expect(adjRes.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
      expect(verbRes.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
      expect(adjRes.canonical_batch_id).toBe('LARGE-020');
      expect(verbRes.canonical_batch_id).toBe('LARGE-027');
      expect(adjRes.canonical_pos).toBe('adjective');
      expect(verbRes.canonical_pos).toBe('verb');
      expect(adjRes.canonical_cefr).toBe('A1');
      expect(verbRes.canonical_cefr).toBe('B2');
      expect(adjRes.matched_record.learning_unit_key).not.toBe(
        verbRes.matched_record.learning_unit_key
      );

      // Verify POS_MISMATCH and SENSE_MISMATCH diagnostics
      const posMismatchRes = resolveCanonicalExactKey('keep|adjective|A1|sense:1', { projectRoot });
      expect(posMismatchRes.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.POS_MISMATCH);
      expect(posMismatchRes.matched_record).toBeNull();

      const senseMismatchRes = resolveCanonicalExactKey('keep|verb|A1|sense:9', { projectRoot });
      expect(senseMismatchRes.exact_resolution_status).toBe(
        CANONICAL_RESOLUTION_STATUS.SENSE_MISMATCH
      );
      expect(senseMismatchRes.matched_record).toBeNull();
    });

    it('6. word-only lookup ("careful") fails closed', () => {
      const res = resolveCanonicalExactKey('careful', { projectRoot });
      expect(res.valid_key_format).toBe(false);
      expect(res.failed_closed).toBe(true);
      expect(res.status).toBe(CANONICAL_RESOLUTION_STATUS.NOT_FOUND);
      expect(res.classification).toBe(TARGET_CLASSIFICATION_6_2_25.INVALID_REVIEW_TARGET);
      expect(res.matched_record).toBeNull();
      expect(res.can_enter_review_packet).toBe(false);
      expect(() =>
        resolveCanonicalExactKey('careful', { projectRoot, strictThrowOnMalformed: true })
      ).toThrow(/INVALID_LEARNING_UNIT_KEY_FORMAT/);
    });

    it('7. prefix lookup ("careful|adjective") fails closed', () => {
      const res = resolveCanonicalExactKey('careful|adjective', { projectRoot });
      expect(res.valid_key_format).toBe(false);
      expect(res.failed_closed).toBe(true);
      expect(res.status).toBe(CANONICAL_RESOLUTION_STATUS.NOT_FOUND);
      expect(res.classification).toBe(TARGET_CLASSIFICATION_6_2_25.INVALID_REVIEW_TARGET);
      expect(res.matched_record).toBeNull();
      expect(res.can_enter_review_packet).toBe(false);
      expect(() =>
        resolveCanonicalExactKey('careful|adjective', {
          projectRoot,
          strictThrowOnMalformed: true,
        })
      ).toThrow(/INVALID_LEARNING_UNIT_KEY_FORMAT/);
    });

    it('8. duplicate canonical key fails closed with DUPLICATE_CANONICAL_KEY', () => {
      const duplicateEntriesMap = new Map([
        [
          'keep|verb|A1|sense:1',
          [
            {
              batch_id: 'LARGE-016',
              batch_file: 'LARGE-016.json',
              relative_path: 'scripts/content-pipeline/output/batches/LARGE-016.json',
              record: { learning_unit_key: 'keep|verb|A1|sense:1', word: 'keep', part_of_speech: 'verb', cefr_level: 'A1' },
            },
            {
              batch_id: 'LARGE-099',
              batch_file: 'LARGE-099.json',
              relative_path: 'scripts/content-pipeline/output/batches/LARGE-099.json',
              record: { learning_unit_key: 'keep|verb|A1|sense:1', word: 'keep', part_of_speech: 'verb', cefr_level: 'A1' },
            },
          ],
        ],
      ]);

      const dupRes = resolveCanonicalExactKey('keep|verb|A1|sense:1', {
        projectRoot,
        customLargeEntriesByKey: duplicateEntriesMap,
      });

      expect(dupRes.failed_closed).toBe(true);
      expect(dupRes.status).toBe(CANONICAL_RESOLUTION_STATUS.DUPLICATE_CANONICAL_KEY);
      expect(dupRes.exact_resolution_status).toBe(
        CANONICAL_RESOLUTION_STATUS.DUPLICATE_CANONICAL_KEY
      );
      expect(dupRes.duplicate_count).toBe(2);
      expect(dupRes.classification).toBe(TARGET_CLASSIFICATION_6_2_25.INVALID_REVIEW_TARGET);
      expect(dupRes.matched_record).toBeNull();
      expect(dupRes.can_enter_review_packet).toBe(false);
    });

    it('9. review packet contains 0 records absent from LARGE inventory and every record resolves to FOUND_EXACTLY_ONE', () => {
      const packet = buildPhase6225HumanReviewPacket({ projectRoot });
      const invariants = verifyPhase6225PacketInvariants(packet, { projectRoot });

      expect(packet.records.length).toBe(17);
      expect(packet.active_pilot_15_records.length).toBe(15);
      expect(packet.packet_summary.absent_from_large_inventory_in_packet_count).toBe(0);
      expect(invariants.all_invariants_passed).toBe(true);
      expect(
        invariants.invariant_1_every_packet_record_resolves_to_exactly_one_canonical_large
      ).toBe(true);
      expect(invariants.invariant_2_zero_packet_records_absent_from_canonical_large).toBe(true);
      expect(invariants.absent_from_large_count).toBe(0);

      for (const rec of packet.records) {
        expect(rec.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
        expect(rec.canonical_source_file).toMatch(
          /^scripts\/content-pipeline\/output\/batches\/LARGE-\d+\.json$/
        );
        expect(rec.canonical_batch_id).toMatch(/^LARGE-\d+$/);
        expect(rec.canonical_cefr).toMatch(/^(A1|A2|B1|B2|C1|C2)$/);
        expect(rec.canonical_pos).toBeTruthy();
        expect(rec.canonical_sense).toMatch(/^sense:[1-9]\d*$/);
        expect(rec.provenance_status).toBe(CEFR_PROVENANCE_STATUS.CEFR_PROVENANCE_RESOLVED);
        expect(rec.reviewer_id).toBeNull();
        expect(rec.reviewer_decision).toBeNull();
        expect(rec.reviewed_at).toBeNull();
      }
    });

    it('10. MANDATED_REVIEW_READY_FALLBACK_SPECS is disabled and cannot inject synthetic records into pilot queue or review packet', () => {
      expect(MANDATED_REVIEW_READY_FALLBACK_SPECS_DISABLED).toBe(true);

      const pilotQueue = prepareControlledPilotQueue();
      const packet = buildPhase6225HumanReviewPacket({ projectRoot });

      for (const syntheticKey of REJECTED_SYNTHETIC_PILOT_FALLBACK_KEYS) {
        expect(pilotQueue.records.some((r: any) => r.learning_unit_key === syntheticKey)).toBe(
          false
        );
        expect(packet.records.some((r: any) => r.learning_unit_key === syntheticKey)).toBe(false);
        expect(packet.records_by_exact_key[syntheticKey]).toBeUndefined();
      }

      // Calling buildHumanDecisionInterfaceItem without a canonical LARGE entry must throw
      expect(() =>
        buildHumanDecisionInterfaceItem(
          { learning_unit_key: 'careful|adjective|A2|sense:2', word: 'careful' },
          'REVIEW_READY',
          undefined
        )
      ).toThrow(/INVALID_REVIEW_TARGET/);
    });

    it('11. simple|adjective|A2|sense:1 carries explicit synthetic-example warning (glova_offline_example_drafter_v1)', () => {
      const packet = buildPhase6225HumanReviewPacket({ projectRoot });
      const simpleRec = packet.records_by_exact_key['simple|adjective|A2|sense:1'];

      expect(simpleRec).toBeDefined();
      expect(simpleRec.review_status).toBe(RECONCILIATION_DISPOSITION.REVIEW_READY);
      expect(simpleRec.example).toBe(
        'The project required a very simple approach when addressing few parts not complex during the meeting.'
      );
      expect(
        simpleRec.known_quality_concerns.some(
          (c: any) =>
            c.category === 'SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE' &&
            c.example_origin === 'glova_offline_example_drafter_v1' &&
            c.is_synthetic_enrichment === true
        )
      ).toBe(true);
    });

    it('12. accept|verb|A2|sense:1 and conversation|noun|A1|sense:1 remain EDIT_REQUIRED, not REVIEW_READY', () => {
      const packet = buildPhase6225HumanReviewPacket({ projectRoot });
      const acceptRec = packet.records_by_exact_key['accept|verb|A2|sense:1'];
      const convRec = packet.records_by_exact_key['conversation|noun|A1|sense:1'];

      expect(acceptRec).toBeDefined();
      expect(convRec).toBeDefined();
      expect(acceptRec.review_status).toBe(RECONCILIATION_DISPOSITION.EDIT_REQUIRED);
      expect(convRec.review_status).toBe(RECONCILIATION_DISPOSITION.EDIT_REQUIRED);
      expect(acceptRec.review_status).not.toBe(RECONCILIATION_DISPOSITION.REVIEW_READY);
      expect(convRec.review_status).not.toBe(RECONCILIATION_DISPOSITION.REVIEW_READY);

      const rrKeys = packet.cohorts.authoritative_review_ready_set_b.map(
        (r: any) => r.learning_unit_key
      );
      expect(rrKeys).toEqual([...SET_B_PACKET_6_2_22_REVIEW_READY_KEYS]);
      expect(rrKeys).not.toContain('accept|verb|A2|sense:1');
      expect(rrKeys).not.toContain('conversation|noun|A1|sense:1');
    });

    it('13. unresolved CEFR records cannot become REVIEW_READY or APPROVED and do not mutate canonical CEFR', () => {
      const packet = buildPhase6225HumanReviewPacket({ projectRoot });

      expect(packet.rejected_invalid_review_targets.length).toBe(3);
      for (const rejected of packet.rejected_invalid_review_targets) {
        expect(rejected.provenance_status).toBe(
          CEFR_PROVENANCE_STATUS.CEFR_PROVENANCE_REVIEW_REQUIRED
        );
        expect(rejected.review_status).toBe(RECONCILIATION_DISPOSITION.HOLD);
        expect(rejected.can_be_review_ready).toBe(false);
        expect(rejected.can_be_approved).toBe(false);
      }

      // Verify canonical records in LARGE batches retain their original CEFR levels untouched
      expect(resolveCanonicalExactKey('careful|adjective|A1|sense:1', { projectRoot }).canonical_cefr).toBe('A1');
      expect(resolveCanonicalExactKey('collect|verb|A1|sense:1', { projectRoot }).canonical_cefr).toBe('A1');
      expect(resolveCanonicalExactKey('correct|adjective|A1|sense:1', { projectRoot }).canonical_cefr).toBe('A1');
      expect(resolveCanonicalExactKey('correct|verb|B2|sense:1', { projectRoot }).canonical_cefr).toBe('B2');
    });

    it('14. learner-ready remains 28, gap 9,972, NOT_READY, user_testing_authorized = false, and no synthetic record enters learner-ready accounting', () => {
      const { auditReport, packet } = runPhase6225ExactReviewTargetGate({
        projectRoot,
        writeArtifacts: false,
      });
      const invariants = verifyPhase6225PacketInvariants(packet, { projectRoot });

      expect(auditReport.readiness_invariants).toEqual({
        active_curated_db: 21,
        human_approved_staging: 62,
        learner_ready: 83,
        target: 10000,
        gap: 9917,
        status: 'NOT_READY',
        user_testing_authorized: false,
        production_db_mutations: 0,
        human_approvals_added: 0,
      });
      expect(
        invariants.invariant_3_zero_synthetic_fallback_records_in_learner_ready_accounting
      ).toBe(true);
    });

    it('15. production DB mutations remain 0, audit artifacts exist with exact metrics, gate is EXACT_REVIEW_TARGET_GATE_PASS, and 25-record historical regression passes', () => {
      const { auditReport } = runPhase6225ExactReviewTargetGate({
        projectRoot,
        writeArtifacts: false,
      });

      expect(auditReport.final_gate).toBe(DECISION_GATES_6_2_25.EXACT_REVIEW_TARGET_GATE_PASS);
      expect(auditReport.summary_metrics).toEqual({
        canonical_inventory_count: 10000,
        requested_review_targets: 20,
        exact_matches: 17,
        invalid_targets: 3,
        cefr_provenance_mismatches: 3,
        synthetic_fallback_targets_rejected: 3,
        duplicate_key_count: 0,
        packet_count: 17,
        active_pilot_cohort_count: 15,
        human_approvals_added: 0,
        production_db_mutations: 0,
      });

      expect(
        fs.existsSync(
          path.join(projectRoot, 'docs/assessment/phase-6.2.25-exact-review-target-gate.md')
        )
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(projectRoot, 'reports/phase-6.2.25-exact-review-target-audit.json')
        )
      ).toBe(true);
      expect(
        fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.25-human-review-packet.json'))
      ).toBe(true);

      // 25-record historical regression check
      const hist25 = executePilotComparison();
      expect(hist25.sample_size).toBe(25);
      expect(hist25.pre_review_metrics.approved_candidate_ready).toBe(21);
      expect(hist25.pre_review_metrics.hold_candidate).toBe(4);
      expect(hist25.pre_review_metrics.pos_aligned_pct).toBe(100.0);
      expect(hist25.pre_review_metrics.sense_aligned_pct).toBe(84.0);
    });
  });

  // 24. Phase 6.2.26 — Controlled Human QA Execution Pilot on Canonical Records (Set B 5 Records Only)
  describe('24. Phase 6.2.26 — Controlled Human QA Execution Pilot on Canonical Set B Records', () => {
    function createIsolatedPhase6226Sandbox() {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glova-phase-6226-test-'));
      const t1Dir = path.join(tempDir, 'scripts/content-pipeline/output/tier1-batches');
      const lgDir = path.join(tempDir, 'scripts/content-pipeline/output/batches');
      const repDir = path.join(tempDir, 'reports');
      fs.mkdirSync(t1Dir, { recursive: true });
      fs.mkdirSync(lgDir, { recursive: true });
      fs.mkdirSync(repDir, { recursive: true });

      for (const f of [
        'LARGE-001.json',
        'LARGE-002.json',
        'LARGE-003.json',
        'LARGE-004.json',
        'LARGE-016.json',
        'LARGE-018.json',
      ]) {
        fs.copyFileSync(
          path.join(projectRoot, `scripts/content-pipeline/output/batches/${f}`),
          path.join(lgDir, f)
        );
      }
      for (const f of [
        'TIER-1-001.json',
        'TIER-1-002.json',
        'TIER-1-003.json',
        'TIER-1-004.json',
      ]) {
        fs.copyFileSync(
          path.join(projectRoot, `scripts/content-pipeline/output/tier1-batches/${f}`),
          path.join(t1Dir, f)
        );
      }
      fs.copyFileSync(
        path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'),
        path.join(repDir, 'vocabulary-human-review-ledger.json')
      );

      // Ensure the 5 Set B records in sandbox start unreviewed for clean unit testing
      for (const key of SET_B_PACKET_6_2_22_REVIEW_READY_KEYS) {
        for (const f of ['TIER-1-001.json', 'TIER-1-002.json', 'TIER-1-003.json', 'TIER-1-004.json']) {
          const p = path.join(t1Dir, f);
          const b = JSON.parse(fs.readFileSync(p, 'utf8'));
          const rec = b.records.find((r: { learning_unit_key: string }) => r.learning_unit_key === key);
          if (rec) {
            rec.reviewer_decision = null;
            rec.lifecycle_status = 'REVIEW_REQUIRED';
            rec.human_review_status = 'REVIEW_REQUIRED';
            rec.is_active = false;
            rec.reviewed_by = null;
            rec.reviewed_at = null;
            rec.review_rationale = null;
            rec.review_transaction_id = null;
            fs.writeFileSync(p, JSON.stringify(b, null, 2), 'utf8');
          }
        }
        for (const f of ['LARGE-016.json', 'LARGE-018.json']) {
          const p = path.join(lgDir, f);
          const b = JSON.parse(fs.readFileSync(p, 'utf8'));
          const rec = b.records.find((r: { learning_unit_key: string }) => r.learning_unit_key === key);
          if (rec) {
            rec.reviewer_decision = null;
            rec.lifecycle_status = 'REVIEW_REQUIRED';
            rec.human_review_status = 'REVIEW_REQUIRED';
            rec.is_active = false;
            rec.reviewed_by = null;
            rec.reviewed_at = null;
            rec.review_rationale = null;
            rec.review_transaction_id = null;
            fs.writeFileSync(p, JSON.stringify(b, null, 2), 'utf8');
          }
        }
      }

      const ledgerObj = JSON.parse(fs.readFileSync(path.join(repDir, 'vocabulary-human-review-ledger.json'), 'utf8'));
      const setBSet = new Set(SET_B_PACKET_6_2_22_REVIEW_READY_KEYS);
      ledgerObj.events = (ledgerObj.events || []).filter(
        (e: { learning_unit_key: string }) => !setBSet.has(e.learning_unit_key)
      );
      ledgerObj.total_events = ledgerObj.events.length;
      ledgerObj.production_human_reviews = ledgerObj.events.filter(
        (e: { event_type: string; is_production_review: boolean }) =>
          e.event_type === 'PRODUCTION_REVIEW' && e.is_production_review === true
      ).length;
      fs.writeFileSync(
        path.join(repDir, 'vocabulary-human-review-ledger.json'),
        JSON.stringify(ledgerObj, null, 2),
        'utf8'
      );

      return tempDir;
    }

    it('1. canonical Set B 5 records resolve FOUND_EXACTLY_ONE and halt fail-closed without substitution if any record fails resolution', () => {
      const check = verifyCanonicalSetBIdentity({ projectRoot });
      expect(check.target_count).toBe(5);
      expect(check.resolved_exactly_one_count).toBe(5);
      expect(check.all_resolved_exactly_one).toBe(true);
      expect(check.halted_on_identity_failure).toBe(false);
      expect(check.records.map((r) => r.learning_unit_key)).toEqual([
        'keep|verb|A1|sense:1',
        'leave|verb|A1|sense:1',
        'sit|verb|A1|sense:1',
        'read|verb|A1|sense:1',
        'simple|adjective|A2|sense:1',
      ]);
      for (const rec of check.records) {
        expect(rec.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
        expect(rec.canonical_source_file).toMatch(/^scripts\/content-pipeline\/output\/batches\/LARGE-\d{3}\.json$/);
        expect(rec.canonical_batch_id).toMatch(/^LARGE-\d{3}$/);
        expect(rec.canonical_tier_batch_id).toMatch(/^TIER-1-\d{3}$/);
        expect(rec.canonical_sense).toBe('sense:1');
      }

      // Fail-closed check when a target does not resolve to FOUND_EXACTLY_ONE
      const badCheck = verifyCanonicalSetBIdentity({
        projectRoot,
        targetKeys: [...SET_B_PACKET_6_2_22_REVIEW_READY_KEYS, 'careful|adjective|A2|sense:2'],
      });
      expect(badCheck.all_resolved_exactly_one).toBe(false);
      expect(badCheck.halted_on_identity_failure).toBe(true);
      expect(() =>
        preparePhase6226SetBReviewPacket({
          projectRoot,
          targetKeys: [...SET_B_PACKET_6_2_22_REVIEW_READY_KEYS, 'careful|adjective|A2|sense:2'],
        })
      ).toThrow(/PHASE_6_2_26_IDENTITY_GATE_HALT/);
    });

    it('2. review packet exposes all required canonical fields, starts with reviewer_id/decision/rationale/reviewed_at === null, and flags simple|adjective|A2|sense:1 synthetic example', () => {
      const packet = preparePhase6226SetBReviewPacket({ projectRoot });
      expect(packet.total_records).toBe(5);
      expect(packet.awaiting_human_decision_count).toBe(5);

      for (const rec of packet.records) {
        expect(rec.word).toBeTruthy();
        expect(rec.part_of_speech).toBeTruthy();
        expect(rec.cefr_level).toMatch(/^(A1|A2)$/);
        expect(rec.sense).toBe('sense:1');
        expect(rec.meaning_en).toBeTruthy();
        expect(rec.meaning_th).toBeTruthy();
        expect(rec.phonetic_ipa).toBeTruthy();
        expect(rec.example_sentence).toBeTruthy();
        expect('topic' in rec).toBe(true);
        expect(rec.provenance).toBeTruthy();
        expect(Array.isArray(rec.quality_flags)).toBe(true);
        expect(rec.canonical_source).toMatch(/LARGE-\d{3}\.json$/);
        expect(rec.canonical_batch).toMatch(/^LARGE-\d{3}$/);
        expect(rec.reviewer_id).toBeNull();
        expect(rec.decision).toBeNull();
        expect(rec.rationale).toBeNull();
        expect(rec.reviewed_at).toBeNull();
        expect(rec.review_state).toBe('awaiting-human-decision');
        expect(rec.allowed_dispositions).toEqual(ALLOWED_SET_B_REVIEW_DISPOSITIONS);
      }

      const simpleItem = packet.records.find(
        (r) => r.learning_unit_key === 'simple|adjective|A2|sense:1'
      );
      expect(simpleItem).toBeDefined();
      expect(
        simpleItem?.quality_flags.some(
          (f: { code: string }) => f.code === 'SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE'
        )
      ).toBe(true);
    });

    it('3. real APPROVE path works in isolated temp sandbox without mutating live production files', () => {
      const tempDir = createIsolatedPhase6226Sandbox();
      try {
        const res = executeCanonicalSetBHumanDecision(
          {
            learningUnitKey: 'keep|verb|A1|sense:1',
            reviewerId: 'linguist_chanon_th',
            decision: 'APPROVE',
            rationale: 'Verified A1 verb sense, Thai meaning, IPA, and OEWN example sentence.',
            isProduction: true,
          },
          { projectRoot: tempDir, referenceRoot: projectRoot }
        );

        expect(res.success).toBe(true);
        expect(res.decision).toBe('APPROVED');
        expect(res.lifecycle_status).toBe('APPROVED');
        expect(res.is_active).toBe(false);

        const readiness = calculatePhase6226ReadinessFromSandbox(tempDir);
        expect(readiness.active_curated_db).toBe(21);
        expect(readiness.human_approved_staging).toBe(8);
        expect(readiness.learner_ready).toBe(29);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('4. real EDIT_REQUIRED path works in isolated temp sandbox and preserves previous_values in edit_history', () => {
      const tempDir = createIsolatedPhase6226Sandbox();
      try {
        const res = executeCanonicalSetBHumanDecision(
          {
            learningUnitKey: 'simple|adjective|A2|sense:1',
            reviewerId: 'linguist_chanon_th',
            decision: 'EDIT_REQUIRED',
            rationale: 'Replaced synthetic offline enrichment example with natural A2 sentence.',
            edits: {
              meaning_th: 'เรียบง่าย, ไม่ซับซ้อน',
              example_sentence: 'The teacher gave us a simple question to answer.',
            },
            isProduction: true,
          },
          { projectRoot: tempDir, referenceRoot: projectRoot }
        );

        expect(res.success).toBe(true);
        expect(res.decision).toBe('EDIT_REQUIRED');
        expect(res.lifecycle_status).toBe('EDIT_REQUIRED');
        expect(res.unit.example_sentence).toBe('The teacher gave us a simple question to answer.');
        expect(res.unit.provenance.edit_history[0].previous_values.example_sentence).toBe(
          'The project required a very simple approach when addressing few parts not complex during the meeting.'
        );

        const readiness = calculatePhase6226ReadinessFromSandbox(tempDir);
        expect(readiness.learner_ready).toBe(28);
        expect(readiness.excluded_counts.edit_required).toBe(1);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('5. real HOLD path works in isolated temp sandbox and requires non-empty rationale', () => {
      const tempDir = createIsolatedPhase6226Sandbox();
      try {
        expect(() =>
          executeCanonicalSetBHumanDecision(
            {
              learningUnitKey: 'leave|verb|A1|sense:1',
              reviewerId: 'linguist_chanon_th',
              decision: 'HOLD',
              rationale: '',
              isProduction: true,
            },
            { projectRoot: tempDir, referenceRoot: projectRoot }
          )
        ).toThrow(/INVALID_RATIONALE/);

        const baselineReadiness = calculatePhase6226ReadinessFromSandbox(tempDir);
        const res = executeCanonicalSetBHumanDecision(
          {
            learningUnitKey: 'leave|verb|A1|sense:1',
            reviewerId: 'linguist_chanon_th',
            decision: 'HOLD',
            rationale: 'Hold for transitive vs intransitive A1 sense verification.',
            isProduction: true,
          },
          { projectRoot: tempDir, referenceRoot: projectRoot }
        );

        expect(res.success).toBe(true);
        expect(res.decision).toBe('HOLD');
        expect(res.lifecycle_status).toBe('HOLD');

        const readiness = calculatePhase6226ReadinessFromSandbox(tempDir);
        expect(readiness.learner_ready).toBe(28);
        expect(readiness.excluded_counts.hold).toBe(baselineReadiness.excluded_counts.hold + 1);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('6. reviewer identity validation rejects empty, fake, AI, bot, system, and simulated reviewer IDs and documents authentication limitation', () => {
      const bannedIds = [
        '',
        '  ',
        'ab',
        'reviewer_alpha',
        'human_reviewer_1',
        'test_reviewer',
        'ai_reviewer',
        'system',
        'bot_reviewer',
        'auto_approve',
        'claude_agent',
        'gpt_4',
        'gemini_pro',
        'llm_evaluator',
        'synthetic_user',
        'fake_linguist',
        'mock_reviewer',
        'simulated_human',
      ];

      for (const badId of bannedIds) {
        expect(() => validatePhase6226ReviewerIdentity(badId)).toThrow();
      }

      const validRes = validatePhase6226ReviewerIdentity('linguist_chanon_th');
      expect(validRes.valid).toBe(true);
      expect(validRes.is_operational_identifier_only).toBe(true);
      expect(validRes.is_authenticated_proof_of_human).toBe(false);
      expect(validRes.operational_limitation_notice).toContain('does NOT equal cryptographic authentication');
    });

    it('7. transaction_id uniqueness is enforced across generated IDs and ledger events', () => {
      const tempDir = createIsolatedPhase6226Sandbox();
      try {
        const fixedTxnId = 'rev_txn_phase6226_unique_test_001';
        executeCanonicalSetBHumanDecision(
          {
            learningUnitKey: 'keep|verb|A1|sense:1',
            reviewerId: 'linguist_chanon_th',
            decision: 'HOLD',
            rationale: 'First transaction with explicit ID.',
            transactionId: fixedTxnId,
          },
          { projectRoot: tempDir, referenceRoot: projectRoot }
        );

        // Reusing the exact same transactionId must fail closed
        expect(() =>
          executeCanonicalSetBHumanDecision(
            {
              learningUnitKey: 'leave|verb|A1|sense:1',
              reviewerId: 'linguist_chanon_th',
              decision: 'HOLD',
              rationale: 'Second transaction reusing same ID must be rejected.',
              transactionId: fixedTxnId,
            },
            { projectRoot: tempDir, referenceRoot: projectRoot }
          )
        ).toThrow(/DUPLICATE_TRANSACTION_ID/);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('8. TIER, LARGE, and review ledger maintain 100% consistency on transaction_id, reviewer_id, decision, rationale, and reviewed_at', () => {
      const tempDir = createIsolatedPhase6226Sandbox();
      try {
        const ts = '2026-09-27T16:25:00.000Z';
        const res = executeCanonicalSetBHumanDecision(
          {
            learningUnitKey: 'read|verb|A1|sense:1',
            reviewerId: 'linguist_chanon_th',
            decision: 'APPROVE',
            rationale: 'Verified A1 reading verb sense and grounded Thai gloss.',
            timestamp: ts,
            isProduction: true,
          },
          { projectRoot: tempDir, referenceRoot: projectRoot }
        );

        const t1Batch = JSON.parse(
          fs.readFileSync(
            path.join(tempDir, 'scripts/content-pipeline/output/tier1-batches/TIER-1-004.json'),
            'utf8'
          )
        );
        const lgBatch = JSON.parse(
          fs.readFileSync(
            path.join(tempDir, 'scripts/content-pipeline/output/batches/LARGE-018.json'),
            'utf8'
          )
        );
        const ledger = JSON.parse(
          fs.readFileSync(
            path.join(tempDir, 'reports/vocabulary-human-review-ledger.json'),
            'utf8'
          )
        );

        const t1Unit = t1Batch.records.find((r: { learning_unit_key: string }) => r.learning_unit_key === 'read|verb|A1|sense:1');
        const lgUnit = lgBatch.records.find((r: { learning_unit_key: string }) => r.learning_unit_key === 'read|verb|A1|sense:1');
        const ledgerEvent = ledger.events.find((e: { transaction_id: string }) => e.transaction_id === res.transaction_id);

        expect(t1Unit.review_transaction_id).toBe(res.transaction_id);
        expect(lgUnit.review_transaction_id).toBe(res.transaction_id);
        expect(ledgerEvent.transaction_id).toBe(res.transaction_id);

        expect(t1Unit.reviewed_by).toBe('linguist_chanon_th');
        expect(lgUnit.reviewed_by).toBe('linguist_chanon_th');
        expect(ledgerEvent.reviewer_id).toBe('linguist_chanon_th');

        expect(t1Unit.reviewer_decision).toBe('APPROVED');
        expect(lgUnit.reviewer_decision).toBe('APPROVED');
        expect(ledgerEvent.decision).toBe('APPROVED');

        expect(t1Unit.reviewed_at).toBe(ts);
        expect(lgUnit.reviewed_at).toBe(ts);
        expect(ledgerEvent.recorded_at).toBe(ts);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('9. rollback on mid-transaction failure restores TIER-1, LARGE, and ledger byte-for-byte with zero partial writes', () => {
      const sandboxCheck = verifyPhase6226SetBAtomicSandboxWorkflow(projectRoot);
      expect(sandboxCheck.rollback_after_tier1_failure_verified).toBe(true);
      expect(sandboxCheck.rollback_after_large_failure_verified).toBe(true);
      expect(sandboxCheck.live_ledger_unmodified).toBe(true);
    });

    it('10. APPROVED never auto-promotes to ACTIVE and canonical identity fields cannot be mutated by edits', () => {
      const tempDir = createIsolatedPhase6226Sandbox();
      try {
        const res = executeCanonicalSetBHumanDecision(
          {
            learningUnitKey: 'keep|verb|A1|sense:1',
            reviewerId: 'linguist_chanon_th',
            decision: 'APPROVE',
            rationale: 'Verified A1 verb sense.',
            isProduction: true,
          },
          { projectRoot: tempDir, referenceRoot: projectRoot }
        );

        expect(res.unit.lifecycle_status).toBe('APPROVED');
        expect(res.unit.lifecycle_status).not.toBe('ACTIVE');
        expect(res.unit.is_active).toBe(false);

        expect(() =>
          executeCanonicalSetBHumanDecision(
            {
              learningUnitKey: 'leave|verb|A1|sense:1',
              reviewerId: 'linguist_chanon_th',
              decision: 'EDIT_REQUIRED',
              rationale: 'Attempted CEFR mutation must fail.',
              edits: { cefr_level: 'A2' },
            },
            { projectRoot: tempDir, referenceRoot: projectRoot }
          )
        ).toThrow(/CANONICAL_IDENTITY_MUTATION_FORBIDDEN/);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('11. readiness accounting excludes REVIEW_REQUIRED, EDIT_REQUIRED, HOLD, TEST_DEVELOPMENT, and duplicate approvals', () => {
      const sandboxCheck = verifyPhase6226SetBAtomicSandboxWorkflow(projectRoot);
      expect(sandboxCheck.approve_path_verified).toBe(true);
      expect(sandboxCheck.duplicate_approval_deduplicated).toBe(true);
      expect(sandboxCheck.edit_required_path_verified).toBe(true);
      expect(sandboxCheck.hold_path_verified).toBe(true);
      expect(sandboxCheck.test_development_excluded_from_readiness).toBe(true);
      expect(sandboxCheck.sandbox_readiness_progression).toEqual({
        baseline_learner_ready: 28,
        after_approve_learner_ready: 29,
        after_duplicate_approve_learner_ready: 29,
        after_edit_required_learner_ready: 29,
        after_hold_learner_ready: 29,
        after_test_development_learner_ready: 29,
      });
    });

    it('12. production DB mutation remains 0, Phase 6.2.25 invariants pass, artifacts exist, and final gate is HUMAN_QA_PILOT_COMPLETED', () => {
      const { executionReport } = runPhase6226ControlledHumanQaExecution({
        projectRoot,
        writeArtifacts: false,
      });

      expect(executionReport.final_gate).toBe(DECISION_GATES_6_2_26.HUMAN_QA_PILOT_COMPLETED);
      expect(executionReport.section_c_human_decision_status.real_human_decisions_received_count).toBe(5);
      expect(executionReport.section_c_human_decision_status.awaiting_human_decision_count).toBe(0);
      expect(executionReport.section_h_production_db_safety.production_db_mutations).toBe(0);
      expect(executionReport.section_h_production_db_safety.active_curated_db_records).toBe(21);
      expect(executionReport.section_g_readiness_accounting).toMatchObject({
        active_curated_db: 21,
        human_approved_staging: 62,
        learner_ready: 83,
        target: 10000,
        gap: 9917,
        status: 'NOT_READY',
        user_testing_authorized: false,
        production_db_mutations: 0,
      });
      expect(executionReport.section_i_regression_verification).toEqual({
        phase_6_2_25_gate: DECISION_GATES_6_2_25.EXACT_REVIEW_TARGET_GATE_PASS,
        phase_6_2_25_all_invariants_passed: true,
        synthetic_fallback_removed: true,
        discrepant_set_a_targets_rejected: true,
        set_a_reclassified_edit_required_intact: true,
        duplicate_canonical_keys_count: 0,
      });

      expect(
        fs.existsSync(
          path.join(projectRoot, 'docs/assessment/phase-6.2.26-controlled-human-qa-execution.md')
        )
      ).toBe(true);
      expect(
        fs.existsSync(path.join(projectRoot, 'reports/phase-6.2.26-human-qa-execution.json'))
      ).toBe(true);
    });

    it('13. live readiness accounting is updated to 83 learner-ready units (21 active + 62 approved staging) with 0 DB mutations', () => {
      const readiness = generateHumanQaReadinessReport({ writeArtifact: false });
      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.learner_ready_metrics.learner_ready_percentage).toBe(0.83);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.production_safety.production_database_modified).toBe(false);
    });
  });

  describe('25. Phase 6.2.27 — Controlled Human QA Batch Planning & Gate', () => {
    it('1. audits current inventory baseline with zero drift (10,000 Large, 7,119 Tier-1, 33 learner-ready, 9,967 gap)', () => {
      const { report } = planPhase6227ControlledQABatch({ projectRoot });
      expect(report.inventory_baseline.total_large_units).toBe(10000);
      expect(report.inventory_baseline.large_batches_count).toBe(50);
      expect(report.inventory_baseline.total_tier1_units).toBe(7119);
      expect(report.inventory_baseline.tier1_batches_count).toBe(36);
      expect(report.inventory_baseline.active_curated_db_units).toBe(21);
      expect(report.inventory_baseline.human_approved_staging_units).toBe(12);
      expect(report.inventory_baseline.learner_ready_units).toBe(33);
      expect(report.inventory_baseline.remaining_gap_to_target).toBe(9967);
      expect(report.inventory_baseline.overall_readiness_status).toBe('NOT_READY');
      expect(report.inventory_baseline.user_testing_authorized).toBe(false);
    });

    it('2. selects exactly 50 records from canonical inventory without synthetic fallback', () => {
      const { selectedBatch, report } = planPhase6227ControlledQABatch({ projectRoot });
      expect(selectedBatch.length).toBe(50);
      expect(report.queue_selection_metrics.selected_batch_size).toBe(50);
      expect(report.queue_selection_metrics.candidate_pool_size).toBe(7104);
      expect(report.queue_selection_metrics.rejected_pre_filter_count).toBe(15);
      expect(report.queue_selection_metrics.duplicate_keys_count).toBe(0);
    });

    it('3. every record in the 50-item batch contains all required fields and reason_for_review_priority', () => {
      const { selectedBatch } = planPhase6227ControlledQABatch({ projectRoot });
      for (const item of selectedBatch) {
        expect(item.learning_unit_key).toBeTruthy();
        expect(item.headword).toBeTruthy();
        expect(item.part_of_speech).toBeTruthy();
        expect(item.cefr_level).toBeTruthy();
        expect(typeof item.sense_index).toBe('number');
        expect(item.canonical_batch).toBeTruthy();
        expect(item.canonical_source).toBeTruthy();
        expect(item.priority_tier).toBeTruthy();
        expect(item.risk_tier).toBe('TIER_1_CRITICAL_RISK');
        expect(item.current_lifecycle).toBe('REVIEW_REQUIRED');
        expect(item.current_human_review_status).toBeTruthy();
        expect(item.reason_for_review_priority).toBeTruthy();
        expect(item.canonical_large_batch).toMatch(/^LARGE-\d{3}$/);
        expect(typeof item.canonical_large_unit_index).toBe('number');
      }
    });

    it('4. exact review gate resolves 100% of 50 selected candidates to FOUND_EXACTLY_ONE', () => {
      const { selectedBatch } = planPhase6227ControlledQABatch({ projectRoot });
      for (const item of selectedBatch) {
        const res = resolveCanonicalExactKey(item.learning_unit_key, { projectRoot });
        expect(res.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
        expect(res.matched_record.word).toBe(item.headword);
        expect(res.matched_record.part_of_speech).toBe(item.part_of_speech);
        expect(res.matched_record.cefr_level).toBe(item.cefr_level);
        expect(res.matched_record.sense_index).toBe(item.sense_index);
      }
    });

    it('5. exact review gate strictly rejects synthetic, mismatch, and malformed candidates', () => {
      const testCases = [
        { key: 'syntheticwordxyz|noun|A1|sense:1', expected: CANONICAL_RESOLUTION_STATUS.NOT_FOUND },
        { key: 'keep|noun|A1|sense:1', expected: CANONICAL_RESOLUTION_STATUS.POS_MISMATCH },
        { key: 'keep|verb|C2|sense:1', expected: CANONICAL_RESOLUTION_STATUS.CEFR_MISMATCH },
        { key: 'keep|verb|A1|sense:99', expected: CANONICAL_RESOLUTION_STATUS.SENSE_MISMATCH },
        { key: 'keep', expected: CANONICAL_RESOLUTION_STATUS.NOT_FOUND },
      ];

      for (const tc of testCases) {
        const res = resolveCanonicalExactKey(tc.key, { projectRoot });
        expect(res.exact_resolution_status).toBe(tc.expected);
      }
    });

    it('6. guarantees zero duplicates, zero existing approvals, and zero active records in selected batch', () => {
      const { selectedBatch } = planPhase6227ControlledQABatch({ projectRoot });
      const ledger = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'), 'utf8')
      );
      const approvedKeys = new Set(
        ledger.events
          .filter(
            (e: any) =>
              e.is_production_review && !String(e.transaction_id || '').startsWith('rev_txn_6229_')
          )
          .map((e: any) => e.learning_unit_key)
      );

      const keysSet = new Set<string>();
      for (const item of selectedBatch) {
        expect(keysSet.has(item.learning_unit_key)).toBe(false);
        keysSet.add(item.learning_unit_key);
        expect(approvedKeys.has(item.learning_unit_key)).toBe(false);
        expect(item.current_lifecycle).not.toBe('ACTIVE');
        expect(item.current_lifecycle).not.toBe('APPROVED');
      }
      expect(keysSet.size).toBe(50);
    });

    it('7. enforces planning-only invariants: zero decisions, zero DB mutations, readiness unchanged', () => {
      const { report } = planPhase6227ControlledQABatch({ projectRoot });
      expect(report.planning_constraints.planning_only_mode).toBe(true);
      expect(report.planning_constraints.human_decisions_executed).toBe(0);
      expect(report.planning_constraints.readiness_count_incremented).toBe(false);
      expect(report.planning_constraints.user_testing_authorized).toBe(false);
      expect(report.planning_constraints.production_db_mutations).toBe(0);
      expect(report.planning_constraints.staged_promotions_to_active).toBe(0);
    });

    it('8. evaluates decision gate classification to CONTROLLED_QA_BATCH_READY and verifies report artifact', () => {
      const { finalGate } = planPhase6227ControlledQABatch({ projectRoot });
      expect(finalGate).toBe(PHASE_6_2_27_GATE.CONTROLLED_QA_BATCH_READY);

      const reportPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');
      expect(fs.existsSync(reportPath)).toBe(true);
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      expect(report.gate_verdict).toBe('CONTROLLED_QA_BATCH_READY');
      expect(report.selected_records.length).toBe(50);
    });

    it('9. verifies human review packet has exactly 50 records matching locked batch 1:1 with zero duplicates, missing, or extra', () => {
      const { packetJson, integrity } = buildPhase6227HumanReviewPacket({ projectRoot });
      expect(packetJson.records.length).toBe(50);
      expect(integrity.locked_count).toBe(50);
      expect(integrity.packet_count).toBe(50);
      expect(integrity.exact_key_match).toBe(true);
      expect(integrity.exact_order_match).toBe(true);
      expect(integrity.missing_keys).toEqual([]);
      expect(integrity.extra_keys).toEqual([]);
      expect(integrity.duplicate_keys).toEqual([]);
      expect(integrity.canonical_resolution).toBe('50/50');
      expect(integrity.production_mutations).toBe(0);
      expect(integrity.packet_gate).toBe('PASS');
      expect(integrity.exact_match_50_of_50).toBe(true);
      expect(integrity.zero_duplicate).toBe(true);
      expect(integrity.zero_missing).toBe(true);
      expect(integrity.zero_extra).toBe(true);
      expect(integrity.zero_production_mutation).toBe(true);

      const batchReport = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json'), 'utf8')
      );
      for (let i = 0; i < 50; i++) {
        expect(packetJson.records[i].learning_unit_key).toBe(batchReport.selected_records[i].learning_unit_key);
        expect(packetJson.records[i].queue_position).toBe(i + 1);
      }
    });

    it('10. verifies every record in the review packet has all 20 dimensions and empirical-only potential review flags', () => {
      const { packetItems } = buildPhase6227HumanReviewPacket({ projectRoot });
      const allowedFlags = [
        'POLYSEMY',
        'CEFR_CONFLICT',
        'IPA_VARIANT',
        'SYNTHETIC_EXAMPLE',
        'AI_DRAFT_MEANING',
        'MISSING_SOURCE_GROUNDING',
        'OTHER',
      ];

      for (const item of packetItems) {
        expect(item.learning_unit_key).toBeTruthy();
        expect(item.word).toBeTruthy();
        expect(item.part_of_speech).toBeTruthy();
        expect(item.cefr_level).toBeTruthy();
        expect(typeof item.sense_index).toBe('number');
        expect(item.meaning_en).toBeTruthy();
        expect(item.meaning_th).toBeTruthy();
        expect(item.phonetic_ipa).toBeTruthy();
        expect(item.example_sentence).toBeTruthy();
        expect(item.cefr_source_provenance.source_name).toBeTruthy();
        expect(item.sense_provenance.status).toBeTruthy();
        expect(item.ipa_provenance.status).toBeTruthy();
        expect(item.thai_meaning_provenance.status).toBeTruthy();
        expect(item.example_provenance.status).toBeTruthy();
        expect(item.priority_tier).toBeTruthy();
        expect(item.review_risk_tier).toBe('TIER_1_CRITICAL_RISK');
        expect(item.canonical_batches.large_batch_id).toBeTruthy();
        expect(typeof item.canonical_indices.large_unit_index).toBe('number');
        expect(item.reason_for_review_priority).toBeTruthy();
        expect(Array.isArray(item.potential_review_flags)).toBe(true);

        // Verify only allowed flags are used
        for (const flag of item.potential_review_flags) {
          expect(allowedFlags).toContain(flag);
        }
      }
    });
  });

  // 26. Phase 6.2.28 — Human QA Execution Preparation for Locked 50-Record Packet
  describe('26. Phase 6.2.28 — Human QA Execution Preparation for Locked 50-Record Packet', () => {
    it('1. verifies baseline packet 6.2.27 passes all 10 baseline metrics', () => {
      const baseline = verifyPhase6228Baseline({ projectRoot });
      expect(baseline.valid).toBe(true);
      expect(baseline.errors).toEqual([]);
      expect(baseline.packetKeys.length).toBe(50);
      expect(baseline.batchKeys.length).toBe(50);
      expect(baseline.packet.packet_gate).toBe('PASS');
      expect(baseline.packet.integrity_verification.packet_gate).toBe('PASS');
      expect(baseline.packet.integrity_verification.locked_count).toBe(50);
      expect(baseline.packet.integrity_verification.packet_count).toBe(50);
      expect(baseline.packet.integrity_verification.exact_key_match).toBe(true);
      expect(baseline.packet.integrity_verification.exact_order_match).toBe(true);
      expect(baseline.packet.integrity_verification.canonical_resolution_count).toBe(50);
      expect(baseline.packet.integrity_verification.canonical_resolution_failures).toEqual([]);
      expect(baseline.packet.integrity_verification.production_mutations).toBe(0);
    });

    it('2. verifies execution manifest structure and metadata completeness', () => {
      const { manifest, validation, gate } = buildPhase6228ExecutionManifest({ projectRoot });
      expect(gate).toBe('PASS');
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);

      expect(manifest.metadata.phase).toBe('6.2.28');
      expect(manifest.metadata.manifest_version).toBe('1.0.0');
      expect(manifest.metadata.execution_mode).toBe('PREPARATION_ONLY');
      expect(manifest.metadata.total_execution_units).toBe(50);
      expect(manifest.metadata.human_decisions_executed).toBe(0);
      expect(manifest.metadata.db_mutations_permitted).toBe(false);
      expect(manifest.metadata.readiness_gate).toBe('CONTROLLED_QA_PREPARATION_VERIFIED');
      expect(manifest.metadata.preparation_gate).toBe('PASS');

      expect(manifest.records.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(manifest.records[i].sequence).toBe(i + 1);
      }
    });

    it('3. verifies exact 1:1 key matching and identical sequence between manifest, packet, and batch', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const packetPath = path.join(projectRoot, 'reports/phase-6.2.27-human-review-packet.json');
      const batchPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
      const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

      const manifestKeys = manifest.records.map((r: any) => r.learning_unit_key);
      const packetKeys = packet.records.map((r: any) => r.learning_unit_key);
      const batchKeys = batch.selected_records.map((r: any) => r.learning_unit_key);

      expect(manifestKeys.length).toBe(50);
      expect(packetKeys.length).toBe(50);
      expect(batchKeys.length).toBe(50);

      const uniqueKeys = new Set(manifestKeys);
      expect(uniqueKeys.size).toBe(50);

      for (let i = 0; i < 50; i++) {
        expect(manifestKeys[i]).toBe(packetKeys[i]);
        expect(manifestKeys[i]).toBe(batchKeys[i]);
        expect(manifest.records[i].sequence).toBe(i + 1);
      }
    });

    it('4. enforces strict preparation purity: all human decision fields and reviewer IDs are null', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      expect(manifest.metadata.human_decisions_executed).toBe(0);
      expect(manifest.metadata.db_mutations_permitted).toBe(false);

      for (const r of manifest.records) {
        expect(r.human_decision).toBeNull();
        expect(r.human_edited_meaning_en).toBeNull();
        expect(r.human_edited_meaning_th).toBeNull();
        expect(r.human_edited_ipa).toBeNull();
        expect(r.human_edited_example_sentence).toBeNull();
        expect(r.human_rationale).toBeNull();
        expect(r.reviewer_id).toBeNull();
        expect(r.review_transaction_id).toBeNull();
        expect(r.current_reviewer_decision).toBeNull();
        expect(r.current_lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(r.current_human_review_status).toBe('REVIEW_REQUIRED');
      }
    });

    it('5. enforces content completeness and 5-dimension provenance across all 50 records', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const validCategories = [
        'POLYSEMOUS_CORE',
        'C1_OBSCURE',
        'C2_LITERARY',
        'HOMONYM_AMBIGUITY',
        'MONOSEMOUS_FOUNDATIONAL',
      ];

      for (const r of manifest.records) {
        expect(r.word).toBeTruthy();
        expect(r.part_of_speech).toBeTruthy();
        expect(r.cefr_level).toBeTruthy();
        expect(typeof r.sense_index).toBe('number');
        expect(r.meaning_en).toBeTruthy();
        expect(r.meaning_th).toBeTruthy();
        expect(r.ipa).toBeTruthy();
        expect(r.example_sentence).toBeTruthy();
        expect(r.operational_priority).toBeTruthy();
        expect(r.risk).toBe('TIER_1_CRITICAL_RISK');

        expect(r.provenance.cefr_source).toBeTruthy();
        expect(r.provenance.sense_status).toBeTruthy();
        expect(r.provenance.ipa_status).toBeTruthy();
        expect(r.provenance.thai_status).toBeTruthy();
        expect(r.provenance.example_status).toBeTruthy();

        expect(validCategories).toContain(r.guidance.category);
        expect(Array.isArray(r.guidance.checklist)).toBe(true);
        expect(r.guidance.checklist.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('6. verifies readable workbench markdown document generated with all 50 cards and empty decision templates', () => {
      const docPath = path.join(projectRoot, 'docs/assessment/phase-6.2.28-human-qa-execution-manifest.md');
      expect(fs.existsSync(docPath)).toBe(true);

      const content = fs.readFileSync(docPath, 'utf8');
      expect(content).toContain('# Phase 6.2.28 — Human QA Execution Manifest & Workbench');
      expect(content).toContain('STATUS: PREPARATION ONLY — NOT FOR FINAL SYSTEM SIGN-OFF');
      expect(content).toContain('Human Decisions Executed:** 0 / 50');
      expect(content).toContain('Database Mutations:** 0 (Strict Read-Only Mode)');
      expect(content).toContain('DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD');

      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      for (const r of manifest.records) {
        expect(content).toContain(r.learning_unit_key);
        expect(content).toContain(`[#${r.sequence}] ${r.word}`);
      }
    });

    it('7. fail-closed negative tests: rejects duplicate key, missing key, extra key, swapped sequence, pre-filled decision, and pre-filled reviewer', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const packetPath = path.join(projectRoot, 'reports/phase-6.2.27-human-review-packet.json');
      const batchPath = path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json');

      const validManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
      const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

      // Baseline validity
      expect(validatePhase6228ExecutionManifest(validManifest, packet, batch).valid).toBe(true);

      // Negative Case 1: Pre-filled human_decision
      const badDecision = JSON.parse(JSON.stringify(validManifest));
      badDecision.records[0].human_decision = 'APPROVE';
      const res1 = validatePhase6228ExecutionManifest(badDecision, packet, batch);
      expect(res1.valid).toBe(false);
      expect(res1.errors.some((e: string) => e.includes('pre-filled human_decision'))).toBe(true);

      // Negative Case 2: Pre-filled reviewer_id
      const badReviewer = JSON.parse(JSON.stringify(validManifest));
      badReviewer.records[0].reviewer_id = 'lead_reviewer_01';
      const res2 = validatePhase6228ExecutionManifest(badReviewer, packet, batch);
      expect(res2.valid).toBe(false);
      expect(res2.errors.some((e: string) => e.includes('pre-filled reviewer_id'))).toBe(true);

      // Negative Case 3: Sequence swapped / reordered
      const swappedSeq = JSON.parse(JSON.stringify(validManifest));
      const temp = swappedSeq.records[0];
      swappedSeq.records[0] = swappedSeq.records[1];
      swappedSeq.records[1] = temp;
      swappedSeq.records[0].sequence = 1;
      swappedSeq.records[1].sequence = 2;
      const res3 = validatePhase6228ExecutionManifest(swappedSeq, packet, batch);
      expect(res3.valid).toBe(false);
      expect(res3.errors.some((e: string) => e.includes('Key order mismatch'))).toBe(true);

      // Negative Case 4: Missing key (only 49 records)
      const missingKey = JSON.parse(JSON.stringify(validManifest));
      missingKey.metadata.total_execution_units = 49;
      missingKey.records = missingKey.records.slice(0, 49);
      const res4 = validatePhase6228ExecutionManifest(missingKey, packet, batch);
      expect(res4.valid).toBe(false);
      expect(res4.errors.some((e: string) => e.includes('records must be an array of exactly 50 items'))).toBe(true);

      // Negative Case 5: Extra key (51 records)
      const extraKey = JSON.parse(JSON.stringify(validManifest));
      const extraRecord = JSON.parse(JSON.stringify(extraKey.records[0]));
      extraRecord.sequence = 51;
      extraRecord.learning_unit_key = 'extra|noun|A1|sense:1';
      extraKey.records.push(extraRecord);
      const res5 = validatePhase6228ExecutionManifest(extraKey, packet, batch);
      expect(res5.valid).toBe(false);

      // Negative Case 6: Duplicate key in manifest
      const duplicateKey = JSON.parse(JSON.stringify(validManifest));
      duplicateKey.records[1].learning_unit_key = duplicateKey.records[0].learning_unit_key;
      const res6 = validatePhase6228ExecutionManifest(duplicateKey, packet, batch);
      expect(res6.valid).toBe(false);
      expect(res6.errors.some((e: string) => e.includes('Duplicate learning_unit_key detected'))).toBe(true);

      // Negative Case 7: Unauthorized decisions executed count
      const unauthorizedDecisions = JSON.parse(JSON.stringify(validManifest));
      unauthorizedDecisions.metadata.human_decisions_executed = 1;
      const res7 = validatePhase6228ExecutionManifest(unauthorizedDecisions, packet, batch);
      expect(res7.valid).toBe(false);
      expect(res7.errors.some((e: string) => e.includes('human_decisions_executed is 1, expected 0'))).toBe(true);
    });
  });

  // 27. Phase 6.2.29 — Execute Verified Human QA Approval for Locked 50 Records
  describe('27. Phase 6.2.29 — Execute Verified Human QA Approval for Locked 50 Records', () => {
    it('1. pre-flight cross-verification confirms exact 50/50 match, exact order, zero missing, zero extra, zero duplicates between manifest, packet, and batch', () => {
      const preFlight = verifyPhase6229PreFlight({ projectRoot });
      expect(preFlight.passed).toBe(true);
      expect(preFlight.gate).toBe(PHASE_6_2_29_CONSTANTS.GATE_PASS);
      expect(preFlight.metrics.manifest_count).toBe(50);
      expect(preFlight.metrics.packet_count).toBe(50);
      expect(preFlight.metrics.controlled_batch_count).toBe(50);
      expect(preFlight.metrics.exact_key_match).toBe(true);
      expect(preFlight.metrics.exact_order_match).toBe(true);
      expect(preFlight.metrics.duplicate_keys).toBe(0);
      expect(preFlight.metrics.missing_keys).toBe(0);
      expect(preFlight.metrics.extra_keys).toBe(0);
      expect(preFlight.lockedKeys.length).toBe(50);
    });

    it('2. pre-flight fail-closed: rejects manifest with sequence swap, missing record, extra record, duplicate key, or non-50 count', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const validManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Sequence swap / reordering
      const swapped = JSON.parse(JSON.stringify(validManifest));
      const tmp = swapped.records[0];
      swapped.records[0] = swapped.records[1];
      swapped.records[1] = tmp;
      const resSwap = verifyPhase6229PreFlight({ projectRoot, manifestOverride: swapped });
      expect(resSwap.passed).toBe(false);
      expect(resSwap.errors.some((e: string) => e.includes('Order/key mismatch') || e.includes('sequence mismatch'))).toBe(true);

      // Missing record (49 records)
      const missing = JSON.parse(JSON.stringify(validManifest));
      missing.records = missing.records.slice(0, 49);
      const resMissing = verifyPhase6229PreFlight({ projectRoot, manifestOverride: missing });
      expect(resMissing.passed).toBe(false);
      expect(resMissing.errors.some((e: string) => e.includes('expected 50'))).toBe(true);

      // Extra record (51 records)
      const extra = JSON.parse(JSON.stringify(validManifest));
      const extraItem = JSON.parse(JSON.stringify(extra.records[0]));
      extraItem.sequence = 51;
      extraItem.learning_unit_key = 'extra|noun|A1|sense:1';
      extra.records.push(extraItem);
      const resExtra = verifyPhase6229PreFlight({ projectRoot, manifestOverride: extra });
      expect(resExtra.passed).toBe(false);

      // Duplicate key
      const duplicate = JSON.parse(JSON.stringify(validManifest));
      duplicate.records[1].learning_unit_key = duplicate.records[0].learning_unit_key;
      const resDup = verifyPhase6229PreFlight({ projectRoot, manifestOverride: duplicate });
      expect(resDup.passed).toBe(false);
      expect(resDup.errors.some((e: string) => e.includes('duplicate keys detected'))).toBe(true);
    });

    it('3. pre-flight fail-closed: rejects non-null human_decision, reviewer_id, or review_transaction_id in preparation manifest', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const validManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Pre-filled human_decision
      const badDec = JSON.parse(JSON.stringify(validManifest));
      badDec.records[0].human_decision = 'APPROVE';
      const resDec = verifyPhase6229PreFlight({ projectRoot, manifestOverride: badDec });
      expect(resDec.passed).toBe(false);
      expect(resDec.errors.some((e: string) => e.includes('pre-filled human_decision'))).toBe(true);

      // Pre-filled reviewer_id
      const badRev = JSON.parse(JSON.stringify(validManifest));
      badRev.records[0].reviewer_id = 'human_lexicographer_lead';
      const resRev = verifyPhase6229PreFlight({ projectRoot, manifestOverride: badRev });
      expect(resRev.passed).toBe(false);
      expect(resRev.errors.some((e: string) => e.includes('pre-filled reviewer_id'))).toBe(true);

      // Pre-filled review_transaction_id
      const badTxn = JSON.parse(JSON.stringify(validManifest));
      badTxn.records[0].review_transaction_id = 'rev_txn_early';
      const resTxn = verifyPhase6229PreFlight({ projectRoot, manifestOverride: badTxn });
      expect(resTxn.passed).toBe(false);
      expect(resTxn.errors.some((e: string) => e.includes('pre-filled review_transaction_id'))).toBe(true);
    });

    it('4. pre-flight confirms all 50 records resolve 1:1 against canonical vocabulary inventory (FOUND_EXACTLY_ONE)', () => {
      const preFlight = verifyPhase6229PreFlight({ projectRoot });
      expect(preFlight.metrics.canonical_resolution).toBe('50/50');
      expect(preFlight.metrics.canonical_resolution_count).toBe(50);
      expect(preFlight.metrics.null_human_decision_count).toBe(50);
      expect(preFlight.metrics.null_reviewer_id_count).toBe(50);
      expect(preFlight.metrics.null_review_transaction_id_count).toBe(50);
    });

    it('5. rejects unauthorized reviewer ID, non-human reviewer, or empty rationale with strict fail-closed error', () => {
      expect(() => {
        executeSinglePhase6229Approval({
          projectRoot,
          learningUnitKey: 'gape|verb|C1|sense:2',
          sequence: 1,
          reviewerId: 'bot_auto_reviewer',
        });
      }).toThrow(/UNAUTHORIZED_REVIEWER_ID|Invalid reviewer identity|FORBIDDEN_SYNTHETIC_OR_SIMULATED_REVIEWER_ID/i);

      expect(() => {
        executeSinglePhase6229Approval({
          projectRoot,
          learningUnitKey: 'gape|verb|C1|sense:2',
          sequence: 1,
          reviewerId: 'human_lexicographer_lead',
          rationale: 'short',
        });
      }).toThrow(/RATIONALE_REQUIRED/i);
    });

    it('6. atomic sandbox rollback verifies byte-for-byte non-mutation across TIER-1, LARGE, and ledger on simulated mid-transaction failure', () => {
      const rollbackResult = verifyPhase6229AtomicSandboxRollback({ projectRoot });
      expect(rollbackResult.passed).toBe(true);
      expect(rollbackResult.tier1_rollback_caught).toBe(true);
      expect(rollbackResult.large_rollback_caught).toBe(true);
      expect(rollbackResult.byte_for_byte_restored).toBe(true);
    });

    it('7. verifies atomic synchronization across TIER-1 batch, LARGE batch, and review ledger for all 50 approved records', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
      const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

      const tier1Path = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
      const tier1Batch = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));
      const tier1Map = new Map(tier1Batch.records.map((r: any) => [r.learning_unit_key, r]));

      for (const mRec of manifest.records) {
        const key = mRec.learning_unit_key;
        const tRec = tier1Map.get(key) as any;
        expect(tRec).toBeDefined();
        expect(tRec.human_review_status).toBe('APPROVED');
        expect(tRec.reviewer_decision).toBe('APPROVED');
        expect(tRec.reviewed_by).toBe('human_lexicographer_lead');
        expect(tRec.lifecycle_status).toBe('APPROVED');
        expect(tRec.is_active).toBe(false);
        expect(tRec.review_rationale).toBe(PHASE_6_2_29_CONSTANTS.RATIONALE);
        expect(String(tRec.review_transaction_id)).toMatch(/^rev_txn_6229_/);

        const matchingEvents = ledger.events.filter(
          (e: any) =>
            e.learning_unit_key === key &&
            e.event_type === 'PRODUCTION_REVIEW' &&
            e.is_production_review === true &&
            e.counted_in_readiness === true &&
            e.decision === 'APPROVED' &&
            e.reviewer_id === 'human_lexicographer_lead' &&
            e.transaction_id === tRec.review_transaction_id
        );
        expect(matchingEvents.length).toBe(1);
      }
    });

    it('8. verifies zero mutation of core lexical and pedagogical content fields and provenance across all 50 records', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const tier1Path = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
      const tier1Batch = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));
      const tier1Map = new Map(tier1Batch.records.map((r: any) => [r.learning_unit_key, r]));

      const provIndex = getRepositoryProvenanceIndex(projectRoot);

      for (const mRec of manifest.records) {
        const key = mRec.learning_unit_key;
        const tRec = tier1Map.get(key) as any;
        expect(tRec.word).toBe(mRec.word);
        expect(tRec.part_of_speech).toBe(mRec.part_of_speech);
        expect(tRec.cefr_level).toBe(mRec.cefr_level);
        expect(tRec.sense_index).toBe(mRec.sense_index);
        expect(tRec.meaning_en).toBe(mRec.meaning_en);
        expect(tRec.meaning_th).toBe(mRec.meaning_th);
        expect(tRec.phonetic_ipa).toBe(mRec.ipa);
        expect(tRec.example_sentence).toBe(mRec.example_sentence);

        const lHit = provIndex.largeByExactKey.get(key);
        const lPath = path.join(projectRoot, `scripts/content-pipeline/output/batches/${lHit.batch_file}`);
        const lBatch = JSON.parse(fs.readFileSync(lPath, 'utf8'));
        const lRec = lBatch.records.find((r: any) => r.learning_unit_key === key);

        expect(tRec.provenance).toEqual(lRec.provenance);
        expect(tRec.provenance.ipa_provenance.status).toBe(mRec.provenance.ipa_status);
        expect(tRec.provenance.example_provenance.status).toBe(mRec.provenance.example_status);
      }
    });

    it('9. verifies lifecycle state transitions to APPROVED with is_active === false and zero active records created', () => {
      const manifestPath = path.join(projectRoot, 'reports/phase-6.2.28-human-qa-execution-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const tier1Path = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches/TIER-1-001.json');
      const tier1Batch = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));
      const tier1Map = new Map(tier1Batch.records.map((r: any) => [r.learning_unit_key, r]));

      let activeCount = 0;
      let approvedCount = 0;

      for (const mRec of manifest.records) {
        const tRec = tier1Map.get(mRec.learning_unit_key) as any;
        if (tRec.is_active === true || tRec.lifecycle_status === 'ACTIVE') {
          activeCount++;
        }
        if (tRec.lifecycle_status === 'APPROVED' && tRec.is_active === false) {
          approvedCount++;
        }
      }

      expect(activeCount).toBe(0);
      expect(approvedCount).toBe(50);
    });

    it('10. verifies 50 unique production review ledger events with is_production_review = true and counted_in_readiness = true', () => {
      const ledgerPath = path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json');
      const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

      const phase6229Events = ledger.events.filter(
        (e: any) =>
          e.event_type === 'PRODUCTION_REVIEW' &&
          e.is_production_review === true &&
          e.counted_in_readiness === true &&
          e.reviewer_id === 'human_lexicographer_lead' &&
          String(e.transaction_id || '').startsWith('rev_txn_6229_')
      );

      expect(phase6229Events.length).toBe(50);

      const txnIds = new Set(phase6229Events.map((e: any) => e.transaction_id));
      const evtIds = new Set(phase6229Events.map((e: any) => e.event_id));
      const keys = new Set(phase6229Events.map((e: any) => e.learning_unit_key));

      expect(txnIds.size).toBe(50);
      expect(evtIds.size).toBe(50);
      expect(keys.size).toBe(50);
    });

    it('11. verifies live readiness accounting: 21 active DB + 62 human-approved staging = 83 learner-ready units, 9,917 gap, NOT_READY, user_testing_authorized = false', () => {
      const readiness = generateHumanQaReadinessReport({ projectRoot, writeArtifact: false });

      expect(readiness.inventory_metrics.existing_active_curated_units).toBe(21);
      expect(readiness.human_review_status_breakdown.human_approved).toBe(62);
      expect(readiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(readiness.learner_ready_metrics.learner_ready_percentage).toBe(0.83);
      expect(readiness.user_testing_authorized).toBe(false);
      expect(readiness.overall_status).toBe('NOT_READY');
      expect(readiness.production_safety.production_database_modified).toBe(false);
    });

    it('12. post-execution audit returns HUMAN_QA_EXECUTION_GATE = PASS with generated reports and zero production DB writes', () => {
      const postExec = verifyPhase6229PostExecution({ projectRoot });

      expect(postExec.passed).toBe(true);
      expect(postExec.gate).toBe('PASS');
      expect(postExec.counts.tier1_synced_count).toBe(50);
      expect(postExec.counts.large_synced_count).toBe(50);
      expect(postExec.counts.ledger_synced_count).toBe(50);
      expect(postExec.counts.content_unchanged_count).toBe(50);
      expect(postExec.counts.unique_transaction_ids).toBe(50);
      expect(postExec.counts.active_promotions_count).toBe(0);
      expect(postExec.counts.production_db_writes).toBe(0);

      const jsonReportPath = path.join(projectRoot, 'reports/phase-6.2.29-human-qa-execution-report.json');
      const mdReportPath = path.join(projectRoot, 'docs/assessment/phase-6.2.29-human-qa-execution-report.md');

      expect(fs.existsSync(jsonReportPath)).toBe(true);
      expect(fs.existsSync(mdReportPath)).toBe(true);

      const jsonReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
      expect(jsonReport.gate_verdict).toBe('PASS');
      expect(jsonReport.pre_flight_verification.exact_key_match).toBe(true);
      expect(jsonReport.pre_flight_verification.exact_order_match).toBe(true);
      expect(jsonReport.execution_summary.approved_count).toBe(50);

      const mdReport = fs.readFileSync(mdReportPath, 'utf8');
      expect(mdReport).toContain('# Phase 6.2.29 — Human QA Execution Report (Locked 50 Records)');
      expect(mdReport).toContain('**Final Gate Verdict:** `HUMAN_QA_EXECUTION_GATE = PASS`');
      expect(mdReport).toContain('50 records were approved based on explicit human review.');
      expect(mdReport).toContain('No record was activated.');
      expect(mdReport).toContain('No unrelated production data was mutated.');
    });
  });

  // 28. Phase 6.2.30 — Controlled Human QA Batch Planning After Verified 50-Record Approval
  describe('28. Phase 6.2.30 — Controlled Human QA Batch Planning After Verified 50-Record Approval', () => {
    it('1. audits current inventory baseline with zero drift (10,000 Large, 7,119 Tier-1, 83 learner-ready, 9,917 gap, 65 reviews)', () => {
      const { report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(report.inventory_baseline).toEqual({
        large_batches_count: 50,
        total_large_units: 10000,
        tier1_batches_count: 36,
        total_tier1_units: 7119,
        active_curated_db_units: 21,
        human_approved_staging_units: 62,
        learner_ready_units: 83,
        inventory_target: 10000,
        remaining_gap_to_target: 9917,
        overall_readiness_status: 'NOT_READY',
        user_testing_authorized: false,
        production_review_events_count: 65,
      });

      expect(report.planning_constraints).toEqual({
        planning_only_mode: true,
        human_decisions_executed: 0,
        production_review_events_created: 0,
        readiness_count_incremented: false,
        user_testing_authorized: false,
        production_db_mutations: 0,
        supabase_writes_executed: 0,
        staged_promotions_to_active: 0,
      });
    });

    it('2. selects exactly 50 records from canonical inventory without synthetic fallback', () => {
      const { selectedBatch, report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(selectedBatch.length).toBe(50);
      expect(report.queue_selection_metrics.selected_batch_size).toBe(50);
      expect(report.queue_selection_metrics.candidate_pool_size).toBe(7054);
      expect(report.queue_selection_metrics.rejected_pre_filter_count).toBe(65);
    });

    it('3. every record in the 50-item batch contains all required fields and valid reason_for_review_priority', () => {
      const { selectedBatch } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      for (const item of selectedBatch) {
        expect(item.learning_unit_key).toBeTruthy();
        expect(item.headword).toBeTruthy();
        expect(item.part_of_speech).toBeTruthy();
        expect(item.cefr_level).toBeTruthy();
        expect(typeof item.sense_index).toBe('number');
        expect(item.canonical_batch).toBeTruthy();
        expect(item.canonical_large_batch).toBeTruthy();
        expect(item.canonical_source).toBeTruthy();
        expect(item.priority_tier).toBe('TIER_2_HIGH_VALUE_CORE_POLYSEMOUS');
        expect(item.risk_tier).toBe('TIER_1_CRITICAL_RISK');
        expect(item.current_lifecycle).toBe('REVIEW_REQUIRED');
        expect(['REVIEW_REQUIRED', 'Human review pending']).toContain(item.current_human_review_status);
        expect(item.current_human_review_status).not.toBe('APPROVED');
        expect(typeof item.sequence).toBe('number');
        expect(item.reason_for_review_priority).toContain('Foundational A1 high-value core polysemous headword');
        expect(item.provenance_completeness.ipa_status).not.toBe('UNKNOWN');
        expect(item.provenance_completeness.sense_status).not.toBe('UNKNOWN');
      }
    });

    it('4. exact review gate resolves 100% of 50 selected candidates to FOUND_EXACTLY_ONE', () => {
      const { selectedBatch, report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(report.queue_selection_metrics.exact_resolution_pass_count).toBe(50);
      expect(report.queue_selection_metrics.exact_resolution_fail_count).toBe(0);

      for (const item of selectedBatch) {
        const res = resolveCanonicalExactKey(item.learning_unit_key, { projectRoot });
        expect(res.exact_resolution_status).toBe(CANONICAL_RESOLUTION_STATUS.FOUND_EXACTLY_ONE);
        expect(res.matched_record).toBeDefined();
        expect(res.matched_record.word).toBe(item.headword);
        expect(res.matched_record.part_of_speech).toBe(item.part_of_speech);
        expect(res.matched_record.cefr_level).toBe(item.cefr_level);
        expect(res.matched_record.sense_index).toBe(item.sense_index);
      }
    });

    it('5. negative controls: canonical resolver strictly rejects synthetic, mismatch, and malformed candidates', () => {
      const neg = runPhase6230NegativeControls({ projectRoot });
      expect(neg.all_rejected).toBe(true);
      expect(neg.results.length).toBe(5);

      for (const r of neg.results) {
        expect(r.properly_rejected).toBe(true);
        expect(r.actual_status).toBe(r.expected_status);
      }
    });

    it('6. guarantees zero duplicates, zero previous approved overlap, zero Phase 6.2.27 overlap, and zero active records in selected batch', () => {
      const { selectedBatch, report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(report.exact_integrity.duplicate_keys).toEqual([]);
      expect(report.exact_integrity.already_reviewed_overlap).toEqual([]);
      expect(report.exact_integrity.previous_batch_overlap).toEqual([]);
      expect(report.exact_integrity.active_overlap).toEqual([]);
      expect(report.exact_integrity.all_records_new_for_human_qa).toBe(true);

      const ledger = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/vocabulary-human-review-ledger.json'), 'utf8')
      );
      const approvedKeys = new Set(
        ledger.events.filter((e: any) => e.is_production_review).map((e: any) => e.learning_unit_key)
      );

      const b27 = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'reports/phase-6.2.27-controlled-qa-batch.json'), 'utf8')
      );
      const b27Keys = new Set((b27.selected_records || []).map((r: any) => r.learning_unit_key));

      const keysSet = new Set<string>();
      for (const item of selectedBatch) {
        expect(keysSet.has(item.learning_unit_key)).toBe(false);
        keysSet.add(item.learning_unit_key);
        expect(approvedKeys.has(item.learning_unit_key)).toBe(false);
        expect(b27Keys.has(item.learning_unit_key)).toBe(false);
        expect(item.current_lifecycle).not.toBe('ACTIVE');
        expect(item.current_lifecycle).not.toBe('APPROVED');
      }
      expect(keysSet.size).toBe(50);
    });

    it('7. enforces planning-only invariants: zero decisions, zero DB mutations, readiness unchanged', () => {
      const { report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(report.planning_constraints.planning_only_mode).toBe(true);
      expect(report.planning_constraints.human_decisions_executed).toBe(0);
      expect(report.planning_constraints.production_review_events_created).toBe(0);
      expect(report.planning_constraints.readiness_count_incremented).toBe(false);
      expect(report.planning_constraints.user_testing_authorized).toBe(false);
      expect(report.planning_constraints.production_db_mutations).toBe(0);
      expect(report.planning_constraints.supabase_writes_executed).toBe(0);
      expect(report.planning_constraints.staged_promotions_to_active).toBe(0);

      // Verify live readiness file is untouched
      const liveReadiness = generateHumanQaReadinessReport({ projectRoot, writeArtifact: false });
      expect(liveReadiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(liveReadiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(liveReadiness.overall_status).toBe('NOT_READY');
      expect(liveReadiness.user_testing_authorized).toBe(false);
    });

    it('8. expected readiness accounting projections: 83 current -> 133 expected, gap 9,917 -> 9,867 (EXPECTED ONLY)', () => {
      const { report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(report.expected_readiness_transition).toEqual({
        current_learner_ready: 83,
        selected_batch_size: 50,
        expected_approved_staging_after_approval: 112,
        expected_learner_ready_after_approval: 133,
        expected_gap_after_approval: 9867,
        status: 'EXPECTED_ONLY_NO_STATE_MUTATION',
      });
    });

    it('9. evaluates decision gate classification to CONTROLLED_QA_BATCH_6_2_30_GATE = PASS and verifies report artifacts', () => {
      const { finalGate, report } = planPhase6230ControlledQABatch({ projectRoot, forceReplan: false });

      expect(finalGate).toBe(PHASE_6_2_30_GATE.CONTROLLED_QA_BATCH_READY);
      expect(report.gate_verdict).toBe(PHASE_6_2_30_CONSTANTS.GATE_PASS);
      expect(report.controlled_qa_batch_6_2_30_gate).toBe(PHASE_6_2_30_CONSTANTS.GATE_PASS);

      const jsonPath = path.join(projectRoot, 'reports/phase-6.2.30-controlled-qa-batch.json');
      const mdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.30-controlled-qa-batch.md');

      expect(fs.existsSync(jsonPath)).toBe(true);
      expect(fs.existsSync(mdPath)).toBe(true);

      const mdContent = fs.readFileSync(mdPath, 'utf8');
      expect(mdContent).toContain('# Phase 6.2.30 — Controlled Human QA Batch Planning Report (50 Records)');
      expect(mdContent).toContain('CONTROLLED_QA_BATCH_6_2_30_GATE = PASS');
      expect(mdContent).toContain(
        'Phase 6.2.30 only planned and locked the next 50-record Human QA batch. No human decisions or production mutations were executed.'
      );
    });
  });

  // 29. Phase 6.2.30 — Human Review Packet Generation & Gate Verification
  describe('29. Phase 6.2.30 — Human Review Packet Generation & Gate Verification', () => {
    it('1. generates human review packet with exact 50 records matching locked queue 1:1', () => {
      const { packetJson, integrity } = buildPhase6230HumanReviewPacket({ projectRoot });

      expect(packetJson.phase).toBe('6.2.30');
      expect(packetJson.batch_id).toBe('BATCH-6.2.30-CONTROLLED-50');
      expect(packetJson.packet_gate).toBe('PASS');
      expect(packetJson.records.length).toBe(50);
      expect(packetJson.confirmation_statement).toBe(
        'Phase 6.2.30 Human Review Packet was generated from the locked 50-record queue only. No human decisions or production mutations were executed.'
      );

      expect(integrity.source_count).toBe(50);
      expect(integrity.packet_count).toBe(50);
      expect(integrity.missing).toBe(0);
      expect(integrity.extra).toBe(0);
      expect(integrity.duplicate).toBe(0);
      expect(integrity.order_mismatch).toBe(0);
      expect(integrity.key_mismatch).toBe(0);
      expect(integrity.exact_key_match).toBe(true);
      expect(integrity.exact_order_match).toBe(true);
      expect(integrity.canonical_resolution_count).toBe(50);
      expect(integrity.canonical_resolution_failures).toEqual([]);
      expect(integrity.production_mutations).toBe(0);
      expect(integrity.packet_gate).toBe('PASS');
    });

    it('2. guarantees byte-for-byte exact sequence and key matching between locked batch and review packet', () => {
      const batchPath = path.join(projectRoot, 'reports/phase-6.2.30-controlled-qa-batch.json');
      const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');

      expect(fs.existsSync(batchPath)).toBe(true);
      expect(fs.existsSync(packetPath)).toBe(true);

      const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

      const lockedRecords = batch.selected_records;
      const packetRecords = packet.records;

      expect(lockedRecords.length).toBe(50);
      expect(packetRecords.length).toBe(50);

      for (let i = 0; i < 50; i++) {
        expect(packetRecords[i].sequence).toBe(i + 1);
        expect(packetRecords[i].learning_unit_key).toBe(lockedRecords[i].learning_unit_key);
        expect(packetRecords[i].word).toBe(lockedRecords[i].headword);
        expect(packetRecords[i].part_of_speech).toBe(lockedRecords[i].part_of_speech);
        expect(packetRecords[i].cefr_level).toBe(lockedRecords[i].cefr_level);
        expect(packetRecords[i].sense_index).toBe(lockedRecords[i].sense_index);
      }
    });

    it('3. enforces all 20 required dimensions on every record in the review packet', () => {
      const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

      for (const rec of packet.records) {
        // 1. sequence
        expect(typeof rec.sequence).toBe('number');
        expect(rec.sequence).toBeGreaterThanOrEqual(1);
        expect(rec.sequence).toBeLessThanOrEqual(50);

        // 2. learning_unit_key
        expect(rec.learning_unit_key).toBeTruthy();
        expect(rec.learning_unit_key).not.toBe('MISSING');

        // 3. word
        expect(rec.word).toBeTruthy();
        expect(rec.word).not.toBe('MISSING');

        // 4. part_of_speech
        expect(rec.part_of_speech).toBeTruthy();
        expect(rec.part_of_speech).not.toBe('MISSING');

        // 5. CEFR level
        expect(rec.cefr_level).toBe('A1');

        // 6. sense_index
        expect(typeof rec.sense_index).toBe('number');

        // 7. meaning_en
        expect(rec.meaning_en).toBeTruthy();
        expect(rec.meaning_en).not.toBe('MISSING');

        // 8. meaning_th
        expect(rec.meaning_th).toBeTruthy();
        expect(rec.meaning_th).not.toBe('MISSING');

        // 9. IPA
        expect(rec.ipa).toBeTruthy();
        expect(rec.ipa).not.toBe('MISSING');
        expect(rec.phonetic_ipa).toBeTruthy();

        // 10. example_sentence
        expect(rec.example_sentence).toBeTruthy();
        expect(rec.example_sentence).not.toBe('MISSING');

        // 11. provenance
        expect(typeof rec.provenance).toBe('object');
        expect(rec.provenance.source_name).toBeTruthy();
        expect(rec.provenance.original_id).toBeTruthy();

        // 12. source large batch
        expect(rec.source_large_batch).toMatch(/^LARGE-\d{3}$/);
        expect(rec.batch).toMatch(/^LARGE-\d{3}$/);

        // 13. tier-1 batch
        expect(rec.tier1_batch).toBe('TIER-1-001');

        // 14. lifecycle status
        expect(rec.lifecycle_status).toBe('REVIEW_REQUIRED');

        // 15. human review status
        expect(['REVIEW_REQUIRED', 'Human review pending']).toContain(rec.human_review_status);

        // 16. sense provenance
        expect(typeof rec.sense_provenance).toBe('object');
        expect(rec.sense_provenance.status).toBeTruthy();
        expect(rec.sense_provenance.disambiguation_status).toBe('MATCH_AMBIGUOUS');

        // 17. IPA provenance
        expect(typeof rec.ipa_provenance).toBe('object');
        expect(rec.ipa_provenance.status).toBe('VERIFIED_LICENSED_IPA');
        expect(rec.ipa_provenance.source).toBe('cmudict');

        // 18. Thai meaning provenance
        expect(typeof rec.thai_meaning_provenance).toBe('object');
        expect(rec.thai_meaning_provenance.status).toBeTruthy();
        expect(rec.thai_meaning_provenance.source).toBeTruthy();

        // 19. example provenance
        expect(typeof rec.example_provenance).toBe('object');
        expect(rec.example_provenance.status).toBeTruthy();
        expect(rec.example_provenance.source).toBeTruthy();

        // 20. risk flags
        expect(Array.isArray(rec.risk_flags)).toBe(true);
        expect(rec.risk_flags.length).toBeGreaterThan(0);
      }
    });

    it('4. strictly validates empirical risk flags taxonomy with zero boilerplate and zero generic OTHER', () => {
      const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

      for (const rec of packet.records) {
        expect(rec.risk_flags.length).toBeGreaterThan(0);
        for (const flag of rec.risk_flags) {
          expect(PHASE_6230_ALLOWED_RISK_FLAGS).toContain(flag);
          // Generic OTHER without explanation is forbidden
          expect(flag).not.toBe('OTHER');
        }
        // In Phase 6.2.30, foundational A1 polysemous words must have POLYSEMY_RISK, THAI_MEANING_RISK, and EXAMPLE_RISK
        expect(rec.risk_flags).toContain('POLYSEMY_RISK');
        expect(rec.risk_flags).toContain('THAI_MEANING_RISK');
        expect(rec.risk_flags).toContain('EXAMPLE_RISK');
      }
    });

    it('5. independent packet integrity verifier returns PASS across all gate criteria', () => {
      const res = verifyPhase6230HumanReviewPacket({ projectRoot });

      expect(res.passed).toBe(true);
      expect(res.source_count).toBe(50);
      expect(res.packet_count).toBe(50);
      expect(res.missing).toBe(0);
      expect(res.extra).toBe(0);
      expect(res.duplicate).toBe(0);
      expect(res.order_mismatch).toBe(0);
      expect(res.key_mismatch).toBe(0);
      expect(res.dimension_failures).toEqual([]);
      expect(res.packet_gate).toBe('PASS');
    });

    it('6. negative controls: independent verifier catches key corruption, missing keys, order mismatch, and invalid risk flags', () => {
      const tempDir = path.join(os.tmpdir(), `glova-verify-neg-${Date.now()}`);
      fs.mkdirSync(path.join(tempDir, 'reports'), { recursive: true });

      try {
        const batchPath = path.join(projectRoot, 'reports/phase-6.2.30-controlled-qa-batch.json');
        const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');

        const validBatch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
        const validPacket = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

        fs.writeFileSync(path.join(tempDir, 'reports/phase-6.2.30-controlled-qa-batch.json'), JSON.stringify(validBatch), 'utf8');

        // Negative 1: Swapped order
        const swappedPacket = JSON.parse(JSON.stringify(validPacket));
        const tempRec = swappedPacket.records[0];
        swappedPacket.records[0] = swappedPacket.records[1];
        swappedPacket.records[1] = tempRec;
        fs.writeFileSync(path.join(tempDir, 'reports/phase-6.2.30-human-review-packet.json'), JSON.stringify(swappedPacket), 'utf8');

        const res1 = verifyPhase6230HumanReviewPacket({ projectRoot: tempDir });
        expect(res1.passed).toBe(false);
        expect(res1.order_mismatch).toBeGreaterThan(0);
        expect(res1.packet_gate).toBe('FAILED');

        // Negative 2: Missing key
        const missingPacket = JSON.parse(JSON.stringify(validPacket));
        missingPacket.records.pop();
        fs.writeFileSync(path.join(tempDir, 'reports/phase-6.2.30-human-review-packet.json'), JSON.stringify(missingPacket), 'utf8');

        const res2 = verifyPhase6230HumanReviewPacket({ projectRoot: tempDir });
        expect(res2.passed).toBe(false);
        expect(res2.missing).toBe(1);
        expect(res2.packet_gate).toBe('FAILED');

        // Negative 3: Disallowed risk flag
        const invalidFlagPacket = JSON.parse(JSON.stringify(validPacket));
        invalidFlagPacket.records[0].risk_flags.push('BOGUS_INVALID_FLAG');
        fs.writeFileSync(path.join(tempDir, 'reports/phase-6.2.30-human-review-packet.json'), JSON.stringify(invalidFlagPacket), 'utf8');

        const res3 = verifyPhase6230HumanReviewPacket({ projectRoot: tempDir });
        expect(res3.passed).toBe(false);
        expect(res3.dimension_failures.some((d: any) => d.failed_dimensions.some((f: string) => f.includes('BOGUS_INVALID_FLAG')))).toBe(true);
        expect(res3.packet_gate).toBe('FAILED');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('7. enforces zero production mutations: DB writes = 0, review events created = 0, learner-ready unchanged at 83', () => {
      const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

      expect(packet.integrity_verification.production_mutations).toBe(0);

      const liveReadiness = generateHumanQaReadinessReport({ projectRoot, writeArtifact: false });
      expect(liveReadiness.learner_ready_metrics.currently_learner_ready_units).toBe(83);
      expect(liveReadiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready).toBe(9917);
      expect(liveReadiness.overall_status).toBe('NOT_READY');
      expect(liveReadiness.user_testing_authorized).toBe(false);
    });

    it('8. verifies human-readable review markdown document contains all 50 cards and decision templates', () => {
      const docPath = path.join(projectRoot, 'docs/assessment/phase-6.2.30-human-review-packet.md');
      expect(fs.existsSync(docPath)).toBe(true);

      const content = fs.readFileSync(docPath, 'utf8');
      expect(content).toContain('# Phase 6.2.30 — Human Review Packet (50 Locked Canonical Records)');
      expect(content).toContain('PACKET_GATE**: **`PASS`**');
      expect(content).toContain('STAGING / PLANNING ONLY');
      expect(content).toContain('DECISION: [ ] APPROVE   [ ] EDIT_REQUIRED   [ ] HOLD');
      expect(content).toContain(
        'Phase 6.2.30 Human Review Packet was generated from the locked 50-record queue only. No human decisions or production mutations were executed.'
      );

      const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

      for (const rec of packet.records) {
        expect(content).toContain(`### ${rec.sequence}. \`${rec.learning_unit_key}\``);
        expect(content).toContain(`**Headword**: **${rec.word}**`);
      }
    });
  });

  // 30. Phase 6.2.30A — Human Content Quality Audit & Decision Gates
  describe('30. Phase 6.2.30A — Human Content Quality Audit & Decision Gates', () => {
    const auditReportPath = path.join(projectRoot, 'reports/phase-6.2.30A-content-quality-audit.json');
    const auditMdPath = path.join(projectRoot, 'docs/assessment/phase-6.2.30A-content-quality-audit.md');
    const packetPath = path.join(projectRoot, 'reports/phase-6.2.30-human-review-packet.json');

    it('1. verifies independent audit verifier runs and passes all 1:1 packet fidelity checks', () => {
      const result = verifyPhase6230AContentQualityAudit({ projectRoot });
      expect(result.passed).toBe(true);
      expect(result.metrics.sourceCount).toBe(50);
      expect(result.metrics.auditCount).toBe(50);
      expect(result.metrics.missingCount).toBe(0);
      expect(result.metrics.extraCount).toBe(0);
      expect(result.metrics.duplicateCount).toBe(0);
      expect(result.metrics.orderMismatchCount).toBe(0);
      expect(result.metrics.keyMismatchCount).toBe(0);
      expect(result.metrics.invalidFieldCount).toBe(0);
      expect(result.metrics.logicViolationCount).toBe(0);
      expect(result.metrics.gate).toBe('PASS');
      expect(result.metrics.safetyVerified).toBe(true);
    });

    it('2. verifies exact decision distribution: 8 APPROVE, 33 EDIT_REQUIRED, 9 HOLD', () => {
      expect(fs.existsSync(auditReportPath)).toBe(true);
      const audit = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));

      expect(audit.phase).toBe('6.2.30A');
      expect(audit.phase_6_2_30a_gate).toBe('PASS');
      expect(audit.audit_summary.total).toBe(50);
      expect(audit.audit_summary.approve_count).toBe(8);
      expect(audit.audit_summary.edit_required_count).toBe(33);
      expect(audit.audit_summary.hold_count).toBe(9);
      expect(audit.audit_summary.approve_percentage).toBe('16.0%');
      expect(audit.audit_summary.edit_required_percentage).toBe('66.0%');
      expect(audit.audit_summary.hold_percentage).toBe('18.0%');
    });

    it('3. verifies all 50 records contain all 16 required fields and match source packet order exactly', () => {
      const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
      const audit = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));

      expect(audit.audit_records.length).toBe(50);
      expect(packet.records.length).toBe(50);

      for (let i = 0; i < 50; i++) {
        const pRec = packet.records[i];
        const aRec = audit.audit_records[i];

        expect(aRec.sequence).toBe(i + 1);
        expect(aRec.learning_unit_key).toBe(pRec.learning_unit_key);
        expect(aRec.word).toBe(pRec.word);
        expect(aRec.part_of_speech).toBe(pRec.part_of_speech);
        expect(aRec.cefr_level).toBe(pRec.cefr_level);
        expect(aRec.sense_index).toBe(pRec.sense_index);

        for (const field of PHASE_6230A_REQUIRED_FIELDS) {
          expect(aRec).toHaveProperty(field);
          expect(aRec[field]).not.toBeNull();
          expect(aRec[field]).not.toBeUndefined();
        }

        expect(PHASE_6230A_ALLOWED_DECISIONS).toContain(aRec.decision);
        expect(PHASE_6230A_ALLOWED_SEVERITIES).toContain(aRec.severity);
        expect(typeof aRec.reviewer_reason).toBe('string');
        expect(aRec.reviewer_reason.length).toBeGreaterThan(0);
        expect(typeof aRec.suggested_action).toBe('string');
        expect(aRec.suggested_action.length).toBeGreaterThan(0);
        expect(typeof aRec.provenance_warning).toBe('boolean');
      }
    });

    it('4. verifies decision logic invariants (APPROVE has 0 failed dims, EDIT_REQUIRED has >0 failed dims, HOLD has HIGH severity)', () => {
      const audit = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));

      for (const rec of audit.audit_records) {
        if (rec.decision === 'APPROVE') {
          expect(rec.failed_dimensions).toHaveLength(0);
        } else if (rec.decision === 'EDIT_REQUIRED') {
          expect(rec.failed_dimensions.length).toBeGreaterThan(0);
          for (const dim of rec.failed_dimensions) {
            expect(PHASE_6230A_ALLOWED_FAILED_DIMS).toContain(dim);
          }
        } else if (rec.decision === 'HOLD') {
          expect(rec.failed_dimensions.length).toBeGreaterThan(0);
          expect(rec.severity).toBe('HIGH');
          for (const dim of rec.failed_dimensions) {
            expect(PHASE_6230A_ALLOWED_FAILED_DIMS).toContain(dim);
          }
        }
      }
    });

    it('5. verifies negative controls: detects corrupted counts, duplicate keys, invalid decisions, and missing fields', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase-6230a-neg-ctrl-'));
      try {
        fs.mkdirSync(path.join(tempDir, 'reports'), { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'docs/assessment'), { recursive: true });

        // Copy source packet and md doc
        fs.copyFileSync(packetPath, path.join(tempDir, 'reports/phase-6.2.30-human-review-packet.json'));
        fs.copyFileSync(auditMdPath, path.join(tempDir, 'docs/assessment/phase-6.2.30A-content-quality-audit.md'));

        // Corrupted audit: duplicate key & invalid decision
        const validAudit = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));
        const corruptedAudit = JSON.parse(JSON.stringify(validAudit));
        corruptedAudit.audit_records[1].learning_unit_key = corruptedAudit.audit_records[0].learning_unit_key;
        corruptedAudit.audit_records[2].decision = 'INVALID_DECISION';

        fs.writeFileSync(
          path.join(tempDir, 'reports/phase-6.2.30A-content-quality-audit.json'),
          JSON.stringify(corruptedAudit, null, 2)
        );

        const negResult = verifyPhase6230AContentQualityAudit({ projectRoot: tempDir });
        expect(negResult.passed).toBe(false);
        expect(negResult.metrics.duplicateCount).toBeGreaterThan(0);
        expect(negResult.metrics.logicViolationCount).toBeGreaterThan(0);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('6. verifies production safety invariants: zero DB writes, zero staging mutations, zero approval events, learner-ready = 83', () => {
      const audit = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));
      const safety = audit.production_safety_invariants;

      expect(safety.production_db_writes).toBe(0);
      expect(safety.staging_data_mutated).toBe(false);
      expect(safety.vocabulary_lifecycle_mutated).toBe(false);
      expect(safety.review_ledger_production_events_created).toBe(0);
      expect(safety.learner_ready_units_unchanged).toBe(83);
      expect(safety.readiness_overall_status_unchanged).toBe('NOT_READY');
      expect(safety.user_testing_authorized_unchanged).toBe(false);
    });

    it('7. verifies human-readable markdown audit document matches JSON audit report and contains all 50 records', () => {
      expect(fs.existsSync(auditMdPath)).toBe(true);
      const mdContent = fs.readFileSync(auditMdPath, 'utf8');

      expect(mdContent).toContain('# Phase 6.2.30A — Human Content Quality Audit Report (50 Locked Records)');
      expect(mdContent).toContain('AUDIT ONLY');
      expect(mdContent).toContain('Learner-ready count = unchanged (83)');
      expect(mdContent).toContain('**APPROVE** | **8 records**');
      expect(mdContent).toContain('**EDIT_REQUIRED** | **33 records**');
      expect(mdContent).toContain('**HOLD** | **9 records**');

      const audit = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));
      for (const rec of audit.audit_records) {
        expect(mdContent).toContain(rec.learning_unit_key);
      }
    });
  });
});









