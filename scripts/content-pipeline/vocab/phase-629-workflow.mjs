import { VALID_CEFR_LEVELS, computeSha256 } from './core.mjs';

const CEFR_RANK = Object.freeze({
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
});

const CLOSED_CLASS_POS_SET = new Set([
  'preposition',
  'determiner',
  'pronoun',
  'conjunction',
  'modal_auxiliary',
  'interjection',
  'number',
  'infinitive_to',
]);

const TAXONOMIC_GLOSS_REGEX =
  /\b(?:genus|species|subspecies|family|subfamily|order|suborder|phylum|class|arthropod|mollusk|crustacean|dicot|monocot|angiosperm|gymnosperm|protozoan|Coelenterata|Chordata|Asteraceae|Fabaceae)\b/i;

/**
 * Step 3 & Step 11:
 * Examines normalized vocabulary candidates with CEFR conflicts (`CROSS_SOURCE_CEFR_CONFLICT` or
 * `INTRA_SOURCE_CEFR_CONFLICT`).
 * - When a conflict lemma has >= 2 distinct OEWN 2024 synsets (`oewn_candidate_count >= 2`),
 *   distinct senses can legitimately explain the different CEFR levels (e.g., concrete sense at A2/B1
 *   in CEFR-J vs. abstract/specialized sense at C1/C2 in Octanove). We expand the competing entry
 *   into a separate sense-level learning unit (`candidate_sense_index = 2, 3...`) in `REVIEW_REQUIRED`
 *   state while preserving full conflict provenance.
 * - When a conflict lemma is monosemous in OEWN (`oewn_candidate_count <= 1`, e.g., `abolish|verb`),
 *   there is only 1 lexical sense, so we do NOT split it into fake secondary units; it remains 1 unit
 *   classified as `CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT`.
 */
export function expandLegitimateCefrConflictSenseUnits(candidates) {
  const expanded = [];
  const conflictResolutionSummary = {
    total_conflict_groups: 0,
    monosemous_calibration_disagreements_unsplit: 0,
    polysemous_conflict_groups_split: 0,
    additional_sense_learning_units_created: 0,
  };

  for (const candidate of candidates) {
    const isConflict =
      candidate.conflict_status === 'CROSS_SOURCE_CEFR_CONFLICT' ||
      candidate.conflict_status === 'INTRA_SOURCE_CEFR_CONFLICT';

    if (!isConflict) {
      expanded.push({
        ...candidate,
        conflict_resolution_type: 'NO_CONFLICT',
      });
      continue;
    }

    conflictResolutionSummary.total_conflict_groups += 1;
    const oewnCount = candidate.oewn_candidate_count || 0;
    const competing = candidate.conflicting_entries || [];

    if (oewnCount >= 2 && competing.length > 0) {
      conflictResolutionSummary.polysemous_conflict_groups_split += 1;

      // Primary learning unit (sense_index = 1, lower CEFR level)
      const primaryUnit = structuredClone(candidate);
      primaryUnit.candidate_sense_index = 1;
      primaryUnit.conflict_resolution_type = 'CONFLICT_POLYSEMOUS_PRIMARY_SENSE_UNIT';
      expanded.push(primaryUnit);

      // Secondary learning unit(s) for distinct higher-CEFR competing entries (sense_index = 2, ...)
      competing.forEach((comp, idx) => {
        const senseIndex = idx + 2;
        const secondaryUnit = structuredClone(candidate);
        secondaryUnit.word = comp.word || candidate.word;
        secondaryUnit.raw_headword = comp.raw_headword || comp.word || candidate.raw_headword;
        secondaryUnit.cefr_level = comp.cefr_level;
        secondaryUnit.original_id = comp.original_id;
        secondaryUnit.source = comp.source;
        secondaryUnit.source_name =
          comp.source === 'octanove'
            ? 'Octanove Vocabulary Profile C1/C2'
            : 'CEFR-J Vocabulary Profile';
        secondaryUnit.source_version = comp.source_version || (comp.source === 'octanove' ? '1.0' : '1.5');
        secondaryUnit.source_license =
          comp.source_license || (comp.source === 'octanove' ? 'CC-BY-SA-4.0' : 'TUFS-CEFR-J-Permissive');
        secondaryUnit.source_note = comp.source_note || null;
        secondaryUnit.candidate_sense_index = senseIndex;
        secondaryUnit.conflict_resolution_type = 'CONFLICT_POLYSEMOUS_SECONDARY_SENSE_UNIT';
        secondaryUnit.provenance = {
          ...(candidate.provenance || {}),
          source: comp.source,
          source_name: secondaryUnit.source_name,
          source_version: secondaryUnit.source_version,
          license: secondaryUnit.source_license,
          original_id: comp.original_id,
          split_from_primary_original_id: candidate.original_id,
          split_rationale: `Polysemous lemma (${oewnCount} OEWN synsets) with distinct CEFR levels (${candidate.cefr_level} vs ${comp.cefr_level}); represented as sense:${senseIndex} pending human sense assignment.`,
        };
        expanded.push(secondaryUnit);
        conflictResolutionSummary.additional_sense_learning_units_created += 1;
      });
    } else {
      conflictResolutionSummary.monosemous_calibration_disagreements_unsplit += 1;
      const singleSenseConflict = structuredClone(candidate);
      singleSenseConflict.conflict_resolution_type = 'CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT';
      expanded.push(singleSenseConflict);
    }
  }

  return {
    learningUnitCandidates: expanded,
    conflictResolutionSummary,
  };
}

/**
 * Step 3:
 * Builds structured sense resolution metadata for a single enriched learning unit,
 * including deterministic recommendations (always marked `RECOMMENDED_NOT_APPROVED`),
 * explicit NO_MATCH sub-classification, and CEFR conflict evidence.
 */
export function buildSenseResolutionMetadata(record) {
  const status = record.sense_disambiguation_status;
  const previews = record.candidate_senses_preview || [];

  if (status === 'MATCH_CONFIDENT') {
    return {
      resolution_state: 'RESOLVED_CONFIDENT',
      requires_human_sense_selection: false,
      no_match_category: null,
      conflict_category: null,
      reason_for_ambiguity: null,
      recommended_sense: record.sense_key
        ? {
            sense_key: record.sense_key,
            synset_id: record.oewn_synset_id,
            definition: record.meaning_en,
            recommendation_type: 'DETERMINISTIC_EVIDENCE_MATCH',
            approval_state: 'SOURCE_MATCHED_PENDING_FINAL_QA',
          }
        : null,
      recommended_evidence: record.sense_disambiguation_evidence || {},
    };
  }

  if (status === 'MATCH_AMBIGUOUS') {
    // Select recommended sense based on sense_index (1 -> top frequency sense #1, 2 -> sense #2)
    const preferredIdx = Math.min(Math.max(0, (record.sense_index || 1) - 1), previews.length - 1);
    const rec = previews[preferredIdx] || previews[0] || null;

    return {
      resolution_state: 'AMBIGUOUS_QUEUE_FOR_HUMAN_SELECTION',
      requires_human_sense_selection: true,
      no_match_category: null,
      conflict_category: null,
      reason_for_ambiguity: `Lemma "${record.lemma}" (${record.part_of_speech}) has ${
        record.sense_disambiguation_evidence?.oewn_candidate_count || previews.length
      } OEWN 2024 synsets and upstream source metadata does not uniquely isolate a single synset.`,
      recommended_sense: rec
        ? {
            sense_key: rec.sense_key,
            synset_id: rec.synset_id,
            lex_domain: rec.lex_domain,
            definition: rec.definition,
            examples: rec.examples || [],
            recommendation_type: 'DETERMINISTIC_WORDNET_SENSE_RANK_RECOMMENDATION',
            approval_state: 'RECOMMENDED_NOT_APPROVED',
          }
        : null,
      recommended_evidence: {
        method: 'oewn_sense_rank_heuristic_requires_human_confirmation',
        candidate_synset_count:
          record.sense_disambiguation_evidence?.oewn_candidate_count || previews.length,
        target_cefr_level: record.cefr_level,
        sense_index: record.sense_index || 1,
      },
    };
  }

  if (status === 'NO_MATCH') {
    const isClosedClass = CLOSED_CLASS_POS_SET.has(record.part_of_speech);
    const category = isClosedClass
      ? 'CLOSED_CLASS_FUNCTION_WORD'
      : VALID_CEFR_LEVELS.includes(record.cefr_level)
        ? 'OPEN_CLASS_DERIVED_OR_COMPOUND_MISSING_IN_OEWN'
        : 'OTHER_MAPPING_FAILURE';

    return {
      resolution_state:
        category === 'CLOSED_CLASS_FUNCTION_WORD'
          ? 'REVIEW_CLOSED_CLASS_GRAMMATICAL_GLOSS'
          : 'REVIEW_OPEN_CLASS_MISSING_SYNSET',
      requires_human_sense_selection: true,
      no_match_category: category,
      conflict_category: null,
      reason_for_ambiguity:
        category === 'CLOSED_CLASS_FUNCTION_WORD'
          ? `Closed-class grammatical POS "${record.part_of_speech}" is not indexed in WordNet; requires concise functional learner gloss.`
          : `Open-class lemma "${record.lemma}" (${record.part_of_speech}) is not indexed as a separate entry in OEWN 2024; requires lexicographer definition.`,
      recommended_sense: null,
      recommended_evidence: {
        part_of_speech: record.part_of_speech,
        no_match_category: category,
      },
    };
  }

  // REVIEW_REQUIRED (CEFR conflicts)
  const conflictCat =
    record.conflict_resolution_type ||
    ((record.candidate_senses_preview || []).length >= 2
      ? 'CONFLICT_POLYSEMOUS_PRIMARY_SENSE_UNIT'
      : 'CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT');

  const preferredIdx = Math.min(Math.max(0, (record.sense_index || 1) - 1), Math.max(0, previews.length - 1));
  const rec = previews[preferredIdx] || null;

  return {
    resolution_state:
      conflictCat === 'CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT'
        ? 'REVIEW_CEFR_CALIBRATION_DISAGREEMENT'
        : 'REVIEW_POLYSEMOUS_CROSS_LEVEL_SENSE_ASSIGNMENT',
    requires_human_sense_selection: true,
    no_match_category: null,
    conflict_category: conflictCat,
    reason_for_ambiguity:
      conflictCat === 'CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT'
        ? `Monosemous OEWN lemma "${record.lemma}" has conflicting CEFR levels (${(
            record.conflicting_cefr_levels || []
          ).join(' vs ')}) across upstream sources on the same lexical sense.`
        : `Polysemous lemma "${record.lemma}" appears at multiple CEFR levels (${(
            record.conflicting_cefr_levels || []
          ).join(' vs ')}); requires assigning distinct OEWN synset for sense:${record.sense_index || 1} at ${
            record.cefr_level
          }.`,
    recommended_sense: rec
      ? {
          sense_key: rec.sense_key,
          synset_id: rec.synset_id,
          lex_domain: rec.lex_domain,
          definition: rec.definition,
          examples: rec.examples || [],
          recommendation_type:
            conflictCat === 'CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT'
              ? 'SINGLE_SENSE_AWAITING_CEFR_LEVEL_ADJUDICATION'
              : `POLYSEMOUS_SENSE_${record.sense_index || 1}_CANDIDATE_FOR_${record.cefr_level}`,
          approval_state: 'RECOMMENDED_NOT_APPROVED',
        }
      : null,
    recommended_evidence: {
      conflict_status: record.conflict_status,
      conflict_category: conflictCat,
      conflicting_cefr_levels: record.conflicting_cefr_levels || [],
      conflicting_entries: record.conflicting_entries || [],
    },
  };
}

/**
 * Step 4, 5, 7:
 * Offline draft attachment helpers for English meaning, Thai translation, and example sentences.
 * Strictly preserves provenance and marks all drafts as REVIEW_REQUIRED / AI_DRAFT so they can NEVER
 * automatically become APPROVED or ACTIVE without human review.
 */
export function applyOfflineEnglishMeaningDraft(
  record,
  {
    draftMeaningEn,
    meaning_en,
    generationMethod = 'offline_ai_draft',
    draft_source,
    sourceName = 'glova_offline_draft_assistant',
    sourceVersion = 'phase-6.2.9-v1',
  } = {}
) {
  const resolvedMeaning = draftMeaningEn ?? meaning_en;
  const resolvedSource = draft_source ?? sourceName;
  if (!resolvedMeaning || typeof resolvedMeaning !== 'string' || !resolvedMeaning.trim()) {
    throw new Error('draftMeaningEn must be a non-empty string');
  }
  const updated = structuredClone(record);
  updated.meaning_en = resolvedMeaning.trim();
  updated.meaning_source = resolvedSource;
  updated.meaning_source_version = sourceVersion;
  updated.meaning_generation_method = generationMethod;
  updated.meaning_review_status = 'AI_DRAFT';
  updated.lifecycle_status = 'REVIEW_REQUIRED';
  updated.is_active = false;
  updated.provenance = {
    ...updated.provenance,
    meaning_en_provenance: {
      status: 'AI_DRAFT_REQUIRES_HUMAN_REVIEW',
      source: resolvedSource,
      source_version: sourceVersion,
      method: generationMethod,
      review_status: 'AI_DRAFT',
    },
  };
  return updated;
}

const DUAL_LOCALE_DRAFT_SLOP_REGEX =
  /[\u0E00-\u0E7F]{2,}\s*\([A-Za-z0-9\s_\-./]{2,}\)|[A-Za-z0-9\s_\-./]{2,}\s*\([\u0E00-\u0E7F\s]{2,}\)/;

export function applyOfflineThaiTranslationDraft(
  record,
  {
    draftMeaningTh,
    meaning_th,
    translationMethod = 'offline_ai_draft_sense_bound',
    translation_method,
    translationVersion = 'phase-6.2.9-v1',
    sourceName = 'glova_offline_thai_translator',
  } = {}
) {
  const resolvedTh = draftMeaningTh ?? meaning_th;
  const resolvedMethod = translation_method ?? translationMethod;
  if (!record.meaning_en || !record.meaning_en.trim()) {
    throw new Error(
      'Cannot attach sense-specific Thai translation draft before English sense meaning (meaning_en) is present.'
    );
  }
  if (!resolvedTh || typeof resolvedTh !== 'string' || !resolvedTh.trim()) {
    throw new Error('draftMeaningTh must be a non-empty string');
  }
  if (DUAL_LOCALE_DRAFT_SLOP_REGEX.test(resolvedTh.trim())) {
    throw new Error(
      'Thai translation draft rejected: contains dual-language parenthetical slop (e.g., คำไทย (English)).'
    );
  }
  const updated = structuredClone(record);
  updated.meaning_th = resolvedTh.trim();
  updated.translation_method = resolvedMethod;
  updated.translation_version = translationVersion;
  updated.translation_review_status = 'AI_DRAFT_REVIEW_REQUIRED';
  updated.lifecycle_status = 'REVIEW_REQUIRED';
  updated.is_active = false;
  updated.provenance = {
    ...updated.provenance,
    meaning_th_provenance: {
      status: 'DERIVED_TRANSLATION_REVIEW_REQUIRED',
      source: sourceName,
      source_meaning: record.meaning_en,
      sense_key: record.sense_key || null,
      part_of_speech: record.part_of_speech,
      translation_method: resolvedMethod,
      translation_version: translationVersion,
      generated_or_translated_status: 'AI_DRAFT_OFFLINE',
    },
  };
  return updated;
}

export function applyOfflineExampleDraft(
  record,
  {
    draftExampleEn,
    example_sentence,
    draftExampleTh = null,
    example_sentence_th = null,
    generationMethod = 'offline_ai_draft',
    exampleSource = 'glova_offline_example_drafter',
    exampleVersion = 'phase-6.2.9-v1',
  } = {}
) {
  const resolvedExEn = draftExampleEn ?? example_sentence;
  const resolvedExTh = draftExampleTh ?? example_sentence_th;
  if (!resolvedExEn || typeof resolvedExEn !== 'string' || !resolvedExEn.trim()) {
    throw new Error('draftExampleEn must be a non-empty string');
  }
  const cleanEx = resolvedExEn.trim();
  const targetTokens = [record.word, record.lemma]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase().trim());
  const lowerEx = cleanEx.toLowerCase();
  if (targetTokens.length > 0 && !targetTokens.some((tok) => lowerEx.includes(tok))) {
    throw new Error(
      `Example draft rejected: sentence does not contain target word/lemma "${record.word}".`
    );
  }
  const updated = structuredClone(record);
  updated.example_sentence = cleanEx;
  if (resolvedExTh) {
    updated.example_sentence_th = resolvedExTh.trim();
  }
  updated.example_generation_method = generationMethod;
  updated.example_source = exampleSource;
  updated.example_version = exampleVersion;
  updated.example_review_status = 'AI_DRAFT_REVIEW_REQUIRED';
  updated.lifecycle_status = 'REVIEW_REQUIRED';
  updated.is_active = false;
  updated.provenance = {
    ...updated.provenance,
    example_provenance: {
      status: 'AI_DRAFT_REQUIRES_HUMAN_REVIEW',
      source: exampleSource,
      source_version: exampleVersion,
      method: generationMethod,
      is_original_generated: true,
      cefr_certified: false,
      above_level_words: [],
    },
  };
  return updated;
}

/**
 * Step 10:
 * Computes a deterministic Glova Product Prioritization score (0–100) and execution tier
 * across the 8 pedagogical & evidence dimensions.
 * Explicitly labeled as a Glova product/engineering strategy, NOT an official CEFR priority.
 */
export function computeVocabularyPriorityScore(record) {
  let score = 0;
  const breakdown = {};

  // 1. Confident sense mapping (max 30)
  if (record.sense_disambiguation_status === 'MATCH_CONFIDENT') {
    score += 30;
    breakdown.sense_confidence = 30;
  } else if (record.sense_disambiguation_status === 'MATCH_AMBIGUOUS') {
    score += 12;
    breakdown.sense_confidence = 12;
  } else if (record.sense_disambiguation_status === 'REVIEW_REQUIRED') {
    score += 8;
    breakdown.sense_confidence = 8;
  } else {
    score += 5;
    breakdown.sense_confidence = 5;
  }

  // 2. High-frequency vocabulary (max 25)
  if (record.frequency_rank !== null && record.frequency_rank > 0) {
    if (record.frequency_source === 'NGSL_1.2' && record.frequency_rank <= 1000) {
      score += 25;
      breakdown.frequency = 25;
    } else if (record.frequency_source === 'NGSL_1.2') {
      score += 20;
      breakdown.frequency = 20;
    } else {
      // NAWL, TSL, BSL
      score += 16;
      breakdown.frequency = 16;
    }
  } else {
    breakdown.frequency = 0;
  }

  // 3 & 4. A1–B2 core learner coverage & high-value C1/C2 coverage (max 15)
  const levelWeights = { A1: 15, A2: 14, B1: 12, B2: 10, C1: 9, C2: 8 };
  const lvlBonus =
    (levelWeights[record.cefr_level] || 8) +
    ((record.cefr_level === 'C1' || record.cefr_level === 'C2') && record.frequency_rank !== null
      ? 4
      : 0);
  const cappedLvlBonus = Math.min(15, lvlBonus);
  score += cappedLvlBonus;
  breakdown.cefr_learner_value = cappedLvlBonus;

  // 5. Existing verified English definition (max 12)
  if (record.meaning_en && record.meaning_review_status === 'SOURCE_VERIFIED') {
    score += 12;
    breakdown.meaning_en_ready = 12;
  } else {
    breakdown.meaning_en_ready = 0;
  }

  // 6. Existing verified example sentence (max 8)
  if (record.example_sentence && record.example_review_status === 'SOURCE_VERIFIED') {
    score += 8;
    breakdown.example_ready = 8;
  } else if (record.example_sentence) {
    score += 4;
    breakdown.example_ready = 4;
  } else {
    breakdown.example_ready = 0;
  }

  // 7. Existing verified pronunciation (max 5)
  if (record.pronunciation_review_status === 'SOURCE_VERIFIED') {
    score += 5;
    breakdown.pronunciation_ready = 5;
  } else if (record.phonetic_ipa) {
    score += 3;
    breakdown.pronunciation_ready = 3;
  } else {
    breakdown.pronunciation_ready = 0;
  }

  // 8. Complete provenance & conflict-free bonus (max 5)
  if (record.qa_checks?.provenance_ok && record.conflict_status === 'NONE') {
    score += 5;
    breakdown.provenance_clean = 5;
  } else {
    breakdown.provenance_clean = 2;
    score += 2;
  }

  // Determine execution tier
  let priorityTier = 'TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED';
  if (
    record.sense_disambiguation_status === 'MATCH_CONFIDENT' &&
    record.meaning_en &&
    record.phonetic_ipa &&
    record.pronunciation_review_status !== 'REVIEW_REQUIRED'
  ) {
    priorityTier = 'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED';
  } else if (
    record.sense_disambiguation_status === 'MATCH_AMBIGUOUS' &&
    ['A1', 'A2', 'B1', 'B2'].includes(record.cefr_level) &&
    record.frequency_rank !== null
  ) {
    priorityTier = 'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS';
  } else if (
    record.sense_disambiguation_status === 'NO_MATCH' ||
    record.sense_disambiguation_status === 'REVIEW_REQUIRED'
  ) {
    priorityTier = 'TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS';
  }

  return {
    priority_score: Math.min(100, score),
    priority_tier: priorityTier,
    priority_breakdown: breakdown,
  };
}

/**
 * Step 3, 9, 10:
 * Generates the Sense Review Queue (`vocabulary-sense-review.json`), the Human Review Queue
 * (`vocabulary-review-queue.json`), and the Prioritization Report (`vocabulary-priority-report.json`).
 */
export function generateReviewQueuesAndPriorityArtifacts(enrichedCorpus) {
  const sortedByPriority = [...enrichedCorpus].sort((a, b) => {
    const scoreDiff = (b.priority_score || 0) - (a.priority_score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    const rankA = a.frequency_rank ?? 999999;
    const rankB = b.frequency_rank ?? 999999;
    if (rankA !== rankB) return rankA - rankB;
    return a.learning_unit_key.localeCompare(b.learning_unit_key);
  });

  // 1. Sense Review Queue (all items where requires_human_sense_selection === true)
  const senseReviewItems = sortedByPriority
    .filter((item) => item.sense_resolution?.requires_human_sense_selection)
    .map((item, idx) => ({
      queue_rank: idx + 1,
      candidate_id: item.candidate_id,
      learning_unit_key: item.learning_unit_key,
      word: item.word,
      lemma: item.lemma,
      part_of_speech: item.part_of_speech,
      source_cefr: item.cefr_level,
      sense_index: item.sense_index,
      priority_score: item.priority_score,
      priority_tier: item.priority_tier,
      sense_disambiguation_status: item.sense_disambiguation_status,
      resolution_state: item.sense_resolution.resolution_state,
      no_match_category: item.sense_resolution.no_match_category,
      conflict_category: item.sense_resolution.conflict_category,
      source_information: {
        source: item.provenance?.source,
        source_name: item.provenance?.source_name,
        source_version: item.provenance?.source_version,
        original_id: item.provenance?.original_id,
        source_note: item.source_note || null,
        topic: item.topic || null,
        frequency_rank: item.frequency_rank,
        frequency_source: item.frequency_source,
      },
      candidate_senses: item.candidate_senses_preview || [],
      reason_for_ambiguity: item.sense_resolution.reason_for_ambiguity,
      recommended_sense: item.sense_resolution.recommended_sense,
      recommended_evidence: item.sense_resolution.recommended_evidence,
      reviewer_decision: null,
      reviewer_status: 'PENDING_HUMAN_REVIEW',
      review_timestamp: null,
      rejection_reason: null,
    }));

  const senseReviewArtifact = {
    artifact_type: 'vocabulary-sense-review-queue',
    phase: '6.2.9',
    version: 'phase-6.2.9-v1',
    disclaimer:
      'Deterministic recommendations are marked RECOMMENDED_NOT_APPROVED and must never be auto-promoted without human reviewer confirmation.',
    total_items_requiring_sense_review: senseReviewItems.length,
    breakdown_by_resolution_state: countBy(senseReviewItems, (x) => x.resolution_state),
    breakdown_by_no_match_category: countBy(
      senseReviewItems.filter((x) => x.no_match_category),
      (x) => x.no_match_category
    ),
    breakdown_by_conflict_category: countBy(
      senseReviewItems.filter((x) => x.conflict_category),
      (x) => x.conflict_category
    ),
    queue_items_top_500: senseReviewItems.slice(0, 500),
  };

  // 2. Unified Human Review Queue (`reports/vocabulary-review-queue.json`)
  const reviewQueueItems = sortedByPriority.map((item, idx) => {
    const fieldsRequiringReview = [];
    if (item.sense_resolution?.requires_human_sense_selection) {
      fieldsRequiringReview.push('sense_key');
    }
    if (!item.meaning_en || item.meaning_review_status !== 'SOURCE_VERIFIED') {
      fieldsRequiringReview.push('meaning_en');
    }
    if (!item.meaning_th || item.translation_review_status !== 'APPROVED') {
      fieldsRequiringReview.push('meaning_th');
    }
    if (
      !item.phonetic_ipa ||
      item.pronunciation_review_status === 'REVIEW_REQUIRED' ||
      item.pronunciation_review_status === 'UNRESOLVED'
    ) {
      fieldsRequiringReview.push('phonetic_ipa');
    }
    if (!item.example_sentence || item.example_review_status !== 'SOURCE_VERIFIED') {
      fieldsRequiringReview.push('example_sentence');
    }

    return {
      priority_rank: idx + 1,
      candidate_id: item.candidate_id,
      learning_unit_key: item.learning_unit_key,
      word: item.word,
      part_of_speech: item.part_of_speech,
      cefr_level: item.cefr_level,
      priority_score: item.priority_score,
      priority_tier: item.priority_tier,
      fields_requiring_review: fieldsRequiringReview,
      evidence_available: {
        sense_status: item.sense_disambiguation_status,
        oewn_synset_id: item.oewn_synset_id,
        recommended_sense_key: item.sense_resolution?.recommended_sense?.sense_key || null,
        has_verified_meaning_en: Boolean(item.meaning_en),
        has_verified_ipa: Boolean(
          item.phonetic_ipa &&
            item.pronunciation_review_status !== 'REVIEW_REQUIRED' &&
            item.pronunciation_review_status !== 'UNRESOLVED'
        ),
        phonetic_ipa: item.phonetic_ipa,
        pronunciation_confidence: item.pronunciation_confidence,
        has_verified_example_en: Boolean(
          item.example_sentence && item.example_review_status === 'SOURCE_VERIFIED'
        ),
        frequency_rank: item.frequency_rank,
        frequency_source: item.frequency_source,
      },
      reviewer_decision: null,
      reviewer_status: 'PENDING_HUMAN_REVIEW',
      review_timestamp: null,
      review_version: 'phase-6.2.9-v1',
      rejection_reason: null,
    };
  });

  const reviewQueueArtifact = {
    artifact_type: 'vocabulary-human-review-queue',
    phase: '6.2.9',
    version: 'phase-6.2.9-v1',
    disclaimer:
      'Priority ordering is a Glova product/content-production strategy, NOT an official CEFR or Cambridge standard.',
    total_queued_learning_units: reviewQueueItems.length,
    tier_counts: countBy(reviewQueueItems, (x) => x.priority_tier),
    workload_by_field: {
      sense_selection_required: reviewQueueItems.filter((x) =>
        x.fields_requiring_review.includes('sense_key')
      ).length,
      meaning_en_required: reviewQueueItems.filter((x) =>
        x.fields_requiring_review.includes('meaning_en')
      ).length,
      meaning_th_required: reviewQueueItems.filter((x) =>
        x.fields_requiring_review.includes('meaning_th')
      ).length,
      phonetic_ipa_required: reviewQueueItems.filter((x) =>
        x.fields_requiring_review.includes('phonetic_ipa')
      ).length,
      example_sentence_required: reviewQueueItems.filter((x) =>
        x.fields_requiring_review.includes('example_sentence')
      ).length,
    },
    executable_batch_plan: [
      {
        batch_wave: 'WAVE_1_TIER_1_FAST_TRACK',
        target_tier: 'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED',
        learning_unit_count: reviewQueueItems.filter(
          (x) => x.priority_tier === 'TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED'
        ).length,
        required_actions:
          'English sense and CMUdict IPA are already SOURCE_VERIFIED. Run offline sense-bound Thai translation + example draft where missing, then perform human SME review to promote ~2,980–3,005 units to ACTIVE.',
      },
      {
        batch_wave: 'WAVE_2_TIER_2_CORE_HIGH_FREQ_POLYSEMOUS',
        target_tier: 'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS',
        learning_unit_count: reviewQueueItems.filter(
          (x) => x.priority_tier === 'TIER_2_HIGH_VALUE_CORE_POLYSEMOUS'
        ).length,
        required_actions:
          'Confirm or override recommended OEWN synset for high-frequency A1–B2 words, unlocking verified OEWN definitions/examples, followed by Thai translation & SME review.',
      },
      {
        batch_wave: 'WAVE_3_TIER_3_ADVANCED_POLYSEMOUS',
        target_tier: 'TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED',
        learning_unit_count: reviewQueueItems.filter(
          (x) => x.priority_tier === 'TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED'
        ).length,
        required_actions:
          'Disambiguate B2–C2 polysemous senses and heteronym pronunciations, then complete Thai translation & example QA.',
      },
      {
        batch_wave: 'WAVE_4_TIER_4_SPECIALIST_ADJUDICATION',
        target_tier: 'TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS',
        learning_unit_count: reviewQueueItems.filter(
          (x) => x.priority_tier === 'TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS'
        ).length,
        required_actions:
          'Author closed-class grammatical definitions (301 items), open-class missing definitions (264 items), and adjudicate 99 CEFR conflict groups (169 units).',
      },
    ],
    priority_queue_top_500: reviewQueueItems.slice(0, 500),
  };

  // 3. Priority Report (`reports/vocabulary-priority-report.json`)
  const priorityReport = {
    report_type: 'vocabulary-priority-report',
    phase: '6.2.9',
    disclaimer:
      'This prioritization is an internal Glova product/engineering content-production strategy, NOT an official CEFR or Cambridge standard.',
    total_learning_units: reviewQueueItems.length,
    tier_distribution: countBy(reviewQueueItems, (x) => x.priority_tier),
    cefr_by_tier: buildCefrByTierMatrix(sortedByPriority),
    top_50_highest_priority_units: reviewQueueItems.slice(0, 50),
  };

  return {
    senseReviewArtifact,
    reviewQueueArtifact,
    priorityReport,
  };
}

function buildCefrByTierMatrix(items) {
  const matrix = {};
  for (const lvl of VALID_CEFR_LEVELS) {
    const sub = items.filter((x) => x.cefr_level === lvl);
    matrix[lvl] = countBy(sub, (x) => x.priority_tier);
  }
  return matrix;
}

/**
 * Step 12:
 * Sense-preserving collocation builder & QA classifier.
 * Separates CANDIDATE, REVIEW_REQUIRED, APPROVED, and ACTIVE.
 */
export function buildAndAuditPhase629Collocations(
  enrichedCorpus,
  multiWordEntries = [],
  knownLexiconSet = new Set(),
  freqLookup = new Map()
) {
  const byLemma = new Map();
  for (const c of enrichedCorpus) {
    if (!byLemma.has(c.lemma)) {
      byLemma.set(c.lemma, []);
    }
    byLemma.get(c.lemma).push(c);
  }

  const STOPWORDS = new Set([
    'a',
    'an',
    'the',
    'of',
    'in',
    'on',
    'at',
    'to',
    'for',
    'with',
    'by',
    'from',
    'up',
    'out',
    'off',
    'down',
    'over',
    'under',
    'into',
    'onto',
    'as',
    'and',
    'or',
  ]);

  const collocations = [];
  const seenKeys = new Set();

  for (const mw of multiWordEntries) {
    const phrase = String(mw.phrase ?? '').trim();
    if (!phrase || !/^[a-zA-Z][a-zA-Z\s'-]*[a-zA-Z]$/.test(phrase)) continue;

    const tokens = phrase
      .toLowerCase()
      .split(/[\s-]+/)
      .filter(Boolean);
    if (tokens.length < 2 || tokens.length > 3) continue;

    // Constituent vocabulary check: every content token must exist in our verified lexicon
    const allKnown = tokens.every((t) => STOPWORDS.has(t) || knownLexiconSet.has(t));
    if (!allKnown) continue;

    const defText = String(mw.definition || '').trim();
    const isTaxonomic = TAXONOMIC_GLOSS_REGEX.test(defText);

    for (const tok of tokens) {
      if (STOPWORDS.has(tok) || tok.length < 3) continue;
      const matches = byLemma.get(tok);
      if (!matches || matches.length === 0) continue;

      // Prefer matching POS if available; preserve sense_key when distinct senses exist
      const posMatches = matches.filter((m) => m.part_of_speech === mw.part_of_speech);
      const selectedUnits = posMatches.length > 0 ? [posMatches[0]] : [matches[0]];

      for (const unit of selectedUnits) {
        const senseTag = unit.sense_key || `sense:${unit.sense_index || 1}`;
        const dedupKey = `${unit.learning_unit_key}|${senseTag}|${mw.synset_id}|${phrase.toLowerCase()}`;
        if (seenKeys.has(dedupKey)) continue;
        seenKeys.add(dedupKey);

        const posConsistent = unit.part_of_speech === mw.part_of_speech;
        const senseResolved = Boolean(unit.sense_key && unit.sense_disambiguation_status === 'MATCH_CONFIDENT');
        const allTokensHighFreq = tokens.every(
          (t) => STOPWORDS.has(t) || (freqLookup && freqLookup.has(t))
        );

        let usefulnessScore = 50;
        if (posConsistent) usefulnessScore += 15;
        if (senseResolved) usefulnessScore += 15;
        if (allTokensHighFreq) usefulnessScore += 15;
        if (defText.length >= 10) usefulnessScore += 5;
        if (isTaxonomic) usefulnessScore -= 45;

        usefulnessScore = Math.max(0, Math.min(100, usefulnessScore));

        // Classify into CANDIDATE vs REVIEW_REQUIRED (never auto-approve simply because it came from OEWN!)
        const lifecycleStatus =
          !isTaxonomic && usefulnessScore >= 55 ? 'REVIEW_REQUIRED' : 'CANDIDATE';

        const confidenceStatus =
          senseResolved && posConsistent
            ? 'HIGH_SENSE_AND_POS_LINKED'
            : posConsistent
              ? 'MEDIUM_LEMMA_AND_POS_LINKED'
              : 'LOW_CROSS_POS_COMPOUND';

        collocations.push({
          collocation_id: `colloc_${computeSha256(dedupKey).slice(0, 16)}`,
          vocabulary_candidate_id: unit.candidate_id,
          learning_unit_key: unit.learning_unit_key,
          word: unit.word,
          lemma: unit.lemma,
          headword_part_of_speech: unit.part_of_speech,
          cefr_level: unit.cefr_level,
          sense_index: unit.sense_index,
          sense_key: unit.sense_key,
          collocation_text: phrase,
          collocation_pos: mw.part_of_speech,
          pos_consistent: posConsistent,
          lex_domain: mw.lex_domain,
          meaning_en: defText || null,
          relation_type: 'oewn_multiword_lexical_collocation',
          confidence_status: confidenceStatus,
          learner_usefulness_score: usefulnessScore,
          is_taxonomic_noise: isTaxonomic,
          lifecycle_status: lifecycleStatus,
          qa_status: isTaxonomic ? 'FILTERED_LOW_LEARNER_UTILITY' : 'PASS_STRUCTURAL_AWAITING_HUMAN_QA',
          provenance: {
            source: 'oewn_2024',
            source_name: 'Open English WordNet 2024',
            source_version: '2024',
            license: 'CC-BY-4.0',
            original_id: `oewn:2024:${mw.synset_id}:${phrase}`,
            synset_id: mw.synset_id,
            transformation_method: 'deterministic_oewn_multiword_sense_aware_link_v2',
          },
        });
      }
    }
  }

  return collocations;
}

function countBy(items, fn) {
  const out = {};
  for (const item of items) {
    const k = String(fn(item));
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}
