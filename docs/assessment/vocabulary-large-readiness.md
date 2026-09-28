# Glova Large Vocabulary Readiness Gate & Phase 6.2.9 Human-QA Production Pipeline Report

- **Gate Identifier:** `GLOVA_LARGE_VOCABULARY_READINESS_GATE_V1`
- **Phase:** `6.2.9 — Vocabulary Enrichment & Human-QA Production Pipeline`
- **Overall Gate Verdict:** **`NOT READY`** (`overall_status = "NOT_READY"`, `user_testing_authorized = false`)
- **Product Target Disclaimer:** `~10,000` vocabulary entries and `~25,000` collocations are **Glova Product & Engineering Targets**, **NOT** official Council of Europe CEFR or Cambridge standards.
- **Production Database Modification in This Phase:** **NONE** (`0` production migrations executed; `0` unreviewed records promoted to `ACTIVE`).

---

## Section A–W Complete Readiness & Pipeline Ledger (23 Mandatory Audit Dimensions)

| Section | Dimension | Empirical Value & Breakdown | Gate Status |
|---|---|---|---|
| **A** | **Total Vocabulary Candidates** | `9806` normalized base candidates (`CEFR-J v1.5` + `Octanove C1/C2 v1.0`) + `70` evidence-backed polysemous CEFR-conflict secondary sense units = **`9876` staged learning units** (`9897` total including `21` curated active rows) | Staged |
| **B** | **Total `REVIEW_REQUIRED` Vocabulary** | **`9876`** staged learning units gated at `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) | Quarantined from learners |
| **C** | **Total `REVIEWED` Vocabulary** | **`0`** (awaits human lexicographer batch sign-off via `transitionVocabularyLifecycle`) | `0` auto-marked |
| **D** | **Total `APPROVED` Vocabulary** | **`21`** (`21` curated active rows; `0` staged rows auto-approved without human QA) | Strict Human Gate |
| **E** | **Total `ACTIVE` Vocabulary** | **`21`** `ACTIVE` rows served by `/api/content/vocabulary` | **NOT READY** (Gap: `9979`) |
| **F** | **Total `REJECTED` Vocabulary** | **`0`** in enriched staged corpus (`1` malformed upstream source row `batter,,C1` rejected at ingestion gate) | Clean |
| **G** | **CEFR Distribution (`A1–C2`)** | `A1: 1164`, `A2: 1411`, `B1: 2446`, `B2: 2778`, `C1: 1087`, `C2: 990` staged learning units (`>= 800` per level in candidate pool; `21` active) | **NOT READY** (Active < target) |
| **H** | **POS Distribution** | `100.00%` valid canonical POS across 12 tags (`noun: 4903`, `verb: 1814`, `adjective: 2037`, `adverb: 821`, closed-class/other: `301`) | **PASS** |
| **I** | **Sense Disambiguation Breakdown** | `MATCH_CONFIDENT: 3084` (`31.23%`), `MATCH_AMBIGUOUS: 6058` (`RECOMMENDED_NOT_APPROVED` pre-ranked), `NO_MATCH: 565`, `REVIEW_REQUIRED (Conflict): 169` | **NOT READY** (Requires human sense selection) |
| **J** | **English Meaning (`meaning_en`) Coverage** | **`3083`** OEWN 2024 `CC BY 4.0` definitions (`31.22%`) + `21` curated active; `6793` missing | **NOT READY** |
| **K** | **Thai Meaning (`meaning_th`) Coverage** | **`21`** curated active (`0` fabricated on `9876` staged units; offline draft workflow & schema ready, `9876` awaiting translation + Thai SME review) | **NOT READY** |
| **L** | **Pronunciation / IPA Coverage** | **`9560 / 9876`** (`96.8%`) via **CMUdict 0.7b (`BSD-2-Clause`)**: `8023` single-entry (`SOURCE_VERIFIED`), `1238` multi-variant (`SOURCE_VERIFIED_WITH_VARIANTS`), `172` phrase-composed (`REVIEW_REQUIRED`), `127` POS heteronyms (`REVIEW_REQUIRED`), `316` unresolved (`null`) | **96.79% Staged IPA** (Awaits active promotion) |
| **M** | **Example Sentence Coverage** | **`1111`** OEWN 2024 `CC BY 4.0` attested examples (`11.25%`) + `21` curated active; `8765` missing | **NOT READY** |
| **N** | **Collocation Coverage** | **`39487`** OEWN multi-word collocations (`REVIEW_REQUIRED: 38509`, `CANDIDATE: 978`, `975` taxonomic/low-utility flagged) + **`58`** `APPROVED`/`ACTIVE` curated collocations | **NOT READY** (`58 / 25,000` approved) |
| **O** | **Provenance Completeness** | **`9876 / 9876`** (`100.00%`) carry source, version, license, original ID, and field-level provenance | **PASS** |
| **P** | **Priority Tier Breakdown** | `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED: 2777`, `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS: 3669`, `TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED: 2696`, `TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS: 734` | **PASS** (100% Ranked) |
| **Q** | **Human Review Queue Size** | **`9876`** total queued learning units (`sense_key: 6792`, `meaning_en: 6793`, `meaning_th: 9876`, `phonetic_ipa: 615`, `example_sentence: 8808`) | **PASS** (Actionable Queues) |
| **R** | **Estimated Review Batches Required** | **`50`** batches (at `200` items/batch) or **`20`** macro-batches (at `500` items/batch), ordered Wave 1 ($\approx 3,005$ fast-track units) $\to$ Wave 4 | Documented |
| **S** | **Gap to `~10,000` `ACTIVE` Vocabulary** | **`9979`** `ACTIVE` units needed (`21` currently active; `9876` staged units ready in pipeline; raw learning-unit gap after polysemous conflict splitting reduced from `173` to **`103`**) | **NOT READY** |
| **T** | **Gap to `~25,000` `APPROVED` Collocations** | **`24942`** `APPROVED` collocations needed (`58` currently approved; `38509` high-utility OEWN collocations in `REVIEW_REQUIRED` queue + `978` in `CANDIDATE` pool) | **NOT READY** |
| **U** | **Scale Benchmark Summary** | Benchmarked across **4 tiers**: `180` (`75.21 ms`), `1,000` (`262.09 ms`), `5,000` (`1238.67 ms`), and `9876` (`2062.27 ms`, `4788.9 items/s`) | **PASS** |
| **V** | **Remaining Blockers** | 1) Human SME sense approval for `6058` ambiguous & `169` conflict units; 2) Offline Thai translation + SME review for `9876` units; 3) Verified example drafting for `8765` units; 4) Human approval of `24,942` collocations; 5) `+103` additional learning units from `NAWL/BSL/TSL` SME CEFR calibration | Explicitly Tracked |
| **W** | **Final Readiness Verdict** | **`NOT READY`** (`overall_status = "NOT_READY"`, `user_testing_authorized = false`) — Platform must NOT open for real user testing until human-QA promotion completes | **NOT READY (Hard Gate Enforced)** |

---

## 1. Detailed CEFR-Level Distribution (`A1–C2`) Across `9,876` Staged Learning Units

> **Important Disclaimer:** Counts reflect the empirical distribution of `CEFR-J v1.5` (`A1–B2`), `Octanove v1.0` (`C1–C2`), and `+70` evidence-backed secondary sense units expanded from polysemous cross/intra-source CEFR conflicts (`sense_index = 2`). This is a Glova product inventory breakdown, not an official Council of Europe or Cambridge standard.

| CEFR Level | Base Candidates | Staged Learning Units | `MATCH_CONFIDENT` | `MATCH_AMBIGUOUS` | `NO_MATCH` | `REVIEW_REQUIRED` (Conflict) | `meaning_en` (OEWN) | `phonetic_ipa` (CMUdict) | `SOURCE_VERIFIED` IPA | `example_sentence` (OEWN) | Missing `meaning_th` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **A1** | `1164` | `1164` | `275` | `705` | `183` | `1` | `275` | `1163` | `1134` | `86` | `1164` |
| **A2** | `1411` | `1411` | `379` | `947` | `83` | `2` | `379` | `1403` | `1347` | `112` | `1411` |
| **B1** | `2446` | `2446` | `687` | `1665` | `75` | `19` | `686` | `2431` | `2337` | `243` | `2446` |
| **B2** | `2778` | `2778` | `913` | `1713` | `95` | `57` | `913` | `2717` | `2627` | `304` | `2778` |
| **C1** | `1064` | `1087` | `388` | `603` | `53` | `43` | `388` | `1007` | `989` | `179` | `1087` |
| **C2** | `943` | `990` | `442` | `425` | `76` | `47` | `442` | `839` | `827` | `187` | `990` |

---

## 2. Sense Disambiguation, Conflict Resolution & `NO_MATCH` Audit (Step 3)

- **Confident Sense Matches (`MATCH_CONFIDENT`)**: `3084` units automatically linked to OEWN 2024 synsets with verified `CC BY 4.0` glosses.
- **Ambiguous Sense Matches (`MATCH_AMBIGUOUS`)**: `6058` polysemous units preserved with top candidate synsets and a deterministic recommended primary sense marked `RECOMMENDED_NOT_APPROVED` in `reports/vocabulary-sense-review.json`.
- **CEFR Conflict Resolution (`99` Base Conflict Groups $\to$ `169` Conflict Learning Units)**:
  - **Polysemous Conflicts Expanded (`69` base headwords $\to$ `+70` secondary `sense_index = 2` learning units)**: Where a headword+POS has distinct CEFR levels across `CEFR-J` (`A1–B2`) and `Octanove` (`C1–C2`) **and** `>= 2` distinct OEWN 2024 synsets, the pipeline creates separate sense-level learning units (`learning_unit_key = lemma|pos|LEVEL|sense:1` and `lemma|pos|HIGHER_LEVEL|sense:2`) with distinct recommended OEWN synsets. Both remain `REVIEW_REQUIRED` until human sign-off.
  - **Monosemous Calibration Disagreements (`30` base headwords, `0` artificial splits)**: Where OEWN 2024 has only `1` synset (or `0` for closed-class words), the pipeline refuses to invent fake secondary senses and flags them as `CONFLICT_MONOSEMOUS_CALIBRATION_DISAGREEMENT` for human CEFR level adjudication.
- **`NO_MATCH` Sub-Classification (`565` units)**:
  - `CLOSED_CLASS_FUNCTION_WORD`: `301` grammatical items (`preposition`, `determiner`, `pronoun`, `conjunction`, `modal verb`) naturally absent from WordNet.
  - `OPEN_CLASS_DERIVED_OR_COMPOUND_MISSING_IN_OEWN`: `264` British/inflected/multi-word headwords requiring manual or offline-drafted glosses.

---

## 3. Pronunciation / IPA Pipeline Audit — CMUdict 0.7b (`BSD-2-Clause`) (Step 6)

| Pronunciation Confidence Class | Review Status | Staged Unit Count | Handling Rule |
|---|---|---:|---|
| `HIGH_SINGLE_ENTRY` | `SOURCE_VERIFIED` | `8023` | Single unambiguous ARPAbet pronunciation in CMUdict 0.7b converted to slash-delimited IPA |
| `MULTI_VARIANT_ENTRY` | `SOURCE_VERIFIED_WITH_VARIANTS` | `1238` | Primary CMUdict pronunciation stored in `phonetic_ipa`; all variants preserved in `provenance.ipa_provenance.variants_ipa` |
| `COMPOSITE_PHRASE_FROM_TOKENS` | `REVIEW_REQUIRED` | `172` | Multi-word or hyphenated headword composed from verified CMUdict token pronunciations; requires human stress check |
| `AMBIGUOUS_HETERONYM` | `REVIEW_REQUIRED` | `127` | POS-sensitive heteronym (`record`, `present`, `lead`, `read`, `object`, `conduct`, `contract`, `permit`, `live`, `wind`, etc.) with multiple CMUdict stress/vowel variants; quarantined for POS-specific human review |
| `UNRESOLVED` | `UNRESOLVED` | `316` | Absent from CMUdict 0.7b; `phonetic_ipa` kept strictly `null` (`0` guessed pronunciations) |
| **Total Enriched with Real IPA** | — | **`9560 / 9876` (`96.8%`)** | Up from `0 / 9,806` in Phase 6.2.8 |

---

## 4. Priority Scoring & Human Review Queue Architecture (Steps 9 & 10)

| Priority Tier / Review Wave | Staged Unit Count | Description & Selection Criteria |
|---|---:|---|
| `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED` (Wave 1) | `2777` | Sense (`MATCH_CONFIDENT`) + CMUdict IPA (`SOURCE_VERIFIED`) already locked; only needs Thai gloss & missing example review |
| `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS` (Wave 2) | `3669` | High-frequency `A1–B2` polysemous core vocabulary with pre-ranked OEWN sense recommendations |
| `TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED` (Wave 3) | `2696` | `B2–C2` polysemous senses and POS-sensitive heteronyms |
| `TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS` (Wave 4) | `734` | Closed-class `NO_MATCH` items (`301`), open-class missing OEWN items (`264`), and `169` CEFR conflict units |

---

## 5. 4-Tier Pipeline Scale & Performance Benchmark (`180`, `1,000`, `5,000`, `9,876`) (Step 16)

> **Benchmark Disclaimer:** Measured on local offline Node.js batch execution. Represents offline content-pipeline build performance, NOT production Cloudflare Worker or Supabase query latency.

| Scale Tier | Input Units | Batch Size | Batches | Duration (`ms`) | Throughput (`items/s`) | Heap Used (`MB`) | RSS (`MB`) | `MATCH_CONFIDENT` | IPA Enriched | `REVIEW_REQUIRED` | Rejections |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Pilot_180** | `180` | `60` | `3` | `75.21` | `2393.3` | `413.75` | `592.76` | `51` | `177` | `180` | `0` |
| **Medium_1000** | `1000` | `250` | `4` | `262.09` | `3815.5` | `456.64` | `597.01` | `316` | `976` | `1000` | `0` |
| **Scale_5000** | `5000` | `1000` | `5` | `1238.67` | `4036.6` | `489.38` | `627.66` | `1552` | `4850` | `5000` | `0` |
| **Full_Corpus_9876** | `9876` | `1000` | `10` | `2062.27` | `4788.9` | `515.45` | `675.12` | `3084` | `9560` | `9876` | `0` |
