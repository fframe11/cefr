#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VALID_CEFR_LEVELS,
  buildFrequencyLookup,
  buildOewnSenseLookup,
  computeSha256,
  finalizeCandidatesForReview,
  joinFrequencyData,
  joinOewnSenses,
  mergeCefrVocabularyCandidates,
  normalizeLexicalRow,
  parseCsvContent,
  selectControlledPilotBatch,
  validateAllSourcesFromManifest,
} from './core.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultProjectRoot = path.resolve(__dirname, '../../..');

export const EXISTING_ACTIVE_SEEDED_WORDS = Object.freeze([
  'schedule|noun',
  'borrow|verb',
  'journey|noun',
  'delicious|adjective',
  'convenient|adjective',
  'complain|verb',
  'environment|noun',
  'achieve|verb',
  'recommend|verb',
  'opportunity|noun',
  'hesitate|verb',
  'substantial|adjective',
  'inevitable|adjective',
  'collaborate|verb',
  'controversy|noun',
  'lucid|adjective',
  'scrutinize|verb',
  'mitigate|verb',
  'ubiquitous|adjective',
  'ephemeral|adjective',
  'paradigm|noun',
]);

function countByKey(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = String(keyFn(item));
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJsonbLiteral(obj) {
  const json = JSON.stringify(obj ?? {});
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

/**
 * Generates an idempotent SQL seed migration for the controlled 180-record pilot batch.
 */
export function generatePilotBatchSqlMigration(pilotBatch, importBatch) {
  const lines = [
    '-- ==============================================================================',
    '-- Migration: 20260926000008_seed_vocabulary_pilot_batch.sql',
    '-- Description: Phase 6.2.7 Controlled Pilot Vocabulary Batch (180 rows = 30 per CEFR level A1-C2)',
    `-- Import Batch: ${importBatch}`,
    '-- Lifecycle State: REVIEW_REQUIRED (is_active = false)',
    '-- Guarantee: Zero fabricated Thai translations, IPA, or learner examples; full provenance preserved.',
    '-- ==============================================================================',
    '',
    'INSERT INTO public.vocabularies (',
    '  id, word, lemma, cefr_level, part_of_speech,',
    '  ipa, meaning_th, meaning_en, example_sentence_en, example_sentence_th, topic,',
    '  synonyms, antonyms, is_active,',
    '  sense_key, frequency_rank, frequency_source, oewn_synset_id, oewn_match_status,',
    '  lifecycle_status, source_name, source_version, source_license, provenance, metadata',
    ')',
    'VALUES',
  ];

  const valueBlocks = pilotBatch.map((item) => {
    const metadataObj = {
      raw_headword: item.raw_headword,
      orthographic_variants: item.orthographic_variants,
      raw_part_of_speech: item.raw_part_of_speech,
      candidate_sense_index: item.candidate_sense_index,
      source_note: item.source_note,
      source_topics: item.source_topics,
      frequency_sfi: item.frequency_sfi,
      frequency_per_million: item.frequency_per_million,
      frequency_all_matches: item.frequency_all_matches,
      oewn_candidate_count: item.oewn_candidate_count,
      oewn_top_candidate_sense_keys: item.oewn_top_candidate_sense_keys,
      conflict_status: item.conflict_status,
      conflicting_cefr_levels: item.conflicting_cefr_levels,
      conflicting_entries: item.conflicting_entries,
      pilot_sequence: item.pilot_sequence,
    };

    const topicValue = item.source_topics?.length ? item.source_topics[0].slice(0, 100) : null;

    return [
      '  (',
      `    ${sqlLiteral(item.pilot_uuid)}, ${sqlLiteral(item.word)}, ${sqlLiteral(item.lemma)}, ${sqlLiteral(item.cefr_level)}, ${sqlLiteral(item.part_of_speech)},`,
      `    NULL, NULL, NULL, NULL, NULL, ${sqlLiteral(topicValue)},`,
      `    '{}'::text[], '{}'::text[], false,`,
      `    ${sqlLiteral(item.sense_key)}, ${sqlLiteral(item.frequency_rank)}, ${sqlLiteral(item.frequency_source)}, ${sqlLiteral(item.oewn_synset_id)}, ${sqlLiteral(item.oewn_match_status)},`,
      `    'REVIEW_REQUIRED', ${sqlLiteral(item.source_name)}, ${sqlLiteral(item.source_version)}, ${sqlLiteral(item.source_license)},`,
      `    ${sqlJsonbLiteral(item.provenance)},`,
      `    ${sqlJsonbLiteral(metadataObj)}`,
      '  )',
    ].join('\n');
  });

  lines.push(valueBlocks.join(',\n'));
  lines.push(
    'ON CONFLICT (id) DO UPDATE SET',
    '  word = EXCLUDED.word,',
    '  lemma = EXCLUDED.lemma,',
    '  cefr_level = EXCLUDED.cefr_level,',
    '  part_of_speech = EXCLUDED.part_of_speech,',
    '  topic = EXCLUDED.topic,',
    '  is_active = EXCLUDED.is_active,',
    '  sense_key = EXCLUDED.sense_key,',
    '  frequency_rank = EXCLUDED.frequency_rank,',
    '  frequency_source = EXCLUDED.frequency_source,',
    '  oewn_synset_id = EXCLUDED.oewn_synset_id,',
    '  oewn_match_status = EXCLUDED.oewn_match_status,',
    '  lifecycle_status = EXCLUDED.lifecycle_status,',
    '  source_name = EXCLUDED.source_name,',
    '  source_version = EXCLUDED.source_version,',
    '  source_license = EXCLUDED.source_license,',
    '  provenance = EXCLUDED.provenance,',
    '  metadata = EXCLUDED.metadata;',
    ''
  );

  return lines.join('\n');
}

/**
 * Executes the deterministic offline vocabulary ingestion pipeline.
 */
export function runVocabularyPipeline({
  projectRoot = defaultProjectRoot,
  importBatch = 'batch-2026-09-26-phase-6.2.7-v1',
  writeArtifacts = true,
  pilotPerLevel = 30,
} = {}) {
  const manifestPath = path.join(projectRoot, 'scripts/content-pipeline/sources/source-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Step 1: Validate all sources & licenses
  const sourceValidation = validateAllSourcesFromManifest(manifest, projectRoot);
  if (!sourceValidation.valid) {
    throw new Error(
      `Source validation failed: ${JSON.stringify(
        sourceValidation.sourceResults.filter((s) => !s.valid),
        null,
        2
      )}`
    );
  }

  const sourceMap = Object.fromEntries(manifest.sources.map((s) => [s.source_id, s]));

  // Step 2 & 3: Load and normalize CEFR-J v1.5 and Octanove C1/C2 v1.0
  const cefrjCsv = fs.readFileSync(path.resolve(projectRoot, sourceMap.cefr_j.local_path), 'utf8');
  const octanoveCsv = fs.readFileSync(path.resolve(projectRoot, sourceMap.octanove.local_path), 'utf8');

  const parsedCefrj = parseCsvContent(cefrjCsv);
  const parsedOctanove = parseCsvContent(octanoveCsv);

  const normalizedPrimary = [];
  const malformedRows = [];

  for (const row of parsedCefrj.rows) {
    const res = normalizeLexicalRow({
      cols: row.cols,
      lineNumber: row.lineNumber,
      sourceMeta: sourceMap.cefr_j,
      importBatch,
    });
    if (res.valid) normalizedPrimary.push(res.record);
    else malformedRows.push(res);
  }

  for (const row of parsedOctanove.rows) {
    const res = normalizeLexicalRow({
      cols: row.cols,
      lineNumber: row.lineNumber,
      sourceMeta: sourceMap.octanove,
      importBatch,
    });
    if (res.valid) normalizedPrimary.push(res.record);
    else malformedRows.push(res);
  }

  // Step 4: Deterministic Merge, Dedup & Conflict Detection
  const merged = mergeCefrVocabularyCandidates(normalizedPrimary);

  // Step 5: Join NGSL, NAWL, TSL, BSL Frequency Data
  const ngslCsv = fs.readFileSync(path.resolve(projectRoot, sourceMap.ngsl.local_path), 'utf8');
  const nawlCsv = fs.readFileSync(path.resolve(projectRoot, sourceMap.nawl.local_path), 'utf8');
  const tslCsv = fs.readFileSync(path.resolve(projectRoot, sourceMap.tsl.local_path), 'utf8');
  const bslCsv = fs.readFileSync(path.resolve(projectRoot, sourceMap.bsl.local_path), 'utf8');

  const freqData = buildFrequencyLookup({ ngslCsv, nawlCsv, tslCsv, bslCsv });
  const withFrequency = joinFrequencyData(merged.candidates, freqData.lookup);

  // Step 6: Join Open English WordNet (OEWN 2024) Sense Data
  const fullOewnSensePath = path.resolve(
    projectRoot,
    'scripts/content-pipeline/sources/oewn/extracted/oewn2024/index.sense'
  );
  const subsetOewnSensePath = path.resolve(projectRoot, sourceMap.oewn.local_path);
  const oewnSenseText = fs.existsSync(fullOewnSensePath)
    ? fs.readFileSync(fullOewnSensePath, 'utf8')
    : fs.readFileSync(subsetOewnSensePath, 'utf8');

  const oewnIndex = buildOewnSenseLookup(oewnSenseText);
  const withOewn = joinOewnSenses(withFrequency, oewnIndex.lookup);

  // Step 7, 8, 9: Finalize Provenance & Review Status (REVIEW_REQUIRED)
  const finalizedCandidates = finalizeCandidatesForReview(withOewn);

  // Step 13: Select Controlled Pilot Batch (30 per CEFR level = 180 records)
  const pilotBatch = selectControlledPilotBatch(
    finalizedCandidates,
    new Set(EXISTING_ACTIVE_SEEDED_WORDS),
    pilotPerLevel
  );

  // Step 12: Build Reports
  const cefrDistribution = {};
  for (const lvl of VALID_CEFR_LEVELS) cefrDistribution[lvl] = 0;
  for (const c of finalizedCandidates) {
    cefrDistribution[c.cefr_level] = (cefrDistribution[c.cefr_level] || 0) + 1;
  }

  const posDistribution = countByKey(finalizedCandidates, (c) => c.part_of_speech);
  const sourceDistribution = countByKey(finalizedCandidates, (c) => c.source);
  const frequencySourceDistribution = countByKey(
    finalizedCandidates,
    (c) => c.frequency_source || 'UNMATCHED'
  );
  const frequencyStatusDistribution = countByKey(
    finalizedCandidates,
    (c) => c.frequency_match_status
  );
  const oewnStatusDistribution = countByKey(finalizedCandidates, (c) => c.oewn_match_status);
  const conflictTypeDistribution = countByKey(merged.conflicts, (c) => c.conflict_type);

  const matchedFrequencyCount = finalizedCandidates.filter((c) => c.frequency_rank !== null).length;
  const matchedOewnCount = finalizedCandidates.filter((c) => c.oewn_match_status === 'matched').length;

  const sourceReport = {
    report_type: 'vocabulary-source-report',
    phase: '6.2.7',
    import_batch: importBatch,
    all_sources_verified_green: sourceValidation.valid,
    sources: sourceValidation.sourceResults.map((res) => {
      const meta = sourceMap[res.source_id];
      return {
        ...res,
        official_url: meta.official_url,
        download_url: meta.download_url,
        attribution: meta.attribution,
        source_file_format: meta.source_file_format,
        expected_data_rows: meta.expected_data_rows,
      };
    }),
    blocked_sources: manifest.blocked_sources,
    raw_input_row_counts: {
      cefr_j_v1_5: parsedCefrj.rows.length,
      octanove_c1c2_v1_0: parsedOctanove.rows.length,
      primary_cefr_total: parsedCefrj.rows.length + parsedOctanove.rows.length,
      ngsl_v1_2: freqData.rowCounts['NGSL_1.2'],
      nawl_v1_2: freqData.rowCounts['NAWL_1.2'],
      tsl_v1_2: freqData.rowCounts['TSL_1.2'],
      bsl_v1_20: freqData.rowCounts['BSL_1.20'],
      oewn_2024_cefr_senses_subset: sourceMap.oewn.expected_data_rows,
      oewn_2024_full_index_sense: sourceMap.oewn.full_index_sense_rows,
    },
    malformed_source_rows_count: malformedRows.length,
    malformed_source_rows: malformedRows,
  };

  const dedupReport = {
    report_type: 'vocabulary-dedup-report',
    phase: '6.2.7',
    import_batch: importBatch,
    primary_input_rows: parsedCefrj.rows.length + parsedOctanove.rows.length,
    valid_normalized_input_rows: normalizedPrimary.length,
    malformed_rejected_rows: malformedRows.length,
    exact_duplicates_removed: merged.duplicates.length,
    duplicates: merged.duplicates,
  };

  const conflictsReport = {
    report_type: 'vocabulary-conflicts',
    phase: '6.2.7',
    import_batch: importBatch,
    total_conflict_and_polysemy_groups: merged.conflicts.length,
    breakdown_by_type: conflictTypeDistribution,
    conflicts: merged.conflicts,
  };

  const importSummary = {
    report_type: 'vocabulary-import-summary',
    phase: '6.2.7',
    import_batch: importBatch,
    counts: {
      raw_primary_input_rows: parsedCefrj.rows.length + parsedOctanove.rows.length,
      malformed_rows_rejected: malformedRows.length,
      valid_normalized_rows_before_merge: normalizedPrimary.length,
      exact_duplicates_collapsed: merged.duplicates.length,
      cross_and_intra_source_cefr_conflicts_collapsed_for_review: merged.conflicts.filter(
        (c) =>
          c.conflict_type === 'CROSS_SOURCE_CEFR_CONFLICT' ||
          c.conflict_type === 'INTRA_SOURCE_CEFR_CONFLICT'
      ).length,
      polysemy_sense_splits_preserved: merged.conflicts.filter(
        (c) =>
          c.conflict_type === 'POLYSEMY_SAME_LEVEL_SENSE_SPLIT' ||
          c.conflict_type === 'POLYSEMY_CROSS_LEVEL_SENSE_SPLIT'
      ).length,
      final_candidate_set_size: finalizedCandidates.length,
      pilot_batch_size: pilotBatch.length,
    },
    missing_fields_audit: {
      malformed_missing_pos_in_raw_input: malformedRows.length,
      candidates_missing_frequency_rank: finalizedCandidates.length - matchedFrequencyCount,
      candidates_missing_unambiguous_oewn_sense_key:
        finalizedCandidates.length - matchedOewnCount,
      candidates_awaiting_pedagogical_enrichment_meaning_th_ipa_examples:
        finalizedCandidates.length,
    },
    cefr_distribution: cefrDistribution,
    pos_distribution: posDistribution,
    source_distribution: sourceDistribution,
    frequency_coverage: {
      matched_count: matchedFrequencyCount,
      unmatched_count: finalizedCandidates.length - matchedFrequencyCount,
      coverage_percentage: Number(
        ((matchedFrequencyCount / finalizedCandidates.length) * 100).toFixed(2)
      ),
      by_primary_frequency_source: frequencySourceDistribution,
      by_match_status: frequencyStatusDistribution,
    },
    oewn_match_coverage: {
      unambiguous_matched_count: matchedOewnCount,
      ambiguous_polysemous_count: oewnStatusDistribution.ambiguous || 0,
      not_found_count: oewnStatusDistribution.not_found || 0,
      not_attempted_closed_class_pos_count: oewnStatusDistribution.not_attempted || 0,
      unambiguous_coverage_percentage: Number(
        ((matchedOewnCount / finalizedCandidates.length) * 100).toFixed(2)
      ),
      open_class_found_in_oewn_percentage: Number(
        (
          (((matchedOewnCount + (oewnStatusDistribution.ambiguous || 0)) /
            finalizedCandidates.length) *
            100)
        ).toFixed(2)
      ),
      by_status: oewnStatusDistribution,
    },
    lifecycle_status_distribution: countByKey(finalizedCandidates, (c) => c.lifecycle_status),
    pilot_batch_summary: {
      total_records: pilotBatch.length,
      cefr_distribution: countByKey(pilotBatch, (c) => c.cefr_level),
      pos_distribution: countByKey(pilotBatch, (c) => c.part_of_speech),
      source_distribution: countByKey(pilotBatch, (c) => c.source),
      frequency_matched_count: pilotBatch.filter((c) => c.frequency_rank !== null).length,
      oewn_matched_count: pilotBatch.filter((c) => c.oewn_match_status === 'matched').length,
      oewn_ambiguous_count: pilotBatch.filter((c) => c.oewn_match_status === 'ambiguous').length,
      conflict_and_polysemy_cases_included: pilotBatch.filter((c) => c.conflict_status !== 'NONE')
        .length,
    },
    normalized_candidates_sha256: computeSha256(JSON.stringify(finalizedCandidates)),
    pilot_batch_sha256: computeSha256(JSON.stringify(pilotBatch)),
  };

  if (writeArtifacts) {
    const outDir = path.join(projectRoot, 'scripts/content-pipeline/output');
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(
      path.join(outDir, 'vocabulary-source-report.json'),
      JSON.stringify(sourceReport, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(outDir, 'vocabulary-dedup-report.json'),
      JSON.stringify(dedupReport, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(outDir, 'vocabulary-conflicts.json'),
      JSON.stringify(conflictsReport, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(outDir, 'vocabulary-import-summary.json'),
      JSON.stringify(importSummary, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(outDir, 'vocabulary-pilot-batch.json'),
      JSON.stringify(pilotBatch, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(outDir, 'vocabulary-candidates-normalized.json'),
      JSON.stringify(finalizedCandidates, null, 2) + '\n',
      'utf8'
    );

    const pilotMigrationSql = generatePilotBatchSqlMigration(pilotBatch, importBatch);
    const migrationsDir = path.join(projectRoot, 'supabase/migrations');
    fs.writeFileSync(
      path.join(migrationsDir, '20260926000008_seed_vocabulary_pilot_batch.sql'),
      pilotMigrationSql,
      'utf8'
    );
  }

  return {
    sourceReport,
    dedupReport,
    conflictsReport,
    importSummary,
    candidates: finalizedCandidates,
    pilotBatch,
  };
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMainModule) {
  const mode = (process.argv[2] || 'all').toLowerCase();
  const result = runVocabularyPipeline({ writeArtifacts: mode !== 'validate' });

  if (mode === 'validate') {
    console.log(
      JSON.stringify(
        {
          mode: 'validate',
          all_sources_verified_green: result.sourceReport.all_sources_verified_green,
          sources_verified: result.sourceReport.sources.length,
          malformed_source_rows_detected: result.sourceReport.malformed_source_rows_count,
        },
        null,
        2
      )
    );
  } else {
    console.log(JSON.stringify(result.importSummary, null, 2));
  }
}
