import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  arpabetToIpa,
  loadCmudictSubset,
  resolveCmudictPronunciation,
} from '../scripts/content-pipeline/vocab/cmudict-ipa.mjs';
import {
  auditEnrichedVocabularyRecord,
  buildScalableCollocationCandidates,
  disambiguateVocabularySense,
  enrichVocabularyCandidate,
  evaluateLargeVocabularyReadiness,
  findAboveLevelWordsInSentence,
  transitionVocabularyLifecycle,
  verifyPilot180Integrity,
} from '../scripts/content-pipeline/vocab/enrichment-core.mjs';
import {
  applyOfflineEnglishMeaningDraft,
  applyOfflineExampleDraft,
  applyOfflineThaiTranslationDraft,
  buildAndAuditPhase629Collocations,
  buildSenseResolutionMetadata,
  computeVocabularyPriorityScore,
  expandLegitimateCefrConflictSenseUnits,
  generateReviewQueuesAndPriorityArtifacts,
} from '../scripts/content-pipeline/vocab/phase-629-workflow.mjs';
import {
  buildCefrDistributionReport,
  runBatchEnrichment,
} from '../scripts/content-pipeline/vocab/enrich-pipeline.mjs';
import {
  applyLearnerEnrichmentToUnit,
  evaluateSevenDimensionUnitQa,
  loadExistingActiveCuratedVocabulary,
} from '../scripts/content-pipeline/vocab/large-production-pipeline.mjs';
import {
  draftSenseSpecificThaiMeaning,
  resolveOrDraftEnglishMeaning,
  resolveOrDraftLearnerExample,
} from '../scripts/content-pipeline/vocab/thai-sense-drafter.mjs';

const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.8 & Phase 6.2.9 — Vocabulary Enrichment, CMUdict IPA, Sense/Conflict Resolution & Human-QA Production Pipeline', () => {
  it('verifies Pilot 180 batch integrity (30 per CEFR level A1–C2, 0 duplicates, 100% provenance)', () => {
    const pilotPath = path.join(
      projectRoot,
      'scripts/content-pipeline/output/vocabulary-pilot-batch.json'
    );
    const pilotItems = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));

    const audit = verifyPilot180Integrity(pilotItems);
    expect(audit.valid).toBe(true);
    expect(audit.total_count).toBe(180);
    expect(audit.thirty_per_level).toBe(true);
    expect(audit.duplicate_keys).toHaveLength(0);
    expect(audit.invalid_cefr_or_pos).toHaveLength(0);
    expect(audit.missing_provenance).toHaveLength(0);
    expect(audit.level_counts).toEqual({
      A1: 30,
      A2: 30,
      B1: 30,
      B2: 30,
      C1: 30,
      C2: 30,
    });
  });

  it('produces deterministic, idempotent enrichment output with distinct word_entry_key and learning_unit_key', () => {
    const synsetMap = new Map([
      [
        '05820620-n',
        {
          synset_id: '05820620-n',
          part_of_speech: 'noun',
          lex_domain: 'noun.cognition',
          words: ['abandonment', 'desertion'],
          definition: 'the act of giving something up',
          examples: ['his abandonment of his wife and children left them penniless'],
          antonym_synset_ids: [],
        },
      ],
    ]);

    const candidate = {
      word: 'abandonment',
      lemma: 'abandonment',
      raw_headword: 'abandonment',
      orthographic_variants: ['abandonment'],
      part_of_speech: 'noun',
      cefr_level: 'C1',
      sense_key: 'abandonment%1:04:00::',
      oewn_synset_id: '05820620-n',
      oewn_match_status: 'matched',
      oewn_candidate_count: 1,
      conflict_status: 'NONE',
      frequency_rank: 2410,
      frequency_source: 'NGSL_1.2',
      provenance: {
        source: 'octanove',
        source_name: 'Octanove Vocabulary Profile C1/C2',
        source_version: '1.0',
        source_url: 'https://github.com/openlanguageprofiles/olp-en-cefrj',
        license: 'CC-BY-SA-4.0',
        original_id: 'octanove:v1.0:line:2',
        transformation_method: 'unicode_nfc+trim_whitespace+lowercase_lemma',
      },
    };

    const run1 = enrichVocabularyCandidate(candidate, { synsetMap });
    const run2 = enrichVocabularyCandidate(candidate, { synsetMap });

    expect(run1).toEqual(run2);
    expect(run1.word_entry_key).toBe('abandonment|noun');
    expect(run1.learning_unit_key).toBe('abandonment|noun|C1|sense:1');
    expect(run1.sense_disambiguation_status).toBe('MATCH_CONFIDENT');
    expect(run1.meaning_en).toBe('the act of giving something up');
    expect(run1.meaning_review_status).toBe('SOURCE_VERIFIED');
    expect(run1.example_sentence).toBe(
      'his abandonment of his wife and children left them penniless'
    );
    expect(run1.example_review_status).toBe('SOURCE_VERIFIED');
    expect(run1.synonyms).toEqual(['desertion']);
    expect(run1.meaning_th).toBeNull();
    expect(run1.phonetic_ipa).toBeNull();
    expect(run1.lifecycle_status).toBe('REVIEW_REQUIRED');
    expect(run1.is_active).toBe(false);
    expect(run1.qa_status).toBe('REVIEW_REQUIRED');
  });

  it('classifies sense disambiguation accurately across MATCH_CONFIDENT, MATCH_AMBIGUOUS, NO_MATCH, and REVIEW_REQUIRED', () => {
    const synsetMap = new Map([
      [
        '15236877-n',
        {
          synset_id: '15236877-n',
          part_of_speech: 'noun',
          lex_domain: 'noun.time',
          words: ['March', 'Mar'],
          definition: 'the month following February and preceding April',
          examples: [],
          antonym_synset_ids: [],
        },
      ],
      [
        '00293575-n',
        {
          synset_id: '00293575-n',
          part_of_speech: 'noun',
          lex_domain: 'noun.act',
          words: ['march', 'marching'],
          definition: 'the act of marching; walking with regular steps',
          examples: [],
          antonym_synset_ids: [],
        },
      ],
    ]);

    const oewnLookup = new Map([
      [
        'march|noun',
        [
          { sense_key: 'march%1:28:00::', synset_id: '15236877-n', sense_number: 1 },
          { sense_key: 'march%1:04:00::', synset_id: '00293575-n', sense_number: 2 },
        ],
      ],
    ]);

    // 1. Capitalized month noun "March" -> MATCH_CONFIDENT via CAPITALIZED_TIME_NOUN_UNIQUE_SYNSET
    const marchMonth = disambiguateVocabularySense(
      {
        word: 'March',
        lemma: 'march',
        raw_headword: 'March',
        is_capitalized_headword: true,
        part_of_speech: 'noun',
        cefr_level: 'A1',
        oewn_match_status: 'ambiguous',
        conflict_status: 'NONE',
      },
      oewnLookup,
      synsetMap
    );
    expect(marchMonth.status).toBe('MATCH_CONFIDENT');
    expect(marchMonth.rule).toBe('CAPITALIZED_TIME_NOUN_UNIQUE_SYNSET');
    expect(marchMonth.oewn_synset_id).toBe('15236877-n');

    // 2. Uncapitalized polysemous "march" without source note/topic -> MATCH_AMBIGUOUS
    const marchAmbiguous = disambiguateVocabularySense(
      {
        word: 'march',
        lemma: 'march',
        raw_headword: 'march',
        is_capitalized_headword: false,
        part_of_speech: 'noun',
        cefr_level: 'B1',
        oewn_match_status: 'ambiguous',
        conflict_status: 'NONE',
      },
      oewnLookup,
      synsetMap
    );
    expect(marchAmbiguous.status).toBe('MATCH_AMBIGUOUS');
    expect(marchAmbiguous.candidate_senses_preview).toHaveLength(2);

    // 3. Closed-class preposition -> NO_MATCH
    const closedPos = disambiguateVocabularySense(
      {
        word: 'about',
        lemma: 'about',
        part_of_speech: 'preposition',
        cefr_level: 'A1',
        oewn_match_status: 'not_attempted',
        conflict_status: 'NONE',
      },
      oewnLookup,
      synsetMap
    );
    expect(closedPos.status).toBe('NO_MATCH');
    expect(closedPos.rule).toBe('CLOSED_CLASS_GRAMMATICAL_POS_NO_WORDNET_SYNSET');

    // 4. Cross-source CEFR conflict -> REVIEW_REQUIRED
    const conflictCandidate = disambiguateVocabularySense(
      {
        word: 'drive',
        lemma: 'drive',
        part_of_speech: 'noun',
        cefr_level: 'A2',
        oewn_match_status: 'ambiguous',
        conflict_status: 'CROSS_SOURCE_CEFR_CONFLICT',
        conflicting_cefr_levels: ['A2', 'C2'],
      },
      oewnLookup,
      synsetMap
    );
    expect(conflictCandidate.status).toBe('REVIEW_REQUIRED');
    expect(conflictCandidate.rule).toBe('UNRESOLVED_CEFR_CONFLICT_REQUIRES_HUMAN_REVIEW');
  });

  it('splits polysemous CEFR conflicts with >= 2 OEWN synsets into distinct sense learning units while keeping monosemous conflicts unsplit (Step 3B)', () => {
    const candidates = [
      // Polysemous conflict: drive|noun (A2 in CEFR-J, C2 in Octanove, 12 OEWN synsets)
      {
        word: 'drive',
        lemma: 'drive',
        raw_headword: 'drive',
        part_of_speech: 'noun',
        cefr_level: 'A2',
        oewn_candidate_count: 12,
        conflict_status: 'CROSS_SOURCE_CEFR_CONFLICT',
        conflicting_cefr_levels: ['A2', 'C2'],
        original_id: 'cefr_j:v1.5:line:1900',
        conflicting_entries: [
          {
            source: 'octanove',
            original_id: 'octanove:v1.0:line:512',
            word: 'drive',
            cefr_level: 'C2',
          },
        ],
        provenance: {
          source: 'cefr_j',
          source_name: 'CEFR-J Vocabulary Profile',
          source_version: '1.5',
          license: 'TUFS-CEFR-J-Permissive',
          original_id: 'cefr_j:v1.5:line:1900',
          transformation_method: 'deterministic_ingest',
        },
      },
      // Monosemous conflict: fortnight|noun (1 OEWN synset) -> must NOT split artificially
      {
        word: 'fortnight',
        lemma: 'fortnight',
        raw_headword: 'fortnight',
        part_of_speech: 'noun',
        cefr_level: 'B1',
        oewn_candidate_count: 1,
        conflict_status: 'CROSS_SOURCE_CEFR_CONFLICT',
        conflicting_cefr_levels: ['B1', 'C2'],
        original_id: 'cefr_j:v1.5:line:2400',
        conflicting_entries: [
          {
            source: 'octanove',
            original_id: 'octanove:v1.0:line:700',
            word: 'fortnight',
            cefr_level: 'C2',
          },
        ],
        provenance: {
          source: 'cefr_j',
          source_name: 'CEFR-J Vocabulary Profile',
          source_version: '1.5',
          license: 'TUFS-CEFR-J-Permissive',
          original_id: 'cefr_j:v1.5:line:2400',
          transformation_method: 'deterministic_ingest',
        },
      },
    ];

    const res = expandLegitimateCefrConflictSenseUnits(candidates);
    expect(res.learningUnitCandidates).toHaveLength(3);
    expect(res.conflictResolutionSummary).toEqual({
      total_conflict_groups: 2,
      polysemous_conflict_groups_split: 1,
      monosemous_calibration_disagreements_unsplit: 1,
      additional_sense_learning_units_created: 1,
    });

    const [driveA2, driveC2, fortnightB1] = res.learningUnitCandidates;
    expect(driveA2.cefr_level).toBe('A2');
    expect(driveA2.candidate_sense_index).toBe(1);
    expect(driveA2.conflict_resolution_type).toBe('CONFLICT_POLYSEMOUS_PRIMARY_SENSE_UNIT');

    expect(driveC2.cefr_level).toBe('C2');
    expect(driveC2.candidate_sense_index).toBe(2);
    expect(driveC2.conflict_resolution_type).toBe('CONFLICT_POLYSEMOUS_SECONDARY_SENSE_UNIT');
    expect(driveC2.provenance.source).toBe('octanove');
    expect(driveC2.provenance.split_from_primary_original_id).toBe('cefr_j:v1.5:line:1900');

    expect(fortnightB1.conflict_resolution_type).toBe(
      'CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT'
    );
  });

  it('classifies NO_MATCH items into CLOSED_CLASS_FUNCTION_WORD vs OPEN_CLASS_DERIVED_OR_COMPOUND_MISSING_IN_OEWN and marks ambiguous recommendations as RECOMMENDED_NOT_APPROVED (Step 3)', () => {
    const closedRecord = {
      lemma: 'despite',
      part_of_speech: 'preposition',
      sense_disambiguation_status: 'NO_MATCH',
      candidate_senses_preview: [],
    };
    const closedMeta = buildSenseResolutionMetadata(closedRecord);
    expect(closedMeta.no_match_category).toBe('CLOSED_CLASS_FUNCTION_WORD');
    expect(closedMeta.requires_human_sense_selection).toBe(true);

    const openRecord = {
      lemma: 'traveller',
      part_of_speech: 'noun',
      cefr_level: 'A2',
      sense_disambiguation_status: 'NO_MATCH',
      candidate_senses_preview: [],
    };
    const openMeta = buildSenseResolutionMetadata(openRecord);
    expect(openMeta.no_match_category).toBe('OPEN_CLASS_DERIVED_OR_COMPOUND_MISSING_IN_OEWN');

    const ambigRecord = {
      lemma: 'bank',
      part_of_speech: 'noun',
      sense_index: 1,
      sense_disambiguation_status: 'MATCH_AMBIGUOUS',
      candidate_senses_preview: [
        {
          sense_key: 'bank%1:14:00::',
          synset_id: '08437235-n',
          sense_number: 1,
          definition: 'a financial institution that accepts deposits',
          lex_domain: 'noun.group',
        },
        {
          sense_key: 'bank%1:17:01::',
          synset_id: '09236472-n',
          sense_number: 2,
          definition: 'sloping land Beside a body of water',
          lex_domain: 'noun.object',
        },
      ],
    };
    const ambigMeta = buildSenseResolutionMetadata(ambigRecord);
    expect(ambigMeta.resolution_state).toBe('AMBIGUOUS_QUEUE_FOR_HUMAN_SELECTION');
    expect(ambigMeta.recommended_sense.approval_state).toBe('RECOMMENDED_NOT_APPROVED');
    expect(ambigMeta.recommended_sense.sense_key).toBe('bank%1:14:00::');
  });

  it('converts CMUdict ARPAbet to IPA accurately and flags multi-variants, composite phrases, and POS heteronyms (Step 6)', () => {
    expect(arpabetToIpa('AH0 B AE1 N D AH0 N')).toBe('/əˈbændən/');

    const cmudictSubset = loadCmudictSubset(projectRoot);
    expect(cmudictSubset.lookup.size).toBeGreaterThan(8000);

    // 1. Single unambiguous entry -> HIGH_SINGLE_ENTRY + SOURCE_VERIFIED
    const abandonPron = resolveCmudictPronunciation(
      { word: 'abandon', lemma: 'abandon', part_of_speech: 'verb' },
      cmudictSubset.lookup
    );
    expect(abandonPron.phonetic_ipa).toBe('/əˈbændən/');
    expect(abandonPron.pronunciation_confidence).toBe('HIGH_SINGLE_ENTRY');
    expect(abandonPron.pronunciation_review_status).toBe('SOURCE_VERIFIED');
    expect(abandonPron.provenance.source).toBe('cmudict');
    expect(abandonPron.provenance.source_version).toBe('0.7b');
    expect(abandonPron.provenance.license).toBe('BSD-2-Clause');

    // 2. POS-sensitive heteronym ("record" verb/noun) -> AMBIGUOUS_HETERONYM + REVIEW_REQUIRED
    const recordPron = resolveCmudictPronunciation(
      { word: 'record', lemma: 'record', part_of_speech: 'verb' },
      cmudictSubset.lookup
    );
    expect(recordPron.phonetic_ipa).toBeTruthy();
    expect(recordPron.pronunciation_confidence).toBe('AMBIGUOUS_HETERONYM');
    expect(recordPron.pronunciation_review_status).toBe('REVIEW_REQUIRED');
    expect(recordPron.provenance.variants_ipa.length).toBeGreaterThanOrEqual(2);

    // 3. Multi-word phrase composed from tokens -> COMPOSITE_PHRASE_FROM_TOKENS + REVIEW_REQUIRED
    const phrasePron = resolveCmudictPronunciation(
      { word: 'all right', lemma: 'all right', part_of_speech: 'adjective' },
      cmudictSubset.lookup
    );
    expect(phrasePron.phonetic_ipa).toBeTruthy();
    expect(phrasePron.pronunciation_confidence).toBe('COMPOSITE_PHRASE_FROM_TOKENS');
    expect(phrasePron.pronunciation_review_status).toBe('REVIEW_REQUIRED');

    // 4. Unknown non-dictionary word -> UNRESOLVED + null
    const unknownPron = resolveCmudictPronunciation(
      { word: 'zzzzunknownword', lemma: 'zzzzunknownword', part_of_speech: 'noun' },
      cmudictSubset.lookup
    );
    expect(unknownPron.phonetic_ipa).toBeNull();
    expect(unknownPron.pronunciation_confidence).toBe('UNRESOLVED');
    expect(unknownPron.pronunciation_review_status).toBe('UNRESOLVED');
  });

  it('enforces offline draft workflows for English meaning, Thai translation, and example sentences without auto-approving (Steps 4, 5, 7)', () => {
    const baseRecord = enrichVocabularyCandidate({
      word: 'despite',
      lemma: 'despite',
      raw_headword: 'despite',
      part_of_speech: 'preposition',
      cefr_level: 'B1',
      oewn_match_status: 'not_attempted',
      conflict_status: 'NONE',
      provenance: {
        source: 'cefr_j',
        source_name: 'CEFR-J Vocabulary Profile',
        source_version: '1.5',
        license: 'TUFS-CEFR-J-Permissive',
        original_id: 'cefr_j:v1.5:line:1500',
        transformation_method: 'deterministic_ingest',
      },
    });

    // Step 4: Offline English meaning draft
    const withEnDraft = applyOfflineEnglishMeaningDraft(baseRecord, {
      meaning_en: 'without being affected or prevented by something',
      draft_source: 'offline_lexicographer_draft_v1',
    });
    expect(withEnDraft.meaning_en).toBe('without being affected or prevented by something');
    expect(withEnDraft.meaning_review_status).toBe('AI_DRAFT');
    expect(withEnDraft.lifecycle_status).toBe('REVIEW_REQUIRED');
    expect(withEnDraft.is_active).toBe(false);

    // Step 5: Offline Thai translation draft (must link to resolved English meaning and reject dual-locale slop)
    expect(() =>
      applyOfflineThaiTranslationDraft(withEnDraft, {
        meaning_th: 'ทั้งๆ ที่ (Despite)',
      })
    ).toThrow(/dual-language parenthetical slop/);

    const withThDraft = applyOfflineThaiTranslationDraft(withEnDraft, {
      meaning_th: 'ทั้งๆ ที่, แม้ว่า',
      translation_method: 'offline_llm_sense_bound_draft_v1',
    });
    expect(withThDraft.meaning_th).toBe('ทั้งๆ ที่, แม้ว่า');
    expect(withThDraft.translation_review_status).toBe('AI_DRAFT_REVIEW_REQUIRED');
    expect(withThDraft.lifecycle_status).toBe('REVIEW_REQUIRED');
    expect(withThDraft.is_active).toBe(false);

    // Step 7: Offline example sentence draft (must contain target word and never claim cefr_certified=true)
    expect(() =>
      applyOfflineExampleDraft(withThDraft, {
        example_sentence: 'They enjoyed the trip very much yesterday.',
      })
    ).toThrow(/does not contain target word/);

    const withExDraft = applyOfflineExampleDraft(withThDraft, {
      example_sentence: 'They enjoyed the outdoor concert despite the heavy rain.',
      example_sentence_th: 'พวกเขาเพลิดเพลินกับคอนเสิร์ตกลางแจ้งแม้ว่าฝนจะตกหนัก',
    });
    expect(withExDraft.example_sentence).toBe(
      'They enjoyed the outdoor concert despite the heavy rain.'
    );
    expect(withExDraft.example_review_status).toBe('AI_DRAFT_REVIEW_REQUIRED');
    expect(withExDraft.provenance.example_provenance.cefr_certified).toBe(false);
    expect(withExDraft.lifecycle_status).toBe('REVIEW_REQUIRED');
    expect(withExDraft.is_active).toBe(false);
  });

  it('skips circular OEWN glosses (e.g., "repeatedly" defined as "repeatedly") rather than assigning circular meaning_en', () => {
    const synsetMap = new Map([
      [
        '00178293-r',
        {
          synset_id: '00178293-r',
          part_of_speech: 'adverb',
          lex_domain: 'adv.all',
          words: ['repeatedly', 'over and over', 'again and again'],
          definition: 'repeatedly',
          examples: [],
          antonym_synset_ids: [],
        },
      ],
    ]);

    const candidate = {
      word: 'repeatedly',
      lemma: 'repeatedly',
      raw_headword: 'repeatedly',
      part_of_speech: 'adverb',
      cefr_level: 'B1',
      sense_key: 'repeatedly%4:02:01::',
      oewn_synset_id: '00178293-r',
      oewn_match_status: 'matched',
      conflict_status: 'NONE',
      provenance: {
        source: 'cefr_j',
        source_name: 'CEFR-J Vocabulary Profile',
        source_version: '1.5',
        source_url: 'http://www.cefr-j.org/download.html',
        license: 'TUFS-CEFR-J-Permissive',
        original_id: 'cefr_j:v1.5:line:5658',
        transformation_method: 'unicode_nfc',
      },
    };

    const enriched = enrichVocabularyCandidate(candidate, { synsetMap });
    expect(enriched.meaning_en).toBeNull();
    expect(enriched.provenance.meaning_en_provenance.status).toBe(
      'CIRCULAR_SOURCE_GLOSS_REQUIRES_REVIEW'
    );
    expect(enriched.qa_status).toBe('REVIEW_REQUIRED');
    expect(enriched.qa_reasons).toContain('MEANING_SOURCE_GLOSS_CIRCULAR_SKIPPED');
  });

  it('enforces all 10 QA domains and rejects malformed, circular, placeholder, or unreviewed ACTIVE records', () => {
    const seenKeys = new Set(['bank|noun|A1|sense:1']);

    const badRecord = {
      learning_unit_key: 'bank|noun|A1|sense:1',
      word: 'bank',
      lemma: 'bank',
      part_of_speech: 'invalid_pos',
      cefr_level: 'C2',
      sense_disambiguation_status: 'MATCH_CONFIDENT',
      meaning_en: 'bank', // identical to headword!
      meaning_th: 'ธนาคาร (Bank)', // dual-language parenthetical slop!
      phonetic_ipa: 'bank123', // malformed IPA with digits and missing slashes!
      example_sentence: 'She walked to the park yesterday afternoon.', // missing target word "bank"!
      topic: 'money',
      is_active: true,
      lifecycle_status: 'ACTIVE',
      provenance: {
        source: 'cefr_j', // cefr_j with C2 is invalid!
        source_name: 'CEFR-J',
        source_version: '1.5',
        original_id: 'cefr_j:1',
        transformation_method: 'test',
        meaning_en_provenance: { source: 'oewn_2024' },
        meaning_th_provenance: { translation_method: 'manual' },
        ipa_provenance: { source: 'manual' },
        example_provenance: { cefr_certified: true },
      },
    };

    const qa = auditEnrichedVocabularyRecord(badRecord, { seenLearningUnitKeys: seenKeys });
    expect(qa.qa_status).toBe('FAIL');
    expect(qa.qa_passed_structural).toBe(false);
    expect(qa.hard_failures).toEqual(
      expect.arrayContaining([
        'IDENTITY_DUPLICATE_LEARNING_UNIT_KEY',
        'CEFR_INVALID_SOURCE_MAPPING_CEFRJ',
        'POS_INVALID_VALUE',
        'MEANING_IDENTICAL_TO_HEADWORD',
        'MEANING_TH_DUAL_LANGUAGE_SLOP',
        'EXAMPLE_MISSING_TARGET_WORD',
        'EXAMPLE_ILLEGAL_CEFR_CERTIFICATION_CLAIM',
        'IPA_MALFORMED_FORMAT',
        'LIFECYCLE_ACTIVE_OR_APPROVED_WITH_MISSING_FIELDS',
        'LIFECYCLE_ACTIVE_OR_APPROVED_WITHOUT_HUMAN_REVIEW',
      ])
    );
  });

  it('blocks lifecycle transitions to REVIEWED, APPROVED, or ACTIVE without human sign-off and complete learner metadata (Step 8)', () => {
    const baseRecord = {
      learning_unit_key: 'apple|noun|A1|sense:1',
      word: 'apple',
      lemma: 'apple',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_key: 'apple%1:13:00::',
      sense_disambiguation_status: 'MATCH_CONFIDENT',
      meaning_en: 'fruit with red or yellow or green skin and sweet to tart crisp whitish flesh',
      meaning_th: null,
      phonetic_ipa: null,
      example_sentence: 'She ate a fresh red apple after lunch.',
      example_sentence_th: null,
      topic: 'food',
      lifecycle_status: 'REVIEW_REQUIRED',
      is_active: false,
      provenance: {
        source: 'cefr_j',
        source_name: 'CEFR-J Vocabulary Profile',
        source_version: '1.5',
        original_id: 'cefr_j:v1.5:line:412',
        transformation_method: 'deterministic_ingest',
        meaning_en_provenance: { source: 'oewn_2024' },
        meaning_th_provenance: { translation_method: 'human_sme' },
        ipa_provenance: { source: 'human_sme' },
        example_provenance: { source: 'oewn_2024', cefr_certified: false },
      },
    };

    // 1. Block without human sign-off
    expect(() => transitionVocabularyLifecycle(baseRecord, 'ACTIVE', null)).toThrow(
      /explicit human QA sign-off/
    );

    // 2. Block when learner fields (meaning_th, phonetic_ipa, example_sentence_th) are still null
    expect(() =>
      transitionVocabularyLifecycle(baseRecord, 'ACTIVE', {
        reviewed_by: 'lexicographer_01',
        reviewed_at: '2026-09-26T10:00:00Z',
        decision: 'APPROVED',
      })
    ).toThrow(/missing required learner fields/);

    // 3. Succeed through REVIEWED -> APPROVED -> ACTIVE when all fields are populated and human review sign-off is provided
    const completeRecord = {
      ...baseRecord,
      meaning_th: 'ผลแอปเปิล',
      phonetic_ipa: '/ˈæp.əl/',
      example_sentence_th: 'เธอกินแอปเปิลสีแดงสดหลังอาหารกลางวัน',
    };

    const reviewed = transitionVocabularyLifecycle(completeRecord, 'REVIEWED', {
      reviewed_by: 'lexicographer_01',
      reviewed_at: '2026-09-26T10:00:00Z',
      decision: 'APPROVED',
    });
    expect(reviewed.lifecycle_status).toBe('REVIEWED');
    expect(reviewed.is_active).toBe(false);

    const approved = transitionVocabularyLifecycle(reviewed, 'APPROVED', {
      reviewed_by: 'lexicographer_01',
      reviewed_at: '2026-09-26T10:05:00Z',
      decision: 'APPROVED',
    });
    expect(approved.lifecycle_status).toBe('APPROVED');
    expect(approved.is_active).toBe(false);

    const promoted = transitionVocabularyLifecycle(approved, 'ACTIVE', {
      reviewed_by: 'lexicographer_01',
      reviewed_at: '2026-09-26T10:10:00Z',
      decision: 'APPROVED',
      notes: 'Verified A1 food noun sense and Thai gloss.',
    });

    expect(promoted.lifecycle_status).toBe('ACTIVE');
    expect(promoted.is_active).toBe(true);
    expect(promoted.qa_status).toBe('PASS');
    expect(promoted.provenance.human_review.reviewed_by).toBe('lexicographer_01');
  });

  it('flags above-level words in example sentences and separates REVIEW_REQUIRED vs CANDIDATE collocations with taxonomic noise filtering (Step 12)', () => {
    const lemmaMinCefrMap = new Map([
      ['cat', 1], // A1
      ['ubiquitous', 5], // C1
    ]);

    const above = findAboveLevelWordsInSentence(
      'The cat is ubiquitous in this neighborhood.',
      'A1',
      lemmaMinCefrMap
    );
    expect(above).toEqual([{ word: 'ubiquitous', cefr_level: 'C1' }]);

    const enrichedCandidates = [
      {
        candidate_id: 'vocab_climate',
        learning_unit_key: 'climate|noun|B1|sense:1',
        word: 'climate',
        lemma: 'climate',
        part_of_speech: 'noun',
        cefr_level: 'B1',
        sense_index: 1,
        sense_key: 'climate%1:26:00::',
        sense_disambiguation_status: 'MATCH_CONFIDENT',
      },
      {
        candidate_id: 'vocab_change',
        learning_unit_key: 'change|noun|A1|sense:1',
        word: 'change',
        lemma: 'change',
        part_of_speech: 'noun',
        cefr_level: 'A1',
        sense_index: 1,
        sense_key: null,
        sense_disambiguation_status: 'MATCH_AMBIGUOUS',
      },
    ];

    const multiWordEntries = [
      {
        phrase: 'climate change',
        synset_id: '11453602-n',
        part_of_speech: 'noun',
        lex_domain: 'noun.phenomenon',
        definition: 'a change in the world climate',
      },
      // Taxonomic entry that should be downgraded to CANDIDATE and flagged as taxonomic noise
      {
        phrase: 'climate zone',
        synset_id: '99999999-n',
        part_of_speech: 'noun',
        lex_domain: 'noun.plant',
        definition: 'type genus of the family Climataceae found in tropical waters',
      },
    ];

    const knownLexiconSet = new Set(['climate', 'change', 'zone']);
    const freqLookup = new Map([
      ['climate', { rank: 900 }],
      ['change', { rank: 120 }],
      ['zone', { rank: 1400 }],
    ]);

    const collocations = buildAndAuditPhase629Collocations(
      enrichedCandidates,
      multiWordEntries,
      knownLexiconSet,
      freqLookup
    );

    const climateChange = collocations.find(
      (c) => c.collocation_text === 'climate change' && c.lemma === 'climate'
    );
    expect(climateChange).toBeDefined();
    expect(climateChange.lifecycle_status).toBe('REVIEW_REQUIRED');
    expect(climateChange.is_taxonomic_noise).toBe(false);
    expect(climateChange.confidence_status).toBe('HIGH_SENSE_AND_POS_LINKED');

    const taxonomicItem = collocations.find((c) => c.collocation_text === 'climate zone');
    expect(taxonomicItem).toBeDefined();
    expect(taxonomicItem.is_taxonomic_noise).toBe(true);
    expect(taxonomicItem.lifecycle_status).toBe('CANDIDATE');
  });

  it('generates priority scores, human review queues, CEFR distribution reports, and verifies Phase 6.2.9 Large Readiness Gate artifacts (Steps 9, 10, 13, 16, 17)', () => {
    const pilotPath = path.join(
      projectRoot,
      'scripts/content-pipeline/output/vocabulary-pilot-batch.json'
    );
    const pilotItems = JSON.parse(fs.readFileSync(pilotPath, 'utf8')).slice(0, 25);

    const run1 = runBatchEnrichment(pilotItems, {
      batchSize: 10,
      dryRun: true,
      seedVersion: 'test-v1',
    });

    expect(run1.enrichedItems).toHaveLength(25);
    expect(run1.manifest.total_batches).toBe(3);
    expect(run1.manifest.batches[0].item_count).toBe(10);
    expect(run1.manifest.batches[2].item_count).toBe(5);
    expect(run1.manifest.batches[0].input_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(run1.manifest.batches[0].output_sha256).toMatch(/^[a-f0-9]{64}$/);

    // Verify all Phase 6.2.9 JSON reports exist in reports/ and have valid schemas
    const senseReviewPath = path.join(projectRoot, 'reports/vocabulary-sense-review.json');
    const reviewQueuePath = path.join(projectRoot, 'reports/vocabulary-review-queue.json');
    const priorityReportPath = path.join(projectRoot, 'reports/vocabulary-priority-report.json');
    const readinessReportPath = path.join(projectRoot, 'reports/vocabulary-large-readiness.json');

    expect(fs.existsSync(senseReviewPath)).toBe(true);
    expect(fs.existsSync(reviewQueuePath)).toBe(true);
    expect(fs.existsSync(priorityReportPath)).toBe(true);
    expect(fs.existsSync(readinessReportPath)).toBe(true);

    const senseReview = JSON.parse(fs.readFileSync(senseReviewPath, 'utf8'));
    expect(senseReview.total_items_requiring_sense_review).toBe(6792);
    expect(senseReview.breakdown_by_no_match_category).toEqual({
      CLOSED_CLASS_FUNCTION_WORD: 301,
      OPEN_CLASS_DERIVED_OR_COMPOUND_MISSING_IN_OEWN: 264,
    });

    const reviewQueue = JSON.parse(fs.readFileSync(reviewQueuePath, 'utf8'));
    expect(reviewQueue.total_queued_learning_units).toBe(9876);
    expect(reviewQueue.executable_batch_plan).toHaveLength(4);

    const priorityReport = JSON.parse(fs.readFileSync(priorityReportPath, 'utf8'));
    expect(priorityReport.total_learning_units).toBe(9876);
    expect(priorityReport.disclaimer).toMatch(/NOT an official CEFR or Cambridge standard/);

    const readiness = JSON.parse(fs.readFileSync(readinessReportPath, 'utf8'));
    expect(readiness.is_product_target_not_cefr_standard).toBe(true);
    expect(readiness.overall_status).toBe('NOT_READY');
    expect(readiness.verdict_display).toBe('NOT READY');
    expect(readiness.user_testing_authorized).toBe(false);
    expect(readiness.summary.target_active_vocabulary).toBe(10000);
    expect(readiness.summary.current_active_vocabulary).toBe(21);
    expect(readiness.summary.current_candidate_vocabulary).toBe(9806);
    expect(readiness.summary.current_staged_learning_units).toBe(9876);
    expect(readiness.summary.target_collocations).toBe(25000);
    expect(readiness.summary.current_active_collocations).toBe(58);
    expect(readiness.summary.current_candidate_collocations).toBeGreaterThan(35000);
    expect(readiness.criteria['6_pronunciation_ipa_coverage'].enriched_candidates_with_ipa).toBe(
      9560
    );
    expect(readiness.criteria['13_content_quality_qa_status'].structural_qa_failures).toBe(0);
    expect(readiness.criteria['13_content_quality_qa_status'].passed).toBe(true);
  });
});

describe('Phase 6.2.10 — Large Vocabulary Production Completion (~10,000 Target)', () => {
  const readinessPath = path.join(projectRoot, 'reports/vocabulary-large-readiness.json');
  const batchesPath = path.join(
    projectRoot,
    'scripts/content-pipeline/output/vocabulary-large-batches.json'
  );
  const manifestPath = path.join(
    projectRoot,
    'scripts/content-pipeline/output/vocabulary-large-manifest.json'
  );
  const docPath = path.join(projectRoot, 'docs/assessment/vocabulary-large-production.md');

  it('validates Step 1 baseline inventory and Step 14 deterministic +124 GREEN shortfall fill (Step 1, Step 14)', () => {
    expect(fs.existsSync(readinessPath)).toBe(true);
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));

    // Step 1 Pre-shortfall inventory
    expect(readiness.summary.supplemental_green_learning_units).toBe(124);
    expect(readiness.summary.total_large_staged_learning_units).toBe(10000);
    expect(readiness.summary.total_large_inventory_learning_units).toBe(10021);

    // Step 12 Ledger checks
    const ledger = readiness.step12_large_gate_ledger;
    expect(ledger.A_inventory_size).toBe(10021);
    expect(ledger.A1_staged_pipeline_units).toBe(10000);
    expect(ledger.A2_existing_active_units).toBe(21);
    expect(ledger.target_gap.staged_inventory_shortfall).toBe(0);

    // Verify 124 supplemental lines in supplemental senses file
    const suppPath = path.join(
      projectRoot,
      'scripts/content-pipeline/sources/oewn/oewn-2024-supplemental-senses.txt'
    );
    expect(fs.existsSync(suppPath)).toBe(true);
    const suppLines = fs
      .readFileSync(suppPath, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(suppLines).toHaveLength(124);
  });

  it('validates 100% English meaning, sense-aware Thai meaning, and learner example coverage across all 10,000 staged units (Steps 4, 5, 6)', () => {
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
    const ledger = readiness.step12_large_gate_ledger;

    // English meaning: 0 missing (3,207 source verified + 6,793 AI draft)
    expect(ledger.F_missing_english_meaning).toBe(0);
    expect(ledger.F1_source_verified_english_meaning).toBe(3207);
    expect(ledger.F2_ai_draft_english_meaning).toBe(6793);

    // Thai meaning: 0 missing (10,000 AI draft in staged + 21 human approved in active)
    expect(ledger.G_missing_thai_meaning).toBe(0);
    expect(ledger.G1_human_approved_thai_meaning).toBe(21);
    expect(ledger.G2_ai_draft_thai_meaning).toBe(10000);

    // Example sentences: 0 missing (1,150 source verified + 8,850 AI draft)
    expect(ledger.I_missing_example).toBe(0);
    expect(ledger.I1_source_verified_example).toBe(1150);
    expect(ledger.I2_ai_draft_example).toBe(8850);
  });

  it('validates unit drafters generate valid POS-contextualized drafts with target word guaranteed and zero em-dashes (Steps 4, 5, 6)', () => {
    // 1. English meaning resolution
    const sampleRecord = {
      word: 'benchmark',
      lemma: 'benchmark',
      part_of_speech: 'noun',
      cefr_level: 'B2',
      sense_index: 1,
      meaning_en: null,
      candidate_senses_preview: [
        {
          synset_id: '05820620-n',
          definition: 'a standard by which something can be measured or judged',
          examples: ['a benchmark test for performance'],
        },
      ],
      provenance: { source: 'octanove', license: 'CC-BY-SA-4.0' },
    };

    const enResult = resolveOrDraftEnglishMeaning(sampleRecord);
    expect(enResult.meaning_en).toBeTruthy();
    expect(enResult.provenance.status).toBe('AI_DRAFT_FROM_CANDIDATE_OEWN_SYNSET_REQUIRES_REVIEW');

    // 2. Thai meaning drafting
    sampleRecord.meaning_en = enResult.meaning_en;
    const thResult = draftSenseSpecificThaiMeaning(sampleRecord);
    expect(thResult.meaning_th).toBeTruthy();
    expect(thResult.meaning_th_review_status).toBe('AI_DRAFT');
    expect([
      'DERIVED_TRANSLATION_REVIEW_REQUIRED',
      'AI_DRAFT_REQUIRES_HUMAN_REVIEW',
    ]).toContain(thResult.provenance.status);

    // 3. Learner example resolution
    const exResult = resolveOrDraftLearnerExample(sampleRecord);
    expect(exResult.example_sentence).toBeTruthy();
    expect(exResult.example_sentence.toLowerCase()).toContain('benchmark');
    expect(exResult.example_sentence).not.toMatch(/[—–]/);
  });

  it('validates strict lifecycle gating: all 10,000 staged units are REVIEW_REQUIRED, zero auto-approved, zero auto-activated (Step 10, Step 12)', () => {
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
    const ledger = readiness.step12_large_gate_ledger;

    expect(ledger.B_learner_ready_active_count).toBe(21);
    expect(ledger.C_approved_count).toBe(21);
    expect(ledger.D_review_required_count).toBe(10000);
    expect(ledger.D1_ai_draft_units_awaiting_human_review).toBe(10000);
    expect(readiness.summary.human_review_status).toBe('Human review pending');
  });

  it('validates deterministic review batch plan: exactly 50 batches LARGE-001..LARGE-050 with 200 items each, review status Human review pending, and valid SHA-256 (Step 11)', () => {
    expect(fs.existsSync(batchesPath)).toBe(true);
    const batchData = JSON.parse(fs.readFileSync(batchesPath, 'utf8'));

    expect(batchData.phase).toBe('6.2.10');
    expect(batchData.total_batches).toBe(50);
    expect(batchData.batch_size).toBe(200);
    expect(batchData.human_review_status).toBe('Human review pending');
    expect(batchData.batches).toHaveLength(50);

    let totalItems = 0;
    const seenBatchIds = new Set();
    for (let i = 0; i < batchData.batches.length; i++) {
      const b = batchData.batches[i];
      const expectedId = `LARGE-${String(i + 1).padStart(3, '0')}`;
      expect(b.batch_id).toBe(expectedId);
      expect(seenBatchIds.has(b.batch_id)).toBe(false);
      seenBatchIds.add(b.batch_id);

      expect(b.item_count).toBe(200);
      totalItems += b.item_count;
      expect(b.review_status).toBe('Human review pending');
      expect(b.batch_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(b.qa_flags.structural_failures).toBe(0);
    }
    expect(totalItems).toBe(10000);
  });

  it('validates 7-dimension internal Glova QA audit: 0 structural QA failures and 0 provenance failures (Step 9, Step 12)', () => {
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
    const ledger = readiness.step12_large_gate_ledger;

    expect(ledger.J_provenance_failures).toBe(0);
    expect(ledger.K_qa_failures).toBe(0);
    expect(ledger.L_duplicate_count).toBe(0);
    expect(ledger.E_unresolved_sense_count).toBe(6792);
    expect(ledger.H_missing_ipa).toBe(316);
    expect(ledger.H1_populated_ipa_in_staged).toBe(9684);
  });

  it('validates Large Vocabulary Readiness Gate: overall_status is NOT_READY, user_testing_authorized is false, and remaining active gap is 9,979 (Step 12, Step 13)', () => {
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));

    expect(readiness.is_product_target_not_cefr_standard).toBe(true);
    expect(readiness.overall_status).toBe('NOT_READY');
    expect(readiness.verdict_display).toBe('NOT READY');
    expect(readiness.user_testing_authorized).toBe(false);
    expect(readiness.summary.remaining_gap_to_10000_active).toBe(9979);
    expect(readiness.step12_large_gate_ledger.target_gap.remaining_active_gap).toBe(9979);
  });

  it('verifies 4-tier scale benchmark throughput, memory safety, and 0 failures across all tiers (Step 18)', () => {
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
    const benchmarks = readiness.scale_benchmarks || readiness.step18_scale_benchmarks;

    expect(benchmarks).toHaveLength(4);
    const expectedTiers = ['Tier_180', 'Tier_1000', 'Tier_5000', 'Full_Inventory_10000'];
    for (let i = 0; i < benchmarks.length; i++) {
      const b = benchmarks[i];
      expect(b.tier_label).toBe(expectedTiers[i]);
      expect(b.failure_count).toBe(0);
      expect(b.throughput_units_per_sec).toBeGreaterThan(1000);
      expect(b.heap_used_mb).toBeLessThan(2048);
    }
  });

  it('verifies Step 19 30-point production completion report in docs/assessment/vocabulary-large-production.md', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toContain('Phase 6.2.10 — Large Vocabulary Production Completion Report');
    expect(doc).toContain('Mandatory 30-Point Production Completion Ledger (Step 19)');
    expect(doc).toContain('10021');
    expect(doc).toContain('10000');
    expect(doc).toContain('Human review pending');
    expect(doc).toContain('NOT_READY');
    expect(doc).toContain('LARGE-001..LARGE-050');
    expect(doc).toContain('100% Untouched');
  });
});

