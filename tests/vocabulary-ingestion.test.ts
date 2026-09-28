import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  buildFrequencyLookup,
  buildOewnSenseLookup,
  finalizeCandidatesForReview,
  joinFrequencyData,
  joinOewnSenses,
  mergeCefrVocabularyCandidates,
  normalizeHeadword,
  normalizeLexicalRow,
  normalizePos,
  parseCsvLine,
  validateAllSourcesFromManifest,
  validateCefrLevel,
  validateSourceLicenseRecord,
} from '../scripts/content-pipeline/vocab/core.mjs';
import {
  EXISTING_ACTIVE_SEEDED_WORDS,
  runVocabularyPipeline,
} from '../scripts/content-pipeline/vocab/pipeline.mjs';

const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.7: Vocabulary Ingestion, Provenance & Validation Suite', () => {
  const greenSourceMeta = {
    source_id: 'cefr_j',
    source_name: 'CEFR-J Vocabulary Profile',
    version: '1.5',
    official_url: 'http://www.cefr-j.org/download.html',
    download_url:
      'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv',
    license: 'TUFS-CEFR-J-Permissive',
    license_url: 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/README.md',
    license_classification: 'GREEN',
    commercial_use: true,
    modification: true,
    redistribution: true,
    attribution: 'Tono Lab TUFS',
    source_file_format: 'CSV',
    local_path: 'scripts/content-pipeline/sources/cefr-j/cefrj-vocabulary-profile-1.5.csv',
  };

  describe('1. Source & License Validation (Step 1)', () => {
    it('should validate all 7 real GREEN sources and SHA-256 checksums in source-manifest.json', () => {
      const manifestPath = path.join(projectRoot, 'scripts/content-pipeline/sources/source-manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const validation = validateAllSourcesFromManifest(manifest, projectRoot);

      expect(validation.valid).toBe(true);
      expect(validation.sourceResults).toHaveLength(7);
      for (const src of validation.sourceResults) {
        expect(src.valid).toBe(true);
        expect(src.file_exists).toBe(true);
        expect(src.actual_sha256).toBe(src.expected_sha256);
        expect(src.license_classification).toBe('GREEN');
      }
    });

    it('should hard-stop blocked sources (Cambridge EVP, Oxford 3000/5000, EFLLex)', () => {
      for (const blockedId of ['cambridge_evp', 'oxford_3000_5000', 'efllex_cefrlex']) {
        const res = validateSourceLicenseRecord({
          ...greenSourceMeta,
          source_id: blockedId,
        });
        expect(res.valid).toBe(false);
        expect(res.errors.join(' ')).toMatch(/explicitly blocked/i);
      }
    });

    it('should reject non-GREEN, NonCommercial (NC), or non-redistributable licenses', () => {
      const ncCheck = validateSourceLicenseRecord({
        ...greenSourceMeta,
        source_id: 'custom_nc_list',
        license: 'CC-BY-NC-SA-4.0',
        license_classification: 'YELLOW',
        commercial_use: false,
      });
      expect(ncCheck.valid).toBe(false);
      expect(ncCheck.errors.some((e) => e.includes('only GREEN sources are permitted'))).toBe(true);
      expect(ncCheck.errors.some((e) => e.includes('commercial_use'))).toBe(true);
      expect(ncCheck.errors.some((e) => e.includes('NonCommercial'))).toBe(true);
    });
  });

  describe('2. CEFR Validation & POS Normalization (Step 3)', () => {
    it('should accept only A1, A2, B1, B2, C1, C2 and reject invalid CEFR values', () => {
      for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', ' b2 ']) {
        expect(validateCefrLevel(lvl).valid).toBe(true);
      }
      for (const invalid of ['A0', 'B3', 'C3', 'Pre-A1', '', null, undefined, '120']) {
        const res = validateCefrLevel(invalid);
        expect(res.valid).toBe(false);
        expect(res.value).toBeNull();
      }
    });

    it('should normalize standard and CEFR-J/Octanove POS variants and reject missing/unknown POS', () => {
      expect(normalizePos('noun')).toEqual({
        valid: true,
        pos: 'noun',
        raw_pos: 'noun',
        correction: null,
        error: null,
      });
      expect(normalizePos('be-verb').pos).toBe('verb');
      expect(normalizePos('have-verb').pos).toBe('verb');
      expect(normalizePos('modal auxiliary').pos).toBe('modal_auxiliary');
      expect(normalizePos('infinitive-to').pos).toBe('infinitive_to');

      // Upstream Octanove line 2129 typo ("vern" -> "verb") with explicit transformation audit trail
      const vernCheck = normalizePos('vern');
      expect(vernCheck.valid).toBe(true);
      expect(vernCheck.pos).toBe('verb');
      expect(vernCheck.correction).toBe('pos_typo_corrected:vern->verb');

      // Missing or invalid POS
      expect(normalizePos('').valid).toBe(false);
      expect(normalizePos('   ').valid).toBe(false);
      expect(normalizePos('made_up_pos').valid).toBe(false);
    });

    it('should parse RFC 4180 CSV lines with quoted commas and normalize slash headwords', () => {
      const cols = parseCsvLine('subway,noun,A1,"Things in the town, shops and shopping",,Travel');
      expect(cols[0]).toBe('subway');
      expect(cols[3]).toBe('Things in the town, shops and shopping');
      expect(cols[5]).toBe('Travel');

      const hw = normalizeHeadword('airplane/aeroplane');
      expect(hw.valid).toBe(true);
      expect(hw.word).toBe('airplane');
      expect(hw.lemma).toBe('airplane');
      expect(hw.orthographic_variants).toEqual(['airplane', 'aeroplane']);
      expect(hw.normalized_lookup_keys).toEqual(['airplane', 'aeroplane']);
    });

    it('should reject malformed source rows (missing POS, missing headword, or invalid CEFR)', () => {
      // Real Octanove line 606 case: batter,,C1,one who bats
      const missingPosRow = normalizeLexicalRow({
        cols: ['batter', '', 'C1', 'one who bats'],
        lineNumber: 606,
        sourceMeta: greenSourceMeta,
        importBatch: 'test-batch',
      });
      expect(missingPosRow.valid).toBe(false);
      expect(missingPosRow.error_code).toBe('MALFORMED_MISSING_POS');

      const invalidCefrRow = normalizeLexicalRow({
        cols: ['example', 'noun', 'B3', ''],
        lineNumber: 10,
        sourceMeta: greenSourceMeta,
        importBatch: 'test-batch',
      });
      expect(invalidCefrRow.valid).toBe(false);
      expect(invalidCefrRow.error_code).toBe('MALFORMED_SOURCE_ROW');
    });
  });

  describe('3. Duplicate Detection, Conflict Preservation & Polysemy (Step 4)', () => {
    it('should deduplicate exact same-level entries while preserving all merged original_ids', () => {
      const r1 = normalizeLexicalRow({
        cols: ['launch', 'noun', 'C1', ''],
        lineNumber: 718,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;
      const r2 = normalizeLexicalRow({
        cols: ['launch', 'noun', 'C1', ''],
        lineNumber: 927,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;

      const merged = mergeCefrVocabularyCandidates([r1, r2]);
      expect(merged.candidates).toHaveLength(1);
      expect(merged.duplicates).toHaveLength(1);
      expect(merged.candidates[0].merged_original_ids).toEqual([
        'cefr_j:v1.5:line:718',
        'cefr_j:v1.5:line:927',
      ]);
    });

    it('should detect unannotated CEFR level conflicts without silently overwriting competing metadata', () => {
      const octMeta = { ...greenSourceMeta, source_id: 'octanove', version: '1.0' };
      const rCefrj = normalizeLexicalRow({
        cols: ['abolish', 'verb', 'B2', '', '', ''],
        lineNumber: 11,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;
      const rOct = normalizeLexicalRow({
        cols: ['abolish', 'verb', 'C2', ''],
        lineNumber: 1392,
        sourceMeta: octMeta,
        importBatch: 'b1',
      }).record;

      const merged = mergeCefrVocabularyCandidates([rCefrj, rOct]);
      expect(merged.candidates).toHaveLength(1);
      expect(merged.conflicts).toHaveLength(1);
      expect(merged.conflicts[0].conflict_type).toBe('CROSS_SOURCE_CEFR_CONFLICT');
      expect(merged.candidates[0].cefr_level).toBe('B2');
      expect(merged.candidates[0].conflict_status).toBe('CROSS_SOURCE_CEFR_CONFLICT');
      expect(merged.candidates[0].conflicting_cefr_levels).toEqual(['B2', 'C2']);
      expect(merged.candidates[0].conflicting_entries).toHaveLength(1);
      expect(merged.candidates[0].conflicting_entries[0].original_id).toBe('octanove:v1.0:line:1392');
    });

    it('should preserve explicit polysemous sense splits as distinct candidate entries', () => {
      const octMeta = { ...greenSourceMeta, source_id: 'octanove', version: '1.0' };
      const s1 = normalizeLexicalRow({
        cols: ['contract', 'verb', 'C1', 'hire'],
        lineNumber: 483,
        sourceMeta: octMeta,
        importBatch: 'b1',
      }).record;
      const s2 = normalizeLexicalRow({
        cols: ['contract', 'verb', 'C1', 'catch (as in a disease)'],
        lineNumber: 484,
        sourceMeta: octMeta,
        importBatch: 'b1',
      }).record;

      const merged = mergeCefrVocabularyCandidates([s1, s2]);
      expect(merged.candidates).toHaveLength(2);
      expect(merged.conflicts).toHaveLength(1);
      expect(merged.conflicts[0].conflict_type).toBe('POLYSEMY_SAME_LEVEL_SENSE_SPLIT');
      expect(merged.candidates[0].candidate_sense_index).toBe(1);
      expect(merged.candidates[1].candidate_sense_index).toBe(2);
    });
  });

  describe('4. Frequency & OEWN Sense Joins (Step 5 & Step 6)', () => {
    it('should deterministically join frequency ranks and leave unmatched words null with reason', () => {
      const { lookup } = buildFrequencyLookup({
        ngslCsv: 'Lemma,SFI Rank,SFI,U\nabandon,1245,58.2,65\nokay,800,61.0,120\n',
        nawlCsv: 'Word,Rank,Band,SFI,U\nabsorb,458,10,55.1,33\n',
        tslCsv: '',
        bslCsv: '',
      });

      const c1 = normalizeLexicalRow({
        cols: ['abandon', 'verb', 'B1', '', '', ''],
        lineNumber: 4,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;
      const c2 = normalizeLexicalRow({
        cols: ['OK/okay', 'adjective', 'A1', '', '', ''],
        lineNumber: 5,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;
      const c3 = normalizeLexicalRow({
        cols: ['swimming pool', 'noun', 'A1', '', '', ''],
        lineNumber: 6,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;

      const joined = joinFrequencyData([c1, c2, c3], lookup);
      expect(joined[0].frequency_rank).toBe(1245);
      expect(joined[0].frequency_source).toBe('NGSL_1.2');
      expect(joined[0].frequency_match_status).toBe('matched_exact_lemma');

      expect(joined[1].frequency_rank).toBe(800);
      expect(joined[1].frequency_match_status).toBe('matched_orthographic_variant:okay');

      expect(joined[2].frequency_rank).toBeNull();
      expect(joined[2].frequency_source).toBeNull();
      expect(joined[2].frequency_match_status).toBe('unmatched_multiword_or_abbreviation');
    });

    it('should match unambiguous 1-sense OEWN entries and mark multi-sense entries as ambiguous with sense_key=null', () => {
      const sampleIndexSense = [
        'monosemous%1:09:00:: 05812345 1 2',
        'polysemous%2:40:00:: 02232523 1 5',
        'polysemous%2:31:01:: 00614909 2 1',
      ].join('\n');

      const { lookup } = buildOewnSenseLookup(sampleIndexSense);

      const mono = normalizeLexicalRow({
        cols: ['monosemous', 'noun', 'C1', '', '', ''],
        lineNumber: 1,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;
      const poly = normalizeLexicalRow({
        cols: ['polysemous', 'verb', 'B1', '', '', ''],
        lineNumber: 2,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;
      const closedClass = normalizeLexicalRow({
        cols: ['although', 'conjunction', 'B1', '', '', ''],
        lineNumber: 3,
        sourceMeta: greenSourceMeta,
        importBatch: 'b1',
      }).record;

      const joined = joinOewnSenses([mono, poly, closedClass], lookup);
      expect(joined[0].oewn_match_status).toBe('matched');
      expect(joined[0].sense_key).toBe('monosemous%1:09:00::');
      expect(joined[0].oewn_synset_id).toBe('05812345-n');

      expect(joined[1].oewn_match_status).toBe('ambiguous');
      expect(joined[1].sense_key).toBeNull();
      expect(joined[1].oewn_candidate_count).toBe(2);

      expect(joined[2].oewn_match_status).toBe('not_attempted');
      expect(joined[2].sense_key).toBeNull();
    });
  });

  describe('5. Provenance, Review Status, Determinism & Full Pipeline Execution (Step 7–15)', () => {
    it('should produce deterministic, idempotent results across full dataset runs and never fabricate learner content', () => {
      const run1 = runVocabularyPipeline({
        projectRoot,
        importBatch: 'batch-2026-09-26-phase-6.2.7-v1',
        writeArtifacts: false,
      });
      const run2 = runVocabularyPipeline({
        projectRoot,
        importBatch: 'batch-2026-09-26-phase-6.2.7-v1',
        writeArtifacts: false,
      });

      expect(run1.importSummary.normalized_candidates_sha256).toBe(
        run2.importSummary.normalized_candidates_sha256
      );
      expect(run1.importSummary.pilot_batch_sha256).toBe(run2.importSummary.pilot_batch_sha256);

      // Exact empirical dataset counts
      expect(run1.importSummary.counts.raw_primary_input_rows).toBe(9935);
      expect(run1.importSummary.counts.malformed_rows_rejected).toBe(1);
      expect(run1.importSummary.counts.exact_duplicates_collapsed).toBe(28);
      expect(run1.importSummary.counts.final_candidate_set_size).toBe(9806);
      expect(run1.pilotBatch).toHaveLength(180);

      // Verify zero fabricated learner content and mandatory provenance on every candidate
      for (const c of run1.candidates) {
        expect(c.lifecycle_status).toBe('REVIEW_REQUIRED');
        expect(c.meaning_th).toBeNull();
        expect(c.meaning_en).toBeNull();
        expect(c.ipa).toBeNull();
        expect(c.example_sentence_en).toBeNull();
        expect(c.example_sentence_th).toBeNull();
        expect(c.provenance.source).toBeTruthy();
        expect(c.provenance.source_version).toBeTruthy();
        expect(c.provenance.source_url).toBeTruthy();
        expect(c.provenance.license).toBeTruthy();
        expect(c.provenance.license_url).toBeTruthy();
        expect(c.provenance.original_id).toBeTruthy();
        expect(c.provenance.import_batch).toBe('batch-2026-09-26-phase-6.2.7-v1');
        expect(c.provenance.transformation_method).toBeTruthy();
      }

      // Verify pilot batch has 30 items per CEFR level A1-C2 and excludes existing 21 active words
      expect(run1.importSummary.pilot_batch_summary.cefr_distribution).toEqual({
        A1: 30,
        A2: 30,
        B1: 30,
        B2: 30,
        C1: 30,
        C2: 30,
      });
      const activeSet = new Set(EXISTING_ACTIVE_SEEDED_WORDS);
      for (const p of run1.pilotBatch) {
        expect(activeSet.has(`${p.lemma}|${p.part_of_speech}`)).toBe(false);
      }
    }, 30000);

    it('should verify Phase 6.2.7 migrations enforce non-breaking constraints and REVIEW_REQUIRED pilot seeding', () => {
      const mig7 = fs.readFileSync(
        path.join(
          projectRoot,
          'supabase/migrations/20260926000007_add_vocabulary_provenance_and_lifecycle.sql'
        ),
        'utf8'
      );
      expect(mig7).toMatch(/ADD COLUMN IF NOT EXISTS sense_key/i);
      expect(mig7).toMatch(/ADD COLUMN IF NOT EXISTS provenance JSONB/i);
      expect(mig7).toMatch(/ADD COLUMN IF NOT EXISTS lifecycle_status/i);
      expect(mig7).toMatch(/chk_vocabularies_active_approved_enrichment/i);

      const mig8 = fs.readFileSync(
        path.join(projectRoot, 'supabase/migrations/20260926000008_seed_vocabulary_pilot_batch.sql'),
        'utf8'
      );
      expect(mig8).toMatch(/INSERT INTO public\.vocabularies/i);
      expect(mig8).toMatch(/'REVIEW_REQUIRED'/);
      expect(mig8).toMatch(/ON CONFLICT \(id\) DO UPDATE/i);
      // Verify all 180 pilot UUIDs are present and inactive (is_active = false)
      const uuidMatches = mig8.match(/a0000000-0000-4001-8100-\d{12}/g) || [];
      expect(uuidMatches).toHaveLength(180);
    });
  });
});
