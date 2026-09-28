/**
 * Phase 6.2.35 — Multi-Source Lexical Evidence & Example Warehouse
 *
 * Implements:
 * 1. Multi-source evidence layer separating native source information from user content
 * 2. Complete candidate preservation (NEVER collapses to translations[0])
 * 3. Integrated ThaiEvidenceModel with full ~83k LEXiTRON and secondary Wiktionary/OMW Thai
 * 4. Integrated ExampleEvidenceWarehouse with OEWN synset examples and Tatoeba corpus sentences
 * 5. 5-Tier Evidence Hierarchy:
 *    - LEVEL 1: Direct primary source evidence with compatible POS/sense
 *    - LEVEL 2: Strong secondary lexical evidence with deterministic sense alignment
 *    - LEVEL 3: Consensus across multiple independent sources
 *    - LEVEL 4: Ambiguous / conflicting evidence (routed to REVIEW_REQUIRED)
 *    - LEVEL 5: No lexical evidence (HOLD)
 * 6. Deterministic Coverage Gap Taxonomy:
 *    - Thai: THAI_NOT_FOUND, THAI_MULTI_SENSE, THAI_SENSE_UNRESOLVED, THAI_SOURCE_CONFLICT
 *    - Example: EXAMPLE_NOT_FOUND, EXAMPLE_WRONG_SENSE, EXAMPLE_MORPHOLOGY_ONLY, EXAMPLE_QUALITY_FAIL, EXAMPLE_LICENSE_UNVERIFIED
 *    - General: CEFR_CONFLICT, POS_CONFLICT, IPA_NOT_FOUND, LICENSE_UNVERIFIED, SOURCE_CONFLICT, POLYSEMY_UNRESOLVED, LEXICON_NOT_FOUND
 * 7. Strict AI Isolation outside source evidence layer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchLemmaInExample } from './morphology-matcher.mjs';
import { ENGLISH_HETERONYM_LEMMAS } from './cmudict-ipa.mjs';
import {
  CefrJAdapter,
  OewnAdapter,
  LexitronAdapter,
  CmudictAdapter,
  FrequencyAdapter,
} from './evidence-adapters.mjs';
import { ThaiEvidenceModel, THAI_ALIGNMENT_STATUS, THAI_EVIDENCE_TIERS } from './thai-evidence-model.mjs';
import { ExampleEvidenceWarehouse, EXAMPLE_QUALITY_STATUS, EXAMPLE_MATCH_TYPE, EXAMPLE_SENSE_ALIGNMENT } from './example-warehouse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const EVIDENCE_LEVELS = {
  LEVEL_1_DIRECT: 'LEVEL_1_DIRECT',
  LEVEL_2_SECONDARY: 'LEVEL_2_SECONDARY',
  LEVEL_3_CONSENSUS: 'LEVEL_3_CONSENSUS',
  LEVEL_4_AMBIGUOUS: 'LEVEL_4_AMBIGUOUS',
  LEVEL_5_NO_EVIDENCE: 'LEVEL_5_NO_EVIDENCE',
};

export const SENSE_ALIGNMENT_STATUS = {
  EXACT_SENSE: 'EXACT_SENSE',
  STRONG_SENSE: 'STRONG_SENSE',
  MULTI_SENSE: 'MULTI_SENSE',
  CONFLICT: 'CONFLICT',
  NO_SENSE_MATCH: 'NO_SENSE_MATCH',
};

export const GAP_TAXONOMY = {
  // General & Lexical
  LEXICON_NOT_FOUND: 'LEXICON_NOT_FOUND',
  POS_NOT_FOUND: 'POS_NOT_FOUND',
  POS_CONFLICT: 'POS_CONFLICT',
  SENSE_NOT_FOUND: 'SENSE_NOT_FOUND',
  IPA_NOT_FOUND: 'IPA_NOT_FOUND',
  LICENSE_UNVERIFIED: 'LICENSE_UNVERIFIED',
  SOURCE_CONFLICT: 'SOURCE_CONFLICT',
  CEFR_CONFLICT: 'CEFR_CONFLICT',
  POLYSEMY_UNRESOLVED: 'POLYSEMY_UNRESOLVED',

  // Thai specific
  THAI_NOT_FOUND: 'THAI_NOT_FOUND',
  THAI_MULTI_SENSE: 'THAI_MULTI_SENSE',
  THAI_SENSE_UNRESOLVED: 'THAI_SENSE_UNRESOLVED',
  THAI_SOURCE_CONFLICT: 'THAI_SOURCE_CONFLICT',

  // Example specific
  EXAMPLE_NOT_FOUND: 'EXAMPLE_NOT_FOUND',
  EXAMPLE_WRONG_SENSE: 'EXAMPLE_WRONG_SENSE',
  EXAMPLE_MORPHOLOGY_ONLY: 'EXAMPLE_MORPHOLOGY_ONLY',
  EXAMPLE_QUALITY_FAIL: 'EXAMPLE_QUALITY_FAIL',
  EXAMPLE_LICENSE_UNVERIFIED: 'EXAMPLE_LICENSE_UNVERIFIED',
};

export const SEVERE_SENSE_CORRUPTIONS = new Map([
  ['father:10261566-n', 'Priestly title mapped to foundational family parent lemma'],
  ['day:11137648-n', 'Biographical author Clarence Day mapped to foundational 24-hour time unit'],
  ['call:06288523-n', 'Theological divine calling mapped to basic telephone/shout noun'],
  ['catch:00070500-n', 'Figurative B2 idiom ("hidden drawback") mapped to A1 physical catch'],
  ['exercise:01211811-v', 'Formal utilization ("put to use") mapped to A1 bodily fitness'],
  ['draw:01498488-v', 'Mechanical towing/pulling mapped to A1 pictorial drawing'],
]);

export class LexicalEvidenceWarehouse {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.adapters = {
      cefrj: new CefrJAdapter(projectRoot),
      oewn: new OewnAdapter(projectRoot),
      lexitron: new LexitronAdapter(projectRoot),
      cmudict: new CmudictAdapter(projectRoot),
      frequency: new FrequencyAdapter(projectRoot),
    };
    this.thaiModel = new ThaiEvidenceModel(projectRoot);
    this.exampleWarehouse = new ExampleEvidenceWarehouse(projectRoot);
    this.secondaryDataset = null;
    this.masterManifest = null;
  }

  _loadSecondary() {
    return this.thaiModel._loadSecondary();
  }

  _loadMasterManifest() {
    if (this.masterManifest) return this.masterManifest;
    const manifestPath = path.join(this.projectRoot, 'data/lexical-sources/master-manifest.json');
    if (fs.existsSync(manifestPath)) {
      this.masterManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
    return this.masterManifest;
  }

  normalizeKey(word, pos) {
    const normWord = String(word || '').trim().normalize('NFC').toLowerCase();
    const normPos = String(pos || '').trim().normalize('NFC').toLowerCase();
    return {
      word: normWord,
      pos: normPos,
      key: `${normWord}|${normPos}`,
    };
  }

  /**
   * Retrieves all candidate translations preserving source provenance
   */
  getTranslations(word, pos) {
    return this.thaiModel.getCandidates(word, pos);
  }

  /**
   * Retrieves senses and definitions from OEWN and secondary sources
   */
  getSenses(word, pos) {
    const { word: normWord, pos: normPos, key } = this.normalizeKey(word, pos);
    const senses = [];

    // Primary: OEWN 2024
    const oewnEv = this.adapters.oewn.getEvidence(normWord, normPos);
    if (oewnEv.matched && oewnEv.evidence) {
      const synsetId = oewnEv.evidence.synset_id;
      senses.push({
        source_id: 'oewn',
        source_version: '2024',
        source_record_id: `oewn_2024:${synsetId}`,
        synset_id: synsetId,
        definition: oewnEv.evidence.definition,
        examples: oewnEv.evidence.examples || [],
        lex_domain: oewnEv.evidence.lex_domain,
        candidate_count: oewnEv.evidence.candidate_count,
        license: 'CC-BY-4.0',
        license_verified: true,
      });
    }

    // Secondary senses from OMW / Wiktionary
    const secondary = this._loadSecondary();
    const secondaryEntry = secondary.entries[key] || secondary.entries[normWord];
    if (secondaryEntry && secondaryEntry.senses) {
      for (const s of secondaryEntry.senses) {
        senses.push({
          source_id: s.source || 'wiktionary_omw',
          source_version: '2024.1',
          source_record_id: s.synset_id,
          synset_id: s.synset_id,
          definition: s.definition,
          examples: [],
          thai_lemmas: s.thai_lemmas || [],
          license: 'CC-BY-SA-4.0',
          license_verified: true,
        });
      }
    }

    return senses;
  }

  /**
   * Connects candidate translations to English senses deterministically
   */
  alignThaiToSense(translations, senses, word, pos) {
    const result = this.thaiModel.alignCandidatesToSense({
      word,
      pos,
      candidates: translations,
      englishSense: senses[0] || null,
    });

    let mappedStatus = SENSE_ALIGNMENT_STATUS.NO_SENSE_MATCH;
    if (result.status === THAI_ALIGNMENT_STATUS.THAI_EXACT_SENSE) {
      mappedStatus = SENSE_ALIGNMENT_STATUS.EXACT_SENSE;
    } else if (result.status === THAI_ALIGNMENT_STATUS.THAI_STRONG_SENSE) {
      mappedStatus = SENSE_ALIGNMENT_STATUS.STRONG_SENSE;
    } else if (result.status === THAI_ALIGNMENT_STATUS.THAI_MULTI_SENSE) {
      mappedStatus = SENSE_ALIGNMENT_STATUS.MULTI_SENSE;
    }

    return {
      status: mappedStatus,
      thai_alignment_status: result.status,
      aligned_translation: result.aligned_meaning,
      raw_translation: result.raw_translation || null,
      source_id: result.source_id || null,
      evidence_tier: result.evidence_tier,
      gap_reason: result.status === THAI_ALIGNMENT_STATUS.THAI_NOT_FOUND ? GAP_TAXONOMY.THAI_NOT_FOUND : (result.status === THAI_ALIGNMENT_STATUS.THAI_MULTI_SENSE ? GAP_TAXONOMY.POLYSEMY_UNRESOLVED : null),
      details: result.reason,
    };
  }

  /**
   * Merges all candidate evidence for a given vocabulary unit
   * PRESERVES all source candidates with full provenance
   */
  mergeUnitEvidence({ word, part_of_speech, cefr_level, sense_index = 1 }) {
    const { word: normWord, pos: normPos } = this.normalizeKey(word, part_of_speech);
    const targetCefr = String(cefr_level || '').trim().toUpperCase();

    // 1. Ingest all translations & senses
    const translations = this.getTranslations(normWord, normPos);
    const senses = this.getSenses(normWord, normPos);

    // 2. CEFR Evidence
    const cefrjEv = this.adapters.cefrj.getEvidence(normWord, normPos);
    let cefrStatus = 'MISSING';
    let cefrConflictReason = null;
    let effectiveCefr = targetCefr || null;

    if (cefrjEv.matched) {
      if (cefrjEv.evidence.cefr_level === targetCefr) {
        cefrStatus = 'EXACT_MATCH';
      } else {
        cefrStatus = 'CONFLICT';
        cefrConflictReason = `Target CEFR ${targetCefr} diverges from CEFR-J ${cefrjEv.evidence.cefr_level}`;
      }
      effectiveCefr = cefrjEv.evidence.cefr_level;
    }

    // 3. CMUdict IPA & Heteronym Evidence
    const cmudictEv = this.adapters.cmudict.getEvidence(normWord);
    let ipaStatus = 'MISSING';
    let phoneticIpa = null;
    let arpabet = null;
    const isHeteronym = ENGLISH_HETERONYM_LEMMAS.has(normWord);

    if (cmudictEv.matched) {
      phoneticIpa = cmudictEv.evidence.phonetic_ipa || null;
      arpabet = cmudictEv.evidence.arpabet || null;
      if (isHeteronym) ipaStatus = 'AMBIGUOUS';
      else if (cmudictEv.evidence.has_multiple_variants) ipaStatus = 'MULTI_VARIANT';
      else ipaStatus = 'CONFIRMED';
    }

    // 4. Frequency Evidence
    const freqEv = this.adapters.frequency.getEvidence(normWord);

    // 5. Example selection via ExampleEvidenceWarehouse
    const exampleCandidates = this.exampleWarehouse.getExamplesForLemma({
      word: normWord,
      pos: normPos,
      targetDefinition: senses[0]?.definition || null,
      synsetId: senses[0]?.synset_id || null,
    });

    let bestExample = null;
    let exampleStatus = 'MISSING';
    let exampleMatchDetails = null;

    // Filter usable examples
    const usableExamples = exampleCandidates.filter(
      ex => ex.quality_status === EXAMPLE_QUALITY_STATUS.SOURCE_OK &&
            (ex.match_type === EXAMPLE_MATCH_TYPE.EXACT_LEMMA || ex.match_type === EXAMPLE_MATCH_TYPE.ATTESTED_INFLECTION)
    );

    if (usableExamples.length > 0) {
      // Prioritize exact lemma match
      const exactMatch = usableExamples.find(ex => ex.match_type === EXAMPLE_MATCH_TYPE.EXACT_LEMMA);
      bestExample = exactMatch || usableExamples[0];
      exampleStatus = bestExample.match_type === EXAMPLE_MATCH_TYPE.EXACT_LEMMA ? 'EXAMPLE_EXACT' : 'EXAMPLE_INFLECTED';
      exampleMatchDetails = bestExample.morphology_match;
    } else if (exampleCandidates.length > 0) {
      // Candidates exist but failed strict quality/morphology
      const reviewCandidate = exampleCandidates.find(ex => ex.quality_status === EXAMPLE_QUALITY_STATUS.SOURCE_REVIEW);
      if (reviewCandidate) {
        bestExample = reviewCandidate;
        exampleStatus = 'EXAMPLE_REVIEW';
      } else {
        exampleStatus = 'EXAMPLE_CONFLICT';
        bestExample = exampleCandidates[0];
      }
      exampleMatchDetails = bestExample.morphology_match;
    }

    // 6. Sense Alignment
    const alignment = this.alignThaiToSense(translations, senses, normWord, normPos);

    // 7. Domain Corruption Protection
    let senseCorruptionBlocked = false;
    let corruptionReason = null;
    if (senses.length > 0) {
      const synId = senses[0].synset_id;
      const cKey = `${normWord}:${synId}`;
      if (SEVERE_SENSE_CORRUPTIONS.has(cKey)) {
        senseCorruptionBlocked = true;
        corruptionReason = SEVERE_SENSE_CORRUPTIONS.get(cKey);
      }
    }

    // 8. Gap Taxonomy and Reason Code Evaluation
    const gapReasons = [];
    if (!cefrjEv.matched) gapReasons.push(GAP_TAXONOMY.LEXICON_NOT_FOUND);
    if (cefrStatus === 'CONFLICT') gapReasons.push(GAP_TAXONOMY.CEFR_CONFLICT);
    if (senses.length === 0) gapReasons.push(GAP_TAXONOMY.SENSE_NOT_FOUND);
    if (senseCorruptionBlocked) gapReasons.push(GAP_TAXONOMY.SOURCE_CONFLICT);
    if (translations.length === 0) gapReasons.push(GAP_TAXONOMY.THAI_NOT_FOUND);
    else if (alignment.status === SENSE_ALIGNMENT_STATUS.MULTI_SENSE) gapReasons.push(GAP_TAXONOMY.POLYSEMY_UNRESOLVED);
    if (ipaStatus === 'MISSING') gapReasons.push(GAP_TAXONOMY.IPA_NOT_FOUND);
    if (exampleStatus === 'MISSING' || exampleStatus === 'EXAMPLE_CONFLICT') gapReasons.push(GAP_TAXONOMY.EXAMPLE_NOT_FOUND);
    else if (exampleStatus === 'EXAMPLE_REVIEW') gapReasons.push(GAP_TAXONOMY.EXAMPLE_QUALITY_FAIL);

    // 9. Decision Gate Evaluation
    let decision = 'HOLD';
    const isAutoReady = (
      gapReasons.length === 0 &&
      (alignment.status === SENSE_ALIGNMENT_STATUS.EXACT_SENSE || alignment.status === SENSE_ALIGNMENT_STATUS.STRONG_SENSE) &&
      (alignment.evidence_tier === EVIDENCE_LEVELS.LEVEL_1_DIRECT ||
        alignment.evidence_tier === EVIDENCE_LEVELS.LEVEL_2_SECONDARY ||
        alignment.evidence_tier === EVIDENCE_LEVELS.LEVEL_3_CONSENSUS) &&
      (ipaStatus === 'CONFIRMED') &&
      (exampleStatus === 'EXAMPLE_EXACT' || exampleStatus === 'EXAMPLE_INFLECTED') &&
      !senseCorruptionBlocked &&
      cefrStatus !== 'CONFLICT'
    );

    if (isAutoReady) {
      decision = 'AUTO_READY';
    } else if (
      gapReasons.includes(GAP_TAXONOMY.LEXICON_NOT_FOUND) ||
      gapReasons.includes(GAP_TAXONOMY.CEFR_CONFLICT) ||
      gapReasons.includes(GAP_TAXONOMY.SOURCE_CONFLICT) ||
      gapReasons.includes(GAP_TAXONOMY.THAI_NOT_FOUND) ||
      senseCorruptionBlocked ||
      cefrStatus === 'CONFLICT'
    ) {
      decision = 'HOLD';
    } else if (
      gapReasons.includes(GAP_TAXONOMY.POLYSEMY_UNRESOLVED) ||
      ipaStatus === 'MULTI_VARIANT' ||
      ipaStatus === 'AMBIGUOUS' ||
      alignment.status === SENSE_ALIGNMENT_STATUS.MULTI_SENSE ||
      exampleStatus === 'EXAMPLE_REVIEW'
    ) {
      decision = 'REVIEW_REQUIRED';
    } else {
      decision = 'HOLD';
    }

    // 10. Construct Preserved Canonical Record
    const mergedRecord = {
      learning_unit_key: `${normWord}|${normPos}|${effectiveCefr || 'UNASSIGNED'}|sense:${sense_index}`,
      word: normWord,
      part_of_speech: normPos,
      cefr_level: effectiveCefr,
      confidence_decision: decision,
      evidence_tier: alignment.evidence_tier,
      aligned_meaning_th: alignment.aligned_translation,
      primary_definition_en: senses[0]?.definition || null,
      primary_example_sentence: (exampleStatus === 'EXAMPLE_EXACT' || exampleStatus === 'EXAMPLE_INFLECTED') ? bestExample?.sentence : null,
      example_sentence: (exampleStatus === 'EXAMPLE_EXACT' || exampleStatus === 'EXAMPLE_INFLECTED') ? bestExample?.sentence : null,
      example_sentence_source: bestExample || null,
      phonetic_ipa: phoneticIpa,
      is_heteronym: isHeteronym,
      all_candidate_translations: translations,
      all_candidate_senses: senses,
      all_candidate_examples: exampleCandidates,
      sense_alignment: alignment,
      example_alignment: {
        status: exampleStatus,
        sentence: bestExample?.sentence || null,
        source_id: bestExample?.source_id || null,
        quality_status: bestExample?.quality_status || null,
        match_details: exampleMatchDetails,
      },
      gap_reasons: gapReasons,
      corruption_check: {
        blocked: senseCorruptionBlocked,
        reason: corruptionReason,
      },
      provenance: {
        is_synthetic: false,
        ai_draft_fallback: false,
        sources_ingested: [
          cefrjEv.matched ? 'cefr_j' : null,
          senses.length > 0 ? 'oewn' : null,
          translations.some((t) => t.source_id === 'lexitron_2_0') ? 'lexitron_2_0' : null,
          translations.some((t) => t.source_id === 'wiktionary_omw_2024' || t.source_id === 'wiktionary_thai' || t.source_id === 'omw_thai') ? 'wiktionary_omw' : null,
          cmudictEv.matched ? 'cmudict_0_7b' : null,
          bestExample?.source_id === 'tatoeba' ? 'tatoeba' : null,
          freqEv?.matched ? 'frequency_ngsl' : null,
        ].filter(Boolean),
        assembled_at: new Date().toISOString(),
      },
    };

    return mergedRecord;
  }

  requestAiDraftFallback({ word, part_of_speech, cefr_level, simulatedDraft = null }) {
    const { word: normWord, pos: normPos } = this.normalizeKey(word, part_of_speech);
    return {
      word: normWord,
      part_of_speech: normPos,
      cefr_level,
      classification: 'AI_DRAFT_ONLY',
      is_synthetic: true,
      human_review_required: true,
      source_grounded: false,
      thai_meaning: simulatedDraft || null,
      provenance: {
        source: 'llm_synthetic_draft',
        source_version: 'draft_fallback_v1',
        disclaimer: 'AI-generated ungrounded draft. Strictly forbidden from production promotion without human review.',
        generated_at: new Date().toISOString(),
      },
    };
  }

  requestAiExampleDraft({ word, pos, simulatedSentence = null }) {
    return this.exampleWarehouse.requestAiExampleDraft({ word, pos, simulatedSentence });
  }
}
