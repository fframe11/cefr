# Phase 6.2.37 — Controlled Semantic Disambiguation & Example Evidence Expansion POC Assessment

## Executive Summary

Phase 6.2.37 investigates whether deterministic, offline semantic evidence and attested open corpus expansion can safely reduce the two primary content blockers identified in Phase 6.2.36:
1. **POLYSEMY_UNRESOLVED** (3,611 primary blockers across the 10,021 candidate universe)
2. **EXAMPLE_NOT_FOUND** (2,734 primary blockers across the 10,021 candidate universe)

### Absolute Governance Invariants
- **Production Supabase Mutations**: **0**
- **Production Schema Changes**: **0**
- **Vocabulary Lifecycle Promotions**: **0**
- **Authoritative Denominator**: Strictly locked at **10,021**
- **Learner-Ready Vocabulary**: Strictly locked at **83** (21 ACTIVE, 62 APPROVED Staging)
- **Target Vocabulary**: **10,000**
- **Readiness Gap**: **9,917**
- **User Testing Authorization**: `false` (`NOT_READY`)

---

## 300-Unit Stratified Sample Architecture (Seed: 6237)

The sample extracts exactly **50 units per CEFR level** (A1 to C2) and balances Parts of Speech, prioritizing units currently blocked by polysemy and examples:
- **CEFR Allocation**: A1: 50, A2: 50, B1: 50, B2: 50, C1: 50, C2: 50 (Total: 300)
- **POS Distribution**: Noun: 140, Verb: 82, Adjective: 60, Adverb: 18, Other: 0
- **Baseline Status**:
  - `POLYSEMY_UNRESOLVED`: 180 (60%)
  - `EXAMPLE_NOT_FOUND`: 72 (24%)
  - `AUTO_READY` (Control): 48 (16%)

---

## Semantic Polysemy Disambiguation Evaluation

### Scoring Mechanics
1. Multi-candidate preservation: all candidates from LEXiTRON and Wiktionary/OMW are preserved; zero `translations[0]` collapsing.
2. Cross-lingual semantic alignment: lexical-semantic feature extraction from English definitions, OEWN synset glosses, LEXiTRON synonyms (`esyn`), and transliteration.
3. Normalized scoring $S \in [0.0, 1.0]$, top score $S_1$, runner-up score $S_2$, margin $\Delta = S_1 - S_2$.
4. Decision thresholds:
   - `SEMANTIC_MATCH_CONFIDENT`: $S_1 \ge 0.60$ and $\Delta \ge 0.15$
   - `SEMANTIC_MATCH_AMBIGUOUS`: $S_1 \ge 0.40$ and $\Delta < 0.15$
   - `SEMANTIC_MATCH_NO_EVIDENCE`: $S_1 < 0.40$
5. Strict fail-closed policy: ambiguous and low-evidence cases remain in `REVIEW_REQUIRED` or `HOLD`.

### Sample Results
- **Confident Disambiguations**: **28** (9.3%)
- **Ambiguous Cases**: **75** (25%)
- **Insufficient Evidence**: **197** (65.7%)
- **Single-Candidate Units**: **97**

### CEFR Breakdown
| CEFR Level | Total | Confident | Ambiguous | No Evidence | Avg Margin |
|:---:|:---:|:---:|:---:|:---:|:---:|
| A1 | 50 | 6 | 14 | 30 | 0.41 |
| A2 | 50 | 3 | 10 | 37 | 0.34 |
| B1 | 50 | 7 | 11 | 32 | 0.4 |
| B2 | 50 | 7 | 13 | 30 | 0.38 |
| C1 | 50 | 2 | 12 | 36 | 0.32 |
| C2 | 50 | 3 | 15 | 32 | 0.36 |

---

## Adversarial Polysemy Test Suite (10 Cases)

All 10 adversarial edge cases were evaluated against strict fail-closed constraints:
1. **bank**: financial institution vs river bank -> **PASSED** (Selected `ธนาคาร` for finance; rejected `ตลิ่ง`)
2. **ติด**: multi-gloss Thai ambiguity -> **PASSED** (Preserved all 4 candidates, prevented premature auto-approval)
3. **borrow vs lend**: directionality distinction -> **PASSED** (`ยืม` scored over `ให้ยืม` with margin $\Delta \ge 0.15$)
4. **stuff vs substance**: colloquial vs technical register -> **PASSED** (Selected `สิ่งของ`, rejected `สารเคมี`)
5. **kick the bucket**: idiom vs literal physical kick -> **PASSED** (Literal `เตะ` selected, idiom `ตาย` rejected)
6. **run**: verb vs noun POS separation -> **PASSED** (Verb `วิ่ง` selected, noun `การวิ่ง` rejected)
7. **rich**: A1 wealth vs C1 fertility -> **PASSED** (`รวย` selected for A1 wealth definition)
8. **tear**: homograph / heteronym (/tɪər/ vs /tɛər/) -> **PASSED** (`น้ำตา` selected for eye secretion definition)
9. **action vs act**: derivational confusion -> **PASSED** (Blacklist blocked false derivative match in morphology)
10. **ใจ**: short Thai gloss in compound words -> **PASSED** (Exact boundary matching prevented compound word false match)

**Result**: **10/10 PASSED (100% Fail-Closed Integrity)**.

---

## Attested Example Evidence Expansion

### Ingested Corpora
1. **OEWN 2024 Synset Examples**: CC-BY 4.0, 32,727 synsets with verified examples.
2. **Tatoeba 2024 Expanded English Corpus**: CC BY 2.0 FR, clean human-contributed sentences.
3. **Open Educational Corpus**: CC-BY 4.0.

### Morphology-Aware Matching Performance
- Strict morphology matching via `morphology-matcher.mjs`.
- Zero false derivative matches: `art != article`, `car != carpet`, `care != careful`, `act != action`, `class != classic`.
- Total units in sample with $\ge 1$ attested example: **209 / 300** (69.7%).

---

## Composite Dual-Variable Simulation (Quadrant Analysis)

| Quadrant | Definition | Sample Units | Workload Impact |
|:---|:---|:---:|:---|
| **Q1** | Resolved Polysemy + Found Attested Example | **22** | Direct Candidate for Automated Review Reduction |
| **Q2** | Resolved Polysemy + Missing Example | **6** | Blocked by Example Requirement |
| **Q3** | Unresolved Polysemy + Found Example | **187** | Blocked by Polysemy Requirement |
| **Q4** | Unresolved Polysemy + Missing Example | **85** | Multi-Blocker (Remains in HOLD / Review) |

### Workload Reduction Projection (SIMULATION ONLY)
- **Projected Human Review Workload Reduction**: **~7%**
- **Polysemy Blocker Reduction**: 3,611 baseline -> ~3274 estimated remaining
- **Example Blocker Reduction**: 2,734 baseline -> ~1481 estimated remaining
- *Crucial note*: Zero promotions applied in production. All state changes are strictly simulated.
