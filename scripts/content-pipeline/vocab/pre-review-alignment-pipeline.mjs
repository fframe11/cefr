/**
 * @file pre-review-alignment-pipeline.mjs
 * @description Pre-Review Alignment Pipeline for Thai Vocabulary Learning Units.
 * Executes normalization, deterministic POS alignment, sense alignment, CEFR compatibility
 * checks, and Thai structural quality gates before human review.
 * 
 * Part of Phase 6.2.18 — Thai Lexicon Grounding & Pre-Review Automation Foundation.
 */

import {
  checkPosAlignment,
  checkSenseAlignment,
  POS_ALIGNMENT_STATUS,
  SENSE_ALIGNMENT_STATUS,
  PRE_REVIEW_CANDIDATE_STATUS,
  CLOSED_CLASS_PARTS_OF_SPEECH,
} from './lexical-grounding-interface.mjs';

import {
  getLexicalCandidates,
  getLexicalBySynsetId
} from './grounded-lexicon-store.mjs';

import { validateThaiMeaningQuality } from './enrichment-quality-gates.mjs';

/**
 * Checks CEFR compatibility between learning unit target and candidate sense register.
 * @param {string} unitCefr
 * @param {string} candidateCefr
 * @returns {{ compatible: boolean, note: string }}
 */
export function checkCefrCompatibility(unitCefr, candidateCefr) {
  if (!unitCefr || !candidateCefr) {
    return { compatible: true, note: 'No CEFR constraints specified on candidate' };
  }

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const uIdx = levels.indexOf(unitCefr.toUpperCase());
  const cIdx = levels.indexOf(candidateCefr.toUpperCase());

  if (uIdx === -1 || cIdx === -1) {
    return { compatible: true, note: 'Non-standard CEFR level string' };
  }

  // A difference of > 1 CEFR band indicates high risk of pedagogical register mismatch
  const diff = Math.abs(uIdx - cIdx);
  if (diff > 1) {
    return {
      compatible: false,
      note: `Potential CEFR mismatch: learning unit target is ${unitCefr}, but candidate sense is typically registered at ${candidateCefr} (gap: ${diff} bands)`,
    };
  }

  return {
    compatible: true,
    note: `CEFR compatible: ${unitCefr} matches candidate register ${candidateCefr}`,
  };
}

/**
 * Runs the deterministic Pre-Review Alignment Pipeline on a single learning unit.
 * 
 * Pipeline flow:
 * 1. Retrieve candidate lexical entries (exact synset or headword+POS)
 * 2. Normalize headword and text
 * 3. Perform deterministic POS alignment check
 * 4. Perform deterministic Sense alignment check
 * 5. Check CEFR level compatibility
 * 6. Execute Thai structural quality gates
 * 7. Candidate ranking and selection
 * 8. Return structured pre-review package (enforcing REVIEW_REQUIRED)
 * 
 * @param {Object} unit - Target learning unit
 * @param {Object} [options] - Optional pipeline configuration
 * @param {Function} [options.candidateResolver] - Optional resolver function for expanded lexical stores
 * @param {Array} [options.extraCandidates] - Optional additional candidates array
 * @param {boolean} [options.classifyClosedClass=false] - Whether to isolate closed-class words as SPECIAL_SYNTAX_REVIEW_REQUIRED
 * @returns {Object} Pre-review evaluation result
 */
export function runPreReviewAlignment(unit, options = {}) {
  if (!unit || typeof unit !== 'object') {
    throw new Error('runPreReviewAlignment requires a valid learning unit object');
  }

  const word = (unit.word || unit.lemma || '').trim().toLowerCase();
  const pos = (unit.part_of_speech || '').trim().toLowerCase();
  const unitCefr = (unit.claimed_cefr_level || unit.cefr_level || '').trim().toUpperCase();

  // 1. Retrieve Candidates from Grounded Store
  let candidates = [];
  
  // Try candidate senses synset match first
  const unitCandidateSenses = unit.candidate_senses || unit.candidate_senses_preview || [];
  for (const s of unitCandidateSenses) {
    if (s.synset_id) {
      const match = getLexicalBySynsetId(s.synset_id);
      if (match && !candidates.some(c => c.source_record_id === match.source_record_id)) {
        candidates.push(match);
      }
    }
  }

  // Also check top-level synset_id or oewn_synset_id
  const topSynsetId = unit.synset_id || unit.oewn_synset_id;
  if (topSynsetId) {
    const match = getLexicalBySynsetId(topSynsetId);
    if (match && !candidates.some(c => c.source_record_id === match.source_record_id)) {
      candidates.push(match);
    }
  }

  // Also query by headword and POS
  const hpCandidates = getLexicalCandidates(word, pos);
  for (const c of hpCandidates) {
    if (!candidates.some(existing => existing.source_record_id === c.source_record_id)) {
      candidates.push(c);
    }
  }

  // Check optional extra candidate resolver or array
  if (options.candidateResolver && typeof options.candidateResolver === 'function') {
    const resolved = options.candidateResolver(word, pos, topSynsetId);
    if (Array.isArray(resolved)) {
      for (const r of resolved) {
        if (!candidates.some(existing => existing.source_record_id === r.source_record_id)) {
          candidates.push(r);
        }
      }
    }
  }

  if (Array.isArray(options.extraCandidates)) {
    for (const ec of options.extraCandidates) {
      if (ec.headword.toLowerCase() === word && ec.pos.toLowerCase() === pos) {
        if (!candidates.some(existing => existing.source_record_id === ec.source_record_id)) {
          candidates.push(ec);
        }
      }
    }
  }

  // Case A: No Lexical Match in Grounded Store
  if (candidates.length === 0) {
    const isClosedClass = Boolean(options.classifyClosedClass && CLOSED_CLASS_PARTS_OF_SPEECH.includes(pos));
    const status = isClosedClass
      ? PRE_REVIEW_CANDIDATE_STATUS.SPECIAL_SYNTAX_REVIEW_REQUIRED
      : PRE_REVIEW_CANDIDATE_STATUS.UNRESOLVED;
    const rationale = isClosedClass
      ? 'Closed-class function word requires specialized syntactic complementation review rather than isolated lexical translation'
      : 'Headword not found in grounded lexical store';

    return {
      learning_unit_key: unit.learning_unit_key || `${word}|${pos}|${unitCefr}`,
      word,
      part_of_speech: pos,
      claimed_cefr_level: unitCefr,
      selected_candidate: null,
      candidate_status: status,
      pos_alignment: {
        status: POS_ALIGNMENT_STATUS.UNKNOWN,
        confidence: 0,
        rationale: isClosedClass ? 'Closed-class function word requiring syntactic analysis' : 'No candidate available to test POS alignment'
      },
      sense_alignment: {
        status: SENSE_ALIGNMENT_STATUS.NO_MATCH,
        score: 0,
        matched_sense_key: null,
        rationale
      },
      cefr_compatibility: { compatible: false, note: isClosedClass ? 'Special syntax review' : 'No candidate' },
      structural_gate_passed: false,
      structural_gate_issues: [isClosedClass ? 'SPECIAL_SYNTAX_REVIEW_REQUIRED' : 'NO_LEXICAL_MATCH'],
      field_status: 'AI_DRAFT',
      lifecycle_status: 'REVIEW_REQUIRED',
      human_review_required: true,
      reviewer_decision: null,
    };
  }

  // Evaluate each candidate
  const evaluatedCandidates = candidates.map(candidate => {
    const posResult = checkPosAlignment(pos, candidate.thai_gloss);
    const senseResult = checkSenseAlignment(candidate, unit);
    const cefrResult = checkCefrCompatibility(unitCefr, candidate.target_cefr);
    const structuralResult = validateThaiMeaningQuality(candidate.thai_gloss);

    // Compute composite rank score
    let compositeScore = 0;
    if (posResult.status === POS_ALIGNMENT_STATUS.ALIGNED) compositeScore += 30;
    if (senseResult.status === SENSE_ALIGNMENT_STATUS.ALIGNED) compositeScore += 40;
    else if (senseResult.status === SENSE_ALIGNMENT_STATUS.AMBIGUOUS) compositeScore += 15;
    if (cefrResult.compatible) compositeScore += 15;
    const structuralValid = structuralResult.isValid ?? structuralResult.passed ?? false;
    if (structuralValid) compositeScore += 15;
    if (candidate.confidence_score) compositeScore += (candidate.confidence_score * 10);

    return {
      candidate,
      posResult,
      senseResult,
      cefrResult,
      structuralResult: {
        passed: structuralValid,
        issues: structuralResult.issues || [],
      },
      compositeScore,
    };
  });

  // Sort candidates by composite score descending
  evaluatedCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

  const best = evaluatedCandidates[0];
  const cand = best.candidate;

  // Determine overall pre-review candidate status
  let candidate_status = PRE_REVIEW_CANDIDATE_STATUS.EDIT_REQUIRED_CANDIDATE;

  if (best.senseResult.status === SENSE_ALIGNMENT_STATUS.CONFLICT || cand.is_pedagogical_conflict) {
    candidate_status = PRE_REVIEW_CANDIDATE_STATUS.HOLD_CANDIDATE;
  } else if (best.senseResult.status === SENSE_ALIGNMENT_STATUS.AMBIGUOUS) {
    candidate_status = PRE_REVIEW_CANDIDATE_STATUS.HOLD_CANDIDATE;
  } else if (
    best.posResult.status === POS_ALIGNMENT_STATUS.ALIGNED &&
    best.senseResult.status === SENSE_ALIGNMENT_STATUS.ALIGNED &&
    best.structuralResult.passed &&
    best.cefrResult.compatible
  ) {
    candidate_status = PRE_REVIEW_CANDIDATE_STATUS.APPROVED_CANDIDATE_READY;
  } else if (best.posResult.status === POS_ALIGNMENT_STATUS.SUSPECT) {
    candidate_status = PRE_REVIEW_CANDIDATE_STATUS.EDIT_REQUIRED_CANDIDATE;
  }

  return {
    learning_unit_key: unit.learning_unit_key || `${word}|${pos}|${unitCefr}`,
    word,
    part_of_speech: pos,
    claimed_cefr_level: unitCefr,
    selected_candidate: {
      headword: cand.headword,
      pos: cand.pos,
      thai_gloss: cand.thai_gloss,
      english_definition: cand.english_definition,
      synset_id: cand.synset_id || null,
      source: cand.source,
      source_version: cand.source_version,
      license: cand.license,
      source_record_id: cand.source_record_id,
      confidence_score: cand.confidence_score,
      target_cefr: cand.target_cefr,
    },
    candidate_status,
    pos_alignment: best.posResult,
    sense_alignment: best.senseResult,
    cefr_compatibility: best.cefrResult,
    structural_gate_passed: best.structuralResult.passed,
    structural_gate_issues: best.structuralResult.issues || [],
    provenance: {
      source: cand.source,
      version: cand.source_version,
      license: cand.license,
      record_id: cand.source_record_id,
    },
    // INVARIANT ENFORCEMENT: Never auto-approve or auto-activate
    field_status: 'AI_DRAFT',
    lifecycle_status: 'REVIEW_REQUIRED',
    human_review_required: true,
    reviewer_decision: null,
  };
}
