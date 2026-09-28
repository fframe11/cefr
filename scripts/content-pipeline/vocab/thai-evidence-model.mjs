/**
 * Phase 6.2.35 — Thai Evidence Model & Deterministic Sense Alignment
 *
 * Implements:
 * 1. Multi-candidate preservation (every candidate gloss from every source preserved)
 * 2. Complete candidate provenance (source_id, version, record_id, license, POS)
 * 3. Deterministic Sense Alignment states:
 *    - THAI_EXACT_SENSE
 *    - THAI_STRONG_SENSE
 *    - THAI_MULTI_SENSE
 *    - THAI_UNRESOLVED
 *    - THAI_NOT_FOUND
 * 4. Strict ban on translations[0] as semantic truth
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const THAI_ALIGNMENT_STATUS = {
  THAI_EXACT_SENSE: 'THAI_EXACT_SENSE',
  THAI_STRONG_SENSE: 'THAI_STRONG_SENSE',
  THAI_MULTI_SENSE: 'THAI_MULTI_SENSE',
  THAI_UNRESOLVED: 'THAI_UNRESOLVED',
  THAI_NOT_FOUND: 'THAI_NOT_FOUND',
};

export const THAI_EVIDENCE_TIERS = {
  LEVEL_1_DIRECT: 'LEVEL_1_DIRECT',
  LEVEL_2_SECONDARY: 'LEVEL_2_SECONDARY',
  LEVEL_3_CONSENSUS: 'LEVEL_3_CONSENSUS',
  LEVEL_4_AMBIGUOUS: 'LEVEL_4_AMBIGUOUS',
  LEVEL_5_NO_EVIDENCE: 'LEVEL_5_NO_EVIDENCE',
};

export class ThaiEvidenceModel {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.usableIndex = null;
    this.secondaryDataset = null;
  }

  _loadUsableIndex() {
    if (this.usableIndex) return this.usableIndex;
    const indexPath = path.join(this.projectRoot, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json');
    if (fs.existsSync(indexPath)) {
      this.usableIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } else {
      this.usableIndex = {};
    }
    return this.usableIndex;
  }

  _loadSecondary() {
    if (this.secondaryDataset) return this.secondaryDataset;
    const secondaryPath = path.join(
      this.projectRoot,
      'data/lexical-sources/wiktionary-omw/2024/wiktionary-omw-thai-subset.json'
    );
    if (fs.existsSync(secondaryPath)) {
      this.secondaryDataset = JSON.parse(fs.readFileSync(secondaryPath, 'utf8'));
    } else {
      this.secondaryDataset = { metadata: {}, entries: {} };
    }
    return this.secondaryDataset;
  }

  /**
   * Retrieves all candidate Thai translations across all authoritative and secondary sources
   * Guarantees 100% candidate preservation without destructive collapsing to translations[0]
   */
  getCandidates(word, pos) {
    const normWord = String(word || '').trim().toLowerCase();
    const normPos = String(pos || '').trim().toLowerCase();
    const candidates = [];
    const index = this._loadUsableIndex();

    // 1. Primary: Full LEXiTRON Usable Index
    const exactKey = `${normWord}|${normPos}`;
    const lexitronEntries = index[exactKey] || [];

    // Fallback if specific POS is missing but other entries exist
    let entriesToUse = lexitronEntries;
    if (entriesToUse.length === 0) {
      // Check other POS entries for this word
      for (const [k, list] of Object.entries(index)) {
        if (k.startsWith(`${normWord}|`)) {
          entriesToUse = list;
          break;
        }
      }
    }

    for (const e of entriesToUse) {
      candidates.push({
        source_id: 'lexitron_2_0',
        source_version: '2.0',
        source_record_id: e.source_record_id,
        headword: normWord,
        pos: e.normalized_pos,
        raw_translation: e.raw_translation,
        normalized_translation: e.normalized_translation,
        synonyms: e.synonyms || [],
        antonyms: e.antonyms || [],
        thai_transliteration: e.thai_transliteration || null,
        evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_1_DIRECT,
        license: e.license,
        license_verified: true,
        attribution: 'This product is created by the adaptation of LEXiTRON developed by NECTEC (http://www.nectec.or.th/).',
      });
    }

    // 2. Secondary: Wiktionary & OMW Asian WordNet Thai
    const secondary = this._loadSecondary();
    const secKey = `${normWord}|${normPos}`;
    const secEntry = secondary.entries[secKey] || secondary.entries[normWord];

    if (secEntry) {
      for (const t of secEntry.translations || []) {
        const cleanGloss = t.replace(/\s*\(.*?\)\s*/g, '').trim();
        const isCorroborated = candidates.some(
          c => c.normalized_translation === cleanGloss && c.source_id === 'lexitron_2_0'
        );

        candidates.push({
          source_id: 'wiktionary_omw_2024',
          source_version: '2024.1',
          source_record_id: `wiktionary_omw:${normWord}`,
          headword: normWord,
          pos: normPos,
          raw_translation: t,
          normalized_translation: cleanGloss,
          evidence_tier: isCorroborated ? THAI_EVIDENCE_TIERS.LEVEL_3_CONSENSUS : THAI_EVIDENCE_TIERS.LEVEL_2_SECONDARY,
          license: 'CC-BY-SA-4.0',
          license_verified: true,
          attribution: secondary.metadata.attribution || 'Wiktionary contributors & Open Multilingual Wordnet',
        });
      }

      // If senses have thai lemmas, enrich candidates or add them
      for (const s of secEntry.senses || []) {
        for (const lemma of s.thai_lemmas || []) {
          const cleanGloss = lemma.replace(/\s*\(.*?\)\s*/g, '').trim();
          const existing = candidates.find(c => c.normalized_translation === cleanGloss);
          if (existing) {
            existing.definition = s.definition;
            existing.source_sense_id = s.synset_id;
            existing.evidence_tier = THAI_EVIDENCE_TIERS.LEVEL_3_CONSENSUS;
          } else {
            candidates.push({
              source_id: s.source || 'omw_thai',
              source_version: '2024.1',
              source_record_id: s.synset_id,
              headword: normWord,
              pos: normPos,
              raw_translation: lemma,
              normalized_translation: cleanGloss,
              definition: s.definition,
              source_sense_id: s.synset_id,
              evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_3_CONSENSUS,
              license: 'CC-BY-SA-4.0',
              license_verified: true,
              attribution: 'Open Multilingual Wordnet (Bond et al., 2013)',
            });
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Deterministically aligns Thai candidates to an English sense definition
   * Never assumes translations[0] is the correct sense
   */
  alignCandidatesToSense({ word, pos, candidates, englishSense = null }) {
    if (!candidates || candidates.length === 0) {
      return {
        status: THAI_ALIGNMENT_STATUS.THAI_NOT_FOUND,
        aligned_meaning: null,
        evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_5_NO_EVIDENCE,
        reason: 'No Thai translation candidates found across primary or secondary sources',
        candidates_retained: 0,
      };
    }

    const distinctGlosses = [...new Set(candidates.map(c => c.normalized_translation).filter(Boolean))];

    // Case 1: Single unambiguous translation across all sources
    if (distinctGlosses.length === 1) {
      const match = candidates[0];
      return {
        status: THAI_ALIGNMENT_STATUS.THAI_EXACT_SENSE,
        aligned_meaning: match.normalized_translation,
        raw_translation: match.raw_translation,
        source_id: match.source_id,
        evidence_tier: match.evidence_tier,
        reason: 'Single unambiguous lexical entry in authoritative sources',
        candidates_retained: candidates.length,
      };
    }

    // Case 2: Align via English definition and synonyms overlap
    if (englishSense && englishSense.definition) {
      const defLower = (englishSense.definition || '').toLowerCase();
      const senseSynsets = englishSense.synset_id || '';

      // Check consensus match with OMW synset lemma or definition
      for (const c of candidates) {
        if (c.source_sense_id && c.source_sense_id === senseSynsets) {
          return {
            status: THAI_ALIGNMENT_STATUS.THAI_STRONG_SENSE,
            aligned_meaning: c.normalized_translation,
            raw_translation: c.raw_translation,
            source_id: c.source_id,
            evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_3_CONSENSUS,
            reason: `Direct synset alignment via WordNet ${senseSynsets}`,
            candidates_retained: candidates.length,
          };
        }
        if (c.definition && (c.definition.toLowerCase().trim() === defLower || defLower.includes(c.definition.toLowerCase().trim()))) {
          return {
            status: THAI_ALIGNMENT_STATUS.THAI_STRONG_SENSE,
            aligned_meaning: c.normalized_translation,
            raw_translation: c.raw_translation,
            source_id: c.source_id,
            evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_3_CONSENSUS,
            reason: `Definition consensus with secondary sense ("${c.definition}")`,
            candidates_retained: candidates.length,
          };
        }
      }

      // Check overlap between LEXiTRON synonyms/antonyms and OEWN definition words
      for (const c of candidates) {
        if (c.synonyms && c.synonyms.length > 0) {
          for (const syn of c.synonyms) {
            const sLower = syn.toLowerCase();
            // Word boundary match in definition
            const re = new RegExp(`\\b${sLower}\\b`, 'i');
            if (re.test(defLower)) {
              return {
                status: THAI_ALIGNMENT_STATUS.THAI_STRONG_SENSE,
                aligned_meaning: c.normalized_translation,
                raw_translation: c.raw_translation,
                source_id: c.source_id,
                evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_1_DIRECT,
                reason: `Aligned via English synonym overlap ("${syn}" in definition)`,
                candidates_retained: candidates.length,
              };
            }
          }
        }
      }
    }

    // Case 3: Multiple candidates exist without a decisive algorithmic differentiator
    // Fail closed: Route to THAI_MULTI_SENSE (REVIEW_REQUIRED) so human reviewer can pick
    return {
      status: THAI_ALIGNMENT_STATUS.THAI_MULTI_SENSE,
      aligned_meaning: null,
      evidence_tier: THAI_EVIDENCE_TIERS.LEVEL_4_AMBIGUOUS,
      reason: `Polysemous entry with ${distinctGlosses.length} distinct candidates; requires human sense selection`,
      candidate_options: distinctGlosses,
      candidates_retained: candidates.length,
    };
  }
}
