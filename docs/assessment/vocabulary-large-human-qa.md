# Large Vocabulary Human QA, Audit & Production Approval Framework

**Phase**: 6.2.11  
**Target**: Glova Large Vocabulary Content (~10,000 Inventory Target)  
**Readiness Status**: `NOT_READY`  
**User Testing Authorized**: `false`  
**Inventory Units**: 10,021 unique learning units (21 `ACTIVE`, 10,000 `REVIEW_REQUIRED`)  
**Learner-Ready Active Units**: 21  
**Remaining Learner-Ready Gap**: 9,979  

---

## 1. Current Inventory & State Distribution

The Glova vocabulary inventory has reached the target inventory size of 10,021 unique learning units across 6 CEFR proficiency bands (A1–C2). Every learning unit is deterministically addressed by a unique composite key (`lemma|part_of_speech|cefr_level|sense:index`) with 0 duplicate keys across the entire corpus.

### Inventory Census

| Metric / Category | Count | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Total Inventory Learning Units** | **10,021** | Measured | 21 Active + 10,000 Staged |
| **Existing Active Curated Records** | **21** | `ACTIVE` | Human-curated seed, production validated |
| **Staged Candidates Awaiting Review** | **10,000** | `REVIEW_REQUIRED` | Partitioned into 50 batches (200/batch) |
| **Duplicate Learning Unit Keys** | **0** | Verified | Zero collision across all 10,021 units |
| **English Meaning Populated** | **10,021** | 100% | Source-verified OEWN or structured gloss |
| **Thai Meaning Populated** | **10,021** | 100% | 21 Approved + 10,000 AI Draft (requires review) |
| **Phonetic IPA Populated** | **9,705** | 96.85% | Source-verified CMUdict 0.7b |
| **Unresolved Missing IPA** | **316** | 3.15% | Queued for explicit human disposition |
| **Example Sentences Populated** | **10,021** | 100% | 21 Approved + source-verified or structured draft |
| **Confident Sense (Single OEWN)** | **3,208** | 32.01% | Unambiguous 1:1 synset match |
| **Ambiguous Sense (Polysemous)** | **6,058** | 60.45% | Queued for lexicographer sense selection |
| **No-Match Sense (Open/Closed)** | **565** | 5.64% | Function words or specialized derivatives |
| **CEFR Conflict / Multi-Level** | **169** | 1.69% | Legitimate polysemous multi-level splits |

> [!IMPORTANT]
> Reaching 10,021 inventory records does **NOT** equal 10,000 learner-ready records. Staged units containing AI-drafted Thai translations or unadjudicated polysemous senses cannot be deployed to learners without authentic human SME review.

---

## 2. Vocabulary Lifecycle State Definitions

Glova enforces an immutable, state-machine governed lifecycle model across all content assets. Unreviewed, draft, or held records are programmatically blocked from reaching production viewports.

```
                    ┌─────────────────────────┐
                    │     REVIEW_REQUIRED     │
                    │  (10,000 Staged Units)  │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │ (Reject)      │ (Hold)        │ (Flag Edits)
                 ▼               ▼               ▼
          ┌─────────────┐  ┌───────────┐  ┌───────────────┐
          │  REJECTED   │  │   HOLD    │  │ EDIT_REQUIRED │
          └─────────────┘  └───────────┘  └───────┬───────┘
                                                  │ (Re-evaluated)
                                 │ (Approve with) │
                                 │ human evidence │
                                 ▼                ▼
                    ┌─────────────────────────┐
                    │        APPROVED         │
                    │   (Human Sign-off OK)   │
                    └────────────┬────────────┘
                                 │ (Explicit deployment)
                                 ▼
                    ┌─────────────────────────┐
                    │         ACTIVE          │
                    │  (Production Serving)   │
                    └─────────────────────────┘
```

1. **`REVIEW_REQUIRED`**: Initial staging state for all newly ingested or algorithmically enriched candidates. Records possess complete structural fields but lack human verification.
2. **`EDIT_REQUIRED`**: The reviewer flags content issues (e.g. Thai gloss lacks natural nuance, example sentence vocabulary is above CEFR level). Requires lexicographic editing before re-evaluation.
3. **`HOLD`**: The unit is suspended pending external lexicographical resolution, dialectal confirmation, or curriculum consultation.
4. **`REJECTED`**: Content is deemed pedagogically invalid, irreconcilably offensive, or factually erroneous. Permanently excluded from learner-facing serving.
5. **`APPROVED`**: Unit has undergone explicit 8-dimension audit and received an authenticated human sign-off with recorded reviewer identity, timestamp, and rationale.
6. **`ACTIVE`**: Unit is deployed to the production Supabase datastore (`is_active = true`, `lifecycle_status = 'ACTIVE'`). Only reachable from `APPROVED`. Direct promotion from `REVIEW_REQUIRED`, `EDIT_REQUIRED`, `HOLD`, or `REJECTED` is strictly forbidden at both application and database constraint levels.

---

## 3. The 8-Dimension Content-Quality Audit Framework

Every vocabulary record must pass an automated 8-dimension pre-audit before a reviewer can submit an `APPROVE` decision:

1. **Identity & Normalization**:
   - `lemma`: Lowercase, whitespace-trimmed, NFC normalized.
   - `part_of_speech`: Validated against canonical 13-member POS set (`noun, verb, adjective, adverb, preposition, conjunction, phrase, determiner, pronoun, interjection, modal_auxiliary, number, infinitive_to`).
   - `learning_unit_key`: Strict format `${lemma}|${pos}|${cefr}|sense:${index}`.
2. **CEFR Level & Pedagogical Framework**:
   - Validated against standard levels (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
   - Calibrated against CEFR-J 1.5, NGSL, or Octanove frequency profiles. Explicitly labeled as source-referenced pedagogical classification, not an official Cambridge Assessment certification.
3. **English Meaning**:
   - Length >= 3 characters.
   - Non-circular check: definition cannot be verbatim identical to headword.
   - Sourced from Open English WordNet (OEWN-2024) or lexicographer gloss.
4. **Thai Meaning**:
   - Contains >= 2 Thai Unicode script characters (`[\u0E00-\u0E7F]`).
   - Anti-parenthetical translation rule: regex check blocks dual-language contamination (`คำไทย (English Word)`).
   - Distinct from English definition.
5. **IPA Pronunciation**:
   - Phonetic IPA formatting (`/.../`) derived from CMUdict 0.7b.
   - Where IPA is unresolved (316 units), requires explicit terminal disposition.
6. **Learner Example Sentence**:
   - Minimum length >= 10 characters.
   - Contains target word or an approved morphological inflection (plural, past tense, progressive `-ing`, comparative/superlative).
7. **Provenance & Licensing**:
   - Mandatory tracking of `source_name`, `source_version`, `original_id`, `transformation_method`, and permissive license (CC-BY-SA, TUFS, BSD, MIT).
8. **Sense Disambiguation & Adjudication**:
   - Confident single-sense or explicit human disposition (`SELECT_SUPPORTED_SENSE`, `SPLIT_LEARNING_UNIT`, `EDIT_MEANING`).

---

## 4. Human Review Tooling & Workflow

To facilitate human lexicographical review across 10,000 staged items without context overload, content is partitioned into 50 discrete batches (`LARGE-001` through `LARGE-050`), each containing exactly 200 learning units.

### Workflow Sequence

```
Step 1: Batch Selection (Reviewer selects LARGE-001 ... LARGE-050)
   ↓
Step 2: Unit Inspection (Reviewer views single unit with 8-dimension audit preview)
   ↓
Step 3: Verification / Editing (Reviewer verifies Thai gloss, IPA, example sentence)
   ↓
Step 4: Explicit Disposition (IPA disposition + Sense disposition for polysemous items)
   ↓
Step 5: Decision Submission (APPROVE, REJECT, EDIT_REQUIRED, or HOLD with rationale)
   ↓
Step 6: Atomic Ledger Logging (Appends to reports/vocabulary-human-review-ledger.json)
```

The review interface exposes all candidate senses from OEWN 2024, frequency ranks, CMUdict Arpabet transcriptions, and provenance chains.

---

## 5. Review Risk Prioritization (4 Tiers)

To optimize human expert time, the 10,000 units are classified into 4 deterministic risk tiers:

| Tier | Label | Criteria | Typical Actions |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Critical Risk** | CEFR conflicts (169), No-match senses (565), Ambiguous senses (6,058), Unresolved IPA (316), Heteronyms | Senior lexicographer adjudication, manual sense selection, IPA transcription |
| **Tier 2** | **High Risk** | Multi-variant IPA, Polysemy with > 2 senses, Supplemental shortfall items (124) | Variant confirmation, primary learner sense validation |
| **Tier 3** | **Medium Risk** | Standard polysemous items with stable dominant sense, AI-drafted Thai meanings | Thai gloss naturalness check, example suitability verification |
| **Tier 4** | **Low Risk** | Tier 1 Fast Track (Single OEWN synset, verified CMUdict IPA, verified source meaning) | Rapid confirmation of Thai gloss accuracy and formatting |

---

## 6. Approval Invariants & Refusal Rules

Under **NO** circumstances may an item be approved automatically or bypass human review:

1. **Zero Anonymous Approvals**: Every approval MUST record a valid `reviewer_id`, an ISO 8601 timestamp, and an explanatory rationale (minimum 5 characters).
2. **Missing Learner Field Prohibition**: If `meaning_en`, `meaning_th`, `phonetic_ipa` (unless documented as non-phonetic), or `example_sentence` is null or invalid, `validateUnitReviewDecision` throws an uncatchable rejection.
3. **Ambiguity Gate**: Any unit with `MATCH_AMBIGUOUS`, `NO_MATCH`, or `CEFR_CONFLICT` cannot be approved without a specific sense disposition.
4. **Phonetic Gate**: Any unit among the 316 missing IPA items cannot be approved without a terminal IPA disposition.
5. **No Bulk Auto-Approval**: The review engine prohibits batch-wide wildcard approvals. Each record must be individually evaluated.

---

## 7. Rejection & HOLD Procedures

- **`REJECT`**: Applied when an ingested item represents an OCR artifact, malformed token, non-English character sequence, or pedagogically unsound entry. The record is permanently flagged with `lifecycle_status = 'REJECTED'` and preserved in the ledger to prevent re-ingestion.
- **`HOLD`**: Applied when an item has unresolved dialectal disputes (e.g. British vs. American English orthography/pronunciation divergence) or requires curriculum lead consultation. The item remains quarantined from learner-facing serving.

---

## 8. Explicit Resolution Framework for the 316 Unresolved IPA Items

CMUdict 0.7b contains 9,705 matches out of 10,021 units. The remaining 316 items fall into 4 structural categories:

1. **`VERIFIED_PRONUNCIATION`**: The reviewer supplies or confirms the correct IPA transcription using Oxford/Cambridge English pronunciation standards.
2. **`MULTIPLE_VALID_VARIANTS`**: The word has distinct regional or syntactic pronunciations (e.g. `/ədˈvɜːtɪsmənt/` UK vs. `/ˌædvərˈtaɪzmənt/` US). Both variants are recorded in `pronunciation_variants_ipa`.
3. **`NOT_APPLICABLE_NO_PHONETIC_FORM`**: Non-spoken lexical symbols, mathematical abbreviations, or special notations that do not have an independent spoken form. Must include documented reasoning.
4. **`REQUIRES_HUMAN_TRANSCRIPTION`**: Queued for expert phonetician review.
5. **`UNRESOLVED`**: Initial quarantine state. Blocks promotion to `APPROVED` or `ACTIVE`.

---

## 9. Disambiguation Framework for the 6,792 Queued Sense Candidates

For the 6,058 ambiguous senses, 565 no-match cases, and 169 CEFR conflicts:

1. **`SELECT_SUPPORTED_SENSE`**: Reviewer selects the specific OEWN synset ID that corresponds to the CEFR level's pedagogical intent.
2. **`SPLIT_LEARNING_UNIT`**: The word exhibits distinct meanings at different CEFR levels (e.g., *bank* as financial institution at A1 vs. *bank* as river edge at B1). The unit is bifurcated into two discrete learning unit keys.
3. **`EDIT_MEANING`**: Reviewer edits the English definition to provide a targeted learner gloss.
4. **`CHANGE_CEFR_WITH_EVIDENCE`**: Reviewer reassigns the CEFR level based on frequency or curriculum evidence.
5. **`HOLD`** / **`REJECT`**: Deferred or discarded.

---

## 10. CEFR Claim Boundary & Legal Positioning

Glova operates strictly under standard educational fair practice:
- **CEFR-Informed**: Content is calibrated against the Council of Europe's Common European Framework of Reference (CEFR) descriptors and CEFR-J frequency profiles.
- **Non-Certified**: Glova makes **NO** claim of official certification, validation, or endorsement by Cambridge Assessment English, Cambridge University Press, or the Council of Europe.
- **Pedagogical Classification**: All level tags (A1, A2, B1, B2, C1, C2) represent internal pedagogical recommendations designed to assist learners in structured skill progression.

---

## 11. Production Safety & Zero-Exposure Invariants

1. **Zero Database Modifications**: No production Supabase migrations, seeds, or updates were run during Phase 6.2.11.
2. **Constraint Enforcement**: `chk_vocabularies_active_approved_enrichment` in PostgreSQL guarantees that even if a network query attempted to activate unreviewed content, the database engine would reject the transaction.
3. **Sandbox Isolation**: All review tooling and ledger files reside in offline scripts (`scripts/content-pipeline/`) and reports (`reports/`).

---

## 12. Large Readiness Calculation & Next Steps

### Formula

$$\text{Learner-Ready Percentage} = \frac{\text{Active Curated (21)} + \text{Human-Approved (N)}}{\text{Large Target (10,000)}} \times 100$$

$$\text{Currently} = \frac{21 + 0}{10,000} \times 100 = 0.21\%$$

### Readiness Decision

```json
{
  "overall_status": "NOT_READY",
  "verdict_display": "NOT READY",
  "user_testing_authorized": false,
  "inventory_units": 10021,
  "learner_ready_units": 21,
  "remaining_gap": 9979
}
```

### Path to Production Readiness
To advance `overall_status` from `NOT_READY` to `READY`:
1. Lexicographical SMEs must review and approve batches `LARGE-001` through `LARGE-050`.
2. Terminal dispositions must be recorded for the 316 unresolved IPA items and 6,792 sense candidates.
3. Only when `learner_ready_units >= 10,000` may user testing be authorized.
