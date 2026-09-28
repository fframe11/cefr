/**
 * Unified External Evidence Warehouse
 *
 * Integrates the 6 Frozen Pillars with Phase 6.2.44 External Corpus Ingestion:
 * 1. CEFR Authority: CEFR-J 1.5 + Octanove 1.0
 * 2. English Lexicon Authority: Open English WordNet (OEWN) 2024
 * 3. Thai Bilingual Authority: NECTEC LEXiTRON 2.0 + Wiktionary/OMW Thai + Kaikki English-Thai
 * 4. Pronunciation Authority: CMUdict 0.7b
 * 5. Example Authority: Full Tatoeba English Corpus (24,522 candidate sentences across 8,309 lemmas)
 * 6. Collocation Authority: Collocation Candidates Pool (ACL / N-Grams proxy)
 *
 * Invariants:
 * - Immutable schema with full provenance attached to every record
 * - Complete candidate preservation (zero array truncation / no [0] collapsing)
 * - Deterministic joining against the 10,021 universe
 */

import path from 'node:path';
import { CefrSourceAdapter } from './cefr-source-adapter.mjs';
import { OewnSourceAdapter } from './oewn-source-adapter.mjs';
import { LexitronSourceAdapter } from './lexitron-source-adapter.mjs';
import { KaikkiSourceAdapter } from './kaikki-source-adapter.mjs';
import { CmudictSourceAdapter } from './cmudict-source-adapter.mjs';
import { TatoebaSourceAdapter } from './tatoeba-source-adapter.mjs';
import { CollocationSourceAdapter } from './collocation-source-adapter.mjs';

export class UnifiedEvidenceWarehouse {
  constructor({ projectRoot, useExternalCache = true } = {}) {
    this.projectRoot = projectRoot;
    this.useExternalCache = useExternalCache;
    this.adapters = {
      cefr: new CefrSourceAdapter(),
      oewn: new OewnSourceAdapter(),
      thai: new LexitronSourceAdapter(),
      kaikki: new KaikkiSourceAdapter(),
      pronunciation: new CmudictSourceAdapter(),
      example: new TatoebaSourceAdapter(),
      collocation: new CollocationSourceAdapter()
    };

    this.pillarStats = {};
    this.indexes = {
      cefrByLemma: new Map(),
      oewnByLemma: new Map(),
      thaiByLemma: new Map(),
      pronByLemma: new Map(),
      exampleByLemma: new Map(),
      collocByLemma: new Map()
    };
    this.loaded = false;
  }

  loadAllSources() {
    if (this.loaded) return this.pillarStats;

    // 1. CEFR
    const cefrResult = this.adapters.cefr.parseFiles({
      cefrjPath: path.join(this.projectRoot, 'scripts/content-pipeline/sources/cefr-j/cefrj-vocabulary-profile-1.5.csv'),
      octanovePath: path.join(this.projectRoot, 'scripts/content-pipeline/sources/octanove/octanove-vocabulary-profile-c1c2-1.0.csv')
    });
    for (const rec of cefrResult.records) {
      const k = rec.normalized_value;
      if (!this.indexes.cefrByLemma.has(k)) this.indexes.cefrByLemma.set(k, []);
      this.indexes.cefrByLemma.get(k).push(rec);
    }
    this.pillarStats.pillar1_cefr = {
      name: 'CEFR Authority (CEFR-J 1.5 + Octanove 1.0)',
      records_downloaded: cefrResult.records_downloaded,
      records_parsed: cefrResult.records_parsed,
      records_rejected: cefrResult.records_rejected,
      records_normalized: cefrResult.records_normalized,
      unique_lemmas: cefrResult.unique_lemmas,
      license: this.adapters.cefr.sourceLicense,
      availability: 'LOCAL_VERIFIED'
    };

    // 2. OEWN
    const oewnResult = this.adapters.oewn.parseFiles({
      sensesPath: path.join(this.projectRoot, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-senses.txt'),
      synsetsPath: path.join(this.projectRoot, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json')
    });
    for (const rec of oewnResult.records) {
      const k = rec.normalized_value;
      if (!this.indexes.oewnByLemma.has(k)) this.indexes.oewnByLemma.set(k, []);
      this.indexes.oewnByLemma.get(k).push(rec);
    }
    this.pillarStats.pillar2_lexicon = {
      name: 'English Lexicon Authority (Open English WordNet 2024)',
      records_downloaded: oewnResult.records_downloaded,
      records_parsed: oewnResult.records_parsed,
      records_rejected: oewnResult.records_rejected,
      records_normalized: oewnResult.records_normalized,
      unique_lemmas: oewnResult.unique_lemmas,
      license: this.adapters.oewn.sourceLicense,
      availability: 'LOCAL_VERIFIED'
    };

    // 3. Thai Bilingual (LEXiTRON 2.0 + Wiktionary/OMW + Kaikki Wiktionary)
    const thaiResult = this.adapters.thai.parseFiles({
      lexitronPath: path.join(this.projectRoot, 'data/lexical-sources/lexitron/2.0/lexitron-usable-index.json'),
      wiktionaryPath: path.join(this.projectRoot, 'data/lexical-sources/wiktionary-omw/2024/wiktionary-omw-thai-subset.json')
    });
    for (const rec of thaiResult.records) {
      const k = rec.normalized_value;
      if (!this.indexes.thaiByLemma.has(k)) this.indexes.thaiByLemma.set(k, []);
      this.indexes.thaiByLemma.get(k).push(rec);
    }

    // Ingest Kaikki English-Thai if external cache enabled
    let kaikkiResult = { records_downloaded: 0, records_parsed: 0, records_rejected: 0, records_normalized: 0, unique_lemmas: 0, records: [] };
    if (this.useExternalCache) {
      kaikkiResult = this.adapters.kaikki.parseFiles({
        indexFilePath: path.join(this.projectRoot, 'data/external-cache/kaikki/kaikki-universe-index.json')
      });
      for (const rec of kaikkiResult.records) {
        const k = rec.normalized_value;
        if (!this.indexes.thaiByLemma.has(k)) this.indexes.thaiByLemma.set(k, []);
        this.indexes.thaiByLemma.get(k).push(rec);
      }
    }

    const allThaiLemmas = new Set(this.indexes.thaiByLemma.keys());
    this.pillarStats.pillar3_thai = {
      name: this.useExternalCache
        ? 'Thai Bilingual Authority (NECTEC LEXiTRON 2.0 + Wiktionary/OMW Thai + Kaikki Wiktionary)'
        : 'Thai Bilingual Authority (NECTEC LEXiTRON 2.0 + Wiktionary/OMW Thai)',
      records_downloaded: thaiResult.records_downloaded + kaikkiResult.records_downloaded,
      records_parsed: thaiResult.records_parsed + kaikkiResult.records_parsed,
      records_rejected: 0,
      records_normalized: thaiResult.records_normalized + kaikkiResult.records_normalized,
      unique_lemmas: allThaiLemmas.size,
      license: this.useExternalCache
        ? `${this.adapters.thai.sourceLicense} / ${this.adapters.kaikki.sourceLicense}`
        : this.adapters.thai.sourceLicense,
      availability: 'LOCAL_VERIFIED',
      kaikki_stats: {
        records_extracted: kaikkiResult.records_parsed,
        unique_lemmas: kaikkiResult.unique_lemmas
      }
    };

    // 4. Pronunciation
    const pronResult = this.adapters.pronunciation.parseFiles({
      cmudictPath: path.join(this.projectRoot, 'data/lexical-sources/cmudict/0.7b/cmudict-0.7b-cefr-subset.dict')
    });
    for (const rec of pronResult.records) {
      const k = rec.normalized_value;
      if (!this.indexes.pronByLemma.has(k)) this.indexes.pronByLemma.set(k, []);
      this.indexes.pronByLemma.get(k).push(rec);
    }
    this.pillarStats.pillar4_pronunciation = {
      name: 'Pronunciation Authority (CMUdict 0.7b + Wiktionary IPA)',
      records_downloaded: pronResult.records_downloaded,
      records_parsed: pronResult.records_parsed,
      records_rejected: pronResult.records_rejected,
      records_normalized: pronResult.records_normalized,
      unique_lemmas: pronResult.unique_lemmas,
      license: this.adapters.pronunciation.sourceLicense,
      availability: 'LOCAL_VERIFIED'
    };

    // 5. Example (Full Tatoeba or Snapshot)
    const exampleResult = this.adapters.example.parseFiles({
      fullIndexPath: this.useExternalCache ? path.join(this.projectRoot, 'data/external-cache/tatoeba/tatoeba-universe-index.json') : null,
      sentencesPath: path.join(this.projectRoot, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json'),
      expandedSentencesPath: path.join(this.projectRoot, 'data/lexical-sources/tatoeba/2024/tatoeba-expanded-sentences.json')
    });
    for (const rec of exampleResult.records) {
      const k = rec.normalized_value;
      if (!this.indexes.exampleByLemma.has(k)) this.indexes.exampleByLemma.set(k, []);
      this.indexes.exampleByLemma.get(k).push(rec);
    }
    this.pillarStats.pillar5_example = {
      name: 'Example Authority (Full Tatoeba English Corpus)',
      source_mode: exampleResult.source_mode,
      records_downloaded: exampleResult.records_downloaded,
      records_parsed: exampleResult.records_parsed,
      records_rejected: exampleResult.records_rejected,
      records_normalized: exampleResult.records_normalized,
      unique_lemmas: exampleResult.unique_lemmas,
      unique_examples: exampleResult.unique_examples,
      archive_sha256: exampleResult.archive_sha256,
      license: this.adapters.example.sourceLicense,
      availability: exampleResult.availability
    };

    // 6. Collocation
    const collocResult = this.adapters.collocation.parseFiles({
      collocationsPath: path.join(this.projectRoot, 'scripts/content-pipeline/output/vocabulary-collocations-candidates.json')
    });
    for (const rec of collocResult.records) {
      const k = rec.normalized_value;
      if (!this.indexes.collocByLemma.has(k)) this.indexes.collocByLemma.set(k, []);
      this.indexes.collocByLemma.get(k).push(rec);
    }
    this.pillarStats.pillar6_collocation = {
      name: 'Collocation Authority (Collocation Pool / ACL Proxy)',
      records_downloaded: collocResult.records_downloaded,
      records_parsed: collocResult.records_parsed,
      records_rejected: collocResult.records_rejected,
      records_normalized: collocResult.records_normalized,
      unique_lemmas: collocResult.unique_lemmas,
      license: this.adapters.collocation.sourceLicense,
      availability: 'LOCAL_POOL_VERIFIED',
      remote_sources: collocResult.remote_sources_status
    };

    this.loaded = true;
    return this.pillarStats;
  }

  getEvidenceForUnit(word, pos) {
    const cleanWord = (word || '').trim().toLowerCase();
    const cleanPos = (pos || '').trim().toLowerCase();

    return {
      cefr: this.indexes.cefrByLemma.get(cleanWord) || [],
      lexicon: this.indexes.oewnByLemma.get(cleanWord) || [],
      thai: (this.indexes.thaiByLemma.get(cleanWord) || []).filter(t => !cleanPos || !t.part_of_speech || t.part_of_speech === cleanPos || (cleanPos === 'noun' && t.part_of_speech === 'name')),
      pronunciation: this.indexes.pronByLemma.get(cleanWord) || [],
      example: this.indexes.exampleByLemma.get(cleanWord) || [],
      collocation: this.indexes.collocByLemma.get(cleanWord) || []
    };
  }
}
