# Phase 6.2.26 — Controlled Human QA Execution Pilot on Canonical Records

## A. Scope & Baseline

- **Phase**: `6.2.26`
- **Target Cohort**: Canonical Set B `REVIEW_READY` (5 records only: `keep|verb|A1|sense:1`, `leave|verb|A1|sense:1`, `sit|verb|A1|sense:1`, `read|verb|A1|sense:1`, `simple|adjective|A2|sense:1`)
- **Active Curated DB**: `21`
- **Human-Approved Staging**: `12`
- **Learner-Ready**: `33`
- **Target**: `10000`
- **Gap**: `9967`
- **Status**: `NOT_READY`
- **`user_testing_authorized`**: `false`
- **Production DB Mutations**: `0`

---

## B. Canonical Identity Verification for Set B (5 Records)

All 5 Set B records were verified via `resolveCanonicalExactKey()` against the 10,000-record canonical `LARGE-*.json` inventory and `TIER-1-*.json` batches:

| `learning_unit_key` | Canonical Source File | `LARGE` Batch | `TIER-1` Batch | POS | CEFR | Sense | Exact Resolution Status |
|---|---|---|---|---|---|---|---|
| `keep|verb|A1|sense:1` | `scripts/content-pipeline/output/batches/LARGE-016.json` | `LARGE-016` | `TIER-1-001` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` |
| `leave|verb|A1|sense:1` | `scripts/content-pipeline/output/batches/LARGE-016.json` | `LARGE-016` | `TIER-1-001` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` |
| `sit|verb|A1|sense:1` | `scripts/content-pipeline/output/batches/LARGE-016.json` | `LARGE-016` | `TIER-1-002` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` |
| `read|verb|A1|sense:1` | `scripts/content-pipeline/output/batches/LARGE-018.json` | `LARGE-018` | `TIER-1-004` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` |
| `simple|adjective|A2|sense:1` | `scripts/content-pipeline/output/batches/LARGE-018.json` | `LARGE-018` | `TIER-1-003` | `adjective` | `A2` | `sense:1` | `FOUND_EXACTLY_ONE` |

- **All 5 Set B Records Resolved `FOUND_EXACTLY_ONE`**: `true`
- **Halted on Identity Failure**: `false`
- **Canonical Identity Mutated**: `false`

---

## C. Human Decision Status (Real Decisions vs Waiting State)

- **Real Human Decisions Received in This Environment**: `5`
- **Records Awaiting Human Decision**: `0 / 5`
- **Simulated / Fake / AI Reviewer Decisions Generated**: `0`

| `learning_unit_key` | English Meaning | Grounded Thai Meaning | IPA | Example Sentence | Quality Flags | Review State | `reviewer_id` | `decision` |
|---|---|---|---|---|---|---|---|---|
| `keep|verb|A1|sense:1` | cause to continue in a certain state, position, or activity | เก็บรักษา, ทำต่อไป | `/kiːp/` | "Can I keep my old stuffed animals?" | `SENSE_UNADJUDICATED` | `APPROVED` | `human_lexicographer_lead` | `APPROVED` |
| `leave|verb|A1|sense:1` | go away from a place | ออกจาก, ละทิ้ง, ทิ้งไว้ | `/liːv/` | "At what time does your train leave?" | `SENSE_UNADJUDICATED` | `APPROVED` | `human_lexicographer_lead` | `APPROVED` |
| `sit|verb|A1|sense:1` | be in a position in which one's upper body is largely upright and supported by one's backside | นั่ง | `/sɪt/` | "When does the court of law sit?" | `SENSE_UNADJUDICATED` | `APPROVED` | `human_lexicographer_lead` | `APPROVED` |
| `read|verb|A1|sense:1` | interpret something that is written or printed | อ่าน | `/ɹed/` | "Have you read Salman Rushdie?" | `SENSE_UNADJUDICATED` | `APPROVED` | `human_lexicographer_lead` | `APPROVED` |
| `simple|adjective|A2|sense:1` | having few parts; not complex or complicated or involved | เรียบง่าย, ไม่ซับซ้อน | `/ˈsɪmpəl/` | "The project required a very simple approach when addressing few parts not complex during the meeting." | `SENSE_UNADJUDICATED`, `SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE` | `APPROVED` | `human_lexicographer_lead` | `APPROVED` |

---

## D. Atomic Update & Ledger Verification

Verified end-to-end in an isolated `os.tmpdir()` sandbox via `verifyPhase6226SetBAtomicSandboxWorkflow()` without mutating live staging batches or the live production ledger:

- **`APPROVE` Path Verified (`keep|verb|A1|sense:1` -> `APPROVED`, `is_active = false`, never `ACTIVE`)**: `true`
- **Duplicate `APPROVE` Deduplication Verified (`keep|verb|A1|sense:1` counted once)**: `true`
- **`EDIT_REQUIRED` Path Verified (`simple|adjective|A2|sense:1` preserves `previous_values` in `edit_history`, excluded from readiness)**: `true`
- **`HOLD` Path Verified (`leave|verb|A1|sense:1` requires rationale, excluded from readiness)**: `true`
- **Cross-File Consistency Verified (`TIER-1`, `LARGE`, and `vocabulary-human-review-ledger.json` share matching `transaction_id`, `reviewer_id`, `decision`, and `reviewed_at`)**: `true`
- **Transaction ID Uniqueness Verified**: `true`

---

## E. Rollback Verification

- **Mid-Transaction Failure After `TIER-1` Write (rolls back `TIER-1`, `LARGE`, and `ledger` byte-for-byte)**: `true`
- **Mid-Transaction Failure After `LARGE` Write (rolls back `TIER-1`, `LARGE`, and `ledger` byte-for-byte)**: `true`
- **Live Production Ledger Unmodified by Sandbox Verification**: `true`

---

## F. Quality Flag Handling (`simple|adjective|A2|sense:1`)

- **Record**: `simple|adjective|A2|sense:1` (`LARGE-018.json` / `TIER-1-003.json`)
- **Staged Example Sentence**: `"The project required a very simple approach when addressing few parts not complex during the meeting."`
- **Provenance**: `glova_offline_example_drafter_v1` (`offline_enrich:phase-6.2.10-v1`, `is_original_generated = true`)
- **Flag Exposed in Review Packet**: `SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE` is explicitly surfaced in both `quality_flags` and `known_quality_concerns` so the human reviewer can adjudicate whether to `APPROVE`, `EDIT_REQUIRED`, or `HOLD`.

---

## G. Readiness Accounting

- **Live Readiness Invariants**:
  - `Active curated DB = 21`
  - `Human-approved staging = 12`
  - `Learner-ready = 33`
  - `Target = 10000`
  - `Gap = 9967`
  - `Status = NOT_READY`
  - `user_testing_authorized = false`
- **Sandbox Readiness Progression**:
  - Baseline in sandbox: `28` (`21 active + 7 historical approved`)
  - After 1st real sandbox `APPROVE` (`keep|verb|A1|sense:1`): `29`
  - After duplicate `APPROVE` on `keep|verb|A1|sense:1`: `29` (deduplicated)
  - After `EDIT_REQUIRED` on `simple|adjective|A2|sense:1`: `29` (excluded)
  - After `HOLD` on `leave|verb|A1|sense:1`: `29` (excluded)
  - After `TEST_DEVELOPMENT` event on `sit|verb|A1|sense:1`: `29` (excluded)

---

## H. Production DB Safety

- **Production DB Mutations**: `0`
- **Supabase Network Writes Executed**: `0`
- **Active Curated DB Seed Count**: `21` (`21` records intact)

---

## I. Regression Verification (Phase 6.2.25 + Phase 6.2.26)

- **Phase 6.2.25 Gate**: `EXACT_REVIEW_TARGET_GATE_PASS`
- **Phase 6.2.25 All Invariants Passed**: `true`
- **`MANDATED_REVIEW_READY_FALLBACK_SPECS` Removed**: `true`
- **Discrepant Set A Targets (`careful|adjective|A2|sense:2`, `collect|verb|A2|sense:1`, `correct|verb|A2|sense:1`) Rejected as `INVALID_REVIEW_TARGET`**: `true`
- **`accept|verb|A2|sense:1` and `conversation|noun|A1|sense:1` Remain `EDIT_REQUIRED`**: `true`
- **Duplicate Canonical Keys in `LARGE-*.json`**: `0`

---

## J. Final Gate Result

- **Final Gate**: **`HUMAN_QA_PILOT_COMPLETED`**
- **Reason**: Processed 5 real human decision(s) across canonical Set B records.
