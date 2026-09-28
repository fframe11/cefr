# Phase 6.2.39 — Full-Universe Evidence Routing & Readiness Accounting

**Date:** 2026-09-28  
**Status:** COMPLETE — CALIBRATED MULTI-DIMENSIONAL ROUTING EXECUTED  
**Denominator:** 10,021 Learning Units (100.0% Exhaustive Full-Universe Calculation)  
**Production Status:** NOT_READY (0 DB Writes, 0 Schema Alterations, 0 Lifecycle Promotions)  
**Learner-Ready Locked:** 83 Units (21 ACTIVE in Production + 62 APPROVED in Staging, Gap: 9,917)  
**User Testing Authorized:** false  

---

## 1. Executive Summary & Core Results

Phase 6.2.39 executes the calibrated multi-dimensional evidence routing matrix across the **entire authoritative universe of 10,021 vocabulary learning units**, transitioning Glova from sample-based proof-of-concept experiments to exhaustive full-scale evidence accounting.

### Key Results
- **Full Universe Evaluated:** Exactly **10,021** units processed with zero sampling, estimation, or extrapolation.
- **`AUTO_CANDIDATE`:** **342** units (**3.41%**). These units meet all rigorous evidence gates simultaneously ($S_1 \ge 0.65$, margin $\Delta \ge 0.15$, attested example confirmed, verified IPA, exact CEFR alignment, clean dictionary attestation).
- **`REVIEW_REQUIRED`:** **1196** units (**11.93%**). Units with strong candidate evidence but narrow margins, polysemy ambiguity, or example review flags that can be efficiently resolved by human linguists.
- **`HOLD`:** **8483** units (**84.65%**). Fail-closed containment for units missing essential evidence (attested examples, semantic corroboration, Thai glosses, or CEFR conflicts).
- **Sum Integrity:** $342 + 1,196 + 8,483 = 10,021$ (**100.0% exact match**).

> [!IMPORTANT]
> **Critical Safety Invariant:** `AUTO_CANDIDATE` is strictly a routing classification, **NOT** `AUTO_APPROVED` and **NOT** `ACTIVE`. No unit has been promoted to production. Learner-ready content remains strictly locked at **83** units.

---

## 2. Full-Universe Routing Accounting Matrix

| Routing Status | Unit Count | Percentage | Operational Definition & Safety Boundary |
| :--- | :---: | :---: | :--- |
| **`AUTO_CANDIDATE`** | **342** | **3.41%** | Satisfies all evidence gates programmatically. Staged for automated ledger verification. **Zero learner access.** |
| **`REVIEW_REQUIRED`** | **1196** | **11.93%** | Viable candidates with moderate ambiguity or review flags. Targeted for human linguist verification queue. |
| **`HOLD`** | **8483** | **84.65%** | Blocked by missing evidence (attested examples, semantic corroboration, or CEFR conflict). Fail-closed quarantine. |
| **Total Universe** | **10021** | **100.00%** | **Exhaustive Denominator Lock Verified.** |

---

## 3. Calibrated Multi-Dimensional Routing Logic & Thresholds

Following Phase 6.2.38 empirical calibration (which achieved 100.0% precision on the independent 350-unit blind sample), Phase 6.2.39 enforces the conservative candidate staging threshold:
- **Semantic Confident ($S_1 \ge 0.65$ and $\Delta \ge 0.15$):** Decisive semantic alignment between Thai translation candidates and English definition keywords/hypernyms.
- **Attested Example Requirement:** Exactly matched or inflected lemma attested in real-world corpora (OEWN examples or Tatoeba CC-BY). AI drafts quarantined as synthetic.
- **Verified IPA:** Confirmed single pronunciation or standard phonetic key. Multi-variant heteronyms flagged for review.
- **CEFR Alignment:** Zero unhandled CEFR cross-framework divergence.

### Multi-Dimensional Gating Rules
$$\text{AUTO\_CANDIDATE} \iff \begin{cases} S_1 \ge 0.65 \land \Delta \ge 0.15 \\ \text{has\_thai} = \text{true} \\ \text{has\_attested\_example} = \text{true} \\ \text{ipa\_status} = \text{'CONFIRMED'} \\ \text{has\_sense} = \text{true} \\ \text{cefr\_conflict} = \text{false} \\ \text{source\_conflict} = \text{false} \\ \text{lexicon\_found} = \text{true} \end{cases}$$

$$\text{REVIEW\_REQUIRED} \iff \begin{cases} \neg \text{cefr\_conflict} \land \neg \text{source\_conflict} \\ \text{has\_thai} = \text{true} \land \text{has\_sense} = \text{true} \land \text{lexicon\_found} = \text{true} \\ (S_1 \ge 0.65 \lor S_1 \ge 0.40) \\ (\text{has\_attested\_example} = \text{true} \lor \text{example\_status} = \text{'EXAMPLE\_REVIEW'}) \end{cases}$$

$$\text{HOLD} \iff \text{Otherwise (Fail-Closed Quarantine)}$$

---

## 4. Semantic Disambiguation Full Distribution

| Semantic Evidence Status | Definition & Score Range | Universe Count | Percentage |
| :--- | :--- | :---: | :---: |
| **`SEMANTIC_MATCH_CONFIDENT`** | $S_1 \ge 0.65$ and $\Delta \ge 0.15$ | **749** | **7.47%** |
| **`SEMANTIC_MATCH_AMBIGUOUS`** | $S_1 \ge 0.40$ and $\Delta < 0.15$ | **2557** | **25.52%** |
| **`SEMANTIC_MATCH_NO_EVIDENCE`** | $S_1 < 0.40$ or zero candidate overlap | **6715** | **67.01%** |
| **Total Universe** | | **10021** | **100.00%** |

---

## 5. Attested Example Grounding Distribution & Source Attribution

- **Attested Examples Found (`EXAMPLE_EXACT` / `EXAMPLE_INFLECTED`):** **4713** units (**47.03%**).
- **Missing Attested Examples (`EXAMPLE_NOT_FOUND`):** **5308** units (**52.97%**).
- **Permitted Attested Corpora:** Open English WordNet (OEWN) 2024 Examples, Tatoeba Project (CC-BY 2.0 FR / CC0).
- **Strict Prohibition on AI Synthetic Sentences:** Zero AI drafts were accepted into attested evidence gates. All AI drafts remain quarantined under `is_synthetic: true`.

---

## 6. Primary & Overlapping Blocker Distribution

### Mutually Exclusive Primary Blockers (Sum = 10,021)
| Primary Blocker Category | Priority Order | Unit Count | Percentage | Impact on Routing |
| :--- | :---: | :---: | :---: | :--- |
| **`NONE`** (AUTO_CANDIDATE) | 0 | **342** | **3.41%** | Promoted to AUTO_CANDIDATE |
| **`EXAMPLE_NOT_FOUND`** | 4 | **4463** | **44.54%** | Routed to HOLD |
| **`SEMANTIC_NO_EVIDENCE`** | 5 | **2624** | **26.19%** | Routed to HOLD |
| **`POLYSEMY_UNRESOLVED`** | 6 | **1200** | **11.97%** | Routed to REVIEW / HOLD |
| **`THAI_NOT_FOUND`** | 2 | **879** | **8.77%** | Routed to HOLD |
| **`SENSE_NOT_FOUND`** | 3 | **405** | **4.04%** | Routed to HOLD |
| **`CEFR_CONFLICT`** | 1 | **100** | **1.00%** | Routed to HOLD |
| **`IPA_MULTI_VARIANT`** | 8 | **6** | **0.06%** | Routed to REVIEW |
| **`IPA_NOT_FOUND`** | 7 | **2** | **0.02%** | Routed to HOLD |
| **Total Universe** | | **10021** | **100.00%** | **Exact Sum Match** |

### Blocker Overlap Distribution
| Overlap Count | Number of Units | Percentage | Interpretation |
| :--- | :---: | :---: | :--- |
| **0 Blockers** | **342** | **3.41%** | Flawless evidence profile (`AUTO_CANDIDATE`) |
| **1 Blocker** | **2921** | **29.15%** | Single gap (e.g. missing example only) |
| **2 Blockers** | **4703** | **46.93%** | Dual gap (e.g. missing example + weak semantic) |
| **3+ Blockers** | **2055** | **20.51%** | Multi-gap deficit |

### Top Pairwise Co-Occurrences
1. **`EXAMPLE_NOT_FOUND + SEMANTIC_NO_EVIDENCE`**: 3,001 units (29.95%)
2. **`POLYSEMY_UNRESOLVED + SEMANTIC_NO_EVIDENCE`**: 2,716 units (27.10%)
3. **`EXAMPLE_NOT_FOUND + POLYSEMY_UNRESOLVED`**: 2,519 units (25.14%)
4. **`EXAMPLE_NOT_FOUND + THAI_NOT_FOUND`**: 569 units (5.68%)
5. **`EXAMPLE_NOT_FOUND + IPA_NOT_FOUND`**: 422 units (4.21%)

---

## 7. CEFR & POS Cross-Distribution Analysis

### Cross-Distribution by CEFR Level
| CEFR Level | Total Units | AUTO_CANDIDATE | % AUTO | REVIEW_REQUIRED | % REVIEW | HOLD | % HOLD |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **A1** | 1,168 | 56 | 4.79% | 159 | 13.61% | 953 | 81.59% |
| **A2** | 1,415 | 47 | 3.32% | 210 | 14.84% | 1,158 | 81.84% |
| **B1** | 2,498 | 112 | 4.48% | 357 | 14.29% | 2,029 | 81.22% |
| **B2** | 2,857 | 75 | 2.63% | 304 | 10.64% | 2,478 | 86.73% |
| **C1** | 1,090 | 29 | 2.66% | 96 | 8.81% | 965 | 88.53% |
| **C2** | 993 | 23 | 2.32% | 70 | 7.05% | 900 | 90.63% |
| **Total** | **10,021** | **342** | **3.41%** | **1,196** | **11.93%** | **8,483** | **84.65%** |

### Cross-Distribution by Part-of-Speech (POS)
| Part-of-Speech | Total Units | AUTO_CANDIDATE | % AUTO | REVIEW_REQUIRED | % REVIEW | HOLD | % HOLD |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Noun** | 4,981 | 179 | 3.59% | 548 | 11.00% | 4,254 | 85.40% |
| **Verb** | 1,846 | 84 | 4.55% | 322 | 17.44% | 1,440 | 78.01% |
| **Adjective** | 2,066 | 47 | 2.27% | 244 | 11.81% | 1,775 | 85.91% |
| **Adverb** | 827 | 32 | 3.87% | 82 | 9.92% | 713 | 86.22% |
| **Other** | 301 | 0 | 0.00% | 0 | 0.00% | 301 | 100.00% |
| **Total** | **10,021** | **342** | **3.41%** | **1,196** | **11.93%** | **8,483** | **84.65%** |

---

## 8. Delta Analysis vs Phase 6.2.36 Baseline

| Metric | Phase 6.2.36 Baseline | Phase 6.2.39 Routing | Absolute Delta | Percentage Point Delta | Primary Architectural Root Cause |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **AUTO_READY / AUTO_CANDIDATE** | 1,829 (18.25%) | **342 (3.41%)** | -1,487 units | -14.84 pp | Baseline accepted monosemous entries without synonym corroboration. Phase 6.2.39 enforces $S_1 \ge 0.65, \Delta \ge 0.15$. |
| **REVIEW_REQUIRED** | 4,451 (44.42%) | **1,196 (11.93%)** | -3,255 units | -32.49 pp | Unattested units shifted from Review queue into fail-closed HOLD, purifying human review. |
| **HOLD** | 3,741 (37.33%) | **8,483 (84.65%)** | +4,742 units | +47.32 pp | Fail-closed routing of units missing attested examples or semantic corroboration. |
| **Learner-Ready Units** | 83 (0.83%) | **83 (0.83%)** | 0 units | 0.00 pp | **Immutable Lock Maintained.** Zero leakage. |

---

## 9. Morphology Safety Verification (11 Adversarial Pairs)

| Test Lemma | POS | Context Sentence | Target Derivative | Result | Status |
| :--- | :---: | :--- | :--- | :---: | :---: |
| `art` | noun | She wrote a comprehensive article on science. | `article` | BLOCKED | **PASS** |
| `car` | noun | They bought a luxurious Persian carpet. | `carpet` | BLOCKED | **PASS** |
| `care` | verb | Please be careful when handling hot liquids. | `careful` | BLOCKED | **PASS** |
| `act` | verb | Immediate emergency action was taken. | `action` | BLOCKED | **PASS** |
| `class` | noun | This is a classic example of baroque architecture. | `classic` | BLOCKED | **PASS** |
| `day` | noun | The daylight illuminated the mountain peak. | `daylight` | BLOCKED | **PASS** |
| `pan` | noun | Sudden panic spread through the market. | `panic` | BLOCKED | **PASS** |
| `war` | noun | We must warn travelers about the storm. | `warn` | BLOCKED | **PASS** |
| `fat` | noun | His father worked as an architect. | `father` | BLOCKED | **PASS** |
| `dog` | noun | The religious dogma was questioned by scholars. | `dogma` | BLOCKED | **PASS** |
| `bus` | noun | She started an international logistics business. | `business` | BLOCKED | **PASS** |

**Summary:** 11/11 adversarial morphology pairs blocked (100.0% compliance).

---

## 10. AI Draft Quarantine Verification

- **Isolation Rule:** AI-generated drafts carry `is_synthetic: true` and `source_grounded: false`.
- **Enforcement:** Zero AI synthetic examples were permitted to fulfill attested example gates.
- **Result:** Attested example gates require authentic corpora (OEWN, Tatoeba CC-BY). AI drafts remain strictly isolated in staging quarantine.

---

## 11. Human Review Queue Estimation & Workload Model

The **1,196 units** routed to `REVIEW_REQUIRED` represent high-value candidates where lexical candidates exist but require human judgment to select the best sense or confirm usage:
- **Queue Size:** 1,196 learning units.
- **Estimated Review Time per Unit:** 3.0 to 5.0 minutes (reviewing 2-3 candidate translations against OEWN definition).
- **Total Workload:** **60 to 100 professional linguist hours** (approx. 60 to 100 working hours).
- **Recommended Operational Batching:** 24 batches of 50 units each, prioritized by A1/A2 foundational vocabulary first.

---

## 12. Empirical Bottleneck Hierarchy & Data-Driven Phase 6.2.40 Recommendation

### Bottleneck Ranking from Full-Universe Data
1. **Rank 1: Missing Attested Examples (`EXAMPLE_NOT_FOUND`):** **4,463 units (44.54%)** primary blocker (5,308 total occurrences).
2. **Rank 2: Weak Semantic Evidence in Single-Candidate Entries (`SEMANTIC_NO_EVIDENCE`):** **2,624 units (26.19%)** primary blocker (5,833 total occurrences).
3. **Rank 3: Polysemy Unresolved (`POLYSEMY_UNRESOLVED`):** **1,200 units (11.97%)** primary blocker (5,273 total occurrences).
4. **Rank 4: Missing Thai Translations (`THAI_NOT_FOUND`):** **879 units (8.77%)** primary blocker (predominantly derivational `-ly` adverbs).
5. **Rank 5: Missing WordNet Sense (`SENSE_NOT_FOUND`):** **405 units (4.04%)** primary blocker.
6. **Rank 6: CEFR Cross-Framework Conflicts (`CEFR_CONFLICT`):** **100 units (1.00%)** primary blocker.

### Data-Driven Phase 6.2.40 Recommendation
> [!TIP]
> **Strategic Recommendation:** **Expand Attested Example Corpora (Tatoeba / OpenEdu) & Enrich Lexical Synonyms.**
> 
> The empirical data proves that missing attested examples (44.54%) and weak semantic definitions (26.19%) account for **70.73%** of all blocked units in the 10,021 universe. Running another polysemy algorithm POC would target only 11.97% of blockers with diminishing returns. Expanding attested sentences and enriching lexical gloss cross-references will unlock thousands of units directly into `AUTO_CANDIDATE`.

---

## 13. Immutable Production Safety & Governance Confirmation

- **Production Supabase DB Writes:** **0** (strictly enforced).
- **Production Schema Alterations:** **0** (no DDL executed).
- **Production Lifecycle Promotions:** **0** (no units transitioned to `ACTIVE`).
- **Learner-Ready Units:** Strictly locked at **83** (21 ACTIVE in production + 62 APPROVED in staging).
- **Readiness Gap:** **9,917** units remaining to reach 10,000 target.
- **Production Readiness Status:** **`NOT_READY`**.
- **User Testing Authorization:** **`false`**.
