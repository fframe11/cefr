/**
 * Prototype testing final completion pipeline on 100 sample units
 */
import fs from 'node:fs';
import path from 'node:path';
import { UnifiedEvidenceWarehouse } from './sources/unified-evidence-warehouse.mjs';

const projectRoot = process.cwd();
const warehouse = new UnifiedEvidenceWarehouse({ projectRoot, useExternalCache: true });
warehouse.loadAllSources();

const invRaw = JSON.parse(fs.readFileSync(path.join(projectRoot, 'reports/phase-6.2.36-inventory-accounting.json'), 'utf8'));
const units = invRaw.units.slice(0, 100);

console.log(`Processing ${units.length} units...`);
let resolvedCount = 0;

for (const u of units) {
  const ev = warehouse.getEvidenceForUnit(u.word, u.pos);
  const thai = ev.thai.length > 0 ? ev.thai[0].definition_th : null;
  const example = ev.example.length > 0 ? ev.example[0].sentence : null;
  const ipa = ev.pronunciation.length > 0 ? ev.pronunciation[0].phonetic_ipa : null;
  const defEn = ev.lexicon.length > 0 ? ev.lexicon[0].definition : null;
  
  if (thai && example && ipa && defEn) {
    resolvedCount++;
  }
}

console.log(`Fully resolved from existing sources alone: ${resolvedCount} / ${units.length}`);
