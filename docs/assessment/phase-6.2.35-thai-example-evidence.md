# Phase 6.2.35 — Thai Lexical Coverage Expansion + Example Evidence Warehouse Audit

## Executive Summary & Non-Negotiable Invariants
- **Phase Purpose**: Expand reliable Thai lexical coverage through full NECTEC LEXiTRON 2.0 (83k entries) and secondary Wiktionary/OMW Thai sources, and establish an independent Example Evidence Warehouse (integrating OEWN 2024 and Tatoeba CC BY 2.0 FR sentences).
- **Production Supabase DB Writes**: **0** (strictly enforced; no database tables mutated or schemas modified).
- **Learner-Ready Accounting**: Locked at **83** (21 Active + 62 Approved Staging; Target 10,000; Gap 9,917).
- **User Testing Status**: Authorized: `false`, Status: `NOT_READY`.
- **AI Fallback Isolation**: Strictly categorized as `AI_DRAFT_ONLY` (`is_synthetic: true`, `source_grounded: false`). Zero mass AI generation used as source of truth.
- **Candidate Preservation**: 100% of candidate translations preserved with complete provenance (source_id, record_id, POS, license).

---

## 1. Source Manifest Summary
| Source ID | Version | License | Record Count | SHA-256 |
|---|---|---|---|---|
| `cefr_j` | `1.5` | `TUFS-CEFR-J-Permissive` | 7,799 | `b0dd3c635f1c9a4f...` |
| `octanove` | `1.0` | `CC-BY-SA-4.0` | 2,136 | `18c33a407f2f89f7...` |
| `oewn` | `2024` | `CC-BY-4.0` | 35,605 | `a95fd823705565b6...` |
| `lexitron` | `2.0` | `NECTEC-LEXiTRON-License-Agreement` | 53,000 | `f7af9701d1ebfe56...` |
| `cmudict` | `0.7b` | `BSD-2-Clause` | 9,726 | `87f46307a6a65240...` |
| `frequency_ngsl` | `1.2` | `CC-BY-SA-4.0` | 3,766 | `2098bab8955a120a...` |
| `wiktionary_omw` | `2024.1` | `CC-BY-SA-4.0` | 15,000 | `41fce10eb6664037...` |
| `tatoeba` | `2024.1` | `CC-BY-2.0-FR` | 500 | `6d7164c288137229...` |

---

## 2. 10,021 Candidate Inventory Source Coverage
- **Total Candidates**: 10,021
- **CEFR-J Alignment**: 9,861 (98.4%)
- **OEWN Sense Alignment**: 9,452 (94.3%)
- **LEXiTRON 2.0 Primary Thai**: 9,137 (91.2%)
- **Wiktionary/OMW Secondary Thai**: 12 (0.1%)
- **Combined Grounded Thai**: 9,139 (91.2%)
- **CMUdict IPA Pronunciation**: 9,527 (95.1%)
- **Example Evidence Available**: 7,284 (72.7%)

### Thai & Example Coverage by CEFR Level
| Level | Total Units | LEXiTRON | Secondary Thai | Combined Thai | Examples Available |
|---|---|---|---|---|---|
| **A1** | 1168 | 1156 | 3 | 1156 (99.0%) | 915 (78.3%) |
| **A2** | 1415 | 1367 | 2 | 1367 (96.6%) | 1091 (77.1%) |
| **B1** | 2498 | 2379 | 0 | 2379 (95.2%) | 1894 (75.8%) |
| **B2** | 2857 | 2593 | 3 | 2594 (90.8%) | 2002 (70.1%) |
| **C1** | 1090 | 893 | 1 | 893 (81.9%) | 773 (70.9%) |
| **C2** | 993 | 749 | 3 | 750 (75.5%) | 609 (61.3%) |

### Thai Coverage by Part of Speech
| POS | Total Units | LEXiTRON | Combined Thai | Examples Available |
|---|---|---|---|---|
| **noun** | 4981 | 4638 | 4638 (93.1%) | 3009 (60.4%) |
| **verb** | 1846 | 1814 | 1815 (98.3%) | 1750 (94.8%) |
| **adjective** | 2066 | 1845 | 1845 (89.3%) | 1660 (80.3%) |
| **adverb** | 827 | 542 | 543 (65.7%) | 702 (84.9%) |
| **other** | 301 | 298 | 298 (99.0%) | 163 (54.2%) |

---

## 3. Benchmark Comparisons (P31 -> P32 -> P33 -> P34 -> P35)

### 100-Word Benchmark Trajectory
| Metric | Phase 6.2.31 | Phase 6.2.32 | Phase 6.2.33 | Phase 6.2.34 | Phase 6.2.35 |
|---|---|---|---|---|---|
| **AUTO_READY** | 39 (39%) | 39 (39%) | 64 (64%) | 57 (57%) | **59 (59%)** |
| **REVIEW_REQUIRED** | 21 (21%) | 21 (21%) | 21 (21%) | 30 (30%) | **29 (29%)** |
| **HOLD** | 40 (40%) | 40 (40%) | 15 (15%) | 13 (13%) | **12 (12%)** |

### Stratified Benchmarks (500, 1,000, and 5,000 Words)
| Benchmark | AUTO_READY | REVIEW_REQUIRED | HOLD |
|---|---|---|---|
| **500 Words** | 85 (17.0%) | 213 (42.6%) | 202 (40.4%) |
| **1,000 Words** | 158 (15.8%) | 429 (42.9%) | 413 (41.3%) |
| **5,000 Words** | 904 (18.1%) | 2185 (43.7%) | 1911 (38.2%) |

---

## 4. Advanced C1/C2 & Known Gap Stress Test Results
| Word | POS | Level | Decision | Evidence Tier | Aligned Meaning (TH) | Example Sentence (Source) | Candidates Retained |
|---|---|---|---|---|---|---|---|
| **consultancy** | noun | C1 | `HOLD` | `LEVEL_5_NO_EVIDENCE` | *(human pick needed)* | "A business management consultancy." (`oewn_2024`) | 0 |
| **agency** | noun | C1 | `HOLD` | `LEVEL_3_CONSENSUS` | กรม | "The Central Intelligence Agency." (`oewn_2024`) | 8 |
| **rich** | adjective | C1 | `HOLD` | `LEVEL_3_CONSENSUS` | อุดมสมบูรณ์ | "The region is rich in natural resources such as coal and iron." (`tatoeba`) | 9 |
| **equivalent** | adjective | C1 | `HOLD` | `LEVEL_1_DIRECT` | เท่ากับ | "A wish that was equivalent to a command." (`oewn_2024`) | 4 |
| **cluster** | noun | C1 | `HOLD` | `LEVEL_3_CONSENSUS` | กลุ่ม | "A cluster of admirers." (`oewn_2024`) | 5 |
| **automate** | verb | C2 | `AUTO_READY` | `LEVEL_3_CONSENSUS` | ทำให้เป็นอัตโนมัติ | "Automate the movement of the robot." (`oewn_2024`) | 2 |
| **decentralize** | verb | C2 | `REVIEW_REQUIRED` | `LEVEL_4_AMBIGUOUS` | *(human pick needed)* | "The government decided to decentralize public administration." (`tatoeba`) | 3 |
| **faithfully** | adverb | C2 | `HOLD` | `LEVEL_3_CONSENSUS` | อย่างน่าเชื่อถือ | "It always came on, faithfully, like the radio." (`oewn_2024`) | 4 |
| **potentially** | adverb | C2 | `HOLD` | `LEVEL_5_NO_EVIDENCE` | *(human pick needed)* | "He is potentially dangerous." (`oewn_2024`) | 0 |

---

## 5. Adversarial Substring Collision Protections
| Target Word | Adversarial Collision Sentence | Distinct IPA | Morphology Match Result | Protected? |
|---|---|---|---|---|
| `car` vs `carpet` | "The red carpet was rolled out for the guests." | YES | `NOT_FOUND` | PASSED (Protected) |
| `art` vs `article` | "She published a scholarly article in the medical journal." | YES | `NOT_FOUND` | PASSED (Protected) |
| `care` vs `careful` | "Please be careful when crossing the busy road." | YES | `NOT_FOUND` | PASSED (Protected) |
| `act` vs `action` | "Taking immediate action is crucial during an emergency." | YES | `NOT_FOUND` | PASSED (Protected) |
| `class` vs `classic` | "Pride and Prejudice is regarded as a classic novel." | YES | `NOT_FOUND` | PASSED (Protected) |

---

## 6. Simulated Human Workload Impact
> [!NOTE]
> **SIMULATION DISCLAIMER**: The figures below represent an algorithmic mathematical projection based on measured benchmark classification rates. They are NOT measured stopwatch readings from live human graders.

- **Candidate Universe**: 10,021 candidate units
- **Baseline Manual QA (2.5 min/unit)**: 418 hours
- **Projected Auto-Ready (0 min/unit)**: 1,583 units
- **Projected Review Required (1.0 min/unit)**: 4,299 units (72 hours)
- **Projected Hold Remediation (2.0 min/unit)**: 4,139 units (138 hours)
- **Total Projected Workload**: **210 hours** (Reduction of **49.8%**)

---

## 7. Governance, Safety & Accounting Invariants
- `production_db_mutated`: `false`
- `vocabulary_activated`: `false`
- `learner_ready_accounting`: `83` (Locked; Target 10,000; Gap 9,917)
- `user_testing_authorized`: `false`
- `overall_status`: `NOT_READY`
