# Phase 6.2.12.1 — Tier 1 Risk Audit & Review Integrity Report

**Platform:** Glova (CEFR / Cambridge English Assessment Platform)  
**Audit Phase:** Phase 6.2.12.1 — Tier 1 Risk Audit & Review Integrity  
**Audit Date:** 2026-09-26  
**Audit Status:** `INTEGRITY_VERIFIED`  
**Overall Readiness Gate:** `NOT_READY` (Strict Production Gate Enforced)  
**User Testing Authorized:** `false`  
**Learner-Ready Active Vocabulary Count:** `21 / 10,000` (Remaining Gap: `9,979`)  
**Production Supabase Modifications:** `0` (Zero migrations, zero direct DB writes)

---

## 1. Original Tier 1 Definition

In Phase 6.2.12, the Tier 1 Critical-Risk review queue was defined to isolate every vocabulary learning unit that cannot be promoted or activated without direct lexicographical intervention.

A staged vocabulary learning unit is assigned to **Tier 1 Critical Risk** if it satisfies any of the following six risk conditions:
1. **CEFR Conflict (`cefr_conflict`):** Cross-source discrepancy in CEFR level ratings (e.g., CEFR-J vs Oxford 3000 / Cambridge).
2. **No-Match Sense (`no_match_sense`):** Candidate lemma/POS not mapped to any synset in the Open English WordNet (OEWN 2024) database.
3. **Ambiguous Sense (`ambiguous_sense`):** Candidate lemma/POS has multiple competing OEWN synsets without automated single-sense convergence.
4. **Unresolved IPA (`unresolved_ipa`):** Missing phonetic IPA transcription string (316 units) or pronunciation marked `UNRESOLVED` / `REVIEW_REQUIRED` (301 units).
5. **Heteronym / Composite (`heteronym`):** Words requiring distinct pronunciations depending on syntactic or semantic context.
6. **Blocking QA Flags (`qa_flagged`):** Failure in any of the 8 automated content-quality audit dimensions evaluated by `evaluateEightDimensionAudit`.

---

## 2. Original 7,119 Count

Across the entire 10,000 staged candidate inventory (partitioned across batches `LARGE-001` through `LARGE-050`), evaluating the Tier 1 predicate yielded:
- **Total Staged Examined:** 10,000 learning units
- **Tier 1 Critical-Risk Units:** **7,119 units (71.19%)**
- **Non-Tier 1 Staged Units:** **2,881 units (28.81%)**
- **Duplicate Keys:** **0** (Every unit has a unique `learning_unit_key`)

---

## 3. Actual QA Flag Distribution Across the 10,000 Staged Units

An exhaustive audit of all 10,000 units across all 50 `LARGE` batches was executed to determine the exact frequency of every automated audit flag:

| Audit Flag | Triggered Count | Affected Percentage | Dimension |
| :--- | :--- | :--- | :--- |
| `SENSE_UNADJUDICATED` | **6,792** | 67.92% | Dimension 8: Sense Disambiguation & Synset |
| `IPA_UNRESOLVED_OR_INVALID` | **316** | 3.16% | Dimension 5: IPA Pronunciation Integrity |
| `EXAMPLE_INVALID_OR_MISSING_TARGET` | **6** | 0.06% | Dimension 6: Learner Example Sentence |
| `IDENTITY_NORMALIZATION_FAIL` | **0** | 0.00% | Dimension 1: Headword / POS / Key Integrity |
| `CEFR_LEVEL_INVALID` | **0** | 0.00% | Dimension 2: CEFR Level Range (A1–C2) |
| `MEANING_EN_INVALID_OR_MISSING` | **0** | 0.00% | Dimension 3: English Meaning & Non-Circularity |
| `MEANING_TH_INVALID_OR_CORRUPTED` | **0** | 0.00% | Dimension 4: Thai Translation & Dual-Language Script |
| `PROVENANCE_INCOMPLETE` | **0** | 0.00% | Dimension 7: Provenance Source, Version, License |
| **Total Units with ≥ 1 QA Flag** | **6,966** | **69.66%** | Total Unique Flagged Units |

### Analysis of the 6 `EXAMPLE_INVALID_OR_MISSING_TARGET` Units
Every one of the 6 units flagged for example target mismatch is caused by legitimate British vs. American orthographic variation, hyphenation, or acronym expansion:
1. `ok|adjective|A1|sense:1`: Example uses `"okay"` instead of headword `"OK"`.
2. `gray|adjective|A1|sense:1`: Example uses British spelling `"grey"` (*"the little grey cells"*).
3. `dialog|noun|B1|sense:1`: Example uses classical British spelling `"Dialogues"` (*"Plato's Dialogues"*).
4. `offense|noun|B2|sense:1`: Example uses British spelling `"offence"` (*"he took offence"*).
5. `wornout|adjective|B2|sense:1`: Example uses hyphenated form `"worn-out"` (*"worn-out horses"*).
6. `acknowledgment|noun|B1|sense:1`: Example uses British spelling `"acknowledgement"`.

---

## 4. Severity Classification

Every flag and risk factor is categorized into one of three strict severity tiers based on Glova's Phase 6.2.11 pedagogical and lifecycle rules:

```
+---------------------------------------------------------------------------------------+
| Category         | Flags / Risk Factors                           | Approval Policy  |
+---------------------------------------------------------------------------------------+
| HARD BLOCKER     | SENSE_UNADJUDICATED (6,792)                   | Strictly blocks  |
|                  | IPA_UNRESOLVED_OR_INVALID (316)                | APPROVE without  |
|                  | CEFR Conflict (226)                            | terminal human   |
|                  | No-Match Sense (565)                           | disposition or   |
|                  | Ambiguous Sense (6,058)                        | valid edits.     |
|                  | EXAMPLE_INVALID_OR_MISSING_TARGET (6)          |                  |
+---------------------------------------------------------------------------------------+
| REVIEW REQUIRED  | AI_DRAFT Thai definition (10,000)              | Requires human   |
| (Non-Blocking)   | AI_DRAFT Example sentence (8,695)              | naturalness check|
|                  | Multiple pronunciation variants (806)          | but does not     |
|                  | Polysemous core headwords (Tier 2)             | block alone.     |
+---------------------------------------------------------------------------------------+
| INFORMATIONAL    | Permissive TuFS / CEFR-J License attribution  | Non-blocking;    |
|                  | Source transformation pipeline metadata        | audit trail only.|
|                  | Lexicographer review rationale logging         |                  |
+---------------------------------------------------------------------------------------+
```

### Justification for Severity Classifications
- **`SENSE_UNADJUDICATED` (BLOCKING):** Presenting ambiguous or wrong-sense definitions to learners causes direct pedagogical harm. A learner studying A1 *get* must not see a C2 nautical definition. Requires human sense disposition (`SELECT_SUPPORTED_SENSE`, `SPLIT_LEARNING_UNIT`, `EDIT_MEANING`, or `CHANGE_CEFR_WITH_EVIDENCE`).
- **`IPA_UNRESOLVED_OR_INVALID` (BLOCKING):** Missing pronunciation prevents listening and speaking readiness. Requires `VERIFIED_PRONUNCIATION`, `MULTIPLE_VALID_VARIANTS`, or `NOT_APPLICABLE_NO_PHONETIC_FORM`.
- **`CEFR Conflict` (BLOCKING):** Conflicting difficulty bands between CEFR-J and Oxford/Cambridge must be reconciled before adaptive assessment calibration.
- **`EXAMPLE_INVALID_OR_MISSING_TARGET` (BLOCKING until edited/verified):** An example sentence that omits the target headword or uses an unlinked variant must be human-edited or confirmed to prevent learner confusion.

---

## 5. Recomputed Tier 1 Count & Deduplication Census

Recomputing the Tier 1 extraction confirms that **7,119 is the exact, uncompromised number of genuine blocking risk units**:

- **Total Staged Units Examined:** 10,000
- **Recomputed Unique Tier 1 Units:** **7,119 (71.19%)**
- **Non-Tier 1 Units:** **2,881 (28.81%)**
- **Clean Audit Pass Rate on Non-Tier 1 Units:** **100.00%** (2,881 / 2,881 pass all 8 QA dimensions with zero flags)
- **Duplicate Keys Found:** **0**

### Part of Speech Distribution across Tier 1 (7,119 Units)

| Part of Speech | Count | Percentage | Primary Challenges |
| :--- | :--- | :--- | :--- |
| **Noun** | 3,328 | 46.75% | Abstract polysemy, countability nuances |
| **Verb** | 1,582 | 22.22% | Transitivity, phrasal extensions, core polysemy |
| **Adjective** | 1,456 | 20.45% | Gradable vs. absolute senses, domain specificity |
| **Adverb** | 452 | 6.35% | Degree vs. manner modifiers, multi-word adverbs |
| **Pronoun** | 83 | 1.17% | Deictic vs. referential senses |
| **Preposition** | 81 | 1.14% | Spatial vs. temporal vs. figurative senses |
| **Determiner** | 46 | 0.65% | Quantifier ambiguity |
| **Conjunction** | 38 | 0.53% | Coordinating vs. subordinating usage |
| **Number** | 30 | 0.42% | Cardinal vs. ordinal distinctions |
| **Modal Auxiliary**| 13 | 0.18% | Epistemic vs. deontic modal senses |
| **Interjection** | 9 | 0.13% | Pragmatic intent and punctuation |
| **Infinitive 'To'**| 1 | 0.01% | Grammatical particle function |

---

## 6. Overlap Analysis

Every unit is mapped into exactly one distinct overlap combination to guarantee zero double counting:

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
| unresolved_ipa (alone - pronunciation status REVIEW_REQUIRED)|   135 |
| ambiguous_sense + cefr_conflict + qa_flagged                |    35 |
| cefr_conflict (alone - cross-source level discrepancy only)  |    18 |
| cefr_conflict + qa_flagged + unresolved_ipa                 |     3 |
| ambiguous_sense + cefr_conflict + qa_flagged + unres_ipa    |     2 |
| cefr_conflict + no_match_sense + qa_flagged                 |     2 |
| qa_flagged (alone - example target spelling mismatch)       |     1 |
+-------------------------------------------------------------+-------+
| Total Unique Tier 1 Units                                   | 7,119 |
+-------------------------------------------------------------+-------+
```

---

## 7. Ledger Integrity Findings

An exhaustive audit of [`reports/vocabulary-human-review-ledger.json`](file:///C:/CEFR_platform/reports/vocabulary-human-review-ledger.json) was conducted:

1. **Total Recorded Events:** 8 events.
2. **Reviewer ID in all 8 Events:** `"qa_reviewer_test"`.
3. **Target Unit in all 8 Events:** `"abandon|verb|B2|sense:1"` (mock fixture).
4. **Decision Recorded:** `"APPROVE"` (with rationale `"Automated test of audit ledger logging."`).
5. **Origin of Events:** Vitest automated test executions of `tests/vocabulary-human-qa.test.ts`.
6. **Isolation Status:**
   - All 8 events have been explicitly tagged with `event_type: "TEST_DEVELOPMENT"`, `is_production_review: false`, and `counted_in_readiness: false`.
   - The ledger version has been updated to `1.1` with `audit_status: "INTEGRITY_AUDITED"`.
   - `recordReviewEventToLedger` now automatically detects test environments and marks events accordingly.
7. **Readiness Impact:** **0**. Readiness metrics calculate directly from batch JSON files, where `approved_count = 0`.
8. **Batch Impact:** **0**. The unit `abandon|verb|B2|sense:1` does not exist in `LARGE-001.json` or any other batch; no batch record was ever modified.
9. **Production DB Impact:** **0**. Supabase has 0 active vocabulary changes.

---

## 8. Development & Test Reviewer Investigation

| Identifier Tested | Test Context | PERSISTED TO BATCH? | PERSISTED TO LEDGER? | READINESS AFFECTED? |
| :--- | :--- | :--- | :--- | :--- |
| `system` | CLI rejection test (`--reviewer system`) | **NO** (CLI exited with code 1) | **NO** (Blocked by gate) | **NO** (0.00% impact) |
| `ai_agent` | CLI rejection test (`--reviewer ai_agent`)| **NO** (CLI exited with code 1) | **NO** (Blocked by gate) | **NO** (0.00% impact) |
| `lexicographer_anna` | CLI rejection test on flagged `ok` unit | **NO** (CLI exited with code 1) | **NO** (Blocked by QA gate) | **NO** (0.00% impact) |
| `qa_reviewer_test` | Vitest persistence assertion | **NO** (Mock fixture only) | **YES** (8 test records) | **NO** (Explicitly isolated) |

**Conclusion:** Zero test or development commands succeeded in promoting any vocabulary item. No fake human approvals exist in any batch file or production table.

---

## 9. Reviewer Identity Limitations & Terminology Standard

### Technical Distinction
- **Current Gate Mechanism:** Client/CLI-level pattern matching and format validation.
  - Rejects empty, whitespace-only, or strings under 3 characters.
  - Rejects strings matching known bot/automation patterns (`system`, `ai`, `bot`, `auto-review`, `script`, `synthetic`, `llm`, etc.).
- **What this Gate DOES NOT Do:** It does **NOT** cryptographically authenticate human identity via OAuth2/OIDC, SSO, WebAuthn, or biometric proof. A user entering `"lexicographer_anna"` is format-valid, but unverified.

### Terminology Standard
To prevent misleading claims in documentation, audits, and UI:
- **Prohibited:** `"Verified Human Reviewer"`, `"Authenticated Human Reviewer"`, `"Cryptographically Verified"`
- **Mandatory Standard:** `"Reviewer Identity Supplied by User (Format & Anti-Bot Validated)"`

---

## 10. Production Safety Invariants

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

## 11. Final Recommendation for Beginning Real Human Review

With queue integrity, flag severities, ledger isolation, and identity boundaries fully audited and verified, the review workflow is ready for human lexicographers.

### Operational Review Steps for Human Reviewer:
1. **Launch Review Session for Batch 1:**
   ```powershell
   node scripts/content-pipeline/vocab/review-cli.mjs --interactive --batch TIER-1-001 --reviewer <your_reviewer_id>
   ```
2. **Inspect 14 Dimensions:** Examine English definition, Thai translation, phonetic IPA, example sentence, and candidate synsets.
3. **Resolve Blocking Flags:**
   - If IPA is missing: supply verified IPA via `[E]` (edit) and select IPA disposition `VERIFIED_PRONUNCIATION`.
   - If sense is ambiguous: select the appropriate candidate synset disposition via `[A]` (approve) or split via `[S]`.
   - If example omits target: edit example sentence via `[E]` to include the target headword.
4. **Submit Decision:** Enter review rationale (minimum 10 characters). The CLI records the action to the ledger, updates the batch file, re-computes batch SHA-256, and cross-syncs to the source `LARGE-001` batch.
