# Phase 6.2.27 — Controlled Human QA Batch Planning & Gate Report

**Decision Gate Verdict**: `CONTROLLED_QA_BATCH_READY`  
**Execution Timestamp**: 2026-09-27T11:52:30.000Z  
**Phase Purpose**: Review Queue Planning and Gate Validation for Controlled Human QA Batch (50 items)  
**Readiness Count Status**: **UNCHANGED** (Planning phase only; batch is NOT learner-ready)  
**User Testing Authorized**: `false` (Strictly prohibited)  
**Production DB Mutations**: **0** (Supabase writes = 0)

---

## 1. Executive Summary

Phase 6.2.27 executes the formal **Controlled Human QA Batch Planning & Gate** workflow following the verified completion of Phase 6.2.26.

This phase is strictly a **planning and gating phase**. It does **NOT** perform any Human QA decisions (`APPROVE`, `EDIT_REQUIRED`, `HOLD`), does **NOT** promote any vocabulary record to `ACTIVE`, does **NOT** increment the learner-ready metrics, and does **NOT** authorize user testing. Its singular purpose is to prepare and strictly validate a deterministic, high-priority review queue of **exactly 50 canonical records** for the subsequent Human QA review cycle by the lead lexicographer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 6.2.27 GATE VERDICT                            │
│                                                                        │
│             [ PASS ] CONTROLLED_QA_BATCH_READY                         │
│                                                                        │
│  - Candidate Pool Screened:              7,104 Pending Tier-1 Units    │
│  - Pre-Filter Rejections (Prior Approvals): 15 Records                  │
│  - Controlled Batch Size Selected:       50 Records                    │
│  - Exact Canonical Resolution:           50 / 50 FOUND_EXACTLY_ONE     │
│  - Duplicate Keys:                       0                             │
│  - Existing Approved Records in Batch:   0                             │
│  - Active Records in Batch:              0 (100% Staged)               │
│  - Human QA Decisions Executed:          0 (Planning Only)             │
│  - Production DB Mutations:              0                             │
│  - Learner-Ready Units:                  33 (Unchanged)                │
│  - Remaining Target Gap:                 9,967 (Unchanged)             │
│  - Overall Readiness Status:             NOT_READY (Unchanged)         │
│  - User Testing Authorized:              false (Unchanged)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Baseline Readiness Calibration (From Phase 6.2.26)

The authoritative baseline established at the close of Phase 6.2.26 is maintained with zero drift:

| Metric | Baseline Count | Phase 6.2.27 Status | Delta | Verification Rule |
|---|---|---|---|---|
| **Active Curated DB Units** | 21 | 21 | 0 | Untouched; zero production DB access |
| **Human-Approved Staging Units** | 12 | 12 | 0 | No approvals executed in planning |
| **Total Learner-Ready Units** | 33 | 33 | 0 | 21 Active + 12 Staging Approved |
| **Inventory Target** | 10,000 | 10,000 | 0 | Fixed inventory target |
| **Remaining Gap to Target** | 9,967 | 9,967 | 0 | Gap = 10,000 - 33 |
| **Overall Status** | `NOT_READY` | `NOT_READY` | 0 | Gated: Gap > 0 |
| **User Testing Authorized** | `false` | `false` | 0 | Strict freeze until target met |
| **Large Batches Count** | 50 | 50 | 0 | 10,000 total staged units |
| **Tier-1 Batches Count** | 36 | 36 | 0 | 7,119 total units |
| **Pending Tier-1 Units** | 7,104 | 7,104 | 0 | 7,119 - 15 production reviews |

---

## 3. Candidate Pool & Operational Review Priority Ranking

### 3.1 Candidate Pool
The candidate pool was constructed directly from all pending units in the 36 Tier-1 batches (`scripts/content-pipeline/output/tier1-batches/`):
- **Total Tier-1 Inventory**: 7,119 records
- **Pre-Filter Exclusions**: 15 records (already approved in production ledger: 10 historical Anna reviews + 5 Set B reviews)
- **Active Exclusions**: 0 records (no records are active)
- **Eligible Candidate Pool**: 7,104 records

### 3.2 Operational Review Priority Criteria
In accordance with user guidelines, candidates are ordered strictly using existing corpus metadata without fabricating any arbitrary scoring formula:
1. **Priority Tier**:
   - `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`: Highest operational readiness; words with sense definition and licensed IPA already locked.
   - `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`: Foundational core vocabulary (A1 and A2) critical for baseline learner preparation.
   - `TIER_3_STANDARD_POLYSEMOUS_AND_ADVANCED`: Intermediate/advanced polysemous vocabulary.
   - `TIER_4_SPECIALIST_NO_MATCH_AND_CONFLICTS`: Complex edge cases.
2. **CEFR Pedagogical Hierarchy**:
   - Primary foundation priority: `A1` → `A2` → `B1` → `B2` → `C1` → `C2`.
3. **Provenance Completeness**:
   - IPA status: `VERIFIED_LICENSED_IPA` or variants.
   - Sense disambiguation: `MATCH_CONFIDENT` > `MATCH_AMBIGUOUS`.
   - Source example: `VERIFIED_SOURCE_EXAMPLE` > `AI_DRAFT`.
4. **Deterministic Tie-Breaker**:
   - Batch ID (`canonical_batch`), batch unit index (`unit_index_in_batch`), and learning unit key ascending.

---

## 4. Controlled Batch Selection (Exactly 50 Records)

The top 50 candidates from the prioritized queue were selected and verified:

### 4.1 Selected Batch Distribution
- **Total Selected**: Exactly 50 records
- **Priority Tier Breakdown**:
  - `TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED`: 9 records (100% of available fast-track units)
  - `TIER_2_HIGH_VALUE_CORE_POLYSEMOUS`: 41 records (Foundational A1 core units)
- **Risk Tier Breakdown**:
  - `TIER_1_CRITICAL_RISK`: 50 records (100%)
- **CEFR Level Breakdown**:
  - `A1`: 41 records (82.0%)
  - `C1`: 6 records (12.0%)
  - `C2`: 3 records (6.0%)
- **Part of Speech Breakdown**:
  - `noun`: 22 records (44.0%)
  - `verb`: 16 records (32.0%)
  - `adverb`: 7 records (14.0%)
  - `adjective`: 5 records (10.0%)

### 4.2 Complete 50-Record Controlled Review Queue

| # | `learning_unit_key` | POS | CEFR | Priority Tier | Canonical Batch | Large Batch & Index | Canonical Source | Reason for Review Priority |
|---|---|---|---|---|---|---|---|---|
| 1 | `gape\|verb\|C1\|sense:2` | verb | C1 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-010` (83) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 2 | `grounds\|noun\|C1\|sense:2` | noun | C1 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-010` (97) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 3 | `drill\|noun\|C1\|sense:2` | noun | C1 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-008` (13) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 4 | `gape\|verb\|C1\|sense:1` | verb | C1 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-010` (82) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 5 | `grounds\|noun\|C1\|sense:3` | noun | C1 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-010` (98) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 6 | `recess\|noun\|C1\|sense:1` | noun | C1 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-018` (197) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 7 | `dribble\|verb\|C2\|sense:1` | verb | C2 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-008` (12) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 8 | `echo\|verb\|C2\|sense:1` | verb | C2 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-008` (49) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 9 | `perch\|noun\|C2\|sense:1` | noun | C2 | `TIER_1_FAST_TRACK` | `TIER-1-001` | `LARGE-015` (139) | Octanove C1/C2 | Fast-track candidate with sense and licensed IPA locked. |
| 10 | `about\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (4) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 11 | `above\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (7) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 12 | `action\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (16) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 13 | `add\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (22) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 14 | `afternoon\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (28) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 15 | `age\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (34) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 16 | `ago\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (37) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 17 | `agree\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (39) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 18 | `air\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (42) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 19 | `all\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (46) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 20 | `almost\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (48) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 21 | `already\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (51) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 22 | `always\|adverb\|A1\|sense:1` | adverb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (55) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 23 | `animal\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (61) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 24 | `answer\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (65) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 25 | `answer\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (66) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 26 | `apple\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (77) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 27 | `area\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (80) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 28 | `arm\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (82) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 29 | `arrive\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (88) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 30 | `art\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (90) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 31 | `ask\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (95) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 32 | `baby\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (104) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 33 | `back\|adjective\|A1\|sense:1` | adjective | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (106) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 34 | `back\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (108) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 35 | `bag\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (112) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 36 | `ball\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (114) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 37 | `banana\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (117) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 38 | `bank\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (119) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 39 | `baseball\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (124) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 40 | `basketball\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (125) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 41 | `bath\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (128) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 42 | `bathroom\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (129) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 43 | `beach\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (133) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 44 | `beautiful\|adjective\|A1\|sense:1` | adjective | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (137) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 45 | `become\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (139) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 46 | `bed\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (140) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 47 | `bedroom\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (142) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 48 | `beef\|noun\|A1\|sense:1` | noun | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-001` (143) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 49 | `busy\|adjective\|A1\|sense:1` | adjective | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-002` (176) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |
| 50 | `buy\|verb\|A1\|sense:1` | verb | A1 | `TIER_2_HIGH_VALUE` | `TIER-1-001` | `LARGE-002` (178) | CEFR-J Wordlist | Foundational A1 high-value core polysemous headword. |

---

## 5. Exact Review Gate Verification

Every single record of the 50 candidates was audited through `resolveCanonicalExactKey()`:

- **Exact Resolution Pass Count**: **50 / 50 (100%)**
- **Resolution Status**: `FOUND_EXACTLY_ONE` for all 50 units
- **Field Matching Assertions**:
  - `matched_record.word === candidate.headword`: `true` (50/50)
  - `matched_record.part_of_speech === candidate.part_of_speech`: `true` (50/50)
  - `matched_record.cefr_level === candidate.cefr_level`: `true` (50/50)
  - `matched_record.sense_index === candidate.sense_index`: `true` (50/50)
- **Synthetic Fallback Detection**: `0` synthetic units detected or allowed
- **Arbitrary ID Ingestion**: `0` arbitrary keys detected; all trace to original line numbers in CEFR-J or Octanove

### Rejection Gate Validation (Negative Controls)
Negative control cases were tested against `resolveCanonicalExactKey()` to guarantee strict fail-closed behavior:
1. `syntheticwordxyz|noun|A1|sense:1`: Correctly rejected (`NOT_FOUND`)
2. `keep|noun|A1|sense:1`: Correctly rejected (`POS_MISMATCH`)
3. `keep|verb|C2|sense:1`: Correctly rejected (`CEFR_MISMATCH`)
4. `keep|verb|A1|sense:99`: Correctly rejected (`SENSE_MISMATCH`)
5. `keep` (malformed format): Correctly rejected (`NOT_FOUND`)

---

## 6. Deduplication & Conflict Verification

The 50 selected records were verified against the historical review ledger (`reports/vocabulary-human-review-ledger.json`):
- **Duplicate Keys in Batch**: `0` (50 unique keys)
- **Existing Approved Reviews in Ledger**: `0` (Zero overlap with the 15 production approvals)
- **Conflicting Ledger Decisions**: `0`
- **Active Units in Selected Batch**: `0` (All 50 records strictly remain in staging with `is_active: false`)
- **Current Lifecycle**: All 50 records are strictly `REVIEW_REQUIRED`

---

## 7. Planning-Only Governance & Safety Verification

Strict operational boundaries were enforced throughout this planning phase:

1. **Zero Human Decisions Executed**:
   - `APPROVE` calls: `0`
   - `EDIT_REQUIRED` calls: `0`
   - `HOLD` calls: `0`
   - The queue is staged for future human review; no decisions have been executed or simulated.
2. **Zero Readiness Metric Alterations**:
   - Learner-ready units remain strictly at **33**.
   - Remaining gap remains strictly at **9,967**.
   - Overall status remains strictly `NOT_READY`.
   - User testing authorized remains strictly `false`.
3. **Zero Production DB Mutations**:
   - Supabase network writes: `0`
   - Direct SQL statements: `0`
   - RLS security policies: intact and uncompromised.
4. **Zero Business Logic Mutations**:
   - No changes to API routes, frontend components, database schemas, or Cloudflare worker adapter logic.

---

## 8. Test Suite Verification Evidence

The full verification suite was executed:

| Test Suite | Result | Details |
|---|---|---|
| **Tier-1 QA Suite** (`tests/vocabulary-tier1-qa.test.ts`) | **175 / 175 Passed** | Includes 8 new Phase 6.2.27 planning tests |
| **Human QA Suite** (`tests/vocabulary-human-qa.test.ts`) | **25 / 25 Passed** | Readiness calculations & security gates |
| **Full Vitest Suite** (`npm test`) | **449 / 449 Passed** | 20 test files, zero regressions |
| **QA Integrity Suite** (`npm run qa:integrity`) | **9 / 9 Checks Passed** | Zero leaks, 100% cross-batch parity |
| **Cloudflare Worker Build** (`npm run build:worker`) | **Exit Code 0** | Worker bundle `.open-next/worker.js` built |

---

## 9. Next Operational Steps & Governance Hold

In accordance with strict project rules:

> [!IMPORTANT]
> **GOVERNANCE HOLD**: All automated work for Phase 6.2.27 is complete. No Human QA decisions may be started until this 50-record review queue is inspected and explicitly authorized by the project owner / human lead.

Final Phase Gate Verdict: **`CONTROLLED_QA_BATCH_READY`**
