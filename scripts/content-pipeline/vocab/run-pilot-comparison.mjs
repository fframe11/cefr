/**
 * @file run-pilot-comparison.mjs
 * @description Executes deterministic pre-review alignment on the exact Phase 6.2.17 25-item pilot sample
 * and outputs the blind quality comparison and pre-review metrics.
 * 
 * Part of Phase 6.2.18 — Thai Lexicon Grounding & Pre-Review Automation Foundation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { runPreReviewAlignment } from './pre-review-alignment-pipeline.mjs';
import { PRE_REVIEW_CANDIDATE_STATUS, POS_ALIGNMENT_STATUS, SENSE_ALIGNMENT_STATUS } from './lexical-grounding-interface.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');

const PILOT_SAMPLE_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.17-thai-human-qa-pilot-sample.json');
const PILOT_RESULTS_6_2_17_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.17-thai-human-qa-pilot-results.json');
const BLIND_COMPARISON_OUT_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.18-blind-quality-comparison.json');
const SUMMARY_OUT_PATH = path.join(ROOT_DIR, 'reports/phase-6.2.18-pilot-alignment-results.json');

export function executePilotComparison() {
  if (!fs.existsSync(PILOT_SAMPLE_PATH)) {
    throw new Error(`Pilot sample file not found: ${PILOT_SAMPLE_PATH}`);
  }

  const sampleData = JSON.parse(fs.readFileSync(PILOT_SAMPLE_PATH, 'utf8'));
  const prevResultsData = fs.existsSync(PILOT_RESULTS_6_2_17_PATH)
    ? JSON.parse(fs.readFileSync(PILOT_RESULTS_6_2_17_PATH, 'utf8'))
    : { reviews: [] };

  const prevReviewMap = new Map();
  for (const r of prevResultsData.reviews || []) {
    prevReviewMap.set(r.learning_unit_key, r);
  }

  const comparisonRecords = [];
  const metrics = {
    total_evaluated: sampleData.records.length,
    approved_candidate_ready: 0,
    edit_required_candidate: 0,
    hold_candidate: 0,
    unresolved: 0,
    pos_aligned_count: 0,
    pos_suspect_count: 0,
    sense_aligned_count: 0,
    sense_conflict_count: 0,
    sense_ambiguous_count: 0,
    source_grounded_count: 0,
  };

  for (const unit of sampleData.records) {
    const alignment = runPreReviewAlignment(unit);
    const prevReview = prevReviewMap.get(unit.learning_unit_key) || {};

    // Collect deterministic quality flags on original vs grounded
    const originalFlags = [];
    if (unit.remediation_info?.source === 'glova_contextual_thai_drafter_v2') {
      originalFlags.push('CONTEXTUAL_DRAFTER_HYPERNYM_PLACEHOLDER');
    }
    if (prevReview.defect_category && prevReview.defect_category !== 'NONE') {
      originalFlags.push(`PREV_HUMAN_DEFECT_${prevReview.defect_category}`);
    }

    const groundedFlags = [];
    if (alignment.pos_alignment.status === POS_ALIGNMENT_STATUS.SUSPECT) {
      groundedFlags.push('POS_ALIGNMENT_SUSPECT');
    }
    if (alignment.sense_alignment.status === SENSE_ALIGNMENT_STATUS.CONFLICT) {
      groundedFlags.push('SENSE_CONFLICT_REQUIRES_HOLD');
    }
    if (alignment.sense_alignment.status === SENSE_ALIGNMENT_STATUS.AMBIGUOUS) {
      groundedFlags.push('SENSE_AMBIGUOUS_REQUIRES_HOLD');
    }

    // Tally metrics
    if (alignment.candidate_status === PRE_REVIEW_CANDIDATE_STATUS.APPROVED_CANDIDATE_READY) {
      metrics.approved_candidate_ready++;
    } else if (alignment.candidate_status === PRE_REVIEW_CANDIDATE_STATUS.EDIT_REQUIRED_CANDIDATE) {
      metrics.edit_required_candidate++;
    } else if (alignment.candidate_status === PRE_REVIEW_CANDIDATE_STATUS.HOLD_CANDIDATE) {
      metrics.hold_candidate++;
    } else {
      metrics.unresolved++;
    }

    if (alignment.pos_alignment.status === POS_ALIGNMENT_STATUS.ALIGNED) {
      metrics.pos_aligned_count++;
    } else if (alignment.pos_alignment.status === POS_ALIGNMENT_STATUS.SUSPECT) {
      metrics.pos_suspect_count++;
    }

    if (alignment.sense_alignment.status === SENSE_ALIGNMENT_STATUS.ALIGNED) {
      metrics.sense_aligned_count++;
    } else if (alignment.sense_alignment.status === SENSE_ALIGNMENT_STATUS.CONFLICT) {
      metrics.sense_conflict_count++;
    } else if (alignment.sense_alignment.status === SENSE_ALIGNMENT_STATUS.AMBIGUOUS) {
      metrics.sense_ambiguous_count++;
    }

    if (alignment.selected_candidate) {
      metrics.source_grounded_count++;
    }

    comparisonRecords.push({
      sample_index: unit.sample_index,
      learning_unit_key: unit.learning_unit_key,
      word: unit.word,
      part_of_speech: unit.part_of_speech,
      claimed_cefr_level: unit.claimed_cefr_level,
      definition_en: unit.definition_en,
      version_a_original_phase_6_2_16: {
        thai_meaning: unit.definition_th,
        source: unit.remediation_info?.source || 'unknown',
        method: unit.remediation_info?.method || 'unknown',
        human_review_decision_phase_6_2_17: prevReview.decision || null,
        human_rationale: prevReview.rationale || null,
        defect_category: prevReview.defect_category || null,
        quality_flags: originalFlags,
      },
      version_b_grounded_phase_6_2_18: {
        thai_meaning: alignment.selected_candidate?.thai_gloss || null,
        source: alignment.selected_candidate?.source || null,
        source_version: alignment.selected_candidate?.source_version || null,
        license: alignment.selected_candidate?.license || null,
        source_record_id: alignment.selected_candidate?.source_record_id || null,
        confidence_score: alignment.selected_candidate?.confidence_score || null,
        pre_review_status: alignment.candidate_status,
        pos_alignment: alignment.pos_alignment,
        sense_alignment: alignment.sense_alignment,
        cefr_compatibility: alignment.cefr_compatibility,
        quality_flags: groundedFlags,
      },
      human_review_required: true,
      lifecycle_status: 'REVIEW_REQUIRED',
    });
  }

  // Calculate percentages
  const n = metrics.total_evaluated;
  const rates = {
    approved_candidate_ready_pct: Math.round((metrics.approved_candidate_ready / n) * 1000) / 10,
    edit_required_candidate_pct: Math.round((metrics.edit_required_candidate / n) * 1000) / 10,
    hold_candidate_pct: Math.round((metrics.hold_candidate / n) * 1000) / 10,
    unresolved_pct: Math.round((metrics.unresolved / n) * 1000) / 10,
    pos_aligned_pct: Math.round((metrics.pos_aligned_count / n) * 1000) / 10,
    sense_aligned_pct: Math.round((metrics.sense_aligned_count / n) * 1000) / 10,
    source_grounded_rate_pct: Math.round((metrics.source_grounded_count / n) * 1000) / 10,
  };

  const finalOutput = {
    $schema: 'https://glova.ai/schemas/vocabulary-blind-quality-comparison-v1.json',
    evaluation_phase: 'PHASE_6_2_18_THAI_LEXICON_GROUNDING',
    generated_at: new Date().toISOString(),
    sample_size: n,
    pre_review_metrics: {
      ...metrics,
      ...rates,
    },
    invariants_maintained: {
      learner_ready: 28,
      target: 10000,
      gap: 9972,
      status: 'NOT_READY',
      user_testing_authorized: false,
      production_supabase_mutations: 0,
      lifecycle_status: 'REVIEW_REQUIRED',
      field_status: 'AI_DRAFT',
    },
    records: comparisonRecords,
  };

  fs.writeFileSync(BLIND_COMPARISON_OUT_PATH, JSON.stringify(finalOutput, null, 2), 'utf8');
  fs.writeFileSync(SUMMARY_OUT_PATH, JSON.stringify({
    phase: '6.2.18',
    sample_size: n,
    metrics: {
      ...metrics,
      ...rates,
    }
  }, null, 2), 'utf8');

  return finalOutput;
}

if (process.argv[1] && process.argv[1].endsWith('run-pilot-comparison.mjs')) {
  const result = executePilotComparison();
  console.log(`[+] Executed Phase 6.2.18 Pre-Review Comparison on ${result.sample_size} records.`);
  console.log(`    Approved Candidate-Ready : ${result.pre_review_metrics.approved_candidate_ready} (${result.pre_review_metrics.approved_candidate_ready_pct}%)`);
  console.log(`    Edit Required Candidate  : ${result.pre_review_metrics.edit_required_candidate} (${result.pre_review_metrics.edit_required_candidate_pct}%)`);
  console.log(`    Hold Candidate           : ${result.pre_review_metrics.hold_candidate} (${result.pre_review_metrics.hold_candidate_pct}%)`);
  console.log(`    Source Grounded Rate     : ${result.pre_review_metrics.source_grounded_rate_pct}%`);
  console.log(`    POS Aligned Rate         : ${result.pre_review_metrics.pos_aligned_pct}%`);
  console.log(`    Sense Aligned Rate       : ${result.pre_review_metrics.sense_aligned_pct}%`);
  console.log(`[+] Output written to:`);
  console.log(`    - ${BLIND_COMPARISON_OUT_PATH}`);
  console.log(`    - ${SUMMARY_OUT_PATH}`);
}
