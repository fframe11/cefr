# Phase 6.2.24 — Resolve Pilot Queue Identity & CEFR Provenance Discrepancies

## 1. Executive Summary & Decision Gate

- **Final Decision Gate**: `RECONCILIATION_PARTIALLY_RESOLVED`
- **Gate Rationale**: Set B (keep|verb|A1|sense:1, leave|verb|A1|sense:1, sit|verb|A1|sense:1, read|verb|A1|sense:1, simple|adjective|A2|sense:1), 2 of 5 Set A keys (accept|verb|A2|sense:1, conversation|noun|A1|sense:1), and all 10 representative EDIT_REQUIRED / SPECIAL_SYNTAX pilot records have 100% resolved exact-key and CEFR-J v1.5 provenance (CEFR_PROVENANCE_RESOLVED). However, 3 of the 5 Set A keys from the Phase 6.2.23 prompt (careful|adjective|A2|sense:2, collect|verb|A2|sense:1, correct|verb|A2|sense:1) do not exist in staged LARGE-*.json or TIER-1-*.json batches and diverge from CEFR-J v1.5 source CEFR/sense assignments (careful=A1|sense:1, collect=A1|sense:1, correct|verb=B2|sense:1). Those 3 records are marked UNRESOLVED (CEFR_PROVENANCE_REVIEW_REQUIRED) and routed to HOLD pending human linguistic adjudication, resulting in RECONCILIATION_PARTIALLY_RESOLVED.
- **Active Curated DB Units**: `21`
- **Historical Human-Approved Staging Units**: `7`
- **Learner-Ready Units**: `28`
- **Target**: `10000`
- **Remaining Gap**: `9972`
- **Overall Status**: `NOT_READY`
- **`user_testing_authorized`**: `false`
- **New Human Approvals in Phase 6.2.24**: `0`
- **Production DB Mutations**: `0`

---

## 2. Investigation of the Conflicting 5-Record Sets (Set A vs. Set B)

### 2.1 Set Definitions
- **Set A (Phase 6.2.23 Prompt / `EXACT_REVIEW_READY_KEYS`)**:
  1. `accept|verb|A2|sense:1`
  2. `careful|adjective|A2|sense:2`
  3. `collect|verb|A2|sense:1`
  4. `conversation|noun|A1|sense:1`
  5. `correct|verb|A2|sense:1`
- **Set B (Phase 6.2.22 Authoritative `REVIEW_READY` Subset)**:
  1. `keep|verb|A1|sense:1`
  2. `leave|verb|A1|sense:1`
  3. `sit|verb|A1|sense:1`
  4. `read|verb|A1|sense:1`
  5. `simple|adjective|A2|sense:1`

### 2.2 Cross-Artifact Trace Matrix

| Exact `learning_unit_key` | Set | `LARGE-*.json` Batch | `TIER-1-*.json` Batch | Grounded Lexicon Store | `6.2.21` Queue Bucket | `6.2.22` Reconciled Status | In `6.2.22` Packet? | In `6.2.23` Pilot? | `6.2.24` CEFR Provenance | `6.2.24` Reconciled Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `accept|verb|A2|sense:1` | Set A | `LARGE-018.json` | `TIER-1-005.json` | `GLOVA_CURATED_HEADWORD_REGISTRY` | `candidate_ready` | `EDIT_REQUIRED` | Yes (`needs_inline_example_edit`) | Yes (`review_ready`) | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` |
| `careful|adjective|A2|sense:2` | Set A | **NOT PRESENT** (`careful|adjective|A1|sense:1` in `LARGE-020.json`) | **NOT PRESENT** (`TIER-1-006.json` has `A1|sense:1`) | **NOT PRESENT** | **NOT PRESENT** | **NOT PRESENT** | No | Yes (fallback spec) | `CEFR_PROVENANCE_REVIEW_REQUIRED` | `CEFR_PROVENANCE_REVIEW_REQUIRED` (`HOLD`) |
| `collect|verb|A2|sense:1` | Set A | **NOT PRESENT** (`collect|verb|A1|sense:1` in `LARGE-020.json`) | **NOT PRESENT** (`TIER-1-006.json` has `A1|sense:1`) | **NOT PRESENT** | **NOT PRESENT** (`collect|verb|A1|sense:1` in `unresolved`) | **NOT PRESENT** | No | Yes (fallback spec) | `CEFR_PROVENANCE_REVIEW_REQUIRED` | `CEFR_PROVENANCE_REVIEW_REQUIRED` (`HOLD`) |
| `conversation|noun|A1|sense:1` | Set A | `LARGE-001.json` | `TIER-1-034.json` | `GROUNDED_THAI_LEXICON_REGISTRY` | `candidate_ready` | `EDIT_REQUIRED` | Yes (`needs_inline_example_edit`) | Yes (`review_ready`) | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` |
| `correct|verb|A2|sense:1` | Set A | **NOT PRESENT** (`correct|adjective|A1|sense:1` in `LARGE-020.json`; `correct|verb|B2|sense:1` in `LARGE-027.json`) | **NOT PRESENT** (`TIER-1-006.json` / `TIER-1-012.json`) | **NOT PRESENT** | **NOT PRESENT** | **NOT PRESENT** | No | Yes (fallback spec) | `CEFR_PROVENANCE_REVIEW_REQUIRED` | `CEFR_PROVENANCE_REVIEW_REQUIRED` (`HOLD`) |
| `keep|verb|A1|sense:1` | Set B | `LARGE-016.json` | `TIER-1-001.json` | `GLOVA_CURATED_HEADWORD_REGISTRY` | `candidate_ready` | `REVIEW_READY` | Yes (`clean_review_ready`) | Listed in `selection_rules` only | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` |
| `leave|verb|A1|sense:1` | Set B | `LARGE-016.json` | `TIER-1-001.json` | `GLOVA_CURATED_HEADWORD_REGISTRY` | `candidate_ready` | `REVIEW_READY` | Yes (`clean_review_ready`) | Listed in `selection_rules` only | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` |
| `sit|verb|A1|sense:1` | Set B | `LARGE-016.json` | `TIER-1-002.json` | `GLOVA_CURATED_HEADWORD_REGISTRY` | `candidate_ready` | `REVIEW_READY` | Yes (`clean_review_ready`) | Listed in `selection_rules` only | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` |
| `read|verb|A1|sense:1` | Set B | `LARGE-018.json` | `TIER-1-004.json` | `GLOVA_CURATED_HEADWORD_REGISTRY` | `candidate_ready` | `REVIEW_READY` | Yes (`clean_review_ready`) | Listed in `selection_rules` only | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` |
| `simple|adjective|A2|sense:1` | Set B | `LARGE-018.json` | `TIER-1-003.json` | `GLOVA_CURATED_HEADWORD_REGISTRY` | `candidate_ready` | `REVIEW_READY` | Yes (`clean_review_ready`) | Listed in `selection_rules` only | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` |

### 2.3 Direct Forensic Answers
1. **Where did Set A come from?**
   Set A (accept|verb|A2|sense:1, careful|adjective|A2|sense:2, collect|verb|A2|sense:1, conversation|noun|A1|sense:1, correct|verb|A2|sense:1) originated from the external Phase 6.2.23 prompt specification and was hardcoded in scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs as EXACT_REVIEW_READY_KEYS + MANDATED_REVIEW_READY_FALLBACK_SPECS. Only 2 of the 5 keys (accept|verb|A2|sense:1 and conversation|noun|A1|sense:1) existed in reports/phase-6.2.21-human-review-queue.json and reports/phase-6.2.22-human-review-packet.json (where both were classified as EDIT_REQUIRED, not REVIEW_READY). The other 3 keys (careful|adjective|A2|sense:2, collect|verb|A2|sense:1, correct|verb|A2|sense:1) do not exist in any LARGE-*.json or TIER-1-*.json batch and were synthesized via MANDATED_REVIEW_READY_FALLBACK_SPECS.
2. **Where did Set B come from?**
   Set B (keep|verb|A1|sense:1, leave|verb|A1|sense:1, sit|verb|A1|sense:1, read|verb|A1|sense:1, simple|adjective|A2|sense:1) came deterministically from scripts/content-pipeline/vocab/human-qa-execution.mjs (evaluateTenDimensions + reconcileCandidateReadyQueue) as the exact 5 records out of the 108 candidate_ready units in reports/phase-6.2.21-human-review-queue.json that passed all 10 automated quality dimensions.
3. **Which set is actually in `reports/phase-6.2.22-human-review-packet.json`?**
   Set B is the exact 5-record REVIEW_READY set in reports/phase-6.2.22-human-review-packet.json (under sections.clean_review_ready, count = 5) and reports/phase-6.2.22-candidate-ready-reconciliation.json (reconciled_status = "REVIEW_READY"). From Set A, only accept|verb|A2|sense:1 and conversation|noun|A1|sense:1 appear in reports/phase-6.2.22-human-review-packet.json, and both appear under sections.needs_inline_example_edit (EDIT_REQUIRED), while careful|adjective|A2|sense:2, collect|verb|A2|sense:1, and correct|verb|A2|sense:1 are completely absent from reports/phase-6.2.22-human-review-packet.json.
4. **Which set is actually in `reports/phase-6.2.23-human-review-pilot.json`?**
   Set A is in reports/phase-6.2.23-human-review-pilot.json under pilot_queue.groups.review_ready, while Set B was only referenced in pilot_queue.selection_rules.packet_6_2_22_strict_review_ready_keys and excluded from pilot_queue.records.
5. **Why did the two lists differ?**
   Phase 6.2.22 applied a deterministic 10-dimension evaluator (evaluateTenDimensions in scripts/content-pipeline/vocab/human-qa-execution.mjs) to the 108 grounded candidate_ready units from Phase 6.2.21, yielding Set B as the only 5 REVIEW_READY units. When Phase 6.2.23 requested a pilot using the 5 keys in Set A, controlled-human-review-pilot.mjs overrode Set B with Set A: it pulled accept|verb|A2|sense:1 and conversation|noun|A1|sense:1 from the EDIT_REQUIRED section of the 6.2.22 packet and synthesized fallback records (MANDATED_REVIEW_READY_FALLBACK_SPECS) for careful|adjective|A2|sense:2, collect|verb|A2|sense:1, and correct|verb|A2|sense:1, which were not in the 240-entry GLOVA_CURATED_HEADWORD_REGISTRY and whose CEFR/sense keys conflicted with CEFR-J v1.5 and LARGE-*.json.

---

## 3. CEFR Provenance Discrepancy Investigation

| `current_learning_unit_key` | `original_source_cefr` | `glova_assigned_cefr` | `grounding_output_cefr` | `pre_review_cefr` | `pilot_cefr` | `source_file_batch` | `transformation_responsible_for_change` | `explicitly_documented` | `reversible` | `human_decision_required` | Provenance Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `accept|verb|A2|sense:1` | `A2` | `A2` | `A2` | `A2` | `A2` | `LARGE-018.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |
| `careful|adjective|A2|sense:2` | `A1` | `A1` | `null` | `null` | `A2` | `LARGE-020.json (careful|adjective|A1|sense:1)` | UNRESOLVED_SYNTHETIC_PILOT_FALLBACK: scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs (MANDATED_REVIEW_READY_FALLBACK_SPECS synthesized key from Phase 6.2.23 prompt specification without a matching staged LARGE-*.json or CEFR-J v1.5 record) | `false` | `true` | `true` | `CEFR_PROVENANCE_REVIEW_REQUIRED` |
| `collect|verb|A2|sense:1` | `A1` | `A1` | `null` | `null` | `A2` | `LARGE-020.json (collect|verb|A1|sense:1)` | UNRESOLVED_SYNTHETIC_PILOT_FALLBACK: scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs (MANDATED_REVIEW_READY_FALLBACK_SPECS synthesized key from Phase 6.2.23 prompt specification without a matching staged LARGE-*.json or CEFR-J v1.5 record) | `false` | `true` | `true` | `CEFR_PROVENANCE_REVIEW_REQUIRED` |
| `conversation|noun|A1|sense:1` | `A1` | `A1` | `A1` | `A1` | `A1` | `LARGE-001.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |
| `correct|verb|A2|sense:1` | `B2` | `B2` | `null` | `null` | `A2` | `LARGE-020.json (correct|adjective|A1|sense:1), LARGE-027.json (correct|verb|B2|sense:1)` | UNRESOLVED_SYNTHETIC_PILOT_FALLBACK: scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs (MANDATED_REVIEW_READY_FALLBACK_SPECS synthesized key from Phase 6.2.23 prompt specification without a matching staged LARGE-*.json or CEFR-J v1.5 record) | `false` | `true` | `true` | `CEFR_PROVENANCE_REVIEW_REQUIRED` |
| `keep|verb|A1|sense:1` | `A1` | `A1` | `A1` | `A1` | `null` | `LARGE-016.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |
| `leave|verb|A1|sense:1` | `A1` | `A1` | `A1` | `A1` | `null` | `LARGE-016.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |
| `sit|verb|A1|sense:1` | `A1` | `A1` | `A1` | `A1` | `null` | `LARGE-016.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |
| `read|verb|A1|sense:1` | `A1` | `A1` | `A1` | `A1` | `null` | `LARGE-018.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |
| `simple|adjective|A2|sense:1` | `A2` | `A2` | `A2` | `A2` | `null` | `LARGE-018.json` | NONE (cefr_j v1.5 source CEFR preserved unchanged across all stages) | `true` | `true` | `false` | `CEFR_PROVENANCE_RESOLVED` |

### Detailed Findings on Unresolved CEFR / Sense-Key Records
1. **`careful|adjective|A2|sense:2`**:
   - **Authoritative Staged Record**: `careful|adjective|A1|sense:1` in `scripts/content-pipeline/output/batches/LARGE-020.json` and `scripts/content-pipeline/output/tier1-batches/TIER-1-006.json`.
   - **Raw CEFR-J v1.5 Provenance**: `cefr_j:v1.5:line:1000` (`careful,adjective,A1,,,`), `conflict_status = "NONE"`.
   - **Discrepancy**: Neither `A2` nor `sense:2` exists for `careful` in CEFR-J v1.5 or any staged batch. The `A1 -> A2` and `sense:1 -> sense:2` shift was introduced solely by `MANDATED_REVIEW_READY_FALLBACK_SPECS` in `scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs`.
   - **Action**: Marked `CEFR_PROVENANCE_REVIEW_REQUIRED` (`UNRESOLVED`) and routed to `HOLD`.
2. **`correct|verb|A2|sense:1`**:
   - **Authoritative Staged Records**: `correct|adjective|A1|sense:1` (`LARGE-020.json` / `TIER-1-006.json`, `cefr_j:v1.5:line:1497`) and `correct|verb|B2|sense:1` (`LARGE-027.json` / `TIER-1-012.json`, `cefr_j:v1.5:line:1498`: `correct,verb,B2,,,`).
   - **Discrepancy**: In CEFR-J v1.5 and Glova's staged batches, `correct` as a verb is assigned `B2`, not `A2`. The `B2 -> A2` shift was introduced solely by `MANDATED_REVIEW_READY_FALLBACK_SPECS` in `scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs`.
   - **Action**: Marked `CEFR_PROVENANCE_REVIEW_REQUIRED` (`UNRESOLVED`) and routed to `HOLD`.
3. **`collect|verb|A2|sense:1`**:
   - **Authoritative Staged Record**: `collect|verb|A1|sense:1` in `scripts/content-pipeline/output/batches/LARGE-020.json` and `scripts/content-pipeline/output/tier1-batches/TIER-1-006.json` (`cefr_j:v1.5:line:1258`: `collect,verb,A1,,,`), which resides in `reports/phase-6.2.21-human-review-queue.json` under `queues.unresolved` (`NO_LEXICAL_MATCH`).
   - **Discrepancy**: In CEFR-J v1.5 and Glova's staged batches, `collect|verb` is `A1`, not `A2`. The `A1 -> A2` shift was introduced solely by `MANDATED_REVIEW_READY_FALLBACK_SPECS` in `scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs`.
   - **Action**: Marked `CEFR_PROVENANCE_REVIEW_REQUIRED` (`UNRESOLVED`) and routed to `HOLD`.

---

## 4. Known Quality Concerns Flagged in `reports/phase-6.2.24-human-review-packet.json`

- **`simple|adjective|A2|sense:1`**:
  - **Exact Example Sentence**: `"The project required a very simple approach when addressing few parts not complex during the meeting."`
  - **Origin**: Synthetic offline enrichment (`glova_offline_example_drafter_v1`, `offline_enrich:phase-6.2.10-v1`, `is_original_generated = true`, `sense_context_used = "having few parts not complex"`), NOT OEWN source data.
  - **Flag**: Explicitly flagged under `known_quality_concerns` (`SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE`) so a human reviewer inspects the unnatural phrasing before any approval decision.
- **`accept|verb|A2|sense:1`**:
  - **Exact Example Sentence**: `"I cannot accept the dogma of this church"`
  - **Origin**: `oewn_2024` (`candidate_synset_id: "00624365-v"`).
  - **Flag**: Reclassified from pilot `REVIEW_READY` back to `EDIT_REQUIRED` due to missing terminal punctuation and C1/C2 lexical register (`"dogma"`).
- **`conversation|noun|A1|sense:1`**:
  - **Exact Example Sentence**: `"Understanding the role of conversation helps students communicate more effectively in everyday situations."`
  - **Origin**: Synthetic offline enrichment (`glova_offline_example_drafter_v1`, `offline_enrich:phase-6.2.10-v1`).
  - **Flag**: Reclassified from pilot `REVIEW_READY` back to `EDIT_REQUIRED` due to synthetic boilerplate phrasing (`^Understanding the role of\b/i`).
- **`careful|adjective|A2|sense:2`**, **`collect|verb|A2|sense:1`**, **`correct|verb|A2|sense:1`**:
  - **Flag**: Quarantined under `CEFR_PROVENANCE_REVIEW_REQUIRED` (`routed_disposition = "HOLD"`, `can_be_treated_as_review_ready = false`).
