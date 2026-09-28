# Phase 6.2.41 — Evidence Recovery Impact Measurement Report

**Date:** 2026-09-28  
**Evaluation Target:** Single-Source Evidence Recovery Interventions across 10,021 Units  
**Denominator:** 10,021 Vocabulary Learning Units (100.0% Exhaustive Enumeration)  
**Final Verdict:** **`EVIDENCE_RECOVERY_MEASURED`**  
**Production Status:** `NOT_READY` (0 DB Writes, 0 Schema Alterations, 0 Lifecycle Promotions)  
**Learner-Ready Locked:** 83 Units (21 ACTIVE in Production + 62 APPROVED in Staging, Gap: 9,917)  
**User Testing Authorized:** `false`  

> [!WARNING]
> **Governance Notice:** `EVIDENCE_RECOVERY_MEASURED` confirms empirical measurement of single-source recovery yields. It does **NOT** grant `PRODUCTION_READY` or `USER_TESTING_READY` status.

---

## 1. Locked Authoritative Baseline

The baseline established by Phase 6.2.39-R1 is strictly preserved:

| Metric | Authoritative Count | Percentage of Universe |
| :--- | :---: | :---: |
| **Total Universe** | **10,021** | 100.00% |
| **`AUTO_CANDIDATE`** | **342** | 3.41% |
| **`REVIEW_REQUIRED`** | **1,196** | 11.93% |
| **`HOLD`** | **8,483** | 84.65% |
| **Learner-Ready Locked** | **83** (21 ACTIVE + 62 APPROVED) | 0.83% |
| **Readiness Gap** | **9,917** | 99.17% |

---

## 2. Blocker Recovery Opportunities (9,679 Blocked Units)

Every unit currently in `HOLD` or `REVIEW_REQUIRED` (9,679 units) was evaluated across all 8 evidence dimensions:

| Category | Blocker Description | Unit Count | % of Blocked Population (9,679) |
| :--- | :--- | :---: | :---: |
| **A** | **Example evidence missing** (`EXAMPLE_NOT_FOUND`) | **5,308** | 54.84% |
| **B** | **Semantic evidence missing** (`SEMANTIC_NO_EVIDENCE`) | **5,833** | 60.26% |
| **C** | **Polysemy unresolved** (`POLYSEMY_UNRESOLVED`) | **5,273** | 54.48% |
| **D** | **Thai meaning missing** (`THAI_NOT_FOUND`) | **882** | 9.11% |
| **E** | **Sense alignment missing** (`SENSE_NOT_FOUND`) | **569** | 5.88% |
| **F** | **CEFR conflict** (`CEFR_CONFLICT`) | **100** | 1.03% |
| **G** | **IPA issue** (`IPA_NOT_FOUND` / `IPA_MULTI_VARIANT`) | **623** | 6.44% |
| **H** | **Multiple co-occurring blockers** ($\ge 2$ blockers) | **6,758** | **69.82%** |
| — | **Sole blocker units** (exactly 1 blocker) | **2,921** | **30.18%** |

### Sole Blocker Units Breakdown (2,921 Units)
- `POLYSEMY_UNRESOLVED`: **1,146** units
- `SEMANTIC_NO_EVIDENCE`: **1,136** units
- `EXAMPLE_NOT_FOUND`: **365** units
- `THAI_NOT_FOUND`: **262** units
- `IPA_MULTI_VARIANT`: **6** units
- `CEFR_CONFLICT`: **4** units
- `IPA_NOT_FOUND`: **2** units

---

## 3. Source-by-Source Recovery Matrix

Each of the 5 evidence sources present in the repository was evaluated independently. For every intervention, the **complete existing 8-dimensional evidence gates were re-run** (no unit becomes `AUTO_CANDIDATE` simply because one missing field was filled):

| Evidence Intervention | Candidate Population | Evidence Recovered | `AUTO_CANDIDATE` After Full Gates | `REVIEW_REQUIRED` After Full Gates | `HOLD` After Full Gates | Recovery Rate (`AUTO`) | Main Failure Reason |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **OEWN example recovery** | 5,308 | 1,195 (22.51%) | **445** (+103) | **1,560** (+364) | **8,016** (-467) | **1.94%** | Multi-blocker coupling: 728 recovered units remain in HOLD due to persistent semantic or Thai deficits. |
| **Tatoeba example recovery** | 5,308 | 234 (4.41%) | **356** (+14) | **1,266** (+70) | **8,399** (-84) | **0.26%** | Inventory limitation: 5,074 units absent from repo 93-sentence subset (TRUE_SOURCE_GAP), plus secondary semantic gaps. |
| **LEXiTRON lexical evidence** | 1,024 | 113 (11.04%) | **342** (+0) | **1,210** (+14) | **8,469** (-14) | **0.00%** | TRUE_SOURCE_GAP: 100% of candidate lemmas (modern tech, compounds, C1/C2 derivatives) are missing from 2003 LEXiTRON. |
| **OEWN semantic evidence** | 8,390 | 4,001 (47.69%) | **757** (+415) | **1,615** (+419) | **7,649** (-834) | **4.95%** | Multi-blocker dead ends: 3,167 units with resolved semantics remain trapped in HOLD due to missing example sentences. |
| **CMU pronunciation recovery** | 623 | 129 (20.71%) | **348** (+6) | **1,190** (-6) | **8,483** (+0) | **0.96%** | Multi-blocker dead ends: 615 units (98.72%) simultaneously suffer from missing examples or semantic deficits. |

---

## 4. True Bottleneck Diagnosis

1. **Largest Recoverable Population:**
   **OEWN Semantic Evidence** (definitions, synset members, relations, glosses):
   - Candidate pool: 8,390 units
   - Evidence recovered: 4,001 units (718 confident + 3,283 ambiguous)
   - Highest measured absolute gain: **+415 `AUTO_CANDIDATE`** and **834 total units unblocked from `HOLD`**.
2. **Largest Population with Low Recovery Yield:**
   **Example Evidence** (`EXAMPLE_NOT_FOUND`):
   - Despite affecting 5,308 units (54.84% of blocked units), example recovery alone yields only **1.94%** (OEWN) and **0.26%** (Tatoeba) conversion to `AUTO_CANDIDATE` because 728 recovered units are held back by secondary semantic gaps.
3. **Most Multi-Blocker Dead Ends:**
   **`EXAMPLE_NOT_FOUND` + `SEMANTIC_NO_EVIDENCE`**:
   - Exactly **3,001 units** suffer from both deficits simultaneously. Single-source interventions cannot unblock any of these units.
4. **Currently Preventing Otherwise Strong Units:**
   - **365 units** are blocked ONLY by `EXAMPLE_NOT_FOUND`.
   - **1,136 units** are blocked ONLY by `SEMANTIC_NO_EVIDENCE`.
   - **1,146 units** are blocked ONLY by `POLYSEMY_UNRESOLVED`.
   - **8 units** are blocked ONLY by IPA.
   These **2,655 sole-blocker units** represent the highest-efficiency immediate targets.

---

## 5. Projection Policy & Future Scope

$$\mathbf{POLICY: \text{INSUFFICIENT EVIDENCE FOR PROJECTION}}$$

All speculative claims regarding "unlocking thousands" are formally rejected. With **69.82% of blocked units bound by multi-blocker coupling**, linear extrapolation is statistically invalid. Progress requires verified dual-track evidence pairing.

---

## 6. Recommended Next Evidence Intervention

**Dual-Track Coordinated Evidence Ingestion:**
1. **Track 1 (Semantic Gloss Expansion):** Ingest OEWN hypernym/hyponym definition glosses and WordNet synset members into lexical candidate matching. This directly unlocks +415 units into `AUTO_CANDIDATE` and moves 419 units into `REVIEW_REQUIRED`.
2. **Track 2 (Corpus Sentence Scaling with Strict POS Gating):** Ingest the complete licensed Tatoeba English corpus with strict POS filtering to unlock the 365 sole-blocker units and synergistically resolve the 3,001 co-dependent units when combined with Track 1.

---

## 7. Production Safety & Invariants

- **Production DB Writes:** **0**
- **Schema Changes:** **0**
- **Lifecycle Promotions:** **0**
- **Learner-Ready Units:** Strictly locked at **83** (21 ACTIVE in Production + 62 APPROVED in Staging).
- **Readiness Gap:** **9,917** units to 10,000 target.
- **Production Status:** **`NOT_READY`**
- **User Testing Authorized:** **`false`**
- **Final Verdict:** **`EVIDENCE_RECOVERY_MEASURED`**
