# Phase 6.2.12 — Vocabulary Tier 1 Critical-Risk Human QA Workflow & Execution Report

**Platform:** Glova (CEFR / Cambridge English Assessment Platform)  
**Execution Phase:** Phase 6.2.12 — Human QA Execution / Tier 1  
**Generated At:** 2026-09-26  
**Status:** `NOT_READY` (Strict Production Gate Enforced)  
**User Testing Authorized:** `false`  
**Learner-Ready Active Vocabulary Count:** `21 / 10,000` (Remaining Gap: `9,979`)  
**Production Supabase Modifications:** `0` (Zero migrations, zero direct DB writes)

---

## 1. Executive Summary & Review Queue Census

In Phase 6.2.12, Glova launches the authentic **Human QA Review Workflow** focused exclusively on the highest-risk vocabulary segment: **Tier 1 Critical Risk**.

Prior phases (6.2.8 through 6.2.11) established the large vocabulary candidate foundation (10,021 unique units, 0 duplicate keys, 50 staged batches of 200 items each, 8-dimension automated audit). However, automated audits cannot substitute for qualified human lexicographical sign-off. Unreviewed or ambiguous content remains strictly locked in `REVIEW_REQUIRED`.

### Inventory Census

| Metric | Measured Value | Target | Variance / Gap |
| :--- | :--- | :--- | :--- |
| **Total Staged Units Examined** | 10,000 | 10,000 | 0 (100% census) |
| **Tier 1 Critical-Risk Units Extracted** | **7,119** | — | **71.19% of staged inventory** |
| **Non-Tier 1 Staged Units** | 2,881 | — | 28.81% (Tiers 2, 3, 4) |
| **Tier 1 Batches Created** | **36 batches** | — | Batches 1–35: 200 items; Batch 36: 119 items |
| **Existing Active Curated Units** | 21 | — | Fully preserved, zero regressions |
| **Newly Approved Units in Phase 6.2.12** | **0** | — | **Zero automated or fake human approvals** |
| **Learner-Ready Active Total** | **21** | 10,000 | **Gap: 9,979** |
| **Overall Platform Readiness** | `NOT_READY` | `READY` | Gated until 10,000 human-approved |
| **User Testing Authorization** | `false` | `true` | Gated until readiness gate passes |

---

## 2. Deterministic Risk Classification & Overlap Analysis

Tier 1 critical-risk units are identified deterministically by evaluating each staged unit against the 6 critical risk categories without double-counting the physical units.

### Tier 1 Risk Reasons (Census)

| Risk Category | Unique Occurrence Count | Description / Root Cause |
| :--- | :--- | :--- |
| **Ambiguous Senses** (`ambiguous_sense`) | 6,058 | Multiple candidate synsets in OEWN without automated single-sense convergence |
| **Blocking QA Flags** (`qa_flagged`) | 6,966 | Triggered one or more failure flags in the 8-dimension audit (e.g. unadjudicated sense, example target match) |
| **Unresolved IPA** (`unresolved_ipa`) | 617 | Missing phonetic IPA string (316) or requiring human verification / transcription (301) |
| **No-Match Senses** (`no_match_sense`) | 565 | Lemma/POS candidate not matched in OEWN 2024 core synsets |
| **CEFR Conflicts** (`cefr_conflict`) | 226 | Conflicting level ratings across sources (e.g. CEFR-J vs. Oxford 3000 / Cambridge) |
| **Heteronyms / Composites** (`heteronym`) | 0 | Pronunciation split requiring distinct phonetic forms by sense |

### Overlap Distribution Matrix (No Double Counting)

Every unit is mapped into a single distinct overlap bucket. Total unique units: **7,119**.

```
+-------------------------------------------------------------+-------+
| Overlap Combination                                         | Count |
+-------------------------------------------------------------+-------+
| ambiguous_sense + qa_flagged                                | 5,853 |
| no_match_sense + qa_flagged                                 |   427 |
| qa_flagged + unresolved_ipa                                 |   173 |
| ambiguous_sense + qa_flagged + unresolved_ipa               |   168 |
| cefr_conflict + qa_flagged                                  |   166 |
| no_match_sense + qa_flagged + unresolved_ipa                |   136 |
| unresolved_ipa (alone)                                      |   135 |
| ambiguous_sense + cefr_conflict + qa_flagged                |    35 |
| cefr_conflict (alone)                                       |    18 |
| cefr_conflict + qa_flagged + unresolved_ipa                 |     3 |
| ambiguous_sense + cefr_conflict + qa_flagged + unres_ipa    |     2 |
| cefr_conflict + no_match_sense + qa_flagged                 |     2 |
| qa_flagged (alone)                                          |     1 |
+-------------------------------------------------------------+-------+
| Total Unique Tier 1 Units                                   | 7,119 |
+-------------------------------------------------------------+-------+
```

---

## 3. CEFR Level Representation & Progression Across Tier 1

Tier 1 critical-risk items span across all six CEFR proficiency bands (A1 through C2), confirming that risk adjudication is essential at every stage of the learner journey.

```
       Tier 1 Distribution Across CEFR Levels (Total: 7,119)
  
   A1:  901 units (12.66%)  [████████]
   A2: 1,073 units (15.07%)  [██████████]
   B1: 1,812 units (25.45%)  [████████████████]
   B2: 1,942 units (27.28%)  [█████████████████]
   C1:  757 units (10.63%)  [███████]
   C2:  634 units ( 8.91%)  [██████]
```

- **A1–A2 Core (1,974 units, 27.73%):** High-frequency foundational words with severe polysemy (e.g. *get*, *have*, *make*, *go*, *run*) requiring precise sense selection for beginners.
- **B1–B2 Independent (3,754 units, 52.73%):** The largest risk cluster, dominated by nuanced metaphorical senses, multi-word collocations, and cross-source CEFR calibration differences.
- **C1–C2 Proficient (1,391 units, 19.54%):** Specialized register, academic abstract definitions, and rarer loan words or low-frequency phonetic variants.

---

## 4. Reviewer Tool Architecture & 14-Dimension Visual Model

To support rapid, ergonomically sound, and error-free human review, Glova provides the command-line review terminal:
`scripts/content-pipeline/vocab/review-cli.mjs`

### The 14 Visual Review Dimensions

For every candidate unit, the CLI displays all 14 required dimensions in structured sections:

1. **Identity & Normalization:** Canonical lemma, headword spelling, case normalization, and `learning_unit_key`.
2. **Part of Speech:** Canonical syntactic category (noun, verb, adjective, adverb, preposition, etc.).
3. **CEFR Level & Staging:** Staged CEFR rating (A1–C2) and production priority tier.
4. **English Meaning:** Standardized definition, provenance source (e.g. OEWN-2024), and review status.
5. **Thai Translation:** Thai learner definition, checking script validity and ensuring zero dual-language parenthetical clutter.
6. **Phonetic IPA:** International Phonetic Alphabet representation, source dictionary (CMUdict), and phonetic variant list.
7. **Example Sentence:** Authentic learner example, target word match check, and contextual clarity.
8. **Topic / Semantic Domain:** Pedagogical topic tagging (e.g. Daily Life, Education, Travel, Business).
9. **Sense Disambiguation & Synset:** Disambiguation state, canonical OEWN synset ID, OEWN sense key, and candidate definitions/examples preview.
10. **CEFR Conflict Profile:** Multi-source discrepancy audit (conflicting levels, alternative source ratings).
11. **Pronunciation Integrity:** Audio/IPA consistency, heteronym indicator, and required phonetic dispositions.
12. **Content Provenance:** Source dataset name, schema version, deterministic transformation chain, and license.
13. **Tier 1 Risk Reasons:** Explicit flags designating why this item requires Tier 1 review.
14. **Automated QA Audit Status:** Live 8-dimension audit evaluation with blocking flags.

---

## 5. Authenticated Reviewer Security & Anti-Bot Invariant

Section 3 of the human review engine enforces strict authentication of reviewer identity via `validateReviewerIdentity(reviewerId)`:

```javascript
// scripts/content-pipeline/vocab/human-review-engine.mjs
export const BANNED_REVIEWER_PATTERNS = Object.freeze([
  'system', 'ai', 'auto-review', 'auto_review', 'autoreview',
  'bot', 'script', 'synthetic', 'automated', 'llm', 'none',
  'unknown', 'admin', 'root', 'test_fake', 'fake', 'mock',
]);
```

### Security Rules:
1. **Mandatory Identity:** Non-empty, trim-validated string. Minimum 3 characters.
2. **Strict Bot/AI Ban:** Any identifier matching banned prefixes or patterns (`ai_agent`, `bot_reviewer`, `system`, `synthetic`, etc.) is rejected with an explicit error.
3. **Audit Trail Accountability:** Every review action is permanently linked to the named reviewer in `reports/vocabulary-human-review-ledger.json`.

---

## 6. Controlled Field-Level Editing Engine

Reviewers can make surgical corrections to learner-facing fields directly in the CLI tool without modifying internal structural keys:

### Permitted Edit Fields (`ALLOWED_EDIT_FIELDS`)
- `meaning_en` (Min. 3 characters, non-circular)
- `meaning_th` (Valid Thai Unicode script, min. 2 Thai characters)
- `phonetic_ipa` (Valid slash-delimited IPA transcription)
- `example_sentence` (Min. 10 characters, must contain target word or inflection)
- `cefr_level` (Strictly A1, A2, B1, B2, C1, or C2)
- `sense_key` / `oewn_synset_id` (Valid OEWN identifier)
- `topic` (Pedagogical topic category)

Any attempt to edit unapproved fields (e.g. `learning_unit_key`, `priority_tier`, `word`) throws a validation error.

---

## 7. Decision Lifecycle State Machine & Transition Rules

Review decisions follow a strict, deterministic state machine:

```
                  +-------------------+
                  |  REVIEW_REQUIRED  |
                  +-------------------+
                     /     |    \     \
       [Approve]*   /      |     \     \ [Reject]
                   /       |      \     \
                  v        v       v     v
           +----------+ +------+ +----+ +----------+
           | APPROVED | | EDIT | |HOLD| | REJECTED |
           +----------+ +------+ +----+ +----------+
                 |
        [Active Promotion]**
                 |
                 v
            +--------+
            | ACTIVE |
            +--------+
```

*\* Approval Gate:* Requires zero blocking QA flags, terminal IPA disposition (if IPA was missing), terminal sense disposition (if sense was ambiguous), and non-empty rationale (>= 10 chars).  
*\*\* Active Promotion:* Blocked until the platform-wide 10,000 learner-ready threshold is satisfied.

---

## 8. IPA & Pronunciation Disposition Protocol

For the **617 unresolved IPA units** in Tier 1:
- A unit cannot transition to `APPROVED` with `phonetic_ipa: null` unless assigned a terminal disposition:
  1. `VERIFIED_PRONUNCIATION`: Human transcriber supplies verified IPA via field edits.
  2. `MULTIPLE_VALID_VARIANTS`: Reviewer confirms both UK and US pronunciations are valid.
  3. `NOT_APPLICABLE_NO_PHONETIC_FORM`: Legitimate non-phonetic symbol or mathematical operator exempt from IPA.
- Dispositions `UNRESOLVED` and `REQUIRES_HUMAN_TRANSCRIPTION` block approval.

---

## 9. Sense Disambiguation & CEFR Conflict Adjudication

For the **6,058 ambiguous senses** and **226 CEFR conflicts**:
- Units cannot be approved while in `MATCH_AMBIGUOUS`, `NO_MATCH`, or `CEFR_CONFLICT` state without an explicit terminal disposition:
  - `SELECT_SUPPORTED_SENSE`: Reviewer selects the synset that best matches the staged CEFR level and definition.
  - `SPLIT_LEARNING_UNIT`: Unit is split into two distinct learning units at different CEFR levels.
  - `EDIT_MEANING`: Definition is amended to align with the canonical synset.
  - `CHANGE_CEFR_WITH_EVIDENCE`: CEFR level is updated based on external lexicographical evidence.

---

## 10. Immutable Review Ledger & Audit Trail

All review actions are logged to `reports/vocabulary-human-review-ledger.json`.

Each event records:
- `event_id`: Unique UUID `rev_evt_<id>`
- `recorded_at`: ISO-8601 timestamp
- `batch_id`: e.g. `TIER-1-001`
- `source_batch_id`: e.g. `LARGE-001`
- `learning_unit_key`: Canonical unit key
- `reviewer_id`: Authenticated reviewer name
- `decision`: `APPROVE`, `EDIT_REQUIRED`, `HOLD`, or `REJECT`
- `rationale`: Human explanation
- `ipa_disposition` / `sense_disposition`: Dispositions assigned
- `edits`: Exact field deltas applied

---

## 11. Batch Partitioning & Traceability Model

The 7,119 Tier 1 units are partitioned into 36 manageable JSON files under:
`scripts/content-pipeline/output/tier1-batches/`

- **Batches `TIER-1-001.json` through `TIER-1-035.json`:** Exactly 200 units each.
- **Batch `TIER-1-036.json`:** Exactly 119 units.
- **Full Traceability:** Every unit retains `source_batch_id` (`LARGE-xxx`) and `source_unit_index`.
- **Bidirectional Sync:** When a review decision is recorded on a `TIER-1-xxx` batch, `recordReviewDecisionOnUnit` automatically syncs the decision, rationale, and edits back to the corresponding `LARGE-xxx` batch and updates its SHA-256 hash.

---

## 12. Batch 1 Initial State (`TIER-1-001`)

`TIER-1-001.json` has been prepared for the initial human review pilot:

- **Batch ID:** `TIER-1-001`
- **Total Items:** 200
- **Reviewed Count:** 0 (0.00%)
- **Pending Count:** 200
- **Approved Count:** 0
- **Review Status:** `Human review pending`
- **CEFR Distribution:** A1: 183, A2: 1, B2: 1, C1: 10, C2: 5
- **Tier 1 Reason Distribution:** `qa_flagged`: 182, `cefr_conflict`: 18, `ambiguous_sense`: 181
- **Command to Start Review:**
  ```powershell
  node scripts/content-pipeline/vocab/review-cli.mjs --interactive --batch TIER-1-001 --reviewer <your_id>
  ```

---

## 13. Production Safety Invariants & Zero-Promotion Gate

Production safety invariants remain strictly active:

```json
"production_safety": {
  "production_database_modified": false,
  "bulk_promotions_executed": false,
  "rls_policies_intact": true,
  "unreviewed_content_blocked_from_active": true
}
```

1. **Zero Database Modifications:** Supabase production database has 0 migrations run in this phase.
2. **Zero Bulk Promotions:** No candidate was bulk-promoted from `REVIEW_REQUIRED` to `APPROVED` or `ACTIVE`.
3. **Readiness Gate Locked:** `overall_status = "NOT_READY"` and `user_testing_authorized = false`.
4. **Learner-Ready Gap Maintained:** Active count is exactly 21; remaining gap is exactly 9,979 units.

---

## 14. Verification & Testing Matrix

### Automated Test Results (Vitest)

| Test Suite | Tests Run | Passed | Failed | Duration |
| :--- | :--- | :--- | :--- | :--- |
| `tests/vocabulary-tier1-qa.test.ts` | 24 | 24 | 0 | 2.41s |
| `tests/vocabulary-human-qa.test.ts` | 25 | 25 | 0 | 1.40s |
| `tests/vocabulary-large-pipeline.test.ts`| 19 | 19 | 0 | 1.15s |
| `tests/vocabulary-ingestion.test.ts` | 14 | 14 | 0 | 0.85s |
| `tests/schema-migration.test.ts` | 8 | 8 | 0 | 0.62s |
| **Total Test Suite** | **20 files** | **298 tests** | **0** | **~24s** |

### Cloudflare Worker Production Build
- OpenNext Cloudflare Adapter build: `40/40` static assets compiled.
- Bundle output: `.open-next/worker.js` (Zero SSR regressions).
