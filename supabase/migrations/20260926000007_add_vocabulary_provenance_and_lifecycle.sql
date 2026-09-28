-- ==============================================================================
-- Migration: 20260926000007_add_vocabulary_provenance_and_lifecycle.sql
-- Description: Phase 6.2.7 Non-Breaking Additive Schema Migration for Vocabulary
--              Provenance, Sense Keys, Frequency Ranks, and Review Lifecycle.
-- Guarantees:
--   1. Non-destructive (all existing 21 active rows remain APPROVED and valid).
--   2. Raw imported lexical entries (REVIEW_REQUIRED, is_active = false) can be
--      stored without fabricating Thai meanings, IPA, or example sentences.
--   3. Strict CHECK constraint prevents any vocabulary item from becoming
--      is_active = true or lifecycle_status = 'APPROVED' without complete
--      pedagogical enrichment (ipa, meaning_th, meaning_en, examples, topic).
--   4. RLS policies and answer-key protections remain 100% unchanged.
-- ==============================================================================

-- 1. Add provenance, frequency, OEWN sense, learning unit identity, and lifecycle columns to public.vocabularies
ALTER TABLE public.vocabularies
  ADD COLUMN IF NOT EXISTS sense_index SMALLINT NOT NULL DEFAULT 1 CHECK (sense_index >= 1),
  ADD COLUMN IF NOT EXISTS learning_unit_key VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS sense_key VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS frequency_rank INTEGER NULL CHECK (frequency_rank IS NULL OR frequency_rank > 0),
  ADD COLUMN IF NOT EXISTS frequency_source VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS oewn_synset_id VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS oewn_match_status VARCHAR(20) NOT NULL DEFAULT 'not_attempted'
    CHECK (oewn_match_status IN ('matched', 'ambiguous', 'not_found', 'not_attempted')),
  ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
    CHECK (lifecycle_status IN ('IMPORTED', 'NORMALIZED', 'ENRICHED', 'VALIDATED', 'REVIEW_REQUIRED', 'REVIEWED', 'APPROVED', 'ACTIVE', 'REJECTED', 'RETIRED')),
  ADD COLUMN IF NOT EXISTS source_name VARCHAR(80) NOT NULL DEFAULT 'glova_curated',
  ADD COLUMN IF NOT EXISTS source_version VARCHAR(30) NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS source_license VARCHAR(80) NOT NULL DEFAULT 'Glova-Proprietary',
  ADD COLUMN IF NOT EXISTS provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Expand part_of_speech check constraint to support full CEFR-J / Octanove POS set
ALTER TABLE public.vocabularies
  DROP CONSTRAINT IF EXISTS vocabularies_part_of_speech_check;

ALTER TABLE public.vocabularies
  ADD CONSTRAINT vocabularies_part_of_speech_check CHECK (
    part_of_speech IN (
      'noun',
      'verb',
      'adjective',
      'adverb',
      'preposition',
      'conjunction',
      'phrase',
      'determiner',
      'pronoun',
      'interjection',
      'modal_auxiliary',
      'number',
      'infinitive_to'
    )
  );

-- 3. Allow learner-enrichment columns to be NULL only while lifecycle_status NOT IN ('APPROVED', 'ACTIVE') and is_active = false
ALTER TABLE public.vocabularies
  ALTER COLUMN ipa DROP NOT NULL,
  ALTER COLUMN meaning_th DROP NOT NULL,
  ALTER COLUMN meaning_en DROP NOT NULL,
  ALTER COLUMN example_sentence_en DROP NOT NULL,
  ALTER COLUMN example_sentence_th DROP NOT NULL,
  ALTER COLUMN topic DROP NOT NULL;

ALTER TABLE public.vocabularies
  DROP CONSTRAINT IF EXISTS chk_vocabularies_active_approved_enrichment;

ALTER TABLE public.vocabularies
  ADD CONSTRAINT chk_vocabularies_active_approved_enrichment CHECK (
    (is_active = FALSE AND lifecycle_status NOT IN ('APPROVED', 'ACTIVE'))
    OR (
      ipa IS NOT NULL AND btrim(ipa) <> ''
      AND meaning_th IS NOT NULL AND btrim(meaning_th) <> ''
      AND meaning_en IS NOT NULL AND btrim(meaning_en) <> ''
      AND example_sentence_en IS NOT NULL AND btrim(example_sentence_en) <> ''
      AND example_sentence_th IS NOT NULL AND btrim(example_sentence_th) <> ''
      AND topic IS NOT NULL AND btrim(topic) <> ''
    )
  );

-- 4. Add additive provenance, sense linkage & lifecycle columns to public.vocabulary_collocations
ALTER TABLE public.vocabulary_collocations
  ADD COLUMN IF NOT EXISTS sense_key VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS relation_type VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS example_sentence_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS example_sentence_th TEXT NULL,
  ADD COLUMN IF NOT EXISTS source_name VARCHAR(80) NOT NULL DEFAULT 'glova_curated',
  ADD COLUMN IF NOT EXISTS source_version VARCHAR(30) NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS source_license VARCHAR(80) NOT NULL DEFAULT 'Glova-Proprietary',
  ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
    CHECK (lifecycle_status IN ('IMPORTED', 'NORMALIZED', 'ENRICHED', 'VALIDATED', 'REVIEW_REQUIRED', 'REVIEWED', 'APPROVED', 'ACTIVE', 'REJECTED', 'RETIRED')),
  ADD COLUMN IF NOT EXISTS provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 5. Supporting indexes for 10,000+ vocabulary & 25,000+ collocation runtime and batch queries
CREATE INDEX IF NOT EXISTS idx_vocabularies_lifecycle_status
  ON public.vocabularies (lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_vocabularies_lemma_pos_cefr
  ON public.vocabularies (lemma, part_of_speech, cefr_level, sense_index);

CREATE INDEX IF NOT EXISTS idx_vocabularies_active_cefr_word
  ON public.vocabularies (cefr_level, word, id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vocabularies_frequency_rank
  ON public.vocabularies (frequency_rank)
  WHERE frequency_rank IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vocabulary_collocations_vocab_id
  ON public.vocabulary_collocations (vocabulary_id);

