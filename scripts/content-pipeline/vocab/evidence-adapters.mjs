/**
 * Phase 6.2.31 — Evidence Adapters (Read-Only)
 *
 * Provides standardized, read-only evidence retrieval across 5 authoritative sources:
 * 1. CEFR-J (+ Octanove for C1/C2)
 * 2. Open English WordNet (OEWN 2024)
 * 3. NECTEC LEXiTRON 2.0 (etlex)
 * 4. Carnegie Mellon Pronouncing Dictionary (CMUdict 0.7b)
 * 5. NGSL / NAWL / TSL / BSL Frequency Lists
 *
 * Guaranteed Invariants:
 * - Read-only (zero file / DB writes)
 * - Zero LLM hallucination / fake generation
 * - Unmatched queries return { matched: false, reason: 'NOT_FOUND' }
 * - Every matched result contains full traceability (source, version, record_id, provenance)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

// POS mapping helpers
export const POS_MAP_OEWN_TO_LEXITRON = {
  noun: ['N', 'ีีN', 'ืN'],
  verb: ['V', 'VI', 'VT', 'VI, VT', 'VT, VI', 'PHRV', 'PHRV0'],
  adjective: ['ADJ', 'adj'],
  adverb: ['ADV']
};

export const POS_MAP_CEFRJ = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adjective',
  adverb: 'adverb'
};

/**
 * 1. CEFR-J Adapter
 */
export class CefrJAdapter {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.cefrjPath = path.join(projectRoot, 'scripts/content-pipeline/sources/cefr-j/cefrj-vocabulary-profile-1.5.csv');
    this.octanovePath = path.join(projectRoot, 'scripts/content-pipeline/sources/octanove/octanove-vocabulary-profile-c1c2-1.0.csv');
    this.cache = null;
  }

  _load() {
    if (this.cache) return this.cache;
    const map = new Map();

    // 1. Load CEFR-J (A1-B2)
    if (fs.existsSync(this.cefrjPath)) {
      const lines = fs.readFileSync(this.cefrjPath, 'utf8').split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 3) {
          const rawHeadword = parts[0].trim().toLowerCase();
          const pos = parts[1].trim().toLowerCase();
          const cefr = parts[2].trim().toUpperCase();
          const core1 = parts[3]?.trim() || null;
          const core2 = parts[4]?.trim() || null;
          const threshold = parts[5]?.trim() || null;
          const variants = rawHeadword.split('/').map((v) => v.trim()).filter(Boolean);

          for (const headword of variants) {
            const key = `${headword}|${pos}`;
            if (!map.has(key)) {
              map.set(key, {
                source: 'cefr_j',
                source_version: '1.5',
                source_record_id: `cefr_j:v1.5:line:${i + 1}`,
                headword,
                pos,
                cefr_level: cefr,
                core_inventory: core1 || core2 || threshold,
                license: 'TUFS-CEFR-J-Permissive',
              });
            }
          }
        }
      }
    }

    // 2. Load Octanove (C1-C2)
    if (fs.existsSync(this.octanovePath)) {
      const lines = fs.readFileSync(this.octanovePath, 'utf8').split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 3) {
          const rawHeadword = parts[0].trim().toLowerCase();
          const pos = parts[1].trim().toLowerCase();
          const cefr = parts[2].trim().toUpperCase();
          const variants = rawHeadword.split('/').map((v) => v.trim()).filter(Boolean);

          for (const headword of variants) {
            const key = `${headword}|${pos}`;
            if (!map.has(key)) {
              map.set(key, {
                source: 'octanove',
                source_version: '1.0',
                source_record_id: `octanove:v1.0:line:${i + 1}`,
                headword,
                pos,
                cefr_level: cefr,
                license: 'CC-BY-SA-4.0',
              });
            }
          }
        }
      }
    }

    this.cache = map;
    return map;
  }

  getEvidence(headword, pos) {
    const map = this._load();
    const normWord = (headword || '').trim().toLowerCase();
    const normPos = (pos || '').trim().toLowerCase();
    const key = `${normWord}|${normPos}`;

    const found = map.get(key);
    if (!found) {
      return {
        matched: false,
        source: 'cefr_j/octanove',
        reason: 'NOT_FOUND'
      };
    }

    return {
      source: found.source,
      source_version: found.source_version,
      source_record_id: found.source_record_id,
      matched: true,
      evidence: {
        headword: found.headword,
        pos: found.pos,
        cefr_level: found.cefr_level,
        core_inventory: found.core_inventory
      },
      provenance: {
        source_name: found.source === 'cefr_j' ? 'CEFR-J Vocabulary Profile' : 'Octanove Vocabulary Profile C1/C2',
        license: found.license
      }
    };
  }
}

/**
 * 2. OEWN Adapter (Open English WordNet 2024)
 */
export class OewnAdapter {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.synsetsPath = path.join(projectRoot, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json');
    this.sensesPath = path.join(projectRoot, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-senses.txt');
    this.cache = null;
  }

  _load() {
    if (this.cache) return this.cache;
    const synsetMap = new Map();
    const lemmaPosIndex = new Map();

    if (fs.existsSync(this.synsetsPath)) {
      const data = JSON.parse(fs.readFileSync(this.synsetsPath, 'utf8'));
      const synsetsObj = data.synsets || data;
      const entries = typeof synsetsObj === 'object' && !Array.isArray(synsetsObj)
        ? Object.values(synsetsObj)
        : synsetsObj;

      for (const s of entries) {
        if (!s || !s.synset_id) continue;
        synsetMap.set(s.synset_id, s);

        const pos = s.part_of_speech || (
          s.ss_type === 'n' || s.synset_id.endsWith('-n') ? 'noun' :
          s.ss_type === 'v' || s.synset_id.endsWith('-v') ? 'verb' :
          s.ss_type === 'a' || s.ss_type === 's' || s.synset_id.endsWith('-a') || s.synset_id.endsWith('-s') ? 'adjective' :
          'adverb'
        );

        const words = s.words || s.members || [];
        for (const w of words) {
          const lemma = (typeof w === 'string' ? w : w.lemma || '').trim().toLowerCase();
          if (!lemma) continue;
          const key = `${lemma}|${pos}`;
          if (!lemmaPosIndex.has(key)) {
            lemmaPosIndex.set(key, []);
          }
          lemmaPosIndex.get(key).push(s);
        }
      }
    }

    this.cache = { synsetMap, lemmaPosIndex };
    return this.cache;
  }

  getEvidence(headword, pos, synsetId = null) {
    const { synsetMap, lemmaPosIndex } = this._load();
    const normWord = (headword || '').trim().toLowerCase();
    const normPos = (pos || '').trim().toLowerCase();
    const key = `${normWord}|${normPos}`;

    if (synsetId && synsetMap.has(synsetId)) {
      const s = synsetMap.get(synsetId);
      return {
        source: 'oewn',
        source_version: '2024',
        source_record_id: `oewn_2024:${synsetId}`,
        matched: true,
        evidence: {
          lemma: normWord,
          pos: normPos,
          synset_id: synsetId,
          definition: s.definition || s.gloss || '',
          examples: s.examples || [],
          lex_domain: s.lex_domain || '',
          candidate_count: 1
        },
        provenance: {
          source_name: 'Open English WordNet 2024',
          license: 'CC-BY-4.0'
        }
      };
    }

    const candidates = lemmaPosIndex.get(key) || [];
    if (candidates.length === 0) {
      return {
        matched: false,
        source: 'oewn',
        reason: 'NOT_FOUND'
      };
    }

    const primary = candidates[0];
    return {
      source: 'oewn',
      source_version: '2024',
      source_record_id: `oewn_2024:${primary.synset_id}`,
      matched: true,
      evidence: {
        lemma: normWord,
        pos: normPos,
        synset_id: primary.synset_id,
        definition: primary.definition || primary.gloss || '',
        examples: primary.examples || [],
        lex_domain: primary.lex_domain || '',
        candidate_count: candidates.length,
        candidate_synset_ids: candidates.map(c => c.synset_id)
      },
      provenance: {
        source_name: 'Open English WordNet 2024',
        license: 'CC-BY-4.0'
      }
    };
  }
}

/**
 * 3. LEXiTRON Adapter (NECTEC LEXiTRON 2.0 etlex)
 */
export class LexitronAdapter {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.lexitronJsonPath = path.join(projectRoot, 'scripts/content-pipeline/sources/lexitron/lexitron-etlex.json');
    this.cache = null;
  }

  _load() {
    if (this.cache) return this.cache;
    const wordIndex = new Map();

    if (fs.existsSync(this.lexitronJsonPath)) {
      const records = JSON.parse(fs.readFileSync(this.lexitronJsonPath, 'utf8'));
      for (const r of records) {
        if (!r.esearch) continue;
        const key = r.esearch.toLowerCase();
        if (!wordIndex.has(key)) {
          wordIndex.set(key, []);
        }
        wordIndex.get(key).push(r);
      }
    }

    this.cache = wordIndex;
    return wordIndex;
  }

  getEvidence(headword, pos) {
    const wordIndex = this._load();
    const normWord = (headword || '').trim().toLowerCase();
    const normPos = (pos || '').trim().toLowerCase();

    const entries = wordIndex.get(normWord);
    if (!entries || entries.length === 0) {
      return {
        matched: false,
        source: 'lexitron_2_0',
        reason: 'NOT_FOUND'
      };
    }

    // Filter by POS if matching categories exist
    const allowedCats = POS_MAP_OEWN_TO_LEXITRON[normPos] || [];
    const posMatchedEntries = entries.filter(e => e.ecat && allowedCats.includes(e.ecat));

    const effectiveEntries = posMatchedEntries.length > 0 ? posMatchedEntries : entries;
    const translations = [...new Set(effectiveEntries.map(e => e.tentry).filter(Boolean))];
    const lexitronPos = [...new Set(effectiveEntries.map(e => e.ecat).filter(Boolean))];

    return {
      source: 'lexitron_2_0',
      source_version: '2.0',
      source_record_id: `lexitron:etlex:id:${effectiveEntries[0].id}`,
      matched: true,
      evidence: {
        headword: normWord,
        pos_matched: posMatchedEntries.length > 0,
        lexitron_pos: lexitronPos,
        translations,
        entry_count: effectiveEntries.length,
        total_word_entries: entries.length,
        sample_entries: effectiveEntries.slice(0, 5)
      },
      provenance: {
        source_name: 'NECTEC LEXiTRON 2.0 (etlex)',
        license: 'NECTEC LEXiTRON License Agreement (2003)',
        attribution: 'This product is created by the adaptation of LEXiTRON developed by NECTEC (http://www.nectec.or.th/).'
      }
    };
  }
}

import { loadCmudictSubset } from './cmudict-ipa.mjs';

/**
 * 4. CMUdict Adapter (Carnegie Mellon Pronouncing Dictionary 0.7b)
 */
export class CmudictAdapter {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.cache = null;
  }

  _load() {
    if (this.cache) return this.cache;
    const { lookup } = loadCmudictSubset(this.projectRoot);
    this.cache = lookup;
    return lookup;
  }

  getEvidence(headword) {
    const lookup = this._load();
    const normWord = (headword || '').trim().toLowerCase();

    const entries = lookup.get(normWord);
    if (!entries || entries.length === 0) {
      return {
        matched: false,
        source: 'cmudict',
        reason: 'NOT_FOUND'
      };
    }

    const primary = entries[0];
    return {
      source: 'cmudict',
      source_version: '0.7b',
      source_record_id: `cmudict:0.7b:${normWord}:line:${primary.line_number}`,
      matched: true,
      evidence: {
        headword: normWord,
        phonetic_ipa: primary.ipa,
        arpabet: primary.arpabet,
        variants_ipa: entries.map(e => e.ipa),
        variant_count: entries.length,
        has_multiple_variants: entries.length > 1
      },
      provenance: {
        source_name: 'CMU Pronouncing Dictionary (CMUdict 0.7b)',
        license: 'BSD-2-Clause'
      }
    };
  }
}

/**
 * 5. Frequency Adapter (NGSL 1.2, NAWL, TSL, BSL)
 */
export class FrequencyAdapter {
  constructor(projectRoot = PROJECT_ROOT) {
    this.projectRoot = projectRoot;
    this.ngslPath = path.join(projectRoot, 'scripts/content-pipeline/sources/ngsl/NGSL_12_stats.csv');
    this.nawlPath = path.join(projectRoot, 'scripts/content-pipeline/sources/nawl/NAWL_12_stats.csv');
    this.tslPath = path.join(projectRoot, 'scripts/content-pipeline/sources/tsl/TSL_12_stats.csv');
    this.bslPath = path.join(projectRoot, 'scripts/content-pipeline/sources/bsl/BSL_120_stats.csv');
    this.cache = null;
  }

  _load() {
    if (this.cache) return this.cache;
    const map = new Map();

    const loadCsv = (filePath, listName, version) => {
      if (!fs.existsSync(filePath)) return;
      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 4) {
          const word = parts[0].trim().toLowerCase();
          const rank = parseInt(parts[1], 10) || null;
          const sfi = parseFloat(parts[2]) || null;
          const freqPerMil = parseFloat(parts[3]) || null;
          if (!map.has(word)) {
            map.set(word, {
              list_name: listName,
              version,
              rank,
              sfi,
              freq_per_million: freqPerMil,
              license: 'CC-BY-SA-4.0'
            });
          }
        }
      }
    };

    loadCsv(this.ngslPath, 'NGSL', '1.2');
    loadCsv(this.nawlPath, 'NAWL', '1.2');
    loadCsv(this.tslPath, 'TSL', '1.2');
    loadCsv(this.bslPath, 'BSL', '1.20');

    this.cache = map;
    return map;
  }

  getEvidence(headword) {
    const map = this._load();
    const normWord = (headword || '').trim().toLowerCase();

    const found = map.get(normWord);
    if (!found) {
      return {
        matched: false,
        source: 'frequency_service_lists',
        reason: 'NOT_FOUND'
      };
    }

    return {
      source: found.list_name.toLowerCase(),
      source_version: found.version,
      source_record_id: `${found.list_name.toLowerCase()}:${found.version}:rank:${found.rank}`,
      matched: true,
      evidence: {
        headword: normWord,
        list_name: found.list_name,
        rank: found.rank,
        sfi: found.sfi,
        freq_per_million: found.freq_per_million
      },
      provenance: {
        source_name: `${found.list_name} (${found.version})`,
        license: found.license
      }
    };
  }
}
