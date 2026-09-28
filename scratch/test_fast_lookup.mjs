import fs from 'node:fs';
import path from 'node:path';
import { UnifiedEvidenceWarehouse } from '../scripts/content-pipeline/vocab/sources/unified-evidence-warehouse.mjs';
import { arpabetToIpa } from '../scripts/content-pipeline/vocab/cmudict-ipa.mjs';

const projectRoot = process.cwd();
const startTime = Date.now();

console.log('Loading evidence warehouse...');
const warehouse = new UnifiedEvidenceWarehouse({ projectRoot, useExternalCache: true });
warehouse.loadAllSources();

console.log('Loading OEWN synsets and building offset index...');
const synsetsRaw = JSON.parse(fs.readFileSync(path.join(projectRoot, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json'), 'utf8')).synsets;
const synsetIndex = new Map();
for (const [k, v] of Object.entries(synsetsRaw)) {
  if (v.synset_offset && !synsetIndex.has(v.synset_offset)) {
    synsetIndex.set(v.synset_offset, v);
  }
}

console.log('Loading 10,021 universe...');
const invRaw = JSON.parse(fs.readFileSync(path.join(projectRoot, 'reports/phase-6.2.36-inventory-accounting.json'), 'utf8'));
const units = invRaw.units || [];

let fullCount = 0;
let missingThai = 0;
let missingExample = 0;
let missingIpa = 0;
let missingDefEn = 0;

for (const u of units) {
  const ev = warehouse.getEvidenceForUnit(u.word, u.pos);
  const thai = ev.thai.length > 0 ? ev.thai[0].translation : null;
  const example = ev.example.length > 0 ? ev.example[0].example : null;
  const ipa = ev.pronunciation.length > 0 ? arpabetToIpa(ev.pronunciation[0].pronunciation) : null;
  
  let defEn = null;
  if (ev.lexicon.length > 0) {
    const offset = ev.lexicon[0].provenance?.synset_offset;
    if (offset && synsetIndex.has(offset)) {
      defEn = synsetIndex.get(offset).definition;
    }
  }

  if (!thai) missingThai++;
  if (!example) missingExample++;
  if (!ipa) missingIpa++;
  if (!defEn) missingDefEn++;

  if (thai && example && ipa && defEn) {
    fullCount++;
  }
}

const duration = Date.now() - startTime;
console.log(`Execution completed in ${duration}ms (${(duration/1000).toFixed(1)}s)`);
console.log('Total universe:', units.length);
console.log('Fully populated from source joins directly:', fullCount, '/', units.length, '(', (fullCount/units.length*100).toFixed(1), '%)');
console.log('Missing Thai:', missingThai);
console.log('Missing Example:', missingExample);
console.log('Missing IPA:', missingIpa);
console.log('Missing English Def:', missingDefEn);
