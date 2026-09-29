# Glova Content Completion Pipeline & Provenance Architecture

**Version**: 1.0.0-final  
**Date**: 2026-09-29  
**Specification Reference**: Glova Final Completion Phase  

---

## 1. Overview & Architecture

The Glova Content Completion Pipeline is an automated, multi-source ingestion, grounding, validation, and delivery system designed to support the entire learner journey across the 6 CEFR skill domains: Vocabulary, Grammar, Reading, Listening, Writing, and Speaking.

```
                              ┌──────────────────────────────────────────────┐
                              │           Acquired Lexical Sources            │
                              │ (CEFR-J, CMUDict, NGSL/NAWL, LEXiTRON,       │
                              │  Octanove, OEWN, Tatoeba, Wiktionary-OMW)    │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │          Unified Lexical Warehouse           │
                              │        `data/lexical-sources/...`            │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │       Grounding & Provenance Engine          │
                              │ - Morphology & POS alignment                 │
                              │ - CEFR Target Precedence:                    │
                              │   CEFR-J/Octanove > OEWN/NGSL > Platform     │
                              │ - IPA extraction (CMUDict/Wiktionary)        │
                              │ - Thai translation (LEXiTRON/OMW/Grounded)   │
                              │ - Contextual Collocations & Examples         │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │      Deterministic Validation Gate           │
                              │ (0 nulls, valid POS, CEFR A1-C2, valid IPA)  │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │        Learner Delivery Repositories         │
                              │ 1. Complete Universe: 10,021 learning units   │
                              │    (`data/vocabulary-universe-10k.json`)     │
                              │ 2. Curated Active Starter: 21 units          │
                              │    (`data/vocabularyBank.ts`)                │
                              │ 3. Database Migrations (Supabase Seeds)      │
                              └──────────────────────────────────────────────┘
```

---

## 2. Source Strategy & Legal Licensing

Glova adheres strictly to open, academic, and permissive lexical resources. Every unit maintains immutable source and licensing metadata in its provenance record:

| Source Name | Version / Release | Primary Fields Supplied | License |
|---|---|---|---|
| **CEFR-J** | 1.5 | Canonical lemmas, POS, CEFR levels (A1–B2) | CC BY-NC-SA 4.0 |
| **Octanove** | 1.0 | Advanced CEFR levels (C1–C2), word senses | CC BY-SA 4.0 |
| **OEWN (Open English WordNet)** | 2024 | English definitions, synsets, semantic relations | CC BY 4.0 |
| **LEXiTRON (NECTEC)** | 2.0 | Thai translation senses, POS mapping | NECTEC Open License |
| **Wiktionary-OMW** | 2024 | Thai synsets, cross-lingual sense alignment | CC BY-SA 3.0 / Open |
| **CMUdict** | 0.7b | IPA phonetic transcriptions, stress patterns | BSD 2-Clause |
| **Tatoeba** | 2024 | Bilingual example sentences (English + Thai) | CC BY 2.0 FR |
| **NGSL & NAWL** | 1.2 | Corpus frequency statistics & academic bands | CC BY-SA 4.0 |

---

## 3. Fallback & Controlled Generation Strategy

When a lexical unit lacks an exact sense translation or authentic sentence pairing from primary databases:
1. **Tier 1 (Exact Lexical Match)**: Direct lookup in CEFR-J + LEXiTRON + Tatoeba by lemma and part of speech.
2. **Tier 2 (Morphological & Synset Expansion)**: Stemming, inflections, and OEWN synset traversal to acquire nearest semantic equivalent.
3. **Tier 3 (Controlled Generation)**:
   - Used only when open sources lack coverage for rare advanced academic terms or domain-specific collocations.
   - Constrained by strict JSON schemas, CEFR-level vocabulary restriction, and deterministic validation.
   - Formally tagged in provenance with `generation_method: "controlled_batch_synthesis"`.

---

## 4. Token Efficiency & Caching Strategy

To prevent unnecessary API latency and eliminate redundant LLM token consumption:
- **Deterministic-First**: Over 95% of all vocabulary and structural data is compiled via offline deterministic Python/Node.js pipeline scripts.
- **Batch Processing**: Missing fields were synthesized in batches of 100 items per prompt using structured JSON output.
- **Content Hashing & Cache Keys**:
  ```
  CacheKey = SHA256(lemma + ":" + pos + ":" + cefr_level + ":" + pipeline_version)
  ```
  Unchanged records are never re-evaluated or re-synthesized.

---

## 5. Deterministic Validation Invariants

Before any record enters `vocabulary-universe-10k.json`, it must satisfy 100% of the following deterministic checks:
1. `lemma` must be non-empty string.
2. `part_of_speech` must belong to `['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'phrase']`.
3. `cefr_level` must match `/^[A-C][1-2]$/`.
4. `thai_definition` must contain valid Thai unicode characters (`\u0E00-\u0E7F`) without placeholder strings (`TBD`, `N/A`, `Unknown`).
5. `ipa` must conform to standard International Phonetic Alphabet characters and stress markers (`/ˈ.../`).
6. `examples` must contain at least 1 validated English sentence containing the target lemma or its inflected form, with matching Thai translation.
7. `provenance` must contain `source_name`, `license`, and `verified: true`.

---

## 6. Final Content Inventory Counts

| Domain | Total Units | Completeness | Storage Location |
|---|---|---|---|
| **Vocabulary Universe** | 10,021 | 100% (0 nulls) | `data/vocabulary-universe-10k.json` |
| **Curated Active Vocab Bank** | 21 | 100% | `data/vocabularyBank.ts` |
| **Approved Staging Vocab Bank** | 62 | 100% | `data/lexical-sources/...` |
| **Grammar Topics** | 12 | 100% | `components/views/GrammarView.tsx` & Supabase |
| **Reading Passages** | 5 | 100% | `components/views/ReadingView.tsx` & Supabase |
| **Listening Exercises** | 5 | 100% | `components/views/ListeningView.tsx` & Supabase |
| **Writing Prompts** | 4 | 100% | `components/views/WritingView.tsx` & Supabase |
| **Speaking Scenarios** | 5 | 100% | `components/views/SpeakingView.tsx` & Supabase |
| **Practice Question Bank** | 150+ | 100% | Supabase `questions` & local fallbacks |
| **Mock Exams** | 3 (A2, B1, B2) | 100% | `data/mockExams.ts` & Supabase |

---

## 7. Quality Assurance & Regression Test Suites

- `tests/vocabulary-tier1-qa.test.ts` (220 tests): Human QA reconciliation, sense consistency, and phonetics.
- `tests/glova-design-system.test.ts` (71 tests): Glova UI component variants, props, and accessibility.
- `tests/glova-learning-flow-qa.test.tsx` (15 tests): End-to-end learner journey, anti-parenthetical checks (Rule 3), and bot header ban (Rule 5.0).
- `tests/mock-exam.test.ts` (25 tests): Mock exam engine timing, autosave, grading, and Cambridge scale mapping.
- Next.js production compiler: **40/40 routes compiled cleanly with 0 TypeScript errors**.

---

## 8. Known Unavoidable Limitations

1. **Platform Diagnostic Disclaimer**: As required by product policy, CEFR level assignments and Cambridge scale score projections are internal platform heuristics and are clearly disclaimed as non-official test equivalencies.
2. **Audio Streaming**: In local offline development environments without remote Supabase storage credentials, listening audio falls back to local Web Audio synthesis or static WAV assets.
