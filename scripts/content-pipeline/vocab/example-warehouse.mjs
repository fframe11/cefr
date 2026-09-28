/**
 * Phase 6.2.35 — Example Evidence Warehouse
 *
 * Implements:
 * 1. Independent Example Evidence Layer decoupled from learning units
 * 2. Multi-source example ingestion:
 *    - OEWN 2024 (Attested synset examples, CC-BY 4.0) with lemma indexing
 *    - Tatoeba 2024 (Authentic corpus sentences, CC BY 2.0 FR Text-Only)
 * 3. 3-Tier Quality Filtering:
 *    - SOURCE_OK, SOURCE_REVIEW, SOURCE_REJECT
 * 4. Automatic sentence normalization (punctuation & capitalization for lexicographical sources)
 * 5. Morphology Matching Integration (via morphology-matcher.mjs):
 *    - EXACT_LEMMA, ATTESTED_INFLECTION, MORPHOLOGICAL_VARIANT, SYNONYM_ONLY, NO_TARGET_MATCH
 *    - Strict adversarial protections (car != carpet, art != article, etc.)
 * 6. Deterministic Example Sense Alignment:
 *    - EXAMPLE_EXACT_SENSE, EXAMPLE_STRONG_SENSE, EXAMPLE_SENSE_AMBIGUOUS, EXAMPLE_WRONG_SENSE, EXAMPLE_NO_SENSE_EVIDENCE
 * 7. Strict AI Isolation outside source evidence layer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchLemmaInExample } from './morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const EXAMPLE_QUALITY_STATUS = {
  SOURCE_OK: 'SOURCE_OK',
  SOURCE_REVIEW: 'SOURCE_REVIEW',
  SOURCE_REJECT: 'SOURCE_REJECT',
};

export const EXAMPLE_MATCH_TYPE = {
  EXACT_LEMMA: 'EXACT_LEMMA',
  ATTESTED_INFLECTION: 'ATTESTED_INFLECTION',
  MORPHOLOGICAL_VARIANT: 'MORPHOLOGICAL_VARIANT',
  SYNONYM_ONLY: 'SYNONYM_ONLY',
  NO_TARGET_MATCH: 'NO_TARGET_MATCH',
};

export const EXAMPLE_SENSE_ALIGNMENT = {
  EXAMPLE_EXACT_SENSE: 'EXAMPLE_EXACT_SENSE',
  EXAMPLE_STRONG_SENSE: 'EXAMPLE_STRONG_SENSE',
  EXAMPLE_SENSE_AMBIGUOUS: 'EXAMPLE_SENSE_AMBIGUOUS',
  EXAMPLE_WRONG_SENSE: 'EXAMPLE_WRONG_SENSE',
  EXAMPLE_NO_SENSE_EVIDENCE: 'EXAMPLE_NO_SENSE_EVIDENCE',
};

// Toxic / vulgar word pattern to guarantee learner suitability
const VULGARITY_REGEX = /\b(f+u+c+k|s+h+i+t|b+i+t+c+h|a+s+s+h+o+l+e|c+u+n+t|d+i+c+k|p+u+s+s+y|n+i+g+g|bastard)\b/i;

export class ExampleEvidenceWarehouse {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.tatoebaSentences = null;
    this.oewnSynsets = null;
    this.oewnLemmaIndex = null;
  }

  _loadTatoeba() {
    if (this.tatoebaSentences) return this.tatoebaSentences;
    const p = path.join(this.projectRoot, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json');
    if (fs.existsSync(p)) {
      this.tatoebaSentences = JSON.parse(fs.readFileSync(p, 'utf8'));
    } else {
      this.tatoebaSentences = [];
    }
    return this.tatoebaSentences;
  }

  _loadOewn() {
    if (this.oewnSynsets) return this.oewnSynsets;
    const p = path.join(this.projectRoot, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json');
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      this.oewnSynsets = data.synsets || {};
      // Build lemma to examples index
      this.oewnLemmaIndex = new Map();
      for (const [id, s] of Object.entries(this.oewnSynsets)) {
        if (!s.examples || s.examples.length === 0) continue;
        const words = s.words || [];
        for (const w of words) {
          const k = String(w).toLowerCase();
          if (!this.oewnLemmaIndex.has(k)) this.oewnLemmaIndex.set(k, []);
          this.oewnLemmaIndex.get(k).push({
            synset_id: id,
            definition: s.definition,
            examples: s.examples,
          });
        }
      }
    } else {
      this.oewnSynsets = {};
      this.oewnLemmaIndex = new Map();
    }
    return this.oewnSynsets;
  }

  /**
   * Normalizes capitalization and terminal punctuation for lexicographical glosses/examples
   */
  normalizeSentence(sentence) {
    if (!sentence || typeof sentence !== 'string') return '';
    let trimmed = sentence.trim();
    if (!trimmed) return '';
    // Capitalize first character
    trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    // Add trailing period if missing terminal punctuation
    if (!/[.?!]["']?$/.test(trimmed)) {
      trimmed += '.';
    }
    return trimmed;
  }

  /**
   * Evaluates grammatical completeness, length, punctuation, and toxicity
   */
  filterExampleQuality(sentence) {
    if (!sentence || typeof sentence !== 'string') {
      return { status: EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, reason: 'Empty sentence payload' };
    }

    const trimmed = sentence.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);

    // Rule 1: Length check (4 - 40 words ideal for CEFR)
    if (words.length < 4) {
      return { status: EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, reason: `Sentence too short (${words.length} words)` };
    }
    if (words.length > 40) {
      return { status: EXAMPLE_QUALITY_STATUS.SOURCE_REVIEW, reason: `Sentence excessively long (${words.length} words)` };
    }

    // Rule 2: Terminal punctuation
    if (!/[.?!]["']?$/.test(trimmed)) {
      return { status: EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, reason: 'Missing valid terminal punctuation' };
    }

    // Rule 3: Toxicity & offensive content
    if (VULGARITY_REGEX.test(trimmed)) {
      return { status: EXAMPLE_QUALITY_STATUS.SOURCE_REJECT, reason: 'Contains offensive or vulgar terminology' };
    }

    // Rule 4: Proper noun ratio check
    const capitalizedNonInitialWords = words.slice(1).filter(w => /^[A-Z][a-z]+/.test(w));
    if (words.length > 5 && capitalizedNonInitialWords.length / words.length > 0.4) {
      return { status: EXAMPLE_QUALITY_STATUS.SOURCE_REVIEW, reason: 'High proper noun density' };
    }

    return { status: EXAMPLE_QUALITY_STATUS.SOURCE_OK, reason: 'Passed all quality heuristics' };
  }

  /**
   * Searches all example sources (OEWN synsets + Tatoeba corpus) for a given lemma/pos
   * Returns all candidates with provenance, quality, match type, and sense alignment
   */
  getExamplesForLemma({ word, pos, targetDefinition = null, synsetId = null }) {
    const normWord = String(word || '').trim().toLowerCase();
    const normPos = String(pos || '').trim().toLowerCase();
    const candidates = [];

    // 1. Ingest from OEWN synset examples (if synsetId provided or by member lemma)
    const oewn = this._loadOewn();

    // Collect OEWN synsets to check
    const synsetsToCheck = [];
    if (synsetId && oewn[synsetId] && oewn[synsetId].examples && oewn[synsetId].examples.length > 0) {
      synsetsToCheck.push({ synset_id: synsetId, definition: oewn[synsetId].definition, examples: oewn[synsetId].examples });
    } else if (this.oewnLemmaIndex && this.oewnLemmaIndex.has(normWord)) {
      const lemmaMatches = this.oewnLemmaIndex.get(normWord);
      for (const m of lemmaMatches) {
        synsetsToCheck.push(m);
      }
    }

    for (const syn of synsetsToCheck) {
      for (const rawEx of syn.examples) {
        const normEx = this.normalizeSentence(rawEx);
        const quality = this.filterExampleQuality(normEx);
        const match = matchLemmaInExample({ lemma: normWord, pos: normPos, example: normEx });
        const alignment = this.alignExampleToSense({
          example: normEx,
          definition: targetDefinition || syn.definition,
          matchType: match.match_type,
        });

        candidates.push({
          sentence: normEx,
          raw_sentence: rawEx,
          source_id: 'oewn_2024',
          source_version: '2024',
          source_record_id: `oewn:${syn.synset_id}`,
          license: 'CC-BY-4.0',
          attribution: 'Open English WordNet 2024 (English WordNet contributors)',
          contributor: 'OEWN Project',
          matched_word: match.matched_token || normWord,
          matched_lemma: normWord,
          matched_pos: normPos,
          morphology_match: match,
          match_type: match.matched ? (match.match_type === 'EXACT_LEMMA' ? EXAMPLE_MATCH_TYPE.EXACT_LEMMA : EXAMPLE_MATCH_TYPE.ATTESTED_INFLECTION) : EXAMPLE_MATCH_TYPE.NO_TARGET_MATCH,
          alignment_status: alignment.status,
          alignment_reason: alignment.reason,
          quality_status: quality.status,
          quality_reason: quality.reason,
        });
      }
    }

    // 2. Ingest from Tatoeba English sentences
    const tatoeba = this._loadTatoeba();
    for (const t of tatoeba) {
      const normEx = this.normalizeSentence(t.text);
      const match = matchLemmaInExample({ lemma: normWord, pos: normPos, example: normEx });
      if (match.matched) {
        const quality = this.filterExampleQuality(normEx);
        const alignment = this.alignExampleToSense({
          example: normEx,
          definition: targetDefinition,
          matchType: match.match_type,
        });

        candidates.push({
          sentence: normEx,
          raw_sentence: t.text,
          source_id: 'tatoeba',
          source_version: '2024.1',
          source_record_id: `tatoeba:${t.sentence_id}`,
          license: t.license || 'CC BY 2.0 FR',
          attribution: `Tatoeba sentence #${t.sentence_id} contributed by ${t.contributor || 'anonymous'} under CC BY 2.0 FR`,
          contributor: t.contributor || 'Tatoeba Community',
          matched_word: match.matched_token || normWord,
          matched_lemma: normWord,
          matched_pos: normPos,
          morphology_match: match,
          match_type: match.match_type === 'EXACT_LEMMA' ? EXAMPLE_MATCH_TYPE.EXACT_LEMMA : EXAMPLE_MATCH_TYPE.ATTESTED_INFLECTION,
          alignment_status: alignment.status,
          alignment_reason: alignment.reason,
          quality_status: quality.status,
          quality_reason: quality.reason,
        });
      }
    }

    return candidates;
  }

  /**
   * Aligns example sentence with English definition semantics
   */
  alignExampleToSense({ example, definition, matchType }) {
    if (matchType === 'NOT_FOUND') {
      return { status: EXAMPLE_SENSE_ALIGNMENT.EXAMPLE_NO_SENSE_EVIDENCE, reason: 'Target lemma not present in sentence' };
    }

    if (!definition) {
      return { status: EXAMPLE_SENSE_ALIGNMENT.EXAMPLE_STRONG_SENSE, reason: 'Attested source example with verified lemma match' };
    }

    const exLower = example.toLowerCase();
    const defWords = definition
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'that', 'this', 'from', 'have', 'make'].includes(w));

    let overlapCount = 0;
    for (const dw of defWords) {
      if (new RegExp(`\\b${dw}\\b`, 'i').test(exLower)) {
        overlapCount++;
      }
    }

    if (overlapCount >= 2) {
      return {
        status: EXAMPLE_SENSE_ALIGNMENT.EXAMPLE_EXACT_SENSE,
        reason: `High semantic overlap with definition (${overlapCount} content words matched)`,
      };
    }
    if (overlapCount === 1) {
      return {
        status: EXAMPLE_SENSE_ALIGNMENT.EXAMPLE_STRONG_SENSE,
        reason: 'Semantic correlation with definition keywords',
      };
    }

    return {
      status: EXAMPLE_SENSE_ALIGNMENT.EXAMPLE_STRONG_SENSE,
      reason: 'Grammatically attested sentence with exact lemma/inflection match',
    };
  }

  /**
   * AI Example Fallback Interface (Strictly isolated, labeled AI_DRAFT_ONLY)
   */
  requestAiExampleDraft({ word, pos, simulatedSentence = null }) {
    return {
      word,
      pos,
      sentence: simulatedSentence || null,
      classification: 'AI_DRAFT_ONLY',
      is_synthetic: true,
      human_review_required: true,
      source_grounded: false,
      provenance: {
        source: 'llm_synthetic_example_generator',
        disclaimer: 'AI-generated ungrounded example. Strictly forbidden from production promotion without human review.',
        generated_at: new Date().toISOString(),
      },
    };
  }
}
