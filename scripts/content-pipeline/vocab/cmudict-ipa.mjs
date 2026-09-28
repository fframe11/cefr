import fs from 'node:fs';
import path from 'node:path';
import { computeSha256 } from './core.mjs';

export const CMUDICT_SOURCE_METADATA = Object.freeze({
  source_id: 'cmudict',
  source_name: 'CMU Pronouncing Dictionary (CMUdict)',
  version: '0.7b',
  official_url: 'http://www.speech.cs.cmu.edu/cgi-bin/cmudict',
  repository_url: 'https://github.com/cmusphinx/cmudict',
  download_url: 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict',
  license: 'BSD-2-Clause',
  license_url: 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/LICENSE',
  license_classification: 'GREEN',
  commercial_use: true,
  modification: true,
  redistribution: true,
  attribution:
    'Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted under BSD-2-Clause terms.',
  local_path: 'scripts/content-pipeline/sources/cmudict/cmudict-0.7b-cefr-subset.dict',
  license_file_path: 'scripts/content-pipeline/sources/cmudict/LICENSE',
});

const ARPABET_CONSONANT_TO_IPA = Object.freeze({
  B: 'b',
  CH: 'tʃ',
  D: 'd',
  DH: 'ð',
  F: 'f',
  G: 'ɡ',
  HH: 'h',
  JH: 'dʒ',
  K: 'k',
  L: 'l',
  M: 'm',
  N: 'n',
  NG: 'ŋ',
  P: 'p',
  R: 'ɹ',
  S: 's',
  SH: 'ʃ',
  T: 't',
  TH: 'θ',
  V: 'v',
  W: 'w',
  Y: 'j',
  Z: 'z',
  ZH: 'ʒ',
});

const ARPABET_VOWEL_TO_IPA = Object.freeze({
  AA0: 'ɑ',
  AA1: 'ɑː',
  AA2: 'ɑː',
  AE0: 'æ',
  AE1: 'æ',
  AE2: 'æ',
  AH0: 'ə',
  AH1: 'ʌ',
  AH2: 'ʌ',
  AO0: 'ɔ',
  AO1: 'ɔː',
  AO2: 'ɔː',
  AW0: 'aʊ',
  AW1: 'aʊ',
  AW2: 'aʊ',
  AY0: 'aɪ',
  AY1: 'aɪ',
  AY2: 'aɪ',
  EH0: 'e',
  EH1: 'e',
  EH2: 'e',
  ER0: 'əɹ',
  ER1: 'ɜːɹ',
  ER2: 'ɜːɹ',
  EY0: 'eɪ',
  EY1: 'eɪ',
  EY2: 'eɪ',
  IH0: 'ɪ',
  IH1: 'ɪ',
  IH2: 'ɪ',
  IY0: 'i',
  IY1: 'iː',
  IY2: 'iː',
  OW0: 'oʊ',
  OW1: 'oʊ',
  OW2: 'oʊ',
  OY0: 'ɔɪ',
  OY1: 'ɔɪ',
  OY2: 'ɔɪ',
  UH0: 'ʊ',
  UH1: 'ʊ',
  UH2: 'ʊ',
  UW0: 'u',
  UW1: 'uː',
  UW2: 'uː',
});

/**
 * English heteronyms whose pronunciation changes by part of speech or sense
 * (e.g., noun 'record' /ˈɹekəɹd/ vs verb 'record' /ɹɪˈkɔːɹd/, 'lead' /liːd/ vs /led/).
 * These must NEVER be auto-approved without human POS/sense verification.
 */
export const ENGLISH_HETERONYM_LEMMAS = new Set([
  'abuse',
  'advocate',
  'alternate',
  'appropriate',
  'articulate',
  'associate',
  'attribute',
  'bass',
  'bow',
  'close',
  'combine',
  'compact',
  'complex',
  'compound',
  'compress',
  'concert',
  'conduct',
  'conflict',
  'console',
  'construct',
  'content',
  'contest',
  'contract',
  'contrast',
  'convert',
  'convict',
  'coordinate',
  'decrease',
  'default',
  'defect',
  'delegate',
  'deliberate',
  'desert',
  'digest',
  'dove',
  'duplicate',
  'elaborate',
  'Entrance',
  'entrance',
  'estimate',
  'excuse',
  'exploit',
  'export',
  'extract',
  'graduate',
  'house',
  'impact',
  'import',
  'incense',
  'incline',
  'increase',
  'insert',
  'insult',
  'intimate',
  'invalid',
  'lead',
  'live',
  'minute',
  'moderate',
  'object',
  'perfect',
  'permit',
  'polish',
  'present',
  'proceeds',
  'produce',
  'project',
  'protest',
  'read',
  'rebel',
  'record',
  'refill',
  'refund',
  'refuse',
  'reject',
  'relay',
  'research',
  'resume',
  'row',
  'separate',
  'sewer',
  'sow',
  'subject',
  'suspect',
  'syndicate',
  'tear',
  'transfer',
  'transport',
  'update',
  'upgrade',
  'upset',
  'use',
  'wind',
  'wound',
]);

/**
 * Converts an ARPAbet phoneme sequence (e.g. "AH0 B AE1 N D AH0 N") into a slash-delimited IPA string ("/əˈbændən/").
 */
export function arpabetToIpa(arpabetStr, { wrapSlashes = true } = {}) {
  const tokens = String(arpabetStr ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return null;

  const parsed = tokens.map((tok) => {
    const vowelMatch = /^([A-Z]+)([012])$/.exec(tok);
    if (vowelMatch) {
      const ipa = ARPABET_VOWEL_TO_IPA[tok];
      if (!ipa) return { valid: false, raw: tok };
      return {
        valid: true,
        isVowel: true,
        stress: Number(vowelMatch[2]),
        ipa,
      };
    }
    const consIpa = ARPABET_CONSONANT_TO_IPA[tok];
    if (!consIpa) return { valid: false, raw: tok };
    return {
      valid: true,
      isVowel: false,
      stress: 0,
      ipa: consIpa,
    };
  });

  if (parsed.some((p) => !p.valid)) {
    return null;
  }

  const vowelCount = parsed.filter((p) => p.isVowel).length;
  const out = [];

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    if (p.isVowel && vowelCount > 1 && (p.stress === 1 || p.stress === 2)) {
      const marker = p.stress === 1 ? 'ˈ' : 'ˌ';
      // Place stress marker before preceding consonant onset (1 consonant before vowel if preceded by another vowel or word start)
      if (out.length > 0 && !parsed[i - 1].isVowel) {
        const prevCons = out.pop();
        out.push(marker + prevCons);
      } else {
        out.push(marker);
      }
    }
    out.push(p.ipa);
  }

  const joined = out.join('');
  return wrapSlashes ? `/${joined}/` : joined;
}

/**
 * Parses CMUdict format lines ("word H E1 L OW0" or "word(2) ...") into a Map<lowercaseWord, Array<{raw_word, variant_index, arpabet, ipa, line_number}>>.
 */
export function parseCmudictText(cmudictText) {
  const lookup = new Map();
  const lines = String(cmudictText ?? '').split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(';;;')) continue;

    // Strip inline comment if present
    const cleanLine = line.split('#')[0].trim();
    const match = /^([^\s(]+)(?:\((\d+)\))?\s+(.+)$/.exec(cleanLine);
    if (!match) continue;

    const rawWord = match[1].toLowerCase();
    const variantIndex = match[2] ? Number.parseInt(match[2], 10) : 1;
    const arpabet = match[3].trim();
    const ipa = arpabetToIpa(arpabet);
    if (!ipa) continue;

    if (!lookup.has(rawWord)) {
      lookup.set(rawWord, []);
    }
    lookup.get(rawWord).push({
      raw_word: rawWord,
      variant_index: variantIndex,
      arpabet,
      ipa,
      line_number: i + 1,
    });
  }

  return lookup;
}

/**
 * Resolves pronunciation metadata for a vocabulary candidate from a parsed CMUdict lookup.
 * Never fabricates IPA. Explicitly flags heteronyms and multi-variant pronunciations.
 */
export function resolvePronunciationFromCmudict(candidate, cmudictLookup) {
  if (!cmudictLookup || cmudictLookup.size === 0) {
    return {
      phonetic_ipa: null,
      pronunciation_source: null,
      pronunciation_source_version: null,
      pronunciation_confidence: 'UNRESOLVED',
      pronunciation_review_status: 'UNRESOLVED',
      pronunciation_variants_ipa: [],
      provenance: {
        status: 'UNRESOLVED_NO_SOURCE_LOADED',
        source: null,
        license: null,
      },
    };
  }

  const wordLower = String(candidate.word || '').toLowerCase().trim();
  const lemmaLower = String(candidate.lemma || '').toLowerCase().trim();
  const variants = candidate.orthographic_variants || [wordLower, lemmaLower];

  let matchedEntries = null;
  let matchedLookupToken = null;

  for (const probe of [wordLower, lemmaLower, ...variants.map((v) => String(v).toLowerCase().trim())]) {
    if (probe && cmudictLookup.has(probe)) {
      matchedEntries = cmudictLookup.get(probe);
      matchedLookupToken = probe;
      break;
    }
  }

  // Case 1: Direct word/lemma match in CMUdict
  if (matchedEntries && matchedEntries.length > 0) {
    const primary = matchedEntries[0];
    const allIpaVariants = [...new Set(matchedEntries.map((m) => m.ipa))];
    const isHeteronym =
      ENGLISH_HETERONYM_LEMMAS.has(lemmaLower) || ENGLISH_HETERONYM_LEMMAS.has(wordLower);

    if (isHeteronym) {
      return {
        phonetic_ipa: primary.ipa,
        pronunciation_source: CMUDICT_SOURCE_METADATA.source_id,
        pronunciation_source_version: CMUDICT_SOURCE_METADATA.version,
        pronunciation_confidence: 'AMBIGUOUS_HETERONYM',
        pronunciation_review_status: 'REVIEW_REQUIRED',
        pronunciation_variants_ipa: allIpaVariants,
        provenance: {
          status: 'CMUDICT_HETERONYM_REQUIRES_POS_SENSE_REVIEW',
          source: CMUDICT_SOURCE_METADATA.source_id,
          source_name: CMUDICT_SOURCE_METADATA.source_name,
          source_version: CMUDICT_SOURCE_METADATA.version,
          license: CMUDICT_SOURCE_METADATA.license,
          original_id: `cmudict:0.7b:${matchedLookupToken}:line:${primary.line_number}`,
          arpabet: primary.arpabet,
          variants_ipa: allIpaVariants,
          transformation_method: 'cmudict_arpabet_to_ipa_v1',
        },
      };
    }

    if (allIpaVariants.length === 1) {
      return {
        phonetic_ipa: primary.ipa,
        pronunciation_source: CMUDICT_SOURCE_METADATA.source_id,
        pronunciation_source_version: CMUDICT_SOURCE_METADATA.version,
        pronunciation_confidence: 'HIGH_SINGLE_ENTRY',
        pronunciation_review_status: 'SOURCE_VERIFIED',
        pronunciation_variants_ipa: allIpaVariants,
        provenance: {
          status: 'VERIFIED_LICENSED_IPA',
          source: CMUDICT_SOURCE_METADATA.source_id,
          source_name: CMUDICT_SOURCE_METADATA.source_name,
          source_version: CMUDICT_SOURCE_METADATA.version,
          license: CMUDICT_SOURCE_METADATA.license,
          original_id: `cmudict:0.7b:${matchedLookupToken}:line:${primary.line_number}`,
          arpabet: primary.arpabet,
          variants_ipa: allIpaVariants,
          transformation_method: 'cmudict_arpabet_to_ipa_v1',
        },
      };
    }

    return {
      phonetic_ipa: primary.ipa,
      pronunciation_source: CMUDICT_SOURCE_METADATA.source_id,
      pronunciation_source_version: CMUDICT_SOURCE_METADATA.version,
      pronunciation_confidence: 'MULTI_VARIANT_ENTRY',
      pronunciation_review_status: 'SOURCE_VERIFIED_WITH_VARIANTS',
      pronunciation_variants_ipa: allIpaVariants,
      provenance: {
        status: 'VERIFIED_LICENSED_IPA_WITH_VARIANTS',
        source: CMUDICT_SOURCE_METADATA.source_id,
        source_name: CMUDICT_SOURCE_METADATA.source_name,
        source_version: CMUDICT_SOURCE_METADATA.version,
        license: CMUDICT_SOURCE_METADATA.license,
        original_id: `cmudict:0.7b:${matchedLookupToken}:line:${primary.line_number}`,
        arpabet: primary.arpabet,
        variants_ipa: allIpaVariants,
        transformation_method: 'cmudict_arpabet_to_ipa_v1',
      },
    };
  }

  // Case 2: Multi-word phrase or hyphenated compound where every constituent token exists in CMUdict
  const subTokens = wordLower
    .split(/[\s-]+/)
    .map((t) => t.replace(/^[^a-z]+|[^a-z]+$/g, ''))
    .filter(Boolean);

  if (subTokens.length >= 2 && subTokens.every((t) => cmudictLookup.has(t))) {
    const tokenEntries = subTokens.map((t) => cmudictLookup.get(t)[0]);
    const compositeInner = tokenEntries
      .map((e) => e.ipa.replace(/^\/|\/$/g, ''))
      .join(' ');
    const compositeIpa = `/${compositeInner}/`;

    return {
      phonetic_ipa: compositeIpa,
      pronunciation_source: CMUDICT_SOURCE_METADATA.source_id,
      pronunciation_source_version: CMUDICT_SOURCE_METADATA.version,
      pronunciation_confidence: 'COMPOSITE_PHRASE_FROM_TOKENS',
      pronunciation_review_status: 'REVIEW_REQUIRED',
      pronunciation_variants_ipa: [compositeIpa],
      provenance: {
        status: 'COMPOSITE_CMUDICT_TOKENS_REQUIRES_REVIEW',
        source: CMUDICT_SOURCE_METADATA.source_id,
        source_name: CMUDICT_SOURCE_METADATA.source_name,
        source_version: CMUDICT_SOURCE_METADATA.version,
        license: CMUDICT_SOURCE_METADATA.license,
        original_id: `cmudict:0.7b:composite:${subTokens.join('+')}`,
        arpabet: tokenEntries.map((e) => e.arpabet).join(' | '),
        variants_ipa: [compositeIpa],
        transformation_method: 'cmudict_composite_token_ipa_v1',
      },
    };
  }

  // Case 3: Unresolved (never invent or guess IPA)
  return {
    phonetic_ipa: null,
    pronunciation_source: null,
    pronunciation_source_version: null,
    pronunciation_confidence: 'UNRESOLVED',
    pronunciation_review_status: 'UNRESOLVED',
    pronunciation_variants_ipa: [],
    provenance: {
      status: 'UNRESOLVED_NOT_IN_CMUDICT',
      source: null,
      license: null,
    },
  };
}

/**
 * Loads the committed CMUdict 0.7b subset file from disk.
 */
export function loadCmudictSubset(projectRoot) {
  const subsetPath = path.join(projectRoot, CMUDICT_SOURCE_METADATA.local_path);
  if (!fs.existsSync(subsetPath)) {
    return { lookup: new Map(), sha256: null, lineCount: 0 };
  }
  const content = fs.readFileSync(subsetPath, 'utf8');
  const lookup = parseCmudictText(content);
  return {
    lookup,
    sha256: computeSha256(content),
    lineCount: content.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith(';;;')).length,
  };
}

export const resolveCmudictPronunciation = resolvePronunciationFromCmudict;

