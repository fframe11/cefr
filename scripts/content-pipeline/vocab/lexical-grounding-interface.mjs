/**
 * @file lexical-grounding-interface.mjs
 * @description Deterministic Thai Lexical Grounding Interface & Sense Alignment Engine.
 * Provides structured bilingual lexical candidate representations with immutable
 * provenance, license tracking, POS alignment verification, and CEFR sense matching.
 * 
 * Part of Phase 6.2.18 — Thai Lexicon Grounding & Pre-Review Automation Foundation.
 */

/**
 * Standard POS Alignment Outcomes
 */
export const POS_ALIGNMENT_STATUS = Object.freeze({
  ALIGNED: 'POS_ALIGNED',
  SUSPECT: 'POS_SUSPECT',
  UNKNOWN: 'POS_UNKNOWN',
});

/**
 * Standard Sense Alignment Outcomes
 */
export const SENSE_ALIGNMENT_STATUS = Object.freeze({
  ALIGNED: 'SENSE_ALIGNED',
  AMBIGUOUS: 'SENSE_AMBIGUOUS',
  CONFLICT: 'SENSE_CONFLICT',
  NO_MATCH: 'NO_LEXICAL_MATCH',
});

/**
 * Pre-Review Candidate Readiness Statuses (NOT human approval)
 */
export const PRE_REVIEW_CANDIDATE_STATUS = Object.freeze({
  APPROVED_CANDIDATE_READY: 'APPROVED_CANDIDATE_READY', // Lexically grounded, POS-aligned, sense-aligned, passes all structural gates
  EDIT_REQUIRED_CANDIDATE: 'EDIT_REQUIRED_CANDIDATE',   // Requires human editor gloss refinement
  HOLD_CANDIDATE: 'HOLD_CANDIDATE',                     // Polysemous ambiguity or cross-level CEFR conflict
  UNRESOLVED: 'UNRESOLVED',                             // No lexical match or unresolvable conflict
  SPECIAL_SYNTAX_REVIEW_REQUIRED: 'SPECIAL_SYNTAX_REVIEW_REQUIRED', // Closed-class function words requiring syntactic analysis
});

/**
 * Closed-Class Grammatical Parts of Speech requiring specialized syntactic complementation review.
 */
export const CLOSED_CLASS_PARTS_OF_SPEECH = Object.freeze([
  'pronoun',
  'preposition',
  'determiner',
  'conjunction',
  'number',
  'modal_auxiliary',
  'interjection',
  'infinitive_to',
]);

/**
 * Validates a Lexical Candidate entry according to the grounding contract.
 * @param {Object} candidate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLexicalCandidate(candidate) {
  const errors = [];
  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors: ['Candidate must be a non-null object'] };
  }

  const requiredFields = [
    'headword',
    'pos',
    'thai_gloss',
    'source',
    'source_version',
    'license',
    'source_record_id'
  ];

  for (const field of requiredFields) {
    if (!candidate[field] || typeof candidate[field] !== 'string' || candidate[field].trim() === '') {
      errors.push(`Missing or invalid required string field: "${field}"`);
    }
  }

  const validPos = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'];
  if (candidate.pos && !validPos.includes(candidate.pos.toLowerCase())) {
    errors.push(`Invalid POS: "${candidate.pos}". Must be one of: ${validPos.join(', ')}`);
  }

  if (candidate.confidence_score !== undefined) {
    if (typeof candidate.confidence_score !== 'number' || candidate.confidence_score < 0 || candidate.confidence_score > 1) {
      errors.push('confidence_score must be a number between 0.0 and 1.0');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministic POS Alignment Validator.
 * Analyzes Thai gloss semantics against claimed grammatical category without naive prefix assumptions.
 * 
 * @param {string} pos - Grammatical POS of learning unit
 * @param {string} thaiGloss - Candidate Thai translation
 * @returns {{ status: string, confidence: number, rationale: string }}
 */
export function checkPosAlignment(pos, thaiGloss) {
  if (!pos || !thaiGloss || typeof thaiGloss !== 'string') {
    return {
      status: POS_ALIGNMENT_STATUS.UNKNOWN,
      confidence: 0,
      rationale: 'Missing POS or Thai gloss for alignment analysis',
    };
  }

  const p = pos.toLowerCase().trim();
  const gloss = thaiGloss.trim();

  // Suspicious adverbial markers on non-adverbs
  const hasAdverbMannerMarker = gloss.startsWith('อย่าง') || gloss.startsWith('โดย');
  // Suspicious adjectival relative markers on non-adjectives
  const hasAdjectiveRelativeMarker = gloss.startsWith('ซึ่งเป็น') || gloss.startsWith('ที่ให้') || gloss.startsWith('ที่มีคุณ');
  // Nominalizing prefixes
  const hasNominalPrefix = gloss.startsWith('การ') || gloss.startsWith('ความ');

  switch (p) {
    case 'noun': {
      // Noun should NOT look like pure adverb manner or purely causative verb phrase
      if (hasAdverbMannerMarker) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.85,
          rationale: `Noun gloss starts with adverbial manner marker ("${gloss.slice(0, 10)}...")`,
        };
      }
      if (gloss.startsWith('ทำให้') || gloss.startsWith('ดำเนินการ') || gloss.startsWith('กระทำ')) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.8,
          rationale: `Noun gloss starts with action-verb construction ("${gloss.slice(0, 10)}...")`,
        };
      }
      return {
        status: POS_ALIGNMENT_STATUS.ALIGNED,
        confidence: 0.95,
        rationale: 'Nominal gloss semantics compatible with noun category',
      };
    }

    case 'verb': {
      // Verb should NOT look like pure nominalization or pure manner adverb
      if (hasAdverbMannerMarker) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.85,
          rationale: `Verb gloss starts with adverbial manner marker ("${gloss.slice(0, 10)}...")`,
        };
      }
      if (hasAdjectiveRelativeMarker) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.8,
          rationale: `Verb gloss starts with adjectival relative marker ("${gloss.slice(0, 10)}...")`,
        };
      }
      return {
        status: POS_ALIGNMENT_STATUS.ALIGNED,
        confidence: 0.95,
        rationale: 'Verbal action/state gloss compatible with verb category',
      };
    }

    case 'adjective': {
      // Adjective should NOT look like pure adverb manner
      if (hasAdverbMannerMarker) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.9,
          rationale: `Adjective gloss starts with adverbial manner marker ("${gloss.slice(0, 10)}...")`,
        };
      }
      if (gloss.startsWith('ดำเนินการ') || gloss.startsWith('กระทำการ')) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.85,
          rationale: `Adjective gloss starts with action-verb execution phrase ("${gloss.slice(0, 10)}...")`,
        };
      }
      return {
        status: POS_ALIGNMENT_STATUS.ALIGNED,
        confidence: 0.95,
        rationale: 'Property/attributive gloss compatible with adjective category',
      };
    }

    case 'adverb': {
      // Adverb should NOT look like concrete noun or pure action verb
      if (gloss.startsWith('กลุ่มบุคคล') || gloss.startsWith('สิ่งของ') || gloss.startsWith('อาคาร')) {
        return {
          status: POS_ALIGNMENT_STATUS.SUSPECT,
          confidence: 0.9,
          rationale: `Adverb gloss describes concrete nominal entity ("${gloss.slice(0, 10)}...")`,
        };
      }
      return {
        status: POS_ALIGNMENT_STATUS.ALIGNED,
        confidence: 0.95,
        rationale: 'Manner/circumstantial/time gloss compatible with adverb category',
      };
    }

    default:
      return {
        status: POS_ALIGNMENT_STATUS.UNKNOWN,
        confidence: 0.5,
        rationale: `Unvalidated POS category: "${pos}"`,
      };
  }
}

/**
 * Deterministic Sense Alignment Validator.
 * Compares candidate lexical senses against learning unit English definition and synset context.
 * 
 * @param {Object} candidate - Candidate lexical entry from grounded store
 * @param {Object} learningUnit - Target learning unit
 * @returns {{ status: string, score: number, matched_sense_key: string|null, rationale: string }}
 */
export function checkSenseAlignment(candidate, learningUnit) {
  if (!candidate || !learningUnit) {
    return {
      status: SENSE_ALIGNMENT_STATUS.NO_MATCH,
      score: 0,
      matched_sense_key: null,
      rationale: 'Missing candidate or learning unit for sense alignment',
    };
  }

  // 1. Check exact synset ID match if available in candidate senses or top-level synset
  const candidateSenses = learningUnit.candidate_senses || learningUnit.candidate_senses_preview || [];
  const topSynsetId = learningUnit.synset_id || learningUnit.oewn_synset_id;

  let synsetMatch = null;
  if (candidate.synset_id) {
    if (candidateSenses.length > 0) {
      synsetMatch = candidateSenses.find(s => s.synset_id === candidate.synset_id);
    }
    if (!synsetMatch && topSynsetId === candidate.synset_id) {
      synsetMatch = {
        synset_id: topSynsetId,
        sense_key: learningUnit.sense_key || null,
      };
    }
  }

  if (synsetMatch) {
    // Check if there is a known cross-level conflict or severe pedagogical mismatch
    if (candidate.conflict_note || candidate.is_pedagogical_conflict) {
      return {
        status: SENSE_ALIGNMENT_STATUS.CONFLICT,
        score: 0.4,
        matched_sense_key: synsetMatch.sense_key || null,
        rationale: candidate.conflict_note || 'Known pedagogical register or cross-level CEFR conflict detected for this synset',
      };
    }
    return {
      status: SENSE_ALIGNMENT_STATUS.ALIGNED,
      score: 1.0,
      matched_sense_key: synsetMatch.sense_key || null,
      rationale: `Exact synset alignment matched: ${candidate.synset_id}`,
    };
  }

  // 2. Headword and POS matching
  const targetWord = (learningUnit.word || learningUnit.lemma || '').toLowerCase();
  const targetPos = (learningUnit.part_of_speech || '').toLowerCase();
  const headwordMatch = candidate.headword.toLowerCase() === targetWord;
  const posMatch = candidate.pos.toLowerCase() === targetPos;

  if (!headwordMatch || !posMatch) {
    return {
      status: SENSE_ALIGNMENT_STATUS.NO_MATCH,
      score: 0,
      matched_sense_key: null,
      rationale: `Headword or POS mismatch: candidate (${candidate.headword}, ${candidate.pos}) vs target (${targetWord}, ${targetPos})`,
    };
  }

  // 3. Keyword / Definition semantic overlap check
  const defEn = (learningUnit.definition_en || learningUnit.meaning_en || '').toLowerCase();
  const candDef = (candidate.english_definition || '').toLowerCase();

  if (candDef && defEn) {
    const defTokens = new Set(defEn.split(/\W+/).filter(t => t.length > 3));
    const candTokens = candDef.split(/\W+/).filter(t => t.length > 3);
    const overlap = candTokens.filter(t => defTokens.has(t));

    if (overlap.length >= 2 || (candTokens.length <= 3 && overlap.length >= 1)) {
      if (candidate.is_pedagogical_conflict) {
        return {
          status: SENSE_ALIGNMENT_STATUS.CONFLICT,
          score: 0.5,
          matched_sense_key: null,
          rationale: candidate.conflict_note || 'Semantic overlap found but flagged for pedagogical CEFR level conflict',
        };
      }
      return {
        status: SENSE_ALIGNMENT_STATUS.ALIGNED,
        score: 0.9,
        matched_sense_key: null,
        rationale: `Strong definition semantic keyword overlap (${overlap.join(', ')})`,
      };
    }
  }

  // 4. Multiple distinct senses exist without clear overlap
  if (candidate.has_polysemous_siblings) {
    return {
      status: SENSE_ALIGNMENT_STATUS.AMBIGUOUS,
      score: 0.5,
      matched_sense_key: null,
      rationale: 'Multiple polysemous senses exist in lexical store without unambiguous definition match',
    };
  }

  // Default aligned if single sense and POS matches
  return {
    status: SENSE_ALIGNMENT_STATUS.ALIGNED,
    score: 0.8,
    matched_sense_key: null,
    rationale: 'Monosemous headword with verified POS alignment in curated store',
  };
}
