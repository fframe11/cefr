# External Corpus Coverage After Acquisition (10,021 Universe)

**Generated:** 2026-09-28T11:53:40.822Z  
**Status:** `FULL_CORPUS_ACQUISITION_SUCCESS`  

---

## 1. Updated Source Manifest

### Tatoeba Collaborative Translation Corpus
- **Release Version:** `2024.09 Export`
- **Retrieval Date:** `2026-09-28`
- **Download URL:** `https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2`
- **SHA-256 Checksum:** `f0568ae34496f8a03758ce6821b68da04b1fe67a9300de8d26d50494ae5aceab`
- **License:** `CC-BY-2.0-FR`
- **Total Raw Sentences:** 2,037,522
- **Candidates Indexed:** 24,522
- **Unique Universe Lemmas Covered:** 8,309 / 8,776 (94.68%)

### Kaikki Wiktionary English-Thai
- **Release Version:** `2024.09 Dump`
- **Retrieval Date:** `2026-09-28`
- **Download URL:** `https://kaikki.org/dictionary/Thai/kaikki.org-dictionary-Thai.jsonl`
- **SHA-256 Checksum:** `202acdc93b99bfeb240d48ee48a9f520160a85aa951ecb653eeb3d93b0b6fb57`
- **License:** `CC-BY-SA-3.0`
- **Total Raw Entries:** 21,020
- **Records Indexed:** 17,371
- **Unique Universe Lemmas Covered:** 4,909 / 8,776 (55.94%)

---

## 2. Universe Primary Blocker Distribution (Post-Acquisition)

| Primary Blocker | Units Count | Percentage |
|---|---|---|
| **NONE (AUTO_CANDIDATE)** | 641 | 6.40% |
| **EXAMPLE_NOT_FOUND** | 172 | 1.72% |
| **SEMANTIC_NO_EVIDENCE** | 5,562 | 55.50% |
| **THAI_NOT_FOUND** | 1,238 | 12.35% |
| **POLYSEMY_UNRESOLVED** | 2,246 | 22.41% |
| **CEFR_CONFLICT** | 100 | 1.00% |
| **SENSE_NOT_FOUND** | 56 | 0.56% |

---

## 3. Data Integrity & Redundancy

- Both raw external corpus archives reside strictly in gitignored directories (`data/external-cache/`).
- All candidate indexes preserve source sentence IDs, timestamps, licenses, and SHA-256 integrity hashes.
- Zero AI-generated text or hallucinated translations were accepted into the evidence warehouse.
