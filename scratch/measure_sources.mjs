import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

const p39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const units = p39.units;
const blocked = units.filter(u => u.routing_status !== 'AUTO_CANDIDATE');

console.log('--- BASELINE ---');
console.log('Total units:', units.length);
console.log('AUTO_CANDIDATE:', units.filter(u => u.routing_status === 'AUTO_CANDIDATE').length);
console.log('REVIEW_REQUIRED:', units.filter(u => u.routing_status === 'REVIEW_REQUIRED').length);
console.log('HOLD:', units.filter(u => u.routing_status === 'HOLD').length);

// Load sources
const oewnData = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json'), 'utf8')).synsets;
const tatoebaBase = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/tatoeba/2024/tatoeba-sentences.json'), 'utf8'));
const tatoebaExpanded = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'data/lexical-sources/tatoeba/2024/tatoeba-expanded-sentences.json'), 'utf8'));
const allTatoeba = [...tatoebaBase, ...tatoebaExpanded];

// Tatoeba map by word
const tatoebaMap = new Map();
for (const item of allTatoeba) {
  const w = (item.lemma || item.word || '').toLowerCase();
  if (w) {
    if (!tatoebaMap.has(w)) tatoebaMap.set(w, []);
    tatoebaMap.get(w).push(item);
  }
}

// OEWN map by word
const oewnWordMap = new Map();
for (const [id, s] of Object.entries(oewnData)) {
  const words = (s.words || []).map(w => String(w).toLowerCase());
  for (const w of words) {
    if (!oewnWordMap.has(w)) oewnWordMap.set(w, []);
    oewnWordMap.get(w).push(s);
  }
}

// CMUdict check
const cmudictPath = path.join(PROJECT_ROOT, 'data/lexical-sources/cmudict/0.7b/cmudict-0.7b-cefr-subset.dict');
const cmudictLines = fs.readFileSync(cmudictPath, 'utf8').split('\n');
const cmudictWords = new Set();
for (const line of cmudictLines) {
  const parts = line.trim().split(/\s+/);
  if (parts[0]) cmudictWords.add(parts[0].toLowerCase());
}

console.log('Tatoeba total sentences:', allTatoeba.length);
console.log('Tatoeba unique words mapped:', tatoebaMap.size);
console.log('CMUdict words in subset:', cmudictWords.size);
