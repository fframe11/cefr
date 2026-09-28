# Phase 6.2.25 — Remove Synthetic Pilot Fallbacks & Lock Exact-Record Review Gate

## 1. Executive Summary & Gate Decision

- **Final Gate**: **`EXACT_REVIEW_TARGET_GATE_PASS`**
- **Canonical `LARGE-*.json` Inventory Count**: `10000`
- **Requested Review Targets Evaluated**: `20`
- **Exact Canonical Matches (`FOUND_EXACTLY_ONE`)**: `17`
- **Invalid Targets Rejected (`INVALID_REVIEW_TARGET`)**: `3`
- **CEFR Provenance Mismatches (`CEFR_MISMATCH`)**: `3`
- **Synthetic Fallback Targets Rejected**: `3`
- **Duplicate Canonical Key Count**: `0`
- **Regenerated Canonical Packet Record Count**: `17` (`15` active canonical pilot cohort records + `2` reclassified Set A `EDIT_REQUIRED` records)
- **Human Approvals Added**: `0`
- **Production DB Mutations**: `0`
- **Learner-Ready Units**: `28 / 10000` (Gap: `9972`, Status: `NOT_READY`, `user_testing_authorized = false`)

---

## 2. Removal of `MANDATED_REVIEW_READY_FALLBACK_SPECS` & Rejected Synthetic Targets

`scripts/content-pipeline/vocab/controlled-human-review-pilot.mjs` no longer constructs synthetic fallback records when a requested `learning_unit_key` is absent from the canonical `LARGE-*.json` inventory. `buildHumanDecisionInterfaceItem()` now throws on any missing `LARGE` entry, and `selectCanonicalPilotReviewTarget()` / `resolveCanonicalExactKey()` classify the 3 discrepant Phase 6.2.23 keys as `INVALID_REVIEW_TARGET`:

| Requested Key | Lookup Status | Mismatch Diagnostic | Classification | Inventory Presence | Provenance Status | Routed Status | Canonical Existing Record(s) in `LARGE-*.json` |
|---|---|---|---|---|---|---|---|
| `careful|adjective|A2|sense:2` | `NOT_FOUND` | `CEFR_MISMATCH` | `INVALID_REVIEW_TARGET` | `NOT_FOUND_IN_CANONICAL_LARGE_INVENTORY` | `CEFR_PROVENANCE_REVIEW_REQUIRED` | `HOLD` | `careful|adjective|A1|sense:1` (`LARGE-020`, CEFR `A1`, source `cefr_j:v1.5:line:1000`) |
| `collect|verb|A2|sense:1` | `NOT_FOUND` | `CEFR_MISMATCH` | `INVALID_REVIEW_TARGET` | `NOT_FOUND_IN_CANONICAL_LARGE_INVENTORY` | `CEFR_PROVENANCE_REVIEW_REQUIRED` | `HOLD` | `collect|verb|A1|sense:1` (`LARGE-020`, CEFR `A1`, source `cefr_j:v1.5:line:1258`) |
| `correct|verb|A2|sense:1` | `NOT_FOUND` | `CEFR_MISMATCH` | `INVALID_REVIEW_TARGET` | `NOT_FOUND_IN_CANONICAL_LARGE_INVENTORY` | `CEFR_PROVENANCE_REVIEW_REQUIRED` | `HOLD` | `correct|adjective|A1|sense:1` (`LARGE-020`, CEFR `A1`, source `cefr_j:v1.5:line:1497`); `correct|verb|B2|sense:1` (`LARGE-027`, CEFR `B2`, source `cefr_j:v1.5:line:1498`) |

---

## 3. Canonical Packet Records (`reports/phase-6.2.25-human-review-packet.json`)

Every record in `reports/phase-6.2.25-human-review-packet.json` resolves to **exactly 1** canonical `LARGE-*.json` record (`FOUND_EXACTLY_ONE`) with `CEFR_PROVENANCE_RESOLVED` and pending human-review state (`reviewer_id = null`, `reviewer_decision = null`, `reviewed_at = null`):

| `learning_unit_key` | `canonical_batch_id` | `canonical_pos` | `canonical_cefr` | `canonical_sense` | `exact_resolution_status` | `provenance_status` | `review_status` | `reviewer_decision` |
|---|---|---|---|---|---|---|---|---|
| `keep|verb|A1|sense:1` | `LARGE-016` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` | `null` |
| `leave|verb|A1|sense:1` | `LARGE-016` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` | `null` |
| `sit|verb|A1|sense:1` | `LARGE-016` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` | `null` |
| `read|verb|A1|sense:1` | `LARGE-018` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` | `null` |
| `simple|adjective|A2|sense:1` | `LARGE-018` | `adjective` | `A2` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `REVIEW_READY` | `null` |
| `ago|adverb|A1|sense:1` | `LARGE-001` | `adverb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |
| `become|verb|A1|sense:1` | `LARGE-015` | `verb` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |
| `eye|noun|A1|sense:1` | `LARGE-001` | `noun` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |
| `dress|noun|A1|sense:1` | `LARGE-001` | `noun` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |
| `food|noun|A1|sense:1` | `LARGE-001` | `noun` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |
| `about|preposition|A1|sense:1` | `LARGE-047` | `preposition` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `SPECIAL_SYNTAX_REVIEW_REQUIRED` | `null` |
| `all|pronoun|A1|sense:1` | `LARGE-047` | `pronoun` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `SPECIAL_SYNTAX_REVIEW_REQUIRED` | `null` |
| `both|determiner|A1|sense:1` | `LARGE-047` | `determiner` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `SPECIAL_SYNTAX_REVIEW_REQUIRED` | `null` |
| `if|conjunction|A1|sense:1` | `LARGE-047` | `conjunction` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `SPECIAL_SYNTAX_REVIEW_REQUIRED` | `null` |
| `will|modal_auxiliary|A1|sense:1` | `LARGE-048` | `modal_auxiliary` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `SPECIAL_SYNTAX_REVIEW_REQUIRED` | `null` |
| `accept|verb|A2|sense:1` | `LARGE-018` | `verb` | `A2` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |
| `conversation|noun|A1|sense:1` | `LARGE-001` | `noun` | `A1` | `sense:1` | `FOUND_EXACTLY_ONE` | `CEFR_PROVENANCE_RESOLVED` | `EDIT_REQUIRED` | `null` |

### Explicit Flag Preserved on `simple|adjective|A2|sense:1`
- **Record**: `simple|adjective|A2|sense:1` (`LARGE-018`, Set B `REVIEW_READY`)
- **Example Sentence**: `"The project required a very simple approach when addressing few parts not complex during the meeting."`
- **Flag**: Carries explicit `SYNTHETIC_OFFLINE_ENRICHMENT_EXAMPLE_SENTENCE` warning in `known_quality_concerns` because the sentence originated from `glova_offline_example_drafter_v1` (`phase-6.2.10-v1`) rather than OEWN corpus evidence.

---

## 4. Programmatic Invariant Verification

- **Invariant 1 (Every review packet record resolves to 1 canonical `LARGE` record)**: `true` (`17/17`)
- **Invariant 2 (Zero review packet records absent from canonical `LARGE` inventory)**: `true` (`absent_from_large_count = 0`)
- **Invariant 3 (Zero synthetic/fallback records enter learner-ready accounting)**: `true` (`learner_ready = 28`, `active_curated_db = 21`, `human_approved_staging = 7`)
- **CEFR Protection Invariant (Unresolved CEFR provenance never `REVIEW_READY` or `APPROVED`)**: `true`
