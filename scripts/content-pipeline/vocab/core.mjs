import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const VALID_CEFR_LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const VALID_LIFECYCLE_STATUSES = Object.freeze([
  'IMPORTED',
  'NORMALIZED',
  'VALIDATED',
  'REVIEW_REQUIRED',
  'APPROVED',
  'REJECTED',
  'RETIRED',
]);

export const VALID_OEWN_MATCH_STATUSES = Object.freeze([
  'matched',
  'ambiguous',
  'not_found',
  'not_attempted',
]);

export const CANONICAL_POS_MAP = Object.freeze({
  noun: { pos: 'noun', correction: null },
  verb: { pos: 'verb', correction: null },
  vern: { pos: 'verb', correction: 'pos_typo_corrected:vern->verb' },
  'be-verb': { pos: 'verb', correction: 'pos_subtype_mapped:be-verb->verb' },
  'do-verb': { pos: 'verb', correction: 'pos_subtype_mapped:do-verb->verb' },
  'have-verb': { pos: 'verb', correction: 'pos_subtype_mapped:have-verb->verb' },
  adjective: { pos: 'adjective', correction: null },
  adverb: { pos: 'adverb', correction: null },
  preposition: { pos: 'preposition', correction: null },
  conjunction: { pos: 'conjunction', correction: null },
  determiner: { pos: 'determiner', correction: null },
  pronoun: { pos: 'pronoun', correction: null },
  interjection: { pos: 'interjection', correction: null },
  'modal auxiliary': { pos: 'modal_auxiliary', correction: 'pos_normalized:modal auxiliary->modal_auxiliary' },
  modal_auxiliary: { pos: 'modal_auxiliary', correction: null },
  number: { pos: 'number', correction: null },
  'infinitive-to': { pos: 'infinitive_to', correction: 'pos_normalized:infinitive-to->infinitive_to' },
  infinitive_to: { pos: 'infinitive_to', correction: null },
  phrase: { pos: 'phrase', correction: null },
});

export const OPEN_CLASS_OEWN_POS = new Set(['noun', 'verb', 'adjective', 'adverb']);

export const BLOCKED_SOURCE_IDS = new Set([
  'cambridge_evp',
  'english_vocabulary_profile',
  'oxford_3000',
  'oxford_5000',
  'oxford_3000_5000',
  'efllex',
  'cefrlex',
  'efllex_cefrlex',
]);

/**
 * RFC 4180 compliant single-line CSV parser.
 */
export function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parses a full CSV text into headers and row objects/arrays.
 */
export function parseCsvContent(csvText) {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    return { headers: [], rows: [] };
  }
  const lines = cleanText.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;
    const cols = parseCsvLine(rawLine);
    rows.push({
      lineNumber: i + 1,
      rawLine,
      cols,
    });
  }
  return { headers, rows };
}

/**
 * Computes SHA-256 hex digest of a buffer or string.
 */
export function computeSha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Validates a single source manifest record against Step 1 licensing & provenance rules.
 */
export function validateSourceLicenseRecord(sourceRecord) {
  const errors = [];
  if (!sourceRecord || typeof sourceRecord !== 'object') {
    return { valid: false, errors: ['Source record must be an object'] };
  }

  const sourceId = String(sourceRecord.source_id || '').trim().toLowerCase();
  if (!sourceId) {
    errors.push('Missing source_id');
  }
  if (BLOCKED_SOURCE_IDS.has(sourceId)) {
    errors.push(`Source "${sourceId}" is explicitly blocked from production ingestion`);
  }

  const requiredStrings = [
    'source_name',
    'version',
    'official_url',
    'download_url',
    'license',
    'license_url',
    'attribution',
    'source_file_format',
    'local_path',
  ];
  for (const field of requiredStrings) {
    if (typeof sourceRecord[field] !== 'string' || !sourceRecord[field].trim()) {
      errors.push(`Missing or empty required provenance field: ${field}`);
    }
  }

  if (sourceRecord.license_classification !== 'GREEN') {
    errors.push(
      `Source "${sourceId}" has license_classification="${sourceRecord.license_classification}"; only GREEN sources are permitted`
    );
  }
  if (sourceRecord.commercial_use !== true) {
    errors.push(`Source "${sourceId}" does not permit commercial_use`);
  }
  if (sourceRecord.modification !== true) {
    errors.push(`Source "${sourceId}" does not permit modification`);
  }
  if (sourceRecord.redistribution !== true) {
    errors.push(`Source "${sourceId}" does not permit redistribution`);
  }

  const licenseUpper = String(sourceRecord.license || '').toUpperCase();
  if (licenseUpper.includes('NC') || licenseUpper.includes('NONCOMMERCIAL') || licenseUpper.includes('PROPRIETARY')) {
    errors.push(`Source "${sourceId}" license "${sourceRecord.license}" contains restricted NonCommercial/Proprietary terms`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the complete source-manifest.json and verifies local files + SHA-256 checksums.
 */
export function validateAllSourcesFromManifest(manifest, projectRoot) {
  const sourceResults = [];
  let allValid = true;

  if (!manifest || !Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    return {
      valid: false,
      errors: ['Manifest must contain a non-empty sources array'],
      sourceResults: [],
    };
  }

  for (const src of manifest.sources) {
    const licenseCheck = validateSourceLicenseRecord(src);
    const absPath = path.resolve(projectRoot, src.local_path || '');
    const fileExists = Boolean(src.local_path && fs.existsSync(absPath));
    let actualSha256 = null;
    let fileSizeBytes = 0;
    const errors = [...licenseCheck.errors];

    if (!fileExists) {
      errors.push(`Local source file not found: ${src.local_path}`);
    } else {
      const buf = fs.readFileSync(absPath);
      fileSizeBytes = buf.length;
      actualSha256 = computeSha256(buf);
      if (src.sha256_checksum && actualSha256 !== src.sha256_checksum) {
        errors.push(
          `SHA-256 mismatch for ${src.source_id}: expected ${src.sha256_checksum}, got ${actualSha256}`
        );
      }
    }

    const valid = errors.length === 0;
    if (!valid) allValid = false;

    sourceResults.push({
      source_id: src.source_id,
      source_name: src.source_name,
      version: src.version,
      license: src.license,
      license_url: src.license_url,
      license_classification: src.license_classification,
      commercial_use: src.commercial_use,
      modification: src.modification,
      redistribution: src.redistribution,
      local_path: src.local_path,
      file_exists: fileExists,
      file_size_bytes: fileSizeBytes,
      expected_sha256: src.sha256_checksum || null,
      actual_sha256: actualSha256,
      valid,
      errors,
    });
  }

  return {
    valid: allValid,
    sourceResults,
  };
}

/**
 * Validates a CEFR level string.
 */
export function validateCefrLevel(rawCefr) {
  const cleaned = String(rawCefr ?? '').trim().toUpperCase();
  if (!VALID_CEFR_LEVELS.includes(cleaned)) {
    return { valid: false, value: null, error: `Invalid CEFR level: "${rawCefr}"` };
  }
  return { valid: true, value: cleaned, error: null };
}

/**
 * Normalizes a raw POS string to Glova's canonical POS vocabulary.
 */
export function normalizePos(rawPos) {
  const cleaned = String(rawPos ?? '')
    .normalize('NFC')
    .trim()
    .toLowerCase();

  if (!cleaned) {
    return {
      valid: false,
      pos: null,
      raw_pos: '',
      correction: null,
      error: 'Missing part_of_speech',
    };
  }

  const mapped = CANONICAL_POS_MAP[cleaned];
  if (!mapped) {
    return {
      valid: false,
      pos: null,
      raw_pos: cleaned,
      correction: null,
      error: `Unsupported part_of_speech: "${rawPos}"`,
    };
  }

  return {
    valid: true,
    pos: mapped.pos,
    raw_pos: cleaned,
    correction: mapped.correction,
    error: null,
  };
}

/**
 * Normalizes a headword field (handling Unicode NFC, slash variants like "airplane/aeroplane", and case).
 */
export function normalizeHeadword(rawHeadword) {
  const cleaned = String(rawHeadword ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return {
      valid: false,
      raw_headword: '',
      word: null,
      lemma: null,
      orthographic_variants: [],
      is_capitalized_headword: false,
      error: 'Missing headword',
    };
  }

  const variants = cleaned
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  if (variants.length === 0) {
    return {
      valid: false,
      raw_headword: cleaned,
      word: null,
      lemma: null,
      orthographic_variants: [],
      is_capitalized_headword: false,
      error: 'Headword contains no valid token',
    };
  }

  const primaryWord = variants[0];
  const lemma = primaryWord.toLowerCase();
  const uniqueLowerVariants = [...new Set(variants.map((v) => v.toLowerCase()))];

  return {
    valid: true,
    raw_headword: cleaned,
    word: primaryWord,
    lemma,
    orthographic_variants: variants,
    normalized_lookup_keys: uniqueLowerVariants,
    is_capitalized_headword: primaryWord !== lemma,
    error: null,
  };
}

/**
 * Normalizes a single row from CEFR-J v1.5 or Octanove C1/C2 v1.0.
 */
export function normalizeLexicalRow({ cols, lineNumber, sourceMeta, importBatch }) {
  const licenseValidation = validateSourceLicenseRecord(sourceMeta);
  if (!licenseValidation.valid) {
    return {
      valid: false,
      error_code: 'INVALID_SOURCE_LICENSE',
      errors: licenseValidation.errors,
      lineNumber,
      source: sourceMeta?.source_id || 'unknown',
      raw_cols: cols,
    };
  }

  const rawHeadword = cols[0] ?? '';
  const rawPos = cols[1] ?? '';
  const rawCefr = cols[2] ?? '';

  const hwResult = normalizeHeadword(rawHeadword);
  const posResult = normalizePos(rawPos);
  const cefrResult = validateCefrLevel(rawCefr);

  const errors = [];
  if (!hwResult.valid) errors.push(hwResult.error);
  if (!posResult.valid) errors.push(posResult.error);
  if (!cefrResult.valid) errors.push(cefrResult.error);

  if (errors.length > 0) {
    return {
      valid: false,
      error_code: !posResult.raw_pos ? 'MALFORMED_MISSING_POS' : 'MALFORMED_SOURCE_ROW',
      errors,
      lineNumber,
      source: sourceMeta.source_id,
      raw_cols: cols,
    };
  }

  let sourceNote = '';
  let sourceTopics = [];
  if (sourceMeta.source_id === 'cefr_j') {
    sourceTopics = [cols[3], cols[4], cols[5]]
      .map((x) => String(x ?? '').normalize('NFC').trim())
      .filter(Boolean);
    sourceNote = sourceTopics.join(' | ');
  } else if (sourceMeta.source_id === 'octanove') {
    sourceNote = String(cols[3] ?? '').normalize('NFC').trim();
  }

  const transformations = ['unicode_nfc', 'trim_whitespace', 'lowercase_lemma'];
  if (hwResult.orthographic_variants.length > 1) {
    transformations.push('split_slash_variants');
  }
  if (posResult.correction) {
    transformations.push(posResult.correction);
  }

  const originalId = `${sourceMeta.source_id}:v${sourceMeta.version}:line:${lineNumber}`;

  return {
    valid: true,
    record: {
      source: sourceMeta.source_id,
      source_name: sourceMeta.source_name,
      source_version: sourceMeta.version,
      original_id: originalId,
      lemma: hwResult.lemma,
      word: hwResult.word,
      raw_headword: hwResult.raw_headword,
      orthographic_variants: hwResult.orthographic_variants,
      normalized_lookup_keys: hwResult.normalized_lookup_keys,
      is_capitalized_headword: hwResult.is_capitalized_headword,
      part_of_speech: posResult.pos,
      raw_part_of_speech: posResult.raw_pos,
      cefr_level: cefrResult.value,
      source_note: sourceNote || null,
      source_topics: sourceTopics,
      frequency_rank: null,
      frequency_source: null,
      frequency_sfi: null,
      frequency_per_million: null,
      frequency_match_status: 'not_joined',
      frequency_all_matches: [],
      sense_key: null,
      oewn_synset_id: null,
      oewn_match_status: 'not_attempted',
      oewn_candidate_count: 0,
      oewn_top_candidate_sense_keys: [],
      source_license: sourceMeta.license,
      source_license_url: sourceMeta.license_url,
      source_url: sourceMeta.official_url,
      download_url: sourceMeta.download_url,
      attribution: sourceMeta.attribution,
      transformation_method: transformations.join('+'),
      import_batch: importBatch,
      lifecycle_status: 'NORMALIZED',
      // Pedagogical fields explicitly NULL to prevent learner content fabrication (Step 8 & Step 9)
      meaning_en: null,
      meaning_th: null,
      ipa: null,
      example_sentence_en: null,
      example_sentence_th: null,
      pedagogical_usage_notes: null,
    },
  };
}

const CEFR_ORDER = Object.freeze({ A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 });

/**
 * Deterministically merges normalized CEFR-J (A1-B2) and Octanove (C1-C2) records.
 * Detects and separates:
 *  1. True duplicates (same lemma, POS, CEFR level, capitalization, and note)
 *  2. Polysemy sense splits (same lemma & POS but explicit distinct sense notes or capitalization)
 *  3. Conflicting CEFR assignments (same lemma & POS assigned to different CEFR levels without sense notes)
 */
export function mergeCefrVocabularyCandidates(normalizedRecords) {
  const groupedByLemmaPos = new Map();

  for (const rec of normalizedRecords) {
    const key = `${rec.lemma}|${rec.part_of_speech}`;
    if (!groupedByLemmaPos.has(key)) {
      groupedByLemmaPos.set(key, []);
    }
    groupedByLemmaPos.get(key).push(rec);
  }

  const mergedCandidates = [];
  const duplicates = [];
  const conflicts = [];

  const sortedGroupKeys = [...groupedByLemmaPos.keys()].sort();

  for (const groupKey of sortedGroupKeys) {
    const entries = groupedByLemmaPos.get(groupKey);

    // Step A: Deduplicate exact same (lemma, pos, cefr_level, word_case, source_note)
    const uniqueSenseBuckets = new Map();
    for (const entry of entries) {
      const noteKey = (entry.source_note || '').toLowerCase();
      const bucketKey = `${entry.cefr_level}|${entry.word}|${noteKey}`;
      if (!uniqueSenseBuckets.has(bucketKey)) {
        uniqueSenseBuckets.set(bucketKey, {
          canonical: structuredClone(entry),
          mergedOriginals: [
            {
              original_id: entry.original_id,
              source: entry.source,
              source_version: entry.source_version,
              raw_headword: entry.raw_headword,
              raw_part_of_speech: entry.raw_part_of_speech,
              cefr_level: entry.cefr_level,
              source_note: entry.source_note,
            },
          ],
        });
      } else {
        const existingBucket = uniqueSenseBuckets.get(bucketKey);
        existingBucket.mergedOriginals.push({
          original_id: entry.original_id,
          source: entry.source,
          source_version: entry.source_version,
          raw_headword: entry.raw_headword,
          raw_part_of_speech: entry.raw_part_of_speech,
          cefr_level: entry.cefr_level,
          source_note: entry.source_note,
        });
        duplicates.push({
          lemma: entry.lemma,
          part_of_speech: entry.part_of_speech,
          cefr_level: entry.cefr_level,
          kept_original_id: existingBucket.canonical.original_id,
          duplicate_original_id: entry.original_id,
          source: entry.source,
          raw_headword: entry.raw_headword,
          reason: 'identical_lemma_pos_cefr_and_note',
        });
      }
    }

    const deduplicatedEntries = [...uniqueSenseBuckets.values()].map((b) => {
      const item = b.canonical;
      item.merged_original_ids = b.mergedOriginals.map((m) => m.original_id);
      if (b.mergedOriginals.length > 1) {
        item.transformation_method += '+deduplicated_exact_match';
      }
      return item;
    });

    // Sort deterministically by CEFR level (A1..C2), then original_id
    deduplicatedEntries.sort((a, b) => {
      const levelDiff = (CEFR_ORDER[a.cefr_level] || 99) - (CEFR_ORDER[b.cefr_level] || 99);
      if (levelDiff !== 0) return levelDiff;
      return a.original_id.localeCompare(b.original_id);
    });

    if (deduplicatedEntries.length === 1) {
      const single = deduplicatedEntries[0];
      single.candidate_sense_index = 1;
      single.conflict_status = 'NONE';
      single.conflicting_cefr_levels = [];
      single.conflicting_entries = [];
      mergedCandidates.push(single);
      continue;
    }

    // Multiple distinct entries exist for the same (lemma, part_of_speech).
    // Determine whether this is explicit polysemy (distinct notes or capitalization like March/march)
    // vs. unannotated CEFR level conflict.
    const distinctLevels = [...new Set(deduplicatedEntries.map((e) => e.cefr_level))];
    const distinctWords = [...new Set(deduplicatedEntries.map((e) => e.word))];
    const entriesWithNotes = deduplicatedEntries.filter((e) => Boolean(e.source_note));

    const isSameLevelPolysemy =
      distinctLevels.length === 1 && entriesWithNotes.length === deduplicatedEntries.length;
    const isCaseSensitivePolysemy = distinctWords.length > 1 && distinctWords.some((w) => w !== w.toLowerCase());
    const hasExplicitDisambiguatingNoteInOctanove =
      distinctLevels.length > 1 &&
      deduplicatedEntries.some((e) => e.source === 'octanove' && Boolean(e.source_note));

    if (isSameLevelPolysemy || isCaseSensitivePolysemy || hasExplicitDisambiguatingNoteInOctanove) {
      // Explicit polysemy: preserve each sense as its own candidate row and log in conflict/polysemy report
      const conflictType =
        distinctLevels.length === 1 ? 'POLYSEMY_SAME_LEVEL_SENSE_SPLIT' : 'POLYSEMY_CROSS_LEVEL_SENSE_SPLIT';

      conflicts.push({
        lemma: deduplicatedEntries[0].lemma,
        part_of_speech: deduplicatedEntries[0].part_of_speech,
        conflict_type: conflictType,
        resolution_policy: 'PRESERVED_AS_SEPARATE_SENSE_CANDIDATES',
        cefr_levels: distinctLevels,
        entries: deduplicatedEntries.map((e) => ({
          original_id: e.original_id,
          source: e.source,
          word: e.word,
          cefr_level: e.cefr_level,
          source_note: e.source_note,
        })),
      });

      deduplicatedEntries.forEach((entry, idx) => {
        entry.candidate_sense_index = idx + 1;
        entry.conflict_status = conflictType;
        entry.conflicting_cefr_levels = distinctLevels;
        entry.conflicting_entries = deduplicatedEntries
          .filter((other) => other.original_id !== entry.original_id)
          .map((other) => ({
            original_id: other.original_id,
            source: other.source,
            word: other.word,
            cefr_level: other.cefr_level,
            source_note: other.source_note,
          }));
        mergedCandidates.push(entry);
      });
    } else {
      // Unannotated CEFR level conflict (e.g. abolish|verb at B2 in CEFR-J and C2 in Octanove without sense note)
      // Do NOT silently overwrite: retain primary entry, attach full competing metadata, and log conflict.
      const primary = structuredClone(deduplicatedEntries[0]);
      const competing = deduplicatedEntries.slice(1);
      const sourcesSet = new Set(deduplicatedEntries.map((e) => e.source));
      const conflictType =
        sourcesSet.size > 1 ? 'CROSS_SOURCE_CEFR_CONFLICT' : 'INTRA_SOURCE_CEFR_CONFLICT';

      primary.candidate_sense_index = 1;
      primary.conflict_status = conflictType;
      primary.conflicting_cefr_levels = distinctLevels;
      primary.conflicting_entries = competing.map((c) => ({
        original_id: c.original_id,
        source: c.source,
        source_version: c.source_version,
        word: c.word,
        raw_headword: c.raw_headword,
        cefr_level: c.cefr_level,
        source_note: c.source_note,
        source_license: c.source_license,
      }));
      primary.transformation_method += '+conflict_preserved_review_required';

      mergedCandidates.push(primary);

      conflicts.push({
        lemma: primary.lemma,
        part_of_speech: primary.part_of_speech,
        conflict_type: conflictType,
        resolution_policy: 'PRIMARY_RETAINED_WITH_CONFLICT_METADATA_FLAGGED_FOR_REVIEW',
        primary_cefr_level: primary.cefr_level,
        primary_original_id: primary.original_id,
        cefr_levels: distinctLevels,
        entries: deduplicatedEntries.map((e) => ({
          original_id: e.original_id,
          source: e.source,
          word: e.word,
          cefr_level: e.cefr_level,
          source_note: e.source_note,
        })),
      });
    }
  }

  return {
    candidates: mergedCandidates,
    duplicates,
    conflicts,
  };
}

/**
 * Parses NGSL, NAWL, TSL, and BSL frequency CSVs into a deterministic lookup structure.
 */
export function buildFrequencyLookup({ ngslCsv, nawlCsv, tslCsv, bslCsv }) {
  const lists = [
    { id: 'NGSL_1.2', csv: ngslCsv, sfiCol: 2, uCol: 3 },
    { id: 'NAWL_1.2', csv: nawlCsv, sfiCol: 3, uCol: 4 },
    { id: 'TSL_1.2', csv: tslCsv, sfiCol: 2, uCol: 3 },
    { id: 'BSL_1.20', csv: bslCsv, sfiCol: 3, uCol: 4 },
  ];

  const lookup = new Map();
  const rowCounts = {};

  for (const list of lists) {
    if (!list.csv) {
      rowCounts[list.id] = 0;
      continue;
    }
    const parsed = parseCsvContent(list.csv);
    rowCounts[list.id] = parsed.rows.length;

    for (const row of parsed.rows) {
      const word = String(row.cols[0] ?? '')
        .normalize('NFC')
        .trim()
        .toLowerCase();
      const rank = Number.parseInt(String(row.cols[1] ?? '').trim(), 10);
      const sfi = Number.parseFloat(String(row.cols[list.sfiCol] ?? '').trim());
      const perMillion = Number.parseFloat(String(row.cols[list.uCol] ?? '').trim());

      if (!word || Number.isNaN(rank) || rank <= 0) continue;

      if (!lookup.has(word)) {
        lookup.set(word, []);
      }
      const existingForList = lookup.get(word).some((m) => m.source === list.id);
      if (!existingForList) {
        lookup.get(word).push({
          source: list.id,
          rank,
          sfi: Number.isNaN(sfi) ? null : sfi,
          per_million: Number.isNaN(perMillion) ? null : perMillion,
          line_number: row.lineNumber,
        });
      }
    }
  }

  return { lookup, rowCounts };
}

/**
 * Joins NGSL/NAWL/TSL/BSL frequency data onto candidate records deterministically (Step 5).
 */
export function joinFrequencyData(candidates, frequencyLookup) {
  return candidates.map((candidate) => {
    const out = structuredClone(candidate);
    const lookupKeys = out.normalized_lookup_keys?.length
      ? out.normalized_lookup_keys
      : [out.lemma];

    let matchedKey = null;
    let matches = null;
    for (const key of lookupKeys) {
      if (frequencyLookup.has(key)) {
        matchedKey = key;
        matches = frequencyLookup.get(key);
        break;
      }
    }

    if (matches && matches.length > 0) {
      const primaryMatch = matches[0];
      out.frequency_rank = primaryMatch.rank;
      out.frequency_source = primaryMatch.source;
      out.frequency_sfi = primaryMatch.sfi;
      out.frequency_per_million = primaryMatch.per_million;
      out.frequency_match_status =
        matchedKey === out.lemma ? 'matched_exact_lemma' : `matched_orthographic_variant:${matchedKey}`;
      out.frequency_all_matches = matches;
      out.transformation_method += `+freq_join:${primaryMatch.source}`;
    } else {
      out.frequency_rank = null;
      out.frequency_source = null;
      out.frequency_sfi = null;
      out.frequency_per_million = null;
      const isMultiwordOrPunct = /[\s./'-]/.test(out.lemma);
      out.frequency_match_status = isMultiwordOrPunct
        ? 'unmatched_multiword_or_abbreviation'
        : 'unmatched_not_in_ngsl_nawl_tsl_bsl';
      out.frequency_all_matches = [];
    }

    return out;
  });
}

const OEWN_SS_TYPE_TO_POS = Object.freeze({
  '1': { pos: 'noun', suffix: 'n' },
  '2': { pos: 'verb', suffix: 'v' },
  '3': { pos: 'adjective', suffix: 'a' },
  '4': { pos: 'adverb', suffix: 'r' },
  '5': { pos: 'adjective', suffix: 's' },
});

/**
 * Builds a deterministic lookup map from Open English WordNet 2024 index.sense format.
 */
export function buildOewnSenseLookup(indexSenseText) {
  const lookup = new Map();
  const lines = String(indexSenseText ?? '')
    .trim()
    .split(/\r?\n/);

  let parsedCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;

    const senseKey = parts[0];
    const synsetOffset = parts[1];
    const senseNumber = Number.parseInt(parts[2], 10) || 1;
    const pctIdx = senseKey.indexOf('%');
    if (pctIdx === -1) continue;

    const lemma = senseKey.slice(0, pctIdx).replace(/_/g, ' ').toLowerCase();
    const ssType = senseKey.slice(pctIdx + 1, pctIdx + 2);
    const mappedPos = OEWN_SS_TYPE_TO_POS[ssType];
    if (!mappedPos) continue;

    parsedCount++;
    const key = `${lemma}|${mappedPos.pos}`;
    if (!lookup.has(key)) {
      lookup.set(key, []);
    }
    lookup.get(key).push({
      sense_key: senseKey,
      synset_id: `${synsetOffset}-${mappedPos.suffix}`,
      sense_number: senseNumber,
    });
  }

  for (const senseList of lookup.values()) {
    senseList.sort((a, b) => {
      if (a.sense_number !== b.sense_number) return a.sense_number - b.sense_number;
      return a.sense_key.localeCompare(b.sense_key);
    });
  }

  return { lookup, parsedCount };
}

/**
 * Joins OEWN 2024 sense keys onto candidates only when a deterministic 1-to-1 sense mapping exists (Step 6).
 */
export function joinOewnSenses(candidates, oewnLookup) {
  return candidates.map((candidate) => {
    const out = structuredClone(candidate);

    if (!OPEN_CLASS_OEWN_POS.has(out.part_of_speech)) {
      out.sense_key = null;
      out.oewn_synset_id = null;
      out.oewn_match_status = 'not_attempted';
      out.oewn_candidate_count = 0;
      out.oewn_top_candidate_sense_keys = [];
      return out;
    }

    const lookupKeys = out.normalized_lookup_keys?.length
      ? out.normalized_lookup_keys
      : [out.lemma];

    let senses = null;
    for (const wordVariant of lookupKeys) {
      const key = `${wordVariant}|${out.part_of_speech}`;
      if (oewnLookup.has(key)) {
        senses = oewnLookup.get(key);
        break;
      }
    }

    if (!senses || senses.length === 0) {
      out.sense_key = null;
      out.oewn_synset_id = null;
      out.oewn_match_status = 'not_found';
      out.oewn_candidate_count = 0;
      out.oewn_top_candidate_sense_keys = [];
      return out;
    }

    if (senses.length === 1) {
      out.sense_key = senses[0].sense_key;
      out.oewn_synset_id = senses[0].synset_id;
      out.oewn_match_status = 'matched';
      out.oewn_candidate_count = 1;
      out.oewn_top_candidate_sense_keys = [senses[0].sense_key];
      out.transformation_method += '+oewn_unambiguous_sense_matched';
      return out;
    }

    // Multiple senses exist in OEWN: do NOT force a guess! Mark ambiguous and preserve top candidates.
    out.sense_key = null;
    out.oewn_synset_id = null;
    out.oewn_match_status = 'ambiguous';
    out.oewn_candidate_count = senses.length;
    out.oewn_top_candidate_sense_keys = senses.slice(0, 5).map((s) => s.sense_key);
    return out;
  });
}

/**
 * Validates normalized candidates and transitions lifecycle status to REVIEW_REQUIRED (Step 7, 8, 9).
 */
export function finalizeCandidatesForReview(candidates) {
  return candidates.map((candidate) => {
    const out = structuredClone(candidate);

    // Ensure provenance object is explicitly structured (Step 7)
    out.provenance = {
      source: out.source,
      source_name: out.source_name,
      source_version: out.source_version,
      source_url: out.source_url,
      download_url: out.download_url,
      license: out.source_license,
      license_url: out.source_license_url,
      attribution: out.attribution,
      original_id: out.original_id,
      merged_original_ids: out.merged_original_ids || [out.original_id],
      import_batch: out.import_batch,
      transformation_method: out.transformation_method,
      frequency_source: out.frequency_source,
      frequency_match_status: out.frequency_match_status,
      oewn_source_version: out.oewn_match_status !== 'not_attempted' ? 'OEWN-2024' : null,
      oewn_match_status: out.oewn_match_status,
      conflict_status: out.conflict_status,
      conflicting_cefr_levels: out.conflicting_cefr_levels,
      conflicting_entries: out.conflicting_entries,
    };

    // Step 8: Imported lexical data must never auto-transition to APPROVED
    out.lifecycle_status = 'REVIEW_REQUIRED';
    return out;
  });
}

/**
 * Deterministically selects a controlled pilot batch (default 30 per CEFR level = 180 records)
 * covering multiple POS, frequency matches, OEWN matches, and conflict/polysemy cases.
 */
export function selectControlledPilotBatch(candidates, existingActiveLemmas = new Set(), perLevelTarget = 30) {
  const pilotBatch = [];

  for (const level of VALID_CEFR_LEVELS) {
    const pool = candidates.filter(
      (c) => c.cefr_level === level && !existingActiveLemmas.has(`${c.lemma}|${c.part_of_speech}`)
    );

    const selectedForLevel = [];
    const usedIds = new Set();

    const pick = (predicate, limit) => {
      let count = 0;
      for (const item of pool) {
        if (selectedForLevel.length >= perLevelTarget || count >= limit) break;
        if (usedIds.has(item.original_id)) continue;
        if (predicate(item)) {
          selectedForLevel.push(item);
          usedIds.add(item.original_id);
          count++;
        }
      }
    };

    // 1. Include up to 5 conflict/polysemy cases at this level so conflict handling is tested end-to-end
    pick((x) => x.conflict_status !== 'NONE', 5);

    // 2. Ensure diverse POS coverage (nouns, verbs, adjectives, adverbs, closed-class POS)
    for (const targetPos of ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'determiner']) {
      pick((x) => x.part_of_speech === targetPos && x.oewn_match_status === 'matched' && x.frequency_rank !== null, 3);
    }

    for (const targetPos of ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'determiner']) {
      pick((x) => x.part_of_speech === targetPos, 2);
    }

    // 3. Fill remaining slots deterministically (preferring items with frequency or OEWN data, then alphabetical)
    pick(() => true, perLevelTarget);

    pilotBatch.push(...selectedForLevel);
  }

  return pilotBatch.map((item, idx) => {
    const seq = String(idx + 1).padStart(12, '0');
    return {
      ...item,
      pilot_uuid: `a0000000-0000-4001-8100-${seq}`,
      pilot_sequence: idx + 1,
    };
  });
}
