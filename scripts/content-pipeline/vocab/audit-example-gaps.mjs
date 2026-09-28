import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchLemmaInExample } from './morphology-matcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

const report39 = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'reports/phase-6.2.39-full-universe-routing.json'), 'utf8'));
const oewnSynsets = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json'), 'utf8')).synsets;

const exNotFound = report39.units.filter(u => u.primary_blocker === 'EXAMPLE_NOT_FOUND');
console.log(`Total units to analyze: ${exNotFound.length}`);

const categories = {
  SOURCE_DATA_GAP: 0,
  TRUE_SOURCE_GAP: 0,
  QUALITY_REJECTED: 0,
  MATCHER_LIMITATION: 0,
  MORPHOLOGY_UNRESOLVED: 0,
  OTHER: 0,
};

const samples = {
  SOURCE_DATA_GAP: [],
  TRUE_SOURCE_GAP: [],
  QUALITY_REJECTED: [],
  MATCHER_LIMITATION: [],
  MORPHOLOGY_UNRESOLVED: [],
  OTHER: [],
};

// Build index of words to synsets
const wordToSynsets = new Map();
for (const [id, s] of Object.entries(oewnSynsets)) {
  const words = (s.words || []).map(w => String(w).toLowerCase());
  for (const w of words) {
    if (!wordToSynsets.has(w)) wordToSynsets.set(w, []);
    wordToSynsets.get(w).push({
      synset_id: id,
      pos: s.pos,
      definition: s.definition,
      examples: s.examples || [],
      words,
    });
  }
}

for (const u of exNotFound) {
  const word = u.word.toLowerCase();
  const pos = u.pos;

  const synsets = wordToSynsets.get(word) || [];

  if (synsets.length === 0) {
    // Word does not exist in any OEWN synset
    categories.TRUE_SOURCE_GAP++;
    if (samples.TRUE_SOURCE_GAP.length < 5) samples.TRUE_SOURCE_GAP.push({ word, pos, cefr: u.cefr, reason: 'Word absent from OEWN synsets' });
    continue;
  }

  // Check if any matching synset has examples
  const synsetsWithExamples = synsets.filter(s => s.examples.length > 0);
  if (synsetsWithExamples.length === 0) {
    // Word exists in WordNet, but WordNet authors provided 0 example strings for all its synsets
    categories.SOURCE_DATA_GAP++;
    if (samples.SOURCE_DATA_GAP.length < 5) samples.SOURCE_DATA_GAP.push({ word, pos, cefr: u.cefr, reason: 'WordNet synsets have 0 example sentences' });
    continue;
  }

  // Matching synsets DO have examples, but why didn't our pipeline match them?
  let qualityRejected = false;
  let matcherLimitation = false;
  let morphologyUnresolved = false;
  let exampleFoundOtherWord = false;

  for (const s of synsetsWithExamples) {
    for (const ex of s.examples) {
      const matchRes = matchLemmaInExample({ lemma: word, pos, example: ex });
      const rawText = ex.toLowerCase();

      // Check if raw word appears with word boundaries
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasRaw = new RegExp(`\\b${escaped}\\b`, 'i').test(rawText);

      if (hasRaw) {
        if (matchRes.matched) {
          // It matched! Why was it rejected? Check quality rules:
          const wordsInEx = ex.trim().split(/\s+/);
          const hasTerminalPunct = /[.?!]["']?$/.test(ex.trim());
          if (wordsInEx.length < 4 || wordsInEx.length > 35 || !hasTerminalPunct) {
            qualityRejected = true;
          }
        } else {
          // Word literally exists in the sentence string, but morphology matcher failed it!
          // (e.g. false derivative blacklist or POS tag mismatch or punctuation inside token)
          matcherLimitation = true;
        }
      } else {
        // Maybe an inflection appears in sentence?
        const inflections = [word + 's', word + 'ed', word + 'ing', word + 'es', word + 'd', word + 'er', word + 'est'];
        const hasInf = inflections.some(inf => new RegExp(`\\b${inf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(rawText));
        if (hasInf) {
          morphologyUnresolved = true;
        } else {
          // The example sentence in the synset illustrates a DIFFERENT synonym in the synset, not this word!
          // e.g. synset words = ["big", "large"], example = "A large elephant." -> illustrates "large", but not "big"!
          exampleFoundOtherWord = true;
        }
      }
    }
  }

  if (matcherLimitation) {
    categories.MATCHER_LIMITATION++;
    if (samples.MATCHER_LIMITATION.length < 5) samples.MATCHER_LIMITATION.push({ word, pos, cefr: u.cefr, reason: 'Word present in synset example but rejected by matcher logic' });
  } else if (morphologyUnresolved) {
    categories.MORPHOLOGY_UNRESOLVED++;
    if (samples.MORPHOLOGY_UNRESOLVED.length < 5) samples.MORPHOLOGY_UNRESOLVED.push({ word, pos, cefr: u.cefr, reason: 'Inflected form in sentence not resolved to lemma' });
  } else if (qualityRejected) {
    categories.QUALITY_REJECTED++;
    if (samples.QUALITY_REJECTED.length < 5) samples.QUALITY_REJECTED.push({ word, pos, cefr: u.cefr, reason: 'Example failed length (<4 or >35) or punctuation check' });
  } else if (exampleFoundOtherWord) {
    // WordNet synset example illustrates another member of the synset, not target lemma
    categories.TRUE_SOURCE_GAP++;
    if (samples.TRUE_SOURCE_GAP.length < 5) samples.TRUE_SOURCE_GAP.push({ word, pos, cefr: u.cefr, reason: 'Synset example illustrates a co-synonym, not target lemma' });
  } else {
    categories.OTHER++;
    if (samples.OTHER.length < 5) samples.OTHER.push({ word, pos, cefr: u.cefr });
  }
}

console.log('Final Taxonomy Breakdown:');
console.log(categories);

const total = Object.values(categories).reduce((a, b) => a + b, 0);
console.log(`Sum check: ${total} / ${exNotFound.length}`);

for (const [cat, count] of Object.entries(categories)) {
  console.log(`- ${cat}: ${count} (${((count / total) * 100).toFixed(2)}%)`);
}

console.log('\nSamples:');
console.log(JSON.stringify(samples, null, 2));
