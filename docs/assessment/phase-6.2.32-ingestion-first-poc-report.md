# Phase 6.2.32 — Ingestion-First Evidence Candidate Assembly POC Report

## Executive Summary & A/B Comparison Baseline

- **Total POC Records**: 100 (Identical 100-word manifest reused from Phase 6.2.31)
- **Assembly Method**: Deterministic Ingestion-First Candidate Assembly (Zero LLM Hallucination)
- **Gate Verdict**: **PASS**
- **Safety Invariant**: Strictly 83 learner-ready units maintained, 0 production DB writes, 0 activations.

### A/B Comparison Table: Legacy Staging vs Ingestion-First Assembly

| Metric / Dimension | Phase 6.2.31 Legacy Staging (AI Drafts) | Phase 6.2.32 Evidence Assembly | Empirical Delta | Status |
|---|---|---|---|---|
| **AUTO_READY** | **3 (3.0%)** | **39 (39.0%)** | **+36 (+36.0%)** | **13x Empirical Improvement** |
| **REVIEW_REQUIRED** | 4 (4.0%) | 21 (21.0%) | +17 (+17.0%) | Actionable Human Adjudication |
| **HOLD** | **93 (93.0%)** | **40 (40.0%)** | **-53 (-53.0%)** | **Massive Hold Reduction** |
| **Thai Conflicts** | **86 (86.0%)** | **0 (0.0%)** | **-86 (-86.0%)** | **100% Elimination of Thai Conflicts** |
| **Thai Grounded** | 6 (6.0%) | 68 (68.0%) | +62 | Direct LEXiTRON Grounding |
| **Thai Multi-Sense** | 5 (5.0%) | 28 (28.0%) | +23 | Clean Multi-Sense Routing |
| **Example Aligned** | 60 (60.0%) | 66 (66.0%) | +6 | Attested OEWN Sentences |
| **Example Conflict** | 24 (24.0%) | 27 (27.0%) | 3 | Inflection / Synonym Synset Usage |

---

## Detailed Dimension Breakdown

### 1. Sense Alignment
- SENSE_ALIGNED: 100
- SENSE_CANDIDATE: 0
- SENSE_AMBIGUOUS: 0
- SENSE_CONFLICT: 0

### 2. Thai Meaning Alignment
- THAI_GROUNDED: 68
- THAI_MULTI_SENSE: 28
- THAI_CONFLICT: 0 (Completely eliminated from 86 down to 0)
- THAI_MISSING: 4 (Rare C2 headwords missing from LEXiTRON)

### 3. IPA Pronunciation Alignment
- IPA_CONFIRMED: 97
- IPA_MULTI_VARIANT: 3
- IPA_AMBIGUOUS: 0

### 4. Example Alignment
- EXAMPLE_ALIGNED: 66
- EXAMPLE_CANDIDATE: 0
- EXAMPLE_CONFLICT: 27
- EXAMPLE_MISSING: 7

---

## Primary Root Causes of Remaining HOLD Records (40 Records)

1. **Morphological Inflections in Attested Examples (28 records)**:
   - WordNet attested examples naturally use inflected forms (e.g. *days*, *danced*, *purchased*, *felt*), whereas the rigid exact regex checks `\bword\b`.
2. **Missing Attested Examples in OEWN (7 records)**:
   - Specific lemmas in OEWN 2024 do not contain illustrative sentences.
3. **C2 Headwords Missing in LEXiTRON (4 records)**:
   - Extreme vocabulary (e.g. *aberration*, *abysmal*, *anachronism*) absent from LEXiTRON 2.0.
4. **CEFR Discrepancy (2 records)**:
   - Target level divergence against CEFR-J profile.

---

## Production Safety Invariants
- Production Supabase Writes: 0
- Vocabulary Promotions / Activations: 0
- Learner-Ready Units: 83 (Unchanged: 21 Active DB + 62 Approved Staging)
- Overall Readiness Status: NOT_READY
- User Testing Authorized: false
