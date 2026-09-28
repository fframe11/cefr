# Glova Vocabulary Ingestion Pipeline & Provenance Guide (Phase 6.2.7)

- **Document Version:** 1.0.0
- **Phase:** 6.2.7 — Content Provenance + Real Vocabulary Ingestion Foundation
- **Architecture:** Offline Deterministic Pipeline (`SELECT & SERVE` in Production)
- **Runtime LLM Dependency:** **NONE (`0` runtime LLM calls)**

---

## 1. Architectural Purpose & Non-Negotiable Invariants

Glova operates as a **free CEFR/Cambridge English learning and assessment platform**. Production runtime only selects and serves prepared, reviewed content from Supabase PostgreSQL (`is_active = true`, `lifecycle_status = 'ACTIVE'`).

The Phase 6.2.7 vocabulary ingestion pipeline enforces five strict invariants:

1. **Green-Licensed Datasets Only**: Only open, redistributable datasets verified as `GREEN` in [`docs/assessment/content-sourcing-strategy.md`](file:///c:/CEFR_platform/docs/assessment/content-sourcing-strategy.md) are ingested (`CEFR-J v1.5`, `Octanove C1/C2 v1.0`, `NGSL v1.2`, `NAWL v1.2`, `TSL v1.2`, `BSL v1.20`, and `Open English WordNet 2024`).
2. **Hard Ban on Restricted Sources**: The pipeline never scrapes or imports **Cambridge English Vocabulary Profile (EVP)**, **Oxford 3000 / 5000**, or **EFLLex / CEFRLex** (`CC BY-NC-SA 4.0`).
3. **Zero Fabricated Learner Content**: When a source dataset provides only headword, part of speech, CEFR level, and sense/frequency metadata, the pipeline **never invents** Thai translations (`meaning_th`), English learner definitions (`meaning_en`), IPA transcriptions (`ipa`), example sentences (`example_sentence_en`, `example_sentence_th`), or collocations. Those columns remain `NULL` until offline enrichment and human/QA review.
4. **Lifecycle Isolation (`REVIEW_REQUIRED`)**: Every raw-ingested vocabulary candidate enters the pipeline with `lifecycle_status = 'REVIEW_REQUIRED'` and `is_active = false`. Existing production queries (`WHERE is_active = true`) remain 100% unaffected.
5. **Cryptographic Provenance & Deterministic Reproducibility**: Every source file is verified against its SHA-256 checksum in [`scripts/content-pipeline/sources/source-manifest.json`](file:///c:/CEFR_platform/scripts/content-pipeline/sources/source-manifest.json), and every normalized record carries a deterministic `candidate_id` (`vocab_<16-hex-sha256>`) and full source lineage.

---

## 2. Official Source Manifest & Cryptographic Checksums

All raw datasets are stored under [`scripts/content-pipeline/sources/`](file:///c:/CEFR_platform/scripts/content-pipeline/sources/source-manifest.json) and tracked by [`source-manifest.json`](file:///c:/CEFR_platform/scripts/content-pipeline/sources/source-manifest.json):

| Source Key | Official Name & Version | License | Local Path | Size (Bytes) | Data Rows | SHA-256 Checksum |
|---|---|---|---|---:|---:|---|
| `cefr_j` | CEFR-J Vocabulary Profile `1.5` | CC BY-SA 4.0 | `sources/cefr-j/cefrj-vocabulary-profile-1.5.csv` | `233,214` | `7,799` | `b0dd3c635f1c9a4fdf1490c7e5b7c48e8bbe55b652ad0c9860a95f98e10ae498` |
| `octanove` | Octanove Vocabulary Profile C1/C2 `1.0` | CC BY-SA 4.0 | `sources/octanove/octanove-vocabulary-profile-c1c2-1.0.csv` | `46,462` | `2,136` | `18c33a407f2f89f7b8de9671c6d45fe3ea0bce45e7d2d7dcaab48d73e0f7b380` |
| `ngsl` | New General Service List (NGSL) `1.2` | CC BY-SA 4.0 | `sources/ngsl/NGSL_12_stats.csv` | `62,566` | `2,809` | `2098bab8955a120a9766c6282a51d7d578c6cb0a7d946600d2ffb73ba25a0b44` |
| `nawl` | New Academic Word List (NAWL) `1.2` | CC BY-SA 4.0 | `sources/nawl/NAWL_12_stats.csv` | `25,103` | `957` | `4c99a9512730496fb19b7fbdd69831a1333ac3dd5f10cafb71487dd03c8f41f0` |
| `tsl` | TOEIC Service List (TSL) `1.2` | CC BY-SA 4.0 | `sources/tsl/TSL_12_stats.csv` | `32,010` | `1,250` | `2259df25a1077b04067ef0c0e9e4c98b46c91e4d539741dfaceba88651ff486d` |
| `bsl` | Business Service List (BSL) `1.20` | CC BY-SA 4.0 | `sources/bsl/BSL_120_stats.csv` | `59,643` | `1,744` | `45055265eb4e74c65f5d26edabbc1a0da38c45bbb924cd9bd01fd391b74ff157` |
| `oewn` (Index) | Open English WordNet `2024` (CEFR Filtered Sense Index) | CC BY 4.0 | `sources/oewn/oewn-2024-cefr-senses.txt` | `1,127,110` | `35,605` | `a95fd823705565b6f2dc4429239d34714ea736f4dc2998ac57f1e8fcf11a6efd` |
| `oewn` (Archive) | Open English WordNet `2024` (`english-wordnet-2024.zip`) | CC BY 4.0 | `sources/oewn/english-wordnet-2024.zip` *(optional local archive)* | `11,457,906` | `212,478` | `12ce54dd051b9420353f6c4ea74b34c736e23c8233d6d0bbd75407526f1fc732` |

> **Note on Open English WordNet 2024 (`oewn-2024-cefr-senses.txt`):** Because `.gitignore` excludes `*.zip` archives, the pipeline commits the deterministic filtered `index.sense` subset (`35,605` sense entries covering all lemmas present in `CEFR-J` and `Octanove`) alongside `LICENSE.md`. If `english-wordnet-2024.zip` is also present locally, `content:vocab:validate` verifies its SHA-256 hash as well.

---

## 3. Reproducing the Pipeline from a Clean Checkout

### 3.1 CLI Commands (`package.json`)

| Script | Underlying Command | Description |
|---|---|---|
| `npm run content:vocab:fetch` | `node scripts/content-pipeline/vocab/fetch-sources.mjs` | Downloads any missing raw dataset files from official upstream URLs, verifies SHA-256 hashes against `source-manifest.json`, and builds `oewn-2024-cefr-senses.txt` if needed. |
| `npm run content:vocab:validate` | `node scripts/content-pipeline/vocab/pipeline.mjs validate` | Verifies every dataset in `source-manifest.json` (file existence, exact byte size, SHA-256 digest, row counts, and `GREEN` license gate). Writes `scripts/content-pipeline/output/vocabulary-source-report.json`. |
| `npm run content:vocab:normalize` | `node scripts/content-pipeline/vocab/pipeline.mjs normalize` | Parses `CEFR-J` + `Octanove`, normalizes lemmas/variants/POS, deduplicates & detects conflicts, joins `NGSL`/`NAWL`/`TSL`/`BSL` frequency data, links `OEWN 2024` sense keys, selects the 180-record pilot batch, and writes `vocabulary-candidates-normalized.json` + `vocabulary-pilot-batch.json`. |
| `npm run content:vocab:report` | `node scripts/content-pipeline/vocab/pipeline.mjs report` | Generates `vocabulary-dedup-report.json`, `vocabulary-conflicts.json`, and `vocabulary-import-summary.json`. |

To run all stages end-to-end in a single pass:

```bash
node scripts/content-pipeline/vocab/pipeline.mjs all
```

### 3.2 Generated Output Artifacts (`scripts/content-pipeline/output/`)

1. **`vocabulary-source-report.json`** — Cryptographic checksum & row count verification across all 7 sources.
2. **`vocabulary-candidates-normalized.json`** *(gitignored, ~32 MB, regenerated deterministically)* — All **9,806** normalized vocabulary candidates (`SHA-256: ef119da594cc6f5c58c315f083bf77487fcbf15bafc9ec937e8d340a16ad69a9`).
3. **`vocabulary-dedup-report.json`** — Detailed breakdown of `9,935` raw rows $\to$ `1` rejected malformed row $\to$ `9,934` valid rows $\to$ `28` exact duplicates merged $\to$ `99` conflict groups (`100` rows collapsed) $\to$ `9,806` candidates.
4. **`vocabulary-conflicts.json`** — All `126` conflict and polysemy groups (`87` `CROSS_SOURCE_CEFR_CONFLICT`, `12` `INTRA_SOURCE_CEFR_CONFLICT`, `19` `POLYSEMY_CROSS_LEVEL_SENSE_SPLIT`, `8` `POLYSEMY_SAME_LEVEL_SENSE_SPLIT`).
5. **`vocabulary-import-summary.json`** — Complete statistical summary by CEFR level, POS, source dataset, frequency coverage, OEWN 2024 coverage, and pilot batch metrics.
6. **`vocabulary-pilot-batch.json`** — The controlled **180-record** (`30/level A1–C2`) pilot batch (`SHA-256: fe1872900a3ef2aa8d9fda3655bebe7506c969d6c0603bc6ccb913ac34ea9934`).

---

## 4. Canonical Normalized Vocabulary Candidate Schema

Every record in `vocabulary-candidates-normalized.json` and `vocabulary-pilot-batch.json` conforms to the following structure:

```json
{
  "candidate_id": "vocab_08ca3b6b3ef6c8ba",
  "word": "abandon",
  "lemma": "abandon",
  "headword_raw": "abandon",
  "variants": ["abandon"],
  "part_of_speech": "verb",
  "part_of_speech_raw": "verb",
  "cefr_level": "B1",
  "sense_note": null,
  "sense_index": 1,
  "core_inventory_1": "1",
  "core_inventory_2": null,
  "threshold": null,
  "frequency": {
    "status": "matched",
    "primary_source": "NGSL_1.2",
    "sfi": 55.66,
    "rank_per_million": 36.82,
    "band": "NGSL_1K_2K",
    "sources": [
      {
        "dataset": "NGSL_1.2",
        "band": "1.2",
        "sfi": 55.66,
        "adjusted_frequency_per_million": 36.82,
        "arf": 115250.33,
        "urm": 36.82
      }
    ]
  },
  "wordnet": {
    "status": "ambiguous",
    "pos_code": "2",
    "sense_count": 5,
    "sense_key": null,
    "synset_id": null,
    "sense_number": null,
    "tag_count": null,
    "candidate_senses": [
      {
        "sense_key": "abandon%2:40:00::",
        "synset_id": "02232523",
        "sense_number": 1,
        "tag_count": 10
      }
    ]
  },
  "learner_fields": {
    "ipa": null,
    "meaning_th": null,
    "meaning_en": null,
    "example_sentence_en": null,
    "example_sentence_th": null,
    "audio_storage_path": null
  },
  "lifecycle_status": "REVIEW_REQUIRED",
  "is_active": false,
  "conflict_flags": [],
  "conflicting_entries": [],
  "provenance": {
    "source_name": "cefr_j",
    "source_version": "1.5",
    "source_license": "CC BY-SA 4.0",
    "source_Url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv",
    "source_sha256": "b0dd3c635f1c9a4fdf1490c7e5b7c48e8bbe55b652ad0c9860a95f98e10ae498",
    "original_id": "cefr_j:v1.5:line:9",
    "merged_original_ids": ["cefr_j:v1.5:line:9"],
    "transformation_method": "deterministic_csv_ingest_v1",
    "imported_at": "2026-09-26T00:00:00.000Z"
  }
}
```

---

## 5. Normalization, Validation, Deduplication & Conflict Resolution Rules

### 5.1 Headword & Variant Parsing (`parseHeadwordAndVariants`)
`CEFR-J` and `Octanove` include spelling variants, parenthetical forms, and punctuation in `headword` strings. The parser deterministically normalizes them without losing raw forms:
- `all right/alright` $\to$ `lemma: "all right"`, `variants: ["all right", "alright"]`
- `airplane (aeroplane)` $\to$ `lemma: "airplane"`, `variants: ["airplane", "aeroplane"]`
- `advisor/adviser` $\to$ `lemma: "advisor"`, `variants: ["advisor", "adviser"]`
- `a.m./A.M./am/AM` $\to$ `lemma: "a.m."`, `variants: ["a.m.", "A.M.", "am", "AM"]`

### 5.2 Canonical POS Mapping (`POS_MAP`)
Raw POS tags are mapped into 12 canonical values:
- `noun`, `verb`, `adjective`, `adverb`, `preposition`, `conjunction`, `determiner`, `pronoun`, `interjection`, `number`, `modal_auxiliary` (`modal auxiliary`), `infinitive_to` (`infinitive-to`).
- `be-verb`, `do-verb`, and `have-verb` map to `verb`.
- **Upstream Typo Handling**: Line `2129` of `Octanove v1.0` contains `remonstrate,vern,C2,`. The pipeline maps `vern` $\to$ `verb` and appends `+pos_typo_corrected:vern->verb` to `provenance.transformation_method`.
- **Malformed Row Rejection**: Line `606` of `Octanove v1.0` (`batter,,C1,one who bats`) has an empty `pos` column and is rejected into `rejectedRows` (`1` rejected row total).

### 5.3 Deduplication, Polysemy Preservation & Conflict Handling
Normalized rows are grouped by `(lemma.toLowerCase(), part_of_speech)` and evaluated under four deterministic cases:

1. **Exact Duplicate (`EXACT_DUPLICATE_COLLAPSED` — `28` rows merged)**:
   - Identical `(lemma, part_of_speech, cefr_level, sense_note)`.
   - Collapsed into one candidate; all upstream row IDs are preserved in `provenance.merged_original_ids`.
2. **Explicit Sense Split (`POLYSEMY_CROSS_LEVEL_SENSE_SPLIT` [`19` groups] & `POLYSEMY_SAME_LEVEL_SENSE_SPLIT` [`8` groups])**:
   - Entries carry distinct explicit `notes` (sense disambiguators) in the source CSV — e.g.:
     - `agency` (`noun`): `A2` (`"travel agency"`) vs `C2` (`"ability to take action"`).
     - `battery` (`noun`): `A2` (`""`) vs `C1` (`"assault and battery"`).
     - `March` (`noun`, `A1`, `"month"`) vs `march` (`noun`, `B2`, `""`).
     - `contract` (`verb`, `C1`, `"become smaller"` vs `"catch/acquire"`).
   - **Both senses are preserved as distinct candidates** with incremented `sense_index` (`1, 2, ...`) and flagged in `conflict_flags` for lexicographer verification.
3. **Unresolved CEFR Conflict (`CROSS_SOURCE_CEFR_CONFLICT` [`87` groups] & `INTRA_SOURCE_CEFR_CONFLICT` [`12` groups] — `100` competing rows collapsed)**:
   - Multiple entries share `(lemma, part_of_speech)` with different CEFR levels and no distinguishing sense notes (e.g., `CEFR-J` assigns `B1`/`B2` while `Octanove` assigns `C1`/`C2`, or `Octanove` lists `commission|verb` at both `C1` and `C2`).
   - Rather than silently overwriting or fabricating senses, the pipeline retains the primary entry (`cefr_j` prioritized for `A1–B2`, lowest CEFR level first) and embeds the competing entries inside `conflicting_entries` with `conflict_flags` set and `lifecycle_status = 'REVIEW_REQUIRED'`.

---

## 6. Empirical Pipeline Statistics (`9,806` Candidates)

| Metric | Value | Notes |
|---|---:|---|
| **Raw Primary Rows (`CEFR-J` + `Octanove`)** | `9,935` | `7,799` (`CEFR-J v1.5`) + `2,136` (`Octanove v1.0`) |
| **Rejected Malformed Rows** | `1` | `octanove:v1.0:line:606` (`batter,,C1,one who bats`) |
| **Valid Normalized Rows** | `9,934` | Includes `1` deterministic POS typo fix (`vern` $\to$ `verb`) |
| **Exact Duplicate Rows Merged** | `28` | Preserved in `provenance.merged_original_ids` |
| **Competing Conflict Rows Collapsed** | `100` | Across `99` conflict groups (`87` cross-source + `12` intra-source) |
| **Final Normalized Candidate Set** | **`9,806`** | SHA-256: `ef119da594cc6f5c58c315f083bf77487fcbf15bafc9ec937e8d340a16ad69a9` |

### 6.1 Breakdown by CEFR Level (`9,806` Candidates)
- **A1:** `1,164` (`11.87%`)
- **A2:** `1,411` (`14.39%`)
- **B1:** `2,446` (`24.94%`)
- **B2:** `2,778` (`28.33%`)
- **C1:** `1,064` (`10.85%`)
- **C2:** `943` (`9.62%`)

### 6.2 Breakdown by Canonical Part of Speech
- `noun`: `4,869` | `adjective`: `2,023` | `verb`: `1,793` | `adverb`: `820` | `pronoun`: `83` | `preposition`: `81` | `determiner`: `46` | `conjunction`: `38` | `number`: `30` | `modal_auxiliary`: `13` | `interjection`: `9` | `infinitive_to`: `1`

### 6.3 Frequency Coverage (`NGSL v1.2`, `NAWL v1.2`, `TSL v1.2`, `BSL v1.20`)
- **Matched:** **`5,375 / 9,806` (`54.81%`)**
  - Primary source `NGSL_1.2`: `3,602` (`NGSL_1K`: `1,532`, `NGSL_2K`: `1,179`, `NGSL_3K`: `891`)
  - Primary source `TSL_1.2`: `737`
  - Primary source `NAWL_1.2`: `601`
  - Primary source `BSL_1.20`: `435`
- **Unmatched:** **`4,431` (`45.19%`)**
  - `unmatched_multiword_or_abbreviation`: `221`
  - `unmatched_not_in_ngsl_nawl_tsl_bsl`: `4,210` (primarily lower-frequency B2/C1/C2 items outside the ~6,760-word NGSL/NAWL/TSL/BSL core lists)

### 6.4 Open English WordNet 2024 Sense Coverage
- **`matched` (Unambiguous 1-Sense Lemma+POS):** **`2,712` (`27.66%`)** — Linked directly to exact `wordnet_sense_key` and `wordnet_synset_id`.
- **`ambiguous` (Multi-Sense Lemma+POS):** **`6,529` (`66.58%`)** — Top 5 candidate senses stored in `provenance_meta.wordnet_candidate_senses`; `wordnet_sense_key` left `NULL` to prevent false sense assignment.
- *(Total Open-Class Found in OEWN 2024: **`9,241 / 9,505` open-class items = `97.22%`**)*
- **`not_found`:** **`264` (`2.69%`)** — Multi-word phrases or British spellings not indexed as exact lemma+POS in OEWN.
- **`not_attempted` (Closed-Class POS):** **`301` (`3.07%`)** — Prepositions, pronouns, determiners, conjunctions, modals, interjections, numbers, and `infinitive_to` (WordNet only indexes nouns, verbs, adjectives, and adverbs).

---

## 7. Database Schema & Controlled Pilot Batch (`180` Records)

### 7.1 Non-Breaking Schema Migration (`20260926000007_add_vocabulary_provenance_and_lifecycle.sql`)
Adds provenance, frequency, sense-key, and lifecycle columns to `public.vocabularies` while preserving existing production rows:
- Makes `meaning_th` nullable **only** when `lifecycle_status IN ('RAW_IMPORTED', 'NORMALIZED', 'REVIEW_REQUIRED')`.
- Enforces `chk_vocabularies_active_requires_meaning_th`: **no row can ever have `is_active = true` or `lifecycle_status IN ('APPROVED', 'ACTIVE')` unless `meaning_th` is non-empty**.
- Replaces the rigid `UNIQUE (word, part_of_speech, cefr_level)` constraint with `UNIQUE (word, part_of_speech, cefr_level, sense_index)` (`sense_index SMALLINT NOT NULL DEFAULT 1`) so legitimate same-level polysemous words can coexist.
- Backfills the existing 21 production seed rows with `lifecycle_status = 'ACTIVE'` and `source_name = 'glova_curated_seed_v1'`.

### 7.2 Controlled Pilot Seed Migration (`20260926000008_seed_vocabulary_pilot_batch.sql`)
- Contains **180 deterministic rows** (`30` per CEFR level `A1` through `C2`, deterministic UUIDs `20000000-0000-4000-8000-000000000001`..`000180`).
- **Zero overlap** with the 21 existing production seed rows.
- Every pilot row is inserted with `lifecycle_status = 'REVIEW_REQUIRED'`, `is_active = false`, `meaning_th = NULL`, and full provenance + checksum metadata.
- Uses `ON CONFLICT (word, part_of_speech, cefr_level, sense_index) DO UPDATE ... WHERE vocabularies.lifecycle_status <> 'ACTIVE'` so re-running is idempotent and never overwrites active curated vocabulary.

---

## 8. How Vocabulary Ingestion Feeds Phase 6.2.8 Question Bank Blueprints

The Vocabulary Bank established in Phase 6.2.7 serves as the **deterministic anchor** for Phase 6.2.8 offline item bank expansion:

1. **Offline Enrichment Gate (`REVIEW_REQUIRED` $\to$ `REVIEWED` $\to$ `APPROVED`)**:
   - Before a vocabulary candidate is used in learner flashcards or assessment items, offline enrichment scripts (assisted by OEWN synset definitions, corpus examples, and human/QA review) populate `meaning_en`, `meaning_th`, `ipa`, `example_sentence_en`, `example_sentence_th`, and disambiguate `wordnet_sense_key` for `ambiguous` entries.
2. **Deterministic Distractor Selection**:
   - Because every candidate carries `(cefr_level, part_of_speech, frequency_sfi, frequency_band, wordnet_synset_id)`, Phase 6.2.8 item blueprints can deterministically select **form-matched, level-matched, frequency-matched distractors** (same `cefr_level`, same `part_of_speech`, similar `frequency_sfi` within $\pm 5.0$, distinct `wordnet_synset_id`) without calling an LLM at runtime.
3. **Construct-Aligned Item Blueprints**:
   - **A1–A2:** High-frequency (`NGSL_1K`/`2K`) concrete nouns, verbs, and adjectives feed lexical gap-fill and definition-matching blueprints.
   - **B1–B2:** `NGSL_3K`, `TSL`, and `BSL` items feed contextual collocation and multiple-choice cloze blueprints.
   - **C1–C2:** `Octanove` and `NAWL` academic/abstract items feed register-sensitive lexical precision and polysemy-sense discrimination blueprints.
