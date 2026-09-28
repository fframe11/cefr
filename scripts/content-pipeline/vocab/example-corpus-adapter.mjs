/**
 * Phase 6.2.33 — Example Corpus Fallback Adapter (Interface & Design Specification)
 *
 * Design-Only specification for external verified sentence corpora (e.g. Tatoeba,
 * British National Corpus, COCA) to provide attested example sentences when
 * WordNet synsets lack illustrative examples.
 *
 * Strict Compliance Invariants:
 * 1. Zero random web scraping
 * 2. Zero LLM-generated fake examples
 * 3. Zero unverified / ambiguous licensing
 * 4. Currently unverified sources return { matched: false, status: 'SOURCE_UNAVAILABLE' }
 * 5. Does NOT weaken or bypass any quality gate
 */

export class ExampleCorpusAdapter {
  constructor(options = {}) {
    this.options = options;
    this.sourceName = options.sourceName || 'external_example_corpus';
    this.isVerifiedSource = Boolean(options.isVerifiedSource);
    this.corpusData = options.corpusData || null;
  }

  /**
   * Retrieve attested sentences for a given headword and part of speech
   *
   * @param {string} word Headword lemma
   * @param {string} pos Part of speech
   * @param {Object} [sense] Optional sense anchor from OEWN
   * @returns {Object} Standardized corpus retrieval response
   */
  getExamples(word, pos, sense = null) {
    if (!word) {
      return {
        matched: false,
        source: this.sourceName,
        status: 'SOURCE_UNAVAILABLE',
        reason: 'Empty headword provided',
        examples: [],
        provenance: null,
      };
    }

    // Phase 6.2.33 Invariant: External corpus integration is in design-phase.
    // Unverified sources strictly return SOURCE_UNAVAILABLE to prevent ungrounded data.
    if (!this.isVerifiedSource || !this.corpusData) {
      return {
        matched: false,
        source: this.sourceName,
        status: 'SOURCE_UNAVAILABLE',
        reason: 'External corpus adapter not yet wired with verified license/provenance',
        examples: [],
        provenance: null,
      };
    }

    // When wired in future phases with vetted datasets:
    const normWord = String(word).trim().toLowerCase();
    const hits = this.corpusData.get?.(normWord) || [];

    if (hits.length === 0) {
      return {
        matched: false,
        source: this.sourceName,
        status: 'NOT_FOUND',
        reason: `No attested examples found in verified corpus for ${normWord}`,
        examples: [],
        provenance: null,
      };
    }

    return {
      matched: true,
      source: this.sourceName,
      status: 'ATTESTED_FOUND',
      examples: hits.slice(0, 3),
      provenance: {
        corpus: this.sourceName,
        verified_license: 'CC-BY / Public Domain Verified',
        retrieved_at: new Date().toISOString(),
      },
    };
  }
}
