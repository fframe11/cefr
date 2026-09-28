/**
 * Open English WordNet (OEWN) 2024 Source Adapter (Pillar 2)
 *
 * Ingests:
 * - OEWN 2024 definitions, senses, relations, and synset keys
 *
 * Invariant: Preserves complete synset mappings and definitions across POS.
 */

import fs from 'node:fs';
import { BaseSourceAdapter } from './base-source-adapter.mjs';

const POS_MAP = {
  '1': 'noun',
  '2': 'verb',
  '3': 'adjective',
  '4': 'adverb',
  '5': 'adjective_satellite'
};

export class OewnSourceAdapter extends BaseSourceAdapter {
  constructor() {
    super({
      sourceName: 'Open English WordNet 2024',
      sourceVersion: '2024.1',
      sourceLicense: 'CC-BY-4.0',
      sourceUrl: 'https://en-word.net/'
    });
  }

  parseSenses(sensesText) {
    const lines = sensesText.trim().split(/\r?\n/);
    const records = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [senseKey, synsetOffset, senseNum, tagCnt] = line.split(/\s+/);
      if (!senseKey) continue;

      const pctIdx = senseKey.indexOf('%');
      if (pctIdx === -1) continue;

      const lemma = senseKey.slice(0, pctIdx).replace(/_/g, ' ').toLowerCase();
      const posCode = senseKey.charAt(pctIdx + 1);
      const pos = POS_MAP[posCode] || 'noun';

      records.push(
        this.createEvidenceRecord({
          sourceRecordId: `oewn_sense_${i}_${senseKey}`,
          originalValue: senseKey,
          normalizedValue: lemma,
          language: 'en',
          partOfSpeech: pos,
          senseIdentifier: senseKey,
          provenance: {
            synset_offset: synsetOffset,
            sense_number: senseNum,
            tag_count: tagCnt
          }
        })
      );
    }
    return records;
  }

  parseSynsets(synsetsJson) {
    const data = typeof synsetsJson === 'string' ? JSON.parse(synsetsJson) : synsetsJson;
    const synsetsObj = data.synsets || data;
    const entries = typeof synsetsObj === 'object' && !Array.isArray(synsetsObj)
      ? Object.values(synsetsObj)
      : synsetsObj;

    const records = [];

    for (let i = 0; i < entries.length; i++) {
      const s = entries[i];
      if (!s || !s.synset_id || !s.definition) continue;

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

        records.push(
          this.createEvidenceRecord({
            sourceRecordId: `oewn_synset_${s.synset_id}_${lemma}`,
            originalValue: lemma,
            normalizedValue: lemma,
            language: 'en',
            partOfSpeech: pos,
            senseIdentifier: s.synset_id,
            definition: s.definition,
            example: Array.isArray(s.examples) && s.examples.length > 0 ? s.examples[0] : null,
            provenance: {
              lex_domain: s.lex_domain,
              synset_id: s.synset_id,
              synonyms: words
            }
          })
        );
      }
    }
    return records;
  }

  parseFiles({ sensesPath, synsetsPath }) {
    let senseRecords = [];
    if (sensesPath && fs.existsSync(sensesPath)) {
      const sensesRaw = fs.readFileSync(sensesPath, 'utf8');
      senseRecords = this.parseSenses(sensesRaw);
    }

    let synsetRecords = [];
    if (synsetsPath && fs.existsSync(synsetsPath)) {
      const synsetsRaw = fs.readFileSync(synsetsPath, 'utf8');
      synsetRecords = this.parseSynsets(synsetsRaw);
    }

    const allRecords = [...senseRecords, ...synsetRecords];
    const uniqueLemmas = new Set(allRecords.map(r => r.normalized_value));
    const uniqueSenses = new Set(allRecords.map(r => r.sense_identifier).filter(Boolean));

    return {
      records_downloaded: allRecords.length,
      records_parsed: allRecords.length,
      records_rejected: 0,
      records_normalized: allRecords.length,
      unique_lemmas: uniqueLemmas.size,
      unique_senses: uniqueSenses.size,
      records: allRecords
    };
  }
}
