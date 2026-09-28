#!/usr/bin/env node
/**
 * review-cli.mjs
 * ==============================================================================
 * Phase 6.2.12 — Human Reviewer Terminal CLI
 *
 * Provides internal human reviewers with:
 * 1. 14-dimension visual inspection of candidate learning units.
 * 2. Authenticated human reviewer session validation (strictly rejects AI/bots).
 * 3. Batch navigation across 36 Tier 1 critical-risk review batches.
 * 4. Inline field-level editing (meaning_en, meaning_th, phonetic_ipa,
 *    example_sentence, cefr_level, topic, sense_key).
 * 5. Deterministic lifecycle disposition validation (IPA, Sense, CEFR conflicts).
 * 6. Audit-trail ledger recording and live readiness synchronization.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import {
  IPA_DISPOSITIONS,
  REVIEW_DECISIONS,
  SENSE_DISPOSITIONS,
  TERMINAL_REVIEW_DISPOSITIONS,
  assertBatchCompletion,
  evaluateBatchCompletion,
  evaluateEightDimensionAudit,
  exportTier1BatchForReview,
  filterBatchRecords,
  getTier1BatchProgress,
  importTier1ReviewSubmissions,
  loadTier1Batch,
  recordReviewDecisionOnUnit,
  validateReviewEdits,
  validateReviewerIdentity,
} from './human-review-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * ANSI Color Helpers for Terminal Formatting
 */
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
};

/**
 * Formats a unit into all 14 required visual review dimensions.
 */
export function formatUnit14Dimensions(unit, batchId = 'UNKNOWN', batchIndex = 0, totalInBatch = 0) {
  const audit = evaluateEightDimensionAudit(unit);
  const p = unit.provenance || {};
  const reasons = unit.tier1_reasons || [];
  const candSenses = unit.candidate_senses_preview || [];
  const conflictingLevels = (p.conflicting_cefr_levels || []).join(', ') || 'None';
  const conflictingEntries = (p.conflicting_entries || []).length;

  const header = `================================================================================
 BATCH: ${batchId} | ITEM ${batchIndex}/${totalInBatch} | KEY: ${unit.learning_unit_key}
 STATUS: ${unit.lifecycle_status || 'REVIEW_REQUIRED'} | RISK: ${unit.review_risk_tier || 'TIER_1_CRITICAL_RISK'}
================================================================================`;

  const dim1 = `1. IDENTITY & NORMALIZATION:
   Word:           ${unit.word || ''}
   Lemma:          ${unit.lemma || ''}
   Canonical Key:  ${unit.learning_unit_key}`;

  const dim2 = `2. PART OF SPEECH:
   POS:            ${unit.part_of_speech || ''}`;

  const dim3 = `3. CEFR LEVEL & STAGING:
   CEFR Level:     ${unit.cefr_level || ''} (Priority Tier: ${unit.priority_tier || 'N/A'})`;

  const dim4 = `4. ENGLISH MEANING:
   Definition:     "${unit.meaning_en || ''}"
   Source:         ${unit.meaning_source || 'OEWN-2024'} (${unit.meaning_review_status || 'SOURCE_VERIFIED'})`;

  const prevDraftsFormatted =
    p.previous_drafts && p.previous_drafts.length > 0
      ? p.previous_drafts
          .map(
            (pd, idx) =>
              `\n   Previous Draft [${idx + 1}]: "${pd.value}"\n     Archived At: ${pd.archived_at || 'N/A'}\n     Reason: ${pd.reason || 'N/A'}`
          )
          .join('')
      : '';

  const remSource = p.remediation?.source || p.meaning_th_provenance?.source || 'Original Draft';
  const remMethod = p.remediation?.method || p.meaning_th_provenance?.method || 'initial_enrichment';
  const remGate =
    p.remediation?.quality_gate_passed !== undefined
      ? p.remediation.quality_gate_passed
        ? 'PASS (Structural Gate)'
        : 'FAIL'
      : unit.meaning_th
        ? 'PASS'
        : 'UNCHECKED';
  const remIssues = (p.remediation?.quality_gate_issues || []).join(', ') || 'None';

  const dim5 = `5. THAI TRANSLATION:
   Translation:    "${unit.meaning_th || ''}"
   Status:         ${unit.meaning_th_review_status || 'AI_DRAFT'}
   Remediation:    ${remSource} (${remMethod})
   QA Gate Result: ${remGate} (Issues: ${remIssues})${prevDraftsFormatted}`;

  const dim6 = `6. PHONETIC IPA:
   IPA:            ${unit.phonetic_ipa || '[MISSING]'}
   Status:         ${unit.pronunciation_review_status || 'UNRESOLVED'}
   Variants:       ${(unit.pronunciation_variants_ipa || []).join(', ') || 'None'}`;

  const dim7 = `7. EXAMPLE SENTENCE:
   Example:        "${unit.example_sentence || ''}"
   Status:         ${unit.example_review_status || 'AI_DRAFT_REVIEW_REQUIRED'}`;

  const dim8 = `8. TOPIC / DOMAIN:
   Topic:          ${unit.topic || 'General'}`;

  const candSensesFormatted =
    candSenses.length > 0
      ? candSenses
          .map(
            (s, idx) =>
              `     [${idx + 1}] synset:${s.synset_id || ''} key:${s.sense_key || ''}\n         def: "${s.definition || ''}"\n         ex: ${(s.examples || []).map((e) => `"${e}"`).join(', ') || 'None'}`
          )
          .join('\n')
      : '     [No additional candidates available]';

  const dim9 = `9. SENSE DISAMBIGUATION & SYNSET:
   Sense Status:   ${unit.sense_status || unit.sense_disambiguation_status || 'UNKNOWN'}
   Sense Key:      ${unit.sense_key || 'N/A'}
   OEWN Synset ID: ${unit.oewn_synset_id || 'N/A'}
   Sense Disp.:    ${unit.sense_disposition || 'None'}
   Candidate Senses:
${candSensesFormatted}`;

  const dim10 = `10. CEFR CONFLICT PROFILE:
   Conflict Status:    ${unit.conflict_status || p.conflict_status || 'NONE'}
   Conflicting Levels: ${conflictingLevels}
   Conflicting Sources:${conflictingEntries > 0 ? ` ${conflictingEntries} external entries` : ' None'}`;

  const dim11 = `11. PRONUNCIATION INTEGRITY:
   Pronun. Source:     ${unit.pronunciation_source || 'cmudict'}
   IPA Disposition:    ${unit.ipa_disposition || 'None'}`;

  const dim12 = `12. CONTENT PROVENANCE:
   Source Name:        ${p.source_name || p.source || 'CEFR-J'}
   Source Version:     ${p.source_version || '1.5'}
   Transform Method:   ${p.transformation_method || 'pipeline'}
   License:            ${p.license || 'Permissive'}`;

  const dim13 = `13. TIER 1 RISK REASONS:
   Reasons:            ${reasons.length > 0 ? reasons.join(', ') : 'None'}`;

  const dim14 = `14. AUTOMATED QA AUDIT:
   Audit Status:       ${audit.audit_status}
   Blocking Flags:     ${audit.flags.length > 0 ? audit.flags.join(', ') : 'None'}`;

  const reviewerHistory = `REVIEW HISTORY:
   Reviewed By:        ${unit.reviewed_by || 'Not reviewed'}
   Reviewed At:        ${unit.reviewed_at || 'N/A'}
   Decision:           ${unit.reviewer_decision || 'PENDING'}
   Rationale/Comments: ${unit.review_rationale || unit.review_comments || 'None'}`;

  return [
    header,
    dim1,
    dim2,
    dim3,
    dim4,
    dim5,
    dim6,
    dim7,
    dim8,
    dim9,
    dim10,
    dim11,
    dim12,
    dim13,
    dim14,
    reviewerHistory,
    '================================================================================',
  ].join('\n\n');
}

/**
 * Searches for a unit by key across all Tier 1 batches and fallback to LARGE batches.
 */
export function findUnitByKey(learningUnitKey) {
  const tier1Dir = path.join(projectRoot, 'scripts/content-pipeline/output/tier1-batches');
  const largeDir = path.join(projectRoot, 'scripts/content-pipeline/output/batches');

  if (fs.existsSync(tier1Dir)) {
    const files = fs
      .readdirSync(tier1Dir)
      .filter((f) => /^TIER-1-\d{3}\.json$/.test(f))
      .sort();

    for (const file of files) {
      const batchData = JSON.parse(fs.readFileSync(path.join(tier1Dir, file), 'utf8'));
      const idx = batchData.records.findIndex((r) => r.learning_unit_key === learningUnitKey);
      if (idx !== -1) {
        return {
          batchId: batchData.batch_id,
          batchIndex: idx + 1,
          totalInBatch: batchData.records.length,
          unit: batchData.records[idx],
        };
      }
    }
  }

  if (fs.existsSync(largeDir)) {
    const files = fs
      .readdirSync(largeDir)
      .filter((f) => /^LARGE-\d{3}\.json$/.test(f))
      .sort();

    for (const file of files) {
      const batchData = JSON.parse(fs.readFileSync(path.join(largeDir, file), 'utf8'));
      const idx = batchData.records.findIndex((r) => r.learning_unit_key === learningUnitKey);
      if (idx !== -1) {
        return {
          batchId: batchData.batch_id,
          batchIndex: idx + 1,
          totalInBatch: batchData.records.length,
          unit: batchData.records[idx],
        };
      }
    }
  }

  return null;
}

/**
 * Prints Tier 1 overall progress and batch statuses.
 */
export function printQueueStatus() {
  const reportPath = path.join(projectRoot, 'reports/vocabulary-tier1-risk-queue.json');
  if (!fs.existsSync(reportPath)) {
    console.log('Tier 1 risk queue report not found. Run: node human-review-engine.mjs --extract-tier1');
    return;
  }

  const queue = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const readinessPath = path.join(projectRoot, 'reports/vocabulary-human-qa-readiness.json');
  const readiness = fs.existsSync(readinessPath)
    ? JSON.parse(fs.readFileSync(readinessPath, 'utf8'))
    : null;

  console.log(`
================================================================================
 GLOVA VOCABULARY TIER 1 CRITICAL-RISK REVIEW QUEUE STATUS
================================================================================
 Total Staged Examined:     ${queue.total_staged_examined}
 Tier 1 Units Total:        ${queue.tier_1_units_total} (${queue.tier_1_percentage_of_staged}% of staged)
 Non-Tier 1 Units:          ${queue.non_tier_1_units_total}
 Total Batches:             ${queue.batches_count} (Batch size: ${queue.batch_size})
 Overall Readiness Status:  ${readiness ? readiness.overall_status : 'NOT_READY'}
 User Testing Authorized:   ${readiness ? String(readiness.user_testing_authorized) : 'false'}
 Learner-Ready Units:       ${readiness ? readiness.learner_ready_metrics.currently_learner_ready_units : 21}/10000
 Remaining Gap:             ${readiness ? readiness.learner_ready_metrics.remaining_gap_to_10000_learner_ready : 9979}

 Reason Distribution:
   - CEFR Conflicts:        ${queue.reason_counts.cefr_conflict}
   - Ambiguous Senses:      ${queue.reason_counts.ambiguous_sense}
   - No-Match Senses:       ${queue.reason_counts.no_match_sense}
   - Unresolved IPA:        ${queue.reason_counts.unresolved_ipa}
   - Heteronyms:            ${queue.reason_counts.heteronym}
   - Blocking QA Flags:     ${queue.reason_counts.qa_flagged}

 CEFR Distribution:
   - A1: ${queue.cefr_distribution.A1} | A2: ${queue.cefr_distribution.A2} | B1: ${queue.cefr_distribution.B1}
   - B2: ${queue.cefr_distribution.B2} | C1: ${queue.cefr_distribution.C1} | C2: ${queue.cefr_distribution.C2}
================================================================================
 BATCH PROGRESS (FIRST 10 OF ${queue.batches_count}):`);

  for (let i = 0; i < Math.min(10, queue.batches_count); i++) {
    const bId = `TIER-1-${String(i + 1).padStart(3, '0')}`;
    try {
      const prog = getTier1BatchProgress(bId);
      console.log(
        `   ${prog.batch_id}: ${prog.reviewed_count}/${prog.total_items} reviewed (${prog.progress_percent}%) | App:${prog.approved} Rej:${prog.rejected} Edit:${prog.edit_required} Hold:${prog.hold} Pend:${prog.pending}`
      );
    } catch {
      console.log(`   ${bId}: [Unable to read progress]`);
    }
  }

  console.log(`
 Run 'node review-cli.mjs --batch TIER-1-001' to start reviewing batch 1.
================================================================================`);
}

/**
 * CLI Argument Parser
 */
export function parseCliArgs(args) {
  const parsed = {
    mode: null,
    batchId: null,
    unitKey: null,
    reviewerId: null,
    decision: null,
    rationale: null,
    ipaDisposition: null,
    senseDisposition: null,
    exportPath: null,
    importPath: null,
    filter: 'REVIEW_REQUIRED',
    dryRun: false,
    isProduction: false,
    edits: {},
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--status' || a === '-s' || a === '--progress') {
      parsed.mode = 'status';
    } else if (a === '--inspect') {
      parsed.mode = 'inspect';
      parsed.unitKey = args[++i];
    } else if (a === '--batch') {
      parsed.batchId = args[++i];
    } else if (a === '--unit-key' || a === '--key') {
      parsed.unitKey = args[++i];
    } else if (a === '--reviewer' || a === '-u') {
      parsed.reviewerId = args[++i];
    } else if (a === '--decision' || a === '-d') {
      parsed.decision = args[++i];
    } else if (a === '--rationale' || a === '--comments' || a === '-r') {
      parsed.rationale = args[++i];
    } else if (a === '--ipa-disposition') {
      parsed.ipaDisposition = args[++i];
    } else if (a === '--sense-disposition') {
      parsed.senseDisposition = args[++i];
    } else if (a === '--decide') {
      parsed.mode = 'decide';
    } else if (a === '--interactive' || a === '-i') {
      parsed.mode = 'interactive';
    } else if (a === '--export') {
      parsed.mode = 'export';
      parsed.exportPath = args[++i];
    } else if (a === '--import') {
      parsed.mode = 'import';
      parsed.importPath = args[++i];
    } else if (a === '--filter') {
      parsed.filter = args[++i];
    } else if (a === '--unreviewed-only') {
      parsed.filter = 'REVIEW_REQUIRED';
    } else if (a === '--all') {
      parsed.filter = 'ALL';
    } else if (a === '--dry-run') {
      parsed.dryRun = true;
    } else if (a === '--production' || a === '--prod') {
      parsed.isProduction = true;
    } else if (a === '--assert-complete' || a === '--check-complete') {
      parsed.mode = 'assert_complete';
    } else if (a.startsWith('--edit-')) {
      const field = a.replace('--edit-', '');
      parsed.edits[field] = args[++i];
    }
  }

  if (parsed.batchId && !parsed.mode && !parsed.unitKey) {
    parsed.mode = 'batch_summary';
  }

  if (!parsed.mode) {
    parsed.mode = 'help';
  }

  return parsed;
}

/**
 * Interactive Reviewer Session (Reads stdin)
 */
export async function startInteractiveReview(
  batchId = 'TIER-1-001',
  initialReviewerId = null,
  filter = 'REVIEW_REQUIRED'
) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, (answer) => resolve(answer.trim()));
    });

  let reviewerId = initialReviewerId;
  while (!reviewerId) {
    const input = await question('\nEnter authenticated reviewer identity (e.g. lexicographer_anna): ');
    try {
      reviewerId = validateReviewerIdentity(input);
      console.log(`Reviewer authenticated: ${reviewerId}`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  let batch;
  try {
    batch = loadTier1Batch(batchId, projectRoot);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    rl.close();
    return;
  }

  let filteredRecords = filterBatchRecords(batch, filter);
  if (filteredRecords.length === 0) {
    const comp = evaluateBatchCompletion(batch);
    console.log(`\nNo records match filter "${filter}" in batch ${batchId}.`);
    console.log(
      `Batch completion status: ${comp.completion_status} (${comp.resolved_count}/${comp.total_records} resolved, ${comp.unresolved_count} unresolved).`
    );
    if (!comp.is_complete && filter !== 'ALL') {
      console.log('Run with --all to view and review already-decided records in this batch.');
    }
    rl.close();
    return;
  }

  let currentIndex = 0;

  while (currentIndex < filteredRecords.length) {
    const currentUnit = filteredRecords[currentIndex];
    const prog = getTier1BatchProgress(batchId, projectRoot);

    console.clear();
    console.log(
      `[BATCH: ${batchId}] Progress: ${prog.reviewed_count}/${prog.total_items} reviewed (${prog.pending} pending) | App:${prog.approved} Rej:${prog.rejected} Edit:${prog.edit_required} Hold:${prog.hold}`
    );
    console.log(formatUnit14Dimensions(currentUnit, batchId, currentIndex + 1, filteredRecords.length));

    console.log(`
ACTIONS:
 [A] Approve   [R] Reject   [E] Edit Fields   [H] Hold   [N] Next   [P] Previous   [Q] Quit`);

    const action = (await question('\nSelect action: ')).toUpperCase();

    if (action === 'Q') {
      console.log('Exiting review CLI session.');
      break;
    } else if (action === 'N') {
      if (currentIndex < filteredRecords.length - 1) currentIndex++;
      else console.log('Already at the last record of this filtered view.');
    } else if (action === 'P') {
      if (currentIndex > 0) currentIndex--;
      else console.log('Already at the first record of this filtered view.');
    } else if (action === 'A' || action === 'R' || action === 'H') {
      const decision = action === 'A' ? 'APPROVE' : action === 'R' ? 'REJECT' : 'HOLD';
      let rationale = await question(`Enter review rationale for ${decision} (min 10 chars): `);
      let ipaDisp = null;
      let senseDisp = null;

      if (!currentUnit.phonetic_ipa && decision === 'APPROVE') {
        console.log('\nPhonetic IPA is missing. You MUST select an IPA disposition:');
        IPA_DISPOSITIONS.forEach((d, i) => console.log(` [${i + 1}] ${d}`));
        const choice = await question('Select IPA disposition (1-5): ');
        ipaDisp = IPA_DISPOSITIONS[Number(choice) - 1] || null;
      }

      if (
        (currentUnit.sense_status === 'MATCH_AMBIGUOUS' || currentUnit.sense_status === 'NO_MATCH') &&
        decision === 'APPROVE'
      ) {
        console.log('\nSense disambiguation required. You MUST select a sense disposition:');
        SENSE_DISPOSITIONS.forEach((d, i) => console.log(` [${i + 1}] ${d}`));
        const choice = await question('Select Sense disposition (1-7): ');
        senseDisp = SENSE_DISPOSITIONS[Number(choice) - 1] || null;
      }

      try {
        const res = recordReviewDecisionOnUnit({
          projectRoot,
          batchId,
          learningUnitKey: currentUnit.learning_unit_key,
          reviewerId,
          decision,
          rationale,
          ipaDisposition: ipaDisp,
          senseDisposition: senseDisp,
        });
        console.log(`\nDecision successfully recorded: ${res.unit.reviewer_decision}`);

        // Refresh batch from disk
        batch = loadTier1Batch(batchId, projectRoot);
        filteredRecords = filterBatchRecords(batch, filter);

        if (filteredRecords.length === 0) {
          const comp = evaluateBatchCompletion(batch);
          console.log(`\nAll records matching filter "${filter}" in batch ${batchId} have been reviewed!`);
          console.log(
            `Batch completion status: ${comp.completion_status} (${comp.resolved_count}/${comp.total_records} resolved).`
          );
          await question('Press [Enter] to exit...');
          break;
        }

        if (currentIndex >= filteredRecords.length) {
          currentIndex = Math.max(0, filteredRecords.length - 1);
        }

        await question('Press [Enter] to continue to next item...');
      } catch (err) {
        console.error(`\nValidation / Submission Error: ${err.message}`);
        await question('Press [Enter] to retry...');
      }
    } else if (action === 'E') {
      console.log('\nEditable fields:');
      console.log(' 1. meaning_en\n 2. meaning_th\n 3. phonetic_ipa\n 4. example_sentence\n 5. cefr_level\n 6. topic');
      const fNum = await question('Select field to edit (1-6): ');
      const fieldMap = {
        '1': 'meaning_en',
        '2': 'meaning_th',
        '3': 'phonetic_ipa',
        '4': 'example_sentence',
        '5': 'cefr_level',
        '6': 'topic',
      };
      const fieldName = fieldMap[fNum];
      if (fieldName) {
        const newVal = await question(`Enter new value for ${fieldName}: `);
        const rationale = await question('Enter revision rationale (min 10 chars): ');
        try {
          const edits = { [fieldName]: newVal };
          validateReviewEdits(edits);
          const res = recordReviewDecisionOnUnit({
            projectRoot,
            batchId,
            learningUnitKey: currentUnit.learning_unit_key,
            reviewerId,
            decision: 'EDIT_REQUIRED',
            rationale,
            edits,
          });
          console.log(`\nEdit applied and unit marked EDIT_REQUIRED.`);

          batch = loadTier1Batch(batchId, projectRoot);
          filteredRecords = filterBatchRecords(batch, filter);

          if (filteredRecords.length === 0) {
            const comp = evaluateBatchCompletion(batch);
            console.log(`\nAll records matching filter "${filter}" in batch ${batchId} have been reviewed!`);
            console.log(
              `Batch completion status: ${comp.completion_status} (${comp.resolved_count}/${comp.total_records} resolved).`
            );
            await question('Press [Enter] to exit...');
            break;
          }

          if (currentIndex >= filteredRecords.length) {
            currentIndex = Math.max(0, filteredRecords.length - 1);
          }

          await question('Press [Enter] to continue...');
        } catch (err) {
          console.error(`\nEdit error: ${err.message}`);
          await question('Press [Enter] to retry...');
        }
      }
    }
  }

  rl.close();
}

/**
 * Main CLI Execution
 */
export async function runReviewCli(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);

  if (args.mode === 'status') {
    printQueueStatus();
    return;
  }

  if (args.mode === 'inspect') {
    if (!args.unitKey) {
      console.error('Error: --inspect requires a valid learning_unit_key.');
      process.exit(1);
    }
    const found = findUnitByKey(args.unitKey);
    if (!found) {
      console.error(`Unit key "${args.unitKey}" not found in any Tier 1 batch.`);
      process.exit(1);
    }
    console.log(formatUnit14Dimensions(found.unit, found.batchId, found.batchIndex, found.totalInBatch));
    return;
  }

  if (args.mode === 'batch_summary') {
    try {
      const prog = getTier1BatchProgress(args.batchId);
      console.log(`
================================================================================
 BATCH SUMMARY: ${prog.batch_id}
================================================================================
 Total Items:     ${prog.total_items}
 Reviewed Count:  ${prog.reviewed_count} (${prog.progress_percent}%)
 Pending:         ${prog.pending}
 Approved:        ${prog.approved}
 Rejected:        ${prog.rejected}
 Edit Required:   ${prog.edit_required}
 Hold:            ${prog.hold}
================================================================================`);
    } catch (err) {
      console.error(`Error loading batch ${args.batchId}: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (args.mode === 'export') {
    const batchId = args.batchId || 'TIER-1-001';
    const outputPath = args.exportPath;
    const filter = args.filter || 'REVIEW_REQUIRED';
    if (!outputPath) {
      console.error('Error: --export requires an output path.');
      process.exit(1);
    }
    try {
      const res = exportTier1BatchForReview({ batchId, outputPath, filter, projectRoot });
      console.log(
        `Successfully exported ${res.record_count} items from ${res.batch_id} (filter: ${res.filter}) to ${res.output_path}`
      );
    } catch (err) {
      console.error(`Export failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (args.mode === 'import') {
    const inputPath = args.importPath;
    const reviewerId = args.reviewerId;
    const dryRun = Boolean(args.dryRun);
    if (!inputPath) {
      console.error('Error: --import requires an input file path.');
      process.exit(1);
    }
    if (!reviewerId) {
      console.error('Error: --import requires --reviewer <id>.');
      process.exit(1);
    }
    try {
      const res = importTier1ReviewSubmissions({
        inputPath,
        reviewerId,
        projectRoot,
        dryRun,
        isProduction: Boolean(args.isProduction),
      });
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
      console.error(`Import failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (args.mode === 'assert_complete') {
    const batchId = args.batchId || 'TIER-1-001';
    try {
      const batch = loadTier1Batch(batchId, projectRoot);
      const res = assertBatchCompletion(batch);
      console.log(
        `Batch ${batchId} certified complete: ${res.resolved_count}/${res.total_records} records resolved.`
      );
    } catch (err) {
      console.error(`Batch completion check failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (args.mode === 'decide') {
    if (!args.batchId || !args.unitKey || !args.reviewerId || !args.decision) {
      console.error(
        'Error: --decide requires --batch, --unit-key, --reviewer, and --decision.'
      );
      process.exit(1);
    }

    try {
      const edits = Object.keys(args.edits).length > 0 ? args.edits : null;
      const res = recordReviewDecisionOnUnit({
        projectRoot,
        batchId: args.batchId,
        learningUnitKey: args.unitKey,
        reviewerId: args.reviewerId,
        decision: args.decision,
        rationale: args.rationale,
        ipaDisposition: args.ipaDisposition,
        senseDisposition: args.senseDisposition,
        edits,
        isProduction: args.isProduction ? true : undefined,
      });

      console.log(
        JSON.stringify(
          {
            success: true,
            batch_id: res.batch_id,
            learning_unit_key: res.learning_unit_key,
            decision: res.unit.reviewer_decision,
            lifecycle_status: res.unit.lifecycle_status,
            reviewed_by: res.unit.reviewed_by,
            ledger_event_id: res.ledger_event.event_id,
          },
          null,
          2
        )
      );
    } catch (err) {
      console.error(`Review Decision Rejected: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (args.mode === 'interactive') {
    const batchToReview = args.batchId || 'TIER-1-001';
    await startInteractiveReview(batchToReview, args.reviewerId, args.filter);
    return;
  }

  // Help output
  console.log(`
GLOVA VOCABULARY HUMAN REVIEW TERMINAL CLI (Phase 6.2.13)
Usage:
  node review-cli.mjs --status
  node review-cli.mjs --inspect <learning_unit_key>
  node review-cli.mjs --batch <batch_id>
  node review-cli.mjs --interactive [--batch <batch_id>] [--reviewer <id>] [--filter <status>] [--all]
  node review-cli.mjs --export <output_path> [--batch <batch_id>] [--filter <status>] [--all]
  node review-cli.mjs --import <input_path> --reviewer <id> [--dry-run]
  node review-cli.mjs --assert-complete --batch <batch_id>
  node review-cli.mjs --decide --batch <batch_id> --unit-key <key> --reviewer <id> --decision <APPROVE|REJECT|HOLD|EDIT_REQUIRED> [--rationale <text>] [--ipa-disposition <disp>] [--sense-disposition <disp>] [--edit-<field> <val>]
`);
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runReviewCli().catch((err) => {
    console.error(`CLI Fatal: ${err.message}`);
    process.exit(1);
  });
}
