/**
 * CEFR Source Adapter (Pillar 1)
 *
 * Ingests:
 * - CEFR-J 1.5 (A1-B2)
 * - Octanove 1.0 (C1-C2)
 */

import fs from 'node:fs';
import { BaseSourceAdapter } from './base-source-adapter.mjs';

export class CefrSourceAdapter extends BaseSourceAdapter {
  constructor() {
    super({
      sourceName: 'CEFR-J 1.5 + Octanove 1.0',
      sourceVersion: '1.5 / 1.0',
      sourceLicense: 'CC-BY-4.0',
      sourceUrl: 'http://www.cefr-j.org/ / https://github.com/openlanguageprofiles/olp-en-cefrj'
    });
  }

  parseCsv(content, sourceTag) {
    const lines = content.trim().split(/\r?\n/);
    const records = [];
    const header = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      const headwordRaw = parts[0]?.trim();
      const pos = parts[1]?.trim().toLowerCase();
      const cefr = parts[2]?.trim().toUpperCase();

      if (!headwordRaw || !cefr) continue;

      // Handle slash-variants, e.g. "a.m./A.M./am/AM"
      const variants = headwordRaw.split('/');
      for (const v of variants) {
        const clean = v.trim().toLowerCase();
        if (!clean) continue;

        records.push(
          this.createEvidenceRecord({
            sourceRecordId: `${sourceTag}_${i}_${clean}`,
            originalValue: headwordRaw,
            normalizedValue: clean,
            language: 'en',
            partOfSpeech: pos,
            cefrLevel: cefr,
            provenance: {
              source_file: sourceTag,
              line_number: i,
              core_inventory_1: parts[3]?.trim() || null,
              core_inventory_2: parts[4]?.trim() || null
            }
          })
        );
      }
    }
    return records;
  }

  parseFiles({ cefrjPath, octanovePath }) {
    const cefrjRaw = fs.readFileSync(cefrjPath, 'utf8');
    const octanoveRaw = fs.readFileSync(octanovePath, 'utf8');

    const cefrjRecords = this.parseCsv(cefrjRaw, 'cefrj_1.5');
    const octanoveRecords = this.parseCsv(octanoveRaw, 'octanove_1.0');

    const allRecords = [...cefrjRecords, ...octanoveRecords];
    const uniqueLemmas = new Set(allRecords.map(r => r.normalized_value));

    return {
      records_downloaded: allRecords.length,
      records_parsed: allRecords.length,
      records_rejected: 0,
      records_normalized: allRecords.length,
      unique_lemmas: uniqueLemmas.size,
      records: allRecords
    };
  }
}
