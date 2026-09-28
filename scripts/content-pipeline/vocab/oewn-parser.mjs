import fs from 'node:fs';
import path from 'node:path';

export const LEX_FILENUM_TO_DOMAIN = Object.freeze({
  '00': 'adj.all',
  '01': 'adj.pert',
  '02': 'adv.all',
  '03': 'noun.Tops',
  '04': 'noun.act',
  '05': 'noun.animal',
  '06': 'noun.artifact',
  '07': 'noun.attribute',
  '08': 'noun.body',
  '09': 'noun.cognition',
  '10': 'noun.communication',
  '11': 'noun.event',
  '12': 'noun.feeling',
  '13': 'noun.food',
  '14': 'noun.group',
  '15': 'noun.location',
  '16': 'noun.motive',
  '17': 'noun.object',
  '18': 'noun.person',
  '19': 'noun.phenomenon',
  '20': 'noun.plant',
  '21': 'noun.possession',
  '22': 'noun.process',
  '23': 'noun.quantity',
  '24': 'noun.relation',
  '25': 'noun.shape',
  '26': 'noun.state',
  '27': 'noun.substance',
  '28': 'noun.time',
  '29': 'verb.body',
  '30': 'verb.change',
  '31': 'verb.cognition',
  '32': 'verb.communication',
  '33': 'verb.competition',
  '34': 'verb.consumption',
  '35': 'verb.contact',
  '36': 'verb.creation',
  '37': 'verb.emotion',
  '38': 'verb.motion',
  '39': 'verb.perception',
  '40': 'verb.possession',
  '41': 'verb.social',
  '42': 'verb.stative',
  '43': 'verb.weather',
  '44': 'adj.ppl',
});

const SS_TYPE_TO_POS = Object.freeze({
  n: 'noun',
  v: 'verb',
  a: 'adjective',
  s: 'adjective',
  r: 'adverb',
});

/**
 * Parses a single WNDB data.<pos> line into a structured synset object.
 */
export function parseWndbDataLine(line) {
  const trimmed = String(line ?? '').trim();
  if (!/^[0-9]{8}\s/.test(trimmed)) return null;

  const pipeIdx = trimmed.indexOf('|');
  if (pipeIdx === -1) return null;

  const metaPart = trimmed.slice(0, pipeIdx).trim();
  const glossPart = trimmed.slice(pipeIdx + 1).trim();

  const tokens = metaPart.split(/\s+/);
  if (tokens.length < 4) return null;

  const synsetOffset = tokens[0];
  const lexFilenum = tokens[1];
  const ssType = tokens[2];
  const posSuffix = ssType === 's' ? 's' : ssType;
  const synsetId = `${synsetOffset}-${posSuffix}`;
  const canonicalPos = SS_TYPE_TO_POS[ssType] || null;
  if (!canonicalPos) return null;

  const wordCount = Number.parseInt(tokens[3], 16);
  if (Number.isNaN(wordCount) || wordCount <= 0) return null;

  const words = [];
  let cursor = 4;
  for (let i = 0; i < wordCount; i++) {
    const rawWord = tokens[cursor];
    cursor += 2; // word + lex_id
    if (!rawWord) continue;
    const cleanedWord = rawWord
      .replace(/\((?:p|a|ip)\)$/i, '')
      .replace(/_/g, ' ')
      .normalize('NFC')
      .trim();
    if (cleanedWord && !words.includes(cleanedWord)) {
      words.push(cleanedWord);
    }
  }

  const pCntRaw = tokens[cursor];
  cursor += 1;
  const ptrCount = Number.parseInt(pCntRaw ?? '0', 10) || 0;

  const antonymSynsetIds = [];
  for (let p = 0; p < ptrCount; p++) {
    const ptrSymbol = tokens[cursor];
    const targetOffset = tokens[cursor + 1];
    const targetPos = tokens[cursor + 2];
    cursor += 4;
    if (ptrSymbol === '!' && targetOffset && targetPos) {
      const targetId = `${targetOffset}-${targetPos}`;
      if (!antonymSynsetIds.includes(targetId)) {
        antonymSynsetIds.push(targetId);
      }
    }
  }

  // Parse gloss into definition and quoted examples
  const examples = [];
  const quoteRegex = /"([^"]+)"/g;
  let match;
  while ((match = quoteRegex.exec(glossPart)) !== null) {
    const ex = match[1].normalize('NFC').trim();
    if (ex && !examples.includes(ex)) {
      examples.push(ex);
    }
  }

  const firstQuoteIdx = glossPart.indexOf('"');
  const rawDef = firstQuoteIdx >= 0 ? glossPart.slice(0, firstQuoteIdx) : glossPart;
  const definition = rawDef
    .replace(/[;\s]+$/, '')
    .normalize('NFC')
    .trim();

  return {
    synset_id: synsetId,
    synset_offset: synsetOffset,
    ss_type: ssType,
    part_of_speech: canonicalPos,
    lex_filenum: lexFilenum,
    lex_domain: LEX_FILENUM_TO_DOMAIN[lexFilenum] || 'unknown',
    words,
    antonym_synset_ids: antonymSynsetIds,
    definition: definition || null,
    examples,
  };
}

/**
 * Loads OEWN 2024 synsets and multi-word expressions either from extracted WNDB files
 * or from the committed filtered cache `oewn-2024-cefr-synsets.json`.
 */
export function loadOewnSynsetDatabase({
  projectRoot,
  requiredSynsetIds = null,
  writeCacheIfExtracted = false,
} = {}) {
  const extractedDir = path.resolve(
    projectRoot,
    'scripts/content-pipeline/sources/oewn/extracted/oewn2024'
  );
  const cachePath = path.resolve(
    projectRoot,
    'scripts/content-pipeline/sources/oewn/oewn-2024-cefr-synsets.json'
  );

  const dataFiles = ['data.noun', 'data.verb', 'data.adj', 'data.adv'];
  const hasAllExtracted = dataFiles.every((f) => fs.existsSync(path.join(extractedDir, f)));

  if (!hasAllExtracted && fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const synsetMap = new Map(Object.entries(cached.synsets || {}));
    return {
      synsetMap,
      multiWordEntries: cached.multi_word_entries || [],
      sourceMode: 'cached_subset_json',
      totalSynsetsLoaded: synsetMap.size,
    };
  }

  if (!hasAllExtracted) {
    throw new Error(
      `Neither extracted OEWN 2024 data files (${extractedDir}) nor cached synsets (${cachePath}) were found.`
    );
  }

  const allSynsets = new Map();
  const multiWordEntries = [];

  for (const file of dataFiles) {
    const filePath = path.join(extractedDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const parsed = parseWndbDataLine(line);
      if (!parsed) continue;
      allSynsets.set(parsed.synset_id, parsed);

      // Also index satellite adjectives ('s') under '-a' if referenced as '-a' or vice versa
      if (parsed.ss_type === 's') {
        allSynsets.set(`${parsed.synset_offset}-a`, parsed);
      } else if (parsed.ss_type === 'a') {
        allSynsets.set(`${parsed.synset_offset}-s`, parsed);
      }

      // Collect clean 2-3 word lexicalized phrases for collocation matching
      for (const w of parsed.words) {
        if (w.includes(' ') && /^[a-z]+(?:[- ][a-z]+){1,2}$/.test(w) && w.length <= 45) {
          multiWordEntries.push({
            phrase: w,
            synset_id: parsed.synset_id,
            part_of_speech: parsed.part_of_speech,
            lex_domain: parsed.lex_domain,
            definition: parsed.definition,
          });
        }
      }
    }
  }

  if (writeCacheIfExtracted && requiredSynsetIds && requiredSynsetIds.size > 0) {
    const filteredSynsets = {};
    const antonymIdsToInclude = new Set();

    for (const id of requiredSynsetIds) {
      const syn = allSynsets.get(id);
      if (syn) {
        filteredSynsets[id] = syn;
        for (const antId of syn.antonym_synset_ids) {
          antonymIdsToInclude.add(antId);
        }
      }
    }
    for (const antId of antonymIdsToInclude) {
      const syn = allSynsets.get(antId);
      if (syn && !filteredSynsets[antId]) {
        filteredSynsets[antId] = {
          synset_id: syn.synset_id,
          part_of_speech: syn.part_of_speech,
          lex_domain: syn.lex_domain,
          words: syn.words,
          antonym_synset_ids: [],
          definition: syn.definition,
          examples: [],
        };
      }
    }

    const cachePayload = {
      schema_version: '1.0.0',
      source: 'Open English WordNet 2024 (CC BY 4.0)',
      synset_count: Object.keys(filteredSynsets).length,
      multi_word_entries: multiWordEntries,
      synsets: filteredSynsets,
    };
    fs.writeFileSync(cachePath, JSON.stringify(cachePayload));
  }

  return {
    synsetMap: allSynsets,
    multiWordEntries,
    sourceMode: 'extracted_wndb',
    totalSynsetsLoaded: allSynsets.size,
  };
}
