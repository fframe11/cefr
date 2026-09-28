# Glova Vocabulary Pilot 180 — Offline Enrichment & QA Report (Phase 6.2.9)

- **Total Pilot Records:** `180` (`30` per CEFR level `A1–C2`)
- **Pilot Integrity Gate:** `PASS` (`0` duplicates, `100%` valid CEFR/POS, `100%` provenance completeness)
- **Runtime LLM Dependency:** `NONE (0 runtime calls)`
- **Learner Content Fabrication:** `0` fabricated fields (all unverified fields remain `null` with `lifecycle_status = REVIEW_REQUIRED`)

---

## 1. Pilot 180 Summary Metrics

| Metric | Count | Percentage | Status / Notes |
|---|---:|---:|---|
| **Total Pilot Vocabulary** | `180` | `100.00%` | Exactly 30 per level (`A1–C2`) |
| **Sense: `MATCH_CONFIDENT`** | `90` | `50.00%` | Unambiguous OEWN 2024 sense or deterministic note/topic disambiguation |
| **Sense: `MATCH_AMBIGUOUS`** | `46` | `25.56%` | Multi-sense OEWN words preserved with `RECOMMENDED_NOT_APPROVED` sense suggestion |
| **Sense: `NO_MATCH`** | `30` | `16.67%` | Closed-class grammatical POS or absent from OEWN 2024 |
| **Sense: `REVIEW_REQUIRED` (CEFR Conflict)** | `14` | `7.78%` | Cross-source or intra-source CEFR level conflicts |
| **Enriched `meaning_en` (OEWN 2024 `CC BY 4.0`)** | `90` | `50.00%` | Populated only for `MATCH_CONFIDENT` synsets |
| **Missing `meaning_en`** | `90` | `50.00%` | Requires human sense selection or closed-class gloss |
| **Enriched `phonetic_ipa` (CMUdict 0.7b `BSD-2-Clause`)** | `177` | `98.33%` | Real ARPAbet-to-IPA conversion with variant/heteronym tracking |
| **Missing `phonetic_ipa`** | `3` | `1.67%` | Absent from CMUdict 0.7b; left `null` (`UNRESOLVED`) |
| **Enriched `example_sentence` (OEWN 2024 `CC BY 4.0`)** | `49` | `27.22%` | Attested OEWN examples containing target word/inflection |
| **Missing `example_sentence`** | `131` | `72.78%` | Synset had no quoted example with target word or sense ambiguous |
| **Missing `meaning_th`** | `180` | `100.00%` | Not fabricated; awaits offline translation + human SME review |
| **Provenance Completeness** | `180 / 180` | `100.00%` | Every record carries source, version, license, original_id, and transformation history |
| **Structural QA Gate Passed** | `180 / 180` | `100.00%` | `0` structural/security QA failures |
| **Lifecycle Status = `REVIEW_REQUIRED`** | `180 / 180` | `100.00%` | `0` auto-promoted to `ACTIVE` before Human QA |

---

## 2. Breakdown by CEFR Level (`30` per Level)

| CEFR Level | Total | `MATCH_CONFIDENT` | `MATCH_AMBIGUOUS` | `NO_MATCH` | `REVIEW_REQUIRED` (Conflict) | `meaning_en` Present | `phonetic_ipa` Present | `example_sentence` Present | Missing `meaning_th` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **A1** | `30` | `14` | `7` | `8` | `1` | `14` | `29` | `9` | `30` |
| **A2** | `30` | `13` | `10` | `5` | `2` | `13` | `30` | `6` | `30` |
| **B1** | `30` | `12` | `9` | `5` | `4` | `12` | `30` | `5` | `30` |
| **B2** | `30` | `15` | `5` | `5` | `5` | `15` | `30` | `6` | `30` |
| **C1** | `30` | `17` | `8` | `3` | `2` | `17` | `30` | `11` | `30` |
| **C2** | `30` | `19` | `7` | `4` | `0` | `19` | `28` | `12` | `30` |

---

## 3. Automated QA Gate Reasons Breakdown

| QA Reason Code | Record Count | Gate Action |
|---|---:|---|
| `MEANING_MISSING_TH` | `180` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `EXAMPLE_MISSING_EN` | `131` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `MEANING_MISSING_EN` | `90` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `SENSE_AMBIGUOUS_REQUIRES_HUMAN_SELECTION` | `46` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `SENSE_NO_OEWN_MATCH` | `30` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `SENSE_DISAMBIGUATION_REVIEW_REQUIRED` | `14` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `CEFR_CONFLICTING_EVIDENCE:CROSS_SOURCE_CEFR_CONFLICT` | `12` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `IPA_COMPOSITE_OR_VARIANT_REQUIRES_REVIEW` | `4` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `IPA_MISSING` | `3` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `CEFR_CONFLICTING_EVIDENCE:INTRA_SOURCE_CEFR_CONFLICT` | `2` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `EXAMPLE_CONTAINS_ABOVE_LEVEL_VOCABULARY` | `1` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |
| `IPA_HETERONYM_REQUIRES_POS_SENSE_REVIEW` | `1` | Keep `lifecycle_status = REVIEW_REQUIRED` (`is_active = false`) |

---

## 4. Sample Disambiguated & Enriched Pilot Records

```json
[
  {
    "candidate_id": "vocab_883409085bf37dbe",
    "pilot_uuid": "a0000000-0000-4001-8100-000000000006",
    "pilot_sequence": 6,
    "word_entry_key": "airplane|noun",
    "learning_unit_key": "airplane|noun|A1|sense:1",
    "word": "airplane",
    "lemma": "airplane",
    "raw_headword": "airplane/aeroplane",
    "orthographic_variants": [
      "airplane",
      "aeroplane"
    ],
    "part_of_speech": "noun",
    "raw_part_of_speech": "noun",
    "cefr_level": "A1",
    "sense_index": 1,
    "sense_key": "airplane%1:06:00::",
    "oewn_synset_id": "02735253-n",
    "sense_disambiguation_status": "MATCH_CONFIDENT",
    "sense_disambiguation_rule": "MONOSEMOUS_OEWN_1_TO_1_SENSE",
    "sense_disambiguation_evidence": {
      "oewn_candidate_count": 1,
      "lex_domain": "noun.artifact"
    },
    "candidate_senses_preview": [
      {
        "sense_key": "airplane%1:06:00::",
        "synset_id": "02735253-n",
        "lex_domain": "noun.artifact",
        "definition": "an aircraft that has a fixed wing and is powered by propellers or jets",
        "examples": [
          "the flight was delayed due to trouble with the airplane"
        ]
      }
    ],
    "meaning_en": "an aircraft that has a fixed wing and is powered by propellers or jets",
    "meaning_source": "oewn_2024",
    "meaning_source_version": "2024",
    "meaning_generation_method": "deterministic_oewn_synset_gloss",
    "meaning_review_status": "SOURCE_VERIFIED",
    "meaning_th": null,
    "translation_method": null,
    "translation_version": null,
    "translation_review_status": "MISSING_READY_FOR_SENSE_TRANSLATION",
    "phonetic_ipa": "/ˈeɹpˌleɪn/",
    "pronunciation_source": "cmudict",
    "pronunciation_source_version": "0.7b",
    "pronunciation_confidence": "HIGH_SINGLE_ENTRY",
    "pronunciation_review_status": "SOURCE_VERIFIED",
    "pronunciation_variants_ipa": [
      "/ˈeɹpˌleɪn/"
    ],
    "example_sentence": "the flight was delayed due to trouble with the airplane",
    "example_sentence_th": null,
    "example_generation_method": "oewn_2024_quoted_synset_example",
    "example_source": "oewn_2024",
    "example_version": "2024",
    "example_review_status": "SOURCE_VERIFIED",
    "topic": "Ways of travelling",
    "source_note": "Ways of travelling | Travel",
    "synonyms": [
      "aeroplane",
      "plane"
    ],
    "antonyms": [],
    "collocation_refs": [],
    "frequency_rank": 893,
    "frequency_source": "NAWL_1.2",
    "frequency_sfi": 46.596,
    "frequency_per_million": 5,
    "frequency_match_status": "matched_exact_lemma",
    "conflict_status": "NONE",
    "conflict_resolution_type": "NO_CONFLICT",
    "conflicting_cefr_levels": [],
    "conflicting_entries": [],
    "provenance": {
      "source": "cefr_j",
      "source_name": "CEFR-J Vocabulary Profile",
      "source_version": "1.5",
      "source_url": "http://www.cefr-j.org/download.html",
      "download_url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv",
      "license": "TUFS-CEFR-J-Permissive",
      "license_url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/README.md",
      "attribution": "The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tono Laboratory, Tokyo University of Foreign Studies (TUFS).",
      "original_id": "cefr_j:v1.5:line:183",
      "merged_original_ids": [
        "cefr_j:v1.5:line:183"
      ],
      "import_batch": "batch-2026-09-26-phase-6.2.7-v1",
      "transformation_method": "unicode_nfc+trim_whitespace+lowercase_lemma+split_slash_variants+freq_join:NAWL_1.2+oewn_unambiguous_sense_matched+offline_enrich:phase-6.2.10-v1",
      "frequency_source": "NAWL_1.2",
      "frequency_match_status": "matched_exact_lemma",
      "oewn_source_version": "OEWN-2024",
      "oewn_match_status": "matched",
      "conflict_status": "NONE",
      "conflicting_cefr_levels": [],
      "conflicting_entries": [],
      "enrichment_version": "phase-6.2.10-v1",
      "sense_disambiguation_status": "MATCH_CONFIDENT",
      "sense_disambiguation_rule": "MONOSEMOUS_OEWN_1_TO_1_SENSE",
      "meaning_en_provenance": {
        "status": "VERIFIED_SOURCE_GLOSS",
        "source": "oewn_2024",
        "source_name": "Open English WordNet 2024",
        "synset_id": "02735253-n",
        "sense_key": "airplane%1:06:00::",
        "license": "CC-BY-4.0",
        "method": "deterministic_oewn_synset_gloss"
      },
      "meaning_th_provenance": {
        "status": "MISSING_REQUIRES_HUMAN_TRANSLATION",
        "source_meaning": "an aircraft that has a fixed wing and is powered by propellers or jets",
        "translation_method": null,
        "generated_or_translated_status": "NOT_GENERATED"
      },
      "ipa_provenance": {
        "status": "VERIFIED_LICENSED_IPA",
        "source": "cmudict",
        "source_name": "CMU Pronouncing Dictionary (CMUdict)",
        "source_version": "0.7b",
        "license": "BSD-2-Clause",
        "original_id": "cmudict:0.7b:airplane:line:390",
        "arpabet": "EH1 R P L EY2 N",
        "variants_ipa": [
          "/ˈeɹpˌleɪn/"
        ],
        "transformation_method": "cmudict_arpabet_to_ipa_v1"
      },
      "example_provenance": {
        "status": "VERIFIED_SOURCE_EXAMPLE",
        "source": "oewn_2024",
        "source_name": "Open English WordNet 2024",
        "synset_id": "02735253-n",
        "license": "CC-BY-4.0",
        "is_original_generated": false,
        "cefr_certified": false,
        "above_level_words": []
      }
    },
    "lifecycle_status": "REVIEW_REQUIRED",
    "is_active": false,
    "qa_status": "REVIEW_REQUIRED",
    "qa_reasons": [
      "MEANING_MISSING_TH"
    ],
    "qa_checks": {
      "identity_ok": true,
      "cefr_ok": true,
      "pos_ok": true,
      "meaning_en_present": true,
      "meaning_th_present": false,
      "ipa_present": true,
      "example_present": true,
      "provenance_ok": true,
      "lifecycle_ok": true,
      "security_ok": true
    },
    "sense_resolution": {
      "resolution_state": "RESOLVED_CONFIDENT",
      "requires_human_sense_selection": false,
      "no_match_category": null,
      "conflict_category": null,
      "reason_for_ambiguity": null,
      "recommended_sense": {
        "sense_key": "airplane%1:06:00::",
        "synset_id": "02735253-n",
        "definition": "an aircraft that has a fixed wing and is powered by propellers or jets",
        "recommendation_type": "DETERMINISTIC_EVIDENCE_MATCH",
        "approval_state": "SOURCE_MATCHED_PENDING_FINAL_QA"
      },
      "recommended_evidence": {
        "oewn_candidate_count": 1,
        "lex_domain": "noun.artifact"
      }
    },
    "priority_score": 91,
    "priority_tier": "TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED",
    "priority_breakdown": {
      "sense_confidence": 30,
      "frequency": 16,
      "cefr_learner_value": 15,
      "meaning_en_ready": 12,
      "example_ready": 8,
      "pronunciation_ready": 5,
      "provenance_clean": 5
    }
  },
  {
    "candidate_id": "vocab_cd01182f935cd166",
    "pilot_uuid": "a0000000-0000-4001-8100-000000000011",
    "pilot_sequence": 11,
    "word_entry_key": "rain|verb",
    "learning_unit_key": "rain|verb|A1|sense:1",
    "word": "rain",
    "lemma": "rain",
    "raw_headword": "rain",
    "orthographic_variants": [
      "rain"
    ],
    "part_of_speech": "verb",
    "raw_part_of_speech": "verb",
    "cefr_level": "A1",
    "sense_index": 1,
    "sense_key": "rain%2:43:00::",
    "oewn_synset_id": "02842195-v",
    "sense_disambiguation_status": "MATCH_CONFIDENT",
    "sense_disambiguation_rule": "MONOSEMOUS_OEWN_1_TO_1_SENSE",
    "sense_disambiguation_evidence": {
      "oewn_candidate_count": 1,
      "lex_domain": "verb.weather"
    },
    "candidate_senses_preview": [
      {
        "sense_key": "rain%2:43:00::",
        "synset_id": "02842195-v",
        "lex_domain": "verb.weather",
        "definition": "precipitate as rain",
        "examples": [
          "If it rains much more, we can expect some flooding"
        ]
      }
    ],
    "meaning_en": "precipitate as rain",
    "meaning_source": "oewn_2024",
    "meaning_source_version": "2024",
    "meaning_generation_method": "deterministic_oewn_synset_gloss",
    "meaning_review_status": "SOURCE_VERIFIED",
    "meaning_th": null,
    "translation_method": null,
    "translation_version": null,
    "translation_review_status": "MISSING_READY_FOR_SENSE_TRANSLATION",
    "phonetic_ipa": "/ɹeɪn/",
    "pronunciation_source": "cmudict",
    "pronunciation_source_version": "0.7b",
    "pronunciation_confidence": "HIGH_SINGLE_ENTRY",
    "pronunciation_review_status": "SOURCE_VERIFIED",
    "pronunciation_variants_ipa": [
      "/ɹeɪn/"
    ],
    "example_sentence": "If it rains much more, we can expect some flooding",
    "example_sentence_th": null,
    "example_generation_method": "oewn_2024_quoted_synset_example",
    "example_source": "oewn_2024",
    "example_version": "2024",
    "example_review_status": "SOURCE_VERIFIED",
    "topic": null,
    "source_note": null,
    "synonyms": [
      "rain down"
    ],
    "antonyms": [],
    "collocation_refs": [],
    "frequency_rank": 1232,
    "frequency_source": "NGSL_1.2",
    "frequency_sfi": 58.52,
    "frequency_per_million": 71,
    "frequency_match_status": "matched_exact_lemma",
    "conflict_status": "NONE",
    "conflict_resolution_type": "NO_CONFLICT",
    "conflicting_cefr_levels": [],
    "conflicting_entries": [],
    "provenance": {
      "source": "cefr_j",
      "source_name": "CEFR-J Vocabulary Profile",
      "source_version": "1.5",
      "source_url": "http://www.cefr-j.org/download.html",
      "download_url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv",
      "license": "TUFS-CEFR-J-Permissive",
      "license_url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/README.md",
      "attribution": "The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tono Laboratory, Tokyo University of Foreign Studies (TUFS).",
      "original_id": "cefr_j:v1.5:line:5459",
      "merged_original_ids": [
        "cefr_j:v1.5:line:5459"
      ],
      "import_batch": "batch-2026-09-26-phase-6.2.7-v1",
      "transformation_method": "unicode_nfc+trim_whitespace+lowercase_lemma+freq_join:NGSL_1.2+oewn_unambiguous_sense_matched+offline_enrich:phase-6.2.10-v1",
      "frequency_source": "NGSL_1.2",
      "frequency_match_status": "matched_exact_lemma",
      "oewn_source_version": "OEWN-2024",
      "oewn_match_status": "matched",
      "conflict_status": "NONE",
      "conflicting_cefr_levels": [],
      "conflicting_entries": [],
      "enrichment_version": "phase-6.2.10-v1",
      "sense_disambiguation_status": "MATCH_CONFIDENT",
      "sense_disambiguation_rule": "MONOSEMOUS_OEWN_1_TO_1_SENSE",
      "meaning_en_provenance": {
        "status": "VERIFIED_SOURCE_GLOSS",
        "source": "oewn_2024",
        "source_name": "Open English WordNet 2024",
        "synset_id": "02842195-v",
        "sense_key": "rain%2:43:00::",
        "license": "CC-BY-4.0",
        "method": "deterministic_oewn_synset_gloss"
      },
      "meaning_th_provenance": {
        "status": "MISSING_REQUIRES_HUMAN_TRANSLATION",
        "source_meaning": "precipitate as rain",
        "translation_method": null,
        "generated_or_translated_status": "NOT_GENERATED"
      },
      "ipa_provenance": {
        "status": "VERIFIED_LICENSED_IPA",
        "source": "cmudict",
        "source_name": "CMU Pronouncing Dictionary (CMUdict)",
        "source_version": "0.7b",
        "license": "BSD-2-Clause",
        "original_id": "cmudict:0.7b:rain:line:6941",
        "arpabet": "R EY1 N",
        "variants_ipa": [
          "/ɹeɪn/"
        ],
        "transformation_method": "cmudict_arpabet_to_ipa_v1"
      },
      "example_provenance": {
        "status": "VERIFIED_SOURCE_EXAMPLE",
        "source": "oewn_2024",
        "source_name": "Open English WordNet 2024",
        "synset_id": "02842195-v",
        "license": "CC-BY-4.0",
        "is_original_generated": false,
        "cefr_certified": false,
        "above_level_words": []
      }
    },
    "lifecycle_status": "REVIEW_REQUIRED",
    "is_active": false,
    "qa_status": "REVIEW_REQUIRED",
    "qa_reasons": [
      "MEANING_MISSING_TH"
    ],
    "qa_checks": {
      "identity_ok": true,
      "cefr_ok": true,
      "pos_ok": true,
      "meaning_en_present": true,
      "meaning_th_present": false,
      "ipa_present": true,
      "example_present": true,
      "provenance_ok": true,
      "lifecycle_ok": true,
      "security_ok": true
    },
    "sense_resolution": {
      "resolution_state": "RESOLVED_CONFIDENT",
      "requires_human_sense_selection": false,
      "no_match_category": null,
      "conflict_category": null,
      "reason_for_ambiguity": null,
      "recommended_sense": {
        "sense_key": "rain%2:43:00::",
        "synset_id": "02842195-v",
        "definition": "precipitate as rain",
        "recommendation_type": "DETERMINISTIC_EVIDENCE_MATCH",
        "approval_state": "SOURCE_MATCHED_PENDING_FINAL_QA"
      },
      "recommended_evidence": {
        "oewn_candidate_count": 1,
        "lex_domain": "verb.weather"
      }
    },
    "priority_score": 95,
    "priority_tier": "TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED",
    "priority_breakdown": {
      "sense_confidence": 30,
      "frequency": 20,
      "cefr_learner_value": 15,
      "meaning_en_ready": 12,
      "example_ready": 8,
      "pronunciation_ready": 5,
      "provenance_clean": 5
    }
  },
  {
    "candidate_id": "vocab_260f9e51cc8dffe5",
    "pilot_uuid": "a0000000-0000-4001-8100-000000000012",
    "pilot_sequence": 12,
    "word_entry_key": "excellent|adjective",
    "learning_unit_key": "excellent|adjective|A1|sense:1",
    "word": "excellent",
    "lemma": "excellent",
    "raw_headword": "excellent",
    "orthographic_variants": [
      "excellent"
    ],
    "part_of_speech": "adjective",
    "raw_part_of_speech": "adjective",
    "cefr_level": "A1",
    "sense_index": 1,
    "sense_key": "excellent%5:00:00:superior:02",
    "oewn_synset_id": "02358281-s",
    "sense_disambiguation_status": "MATCH_CONFIDENT",
    "sense_disambiguation_rule": "MONOSEMOUS_OEWN_1_TO_1_SENSE",
    "sense_disambiguation_evidence": {
      "oewn_candidate_count": 1,
      "lex_domain": "adj.all"
    },
    "candidate_senses_preview": [
      {
        "sense_key": "excellent%5:00:00:superior:02",
        "synset_id": "02358281-s",
        "lex_domain": "adj.all",
        "definition": "very good; of the highest quality",
        "examples": [
          "made an excellent speech",
          "he was a splendid teacher"
        ]
      }
    ],
    "meaning_en": "very good; of the highest quality",
    "meaning_source": "oewn_2024",
    "meaning_source_version": "2024",
    "meaning_generation_method": "deterministic_oewn_synset_gloss",
    "meaning_review_status": "SOURCE_VERIFIED",
    "meaning_th": null,
    "translation_method": null,
    "translation_version": null,
    "translation_review_status": "MISSING_READY_FOR_SENSE_TRANSLATION",
    "phonetic_ipa": "/ˈeksələnt/",
    "pronunciation_source": "cmudict",
    "pronunciation_source_version": "0.7b",
    "pronunciation_confidence": "HIGH_SINGLE_ENTRY",
    "pronunciation_review_status": "SOURCE_VERIFIED",
    "pronunciation_variants_ipa": [
      "/ˈeksələnt/"
    ],
    "example_sentence": "made an excellent speech",
    "example_sentence_th": null,
    "example_generation_method": "oewn_2024_quoted_synset_example",
    "example_source": "oewn_2024",
    "example_version": "2024",
    "example_review_status": "SOURCE_VERIFIED",
    "topic": null,
    "source_note": null,
    "synonyms": [
      "first-class",
      "fantabulous",
      "splendid",
      "ripping",
      "mean"
    ],
    "antonyms": [],
    "collocation_refs": [],
    "frequency_rank": 1163,
    "frequency_source": "NGSL_1.2",
    "frequency_sfi": 58.81,
    "frequency_per_million": 76,
    "frequency_match_status": "matched_exact_lemma",
    "conflict_status": "NONE",
    "conflict_resolution_type": "NO_CONFLICT",
    "conflicting_cefr_levels": [],
    "conflicting_entries": [],
    "provenance": {
      "source": "cefr_j",
      "source_name": "CEFR-J Vocabulary Profile",
      "source_version": "1.5",
      "source_url": "http://www.cefr-j.org/download.html",
      "download_url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv",
      "license": "TUFS-CEFR-J-Permissive",
      "license_url": "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/README.md",
      "attribution": "The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tono Laboratory, Tokyo University of Foreign Studies (TUFS).",
      "original_id": "cefr_j:v1.5:line:2371",
      "merged_original_ids": [
        "cefr_j:v1.5:line:2371"
      ],
      "import_batch": "batch-2026-09-26-phase-6.2.7-v1",
      "transformation_method": "unicode_nfc+trim_whitespace+lowercase_lemma+freq_join:NGSL_1.2+oewn_unambiguous_sense_matched+offline_enrich:phase-6.2.10-v1",
      "frequency_source": "NGSL_1.2",
      "frequency_match_status": "matched_exact_lemma",
      "oewn_source_version": "OEWN-2024",
      "oewn_match_status": "matched",
      "conflict_status": "NONE",
      "conflicting_cefr_levels": [],
      "conflicting_entries": [],
      "enrichment_version": "phase-6.2.10-v1",
      "sense_disambiguation_status": "MATCH_CONFIDENT",
      "sense_disambiguation_rule": "MONOSEMOUS_OEWN_1_TO_1_SENSE",
      "meaning_en_provenance": {
        "status": "VERIFIED_SOURCE_GLOSS",
        "source": "oewn_2024",
        "source_name": "Open English WordNet 2024",
        "synset_id": "02358281-s",
        "sense_key": "excellent%5:00:00:superior:02",
        "license": "CC-BY-4.0",
        "method": "deterministic_oewn_synset_gloss"
      },
      "meaning_th_provenance": {
        "status": "MISSING_REQUIRES_HUMAN_TRANSLATION",
        "source_meaning": "very good; of the highest quality",
        "translation_method": null,
        "generated_or_translated_status": "NOT_GENERATED"
      },
      "ipa_provenance": {
        "status": "VERIFIED_LICENSED_IPA",
        "source": "cmudict",
        "source_name": "CMU Pronouncing Dictionary (CMUdict)",
        "source_version": "0.7b",
        "license": "BSD-2-Clause",
        "original_id": "cmudict:0.7b:excellent:line:3229",
        "arpabet": "EH1 K S AH0 L AH0 N T",
        "variants_ipa": [
          "/ˈeksələnt/"
        ],
        "transformation_method": "cmudict_arpabet_to_ipa_v1"
      },
      "example_provenance": {
        "status": "VERIFIED_SOURCE_EXAMPLE",
        "source": "oewn_2024",
        "source_name": "Open English WordNet 2024",
        "synset_id": "02358281-s",
        "license": "CC-BY-4.0",
        "is_original_generated": false,
        "cefr_certified": false,
        "above_level_words": []
      }
    },
    "lifecycle_status": "REVIEW_REQUIRED",
    "is_active": false,
    "qa_status": "REVIEW_REQUIRED",
    "qa_reasons": [
      "MEANING_MISSING_TH"
    ],
    "qa_checks": {
      "identity_ok": true,
      "cefr_ok": true,
      "pos_ok": true,
      "meaning_en_present": true,
      "meaning_th_present": false,
      "ipa_present": true,
      "example_present": true,
      "provenance_ok": true,
      "lifecycle_ok": true,
      "security_ok": true
    },
    "sense_resolution": {
      "resolution_state": "RESOLVED_CONFIDENT",
      "requires_human_sense_selection": false,
      "no_match_category": null,
      "conflict_category": null,
      "reason_for_ambiguity": null,
      "recommended_sense": {
        "sense_key": "excellent%5:00:00:superior:02",
        "synset_id": "02358281-s",
        "definition": "very good; of the highest quality",
        "recommendation_type": "DETERMINISTIC_EVIDENCE_MATCH",
        "approval_state": "SOURCE_MATCHED_PENDING_FINAL_QA"
      },
      "recommended_evidence": {
        "oewn_candidate_count": 1,
        "lex_domain": "adj.all"
      }
    },
    "priority_score": 95,
    "priority_tier": "TIER_1_FAST_TRACK_SENSE_AND_IPA_LOCKED",
    "priority_breakdown": {
      "sense_confidence": 30,
      "frequency": 20,
      "cefr_learner_value": 15,
      "meaning_en_ready": 12,
      "example_ready": 8,
      "pronunciation_ready": 5,
      "provenance_clean": 5
    }
  }
]
```
