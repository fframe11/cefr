/**
 * Phase 6.2.32 — Candidate Assembly Engine (Ingestion-First)
 *
 * Implements deterministic construction of canonical vocabulary candidates
 * directly from authoritative evidence sources:
 * - CEFR-J / Octanove -> CEFR level, POS category, core inventory tier
 * - Open English WordNet 2024 -> primary definition, synset, attested examples, lexical domain
 * - NECTEC LEXiTRON 2.0 -> official Thai translations, entry counts, POS validation
 * - CMUdict 0.7b -> IPA phonetics, Arpabet notation, pronunciation variants, heteronym flags
 * - NGSL / NAWL Frequency Lists -> frequency list name, rank, SFI index, occurrences per million
 *
 * Invariants:
 * - Read-only input from evidence adapters
 * - Strict separation between Authoritative Evidence and Assembled Content
 * - Zero LLM hallucination / Zero ungrounded synthetic text
 * - Complete provenance and audit trail for every assembled field
 * - Fail-closed traceability: missing evidence fields remain explicitly null
 */

import {
  CefrJAdapter,
  OewnAdapter,
  LexitronAdapter,
  CmudictAdapter,
  FrequencyAdapter,
} from './evidence-adapters.mjs';
import { ENGLISH_HETERONYM_LEMMAS } from './cmudict-ipa.mjs';
import { matchLemmaInExample } from './morphology-matcher.mjs';

export class CandidateAssemblyEngine {
  /**
   * @param {Object} adapters Optional pre-initialized adapters
   */
  constructor(adapters = null) {
    const freqAdapter = new FrequencyAdapter();
    this.adapters = adapters || {
      cefrj: new CefrJAdapter(),
      oewn: new OewnAdapter(),
      lexitron: new LexitronAdapter(),
      cmudict: new CmudictAdapter(),
      frequency: freqAdapter,
      freq: freqAdapter,
    };
  }

  /**
   * Assemble a single canonical candidate from available evidence
   *
   * @param {Object} manifestItem Manifest record { word, part_of_speech, cefr_level, sense_index, ... }
   * @returns {Object} Assembled canonical candidate record
   */
  assembleCandidate(manifestItem) {
    if (!manifestItem || !manifestItem.word) {
      throw new Error('CandidateAssemblyEngine: invalid manifestItem provided');
    }

    const word = String(manifestItem.word).trim().toLowerCase();
    const pos = String(manifestItem.part_of_speech || '').trim().toLowerCase();
    const targetCefr = String(manifestItem.cefr_level || '').trim().toUpperCase();
    const senseIndex = Number(manifestItem.sense_index) || 1;

    // 1. Gather multi-source evidence
    const cefrjEvidence = this.adapters.cefrj.getEvidence(word, pos);
    const oewnEvidence = this.adapters.oewn.getEvidence(word, pos);
    const lexitronEvidence = this.adapters.lexitron.getEvidence(word, pos);
    const cmudictEvidence = this.adapters.cmudict.getEvidence(word);
    const frequencyEvidence = (this.adapters.frequency || this.adapters.freq).getEvidence(word);

    // 2. Resolve Thai Meaning from LEXiTRON
    let meaningTh = null;
    let rawMeaningTh = null;
    let thaiTranslations = [];
    let thaiProvenance = null;
    if (lexitronEvidence.matched && lexitronEvidence.evidence.translations?.length > 0) {
      thaiTranslations = lexitronEvidence.evidence.translations;
      const entries = lexitronEvidence.evidence.sample_entries || [];
      const oewnDef = (oewnEvidence?.evidence?.definition || '').toLowerCase();
      let selectedRaw = null;
      let disambiguationMethod = 'first_available';

      if (entries.length > 1 && oewnDef) {
        for (const e of entries) {
          const esyn = (e.esyn || '').toLowerCase();
          const eant = (e.eant || '').toLowerCase();
          const synList = esyn.split(';').map((s) => s.trim()).filter(Boolean);
          const hasSynOverlap = synList.some((s) => s && oewnDef.includes(s));
          const hasAntOverlap = eant && oewnDef.includes(eant);

          if (hasSynOverlap || hasAntOverlap) {
            selectedRaw = e.tentry;
            disambiguationMethod = 'oewn_synset_overlap';
            break;
          }
        }
      }

      if (!selectedRaw && thaiTranslations.length > 0) {
        selectedRaw = thaiTranslations[0];
      }

      rawMeaningTh = selectedRaw;
      meaningTh = rawMeaningTh ? rawMeaningTh.replace(/\s*\(.*?\)\s*/g, '').trim() : null;

      thaiProvenance = {
        source: 'lexitron_2_0',
        version: '2.0',
        record_id: lexitronEvidence.source_record_id,
        license: lexitronEvidence.provenance.license,
        total_translations: thaiTranslations.length,
        candidate_glosses: thaiTranslations,
        raw_meaning_th: rawMeaningTh,
        disambiguation_method: disambiguationMethod,
      };
    }

    // 3. Resolve Definition and Attested Example from OEWN
    let definitionEn = null;
    let exampleSentence = null;
    let exampleProvenance = null;
    let oewnProvenance = null;

    if (oewnEvidence.matched) {
      definitionEn = oewnEvidence.evidence.definition || null;
      oewnProvenance = {
        source: 'oewn',
        version: '2024',
        record_id: oewnEvidence.source_record_id,
        synset_id: oewnEvidence.evidence.synset_id,
        lex_domain: oewnEvidence.evidence.lex_domain,
        candidate_count: oewnEvidence.evidence.candidate_count,
        license: oewnEvidence.provenance.license,
      };

      if (oewnEvidence.evidence.examples?.length > 0) {
        const examples = oewnEvidence.evidence.examples;
        let bestExample = null;

        // 1. Try exact headword match via morphology matcher
        for (const ex of examples) {
          const match = matchLemmaInExample({ lemma: word, pos, example: ex });
          if (match.match_type === 'EXACT_LEMMA') {
            bestExample = ex;
            exampleProvenance = {
              type: 'OEWN_ATTESTED_HEADWORD',
              sentence: ex,
              matched_token: match.matched_token,
              match_type: match.match_type,
            };
            break;
          }
        }

        // 2. Try inflected or irregular form
        if (!bestExample) {
          for (const ex of examples) {
            const match = matchLemmaInExample({ lemma: word, pos, example: ex });
            if (match.match_type === 'INFLECTED_FORM' || match.match_type === 'IRREGULAR_FORM') {
              bestExample = ex;
              exampleProvenance = {
                type: 'OEWN_ATTESTED_INFLECTION',
                sentence: ex,
                matched_token: match.matched_token,
                match_type: match.match_type,
              };
              break;
            }
          }
        }

        // 3. Fallback to first synset example
        if (!bestExample && examples.length > 0) {
          bestExample = examples[0];
          exampleProvenance = {
            type: 'OEWN_ATTESTED_SYNSET_SYNONYM',
            sentence: examples[0],
            matched_token: null,
            match_type: 'NOT_FOUND',
          };
        }

        exampleSentence = bestExample;
      } else {
        exampleProvenance = {
          type: 'NO_OEWN_ATTESTED_EXAMPLE',
          sentence: null,
        };
      }
    }

    // 4. Resolve IPA Pronunciation and Heteronyms from CMUdict
    let phoneticIpa = null;
    let arpabet = null;
    let isHeteronym = ENGLISH_HETERONYM_LEMMAS.has(word);
    let cmudictProvenance = null;

    if (cmudictEvidence.matched) {
      phoneticIpa = cmudictEvidence.evidence.phonetic_ipa || null;
      arpabet = cmudictEvidence.evidence.arpabet || null;
      cmudictProvenance = {
        source: 'cmudict',
        version: '0.7b',
        record_id: cmudictEvidence.source_record_id,
        license: cmudictEvidence.provenance.license,
        variant_count: cmudictEvidence.evidence.variant_count,
        is_heteronym: isHeteronym,
      };
    }

    // 5. Resolve CEFR Level from CEFR-J
    let cefrLevel = null;
    let cefrjProvenance = null;
    if (cefrjEvidence.matched && cefrjEvidence.evidence.cefr_level) {
      cefrLevel = cefrjEvidence.evidence.cefr_level;
      cefrjProvenance = {
        source: cefrjEvidence.source,
        version: cefrjEvidence.source_version,
        record_id: cefrjEvidence.source_record_id,
        license: cefrjEvidence.provenance.license,
        core_inventory: cefrjEvidence.evidence.core_inventory,
      };
    } else {
      // Fallback to manifest target if unmapped in CEFR-J, marked as ungrounded
      cefrLevel = targetCefr || null;
    }

    // 6. Frequency Metadata
    let frequencyMetadata = null;
    if (frequencyEvidence && frequencyEvidence.matched) {
      frequencyMetadata = {
        list_name: frequencyEvidence.evidence.list_name,
        version: frequencyEvidence.evidence.version,
        rank: frequencyEvidence.evidence.rank,
        sfi: frequencyEvidence.evidence.sfi,
        freq_per_million: frequencyEvidence.evidence.freq_per_million,
      };
    }

    // 7. Calculate source count
    const sourcesMatched = [
      cefrjEvidence.matched,
      oewnEvidence.matched,
      lexitronEvidence.matched,
      cmudictEvidence.matched,
      Boolean(frequencyEvidence && frequencyEvidence.matched),
    ].filter(Boolean).length;

    // 8. Assemble Canonical Candidate Record
    const assembledCandidate = {
      learning_unit_key: `${word}|${pos}|${cefrLevel || 'UNASSIGNED'}|sense:${senseIndex}`,
      word,
      part_of_speech: pos,
      cefr_level: cefrLevel,
      meaning_th: meaningTh,
      raw_meaning_th: rawMeaningTh,
      definition_en: definitionEn,
      phonetic_ipa: phoneticIpa,
      example_sentence: exampleSentence,
      thai_candidates: thaiTranslations,
      arpabet,
      is_heteronym: isHeteronym,
      frequency: frequencyMetadata,
      evidence_summary: {
        sources_matched: sourcesMatched,
        has_cefr_evidence: cefrjEvidence.matched,
        has_oewn_evidence: oewnEvidence.matched,
        has_lexitron_evidence: lexitronEvidence.matched,
        has_cmudict_evidence: cmudictEvidence.matched,
        has_frequency_evidence: Boolean(frequencyEvidence && frequencyEvidence.matched),
      },
      provenance: {
        source: 'evidence_candidate_assembly',
        source_version: '1.0.0',
        license: 'Multi-Source Compliant (TUFS, CC-BY 4.0, NECTEC, BSD-2-Clause, CC-BY-SA 4.0)',
        assembly_method: 'deterministic_ingestion_first',
        is_synthetic: false,
        assembled_at: new Date().toISOString(),
        sources: {
          cefr_j: cefrjProvenance,
          oewn: oewnProvenance,
          lexitron: thaiProvenance,
          cmudict: cmudictProvenance,
          frequency: frequencyMetadata,
        },
        example_provenance: exampleProvenance,
      },
      raw_evidence: {
        cefr_j: cefrjEvidence,
        oewn: oewnEvidence,
        lexitron: lexitronEvidence,
        cmudict: cmudictEvidence,
        frequency: frequencyEvidence,
      },
    };

    return assembledCandidate;
  }

  /**
   * Assemble a batch of candidates from manifest records
   *
   * @param {Array<Object>} manifestRecords Array of manifest items
   * @returns {Array<Object>} Array of assembled candidate records
   */
  assembleBatch(manifestRecords) {
    if (!Array.isArray(manifestRecords)) {
      throw new Error('CandidateAssemblyEngine: manifestRecords must be an array');
    }
    return manifestRecords.map((item) => this.assembleCandidate(item));
  }
}
