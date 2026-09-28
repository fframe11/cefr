# Phase 6.2.21 — Controlled A1/A2 Grounding Scale-Up & Human-QA Queue Preparation Report

**Phase:** `PHASE_6_2_21_CONTROLLED_A1_A2_SCALEUP`  
**Execution Timestamp:** `2026-09-27T04:05:08.158Z`  
**Sample Scope:** 1,000 Representative Learning Units (500 A1 Units + 500 A2 Units)  
**Decision Gate Classification:** `SCALEUP_VALIDATED`

---

## 1. Executive Summary & Authoritative Invariants

Phase 6.2.21 scaled up the verified grounded lexical expansion mechanism from the initial 200-unit pilot to a controlled **1,000-unit sample (500 A1, 500 A2)**. It constructed 5 segregated human-review queues, created a dedicated special syntax queue for closed-class items, and performed rigorous quality checks on the candidate-ready group.

### Crucial Distinction of Terms (Non-Synonymous Concepts)
1. **Grounded Candidate:** A lexical unit with an authenticated, license-verified bilingual entry in the Grounded Lexicon Store.
2. **Candidate-Ready:** A learning unit whose candidate matches POS, Sense, and CEFR register, and passes all structural quality gates. **NOT APPROVED.**
3. **Human-Reviewed:** A learning unit evaluated by an authenticated lexicographer.
4. **Human-Approved:** A unit certified with an APPROVED decision in the Human Review Ledger.
5. **Learner-Ready:** A unit active in the production database or certified with APPROVED staging status. **Remains strictly 28.**

### Invariants Maintained
- **Active Curated DB Units:** `21`
- **Human-Approved Staging Units:** `7`
- **Learner-Ready Units:** `28`
- **Target Units:** `10000`
- **Gap to Target:** `9972`
- **Readiness Status:** `NOT_READY`
- **User Testing Authorized:** `false`
- **Production Supabase Mutations:** `0`
- **CEFR Non-Overwrite Invariant:** Preserved (external evidence never overwrites Glova CEFR)
- **Zero Auto-Approval Invariant:** Preserved (Human review required = 100%)
- **Historical Human Review Ledger:** Exactly 10 events preserved untouched (7 APPROVED, 2 HOLD, 1 EDIT_REQUIRED)

---

## 2. Controlled 1,000-Unit Scale-Up Before/After Delta Table

| Evaluation Metric | Baseline (Phase 6.2.19) | After Scale-Up (Phase 6.2.21) | Empirical Delta | Technical Significance |
| :--- | :---: | :---: | :---: | :--- |
| **Total Sample Evaluated** | 1,000 | 1,000 | 0 | Controlled representative sample |
| **Source Grounded Units** | **4** | **108** | **+104** | Grounded candidates matched in registry |
| **No Lexical Source Units** | **996** | **892** | **-104** | Substantial reduction in ungrounded units |
| **Candidate-Ready (Approved Ready)** | **4** | **108** | **+104** | Grounded, POS-aligned, sense-aligned units |
| **Edit Required Candidate** | **0** | **0** | **+0** | High CEFR band register mismatch |
| **Hold Candidate** | **0** | **0** | **+0** | Polysemy conflict or pedagogical conflict |
| **Special Syntax Review Required** | **0** | **93** | **+93** | Closed-class function words segregated |
| **Unresolved Units** | **996** | **799** | **-197** | Unresolved units reduced through grounding |
| **POS Aligned (Candidates)** | 4 | 108 | +104 | Zero POS mismatch on curated entries |
| **Sense Aligned** | 4 | 108 | +104 | Exact definition/synset keyword alignment |
| **CEFR Compatible** | 4 | 108 | +104 | Compatible within ≤ 1 CEFR band |
| **Human Review Required** | **1,000 (100%)** | **1,000 (100%)** | **0** | Strict zero auto-approval enforcement |

---

## 3. Comparison: Pilot (200 Units) vs Scale-Up (1,000 Units)

| Dimension | Pilot (Phase 6.2.20, n=200) | Scale-Up (Phase 6.2.21, n=1,000) | Rate Delta | Observed Yield Range |
| :--- | :---: | :---: | :---: | :--- |
| **Sample Size** | 200 | 1,000 | +800 | 5x scale-up factor |
| **Grounded Candidate Count** | 21 (10.5%) | 108 (10.8%) | +0.3% | Controlled consistency |
| **Candidate-Ready Count** | 21 (10.5%) | 108 (10.8%) | +0.3% | Real candidate-ready yield |
| **Special Syntax Count** | 19 (9.5%) | 93 (9.3%) | -0.2% | Closed-class segregation rate |
| **Unresolved Count** | 160 (80.0%) | 799 (79.9%) | -0.1% | Unresolved remaining |

> [!NOTE]
> **Observed Sample Yield Range:** `9.5%` to `10.8%`.  
> **Extrapolation Warning:** Observed rates are empirical results on controlled samples. They must NOT be treated as a statistical guarantee for the full 10,000 dataset.

---

## 4. Human-Review Queue Partitioning

The 1,000 learning units are partitioned into 5 dedicated review queues:

1. **Queue A: Candidate-Ready (108 units):**
   - High-confidence candidates passing POS, Sense, CEFR, and all structural gates.
   - Ready for lexicographer review in Phase 6.2.22.
2. **Queue B: Edit-Required (0 units):**
   - Units with register or register mismatch requiring gloss editing.
3. **Queue C: Hold (0 units):**
   - Polysemous conflicts requiring curriculum adjudication.
4. **Queue D: Special Syntax Review (93 units):**
   - Closed-class function words requiring syntactic complementation analysis.
5. **Queue E: Unresolved (799 units):**
   - Units awaiting further curated lexicon expansion.

---

## 5. Candidate-Ready Group Automated Quality Check

- **Inspected Count:** 108 units
- **Quality Status:** **PASSED (100% Clean)**
- **Checks Executed:**
  - Duplicate learning unit keys: 0
  - Missing provenance records: 0
  - Invalid candidate metadata: 0
  - POS inconsistencies: 0
  - Sense mismatches: 0
  - CEFR register drift: 0
  - Placeholder Thai text: 0
  - Synthetic Thai templates: 0
  - Unresolved IPA: 0

### Documented Gaps
- 103/108 candidate-ready units contain raw OEWN example sentences (lowercase start or lack of terminal punctuation) requiring lexicographer editing during Phase 6.2.22.

---

## 6. Pilot Decision Gate Classification

### **DECISION: `SCALEUP_VALIDATED`**
**Rationale:** `Scale-up on 1,000 controlled units demonstrated deterministic grounding (+104 grounded, +104 candidate-ready, 10.4% yield), 0 structural defects on candidate-ready group, clean closed-class segregation (93 units), and 5-tier review queue partitioning with zero production mutations.`  
**Recommended Next Phase:** `Proceed to Phase 6.2.22: Structured Human QA Execution on Candidate-Ready Queue & Closed-Class Syntactic Adjudication.`
