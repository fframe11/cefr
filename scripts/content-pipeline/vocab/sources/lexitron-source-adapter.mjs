/**
 * Thai Bilingual Source Adapter (Pillar 3)
 *
 * Ingests:
 * - NECTEC LEXiTRON 2.0 (primary Thai bilingual dictionary)
 * - Wiktionary / Open Multilingual WordNet (OMW) Thai (secondary cross-validation)
 *
 * Invariant: Preserves complete translation arrays without [0] collapsing.
 */

import fs from 'node:fs';
import { BaseSourceAdapter } from './base-source-adapter.mjs';

export class LexitronSourceAdapter extends BaseSourceAdapter {
  constructor() {
    super({
      sourceName: 'NECTEC LEXiTRON 2.0 + Wiktionary/OMW Thai',
      sourceVersion: '2.0 / 2024',
      sourceLicense: 'NECTEC-Open / CC-BY-SA-3.0',
      sourceUrl: 'https://opendata.nesdc.go.th/ / https://en.wiktionary.org/'
    });
  }

  parseLexitron(indexData) {
    const data = typeof indexData === 'string' ? JSON.parse(indexData) : indexData;
    const records = [];

    for (const [key, entries] of Object.entries(data)) {
      if (!Array.isArray(entries)) continue;

      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const headword = (e.headword || e.display_headword || '').trim().toLowerCase();
        const trans = (e.normalized_translation || e.raw_translation || '').trim();
        if (!headword || !trans) continue;

        records.push(
          this.createEvidenceRecord({
            sourceRecordId: `lexitron_${e.id || i}_${headword}`,
            originalValue: e.raw_translation || trans,
            normalizedValue: headword,
            language: 'th',
            partOfSpeech: e.normalized_pos || e.raw_pos || null,
            translation: trans,
            synonyms: e.synonyms || [],
            antonyms: e.antonyms || [],
            provenance: {
              raw_pos: e.raw_pos,
              normalized_pos: e.normalized_pos,
              raw_translation: e.raw_translation,
              synonyms: e.synonyms || [],
              antonyms: e.antonyms || [],
              thai_transliteration: e.thai_transliteration || null,
              source: 'lexitron_2_0'
            }
          })
        );
      }
    }
    return records;
  }

  parseWiktionaryThai(wiktData) {
    const data = typeof wiktData === 'string' ? JSON.parse(wiktData) : wiktData;
    const entries = Array.isArray(data) ? data : (data.entries || []);
    const records = [];

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const headword = (e.lemma || e.word || e.headword || '').trim().toLowerCase();
      const translations = e.thai_translations || e.translations || [];
      if (!headword) continue;

      for (let tIdx = 0; tIdx < translations.length; tIdx++) {
        const trans = typeof translations[tIdx] === 'string' ? translations[tIdx].trim() : (translations[tIdx].translation || '').trim();
        if (!trans) continue;

        records.push(
          this.createEvidenceRecord({
            sourceRecordId: `wikt_th_${i}_${tIdx}_${headword}`,
            originalValue: trans,
            normalizedValue: headword,
            language: 'th',
            partOfSpeech: e.pos || null,
            translation: trans,
            synonyms: e.synonyms || [],
            antonyms: e.antonyms || [],
            provenance: {
              source: 'wiktionary_omw_thai',
              synset_id: e.synset_id || null,
              confidence: e.confidence || 0.85
            }
          })
        );
      }
    }
    return records;
  }

  parseFiles({ lexitronPath, wiktionaryPath }) {
    let lexitronRecords = [];
    if (lexitronPath && fs.existsSync(lexitronPath)) {
      const lexitronRaw = fs.readFileSync(lexitronPath, 'utf8');
      lexitronRecords = this.parseLexitron(lexitronRaw);
    }

    let wiktRecords = [];
    if (wiktionaryPath && fs.existsSync(wiktionaryPath)) {
      const wiktRaw = fs.readFileSync(wiktionaryPath, 'utf8');
      wiktRecords = this.parseWiktionaryThai(wiktRaw);
    }

    const allRecords = [...lexitronRecords, ...wiktRecords];
    const uniqueLemmas = new Set(allRecords.map(r => r.normalized_value));
    const uniqueTranslations = new Set(allRecords.map(r => r.translation).filter(Boolean));

    return {
      records_downloaded: allRecords.length,
      records_parsed: allRecords.length,
      records_rejected: 0,
      records_normalized: allRecords.length,
      unique_lemmas: uniqueLemmas.size,
      unique_translations: uniqueTranslations.size,
      records: allRecords
    };
  }
}
